# Deployment

## Branch flow

- `main` is the default development branch.
- `preview` is the staging deployment branch.
- Merge `main` into `preview` to kick off a Vercel Preview deployment for `preview.outspeed.me`.
- Production is deployed manually from GitHub Actions with `Deploy Production`.

## Vercel

- Keep the Vercel production branch as `main`.
- `apps/webapp/vercel.json` disables Vercel Git deployments from `main`, so pushing to `main` does not deploy production automatically.
- The `preview` branch remains enabled for Vercel Git deployments.

## GitHub Actions

The `Deploy Production` workflow deploys the selected ref to Vercel production. It expects these repository secrets:

- `VERCEL_TOKEN`
- `VERCEL_ORG_ID`
- `VERCEL_PROJECT_ID`

Sprite uploads are a separate data-pipeline step, not part of normal webapp
deploys. Jobs that run `bun --cwd packages/ingestor upload-sprites` also need
`BLOB_READ_WRITE_TOKEN`; deploy jobs that only build the app do not.

Create a GitHub environment named `production` and add required reviewers there if production deploys should need approval before the job runs.
