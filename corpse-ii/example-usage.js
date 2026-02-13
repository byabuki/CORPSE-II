// Example usage of the calculateReplacementLevel function

// Import the function (in a real application, this would be imported from the module)
// import { calculateReplacementLevel } from './app/lib/corpse';

// Example player data (this would typically come from your database)
const exampleBatterValues = [
    { name: 'Mike Trout', zTOTAL: 15.2 },
    { name: 'Shohei Ohtani', zTOTAL: 14.8 },
    { name: 'Ronald Acuña Jr.', zTOTAL: 13.5 },
    { name: 'Mookie Betts', zTOTAL: 12.1 },
    { name: 'Juan Soto', zTOTAL: 11.8 },
    // ... more players
    { name: 'Player 180', zTOTAL: 2.1 },
    { name: 'Player 181', zTOTAL: 1.9 },
    { name: 'Player 182', zTOTAL: 1.8 },
    { name: 'Player 183', zTOTAL: 1.7 },
    { name: 'Player 184', zTOTAL: 1.6 },
    { name: 'Player 185', zTOTAL: 1.5 },
    { name: 'Player 186', zTOTAL: 1.4 },
    { name: 'Player 187', zTOTAL: 1.3 },
    { name: 'Player 188', zTOTAL: 1.2 },
    { name: 'Player 189', zTOTAL: 1.1 },
    { name: 'Player 190', zTOTAL: 1.0 },
    { name: 'Player 191', zTOTAL: 0.9 },
    { name: 'Player 192', zTOTAL: 0.8 },
    { name: 'Player 193', zTOTAL: 0.7 },
    { name: 'Player 194', zTOTAL: 0.6 },
    { name: 'Player 195', zTOTAL: 0.5 },
    // ... more players
];

const examplePitcherValues = [
    { name: 'Shane McClanahan', zTOTAL: 12.5 },
    { name: 'Julio Urías', zTOTAL: 11.8 },
    { name: 'Sandy Alcantara', zTOTAL: 11.2 },
    // ... more pitchers
];

// Example usage:

// 1. Calculate replacement level for batters starting at position 180, averaging next 15 players
// This would average the zTOTALs of players at positions 181-195
const batterReplacementLevel = calculateReplacementLevel(
    exampleBatterValues,
    true,    // isBatters = true
    180,     // startPosition = 180
    15       // playersToAverage = 15
);

console.log(`Batter replacement level: ${batterReplacementLevel}`);

// 2. Calculate replacement level for pitchers with default parameters
// This would start at position 200 and average the next 10 players
const pitcherReplacementLevel = calculateReplacementLevel(
    examplePitcherValues,
    false,   // isBatters = false
    200,     // startPosition = 200 (default)
    10       // playersToAverage = 10 (default)
);

console.log(`Pitcher replacement level: ${pitcherReplacementLevel}`);

// 3. Calculate replacement level for top-tier players (starting at position 1)
const topTierReplacementLevel = calculateReplacementLevel(
    exampleBatterValues,
    true,    // isBatters = true
    1,       // startPosition = 1
    5        // playersToAverage = 5
);

console.log(`Top 5 player average: ${topTierReplacementLevel}`);