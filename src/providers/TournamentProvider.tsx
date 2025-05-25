import {
    PropsWithChildren,
    createContext,
    useContext,
    useEffect,
    useState,
} from "react";
import { getNearestPayoutCount } from "../helpers/payouts";
import { ChipType } from "../components/ChipsPreview";

const BASIC_COLORS = [
    { name: "White", value: "#fff", border: "border-gray-300" },
    { name: "Red", value: "#e53e3e", border: "border-red-700" },
    { name: "Green", value: "#38a169", border: "border-green-700" },
    { name: "Black", value: "#222", border: "border-black" },
    { name: "Blue", value: "#3182ce", border: "border-blue-700" },
    { name: "Yellow", value: "#ecc94b", border: "border-yellow-500" },
    { name: "Purple", value: "#805ad5", border: "border-purple-700" },
    { name: "Orange", value: "#ed8936", border: "border-orange-700" },
];

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
    setChipCount: (count: number) => void;
    setChipValue: (index: number, value: number) => void;
    setChipColor: (index: number, color: string, colorName: string) => void;
    setRoundLengthInput: (value: string) => void;
    validateAndUpdateRoundLength: (value: string) => void;
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

export type TournamentData = {
    onBreak: boolean;
    playerCount: number;
    playersRemaining: number;
    buyIn: number;
    rebuys: number;
    playerRebuys: number[];
    playerNames: string[];
    payoutStructure: PayoutStructure;
    blindStructure: BlindStructure;
    currentRound: number;
    chips: ChipType[];
    chipCount: number;
    roundLengthInput: string;
};

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
    const [roundLength, setRoundLength] = useState<number>(1);
    const [smallestDenomination, setSmallestDenomination] = useState<number>(0);
    const [startingStack, setStartingStack] = useState<number>(0);
    const [blinds, setBlinds] = useState<number[][]>([
        [],
    ]);
    const [restBreaks, setRestBreaks] = useState<RestBreak[]>([]);

    // Chip state
    const [chipCount, setChipCount] = useState<number>(4);
    const [chips, setChips] = useState<ChipType[]>([
        { color: "#fff", colorName: "White", value: 1 },
        { color: "#e53e3e", colorName: "Red", value: 5 },
        { color: "#38a169", colorName: "Green", value: 25 },
        { color: "#222", colorName: "Black", value: 100 },
    ]);

    const [roundLengthInput, setRoundLengthInput] = useState<string>(roundLength.toString());

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
        chips,
        chipCount,
        roundLengthInput,
    };

    // Get the next order of magnitude value
    const getNextOrderOfMagnitude = (value: number) => {
        const magnitude = Math.floor(Math.log10(value));
        return Math.pow(10, magnitude + 1);
    };

    // Check and update lowest chip value if needed
    // const updateLowestChipValue = (currentBlinds: number[]) => {
    //     if (!currentBlinds.length) return;
    //     const smallBlind = currentBlinds[0];
    //     setChips(prev => {
    //         const newChips = [...prev];
    //         const maxChipValue = Math.max(...newChips.map(chip => chip.value));
    //         // Only update if lowest chip is worth less than half the small blind
    //         if (newChips[0].value < smallBlind / 5) {
    //             // Set the lowest chip to the next order of magnitude of the highest chip
    //             newChips[0] = {
    //                 ...newChips[0],
    //                 value: getNextOrderOfMagnitude(maxChipValue)
    //             };
    //         }
    //         return newChips;
    //     });
    // };

    // Update chip values when blind level changes
    // useEffect(() => {
    //     if (blinds.length > 0 && currentRound < blinds.length) {
    //         const currentBlinds = blinds[currentRound];
    //         updateLowestChipValue(currentBlinds);
    //     }
    // }, [currentRound, blinds]);

    // Initialize lowest chip value when blind structure is set
    useEffect(() => {
        if (blinds.length > 0) {
            const initialBlinds = blinds[0];
            const smallBlind = initialBlinds[0];
            setChips(prev => {
                const newChips = [...prev];
                // Set lowest chip to small blind value
                newChips[0] = {
                    ...newChips[0],
                    value: smallBlind
                };
                return newChips;
            });
        }
    }, [blinds]);

    // Validate and update round length
    const validateAndUpdateRoundLength = (value: string) => {
        const numValue = parseFloat(value);
        if (isNaN(numValue) || numValue <= 0) {
            setRoundLengthInput(roundLength.toString());
            return;
        }
        setRoundLength(numValue);
        setRoundLengthInput(numValue.toString());
    };

    const value: TournamentContextType = {
        state: {
            ...tournamentData,
            roundLengthInput, // Add to state for components to access
        },
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
            if (minutes <= 0) return; // Prevent invalid values
            setRoundLength(minutes);
            setRoundLengthInput(minutes.toString());
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
        },
        setChipCount: (count: number) => {
            setChipCount(count);
            setChips(prev => {
                if (count > prev.length) {
                    // Add new chips with default color/value
                    const nextColor = BASIC_COLORS[(prev.length) % BASIC_COLORS.length];
                    const maxValue = Math.max(...prev.map(chip => chip.value));
                    
                    // Calculate a convenient next value based on the current structure
                    const nextValue = maxValue * 4; // Using 4x instead of 5x for more convenient values
                    
                    return [
                        ...prev,
                        ...Array(count - prev.length).fill(0).map((_, i) => ({
                            color: nextColor.value,
                            colorName: nextColor.name,
                            value: nextValue,
                        })),
                    ];
                } else {
                    return prev.slice(0, count);
                }
            });
        },
        setChipValue: (index: number, value: number) => {
            setChips(prev => prev.map((chip, i) => 
                i === index ? { ...chip, value } : chip
            ));
        },
        setChipColor: (index: number, color: string, colorName: string) => {
            setChips(prev => prev.map((chip, i) => 
                i === index ? { ...chip, color, colorName } : chip
            ));
        },
        setRoundLengthInput: (value: string) => {
            setRoundLengthInput(value);
        },
        validateAndUpdateRoundLength,
    };

    return (
        <TournamentContext.Provider value={value}>
            {children}
        </TournamentContext.Provider>
    );
}

export default TournamentProvider;
