import { useState } from 'react';
import { Play, ArrowLeft, Settings, Languages } from 'lucide-react';
import { useEffect } from 'react';
import { Room } from '../types/Room';

interface RoomSelectorProps {
  rooms: Room[];
  onRoomSelect: (room: Room) => void;
  onBack?: () => void;
}

export function RoomSelector({ rooms, onRoomSelect, onBack }: RoomSelectorProps) {
  const [showLanguageMenu, setShowLanguageMenu] = useState(false);
  const [isClosing, setIsClosing] = useState(false);
  const [currentLanguage, setCurrentLanguage] = useState('EN');

  const languages = [
    { code: 'EN', name: 'EN' },
    { code: 'PT', name: 'PT' },
    { code: 'YO', name: 'YO' }
  ];

  // Language-specific content
  const languageContent = {
    EN: {
      titleImage: 'https://raw.githubusercontent.com/jazzmatazzEX/virtual_museum_assets/main/EN-title.png',
      subtitle: 'Choose an exhibition room to explore'
    },
    PT: {
      titleImage: 'https://raw.githubusercontent.com/jazzmatazzEX/virtual_museum_assets/main/PT-title.png',
      subtitle: 'Escolha uma sala de exposição para explorar'
    },
    YO: {
      titleImage: 'https://raw.githubusercontent.com/jazzmatazzEX/virtual_museum_assets/main/YO-title.png',
      subtitle: 'Yan yara ifihan kan lati ṣawari'
    }
  };

  const currentContent = languageContent[currentLanguage as keyof typeof languageContent];

  const getLanguageLabel = (languageCode: string) => {
    switch (languageCode) {
      case 'EN':
        return 'Language';
      case 'PT':
        return 'Idioma';
      case 'YO':
        return 'Èdè';
      default:
        return 'Language';
    }
  };

  const handleLanguageChange = (languageCode: string) => {
    setCurrentLanguage(languageCode);
    // Don't close the menu when selecting a language
  };

  const closeMenu = () => {
    setIsClosing(true);
    setTimeout(() => {
      setShowLanguageMenu(false);
      setIsClosing(false);
    }, 300); // Match animation duration
  };

  const toggleMenu = () => {
    if (showLanguageMenu) {
      closeMenu();
    } else {
      setShowLanguageMenu(true);
    }
  };

  const handleRoomClick = (room: Room) => {
    if (room.id === 'extras') {
      window.location.href = 'https://www.itamarassumpcao.com/';
    } else {
      onRoomSelect(room);
    }
  };

  // Handle clicking outside to close menu
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Element;
      if (showLanguageMenu && !target.closest('.settings-menu')) {
        closeMenu();
      }
    };

    if (showLanguageMenu) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showLanguageMenu]);

  return (
    <div className="h-screen w-full relative overflow-hidden">
      <video
        className="fixed inset-0 w-full h-full object-cover"
        autoPlay
        loop
        muted
        playsInline
        style={{
          filter: 'invert(1) saturate(0)'
        }}
      >
        <source src="https://raw.githubusercontent.com/jazzmatazzEX/virtual_museum_assets/main/room-selection.mp4" type="video/mp4" />
      </video>
      <div className="relative z-10 h-screen flex flex-col px-4 py-8">
        {/* Settings Menu */}
        <div className="fixed top-8 left-8 z-20 flex items-center gap-4">
          <div className="relative settings-menu">
            <img 
              src="https://raw.githubusercontent.com/jazzmatazzEX/virtual_museum_assets/main/Settings-icon.png"
              alt="Settings"
              className="w-16 h-16 cursor-pointer hover:opacity-70 transition-opacity object-contain"
              onClick={toggleMenu}
            />
            
            {showLanguageMenu && (
              <div className={`absolute top-full left-0 mt-2 bg-black shadow-lg min-w-[150px] border-2 border-blue-500 transform transition-all duration-300 ease-out ${
                isClosing ? 'animate-slide-out' : 'animate-slide-in'
              }`}>
                <div className="p-3">
                  <div className="px-4 py-3 text-sm font-medium text-white border-b-2 border-blue-500 uppercase italic">
                    {getLanguageLabel(currentLanguage)}
                  </div>
                  {languages.map((language) => (
                    <button
                      key={language.code}
                      onClick={() => handleLanguageChange(language.code)}
                      className={`w-full text-left px-4 py-3 text-sm transition-colors ${
                        currentLanguage === language.code
                          ? 'bg-blue-500 text-white'
                          : 'text-white hover:bg-gray-800'
                      }`}
                    >
                      {language.name}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
          
          {/* Title Image */}
          <div className="flex items-center">
            <img 
              src={currentContent.titleImage}
              alt="SPACES" 
              className="h-10 md:h-12 object-contain"
              onError={(e) => {
                const target = e.target as HTMLImageElement;
                target.style.display = 'none';
                const fallback = document.createElement('h1');
                fallback.className = 'text-xl md:text-2xl font-serif font-bold italic text-black';
                fallback.textContent = 'SPACES';
                target.parentNode?.appendChild(fallback);
              }}
            />
          </div>
        </div>

        <div className="flex-1 flex flex-col justify-center w-full max-w-6xl mx-auto pt-16">
          {/* Room images with attached black rectangles */}
          <div className="flex justify-center w-full">
            <div className="grid grid-cols-3 gap-6 justify-items-center">
              {rooms.map((room, index) => (
                <div
                  key={room.id}
                  className="flex flex-col items-center"
                >
                  <div className="aspect-square relative overflow-hidden cursor-pointer transition-all duration-300 transform hover:scale-150">
                    <img
                      onClick={() => handleRoomClick(room)}
                      src={room.thumbnail}
                      alt={room.name}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.src = 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400&h=300&fit=crop';
                      }}
                    />
                  </div>
                  {/* Black rectangle attached under each image */}
                  {index === 0 ? (
                    <img
                      src={
                        currentLanguage === 'EN' ? 'https://raw.githubusercontent.com/jazzmatazzEX/virtual_museum_assets/main/EN-Room-1.png' :
                        currentLanguage === 'PT' ? 'https://raw.githubusercontent.com/jazzmatazzEX/virtual_museum_assets/main/PT-Room-1.png' :
                        'https://raw.githubusercontent.com/jazzmatazzEX/virtual_museum_assets/main/YO-Room-1.png'
                      }
                      alt={`Room ${index + 1} label`}
                      className="w-48 h-16 mt-2 cursor-pointer object-contain"
                      onClick={() => handleRoomClick(room)}
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.style.display = 'none';
                      }}
                    />
                  ) : index === 1 ? (
                    <img
                      src={
                        currentLanguage === 'EN' ? 'https://raw.githubusercontent.com/jazzmatazzEX/virtual_museum_assets/main/EN-Room-2.png' :
                        currentLanguage === 'PT' ? 'https://raw.githubusercontent.com/jazzmatazzEX/virtual_museum_assets/main/PT-Room-2.png' :
                        'https://raw.githubusercontent.com/jazzmatazzEX/virtual_museum_assets/main/YO-Room-2.png'
                      }
                      alt={`Room ${index + 1} label`}
                      className="w-48 h-16 mt-2 cursor-pointer object-contain"
                      onClick={() => handleRoomClick(room)}
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.style.display = 'none';
                      }}
                    />
                  ) : (
                    <div
                      className="w-48 h-16 bg-transparent mt-2 cursor-pointer"
                      onClick={() => handleRoomClick(room)}
                    ></div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
        
        {/* Designer Credit */}
        <div className="flex justify-center pb-8">
          <p className="text-black text-sm font-light italic font-roboto">DESIGN @CAS.CANDIDO, 2025</p>
        </div>
      </div>
    </div>
  );
}