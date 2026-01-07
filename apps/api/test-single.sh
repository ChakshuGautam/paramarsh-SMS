#!/bin/bash
export BYPASS_AUTH=true
npx jest --config ./test/jest-e2e.json test/templates.e2e-spec.ts 2>&1
