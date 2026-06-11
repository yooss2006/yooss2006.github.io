---
name: git-commit
description: Prepare and create Korean git commits with an explicit approval gate. Use when the user asks Codex to commit changes, split work into commit units, recommend commit messages, or enforce this project's commit policy before running git commit.
---

# Git Commit

## Overview

Use this skill to keep commits small, functional, and approved by the user before
running `git commit`. Always explain the exact file group and Korean commit
message first, then commit only after the user approves.

## Workflow

1. Inspect the worktree with `git status --short`.
2. Review relevant diffs for changed tracked files and read new untracked files
   before proposing a commit.
3. Group files by functional unit. Prefer one commit per feature, fix,
   documentation update, refactor, or configuration change.
4. Present a commit proposal before staging:
   - commit unit name
   - files to include
   - files intentionally excluded, if any
   - proposed commit message
   - validation already run, if any
5. Ask for explicit user approval before running `git add` or `git commit`.
6. After approval, stage only the approved files and commit with the approved
   message.
7. If multiple commit units exist, repeat the approval gate for each unit.

Do not commit unrelated user changes. If a file contains mixed changes, explain
the risk and ask how to proceed before staging it.

## Commit Message Rules

Use this format:

```text
<Type>: <한글 설명>

<body>

<footer>
```

Rules:

- Start the type prefix with an uppercase letter.
- Write the description and body in Korean.
- Do not end the description with a period.
- Keep the description concise and focused on the commit unit.
- Add a body only when the change needs explanation.
- Wrap body lines around 72 English characters when practical.
- Add a footer such as `Closes #123` only when there is a real related issue.

Allowed type prefixes:

- `Feat`: new feature or feature update
- `Fix`: bug or error fix
- `Docs`: documentation change
- `Style`: formatting, typo, naming, or style-only change
- `Refactor`: code restructuring without behavior change
- `Test`: test change
- `Chore`: build, package, environment, or maintenance change
- `Design`: design or wording change
- `File`: file move, removal, or rename
- `Comment`: comment change
- `Hotfix`: urgent production fix

## Proposal Template

Before committing, present this shape to the user:

```text
커밋 단위: <이름>
포함 파일:
- <path>

제외 파일:
- <path 또는 없음>

커밋 메시지:
<Type>: <한글 설명>

검증:
- <command/result 또는 아직 안 함>

이대로 커밋할까요?
```
