export type GameplayEngineType = 'exhibition' | 'inventory';

export interface GameplayEngineConfig {
  type: GameplayEngineType;
  settings?: {
    // Exhibition gameplay settings
    moveSpeed?: number;
    interactionDistance?: number;
    showInstructions?: boolean;
    // Inventory gameplay settings (for future use)
    inventorySize?: number;
    allowCrafting?: boolean;
  };
}