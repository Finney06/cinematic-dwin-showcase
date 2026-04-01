# How to Disconnect / Restrict the Lovable Bot

This runbook explains how to prevent the Lovable GitHub App (`lovable-dev[bot]`)
from making automatic changes to this repository without your explicit permission.

---

## Background

The Lovable platform uses the **`lovable-dev` GitHub App** (App ID 818760) to
commit directly to the `main` branch. The app's bot account appears in GitHub's
UI as `lovable-dev[bot]` and in git commit author fields as `gpt-engineer-app[bot]`
— both names refer to the same Lovable bot.
Every edit made in the Lovable editor produces one or two commits authored by
that bot (with `X-Lovable-Edit-ID` tags in commit messages).

Because Lovable holds **Contents: Write** (and sometimes Workflows: Write)
permissions at the repository level, it can push to any unprotected branch
without additional approval.

---

## Option 1 — Remove the Lovable App installation entirely (recommended)

This fully disconnects Lovable from your repository. You will no longer be
able to use the Lovable editor to push code directly.

1. Open GitHub → **Settings** → **Integrations** → **GitHub Apps**  
   Direct link: `https://github.com/settings/installations`
2. Find **Lovable** in the list.
3. Click **Configure**.
4. Under **Repository access**, click **Uninstall** (bottom of the page)  
   — or — switch the toggle to "Only select repositories" and remove
   `cinematic-dwin-showcase` from the list.
5. Confirm the uninstall/removal.

**Effect:** The `lovable-dev[bot]` token loses all access to this repository.
No further automatic pushes are possible.

---

## Option 2 — Restrict the app to read-only (no contents write)

If you still want to view the Lovable editor but block automatic pushes:

1. Open GitHub → **Settings** → **Integrations** → **GitHub Apps** →
   **Lovable** → **Configure**.
2. Under **Permissions**, change **Contents** from `Read & write` to `Read-only`.
3. Save.

> **Note:** GitHub App permission changes require the app developer to accept
> the downgrade, so Lovable may re-request write access in their UI. Check
> that the permission stays read-only after saving.

---

## Option 3 — Protect `main` with required PR reviews (no direct pushes)

This prevents **any** bot or user from pushing directly to `main` without a
pull-request review — including Lovable.

1. Go to `https://github.com/Finney06/cinematic-dwin-showcase/settings/branches`.
2. Click **Add branch protection rule**.
3. Set **Branch name pattern**: `main`.
4. Enable:
   - ☑ **Require a pull request before merging**
     - Set "Required approvals" to at least **1**
   - ☑ **Restrict who can push to matching branches**
     - Leave the list empty (or add only trusted users)
5. Click **Create** / **Save changes**.

**Effect:** Lovable's commits will be blocked from landing directly on `main`.
The bot would need to open a PR that you review and approve first.

---

## Option 4 — Require manual approval via an Environment protection rule

If you use GitHub Actions to deploy:

1. Go to `https://github.com/Finney06/cinematic-dwin-showcase/settings/environments`.
2. Create (or edit) the deployment environment (e.g. `production`).
3. Enable **Required reviewers** and add yourself.
4. Under "Deployment branches", restrict to `main`.

Any workflow triggered by a Lovable push will then pause for your manual
approval before deploying.

---

## In-repo automation check

As of the date this document was created, **no GitHub Actions workflows were
found** in `.github/workflows/` that are triggered automatically by Lovable
commits. All Lovable write access is granted at the GitHub App level (not via
a workflow). Therefore, Options 1–3 above are sufficient.

If you add CI/CD workflows in the future, guard any deployment step with:

```yaml
environment:
  name: production
  # This enforces the "Required reviewers" setting configured above
```

---

## Summary of recommended steps

| Priority | Action | Where |
|---|---|---|
| 1 (immediate) | Remove or restrict Lovable app repository access | GitHub Settings → Integrations → GitHub Apps |
| 2 (immediate) | Enable branch protection on `main` requiring PRs | GitHub Settings → Branches |
| 3 (optional) | Add environment protection with required reviewer | GitHub Settings → Environments |

---

## Related commits reverted by this PR

| Commit | Author | Date | Message |
|---|---|---|---|
| `940ee59` | `lovable-dev[bot]` | 2026-03-31T15:50:06Z | Adopt Proximity-inspired landing (merge) |
| `6b8a195` | `lovable-dev[bot]` | 2026-03-31T15:49:56Z | Changes (staging) |
