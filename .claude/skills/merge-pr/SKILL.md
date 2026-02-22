---
name: merge-pr
description: Merge a PR to main, monitor the Vercel production deployment, and auto-fix any deploy failures until production is green.
tools: [Bash, Read, Grep, Glob, Edit, Write, WebFetch, mcp__claude_ai_Vercel__list_deployments, mcp__claude_ai_Vercel__get_deployment, mcp__claude_ai_Vercel__get_deployment_build_logs, mcp__claude_ai_Vercel__get_runtime_logs, mcp__claude_ai_Vercel__get_project]
---

# Merge PR & Monitor Deploy

You merge a pull request to `main`, monitor the resulting Vercel production deployment, and if it fails you diagnose the issue, fix it, push to main, and loop until the deploy is green.

The user invokes this skill as `/merge-pr [PR number or URL]`.

## Phase 1: Identify the PR

1. If argument provided, use it as the PR number (strip URL prefix if needed).
2. If no argument, detect the current branch's open PR:
   ```bash
   gh pr view --json number,title,state,mergeable,reviewDecision,statusCheckRollup
   ```
3. If no PR is found, tell the user and stop.

## Phase 2: Pre-Merge Validation

Verify the PR is ready to merge:

```bash
gh pr view <number> --json number,title,state,mergeable,reviewDecision,headRefName,baseRefName
```

Check:
- `state` is `OPEN`
- `mergeable` is `MERGEABLE` (no conflicts)

If any check fails, report what's wrong and stop.

Run a local pre-flight build check to catch issues before merging:

```bash
npm run pr-check
```

If `pr-check` fails, report the errors and stop — do NOT merge a broken PR.

## Phase 3: Squash Merge

```bash
gh pr merge <number> --squash --delete-branch
```

Then switch to main and pull:

```bash
git checkout main && git pull origin main
```

Report: "PR #N merged to main. Monitoring Vercel deployment..."

## Phase 4: Monitor Vercel Deployment

Use the Vercel MCP tools to find and monitor the new production deployment.

### Step 1: Get the project

```
mcp__claude_ai_Vercel__get_project  (use project name or ID from vercel.json or "tne-website")
```

### Step 2: List recent deployments

```
mcp__claude_ai_Vercel__list_deployments  (filter for production target)
```

Find the most recent production deployment triggered after the merge.

### Step 3: Poll until complete

Check deployment status every 15 seconds using:

```
mcp__claude_ai_Vercel__get_deployment  (with the deployment ID or URL)
```

Status values:
- `BUILDING` / `INITIALIZING` — still in progress, keep polling
- `READY` — success! Go to Phase 6
- `ERROR` / `FAILED` / `CANCELED` — go to Phase 5

Use a bash sleep loop for polling:
```bash
sleep 15
```

Poll for up to 10 minutes. If the deployment hasn't finished, report a timeout.

## Phase 5: Diagnose & Fix Failures

### Step 1: Read build logs

```
mcp__claude_ai_Vercel__get_deployment_build_logs  (with deployment ID)
```

### Step 2: Read runtime logs (if build succeeded but runtime failed)

```
mcp__claude_ai_Vercel__get_runtime_logs  (with deployment ID)
```

### Step 3: Categorize and fix

| Failure Type | Diagnosis | Fix |
|---|---|---|
| **Build error** (ESLint, TypeScript, Next.js compilation) | Error messages in build logs | Fix code locally, commit, push to main |
| **Runtime error** (missing env vars, DB connection, auth config) | Error messages in runtime logs | Add env vars via `npx vercel env add` or fix config |
| **DB migration needed** (schema mismatch) | Runtime errors about missing columns/tables | Run `npm run db:push` |
| **Env var missing** | "undefined" or "missing" errors for env names | `npx vercel env add <name> production` |
| **Static asset / import error** | "Module not found" or broken imports | Fix import paths locally |

### Step 4: Apply the fix

For **code fixes**:
1. Fix the code locally
2. Run `npm run pr-check` to verify the fix
3. Commit with a descriptive message referencing the deploy failure:
   ```bash
   git add <files> && git commit -m "fix: <what was broken and why>"
   ```
4. Push to main:
   ```bash
   git push origin main
   ```

For **env var issues**:
```bash
npx vercel env add <VAR_NAME> production
```
Then trigger a redeploy:
```bash
npx vercel --prod
```

For **DB schema issues**:
```bash
npm run db:push
```

### Step 5: Loop back to Phase 4

After pushing a fix or triggering a redeploy, go back to Phase 4 and monitor the new deployment. Continue this loop until the deploy is green or you've attempted 3 fix cycles (to avoid infinite loops).

## Phase 6: Verify & Report

Once the deployment status is `READY`:

1. Get the production URL from the deployment details
2. Optionally fetch it to verify it loads:
   ```
   WebFetch the production URL with prompt "Does this page load correctly? Check for any error messages."
   ```
3. Report success:

```
PR #N merged and deployed successfully!

Production URL: https://...
Deployment: https://vercel.com/...
Status: READY
```

If fixes were needed, also report:
```
Fixes applied:
- fix: <commit message 1>
- fix: <commit message 2>
```

## Error Handling

- **PR not found**: Report and stop
- **Merge conflicts**: Report and stop — user must resolve manually
- **pr-check fails pre-merge**: Report errors and stop — do not merge broken code
- **3 failed fix attempts**: Stop looping, report all errors found, and ask user for help
- **Vercel API unavailable**: Fall back to `vercel ls` CLI commands
- **Timeout (>10 min)**: Report timeout with last known status

## Important Notes

- NEVER force-push to main
- NEVER skip pre-merge validation
- Always run `npm run pr-check` before merging
- Always commit fixes with descriptive messages
- Keep the user informed at each phase with clear status updates
- Reference the Vercel project as configured in vercel.json or use "tne-website"
