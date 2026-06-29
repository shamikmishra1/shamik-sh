#!/bin/bash
# Wrapper script - actual deploy logic is in docs/personal/deploy-now.sh
exec "$(dirname "$0")/docs/personal/deploy-now.sh" "$@"
