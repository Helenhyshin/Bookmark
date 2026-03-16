# Project MCP servers

This project uses [Model Context Protocol](https://cursor.com/docs/mcp) (MCP) for Supabase and GitHub. API keys are stored in the project `.env` and referenced in `.cursor/mcp.json`.

## Setup

1. Copy `.env.example` to `.env` (or use the existing `.env`).
2. Fill in your keys in `.env` (see below). Do not commit `.env`.
3. Restart Cursor so it picks up the config and env.

## Supabase

- **Server:** `https://mcp.supabase.com/mcp`
- **Auth:** Values from `.env`:
  - `SUPABASE_ACCESS_TOKEN` — [Create a token](https://supabase.com/dashboard/account/tokens)
  - `SUPABASE_PROJECT_REF` — Your project ref from the dashboard URL (e.g. `abc123xyz`)

## GitHub

- **Server:** `@modelcontextprotocol/server-github` (via `npx`)
- **Auth:** Set `GITHUB_PERSONAL_ACCESS_TOKEN` in `.env`. [Create a token](https://github.com/settings/tokens) with the scopes you need (e.g. `repo`).

The GitHub server uses `envFile: ".env"` so it loads variables from the project `.env`. For the Supabase remote server, Cursor resolves `${env:...}` from the environment it was started in; if you open Cursor from the project folder, some setups load `.env` automatically—otherwise start Cursor from a terminal after running `source .env` or export the vars there.

Restart Cursor after changing `.cursor/mcp.json` or `.env`.
