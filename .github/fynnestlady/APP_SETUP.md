# Fynnestlady Engineering Bot App setup

The adjacent JSON is the requested GitHub App manifest. It is a registration input, not evidence that an App has been created or installed. Its homepage and inactive hook URL point to this repository because GitHub Actions, not an external webhook server, handles events. No webhook delivery is requested.

## One-time owner authorization

1. Register **Fynnestlady Engineering Bot** from the manifest in the account that will own the App. GitHub's manifest flow requires a trusted registration handler to submit the JSON and exchange the one-time code for credentials; if no such handler is available, enter the same settings in GitHub's App registration UI. Verify the resulting permissions before installation.
2. Install the private App on **only** `appiah233/fynnestlady`, selecting only this repository. Do not grant organization-wide installation or permissions outside this manifest.
3. Store `FYNNESTLADY_APP_PRIVATE_KEY` in a protected GitHub Actions environment (for example, `bot-privileged`) restricted to `dev`/`main` and trusted mutation jobs, and store `FYNNESTLADY_APP_ID` (and installation ID when needed) in Actions secrets/variables. Keep the private key out of the repository, PR artifacts, logs, and Gemini context. The workflow mints short-lived installation tokens with an explicit repository scope and only the permissions needed by each job.
4. Configure `GEMINI_API_KEY` as an Actions secret available only to trusted Gemini CLI jobs (`google-github-actions/run-gemini-cli`). Configure Vercel/Supabase development credentials separately from production. No production credential is exposed to untrusted PR code or Gemini.
5. Verify branch rules, required checks, review requirements, and production environment restrictions in GitHub. The current `@appiah233` code-owner approval requirement blocks autonomous merging. This is a governance decision for Eric; never grant the App a bypass to make the test pass.
6. Before enabling production automation, add the Vercel `VERCEL_TOKEN` as a protected Actions secret and `VERCEL_ORG_ID`, `VERCEL_PROJECT_ID`, and `VERCEL_PRODUCTION_URL` as repository variables. Scope the token to the intended team/project with deployment rollback access. The bot rollback workflow remains inactive while `FYNNESTLADY_PRODUCTION_ENABLED` is not `true`.

`contents: write` enables branch updates and ordinary PR merges; `issues: write` enables the backlog and incident reports; `pull_requests: write` enables PR creation, merge, and release comments; `actions: write` enables dispatch/rerun; `workflows: write` is needed for the first assigned CI workflow repair; `checks`, `statuses`, and `deployments` are read only for verification. Vercel rollback uses the separate, project-scoped Vercel token; the GitHub App token does not control hosting credentials. GitHub grants `metadata: read` for repository metadata. The App requests no Administration or organization/user/billing permission.

## Kill switch and revocation

Disable the bot's scheduled and mutation workflows, then suspend the App installation in GitHub. For suspected credential compromise, revoke/delete the App private key, rotate the `GEMINI_API_KEY` credential and any development credentials exposed to that trust boundary, review recent App-authored commits/runs, and only re-enable after clean tokens and evidence. Uninstall the App to revoke repository access entirely. Preserve incident logs without secrets.

Sources: [GitHub App manifest registration](https://docs.github.com/en/apps/sharing-github-apps/registering-a-github-app-from-a-manifest), [choosing App permissions](https://docs.github.com/en/apps/creating-github-apps/registering-a-github-app/choosing-permissions-for-a-github-app), [installation tokens](https://docs.github.com/en/apps/creating-github-apps/authenticating-with-a-github-app/generating-an-installation-access-token-for-a-github-app).
