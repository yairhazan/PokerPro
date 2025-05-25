import BlindLevelCountdown from "../components/BlindLevelCountdown";
import InGameInfo from "../components/InGameInfo";
import PayoutDisplay from "../components/PayoutDisplay";
import PlayerInfoCard from "../components/PlayerInfoCard";
import ChipsManager from "../components/ChipsManager";
import { sequentialArray } from "../helpers/helpers";
import { useTournament } from "../providers/TournamentProvider";
import { useState } from "react";
import ChipsPreview from "../components/ChipsPreview";

function InGame() {
    const { state, setChipCount, setChipValue, setCurrentRound } = useTournament();
    const [activeTab, setActiveTab] = useState<"tournament" | "players" | "chips">("tournament");
    const [searchTerm, setSearchTerm] = useState("");
    const [pendingChipPromotion, setPendingChipPromotion] = useState<{ chip: any, nextChips: any[] } | null>(null);
    const [isClockPaused, setIsClockPaused] = useState(false);
    const [pendingBlindAdvance, setPendingBlindAdvance] = useState<number | null>(null);

    // Helper: get sorted chips (lowest value first)
    const sortedChips = [...state.chips].sort((a, b) => a.value - b.value);

    // Handler to request blind advance (from timer or next button)
    const handleRequestBlindAdvance = (nextRound: number, nextSmallBlind: number) => {
        if (sortedChips.length > 1 && sortedChips[0].value < nextSmallBlind / 5) {
            // Find the index of the lowest chip in the original chips array
            const chips = [...state.chips];
            const highestValue = sortedChips[sortedChips.length - 1].value;
            const lowestValue = sortedChips[0].value;
            const lowestIndex = chips.findIndex(chip => chip.value === lowestValue);
            // Prepare new chips array: promote lowest chip to double the highest chip's value
            const promotedChips = [...chips];
            promotedChips[lowestIndex] = { ...promotedChips[lowestIndex], value: highestValue * 2 };
            setPendingChipPromotion({ chip: chips[lowestIndex], nextChips: promotedChips });
            setPendingBlindAdvance(nextRound);
            setIsClockPaused(true);
            return false; // prevent blind advance until confirmed
        }
        // No chip promotion needed, advance blind
        setCurrentRound(nextRound);
        return true;
    };

    // Handler to confirm chip promotion
    const handleConfirmChipPromotion = () => {
        if (pendingChipPromotion) {
            // Find the index of the lowest chip in the current chips array
            const chips = [...state.chips];
            const sortedChips = [...chips].sort((a, b) => a.value - b.value);
            const highestValue = sortedChips[sortedChips.length - 1].value;
            const lowestValue = sortedChips[0].value;
            const lowestIndex = chips.findIndex(chip => chip.value === lowestValue);
            setChipValue(lowestIndex, highestValue * 2);
        }
        if (pendingBlindAdvance !== null) {
            setCurrentRound(pendingBlindAdvance);
        }
        setPendingChipPromotion(null);
        setPendingBlindAdvance(null);
        setIsClockPaused(false);
    };

    // Handler to cancel chip promotion
    const handleCancelChipPromotion = () => {
        setPendingChipPromotion(null);
        setPendingBlindAdvance(null);
        setIsClockPaused(false);
    };

    // Filter players by name or number
    const filteredPlayers = sequentialArray(state.playerCount).filter((val) => {
        const playerNumber = (1 + val).toString();
        const playerName = state.playerNames[val]?.toLowerCase() || "";
        const term = searchTerm.toLowerCase();
        return (
            playerNumber.includes(term) ||
            playerName.includes(term)
        );
    });

    return (
        <div className="flex flex-col w-full h-full">
            {/* Tab Navigation */}
            <div className="flex justify-center bg-neutral-900 border-b border-neutral-800">
                <button
                    className={`px-8 py-3 text-lg font-semibold transition-all focus:outline-none ${
                        activeTab === "tournament"
                            ? "text-blue-400 border-b-4 border-blue-500 bg-neutral-800"
                            : "text-neutral-400 hover:text-blue-300"
                    }`}
                    onClick={() => setActiveTab("tournament")}
                    tabIndex={0}
                    aria-label="Tournament Tab"
                >
                    Tournament
                </button>
                <button
                    className={`px-8 py-3 text-lg font-semibold transition-all focus:outline-none ${
                        activeTab === "players"
                            ? "text-blue-400 border-b-4 border-blue-500 bg-neutral-800"
                            : "text-neutral-400 hover:text-blue-300"
                    }`}
                    onClick={() => setActiveTab("players")}
                    tabIndex={0}
                    aria-label="Players Tab"
                >
                    Players
                </button>
                <button
                    className={`px-8 py-3 text-lg font-semibold transition-all focus:outline-none ${
                        activeTab === "chips"
                            ? "text-blue-400 border-b-4 border-blue-500 bg-neutral-800"
                            : "text-neutral-400 hover:text-blue-300"
                    }`}
                    onClick={() => setActiveTab("chips")}
                    tabIndex={0}
                    aria-label="Chips Tab"
                >
                    Chips
                </button>
            </div>
            {/* Tab Content */}
            {activeTab === "tournament" ? (
                <div className="flex gap-6 w-full h-full">
                    <div className="flex flex-col justify-between gap-6 w-3/4 h-full">
                        <div className="w-full min-h-10 transition-all overflow-hidden">
                            <InGameInfo />
                        </div>
                        {/* Chips Value Preview */}
                        <div className="w-full flex items-center justify-center">
                            <ChipsPreview chips={state.chips} />
                        </div>
                        {/* Chip Promotion Confirmation UI */}
                        {pendingChipPromotion && (
                            <div className="w-full flex flex-col items-center justify-center bg-neutral-800 rounded-lg p-6 mb-4 border-2 border-yellow-500 z-50">
                                <div className="text-xl font-bold mb-2 text-yellow-300">Promote Chip?</div>
                                <div className="mb-4 text-lg">
                                    The lowest chip (<span className="font-mono">{pendingChipPromotion.chip.value}</span>) is now too small for the new blinds.<br />
                                    Remove this chip from play?
                                </div>
                                <div className="flex gap-4">
                                    <button
                                        onClick={handleConfirmChipPromotion}
                                        className="bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded font-semibold focus:outline-none"
                                    >
                                        Confirm
                                    </button>
                                    <button
                                        onClick={handleCancelChipPromotion}
                                        className="bg-red-600 hover:bg-red-700 text-white px-6 py-2 rounded font-semibold focus:outline-none"
                                    >
                                        Cancel
                                    </button>
                                </div>
                                <div className="mt-4">
                                    <span className="text-neutral-400">New chips in play:</span>
                                    <ChipsPreview chips={pendingChipPromotion.nextChips} />
                                </div>
                            </div>
                        )}
                        <div className="flex flex-1 items-center justify-center w-full min-h-10 transition-all overflow-hidden">
                            <BlindLevelCountdown
                                onRequestBlindAdvance={handleRequestBlindAdvance}
                                isClockPaused={isClockPaused}
                            />
                        </div>
                    </div>
                    <div className="w-1/4 h-full overflow-hidden">
                        <PayoutDisplay />
                    </div>
                </div>
            ) : activeTab === "players" ? (
                <div className="flex flex-col items-center w-full h-full flex-1 min-h-0 bg-neutral-900/50 p-8">
                    <div className="w-full max-w-2xl mb-6">
                        <input
                            type="text"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            placeholder="Search players…"
                            className="w-full px-4 py-3 rounded-lg bg-neutral-800 text-white placeholder:text-neutral-400 border border-blue-900 focus:border-blue-500 outline-none text-lg shadow"
                        />
                    </div>
                    <div className="flex-1 h-full min-h-0 w-full overflow-y-auto grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8 justify-center">
                        {filteredPlayers.map((val) => (
                            <PlayerInfoCard 
                                key={val} 
                                name={(1 + val).toString()} 
                                eliminated={false}
                                variant="large"
                                showEliminate={true}
                            />
                        ))}
                    </div>
                </div>
            ) : (
                <ChipsManager />
            )}
        </div>
    );
}

export default InGame;
