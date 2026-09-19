# AW Studio Console

The administration interface lives at `/admin` and is deliberately isolated
from the public website shell. It uses Supabase Auth, PostgreSQL Row Level
Security and Supabase Storage.

## Managed content

- Global artist, contact, social, hero and streaming settings
- Home manifesto
- Music releases and streaming links
- Events and ticket information
- Gallery images and categories
- Videos and thumbnails
- Services
- Testimonials and achievements
- About-page skills, timeline and influences
- Press platforms and partners
- Contact-form submissions
- Uploaded image, video and audio assets

Changes are saved as drafts and only reach the public website after **Publish**
is selected. Each publish creates an immutable version-history snapshot. The
public website keeps the original source data as a resilient fallback if
Supabase is temporarily unavailable, so its existing UI and layout remain
unchanged.

## Environment

Configure these public browser variables in local development and on the
hosting provider:

```text
VITE_SUPABASE_URL=
VITE_SUPABASE_ANON_KEY=
```

Never expose the Supabase service-role key in the frontend.

## Database

The idempotent schema is stored at:

```text
supabase/migrations/202609180001_admin_cms.sql
```

It creates the content, draft, history, media, inbox and administrator tables,
the publish function, the public media bucket, and all RLS policies.

## Adding another administrator

1. Create the user in Supabase Authentication.
2. Insert that user's UUID into `public.admin_users`.
3. The user can then sign in at `/admin`.

Do not grant access by weakening or disabling RLS policies.
