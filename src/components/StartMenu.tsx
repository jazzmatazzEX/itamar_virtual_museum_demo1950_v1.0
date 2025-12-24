import { Play } from 'lucide-react';
import { useState, useEffect } from 'react';

interface StartMenuProps {
  onStart: () => void;
}

export function StartMenu({ onStart }: StartMenuProps) {
  const [brightness, setBrightness] = useState(150);
  const [hasClicked, setHasClicked] = useState(false);

  const handleClick = () => {
    if (!hasClicked) {
      setHasClicked(true);
      
      const startTime = Date.now();
      const duration = 1500; // 1.5 seconds
      
      function animate() {
        const elapsed = Date.now() - startTime;
        const progress = Math.min(elapsed / duration, 1);
        
        // Ease out cubic function for smooth transition
        const easeOut = 1 - Math.pow(1 - progress, 3);
        const newBrightness = 150 * (1 - easeOut);
        
        setBrightness(newBrightness);
        
        if (progress < 1) {
          requestAnimationFrame(animate);
        } else {
          onStart();
        }
      }
      
      requestAnimationFrame(animate);
    }
  };

  return (
    <div 
      className="fixed inset-0 flex items-center justify-center bg-black cursor-pointer"
      onClick={handleClick}
    >
      <div className="relative w-full h-full">
        <img
          src="https://raw.githubusercontent.com/jazzmatazzEX/virtual_museum_assets/main/Start-Menu-Background.png"
          alt="Start Menu Background"
          className="w-full h-full object-cover"
          style={{ filter: `brightness(${brightness}%)` }}
        />
        <div className="absolute inset-0 bg-black/10" />
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <div className="text-transparent text-xl font-medium tracking-wide animate-pulse">
            Click anywhere to start
          </div>
        </div>
      </div>
    </div>
  );
}