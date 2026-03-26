#!/bin/sh
set -e

# Run migrations
npx prisma migrate deploy

# Seed if no users exist (first deploy only)
if [ ! -f /data/.seeded ]; then
  npx tsx prisma/seed.ts && touch /data/.seeded
fi

# Start the app
node server.js
