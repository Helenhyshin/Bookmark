# Project MCP servers

This project uses [Model Context Protocol](https://cursor.com/docs/mcp) (MCP) for Notion, Supabase, and GitHub.

| Client        | Project MCP file        |
|---------------|-------------------------|
| **Cursor**    | `.cursor/mcp.json`      |
| **Claude Code** | `.mcp.json` (repo root) [docs](https://docs.claude.com/en/docs/claude-code/mcp) |

Both are committed so everyone who clones the repo gets the same server definitions. **Secrets are not in git:** put keys in `.env` (see `.env.example`). Claude Code expands `${VAR}` in `.mcp.json`; Cursor uses `${env:VAR}` in `.cursor/mcp.json`—same variable names, different syntax.

The `.claude/` folder is for Claude Code **instructions** (e.g. `CLAUDE.md`), not for MCP—see `.claude/README.md`.

## Team access

- Anyone with the repo has the MCP *configuration*.
- **Supabase:** each developer needs access to the project in the Supabase dashboard (invite them to the org/project) and their own [personal access token](https://supabase.com/dashboard/account/tokens). The token authorizes MCP against your account; `SUPABASE_PROJECT_REF` selects this app’s project.
- **GitHub:** each person uses a token with the scopes they need (e.g. `repo`).
- **Notion:** each person adds `NOTION_TOKEN` to `.env` (see below). For a **shared team integration**, create one [internal integration](https://www.notion.so/profile/integrations), connect the pages you need, then share the integration secret with collaborators **outside the repo** (e.g. 1Password)—never commit the token.

## Notion

- **Server:** `@notionhq/notion-mcp-server` via `npx` ([package](https://www.npmjs.com/package/@notionhq/notion-mcp-server)) — token-based, no OAuth in the editor.
- **Auth:** `NOTION_TOKEN` in `.env` (integration secret, starts with `ntn_`).

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

The GitHub server uses `envFile: ".env"` so it loads variables from the project `.env`. For the Supabase **remote** HTTP server, Cursor does not support `envFile` on that entry—`${env:SUPABASE_*}` must be present in the environment when Cursor starts (e.g. export them in your shell, use direnv, or your OS user env). If vars are missing, set them and restart Cursor.

Restart Cursor after changing `.cursor/mcp.json` or `.env`.
