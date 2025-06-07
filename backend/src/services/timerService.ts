import { Tournament } from '../types/tournament';

interface TimerState {
  timeRemaining: number;
  isBreak: boolean;
  breakTimeRemaining: number;
  currentLevel: number;
  timer: NodeJS.Timeout | null;
  isPaused: boolean;
}

class TimerService {
  private timers: Map<string, TimerState> = new Map();

  private findTournament(tournamentId: string): Tournament | undefined {
    return (global as any).tournaments.find((t: Tournament) => t.id === tournamentId);
  }

  startTimer(tournament: Tournament): void {
    if (this.timers.has(tournament.id)) {
      return; // Timer already exists
    }

    const currentLevel = tournament.blindStructure[tournament.currentLevel - 1];
    const nextBreak = tournament.breaks.find(b => b.afterLevel === tournament.currentLevel);

    const timerState: TimerState = {
      timeRemaining: currentLevel.duration * 60, // Convert to seconds
      isBreak: false,
      breakTimeRemaining: 0,
      currentLevel: tournament.currentLevel,
      timer: null,
      isPaused: false
    };

    this.timers.set(tournament.id, timerState);
    this.startCountdown(tournament.id);
  }

  private startCountdown(tournamentId: string): void {
    const timerState = this.timers.get(tournamentId);
    if (!timerState) return;

    timerState.timer = setInterval(() => {
      if (timerState.isPaused) return;

      if (timerState.isBreak) {
        timerState.breakTimeRemaining--;
        if (timerState.breakTimeRemaining <= 0) {
          this.endBreak(tournamentId);
        }
      } else {
        timerState.timeRemaining--;
        if (timerState.timeRemaining <= 0) {
          this.handleLevelEnd(tournamentId);
        }
      }
    }, 1000);
  }

  // Control Methods
  pauseTimer(tournamentId: string): boolean {
    const timerState = this.timers.get(tournamentId);
    if (!timerState) return false;

    timerState.isPaused = true;
    return true;
  }

  resumeTimer(tournamentId: string): boolean {
    const timerState = this.timers.get(tournamentId);
    if (!timerState) return false;

    timerState.isPaused = false;
    return true;
  }

  advanceLevel(tournamentId: string): boolean {
    const timerState = this.timers.get(tournamentId);
    if (!timerState) return false;

    const tournament = this.findTournament(tournamentId);
    if (!tournament) {
      console.error('Tournament not found:', tournamentId);
      return false;
    }

    // Check if we're in a break
    if (timerState.isBreak) {
      this.endBreak(tournamentId);
      return true;
    }

    // Check if we can advance
    if (timerState.currentLevel >= tournament.blindStructure.length) {
      console.error('Cannot advance beyond last level');
      return false;
    }

    timerState.currentLevel++;
    tournament.currentLevel = timerState.currentLevel; // Update tournament's current level
    const newLevel = tournament.blindStructure[timerState.currentLevel - 1];
    timerState.timeRemaining = newLevel.duration * 60;
    return true;
  }

  previousLevel(tournamentId: string): boolean {
    const timerState = this.timers.get(tournamentId);
    if (!timerState) return false;

    // Can't go back from level 1
    if (timerState.currentLevel <= 1) {
      return false;
    }

    const tournament = this.findTournament(tournamentId);
    if (!tournament) return false;

    // If we're in a break, end it
    if (timerState.isBreak) {
      timerState.isBreak = false;
      timerState.breakTimeRemaining = 0;
    }

    timerState.currentLevel--;
    tournament.currentLevel = timerState.currentLevel; // Update tournament's current level
    const newLevel = tournament.blindStructure[timerState.currentLevel - 1];
    timerState.timeRemaining = newLevel.duration * 60;
    return true;
  }

  addTime(tournamentId: string, seconds: number): boolean {
    const timerState = this.timers.get(tournamentId);
    if (!timerState) return false;

    if (timerState.isBreak) {
      timerState.breakTimeRemaining += seconds;
    } else {
      timerState.timeRemaining += seconds;
    }
    return true;
  }

  private handleLevelEnd(tournamentId: string): void {
    const timerState = this.timers.get(tournamentId);
    if (!timerState) return;

    const tournament = this.findTournament(tournamentId);
    if (!tournament) return;

    const nextBreak = tournament.breaks.find(b => b.afterLevel === timerState.currentLevel);
    
    if (nextBreak) {
      this.startBreak(tournamentId, nextBreak.duration);
    } else {
      this.advanceLevel(tournamentId);
    }
  }

  private startBreak(tournamentId: string, duration: number): void {
    const timerState = this.timers.get(tournamentId);
    if (!timerState) return;

    timerState.isBreak = true;
    timerState.breakTimeRemaining = duration * 60; // Convert to seconds
  }

  private endBreak(tournamentId: string): void {
    const timerState = this.timers.get(tournamentId);
    if (!timerState) return;

    timerState.isBreak = false;
    this.advanceLevel(tournamentId);
  }

  getTimerState(tournamentId: string): TimerState | null {
    return this.timers.get(tournamentId) || null;
  }

  stopTimer(tournamentId: string): void {
    const timerState = this.timers.get(tournamentId);
    if (timerState?.timer) {
      clearInterval(timerState.timer);
    }
    this.timers.delete(tournamentId);
  }
}

export const timerService = new TimerService(); 