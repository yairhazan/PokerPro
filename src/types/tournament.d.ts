declare type TournamentData = {
    onBreak: boolean;
    playerCount: number;
    playersRemaining: number;
    currentRound: number;
    buyIn: number;
    rebuys: number;
    playerRebuys: number[];
    playerNames: string[];
    payoutStructure: PayoutStructure;
    blindStructure: BlindStructure;
}

declare type PayoutStructure = {
    total: number;
    count: number;
    percentages: number[];
}

declare type BlindStructure = {
    playerCount: number;
    preset: string;
    tournamentLength: number;
    roundLength: number;
    smallestDenomination: number;
    startingStack: number;
    structure: number[][];
    restBreaks: RestBreak[];
};

declare type RestBreak = {
    minutesIn: number;
    breakLength: number;
    customText?: string;
}