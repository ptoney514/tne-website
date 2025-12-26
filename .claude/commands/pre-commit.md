Review staged changes before commit. Run `git diff --cached`.

Check against CLAUDE.md patterns:
- Code in correct directories (pages in src/pages/, components in src/components/, hooks in src/hooks/)
- Follows established conventions (Tailwind CSS, React patterns)
- No obvious bugs or missing error handling
- Tests included for new functionality
- Consistent with existing code style

Be concise. Only flag actual problems, not style preferences.

Output: Ready to commit OR Issues to address (with specifics)
