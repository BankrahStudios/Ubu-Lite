#!/usr/bin/env bash

# API demo script for Git Bash on Windows
# - Uses only curl and python for JSON parsing (no jq)
# - set +H to disable history expansion so passwords with ! and # work without escaping
set -euo pipefail
set +H

BASE_URL=${BASE_URL:-http://127.0.0.1:8000}

# Logging: write a full run transcript to scripts/api_demo.log
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
LOGFILE="$SCRIPT_DIR/api_demo.log"
# Tee stdout/stderr to logfile so runs are inspectable if terminal capture fails
exec > >(tee -a "$LOGFILE") 2>&1

echo "Logging to $LOGFILE"

http() {
  local method=$1; shift
  local url=$1; shift
  local data=${1-}
  if [[ -n "$data" ]]; then
    curl -s -w "\n%{http_code}" -X "$method" "$url" -H "Content-Type: application/json" -d "$data"
  else
    curl -s -w "\n%{http_code}" -X "$method" "$url"
  fi
}

register_user() {
  local user=$1; local pass=$2; local email=$3; local role=$4
  echo "--- Registering $user ---"
  local payload
  payload=$(printf '{"username":"%s","password":"%s","email":"%s","role":"%s"}' "$user" "$pass" "$email" "$role")
  read -r body status <<<"$(http POST "$BASE_URL/api/auth/register/" "$payload")"
  echo "HTTP $status"
  if [[ "$status" == "400" ]]; then
    echo "User may already exist; treating as success."
  else
    echo "$body" | python -c "import sys, json; print(json.dumps(json.loads(sys.stdin.read()), indent=2))" || true
  fi
}

login() {
  local user=$1; local pass=$2
  echo "--- Logging in $user ---"
  local payload
  payload=$(printf '{"username":"%s","password":"%s"}' "$user" "$pass")
  read -r body status <<<"$(http POST "$BASE_URL/api/auth/login/" "$payload")"
  echo "HTTP $status"
  # extract access token using python one-liner
  local token
  token=$(printf "%s" "$body" | python -c 'import sys,json;d=json.load(sys.stdin);print(d.get("access",""))')
  if [[ -z "$token" ]]; then
    echo "ERROR: login did not return access token" >&2
    return 1
  fi
  echo "$token"
}

create_service() {
  local token=$1; local title=$2; local desc=$3; local category=$4; local price=$5
  echo "--- Creating service: $title ---"
  if [[ -z "$token" ]]; then echo "ERROR: empty token" >&2; exit 1; fi
  if [[ "$token" != Bearer* && "$token" != *.*.* ]]; then
    # Allow passing raw token or full "Bearer ..."
    :
  fi
  local auth_header
  if [[ "$token" == Bearer* ]]; then auth_header="$token"; else auth_header="Bearer $token"; fi
  local payload
  payload=$(printf '{"title":"%s","description":"%s","category":"%s","price":"%s"}' "$title" "$desc" "$category" "$price")
  read -r body status <<<"$(curl -s -w "\n%{http_code}" -X POST "$BASE_URL/api/services/" -H "Content-Type: application/json" -H "Authorization: $auth_header" -d "$payload")"
  echo "HTTP $status"
  echo "$body" | python -c 'import sys,json;print(json.dumps(json.load(sys.stdin),indent=2))' || true
}

create_booking() {
  local token=$1; local service_id=$2; local client_id=$3; local iso_date=$4
  echo "--- Creating booking ---"
  local auth_header
  if [[ "$token" == Bearer* ]]; then auth_header="$token"; else auth_header="Bearer $token"; fi
  local payload
  payload=$(printf '{"service":"%s","client":"%s","date":"%s"}' "$service_id" "$client_id" "$iso_date")
  read -r body status <<<"$(curl -s -w "\n%{http_code}" -X POST "$BASE_URL/api/bookings/" -H "Content-Type: application/json" -H "Authorization: $auth_header" -d "$payload")"
  echo "HTTP $status"
  echo "$body" | python -c 'import sys,json;print(json.dumps(json.load(sys.stdin),indent=2))' || true
}

set_status() {
  local token=$1; local booking_id=$2; local status_val=$3
  echo "--- Setting booking $booking_id status -> $status_val ---"
  local auth_header
  if [[ "$token" == Bearer* ]]; then auth_header="$token"; else auth_header="Bearer $token"; fi
  local payload
  payload=$(printf '{"status":"%s"}' "$status_val")
  read -r body status <<<"$(curl -s -w "\n%{http_code}" -X PUT "$BASE_URL/api/bookings/%s/status/" -H "Content-Type: application/json" -H "Authorization: $auth_header" -d "$payload" --url "${BASE_URL}/api/bookings/${booking_id}/status/")"
  echo "HTTP $status"
  echo "$body" | python -c 'import sys,json;print(json.dumps(json.load(sys.stdin),indent=2))' || true
}

post_message() {
  local token=$1; local booking_id=$2; local text=$3
  echo "--- Posting message for booking $booking_id ---"
  local auth_header
  if [[ "$token" == Bearer* ]]; then auth_header="$token"; else auth_header="Bearer $token"; fi
  local payload
  payload=$(printf '{"text":"%s"}' "$text")
  read -r body status <<<"$(curl -s -w "\n%{http_code}" -X POST "${BASE_URL}/api/bookings/${booking_id}/messages/" -H "Content-Type: application/json" -H "Authorization: $auth_header" -d "$payload")"
  echo "HTTP $status"
  echo "$body" | python -c 'import sys,json;print(json.dumps(json.load(sys.stdin),indent=2))' || true
}

list_messages() {
  local token=$1; local booking_id=$2
  echo "--- Listing messages for booking $booking_id ---"
  local auth_header
  if [[ "$token" == Bearer* ]]; then auth_header="$token"; else auth_header="Bearer $token"; fi
  read -r body status <<<"$(curl -s -w "\n%{http_code}" -X GET "${BASE_URL}/api/bookings/${booking_id}/messages/" -H "Authorization: $auth_header")"
  echo "HTTP $status"
  echo "$body" | python -c 'import sys,json;print(json.dumps(json.load(sys.stdin),indent=2))' || true
}

# Flow
register_user "maya" "Pass123!@#" "maya@example.com" "creative"
register_user "chris" "Pass123!@#" "chris@example.com" "client"

MAYA_TOKEN=$(login "maya" 'Pass123!@#')
if [[ -z "$MAYA_TOKEN" ]]; then echo "ERROR: Maya token empty" >&2; exit 1; fi
# print token length and ensure contains two dots
echo "MAYA_TOKEN length: ${#MAYA_TOKEN}"
if [[ "$(tr -cd '.' <<< "$MAYA_TOKEN" | wc -c)" -lt 2 ]]; then echo "ERROR: token does not contain two dots" >&2; exit 1; fi

create_service "$MAYA_TOKEN" "Logo Design" "Clean minimal logo" "design" "199.00"

CHRIS_TOKEN=$(login "chris" 'Pass123!@#')
if [[ -z "$CHRIS_TOKEN" ]]; then echo "ERROR: Chris token empty" >&2; exit 1; fi

create_booking "$CHRIS_TOKEN" 1 2 "2030-01-01T10:00:00Z"

# Approve booking as maya
set_status "$MAYA_TOKEN" 1 "approved"

# Post message as chris
post_message "$CHRIS_TOKEN" 1 "Looking forward to this!"

# List messages
list_messages "$CHRIS_TOKEN" 1

echo "--- Demo complete ---"
