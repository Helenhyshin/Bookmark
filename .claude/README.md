# `.claude/` vs MCP

- **Project instructions for Claude Code** live here (e.g. `CLAUDE.md`). See [Claude Code memory](https://docs.claude.com/en/docs/claude-code/memory).

- **MCP servers are not configured in this folder.** Claude Code loads **project-scoped** MCP from **`.mcp.json` at the repository root** (same info as Cursor’s `.cursor/mcp.json`, with [slightly different env syntax](https://docs.claude.com/en/docs/claude-code/mcp#environment-variable-expansion-in-mcpjson)).

Secrets stay in `.env` (see `.env.example`); do not commit `.env`.
