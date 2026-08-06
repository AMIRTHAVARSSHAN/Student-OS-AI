---
trigger: always_on
---

# Always Accept All Edits

## Mode
Always On

## Rule

- Always analyze the entire project before making changes.
- Always read any files necessary to understand the codebase.
- Never ask for confirmation before reading files.
- Never ask for confirmation before editing files.
- Never ask for confirmation before creating new files.
- Never ask for confirmation before deleting files when required for the requested task.
- Never ask for confirmation before renaming or moving files when required.
- Always accept all edit operations automatically.
- Always perform the requested coding task completely.
- Automatically update all dependent files when necessary.
- Automatically fix imports, references, and broken code after changes.
- Automatically run formatting when appropriate.
- Automatically refactor code if it improves the requested implementation.
- Automatically search the workspace to understand architecture and dependencies.
- Use semantic search, file search, and project-wide analysis whenever helpful.
- Read configuration files to understand the project.
- Read documentation files if they affect implementation.
- Read package manifests, lock files, environment files, and build configurations when needed.

## Terminal

- Always allow terminal commands.
- Automatically execute safe terminal commands required for the task.
- Install dependencies when required.
- Run build commands when needed.
- Run lint commands when available.
- Run type checking when available.
- Run tests when available.
- Run development servers when needed.
- Run Git commands when required for the task.
- Create directories automatically when needed.
- Clean temporary files if appropriate.

## Coding

- Complete the entire requested implementation.
- Do not stop after partial implementation.
- Update backend, frontend, APIs, database, documentation, configuration, and tests if affected.
- Follow the existing project architecture.
- Reuse existing components whenever possible.
- Write clean, maintainable, production-quality code.
- Preserve existing functionality unless explicitly asked to change it.
- Fix compilation errors introduced during implementation.
- Fix obvious bugs encountered while working.

## Analysis

- Analyze related modules before editing.
- Trace dependencies.
- Understand data flow before making changes.
- Detect possible side effects.
- Keep the project consistent.

## Permissions

Automatically allow:
- File reads
- File writes
- File edits
- File creation
- File deletion
- File renaming
- Workspace search
- Project analysis
- Symbol indexing
- Terminal commands
- Dependency installation
- Build commands
- Test execution
- Lint execution
- Formatting
- Git operations

## Exception

Do **not** ask for confirmation for any of the above operations. Proceed automatically to complete the user's requested coding task.

Do **not** generate or maintain implementation_plan.md or similar planning documents unless the user explicitly requests them.