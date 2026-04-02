#!/bin/zsh
set -euo pipefail

ROOT_DIR="/Users/eupsolution/Documents/projects/claude-marketing"

load_env_file() {
  local env_file="$1"
  local line key value

  while IFS= read -r line || [[ -n "$line" ]]; do
    line="${line%$'\r'}"
    [[ -z "${line//[[:space:]]/}" ]] && continue
    [[ "$line" == \#* ]] && continue
    [[ "$line" != *=* ]] && continue

    key="${line%%=*}"
    value="${line#*=}"

    key="${key#"${key%%[![:space:]]*}"}"
    key="${key%"${key##*[![:space:]]}"}"

    if [[ "$value" == \"*\" && "$value" == *\" ]]; then
      value="${value:1:${#value}-2}"
    elif [[ "$value" == \'*\' && "$value" == *\' ]]; then
      value="${value:1:${#value}-2}"
    fi

    export "$key=$value"
  done < "$env_file"
}

cd "$ROOT_DIR"

load_env_file ".env"

export PATH="/opt/homebrew/bin:/opt/homebrew/share/google-cloud-sdk/bin:$PATH"
export GA4_ACCESS_TOKEN="$(gcloud auth application-default print-access-token)"

REPORT_DIR="reports/analytics/$(date +%Y%m%d)-ga4"
mkdir -p "$REPORT_DIR"

node tools/ga4-watch-tabs.js --property "$GA4_PROPERTY_ID" > "$REPORT_DIR/watch-tabs.json"
node tools/ga4.js presets run --preset acquisition-overview --property "$GA4_PROPERTY_ID" > "$REPORT_DIR/acquisition-overview.json"
node tools/ga4.js presets run --preset event-breakdown --property "$GA4_PROPERTY_ID" > "$REPORT_DIR/event-breakdown.json"
node tools/ga4.js conversions list --property "$GA4_PROPERTY_ID" > "$REPORT_DIR/conversions.json"
node tools/ga4.js presets run --preset realtime-overview --property "$GA4_PROPERTY_ID" > "$REPORT_DIR/realtime-overview.json"

printf 'GA4 snapshot saved to %s\n' "$REPORT_DIR"
