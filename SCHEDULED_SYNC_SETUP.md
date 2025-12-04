# Automated SAM.gov Sync Setup Guide

## Overview
GovCon Autopilot now supports automated syncing of Federal, State, Local, and Education (SLED) government contract opportunities every 12 hours.

## Features
- ✅ Automatic sync every 12 hours (6 AM & 6 PM UTC)
- ✅ Pulls from Federal (SAM.gov) + State/Local/Education sources
- ✅ Processes all active user configurations
- ✅ Sends email notifications for new opportunities
- ✅ Tracks sync history and statistics
- ✅ User-controlled enable/disable toggle

## Setup Options

### Option 1: Supabase Cron (Recommended)
1. Go to Supabase Dashboard → Database → Cron Jobs
2. Click "Create a new cron job"
3. Set schedule: `0 6,18 * * *` (6 AM and 6 PM UTC)
4. Set SQL command:
```sql
SELECT net.http_post(
  url := 'https://api.databasepad.com/functions/v1/scheduled-sync-trigger',
  headers := '{"Content-Type": "application/json", "Authorization": "Bearer YOUR_SERVICE_ROLE_KEY"}'::jsonb,
  body := '{}'::jsonb
);
```
5. Replace `YOUR_SERVICE_ROLE_KEY` with your actual service role key
6. Save and enable the cron job

### Option 2: External Cron Service (Alternative)
Use services like cron-job.org, EasyCron, or your own server:
- URL: `https://api.databasepad.com/functions/v1/scheduled-sync-trigger`
- Method: POST
- Headers: `Authorization: Bearer YOUR_SERVICE_ROLE_KEY`
- Schedule: Every 12 hours

### Option 3: Manual Trigger
Users can manually trigger sync anytime via the Settings panel "Sync Now" button.

## User Controls
Users can enable/disable automatic syncing in Settings → SAM.gov Sync Configuration:
- Toggle "Automatic Sync" on/off
- Configure keywords, NAICS codes, and filters
- View sync history and scheduled run statistics

## Monitoring
- View recent scheduled runs in Settings → Scheduled Sync History
- Track: configs processed, opportunities found, new/updated counts
- Real-time status updates via Supabase realtime subscriptions
