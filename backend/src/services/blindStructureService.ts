import { BlindLevel, Break } from '../types/tournament';

export interface BlindStructureConfig {
  levelTime: number;
  startingBB: number;
  Ante: boolean;
}

export interface PredefinedBlindStructure {
  id: string;
  name: string;
  description: string;
  config: BlindStructureConfig;
}

export class BlindStructureService {
  private static readonly TOTAL_LEVELS = 30;
  
  // Standard blind progression for 100BB starting stack
  private static readonly STANDARD_BLINDS = [
    { smallBlind: 100, bigBlind: 200 },
    { smallBlind: 120, bigBlind: 240 },
    { smallBlind: 140, bigBlind: 280 },
    { smallBlind: 160, bigBlind: 320 },
    { smallBlind: 200, bigBlind: 400 },
    { smallBlind: 240, bigBlind: 480 },
    { smallBlind: 300, bigBlind: 600 },
    { smallBlind: 400, bigBlind: 800 },
    { smallBlind: 500, bigBlind: 1000 },
    { smallBlind: 600, bigBlind: 1200 },
    { smallBlind: 800, bigBlind: 1600 },
    { smallBlind: 1000, bigBlind: 2000 },
    { smallBlind: 1200, bigBlind: 2400 },
    { smallBlind: 1400, bigBlind: 2800 },
    { smallBlind: 1600, bigBlind: 3200 },
    { smallBlind: 2000, bigBlind: 4000 },
    { smallBlind: 2400, bigBlind: 4800 },
    { smallBlind: 3000, bigBlind: 6000 },
    { smallBlind: 4000, bigBlind: 8000 },
    { smallBlind: 5000, bigBlind: 10000 },
    { smallBlind: 6000, bigBlind: 12000 },
    { smallBlind: 8000, bigBlind: 16000 },
    { smallBlind: 10000, bigBlind: 20000 },
    { smallBlind: 12000, bigBlind: 24000 },
    { smallBlind: 15000, bigBlind: 30000 },
    { smallBlind: 20000, bigBlind: 40000 },
    { smallBlind: 25000, bigBlind: 50000 },
    { smallBlind: 30000, bigBlind: 60000 },
    { smallBlind: 40000, bigBlind: 80000 },
    { smallBlind: 50000, bigBlind: 100000 }
  ];

  private static readonly PREDEFINED_STRUCTURES: PredefinedBlindStructure[] = [
    {
      id: 'standard',
      name: 'Standard Structure',
      description: 'Standard tournament structure with 20-minute levels and 100BB starting stack',
      config: {
        levelTime: 20,
        startingBB: 100,
        Ante: true
      }
    },
    {
      id: 'turbo',
      name: 'Turbo Structure',
      description: 'Fast-paced tournament with 15-minute levels and 100BB starting stack',
      config: {
        levelTime: 15,
        startingBB: 100,
        Ante: true
      }
    },
    {
      id: 'deep-stack',
      name: 'Deep Stack Structure',
      description: 'Longer tournament with 30-minute levels and 100BB starting stack',
      config: {
        levelTime: 30,
        startingBB: 100,
        Ante: true
      }
    }
  ];

  static generateBlindStructure(config: BlindStructureConfig): { blindStructure: BlindLevel[], breaks: Break[] } {
    const { levelTime, startingBB, Ante } = config;
    
    // Calculate the multiplier based on the startingBB
    // For example, if startingBB is 50, we need to halve all blind values
    const multiplier = startingBB / 100;
    
    const blindStructure: BlindLevel[] = this.STANDARD_BLINDS.map((blinds, index) => ({
      level: index + 1,
      smallBlind: Math.floor(blinds.smallBlind / multiplier),
      bigBlind: Math.floor(blinds.bigBlind / multiplier),
      ante: (Ante && index >= 5) ? Math.floor(blinds.bigBlind / multiplier / 10) : 0,
      duration: levelTime
    }));

    // Generate breaks based on level time
    const breaks: Break[] = [];
    const breakInterval = levelTime <= 15 ? 4 : levelTime <= 25 ? 3 : 2;
    const breakDuration = levelTime <= 15 ? 5 : levelTime <= 25 ? 10 : 15;

    for (let level = breakInterval; level < this.TOTAL_LEVELS; level += breakInterval) {
      breaks.push({
        name: `Break ${breaks.length + 1}`,
        duration: breakDuration,
        afterLevel: level
      });
    }

    return { blindStructure, breaks };
  }

  static getPredefinedStructures(): PredefinedBlindStructure[] {
    return this.PREDEFINED_STRUCTURES;
  }

  static getPredefinedStructure(id: string): PredefinedBlindStructure | undefined {
    return this.PREDEFINED_STRUCTURES.find(structure => structure.id === id);
  }
} 