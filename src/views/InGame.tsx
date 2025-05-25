import BlindLevelCountdown from "../components/BlindLevelCountdown";
import InGameInfo from "../components/InGameInfo";
import PayoutDisplay from "../components/PayoutDisplay";
import PlayerInfoCard from "../components/PlayerInfoCard";
import { sequentialArray } from "../helpers/helpers";
import { useTournament } from "../providers/TournamentProvider";
import { useState } from "react";

function InGame() {
    const { state } = useTournament();
    const [activeTab, setActiveTab] = useState<"tournament" | "players">("tournament");

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
            </div>
            {/* Tab Content */}
            {activeTab === "tournament" ? (
                <div className="flex gap-6 w-full h-full">
                    <div className="flex flex-col justify-between gap-6 w-3/4 h-full">
                        <div className="w-full min-h-10 transition-all overflow-hidden">
                            <InGameInfo />
                        </div>
                        <div className="overflow-hidden">
                            <BlindLevelCountdown />
                        </div>
                    </div>
                    <div className="w-1/4 h-full overflow-hidden">
                        <PayoutDisplay />
                    </div>
                </div>
            ) : (
                <div className="flex flex-col items-center w-full h-full bg-neutral-900/50 p-8">
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8 w-full justify-center overflow-y-auto">
                        {sequentialArray(state.playerCount).map((val) => (
                            <PlayerInfoCard 
                                key={val} 
                                name={(1 + val).toString()} 
                                eliminated={false}
                                variant="large"
                            />
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}

export default InGame;
