import { useState } from 'react';

interface StartScreenProps {
  onStart: () => void;
}

export function StartScreen({ onStart }: StartScreenProps) {
  const [fadeOut, setFadeOut] = useState(false);

  const handleStart = () => {
    setFadeOut(true);
    setTimeout(() => {
      onStart();
    }, 1000);
  };

  return (
    <div
      className={`fixed inset-0 bg-black flex items-center justify-center cursor-pointer transition-opacity duration-1000 ${
        fadeOut ? 'opacity-0' : 'opacity-100'
      }`}
      onClick={handleStart}
    >
      <div className="relative w-full h-full flex flex-col items-center justify-center">
        {/* Title Screen Image */}
        <img
          src="https://raw.githubusercontent.com/jazzmatazzEX/virtual_museum_assets/main/title_screen_v2.png"
          alt="Itamar Assumpção Museum"
          className="max-w-full max-h-full object-contain"
        />

        {/* Click to Start Text */}
        <div className="absolute bottom-20 text-white text-xl font-bold italic animate-pulse">
          CLICK TO START
        </div>
      </div>
    </div>
  );
}
