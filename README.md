# Achyut Wadhwa Portfolio

Official artist website for Achyut Wadhwa, built with React, Vite, Tailwind CSS, Framer Motion and GSAP.

## Project structure

```text
Achyut Wadhwa Portfolio/
|-- design-assets/        Source exports and non-runtime creative deliverables
|-- docs/                 Design guidance, media manifests and reference material
|-- frontend/             Production web application
|   |-- public/assets/    Runtime images, audio and video
|   |-- src/              Components, pages, data, contexts, routes and utilities
|   `-- tests/            Automated regression checks
`-- scripts/              Repository maintenance and generation scripts
```

## Local setup

```powershell
cd frontend
npm ci
Copy-Item .env.example .env
npm run dev
```

Add a valid `VITE_WEB3FORMS_ACCESS_KEY` to `frontend/.env` if the booking form should submit through Web3Forms.

The protected CMS is available at `/admin`. Add `VITE_SUPABASE_URL` and
`VITE_SUPABASE_ANON_KEY` to the deployment environment. Database setup and
operating notes are documented in [`docs/admin-panel.md`](docs/admin-panel.md).

## Commands

- `npm run dev` - start the local development server.
- `npm test` - run automated tests.
- `npm run build` - create a production build.
- `npm run check` - run tests followed by the production build.
- `npm run media:sync` - restore or refresh remote stock media in `public/assets`.
- `npm run press-kit` - regenerate the public and archived press kit PDFs.

Press-kit generation is optional and requires Python 3 with Pillow and ReportLab installed.

## Media and documentation

- Runtime assets: `frontend/public/assets`
- Media sources and manifests: `docs/media`
- Creative exports: `design-assets/exports`

Do not commit `frontend/.env`, `frontend/node_modules` or `frontend/dist`.
