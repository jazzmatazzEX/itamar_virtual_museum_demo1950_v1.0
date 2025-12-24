import { useState, useCallback } from 'react';
import { StartScreen } from './components/StartScreen';
import { RoomSelector } from './components/RoomSelector';
import { GameplayRouter } from './components/GameplayRouter';
import { rooms } from './data/rooms';
import { Room } from './types/Room';

function App() {
  const [showStartScreen, setShowStartScreen] = useState(true);
  const [currentRoom, setCurrentRoom] = useState<Room | null>(null);
  const [previousRoom, setPreviousRoom] = useState<Room | null>(null);
  const [focusedObjectId, setFocusedObjectId] = useState<number | null>(null);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [fadeOut, setFadeOut] = useState(false);
  const [savedCameraPosition, setSavedCameraPosition] = useState<[number, number, number] | null>(null);

  const handleStartScreenComplete = useCallback(() => {
    setShowStartScreen(false);
  }, []);

  const handleRoomSelect = useCallback((room: Room) => {
    setCurrentRoom(room);
    setPreviousRoom(null);
    setFocusedObjectId(null);
    setSavedCameraPosition(null);
  }, []);

  const handleBackToRoomSelector = useCallback(() => {
    setCurrentRoom(null);
    setPreviousRoom(null);
    setFocusedObjectId(null);
    setSavedCameraPosition(null);
  }, []);

  const handleTransitionToInventory = useCallback((objectId: number, cameraPosition: [number, number, number]) => {
    const inventoryRoom = rooms.find(r => r.id === 'inventory-room');
    if (inventoryRoom && currentRoom && !isTransitioning) {
      setIsTransitioning(true);
      setFadeOut(true);
      setSavedCameraPosition(cameraPosition);

      // Wait for fade out, then change room
      setTimeout(() => {
        setPreviousRoom(currentRoom);
        setCurrentRoom(inventoryRoom);
        setFocusedObjectId(objectId);
        setFadeOut(false);

        // Complete transition after fade in
        setTimeout(() => {
          setIsTransitioning(false);
        }, 500);
      }, 500);
    }
  }, [currentRoom, isTransitioning]);

  const handleBackToExhibition = useCallback(() => {
    if (previousRoom && !isTransitioning) {
      setIsTransitioning(true);
      setFadeOut(true);

      // Wait for fade out, then change room
      setTimeout(() => {
        setCurrentRoom(previousRoom);
        setPreviousRoom(null);
        setFocusedObjectId(null);
        setFadeOut(false);

        // Complete transition after fade in
        setTimeout(() => {
          setIsTransitioning(false);
          // Clear saved camera position after restoration
          setSavedCameraPosition(null);
        }, 500);
      }, 500);
    }
  }, [previousRoom, isTransitioning]);

  if (showStartScreen) {
    return <StartScreen onStart={handleStartScreenComplete} />;
  }

  if (!currentRoom) {
    return (
      <RoomSelector
        rooms={rooms}
        onRoomSelect={handleRoomSelect}
      />
    );
  }

  return (
    <div className="relative w-full h-screen">
      <GameplayRouter
        room={currentRoom}
        onBackToRoomSelector={handleBackToRoomSelector}
        onTransitionToInventory={handleTransitionToInventory}
        onBackToExhibition={previousRoom ? handleBackToExhibition : undefined}
        focusedObjectId={focusedObjectId}
        isFirstEntry={previousRoom === null}
        savedCameraPosition={savedCameraPosition}
      />

      {/* Fade Transition Overlay */}
      <div
        className={`fixed inset-0 bg-black pointer-events-none z-50 transition-opacity duration-500 ${
          fadeOut ? 'opacity-100' : 'opacity-0'
        }`}
      />
    </div>
  );
}

export default App;