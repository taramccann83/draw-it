export type Difficulty = "easy" | "medium" | "hard";

export interface Level {
  id: string;
  title: string;
  difficulty: Difficulty;
  referenceImage: string;
  description: string; // Used in AI prompt to describe what the drawing should look like
  order: number;
}

export const levels: Level[] = [
  // Easy — fun characters and objects, beginner-friendly
  {
    id: "ice-cream",
    title: "Ice Cream",
    difficulty: "easy",
    referenceImage: "/reference-images/ice-cream.svg",
    description: "A cute ice cream cone with a round pink scoop on top, a waffle cone, colorful sprinkles, and a cherry on top",
    order: 1,
  },
  {
    id: "cupcake",
    title: "Cupcake",
    difficulty: "easy",
    referenceImage: "/reference-images/cupcake.svg",
    description: "A cute cupcake with a paper wrapper, swirled pink frosting on top, colorful sprinkles, and a little star",
    order: 2,
  },
  {
    id: "rainbow",
    title: "Rainbow",
    difficulty: "easy",
    referenceImage: "/reference-images/rainbow.svg",
    description: "A bright rainbow with six colored arches (red, orange, yellow, green, blue, purple) and a fluffy white cloud on each end",
    order: 3,
  },
  {
    id: "balloon",
    title: "Balloon",
    difficulty: "easy",
    referenceImage: "/reference-images/balloon.svg",
    description: "A round red balloon with a happy face, a yellow bow tied at the bottom, and a curvy string hanging down",
    order: 4,
  },
  {
    id: "sun",
    title: "Sun",
    difficulty: "easy",
    referenceImage: "/reference-images/sun.svg",
    description: "A bright yellow sun with a happy smiling face and rays all around it",
    order: 5,
  },
  {
    id: "house",
    title: "House",
    difficulty: "easy",
    referenceImage: "/reference-images/house.svg",
    description: "A cozy house with a red triangular roof, tan walls, a wooden door, two windows with shutters, a chimney with smoke, and bushes at the base",
    order: 6,
  },
  {
    id: "flower",
    title: "Flower",
    difficulty: "easy",
    referenceImage: "/reference-images/flower.svg",
    description: "A pretty flower with five big pink petals around a yellow smiley-face center, a green stem, and two leaves",
    order: 7,
  },

  // Medium — animals and everyday objects with more detail
  {
    id: "cat",
    title: "Cat",
    difficulty: "medium",
    referenceImage: "/reference-images/cat.svg",
    description: "A cute orange tabby cat sitting upright with pointy ears, green eyes, whiskers, stripes on the forehead, and a curled tail",
    order: 8,
  },
  {
    id: "car",
    title: "Car",
    difficulty: "medium",
    referenceImage: "/reference-images/car.svg",
    description: "A cute blue car seen from the side with two round wheels, a windshield, a door, a headlight, and a smiling bumper",
    order: 9,
  },
  {
    id: "fish",
    title: "Fish",
    difficulty: "medium",
    referenceImage: "/reference-images/fish.svg",
    description: "A cute orange fish with scales, a fan-shaped tail, fins, a big round eye, a smiling mouth, and bubbles",
    order: 10,
  },
  {
    id: "tree",
    title: "Tree",
    difficulty: "medium",
    referenceImage: "/reference-images/tree.svg",
    description: "A friendly tree with a brown trunk, a big round green leafy canopy, red apples, and two small birds sitting in the branches",
    order: 11,
  },
  {
    id: "dog",
    title: "Dog",
    difficulty: "medium",
    referenceImage: "/reference-images/dog.svg",
    description: "A cute golden dog sitting with big floppy ears, brown eyes, a big pink nose, a happy tongue sticking out, and stubby paws",
    order: 12,
  },

  // Hard — more complex drawings with lots of detail
  {
    id: "bicycle",
    title: "Bicycle",
    difficulty: "hard",
    referenceImage: "/reference-images/bicycle.svg",
    description: "A bicycle with two large spoked wheels, a triangular red frame, handlebars with grips and a bell, a seat, pedals, and a chain",
    order: 13,
  },
  {
    id: "robot",
    title: "Robot",
    difficulty: "hard",
    referenceImage: "/reference-images/robot.svg",
    description: "A friendly robot with a square gray body, glowing blue rectangular eyes, a grid smile, an antenna on the head, colorful chest buttons, and blocky arms and legs",
    order: 14,
  },
  {
    id: "castle",
    title: "Castle",
    difficulty: "hard",
    referenceImage: "/reference-images/castle.svg",
    description: "A fairytale castle with two towers with pointed roofs, battlements along the top, a large arched wooden door, small windows, stone texture walls, and a flag on each tower",
    order: 15,
  },
  {
    id: "dragon",
    title: "Dragon",
    difficulty: "hard",
    referenceImage: "/reference-images/dragon.svg",
    description: "A cute green cartoon dragon with small wings, two horns, yellow eyes, orange flame breath coming from its mouth, a long tail, and small clawed feet",
    order: 16,
  },
  {
    id: "pirate-ship",
    title: "Pirate Ship",
    difficulty: "hard",
    referenceImage: "/reference-images/pirate-ship.svg",
    description: "A classic pirate ship with a wooden hull, two masts with white sails (one with a skull and crossbones), a Jolly Roger flag, rope rigging, and stylized waves underneath",
    order: 17,
  },
];

export function getLevelById(id: string): Level | undefined {
  return levels.find((l) => l.id === id);
}

export function getNextLevel(currentId: string): Level | undefined {
  const current = levels.find((l) => l.id === currentId);
  if (!current) return undefined;
  return levels.find((l) => l.order === current.order + 1);
}
