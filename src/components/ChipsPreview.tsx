import React from "react";

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

export type ChipType = {
  color: string;
  colorName: string;
  value: number;
};

const ChipsPreview = ({ chips }: { chips: ChipType[] }) => (
  <div className="flex flex-row gap-6 items-center justify-center w-full py-2">
    {chips.map((chip, idx) => (
      <div key={idx} className="flex flex-col items-center gap-1 min-w-[60px]">
        <span
          className={`w-8 h-8 rounded-full border-4 ${BASIC_COLORS.find(c => c.value === chip.color)?.border || "border-gray-400"}`}
          style={{ backgroundColor: chip.color }}
          title={chip.colorName}
        />
        <span className="font-bold text-base text-white">{chip.value}</span>
        <span className="text-xs text-gray-400">{chip.colorName}</span>
      </div>
    ))}
  </div>
);

export default ChipsPreview; 