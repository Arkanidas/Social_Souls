import { useEffect, useRef } from "react";
import sound from "../assets/sound.mp3";

export const useNotificationSound = () => {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const unlockedRef = useRef(false);

  useEffect(() => {
    audioRef.current = new Audio(sound);
    audioRef.current.volume = 0.6;

    const unlockAudio = () => {
      unlockedRef.current = true;
      window.removeEventListener("click", unlockAudio);
      window.removeEventListener("keydown", unlockAudio);
    };

    window.addEventListener("click", unlockAudio);
    window.addEventListener("keydown", unlockAudio);

    return () => {
      window.removeEventListener("click", unlockAudio);
      window.removeEventListener("keydown", unlockAudio);
    };
  }, []);

  const play = () => {
    if (!audioRef.current || !unlockedRef.current) return;

    audioRef.current.currentTime = 0;
    audioRef.current.play().catch(() => {});
  };

  return { play };
};
