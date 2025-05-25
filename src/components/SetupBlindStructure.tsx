import { useEffect, useState } from "react";
import { useTournament } from "../providers/TournamentProvider";
import Input from "./Input/Input";
import Table from "./Table";
import BlindStructurePresets from "./BlindStructurePresets";

type BreakTime = {
    minutesIn: number;
    breakLength: number;
};

function SetupBlindStructure() {
    const tournament = useTournament();
    const [tournamentLength, setTournamentLength] = useState<number>(4);
    const [startingStack, setStartingStack] = useState<number>(10000);
    const [startingSmallBlind, setStartingSmallBlind] = useState<number>(25);
    const [startingBigBlind, setStartingBigBlind] = useState<number>(50);
    const [startingAnte, setStartingAnte] = useState<number>(0);
    const [anteStartLevel, setAnteStartLevel] = useState<number>(4);
    const [blindMultiplier, setBlindMultiplier] = useState<number>(Number(1.5));
    const [breakTimes, setBreakTimes] = useState<BreakTime[]>([
        { minutesIn: 60, breakLength: 5 },
        { minutesIn: 120, breakLength: 10 },
        { minutesIn: 180, breakLength: 15 },
    ]);
    const [blindStructure, setBlindStructure] = useState<number[][]>([]);
    const [tournamentLengthInput, setTournamentLengthInput] = useState<string>(tournamentLength.toString());
    const [roundLengthInput, setRoundLengthInput] = useState<string>(tournament.state.roundLengthInput);

    useEffect(() => {
        calculateAndSetBlindStructure();
    }, [
        tournament.state.roundLengthInput,
        tournamentLength,
        startingStack,
        startingSmallBlind,
        startingBigBlind,
        startingAnte,
        blindMultiplier,
        anteStartLevel,
    ]);

    useEffect(() => {
        setTournamentLengthInput(tournamentLength.toString());
    }, [tournamentLength]);

    useEffect(() => {
        setRoundLengthInput(tournament.state.roundLengthInput);
    }, [tournament.state.roundLengthInput]);

    const calculateAndSetBlindStructure = () => {
        const totalMinutes = tournamentLength * 60;
        const roundLength = Number(tournament.state.roundLengthInput);
        const rounds = Math.ceil(totalMinutes / roundLength);
        const newBlindStructure: number[][] = [];

        let currentSmallBlind = startingSmallBlind;
        let currentBigBlind = startingBigBlind;
        let currentAnte = startingAnte;
        const chips = tournament.state.chips;
        let chipIndex = 0;
        let currentSmallestChip = chips[chipIndex]?.value || 1;

        for (let i = 0; i < rounds; i++) {
            const level = i + 1;
            const ante = level >= anteStartLevel ? currentSmallBlind : 0;
            newBlindStructure.push([currentSmallBlind, currentBigBlind, ante]);

            // Calculate next small blind
            let nextBlind = currentSmallBlind * blindMultiplier;
            const magnitude = Math.pow(10, Math.floor(Math.log10(nextBlind)));
            let rounded = Math.round(nextBlind / currentSmallestChip) * currentSmallestChip;
            if (rounded < magnitude / 2) rounded = magnitude / 2;
            if (rounded > magnitude * 10) rounded = magnitude * 10;
            if (rounded <= currentSmallBlind) rounded = currentSmallBlind + currentSmallestChip;

            // Promote chip if needed for next level
            if (chipIndex < chips.length - 1 && currentSmallestChip < rounded / 5) {
                chipIndex++;
                currentSmallestChip = chips[chipIndex].value;
            }

            currentSmallBlind = rounded;
            currentBigBlind = currentSmallBlind * 2;
        }

        setBlindStructure(newBlindStructure);
        tournament.setBlinds(newBlindStructure);
        tournament.setTournamentLength(tournamentLength);
        tournament.setStartingStack(startingStack);
        tournament.setRestBreaks(breakTimes);
    };

    const handleBreakTimeChange = (index: number, field: keyof BreakTime, value: number) => {
        const newBreakTimes = [...breakTimes];
        newBreakTimes[index] = { ...newBreakTimes[index], [field]: value };
        setBreakTimes(newBreakTimes);
        tournament.setRestBreaks(newBreakTimes);
    };

    const formatTime = (minutes: number) => {
        const hours = Math.floor(minutes / 60);
        const mins = minutes % 60;
        return `${hours}:${mins.toString().padStart(2, '0')}`;
    };

    const handlePresetSelect = (preset: any) => {
        setTournamentLength(preset.tournamentLength);
        setStartingStack(preset.startingStack);
        setStartingSmallBlind(preset.startingSmallBlind);
        setStartingBigBlind(preset.startingBigBlind);
        setStartingAnte(preset.startingAnte);
        setBlindMultiplier(preset.blindMultiplier || 1.5);
        setAnteStartLevel(preset.anteStartLevel || 4);
        setBreakTimes(preset.breakTimes);
    };

    const tableData = blindStructure.map((level, index) => [
        (index + 1).toString(),
        level[0].toString(),
        level[1].toString(),
        level[2].toString(),
        formatTime(index * Number(tournament.state.roundLengthInput)),
    ]);

    const currentSettings = {
        roundLength: Number(tournament.state.roundLengthInput),
        tournamentLength,
        startingStack,
        startingSmallBlind,
        startingBigBlind,
        startingAnte,
        blindMultiplier,
        anteStartLevel,
        breakTimes,
    };

    return (
        <div className="flex flex-col bg-neutral-900 p-7 rounded-lg">
            <h1 className="mb-5 font-bold text-3xl italic self-center">
                BLIND STRUCTURE
            </h1>
            <div className="grid grid-cols-2 gap-6">
                <div className="flex flex-col gap-4">
                    <div>
                        <div className="opacity-60 mb-2">Round Length (minutes)</div>
                        <input
                            type="number"
                            value={roundLengthInput}
                            onChange={(e) => setRoundLengthInput(e.target.value)}
                            onBlur={() => {
                                const value = parseFloat(roundLengthInput);
                                if (!isNaN(value) && value > 0) {
                                    tournament.validateAndUpdateRoundLength(roundLengthInput);
                                } else {
                                    setRoundLengthInput(tournament.state.roundLengthInput);
                                }
                            }}
                            min={0.5}
                            max={60}
                            step={0.5}
                            placeholder="e.g. 0.5 for 30 seconds"
                            className="block border-0 bg-neutral-800 py-1.5 pl-3 rounded-md w-full text-white placeholder:text-gray-400"
                        />
                    </div>
                    <div>
                        <div className="opacity-60 mb-2">Tournament Length (hours)</div>
                        <Input
                            type="number"
                            value={tournamentLengthInput}
                            onChange={(e) => {
                                const value = e.target.value;
                                setTournamentLengthInput(value);
                                if (value === "" || isNaN(Number(value)) || Number(value) <= 0) {
                                    return;
                                }
                                setTournamentLength(Number(value));
                            }}
                            min={1}
                            max={12}
                        />
                    </div>
                    <div>
                        <div className="opacity-60 mb-2">Starting Stack</div>
                        <Input
                            type="number"
                            value={startingStack.toString()}
                            onChange={(e) => setStartingStack(Number(e.target.value))}
                            min={1000}
                            step={1000}
                        />
                    </div>
                </div>
                <div className="flex flex-col gap-4">
                    <div>
                        <div className="opacity-60 mb-2">Starting Small Blind</div>
                        <Input
                            type="number"
                            value={startingSmallBlind.toString()}
                            onChange={(e) => setStartingSmallBlind(Number(e.target.value))}
                            min={5}
                            step={5}
                        />
                    </div>
                    <div>
                        <div className="opacity-60 mb-2">Starting Big Blind</div>
                        <Input
                            type="number"
                            value={startingBigBlind.toString()}
                            onChange={(e) => setStartingBigBlind(Number(e.target.value))}
                            min={10}
                            step={5}
                        />
                    </div>
                    <div>
                        <div className="opacity-60 mb-2">Ante Start Level</div>
                        <Input
                            type="number"
                            value={anteStartLevel.toString()}
                            onChange={(e) => setAnteStartLevel(Number(e.target.value))}
                            min={1}
                            step={1}
                        />
                    </div>
                </div>
            </div>

            <div className="mt-6">
                <div className="bg-neutral-800 p-4 rounded-lg">
                    <div className="opacity-60 mb-2">Blind Level Multiplier</div>
                    <div className="flex items-center gap-4">
                        <Input
                            type="float"
                            value={blindMultiplier.toString()}
                            onChange={(e) => setBlindMultiplier(Number(e.target.value))}
                            min={1.1}
                            max={2}
                            step={0.1}
                        />
                        <div className="text-sm opacity-60">
                            This multiplier will be applied to blinds each level
                        </div>
                    </div>
                </div>
            </div>

            <div className="mt-6">
                <h2 className="text-xl font-semibold mb-4">Break Times</h2>
                <div className="grid grid-cols-3 gap-4">
                    {breakTimes.map((breakTime, index) => (
                        <div key={index} className="bg-neutral-800 p-4 rounded-lg">
                            <div className="opacity-60 mb-2">Break {index + 1}</div>
                            <div className="flex flex-col gap-2">
                                <div>
                                    <div className="text-sm opacity-60">After (minutes)</div>
                                    <Input
                                        type="number"
                                        value={breakTime.minutesIn.toString()}
                                        onChange={(e) => handleBreakTimeChange(index, 'minutesIn', Number(e.target.value))}
                                        min={30}
                                        step={30}
                                    />
                                </div>
                                <div>
                                    <div className="text-sm opacity-60">Duration (minutes)</div>
                                    <Input
                                        type="number"
                                        value={breakTime.breakLength.toString()}
                                        onChange={(e) => handleBreakTimeChange(index, 'breakLength', Number(e.target.value))}
                                        min={5}
                                        step={5}
                                    />
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            <div className="mt-6">
                <h2 className="text-xl font-semibold mb-4">Blind Structure Preview</h2>
                <div className="bg-neutral-800 rounded-lg p-4">
                    <Table
                        headers={["Level", "Small Blind", "Big Blind", "Ante", "Time"]}
                        data={tableData}
                        config={{
                            headerAlignment: ["text-center", "text-right", "text-right", "text-right", "text-right"],
                            dataAlignment: ["text-center", "text-right", "text-right", "text-right", "text-right"],
                        }}
                    />
                </div>
            </div>

            <div className="mt-6">
                <BlindStructurePresets
                    onPresetSelect={handlePresetSelect}
                    currentSettings={currentSettings}
                />
            </div>
        </div>
    );
}

export default SetupBlindStructure;
