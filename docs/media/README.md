# Media sources and maintenance

Runtime media is stored in `frontend/public/assets`. This documentation folder stays outside `public`, so manifests, source notes and shortcuts are not deployed with the website.

## Runtime structure

```text
frontend/public/assets/
|-- audio/
|   `-- track-previews/
|-- images/
|   |-- events/
|   |-- gallery/
|   |-- music-covers/
|   |-- site/
|   |-- testimonials/
|   |-- ui/
|   `-- video-thumbnails/
`-- videos/
    `-- hero/
```

## Documentation structure

- `manifests/` records the source and intended usage of each image, audio file and video.
- `youtube-references/` contains shortcuts for the remote YouTube embeds.
- `broken-sources/` records the three original URLs that returned 404 during the media audit.

## Important content notes

- The six MP3 previews are royalty-free SoundHelix demos, not original Achyut Wadhwa masters.
- YouTube videos remain remote embeds; only stable local thumbnails are stored in public assets.
- Known missing images use the local hero poster as a safe visual fallback.

## Refresh remote media

From `frontend`:

```powershell
npm run media:sync
```

The sync script retains existing files and downloads only missing remote stock assets.
