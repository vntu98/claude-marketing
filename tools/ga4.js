#!/usr/bin/env node

const fs = require('fs')
const path = require('path')

const ACCESS_TOKEN = process.env.GA4_ACCESS_TOKEN
const DEFAULT_PROPERTY = process.env.GA4_PROPERTY_ID
const DEFAULT_MEASUREMENT_ID = process.env.GA4_MEASUREMENT_ID
const DEFAULT_API_SECRET = process.env.GA4_API_SECRET
const DATA_API = 'https://analyticsdata.googleapis.com/v1beta'
const ADMIN_API = 'https://analyticsadmin.googleapis.com/v1beta'
const MP_URL = 'https://www.google-analytics.com/mp/collect'
const PRESETS_PATH = path.join(__dirname, 'ga4-presets.json')

async function api(method, baseUrl, path, body) {
  if (!ACCESS_TOKEN && !args['dry-run']) {
    return { error: 'GA4_ACCESS_TOKEN environment variable required' }
  }
  if (args['dry-run']) {
    return { _dry_run: true, method, url: `${baseUrl}${path}`, headers: { Authorization: '***', 'Content-Type': 'application/json' }, body: body || undefined }
  }
  const res = await fetch(`${baseUrl}${path}`, {
    method,
    headers: {
      'Authorization': `Bearer ${ACCESS_TOKEN}`,
      'Content-Type': 'application/json',
    },
    body: body ? JSON.stringify(body) : undefined,
  })
  const text = await res.text()
  try {
    return JSON.parse(text)
  } catch {
    return { status: res.status, body: text }
  }
}

async function mpApi(measurementId, apiSecret, body) {
  if (!ACCESS_TOKEN && !args['dry-run']) {
    return { error: 'GA4_ACCESS_TOKEN environment variable required' }
  }
  const params = new URLSearchParams({ measurement_id: measurementId, api_secret: apiSecret })
  if (args['dry-run']) {
    return { _dry_run: true, method: 'POST', url: `${MP_URL}?${new URLSearchParams({ measurement_id: measurementId, api_secret: '***' })}`, headers: { 'Content-Type': 'application/json' }, body: body || undefined }
  }
  const res = await fetch(`${MP_URL}?${params}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  })
  const text = await res.text()
  if (!text) return { status: res.status, success: res.ok }
  try {
    return JSON.parse(text)
  } catch {
    return { status: res.status, body: text }
  }
}

function parseArgs(args) {
  const result = { _: [] }
  for (let i = 0; i < args.length; i++) {
    const arg = args[i]
    if (arg.startsWith('--')) {
      const key = arg.slice(2)
      const next = args[i + 1]
      if (next && !next.startsWith('--')) {
        result[key] = next
        i++
      } else {
        result[key] = true
      }
    } else {
      result._.push(arg)
    }
  }
  return result
}

function loadPresets() {
  return JSON.parse(fs.readFileSync(PRESETS_PATH, 'utf8'))
}

function buildReportBody(config) {
  const body = {
    dateRanges: config.dateRanges || [{
      startDate: args['start-date'] || '30daysAgo',
      endDate: args['end-date'] || 'today',
    }],
  }

  if (config.dimensions?.length) {
    body.dimensions = config.dimensions.map((name) => ({ name }))
  } else if (args.dimensions) {
    body.dimensions = args.dimensions.split(',').map(d => ({ name: d.trim() }))
  }

  if (config.metrics?.length) {
    body.metrics = config.metrics.map((name) => ({ name }))
  } else if (args.metrics) {
    body.metrics = args.metrics.split(',').map(m => ({ name: m.trim() }))
  }

  if (config.dimensionFilter) {
    body.dimensionFilter = config.dimensionFilter
  }

  if (config.metricAggregations) {
    body.metricAggregations = config.metricAggregations
  }

  if (config.orderBys) {
    body.orderBys = config.orderBys
  }

  if (config.limit) {
    body.limit = String(config.limit)
  }

  return body
}

async function runReport(property, config = {}) {
  if (!property) {
    return { error: '--property required or set GA4_PROPERTY_ID' }
  }

  const body = buildReportBody(config)
  return api('POST', DATA_API, `/properties/${property}:runReport`, body)
}

async function runRealtime(property, config = {}) {
  if (!property) {
    return { error: '--property required or set GA4_PROPERTY_ID' }
  }

  const body = {}
  if (config.dimensions?.length) {
    body.dimensions = config.dimensions.map((name) => ({ name }))
  } else if (args.dimensions) {
    body.dimensions = args.dimensions.split(',').map(d => ({ name: d.trim() }))
  }
  if (config.metrics?.length) {
    body.metrics = config.metrics.map((name) => ({ name }))
  } else if (args.metrics) {
    body.metrics = args.metrics.split(',').map(m => ({ name: m.trim() }))
  }
  if (config.dimensionFilter) {
    body.dimensionFilter = config.dimensionFilter
  }

  return api('POST', DATA_API, `/properties/${property}:runRealtimeReport`, body)
}

const args = parseArgs(process.argv.slice(2))
const [cmd, sub, ...rest] = args._

async function main() {
  let result

  switch (cmd) {
    case 'reports':
      switch (sub) {
        case 'run': {
          const property = args.property || DEFAULT_PROPERTY
          result = await runReport(property)
          break
        }
        default:
          result = { error: 'Unknown reports subcommand. Use: run' }
      }
      break

    case 'realtime':
      switch (sub) {
        case 'run': {
          const property = args.property || DEFAULT_PROPERTY
          result = await runRealtime(property)
          break
        }
        default:
          result = { error: 'Unknown realtime subcommand. Use: run' }
      }
      break

    case 'conversions':
      switch (sub) {
        case 'list': {
          const property = args.property || DEFAULT_PROPERTY
          if (!property) { result = { error: '--property required or set GA4_PROPERTY_ID' }; break }
          result = await api('GET', ADMIN_API, `/properties/${property}/conversionEvents`)
          break
        }
        case 'create': {
          const property = args.property || DEFAULT_PROPERTY
          if (!property) { result = { error: '--property required or set GA4_PROPERTY_ID' }; break }
          if (!args['event-name']) { result = { error: '--event-name required' }; break }
          result = await api('POST', ADMIN_API, `/properties/${property}/conversionEvents`, {
            eventName: args['event-name'],
          })
          break
        }
        default:
          result = { error: 'Unknown conversions subcommand. Use: list, create' }
      }
      break

    case 'events':
      switch (sub) {
        case 'send': {
          const measurementId = args['measurement-id'] || DEFAULT_MEASUREMENT_ID
          const apiSecret = args['api-secret'] || DEFAULT_API_SECRET
          if (!measurementId) { result = { error: '--measurement-id required or set GA4_MEASUREMENT_ID' }; break }
          if (!apiSecret) { result = { error: '--api-secret required or set GA4_API_SECRET' }; break }
          if (!args['client-id']) { result = { error: '--client-id required' }; break }
          if (!args['event-name']) { result = { error: '--event-name required' }; break }
          let eventParams = {}
          if (args.params) {
            try {
              eventParams = JSON.parse(args.params)
            } catch {
              result = { error: 'Invalid JSON in --params' }; break
            }
          }
          const body = {
            client_id: args['client-id'],
            events: [{
              name: args['event-name'],
              params: eventParams,
            }],
          }
          result = await mpApi(measurementId, apiSecret, body)
          break
        }
        default:
          result = { error: 'Unknown events subcommand. Use: send' }
      }
      break

    case 'presets':
      switch (sub) {
        case 'list': {
          const presets = loadPresets()
          result = Object.entries(presets).map(([name, config]) => ({
            name,
            type: config.type,
            description: config.description,
            dimensions: config.dimensions,
            metrics: config.metrics,
          }))
          break
        }
        case 'run': {
          if (!args.preset) {
            result = { error: '--preset required' }
            break
          }
          const presets = loadPresets()
          const preset = presets[args.preset]
          if (!preset) {
            result = { error: `Unknown preset: ${args.preset}`, available: Object.keys(presets) }
            break
          }
          const property = args.property || DEFAULT_PROPERTY
          result = preset.type === 'realtime'
            ? await runRealtime(property, preset)
            : await runReport(property, preset)
          break
        }
        default:
          result = { error: 'Unknown presets subcommand. Use: list, run' }
      }
      break

    default:
      result = {
        error: 'Unknown command',
        usage: {
          reports: 'reports run --property <id> [--start-date <date>] [--end-date <date>] [--dimensions <dims>] [--metrics <metrics>]',
          realtime: 'realtime run --property <id> [--dimensions <dims>] [--metrics <metrics>]',
          conversions: 'conversions [list|create] --property <id> [--event-name <name>]',
          events: 'events send --measurement-id <id> --api-secret <secret> --client-id <id> --event-name <name> [--params <json>]',
          presets: 'presets [list|run] [--preset <name>] [--property <id>]',
        }
      }
  }

  console.log(JSON.stringify(result, null, 2))
}

main().catch(err => {
  console.error(JSON.stringify({ error: err.message }))
  process.exit(1)
})
