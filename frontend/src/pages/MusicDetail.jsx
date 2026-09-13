import React from "react";
import { Link, Navigate, useParams } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowLeft, ArrowUpRight, Headphones, Play } from "@/components/icons";
import { tracks } from "@/data/tracks";
import { usePlayer } from "@/context/PlayerContext";

const EASE = [0.22, 1, 0.36, 1];

const services = [
  { key: "spotify", label: "Spotify" },
  { key: "soundcloud", label: "SoundCloud" },
  { key: "apple", label: "Apple Music" },
  { key: "youtube", label: "YouTube" },
];

export const MusicDetail = () => {
  const { slug } = useParams();
  const track = tracks.find((item) => item.slug === slug);
  const { current, isPlaying, playTrack } = usePlayer();

  if (!track) return <Navigate to="/music" replace />;

  const playing = current?.id === track.id && isPlaying;

  return (
    <div className="music-detail-page bg-[#f2f0ea] text-[#050505]" data-testid={`music-detail-${track.id}`}>
      <section className="music-detail-hero">
        <div className="music-detail-hero-image" style={{ backgroundImage: `url(${track.cover})` }} />
        <div className="music-detail-hero-wash" />

        <div className="music-detail-rail">
          <Link to="/music" className="music-detail-back" data-testid="music-detail-back">
            <ArrowLeft className="h-4 w-4" /> All music
          </Link>
        </div>

        <div className="music-detail-hero-copy">
          <motion.p initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.12, ease: EASE }} className="music-detail-release-label">
            New release <span>{track.releaseDate}</span>
          </motion.p>
          <motion.h1 initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, delay: 0.18, ease: EASE }}>
            {track.title}
          </motion.h1>
          <motion.p initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.3, ease: EASE }} className="music-detail-artist">
            <span /> Achyut Wadhwa
          </motion.p>
        </div>

        <motion.div initial={{ opacity: 0, y: 48 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.9, delay: 0.26, ease: EASE }} className="music-detail-artwork">
          <img src={track.cover} alt={`${track.title} cover artwork`} />
          <button type="button" onClick={() => playTrack(track.id)} aria-label={playing ? `Pause ${track.title}` : `Play ${track.title}`} className="music-detail-artwork-play">
            <Play className="h-5 w-5 fill-current" /> {playing ? "Playing" : "Play preview"}
          </button>
        </motion.div>
      </section>

      <section className="music-detail-story">
        <article className="music-detail-copy">
          <span className="music-detail-section-index">01 / RELEASE NOTE</span>
          <h2>{track.title}</h2>
          <p className="music-detail-lead">{track.description}</p>
          <p>{track.story}</p>
          <p>Made for the spaces between the club, the studio, and the road, the record carries the same intent in every format: movement first, detail second, and a lasting atmosphere after the sound fades.</p>
          <div className="music-detail-credits">
            <span>Written & produced by</span><strong>Achyut Wadhwa</strong>
            <span>Release year</span><strong>{track.year}</strong>
            <span>Format</span><strong>{track.genre}</strong>
          </div>
        </article>

        <aside className="music-detail-listen">
          <img src={track.cover} alt="" />
          <div className="music-detail-listen-copy">
            <p>{track.title}</p>
            <span>Achyut Wadhwa</span>
          </div>
          <h3>Listen on</h3>
          <div className="music-detail-service-grid">
            {services.map((service) => (
              <a key={service.key} href={track.links[service.key]} target="_blank" rel="noreferrer" className="music-detail-service" data-testid={`detail-${track.id}-${service.key}`}>
                <Headphones className="h-4 w-4" /> {service.label}<ArrowUpRight className="ml-auto h-3.5 w-3.5" />
              </a>
            ))}
          </div>
        </aside>
      </section>

      <section className="music-detail-video">
        <div className="music-detail-video-media" style={{ backgroundImage: `url(${track.cover})` }}>
          <button type="button" onClick={() => playTrack(track.id)} aria-label={`Play ${track.title}`} className="music-detail-video-play"><Play className="h-7 w-7 fill-current" /></button>
        </div>
        <div className="music-detail-video-copy">
          <span>02 / IMMERSIVE SOUND</span>
          <h2>Listen to the world behind the record.</h2>
          <p>A visual fragment for {track.title}, shaped around its pace, colour, and afterimage.</p>
        </div>
      </section>

      <section className="music-detail-stream">
        <p>Stream “{track.title}” on</p>
        <div>
          {services.map((service) => (
            <a key={service.key} href={track.links[service.key]} target="_blank" rel="noreferrer">{service.label} <ArrowUpRight className="h-3.5 w-3.5" /></a>
          ))}
        </div>
      </section>
    </div>
  );
};
