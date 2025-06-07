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
  private static readonly FIXED_STARTING_STACK = 20000;
  private static readonly TOTAL_LEVELS = 30;

  private static readonly PREDEFINED_STRUCTURES: PredefinedBlindStructure[] = [
    {
      id: 'standard',
      name: 'Standard Structure',
      description: 'Standard tournament structure with 20-minute levels and 50BB starting stack',
      config: {
        levelTime: 20,
        startingBB: 50,
        Ante: true
      }
    },
    {
      id: 'turbo',
      name: 'Turbo Structure',
      description: 'Fast-paced tournament with 15-minute levels and 40BB starting stack',
      config: {
        levelTime: 15,
        startingBB: 40,
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
    
    const bbValue = Math.floor(this.FIXED_STARTING_STACK / startingBB);
    const blindStructure: BlindLevel[] = [];
    let currentBB = bbValue;

    for (let level = 1; level <= this.TOTAL_LEVELS; level++) {
      const smallBlind = Math.floor(currentBB / 2);
      const bigBlind = currentBB;
      
      blindStructure.push({
        level,
        smallBlind,
        bigBlind,
        ante: (Ante && level > 5) ? Math.floor(bigBlind / 10) : 0,
        duration: levelTime
      });

      // Increase blinds by 50% each level
      currentBB = Math.floor(currentBB * 1.5);
    }

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

} 