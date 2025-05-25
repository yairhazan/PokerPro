import {
    PropsWithChildren,
    createContext,
    useContext,
    useEffect,
    useState,
} from "react";
import { getNearestPayoutCount } from "../helpers/payouts";

export type TournamentContextType = {
    state: TournamentData;
    setOnBreak: (state: boolean) => void;
    setPlayerCount: (count: number) => void;
    setPlayersRemaining: (count: number) => void;
    setBuyIn: (amount: number) => void;
    setRebuys: (amount: number) => void;
    setPlayerRebuys: (playerId: number, amount: number) => void;
    setPlayerName: (playerId: number, name: string) => void;
    setPayoutCount: (count: number) => void;
    setPayoutPercentages: (percentages: number[]) => void;
    setBlindPreset: (name: string) => void;
    setTournamentLength: (hours: number) => void;
    setRoundLength: (minutes: number) => void;
    setSmallestDenomination: (amount: number) => void;
    setStartingStack: (amount: number) => void;
    setBlinds: (blinds: number[][]) => void;
    setRestBreaks: (breaks: RestBreak[]) => void;
    setCurrentRound: (amount: number) => void;
};

export const TournamentContext = createContext<TournamentContextType | null>(
    null
);

export function useTournament() {
    const context = useContext(TournamentContext);
    if (context === null) {
        throw new Error(
            "useTournament must be used within a TournamentProvider"
        );
    }
    return context;
}

function TournamentProvider({ children }: PropsWithChildren) {
    const [onBreak, setOnBreak] = useState<boolean>(false);
    const [playerCount, setPlayerCount] = useState<number>(10);
    const [playersRemaining, setPlayersRemaining] = useState<number>(10);
    const [buyIn, setBuyIn] = useState<number>(20);
    const [rebuys, setRebuys] = useState<number>(0);
    const [playerRebuys, setPlayerRebuys] = useState<number[]>(Array(playerCount).fill(0));
    const [playerNames, setPlayerNames] = useState<string[]>(Array(playerCount).fill(""));
    const [currentRound, setCurrentRound] = useState<number>(0);

    const [payoutCount, setPayoutCount] = useState<number>(3);
    const [payoutPercentages, setPayoutPercentages] = useState<number[]>([]);
    const [totalPayout, setTotalPayout] = useState<number>(0);

    const [blindPreset, setBlindPreset] = useState<string>("shortstack-4hr/15min");
    const [tournamentLength, setTournamentLength] = useState<number>(0);
    const [roundLength, setRoundLength] = useState<number>(0);
    const [smallestDenomination, setSmallestDenomination] = useState<number>(0);
    const [startingStack, setStartingStack] = useState<number>(0);
    const [blinds, setBlinds] = useState<number[][]>([
        [],
    ]);
    const [restBreaks, setRestBreaks] = useState<RestBreak[]>([]);

    useEffect(() => {
        setTotalPayout(buyIn * (playerCount + rebuys));
    }, [playerCount, buyIn, rebuys]);

    useEffect(() => {
        setPlayerRebuys(Array(playerCount).fill(0));
        setPlayerNames(Array(playerCount).fill(""));
    }, [playerCount]);

    const setPlayerRebuysHandler = (playerId: number, amount: number) => {
        const newPlayerRebuys = [...playerRebuys];
        newPlayerRebuys[playerId] = amount;
        setPlayerRebuys(newPlayerRebuys);
        setRebuys(newPlayerRebuys.reduce((sum, val) => sum + val, 0));
    };

    const setPlayerNameHandler = (playerId: number, name: string) => {
        const newPlayerNames = [...playerNames];
        newPlayerNames[playerId] = name;
        setPlayerNames(newPlayerNames);
    };

    const payoutStructure: PayoutStructure = {
        count: payoutCount,
        percentages: payoutPercentages,
        total: totalPayout,
    };

    const blindStructure: BlindStructure = {
        preset: blindPreset,
        playerCount,
        tournamentLength,
        roundLength,
        smallestDenomination,
        startingStack,
        structure: blinds,
        restBreaks,
    };

    const tournamentData: TournamentData = {
        onBreak,
        playerCount,
        playersRemaining,
        buyIn,
        rebuys,
        playerRebuys,
        playerNames,
        payoutStructure,
        blindStructure,
        currentRound,
    };

    const value: TournamentContextType = {
        state: tournamentData,
        setOnBreak: (state: boolean) => {
            setOnBreak(state);
        },
        setPlayerCount: (count: number) => {
            setPlayerCount(count);
        },
        setPlayersRemaining: (count: number) => {
            setPlayersRemaining(count);
        },
        setBuyIn: (amount: number) => {
            setBuyIn(amount);
        },
        setRebuys: (amount: number) => {
            setRebuys(amount);
        },
        setPlayerRebuys: setPlayerRebuysHandler,
        setPlayerName: setPlayerNameHandler,
        setPayoutCount: (amount: number) => {
            setPayoutCount(getNearestPayoutCount(amount));
        },
        setPayoutPercentages: (percentages: number[]) => {
            setPayoutPercentages(percentages);
        },
        setBlindPreset: (name: string) => {
            setBlindPreset(name);
        },
        setTournamentLength: (hours: number) => {
            setTournamentLength(hours);
        },
        setRoundLength: (minutes: number) => {
            setRoundLength(minutes);
        },
        setSmallestDenomination: (amount: number) => {
            setSmallestDenomination(amount);
        },
        setStartingStack: (amount: number) => {
            setStartingStack(amount);
        },
        setBlinds: (blinds: number[][]) => {
            setBlinds(blinds);
        },
        setRestBreaks: (breaks: RestBreak[]) => {
            setRestBreaks(breaks);
        },
        setCurrentRound: (round: number) => {
            setCurrentRound(round);
        }
    };

    return (
        <TournamentContext.Provider value={value}>
            {children}
        </TournamentContext.Provider>
    );
}

export default TournamentProvider;
