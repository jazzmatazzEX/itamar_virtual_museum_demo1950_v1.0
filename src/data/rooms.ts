import { Room } from '../types/Room';

export const rooms: Room[] = [
  {
    id: 'itamar-main',
    name: 'Itamar Assumpção Main Gallery',
    description: 'The main exhibition featuring Itamar Assumpção\'s life and work',
    thumbnail: 'https://raw.githubusercontent.com/jazzmatazzEX/virtual_museum_assets/main/room1.gif',
    gameplayEngine: {
      type: 'exhibition',
      settings: {
        moveSpeed: 3.5,
        interactionDistance: 3,
        showInstructions: true
      }
    },
    cameraStartPosition: [0, 1.7, 11],
    lightSettings: {
      ambientIntensity: 0.8,
      directionalIntensity: 1.5,
      directionalPosition: [10, 10, 5]
    },
    artCanvases: [
      {
        id: 1,
        position: [-9.85, 2.50, 2],
        size: [2, 3],
        name: 'Canvas 1'
      },
      {
        id: 3,
        position: [-9.85, 2.5, 6.60],
        size: [5.6, 3],
        name: 'Canvas 3'
      },
      {
        id: 5,
        position: [-4, 2.5, 0.15],
        size: [2.8, 2.8],
        name: 'Canvas 5',
        rotation: [0, 0, 0]
      },
      {
        id: 6,
        position: [4, 2.5, 0.15],
        size: [2.8, 4],
        name: 'Canvas 6',
        rotation: [0, 0, 0]
      },
      {
        id: 7,
        position: [0, 2.5, -9.85],
        size: [10, 5],
        name: 'Canvas 7',
        rotation: [0, 0, 0]
      },
      {
        id: 8,
        position: [-9.85, 2.50, -2],
        size: [3, 3],
        name: 'Canvas 8'
      },
      {
        id: 9,
        position: [-9.85, 2.50, -6.6],
        size: [5, 3],
        name: 'Canvas 9'
      },
      {
        id: 10,
        position: [-4, 2.5, -0.15],
        size: [2.8, 2.8],
        name: 'Canvas 10',
        rotation: [0, 0, 0]
      },
      {
        id: 11,
        position: [4.75, 2.50, -5],
        size: [4.5, 5],
        name: 'Canvas 11'
      },
      {
        id: 12,
        position: [9.85, 2.50, -5],
        size: [10, 5],
        name: 'Canvas 12'
      },
      {
        id: 13,
        position: [9.85, 2.50, 5],
        size: [10, 5],
        name: 'Canvas 13'
      },
      {
        id: 14,
        position: [4, 2.5, -0.15],
        size: [2.8, 2.8],
        name: 'Canvas 14',
        rotation: [0, 0, 0]
      }
    ],
    interactiveObjects: [
      {
        id: 1,
        position: [-3, 0.25, 5],
        size: [2, 0.5, 2],
        color: "#3b82f6",
        name: "Front Left Stand"
      },
      {
        id: 2,
        position: [3, 0.25, 5],
        size: [2, 0.5, 2],
        color: "#3b82f6",
        name: "Front Right Stand"
      },
      {
        id: 3,
        position: [-3, 0.25, -5],
        size: [2, 0.5, 2],
        color: "#3b82f6",
        name: "Back Left Stand"
      },
      {
        id: 6,
        position: [0, 2.5, -10],
        size: [10, 5, 0.2],
        color: "#fde047",
        name: "Back Wall"
      },
      {
        id: 7,
        position: [-10, 2.5, -5],
        size: [0.2, 5, 10],
        color: "#fde047",
        name: "Left Wall Front"
      },
      {
        id: 8,
        position: [-10, 2.5, 5],
        size: [0.2, 5, 10],
        color: "#fde047",
        name: "Left Wall Back"
      },
      {
        id: 9,
        position: [10, 2.5, -5],
        size: [0.2, 5, 10],
        color: "#fde047",
        name: "Right Wall Front"
      },
      {
        id: 10,
        position: [10, 2.5, 5],
        size: [0.2, 5, 10],
        color: "#fde047",
        name: "Right Wall Back"
      },
      {
        id: 11,
        position: [-4, 2.5, 0],
        size: [4, 5, 0.2],
        color: "#fde047",
        name: "Center Wall Left"
      },
      {
        id: 12,
        position: [4, 2.5, 0],
        size: [4, 5, 0.2],
        color: "#fde047",
        name: "Center Wall Right"
      },
      {
        id: 13,
        position: [4.9, 2.5, -5],
        size: [0.2, 5, 4.5],
        color: "#fde047",
        name: "Interior Wall"
      }
    ],
    glbModels: [
      {
        id: 1,
        url: "https://raw.githubusercontent.com/jazzmatazzEX/ita-museum_v0.1/refs/heads/main/afrobrasil.gltf",
        position: [3, 2, 5],
        scale: 0.5,
        title: "Afro Brazilian",
        description: "A representation of Afro-Brazilian culture and heritage."
      },
      {
        id: 2,
        url: "https://raw.githubusercontent.com/jazzmatazzEX/virtual_museum_assets/main/umbigada_v2.glb",
        position: [-3, 1.5, -5],
        scale: 0.4,
        title: "Batuque de Umbigada",
        description: "The batuque de umbigada, also known as tambu or caiumba, is an Afro-Brazilian cultural tradition of Bantu origin that has developed in Brazil since the period of the slavery. The Middle Tietê region, in the western part of the state of São Paulo, is where the batuque de umbigada took shape, with sugarcane and coffee plantations serving as its primary sources of development. This region encompasses several municipalities that, over decades, have managed to keep this tradition alive and that, even after the abolition of slavery, continued to face persecution and the resulting marginalization of its practice. Caiumba is an ancestral gathering and a celebration of life in which the drums act as communicators between the material and spiritual worlds, always interconnected, and as representations of ancestry. When the mulemba/quinjengue, the tambu, the matraca, and the guaiás begin to play, they enact narratives that evoke the sacredness of time."
      },
      {
        id: 3,
        url: "https://raw.githubusercontent.com/jazzmatazzEX/virtual_museum_assets/main/glasses_v2.glb",
        position: [-3, 1.2, 5],
        scale: 0.2,
        title: "Itamar Assumpção's Glasses",
        description: "Iconic black-framed glasses shaped like hands with blue lenses. Used by Itamar Assumpção, 2000.",
        materialProperties: {
          metalness: 0.1,
          roughness: 0.1,
          transmission: 0.9,
          ior: 1.5,
          thickness: 0.5,
          transparent: true
        }
      }
    ]
  },
  {
    id: 'inventory-room',
    name: 'Inventory Room',
    description: 'Interactive inventory and hand tracking experience',
    thumbnail: 'https://raw.githubusercontent.com/jazzmatazzEX/virtual_museum_assets/main/room2.gif',
    gameplayEngine: {
      type: 'inventory',
      settings: {
        inventorySize: 10,
        allowCrafting: false
      }
    },
    cameraStartPosition: [0, 1.7, 6],
    lightSettings: {
      ambientIntensity: 0.6,
      directionalIntensity: 2.0,
      directionalPosition: [5, 15, 10]
    },
    artCanvases: [
      {
        id: 1,
        position: [-8, 2.5, 0],
        size: [3, 4],
        name: 'Contemporary 1'
      },
      {
        id: 2,
        position: [8, 2.5, 0],
        size: [3, 4],
        name: 'Contemporary 2'
      },
      {
        id: 3,
        position: [0, 2.5, -8],
        size: [6, 3],
        name: 'Contemporary 3'
      }
    ],
    interactiveObjects: [
      {
        id: 1,
        position: [0, 2.5, -8],
        size: [8, 5, 0.2],
        color: "#8b5cf6",
        name: "Back Wall"
      },
      {
        id: 2,
        position: [-8, 2.5, 0],
        size: [0.2, 5, 8],
        color: "#8b5cf6",
        name: "Left Wall"
      },
      {
        id: 3,
        position: [8, 2.5, 0],
        size: [0.2, 5, 8],
        color: "#8b5cf6",
        name: "Right Wall"
      }
    ],
    glbModels: [
      {
        id: 1,
        url: "https://raw.githubusercontent.com/jazzmatazzEX/virtual_museum_assets/main/glasses_v2.glb",
        position: [0, 1.5, 0],
        scale: 0.25,
        rotation: [0, Math.PI / 2, 0],
        title: "Itamar Assumpção's Glasses",
        description: "Iconic black-framed glasses shaped like hands with blue lenses. Used by Itamar Assumpção, 2000.",
        materialProperties: {
          metalness: 0.1,
          roughness: 0.1,
          transmission: 0.9,
          ior: 1.5,
          thickness: 0.5,
          transparent: true
        }
      },
      {
        id: 2,
        url: "https://raw.githubusercontent.com/jazzmatazzEX/virtual_museum_assets/main/umbigada_v2.glb",
        position: [3, 1.2, -3],
        scale: 0.28125,
        title: "Batuque de Umbigada",
        description: "The batuque de umbigada, also known as tambu or caiumba, is an Afro-Brazilian cultural tradition of Bantu origin that has developed in Brazil since the period of the slavery. The Middle Tietê region, in the western part of the state of São Paulo, is where the batuque de umbigada took shape, with sugarcane and coffee plantations serving as its primary sources of development. This region encompasses several municipalities that, over decades, have managed to keep this tradition alive and that, even after the abolition of slavery, continued to face persecution and the resulting marginalization of its practice. Caiumba is an ancestral gathering and a celebration of life in which the drums act as communicators between the material and spiritual worlds, always interconnected, and as representations of ancestry. When the mulemba/quinjengue, the tambu, the matraca, and the guaiás begin to play, they enact narratives that evoke the sacredness of time."
      }
    ]
  },
  {
    id: 'extras',
    name: 'Extras',
    description: 'Additional content and features',
    thumbnail: 'https://raw.githubusercontent.com/jazzmatazzEX/virtual_museum_assets/main/room3.gif',
    gameplayEngine: {
      type: 'exhibition',
      settings: {
        moveSpeed: 2.8,
        interactionDistance: 4,
        showInstructions: true
      }
    },
    cameraStartPosition: [0, 1.7, 10],
    lightSettings: {
      ambientIntensity: 1.0,
      directionalIntensity: 1.8,
      directionalPosition: [15, 20, 8]
    },
    artCanvases: [],
    interactiveObjects: [
      {
        id: 1,
        position: [0, 1, 0],
        size: [1, 2, 1],
        color: "#10b981",
        name: "Central Pedestal"
      },
      {
        id: 2,
        position: [-5, 1, -5],
        size: [1, 2, 1],
        color: "#10b981",
        name: "Corner Pedestal 1"
      },
      {
        id: 3,
        position: [5, 1, -5],
        size: [1, 2, 1],
        color: "#10b981",
        name: "Corner Pedestal 2"
      }
    ],
    glbModels: []
  }
];