import { Room } from '../types/Room';
import { ExhibitionGameplay } from './ExhibitionGameplay';
import { InventoryGameplay } from './InventoryGameplay';

interface GameplayRouterProps {
  room: Room;
  onBackToRoomSelector: () => void;
  onTransitionToInventory?: (objectId: number, cameraPosition: [number, number, number]) => void;
  onBackToExhibition?: () => void;
  focusedObjectId?: number | null;
  isFirstEntry?: boolean;
  savedCameraPosition?: [number, number, number] | null;
}

export function GameplayRouter({
  room,
  onBackToRoomSelector,
  onTransitionToInventory,
  onBackToExhibition,
  focusedObjectId,
  isFirstEntry,
  savedCameraPosition
}: GameplayRouterProps) {
  switch (room.gameplayEngine.type) {
    case 'exhibition':
      return (
        <ExhibitionGameplay
          key={`exhibition-${room.id}`}
          room={room}
          onBackToRoomSelector={onBackToRoomSelector}
          onTransitionToInventory={onTransitionToInventory}
          isFirstEntry={isFirstEntry}
          savedCameraPosition={savedCameraPosition}
        />
      );
    case 'inventory':
      return (
        <InventoryGameplay
          key={`inventory-${room.id}`}
          room={room}
          onBackToRoomSelector={onBackToRoomSelector}
          onBackToExhibition={onBackToExhibition}
          focusedObjectId={focusedObjectId}
        />
      );
    default:
      return (
        <div className="w-full h-screen flex items-center justify-center bg-red-900">
          <div className="text-white text-center">
            <h1 className="text-2xl font-bold mb-4">Unknown Gameplay Engine</h1>
            <p>Engine type: {room.gameplayEngine.type}</p>
            <button
              onClick={onBackToRoomSelector}
              className="mt-4 bg-black/80 text-white px-4 py-2 rounded-lg hover:bg-black/90 transition-colors"
            >
              ← Back to Rooms
            </button>
          </div>
        </div>
      );
  }
}