# Claude Local Inventory

Generated: 2026-04-25 12:19 CST

This is a metadata-only inventory. It records local Claude-related locations and migration candidates without copying conversation bodies, secrets, tokens, or private uploads.

## Main Locations

- `/Users/mac/.claude` - about 3.4G. Claude Code style data: projects, community skills, agent skills, plugins, tasks, memory, plans, scripts, logs, backups, shared knowledge, and secrets.
- `/Users/mac/Library/Application Support/Claude` - about 11G. Claude Desktop application data, including app caches, local storage, config, extensions, code sessions, and pending uploads.
- `/Users/mac/Library/Application Support/claude` - about 11G. Lowercase app support mirror/cache area.
- `/Users/mac/.agent-shared` - about 34M. Extracted/shared skills and Claude-related notes.
- `/Users/mac/workspace-sync/claude-config` - about 50M. A compact synced Claude config/migration source.

## High-Value Migration Candidates

- `/Users/mac/.claude/CLAUDE.md`
- `/Users/mac/workspace-sync/claude-config/CLAUDE.md`
- `/Users/mac/.agent-shared/extracted-skills/*.md`
- `/Users/mac/.agent-shared/skills/*`
- `/Users/mac/workspace-sync/claude-config/skills/*`
- `/Users/mac/.claude/community-skills/*/skills/*/SKILL.md`
- `/Users/mac/.claude/agent-skills/*`
- `/Users/mac/.claude/shared/knowledge`
- `/Users/mac/.claude/projects/*/memory`
- `/Users/mac/.claude/projects/-Users-mac-Documents-New-project`
- `/Users/mac/.claude/projects/-Users-mac-Documents-New-project--claude-worktrees-blissful-hellman`
- `/Users/mac/.claude/projects/-Users-mac-Documents-New-project--claude-worktrees-funny-kilby`

## Scale Snapshot

- `/Users/mac/.claude/projects`: 822 directories, 4996 files.
- `/Users/mac/.claude/community-skills`: 2142 directories, 4787 files.
- `/Users/mac/.claude/agent-skills`: 723 directories, 1894 files.
- `/Users/mac/.agent-shared/skills`: 545 directories, 1677 files.
- `/Users/mac/workspace-sync/claude-config/skills`: 497 directories, 1593 files.

Project session file types under `/Users/mac/.claude/projects`:

- 3847 `.jsonl` files
- 856 `.json` files
- 211 `.txt` files
- 81 `.md` files
- 1 `.jpg` file

## Sensitive Zones

Do not bulk-copy or summarize these without an explicit second confirmation:

- `/Users/mac/.claude/secrets`
- `/Users/mac/.claude/secrets/aieii-credentials.md`
- `/Users/mac/.claude/secrets/bot-credentials.json`
- `/Users/mac/.claude/.session-memory/key-ids.json`
- `/Users/mac/Library/Application Support/Claude/Cookies`
- `/Users/mac/Library/Application Support/Claude/Local Storage`
- `/Users/mac/Library/Application Support/Claude/pending-uploads`
- Any `.env`, token, credential, key, or cookie file.

## Recommended Next Pass

1. Read and summarize instruction files: `CLAUDE.md`, plugin manifests, and `SKILL.md`.
2. Convert useful Claude skills into Codex skills under `/Users/mac/.codex/skills` or project-local docs.
3. Summarize project memory directories, starting with this repository's Claude project paths.
4. Build a sanitized index of conversation sessions from `.jsonl` metadata, excluding secrets and full raw messages by default.
5. Only after review, selectively summarize important conversations into a durable knowledge base.
