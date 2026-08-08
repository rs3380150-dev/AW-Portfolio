import React, { createContext, useCallback, useContext, useEffect, useRef, useState } from "react";
import { tracks as allTracks } from "@/data/tracks";

const PlayerContext = createContext(null);

export const usePlayer = () => useContext(PlayerContext);

export const PlayerProvider = ({ children }) => {
  const audioRef = useRef(null);
  const currentIndexRef = useRef(0);
  const volumeRef = useRef(0.8);
  const [queue] = useState(allTracks);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(0.8);
  const [active, setActive] = useState(false);

  const current = queue[currentIndex] || queue[0];

  const ensureAudio = useCallback(() => {
    if (!audioRef.current) {
      audioRef.current = new Audio();
      audioRef.current.volume = volumeRef.current;
    }
    return audioRef.current;
  }, []);

  const playIndex = useCallback((index) => {
    const track = queue[index];
    if (!track) return;

    const audio = ensureAudio();
    currentIndexRef.current = index;
    setCurrentIndex(index);
    setProgress(0);
    setDuration(0);
    setActive(true);

    if (audio.src !== track.audio) {
      audio.src = track.audio;
    }

    audio.play().then(() => setIsPlaying(true)).catch(() => setIsPlaying(false));
  }, [ensureAudio, queue]);

  useEffect(() => {
    currentIndexRef.current = currentIndex;
  }, [currentIndex]);

  useEffect(() => {
    const audio = ensureAudio();
    const onTime = () => setProgress(audio.currentTime);
    const onMeta = () => setDuration(audio.duration || 0);
    const onEnd = () => {
      const index = (currentIndexRef.current + 1) % queue.length;
      playIndex(index);
    };

    audio.addEventListener("timeupdate", onTime);
    audio.addEventListener("loadedmetadata", onMeta);
    audio.addEventListener("ended", onEnd);

    return () => {
      audio.removeEventListener("timeupdate", onTime);
      audio.removeEventListener("loadedmetadata", onMeta);
      audio.removeEventListener("ended", onEnd);
      audio.pause();
    };
  }, [ensureAudio, playIndex, queue.length]);

  useEffect(() => {
    volumeRef.current = volume;
    if (audioRef.current) audioRef.current.volume = volume;
  }, [volume]);

  const playTrack = useCallback((id) => {
    const index = queue.findIndex((track) => track.id === id);
    if (index === -1) return;

    if (index === currentIndexRef.current && active) {
      const audio = ensureAudio();
      if (isPlaying) {
        audio.pause();
        setIsPlaying(false);
      } else {
        audio.play().then(() => setIsPlaying(true)).catch(() => {});
      }
      return;
    }

    playIndex(index);
  }, [active, ensureAudio, isPlaying, playIndex, queue]);

  const togglePlay = useCallback(() => {
    const audio = ensureAudio();

    if (!active || !audio.src) {
      playIndex(currentIndexRef.current);
      return;
    }

    if (isPlaying) {
      audio.pause();
      setIsPlaying(false);
    } else {
      audio.play().then(() => setIsPlaying(true)).catch(() => {});
    }
  }, [active, ensureAudio, isPlaying, playIndex]);

  const next = useCallback(() => {
    const index = (currentIndexRef.current + 1) % queue.length;
    playIndex(index);
  }, [playIndex, queue.length]);

  const prev = useCallback(() => {
    const index = (currentIndexRef.current - 1 + queue.length) % queue.length;
    playIndex(index);
  }, [playIndex, queue.length]);

  const seek = useCallback((time) => {
    const audio = audioRef.current;
    if (!audio) return;

    const nextTime = Math.max(0, Math.min(time, duration || time));
    audio.currentTime = nextTime;
    setProgress(nextTime);
  }, [duration]);

  const value = {
    current,
    currentIndex,
    queue,
    isPlaying,
    progress,
    duration,
    volume,
    active,
    playTrack,
    togglePlay,
    next,
    prev,
    seek,
    setVolume,
  };

  return <PlayerContext.Provider value={value}>{children}</PlayerContext.Provider>;
};
