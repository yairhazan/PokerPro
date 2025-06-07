import { Request, Response } from 'express';
import { Tournament } from '../types/tournament';

interface ChipValue {
  color: string;
  value: number;
}

// Standard poker chip colors and their relative values
const CHIP_COLORS = [
  { color: 'white', value: 1 },
  { color: 'red', value: 5 },
  { color: 'blue', value: 10 },
  { color: 'green', value: 25 },
  { color: 'black', value: 100 },
  { color: 'purple', value: 500 },
  { color: 'yellow', value: 1000 },
  { color: 'orange', value: 5000 },
  { color: 'gray', value: 10000 }
];

export const chipsValueController = {
  getChipValues: (req: Request, res: Response) => {
    try {
      const tournamentId = req.params.id;
      const tournament = (global as any).tournaments.find((t: Tournament) => t.id === tournamentId);

      if (!tournament) {
        return res.status(404).json({ error: 'Tournament not found' });
      }

      const currentLevel = tournament.currentLevel;
      const currentBlinds = tournament.blindStructure[currentLevel - 1];
      const bigBlind = currentBlinds.bigBlind;

      // Calculate chip values based on current big blind
      // Smallest chip should be 1/10 of big blind
      const smallestChipValue = Math.floor(bigBlind / 10);
      
      // Calculate the multiplier for chip values
      const multiplier = smallestChipValue;

      // Generate chip values
      const chipValues: ChipValue[] = CHIP_COLORS.map(chip => ({
        color: chip.color,
        value: chip.value * multiplier
      }));

      // Add starting stack distribution
      const startingStack = 20000;
      const stackDistribution = calculateStackDistribution(chipValues, startingStack);

      res.json({
        currentLevel,
        bigBlind,
        smallestChipValue,
        chipValues,
        stackDistribution
      });

    } catch (error) {
      res.status(500).json({ error: 'Failed to calculate chip values' });
    }
  }
};

function calculateStackDistribution(chipValues: ChipValue[], totalAmount: number): ChipValue[] {
  // Sort chips by value in descending order
  const sortedChips = [...chipValues].sort((a, b) => b.value - a.value);
  
  // Initialize distribution with all colors
  const distribution: ChipValue[] = sortedChips.map(chip => ({
    color: chip.color,
    value: 0
  }));

  let remainingAmount = totalAmount;

  // First, ensure we have enough small chips for antes and small bets
  const smallestChip = sortedChips[sortedChips.length - 1];
  const smallChipCount = Math.min(20, Math.floor(remainingAmount / smallestChip.value));
  if (smallChipCount > 0) {
    distribution[distribution.length - 1].value = smallChipCount;
    remainingAmount -= smallChipCount * smallestChip.value;
  }

  // Then, ensure we have enough medium chips for blinds
  const mediumChip = sortedChips[sortedChips.length - 2];
  const mediumChipCount = Math.min(10, Math.floor(remainingAmount / mediumChip.value));
  if (mediumChipCount > 0) {
    distribution[distribution.length - 2].value = mediumChipCount;
    remainingAmount -= mediumChipCount * mediumChip.value;
  }

  // Distribute remaining amount using larger chips
  for (let i = 0; i < sortedChips.length - 2; i++) {
    const chip = sortedChips[i];
    const maxChips = i === 0 ? 5 : 10; // Limit highest value chips to 5, others to 10
    const count = Math.min(maxChips, Math.floor(remainingAmount / chip.value));
    
    if (count > 0) {
      distribution[i].value = count;
      remainingAmount -= count * chip.value;
    }
  }

  // If there's still remaining amount, add more of the smallest chips
  if (remainingAmount > 0) {
    const smallestChip = sortedChips[sortedChips.length - 1];
    const additionalSmallChips = Math.floor(remainingAmount / smallestChip.value);
    if (additionalSmallChips > 0) {
      distribution[distribution.length - 1].value += additionalSmallChips;
    }
  }

  // Filter out chips with zero count
  return distribution.filter(chip => chip.value > 0);
}