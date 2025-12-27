Stage and review changes before commit.

1. First, run `git add .` to stage all changes
2. Then run `git diff --cached --stat` to see what's staged
3. Run `git diff --cached` to review the actual changes

Check against CLAUDE.md patterns:
- Code in correct directories (pages in src/pages/, components in src/components/, hooks in src/hooks/)
- Follows established conventions (Tailwind CSS, React patterns)
- No obvious bugs or missing error handling
- Tests included for new functionality
- Consistent with existing code style

Be concise. Only flag actual problems, not style preferences.

Output: Ready to commit OR Issues to address (with specifics)
