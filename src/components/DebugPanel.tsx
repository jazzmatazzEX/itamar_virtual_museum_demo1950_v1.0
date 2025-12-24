import { useState } from 'react';
import { Settings, Eye, EyeOff, Grid3X3, Lightbulb, Camera, Palette } from 'lucide-react';

interface DebugPanelProps {
  settings: {
    orbitControls: boolean;
    wireframe: boolean;
    selectionMode: boolean;
    showGrid: boolean;
    lightIntensity: number;
    fogDensity: number;
    moveSpeed: number;
  };
  onSettingChange: (key: string, value: any) => void;
  cameraPosition: [number, number, number];
  selectedObjectId: number | null;
  showButton?: boolean;
}

export function DebugPanel({ settings, onSettingChange, cameraPosition, selectedObjectId, showButton = true }: DebugPanelProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      {/* Toggle Button */}
      {showButton && (
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="fixed top-4 right-4 z-50 bg-black/80 text-white p-3 rounded-lg hover:bg-black/90 transition-colors"
        >
          <Settings className="w-5 h-5" />
        </button>
      )}

      {/* Debug Panel */}
      {isOpen && (
        <div className="fixed top-16 right-4 z-40 bg-black/90 text-white p-4 rounded-lg w-80 max-h-[80vh] overflow-y-auto">
          <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
            <Settings className="w-5 h-5" />
            Debug Panel
          </h3>

          {/* Camera Info */}
          <div className="mb-4 p-3 bg-gray-800 rounded">
            <h4 className="font-semibold mb-2 flex items-center gap-2">
              <Camera className="w-4 h-4" />
              Camera
            </h4>
            <div className="text-xs font-mono space-y-1">
              <div>X: {cameraPosition[0].toFixed(2)}</div>
              <div>Y: {cameraPosition[1].toFixed(2)}</div>
              <div>Z: {cameraPosition[2].toFixed(2)}</div>
            </div>
          </div>

          {/* Selection Info */}
          <div className="mb-4 p-3 bg-gray-800 rounded">
            <h4 className="font-semibold mb-2">Selection</h4>
            <div className="text-xs">
              Selected: {selectedObjectId ? `Object ${selectedObjectId}` : 'None'}
            </div>
          </div>

          {/* Controls */}
          <div className="space-y-4">
            <div>
              <h4 className="font-semibold mb-2 flex items-center gap-2">
                <Eye className="w-4 h-4" />
                View Controls
              </h4>
              <div className="space-y-2">
                <label className="flex items-center gap-2 text-sm">
                  <input
                    type="checkbox"
                    checked={settings.orbitControls}
                    onChange={(e) => onSettingChange('orbitControls', e.target.checked)}
                    className="rounded"
                  />
                  Orbit Controls
                </label>
                <label className="flex items-center gap-2 text-sm">
                  <input
                    type="checkbox"
                    checked={settings.wireframe}
                    onChange={(e) => onSettingChange('wireframe', e.target.checked)}
                    className="rounded"
                  />
                  Wireframe Mode
                </label>
                <label className="flex items-center gap-2 text-sm">
                  <input
                    type="checkbox"
                    checked={settings.selectionMode}
                    onChange={(e) => onSettingChange('selectionMode', e.target.checked)}
                    className="rounded"
                  />
                  Selection Mode
                </label>
                <label className="flex items-center gap-2 text-sm">
                  <input
                    type="checkbox"
                    checked={settings.showGrid}
                    onChange={(e) => onSettingChange('showGrid', e.target.checked)}
                    className="rounded"
                  />
                  <Grid3X3 className="w-4 h-4" />
                  Show Grid
                </label>
              </div>
            </div>

            <div>
              <h4 className="font-semibold mb-2 flex items-center gap-2">
                <Lightbulb className="w-4 h-4" />
                Lighting
              </h4>
              <div className="space-y-2">
                <label className="block text-sm">
                  Light Intensity: {settings.lightIntensity.toFixed(1)}
                  <input
                    type="range"
                    min="0"
                    max="3"
                    step="0.1"
                    value={settings.lightIntensity}
                    onChange={(e) => onSettingChange('lightIntensity', parseFloat(e.target.value))}
                    className="w-full mt-1"
                  />
                </label>
                <label className="block text-sm">
                  Fog Density: {settings.fogDensity.toFixed(2)}
                  <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.01"
                    value={settings.fogDensity}
                    onChange={(e) => onSettingChange('fogDensity', parseFloat(e.target.value))}
                    className="w-full mt-1"
                  />
                </label>
              </div>
            </div>

            <div>
              <h4 className="font-semibold mb-2">Movement</h4>
              <label className="block text-sm">
                Move Speed: {settings.moveSpeed.toFixed(1)}
                <input
                  type="range"
                  min="0.5"
                  max="5"
                  step="0.1"
                  value={settings.moveSpeed}
                  onChange={(e) => onSettingChange('moveSpeed', parseFloat(e.target.value))}
                  className="w-full mt-1"
                />
              </label>
            </div>
          </div>

          <div className="mt-4 pt-4 border-t border-gray-700">
            <button
              onClick={() => setIsOpen(false)}
              className="w-full bg-gray-700 hover:bg-gray-600 text-white py-2 rounded transition-colors"
            >
              Close Panel
            </button>
          </div>
        </div>
      )}
    </>
  );
}