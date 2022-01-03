#!/bin/sh

# for some reason, turbo build fails
yarn --cwd packages/match-entities build
yarn --cwd packages/csv-sample build
yarn --cwd packages/csv-anonymify build

yarn --cwd apps/match-entities build
yarn --cwd apps/csv build