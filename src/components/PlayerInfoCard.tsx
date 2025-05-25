import { IconContext } from "react-icons";
import { BsXCircle, BsPencilSquare } from "react-icons/bs";
import { useEffect, useState } from "react";
import { useTournament } from "../providers/TournamentProvider";
import IncrementInput from "./IncrementInput";

type Props = {
    name: string;
    eliminated: boolean;
    variant?: "large";
};

function PlayerInfoCard({ name, eliminated, variant }: Props) {
    const { state, setPlayerRebuys, setPlayerName } = useTournament();
    const playerId = parseInt(name) - 1;
    const [cardHover, setCardHover] = useState<boolean>(false);
    const [eliminateButtonHover, setEliminateButtonHover] = useState<boolean>(false);
    const [isEditingName, setIsEditingName] = useState<boolean>(false);

    const handleRebuyChange = (val: number) => {
        setPlayerRebuys(playerId, val);
    };

    const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setPlayerName(playerId, e.target.value);
    };

    const handleNameKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === "Enter") {
            setIsEditingName(false);
        }
    };

    const cardClass = variant === "large"
        ? `relative flex flex-col items-start justify-between min-w-[280px] max-w-[360px] h-[220px] bg-neutral-900 border-2 border-blue-500/60 rounded-2xl shadow-xl px-8 py-6 mx-3 my-4 transition-all duration-150 ` +
          (eliminated ? 'opacity-50 grayscale' : 'hover:border-blue-400')
        : `relative flex flex-col items-start justify-between min-w-[200px] max-w-[260px] h-[140px] bg-neutral-900 border border-blue-900 rounded-lg shadow-sm px-5 py-4 mx-2 my-3 transition-all duration-150 ` +
          (eliminated ? 'opacity-50 grayscale' : 'hover:border-blue-400');

    return (
        <div
            className={cardClass}
            tabIndex={0}
            aria-label={`Player card for ${name}`}
        >
            <div className={variant === "large" ? "flex items-center gap-4 w-full mb-4" : "flex items-center gap-3 w-full mb-2"}>
                <span className={variant === "large" ? "text-lg font-bold text-blue-400 bg-neutral-800 rounded px-3 py-1.5" : "text-sm font-bold text-blue-400 bg-neutral-800 rounded px-2 py-0.5"}>#{name}</span>
                {isEditingName ? (
                    <input
                        type="text"
                        value={state.playerNames[playerId]}
                        onChange={handleNameChange}
                        onKeyDown={handleNameKeyDown}
                        onBlur={() => setIsEditingName(false)}
                        className={variant === "large"
                            ? "bg-neutral-800 border-2 border-blue-500/30 focus:border-blue-500/60 p-3 rounded-xl text-2xl w-56 text-white placeholder-neutral-500 transition-all outline-none"
                            : "bg-neutral-800 border-2 border-blue-500/30 focus:border-blue-500/60 p-2 rounded-lg text-lg w-40 text-white placeholder-neutral-500 transition-all outline-none"
                        }
                        placeholder="Enter name..."
                        autoFocus
                    />
                ) : (
                    <span className={variant === "large" ? "font-semibold text-2xl text-white truncate max-w-[160px] cursor-pointer" : "font-medium text-lg text-white truncate max-w-[110px] cursor-pointer"} title={name} onClick={() => setIsEditingName(true)}>{state.playerNames[playerId] || name}</span>
                )}
            </div>
            <div className={variant === "large" ? "flex flex-col gap-3 w-full" : "flex flex-col gap-2 w-full"}>
                <div className="flex items-center justify-between w-full">
                    <span className={variant === "large" ? "text-base text-gray-400" : "text-xs text-gray-400"}>Re-buys</span>
                </div>
                <IncrementInput
                    label={undefined}
                    min={0}
                    value={state.playerRebuys[playerId]}
                    onSubmit={handleRebuyChange}
                />
            </div>
            {eliminated && (
                <button
                    className="absolute top-2 right-2 text-xs text-red-400 hover:text-red-300 px-1 py-0.5 rounded"
                    aria-label="Eliminate player"
                >
                    ×
                </button>
            )}
        </div>
    );
}

export default PlayerInfoCard;
