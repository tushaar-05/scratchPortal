import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const CHALLENGES_TO_UPSERT = [
  {
    title: 'Reversed Controls',
    category: 'Creative Theme',
    difficulty: 'Open Creative',
    maxCapacity: 4,
    shortDescription: 'Inverted movements and flipped inputs force you to navigate obstacles backwards.',
    fullDescription: 'Maybe moving left moves you right, or pressing jump makes you slam into the ground, forcing you to navigate obstacles backwards.',
    requirements: []
  },
  {
    title: 'Chain Reaction',
    category: 'Creative Theme',
    difficulty: 'Open Creative',
    maxCapacity: 4,
    shortDescription: 'Defeating an enemy turns it into a ricocheting projectile, triggering domino collisions.',
    fullDescription: 'Maybe defeating one enemy causes it to bounce around the screen like a projectile, triggering a domino effect of hits.',
    requirements: []
  },
  {
    title: 'The Floor is Lava',
    category: 'Creative Theme',
    difficulty: 'Open Creative',
    maxCapacity: 4,
    shortDescription: 'Ground contact drains survival rapidly—stay aloft by bouncing off walls and enemies.',
    fullDescription: 'Maybe touching the ground drains a meter rapidly, so you can only survive by bouncing off moving walls, enemies, or floating springs.',
    requirements: []
  },
  {
    title: 'Two Sides of the Same Coin',
    category: 'Creative Theme',
    difficulty: 'Open Creative',
    maxCapacity: 4,
    shortDescription: 'Control two mirrored characters simultaneously to solve color-coded dual obstacles.',
    fullDescription: 'Maybe you control two characters simultaneously who mirror each other’s moves, but only one can interact with certain colored obstacles at a time.',
    requirements: []
  },
  {
    title: 'Growing Burden',
    category: 'Creative Theme',
    difficulty: 'Open Creative',
    maxCapacity: 4,
    shortDescription: 'Every treasure collected adds physical weight, reducing agility and responsiveness.',
    fullDescription: 'Maybe every coin or treasure you collect makes your character physically heavier, slower, and harder to steer.',
    requirements: []
  },
  {
    title: 'Blind Faith',
    category: 'Creative Theme',
    difficulty: 'Open Creative',
    maxCapacity: 4,
    shortDescription: 'The stage is hidden in darkness, revealed only during brief radar pings.',
    fullDescription: 'Maybe the level layout is only visible for two seconds at the start of a stage or whenever you hit a radar ping button.',
    requirements: []
  },
  {
    title: 'Swap on Impact',
    category: 'Creative Theme',
    difficulty: 'Open Creative',
    maxCapacity: 4,
    shortDescription: 'Colliding with enemies swaps positions instantly instead of taking damage.',
    fullDescription: 'Maybe bumping into an enemy swaps positions with them instantly instead of taking direct damage.',
    requirements: []
  }
];

async function main() {
  console.log('[Upsert] Adding/upserting 7 new creative themes...');
  for (const c of CHALLENGES_TO_UPSERT) {
    const upserted = await prisma.challenge.upsert({
      where: { title: c.title },
      update: {
        category: c.category,
        difficulty: c.difficulty,
        maxCapacity: c.maxCapacity,
        shortDescription: c.shortDescription,
        fullDescription: c.fullDescription,
        requirements: c.requirements,
      },
      create: {
        title: c.title,
        category: c.category,
        difficulty: c.difficulty,
        maxCapacity: c.maxCapacity,
        claimedCount: 0,
        shortDescription: c.shortDescription,
        fullDescription: c.fullDescription,
        requirements: c.requirements,
      }
    });
    console.log(`[Upsert] Synced theme: ${upserted.title} (ID: ${upserted.id})`);
  }
  
  const allChallenges = await prisma.challenge.findMany({
    select: { id: true, title: true }
  });
  console.log(`[Upsert] Total themes in database now: ${allChallenges.length}`);
}

main()
  .catch((e) => {
    console.error('[Upsert] Error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
