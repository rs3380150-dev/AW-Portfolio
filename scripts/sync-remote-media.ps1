$ErrorActionPreference = "Stop"

$projectRoot = Split-Path -Parent $PSScriptRoot
$frontendPublic = Join-Path $projectRoot "frontend\public"
$mediaRoot = Join-Path $frontendPublic "assets"

$folders = @(
  "audio\track-previews",
  "images\events",
  "images\gallery",
  "images\music-covers",
  "images\testimonials",
  "images\video-thumbnails"
)

foreach ($folder in $folders) {
  New-Item -ItemType Directory -Path (Join-Path $mediaRoot $folder) -Force | Out-Null
}

function Download-Asset {
  param(
    [Parameter(Mandatory)] [string] $Uri,
    [Parameter(Mandatory)] [string] $Destination
  )

  if ((Test-Path -LiteralPath $Destination) -and (Get-Item -LiteralPath $Destination).Length -gt 0) {
    return
  }

  Invoke-WebRequest -Uri $Uri -OutFile $Destination -Headers @{ "User-Agent" = "Mozilla/5.0 NovaPulseMediaSync/1.0" } -TimeoutSec 120
  if (-not (Test-Path -LiteralPath $Destination) -or (Get-Item -LiteralPath $Destination).Length -eq 0) {
    throw "Download produced an empty file: $Uri"
  }
}

$downloads = @(
  # Music covers
  @{ Destination = "images\music-covers\01-neon-cathedral.jpg"; Uri = "https://images.unsplash.com/photo-1556139930-c23fa4a4f934?crop=entropy&cs=srgb&fm=jpg&ixlib=rb-4.1.0&q=85&w=1200" },
  @{ Destination = "images\music-covers\02-midnight-voltage.jpg"; Uri = "https://images.unsplash.com/photo-1566410824233-a8011929225c?crop=entropy&cs=srgb&fm=jpg&ixlib=rb-4.1.0&q=85&w=1200" },
  @{ Destination = "images\music-covers\03-solar-winds-remix.jpg"; Uri = "https://images.unsplash.com/photo-1709377195538-5522ed0f9e10?crop=entropy&cs=srgb&fm=jpg&ixlib=rb-4.1.0&q=85&w=1200" },
  @{ Destination = "images\music-covers\04-afterlife-sequence.jpg"; Uri = "https://images.pexels.com/photos/3391926/pexels-photo-3391926.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=900&w=900" },
  @{ Destination = "images\music-covers\05-tulum-sunrise-live-set.jpg"; Uri = "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?crop=entropy&cs=srgb&fm=jpg&w=1200&q=85" },
  @{ Destination = "images\music-covers\06-electric-bloom.jpg"; Uri = "https://images.unsplash.com/photo-1459749411175-04bf5292ceea?crop=entropy&cs=srgb&fm=jpg&w=1200&q=85" },

  # Gallery
  @{ Destination = "images\gallery\01-festival-mainstage-lights.jpg"; Uri = "https://images.unsplash.com/photo-1470225620780-dba8ba36b745?crop=entropy&cs=srgb&fm=jpg&w=1200&q=85" },
  @{ Destination = "images\gallery\02-live-dj-performance.jpg"; Uri = "https://images.unsplash.com/photo-1533174072545-7a4b6ad7a6c3?crop=entropy&cs=srgb&fm=jpg&w=1200&q=85" },
  @{ Destination = "images\gallery\03-crowd-hands-up.jpg"; Uri = "https://images.unsplash.com/photo-1470229722913-7c0e2dbbafd3?crop=entropy&cs=srgb&fm=jpg&w=1200&q=85" },
  @{ Destination = "images\gallery\04-studio-session.jpg"; Uri = "https://images.unsplash.com/photo-1598488035139-bdbb2231ce04?crop=entropy&cs=srgb&fm=jpg&w=1200&q=85" },
  @{ Destination = "images\gallery\05-promo-portrait-neon.jpg"; Uri = "https://images.unsplash.com/photo-1541126274323-dbac58d14741?crop=entropy&cs=srgb&fm=jpg&w=1200&q=85" },
  @{ Destination = "images\gallery\06-dj-decks-close-up.jpg"; Uri = "https://images.unsplash.com/photo-1516873240891-4bf014598ab4?crop=entropy&cs=srgb&fm=jpg&w=1200&q=85" },
  @{ Destination = "images\gallery\07-festival-stage-neon.jpg"; Uri = "https://images.unsplash.com/photo-1721133073235-e4b5facb27fa?crop=entropy&cs=srgb&fm=jpg&w=1200&q=85" },
  @{ Destination = "images\gallery\08-backstage-moment.jpg"; Uri = "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?crop=entropy&cs=srgb&fm=jpg&w=1200&q=85" },
  @{ Destination = "images\gallery\09-dense-festival-crowd.jpg"; Uri = "https://images.pexels.com/photos/9534912/pexels-photo-9534912.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=1200&w=900" },
  @{ Destination = "images\gallery\10-mixing-console.jpg"; Uri = "https://images.unsplash.com/photo-1520523839897-bd0b52f945a0?crop=entropy&cs=srgb&fm=jpg&w=1200&q=85" },
  @{ Destination = "images\gallery\12-stage-silhouette.jpg"; Uri = "https://images.unsplash.com/photo-1459749411175-04bf5292ceea?crop=entropy&cs=srgb&fm=jpg&w=1200&q=85" },

  # Event posters
  @{ Destination = "images\events\01-awakenings-festival.jpg"; Uri = "https://images.unsplash.com/photo-1721133073235-e4b5facb27fa?crop=entropy&cs=srgb&fm=jpg&w=1200&q=85" },
  @{ Destination = "images\events\02-club-nebula.jpg"; Uri = "https://images.pexels.com/photos/9534912/pexels-photo-9534912.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=900&w=1200" },
  @{ Destination = "images\events\04-tomorrowland-rose-garden.jpg"; Uri = "https://images.unsplash.com/photo-1533174072545-7a4b6ad7a6c3?crop=entropy&cs=srgb&fm=jpg&w=1200&q=85" },
  @{ Destination = "images\events\05-ultra-music-festival.jpg"; Uri = "https://images.unsplash.com/photo-1470229722913-7c0e2dbbafd3?crop=entropy&cs=srgb&fm=jpg&w=1200&q=85" },
  @{ Destination = "images\events\06-warehouse-sessions.jpg"; Uri = "https://images.unsplash.com/photo-1516873240891-4bf014598ab4?crop=entropy&cs=srgb&fm=jpg&w=1200&q=85" },

  # Testimonial avatars
  @{ Destination = "images\testimonials\01-lena-vogt.jpg"; Uri = "https://i.pravatar.cc/240?img=5" },
  @{ Destination = "images\testimonials\02-marco-bellini.jpg"; Uri = "https://i.pravatar.cc/240?img=12" },
  @{ Destination = "images\testimonials\03-aisha-rahman.jpg"; Uri = "https://i.pravatar.cc/240?img=32" },
  @{ Destination = "images\testimonials\04-david-osei.jpg"; Uri = "https://i.pravatar.cc/240?img=15" },

  # YouTube thumbnails
  @{ Destination = "images\video-thumbnails\01-neon-cathedral.jpg"; Uri = "https://img.youtube.com/vi/dQw4w9WgXcQ/hqdefault.jpg" },
  @{ Destination = "images\video-thumbnails\02-live-at-awakenings-2025.jpg"; Uri = "https://img.youtube.com/vi/5qap5aO4i9A/hqdefault.jpg" },
  @{ Destination = "images\video-thumbnails\04-building-electric-bloom.jpg"; Uri = "https://img.youtube.com/vi/5yx6BWlEVcY/hqdefault.jpg" },
  @{ Destination = "images\video-thumbnails\05-europe-tour-diary.jpg"; Uri = "https://img.youtube.com/vi/hHW1oY26kxQ/hqdefault.jpg" },
  @{ Destination = "images\video-thumbnails\06-midnight-voltage-visualizer.jpg"; Uri = "https://img.youtube.com/vi/9bZkp7q19f0/hqdefault.jpg" },

  # Track previews
  @{ Destination = "audio\track-previews\01-neon-cathedral-demo.mp3"; Uri = "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3" },
  @{ Destination = "audio\track-previews\02-midnight-voltage-demo.mp3"; Uri = "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3" },
  @{ Destination = "audio\track-previews\03-solar-winds-remix-demo.mp3"; Uri = "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3" },
  @{ Destination = "audio\track-previews\04-afterlife-sequence-demo.mp3"; Uri = "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-4.mp3" },
  @{ Destination = "audio\track-previews\05-tulum-sunrise-live-set-demo.mp3"; Uri = "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-5.mp3" },
  @{ Destination = "audio\track-previews\06-electric-bloom-demo.mp3"; Uri = "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-6.mp3" }
)

$downloadNumber = 0
$failedDownloads = @()
foreach ($asset in $downloads) {
  $downloadNumber++
  Write-Host "[$downloadNumber/$($downloads.Count)] $($asset.Destination)"
  try {
    Download-Asset -Uri $asset.Uri -Destination (Join-Path $mediaRoot $asset.Destination)
  } catch {
    $failedDownloads += $asset
    Write-Warning "Could not download $($asset.Destination): $($_.Exception.Message)"
  }
}

Write-Host "Remote media assets synchronized in: $mediaRoot"
if ($failedDownloads.Count -gt 0) {
  Write-Warning "$($failedDownloads.Count) remote media file(s) could not be downloaded. See docs/media for source details."
}
