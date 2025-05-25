import { useTournament } from "../providers/TournamentProvider";

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

function ChipsManager() {
  const { state, setChipCount, setChipValue, setChipColor } = useTournament();
  const { chips, chipCount } = state;

  return (
    <div className="flex flex-col items-center w-full h-full p-8">
      <h1 className="mb-8 font-bold text-3xl italic self-center">CHIPS VALUE</h1>
      <div className="mb-8 flex flex-col items-center gap-4 w-full max-w-xl">
        <label className="text-lg font-semibold">Number of chip types</label>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setChipCount(Math.max(3, chipCount - 1))}
            className="w-10 h-10 rounded-lg bg-neutral-800 text-white border border-blue-900 hover:bg-neutral-700 focus:border-blue-500 outline-none text-xl font-bold"
            aria-label="Decrease chip types"
          >
            -
          </button>
          <span className="w-12 text-center text-xl font-bold">{chipCount}</span>
          <button
            onClick={() => setChipCount(Math.min(8, chipCount + 1))}
            className="w-10 h-10 rounded-lg bg-neutral-800 text-white border border-blue-900 hover:bg-neutral-700 focus:border-blue-500 outline-none text-xl font-bold"
            aria-label="Increase chip types"
          >
            +
          </button>
        </div>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8 w-full max-w-4xl mb-10">
        {chips.map((chip, idx) => (
          <div key={idx} className="flex flex-col items-center gap-3 bg-neutral-900 border border-blue-900 rounded-xl p-6 shadow">
            <div className="flex items-center gap-3">
              <span
                className={`w-12 h-12 rounded-full border-4 ${BASIC_COLORS.find(c => c.value === chip.color)?.border || "border-gray-400"}`}
                style={{ backgroundColor: chip.color }}
                title={chip.colorName}
              />
              <select
                value={chip.color}
                onChange={e => {
                  const colorObj = BASIC_COLORS.find(c => c.value === e.target.value) || BASIC_COLORS[0];
                  setChipColor(idx, colorObj.value, colorObj.name);
                }}
                className="ml-2 px-2 py-1 rounded bg-neutral-800 text-white border border-blue-900 focus:border-blue-500"
              >
                {BASIC_COLORS.map((c) => (
                  <option key={c.value} value={c.value}>{c.name}</option>
                ))}
              </select>
            </div>
            <div className="flex flex-col items-center gap-1">
              <label className="text-sm text-gray-400">Value</label>
              <input
                type="number"
                min={1}
                value={chip.value}
                onChange={e => setChipValue(idx, Number(e.target.value))}
                className="w-24 px-3 py-2 rounded-lg bg-neutral-800 text-white border border-blue-900 focus:border-blue-500 outline-none text-lg text-center"
              />
            </div>
          </div>
        ))}
      </div>
      <div className="w-full max-w-2xl">
        <h2 className="text-xl font-semibold mb-4">Preview</h2>
        <div className="flex flex-wrap gap-6 justify-center">
          {chips.map((chip, idx) => (
            <div key={idx} className="flex flex-col items-center gap-2">
              <span
                className={`w-10 h-10 rounded-full border-4 ${BASIC_COLORS.find(c => c.value === chip.color)?.border || "border-gray-400"}`}
                style={{ backgroundColor: chip.color }}
                title={chip.colorName}
              />
              <span className="font-bold text-lg text-white">{chip.value}</span>
              <span className="text-xs text-gray-400">{chip.colorName}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default ChipsManager; 