import { useState } from "react";
import { useTournament } from "../providers/TournamentProvider";

type Preset = {
    name: string;
    roundLength: number;
    tournamentLength: number;
    startingStack: number;
    startingSmallBlind: number;
    startingBigBlind: number;
    startingAnte: number;
    blindMultiplier: number;
    anteStartLevel: number;
    breakTimes: {
        minutesIn: number;
        breakLength: number;
    }[];
};

const DEFAULT_PRESETS: Preset[] = [
    {
        name: "Quick Tournament",
        roundLength: 15,
        tournamentLength: 2,
        startingStack: 5000,
        startingSmallBlind: 25,
        startingBigBlind: 50,
        startingAnte: 0,
        blindMultiplier: 1.5,
        anteStartLevel: 3,
        breakTimes: [
            { minutesIn: 60, breakLength: 5 },
            { minutesIn: 120, breakLength: 10 },
        ],
    },
    {
        name: "Standard Tournament",
        roundLength: 20,
        tournamentLength: 4,
        startingStack: 10000,
        startingSmallBlind: 25,
        startingBigBlind: 50,
        startingAnte: 0,
        blindMultiplier: 1.4,
        anteStartLevel: 4,
        breakTimes: [
            { minutesIn: 60, breakLength: 5 },
            { minutesIn: 120, breakLength: 10 },
            { minutesIn: 180, breakLength: 15 },
        ],
    },
    {
        name: "Deep Stack",
        roundLength: 30,
        tournamentLength: 6,
        startingStack: 20000,
        startingSmallBlind: 25,
        startingBigBlind: 50,
        startingAnte: 0,
        blindMultiplier: 1.3,
        anteStartLevel: 5,
        breakTimes: [
            { minutesIn: 90, breakLength: 10 },
            { minutesIn: 180, breakLength: 15 },
            { minutesIn: 270, breakLength: 20 },
        ],
    },
];

type BlindStructurePresetsProps = {
    onPresetSelect: (preset: Preset) => void;
    currentSettings: Omit<Preset, "name">;
};

function BlindStructurePresets({ onPresetSelect, currentSettings }: BlindStructurePresetsProps) {
    const [presets, setPresets] = useState<Preset[]>(() => {
        const savedPresets = localStorage.getItem("blindStructurePresets");
        return savedPresets ? JSON.parse(savedPresets) : DEFAULT_PRESETS;
    });
    const [isSaving, setIsSaving] = useState(false);
    const [newPresetName, setNewPresetName] = useState("");

    const handleSavePreset = () => {
        if (!newPresetName.trim()) return;

        const newPreset: Preset = {
            name: newPresetName.trim(),
            ...currentSettings,
        };

        const updatedPresets = [...presets, newPreset];
        setPresets(updatedPresets);
        localStorage.setItem("blindStructurePresets", JSON.stringify(updatedPresets));
        setNewPresetName("");
        setIsSaving(false);
    };

    const handleDeletePreset = (index: number) => {
        const updatedPresets = presets.filter((_, i) => i !== index);
        setPresets(updatedPresets);
        localStorage.setItem("blindStructurePresets", JSON.stringify(updatedPresets));
    };

    return (
        <div className="bg-neutral-800 rounded-lg p-4">
            <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold">Presets</h3>
                {!isSaving ? (
                    <button
                        onClick={() => setIsSaving(true)}
                        className="px-3 py-1 bg-blue-500 hover:bg-blue-600 rounded-md text-sm"
                    >
                        Save Current as Preset
                    </button>
                ) : (
                    <div className="flex gap-2">
                        <input
                            type="text"
                            value={newPresetName}
                            onChange={(e) => setNewPresetName(e.target.value)}
                            placeholder="Preset name"
                            className="bg-neutral-700 px-2 py-1 rounded-md text-sm"
                        />
                        <button
                            onClick={handleSavePreset}
                            disabled={!newPresetName.trim()}
                            className="px-3 py-1 bg-blue-500 hover:bg-blue-600 rounded-md text-sm disabled:opacity-50"
                        >
                            Save
                        </button>
                        <button
                            onClick={() => {
                                setIsSaving(false);
                                setNewPresetName("");
                            }}
                            className="px-3 py-1 bg-neutral-600 hover:bg-neutral-700 rounded-md text-sm"
                        >
                            Cancel
                        </button>
                    </div>
                )}
            </div>
            <div className="grid grid-cols-1 gap-2">
                {presets.map((preset, index) => (
                    <div
                        key={index}
                        className="flex items-center justify-between bg-neutral-700 p-2 rounded-md"
                    >
                        <button
                            onClick={() => onPresetSelect(preset)}
                            className="flex-1 text-left hover:text-blue-400"
                        >
                            {preset.name}
                        </button>
                        <button
                            onClick={() => handleDeletePreset(index)}
                            className="text-red-400 hover:text-red-300 px-2"
                        >
                            ×
                        </button>
                    </div>
                ))}
            </div>
        </div>
    );
}

export default BlindStructurePresets; 