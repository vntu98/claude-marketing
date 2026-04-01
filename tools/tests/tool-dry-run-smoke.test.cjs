#!/usr/bin/env node
'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const path = require('path');
const { spawnSync } = require('node:child_process');

const projectRoot = path.resolve(__dirname, '..', '..');

function runTool(toolName, args, env) {
  return spawnSync(process.execPath, [path.join(projectRoot, 'tools', toolName), ...args], {
    cwd: projectRoot,
    encoding: 'utf8',
    env: {
      ...process.env,
      ...env
    }
  });
}

const smokeCases = [
  {
    tool: 'airops.js',
    args: ['flows', 'list', '--dry-run'],
    env: { AIROPS_API_KEY: 'demo-airops', AIROPS_WORKSPACE_ID: 'workspace-demo' },
    method: 'GET',
    urlPattern: /\/workspaces\/workspace-demo\/flows$/
  },
  {
    tool: 'buffer.js',
    args: ['updates', 'create', '--profile-ids', 'profile-demo', '--text', 'Buffer dry run', '--dry-run'],
    env: { BUFFER_API_KEY: 'demo-buffer' },
    method: 'POST',
    urlPattern: /\/updates\/create\.json$/
  },
  {
    tool: 'dub.js',
    args: ['links', 'create', '--url', 'https://example.com', '--dry-run'],
    env: { DUB_API_KEY: 'demo-dub' },
    method: 'POST',
    urlPattern: /\/links$/
  },
  {
    tool: 'ga4.js',
    args: ['presets', 'run', '--preset', 'acquisition-overview', '--dry-run'],
    env: { GA4_PROPERTY_ID: 'demo-property' },
    method: 'POST',
    urlPattern: /properties\/demo-property:runReport/
  },
  {
    tool: 'google-ads.js',
    args: ['campaigns', 'pause', '--id', '123', '--dry-run'],
    env: {
      GOOGLE_ADS_TOKEN: 'demo-token',
      GOOGLE_ADS_DEVELOPER_TOKEN: 'demo-dev-token',
      GOOGLE_ADS_CUSTOMER_ID: '9999999999'
    },
    method: 'POST',
    urlPattern: /\/customers\/9999999999\/campaigns:mutate$/
  },
  {
    tool: 'google-search-console.js',
    args: ['search', 'query', '--site-url', 'https://example.com/', '--dry-run'],
    env: { GSC_ACCESS_TOKEN: 'demo-gsc' },
    method: 'POST',
    urlPattern: /\/webmasters\/v3\/sites\/https%3A%2F%2Fexample\.com%2F\/searchAnalytics\/query$/
  },
  {
    tool: 'hotjar.js',
    args: ['recordings', 'list', '--site-id', '123', '--dry-run'],
    env: { HOTJAR_CLIENT_ID: 'demo-hotjar-client', HOTJAR_CLIENT_SECRET: 'demo-hotjar-secret' },
    method: 'GET',
    urlPattern: /\/sites\/123\/recordings/
  },
  {
    tool: 'linkedin-ads.js',
    args: ['campaigns', 'create', '--account-id', '123', '--campaign-group-id', '456', '--name', 'Demo Campaign', '--dry-run'],
    env: { LINKEDIN_ACCESS_TOKEN: 'demo-linkedin' },
    method: 'POST',
    urlPattern: /\/adCampaignsV2$/
  },
  {
    tool: 'mailchimp.js',
    args: ['campaigns', 'create', '--list-id', 'list-demo', '--subject', 'Demo subject', '--dry-run'],
    env: { MAILCHIMP_API_KEY: 'demo-us1' },
    method: 'POST',
    urlPattern: /\/campaigns$/
  },
  {
    tool: 'meta-ads.js',
    args: ['campaigns', 'list', '--dry-run'],
    env: { META_ACCESS_TOKEN: 'demo-meta', META_AD_ACCOUNT_ID: '1234567890' },
    method: 'GET',
    urlPattern: /\/act_1234567890\/campaigns/
  },
  {
    tool: 'optimizely.js',
    args: ['experiments', 'create', '--project-id', '123', '--name', 'Demo Experiment', '--dry-run'],
    env: { OPTIMIZELY_API_KEY: 'demo-optimizely' },
    method: 'POST',
    urlPattern: /\/experiments$/
  },
  {
    tool: 'resend.js',
    args: ['send', '--from', 'hello@example.com', '--to', 'user@example.com', '--subject', 'Demo', '--dry-run'],
    env: { RESEND_API_KEY: 'demo-resend' },
    method: 'POST',
    urlPattern: /\/emails$/
  },
  {
    tool: 'semrush.js',
    args: ['domain', 'overview', '--domain', 'example.com', '--dry-run'],
    env: { SEMRUSH_API_KEY: 'demo-semrush' },
    method: 'GET',
    urlPattern: /^https:\/\/api\.semrush\.com\/\?/
  },
  {
    tool: 'tiktok-ads.js',
    args: ['campaigns', 'list', '--dry-run'],
    env: { TIKTOK_ACCESS_TOKEN: 'demo-tiktok', TIKTOK_ADVERTISER_ID: '24680' },
    method: 'GET',
    urlPattern: /\/campaign\/get\/\?advertiser_id=24680/
  },
  {
    tool: 'typeform.js',
    args: ['forms', 'create', '--title', 'Demo form', '--dry-run'],
    env: { TYPEFORM_API_KEY: 'demo-typeform' },
    method: 'POST',
    urlPattern: /\/forms$/
  },
  {
    tool: 'zapier.js',
    args: ['hooks', 'send', '--url', 'https://example.com/hooks/demo', '--data', '{"hello":"world"}', '--dry-run'],
    env: { ZAPIER_API_KEY: 'demo-zapier' },
    method: 'POST',
    urlPattern: /https:\/\/example\.com\/hooks\/demo$/
  }
];

for (const smokeCase of smokeCases) {
  test(`${smokeCase.tool} supports dry-run without live mutation`, () => {
    const result = runTool(smokeCase.tool, smokeCase.args, smokeCase.env);
    assert.equal(result.status, 0, result.stderr);

    const parsed = JSON.parse(result.stdout);
    assert.equal(parsed._dry_run, true);
    assert.equal(parsed.method, smokeCase.method);
    assert.match(parsed.url, smokeCase.urlPattern);
  });
}
