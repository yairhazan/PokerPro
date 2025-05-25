import { useEffect, useState } from "react";
import { BsCaretRightFill } from "react-icons/bs";

type Props = {
    label?: string;
    onSubmit?: (value: number) => void;
    step?: number;
    min?: number;
    max?: number;
    value?: number;
};

function IncrementInput({ label, onSubmit, step = 1, min, max, value: initialValue = 0 }: Props) {
    const [value, setValue] = useState<string>(initialValue.toString());
    const [hover, setHover] = useState<boolean>(false);

    useEffect(() => {
        setValue(initialValue.toString());
    }, [initialValue]);

    function validate(val: number): number {
        val = min !== undefined ? Math.max(min, val) : val;
        val = max !== undefined ? Math.min(max, val) : val;
        return val;
    }

    function validateAndUpdate(newVal: number) {
        newVal = validate(newVal);
        onSubmit && onSubmit(newVal);
        setValue(newVal.toString());
    }

    return (
        <div
            className="flex justify-between items-center w-full"
            onMouseEnter={() => setHover(true)}
            onMouseLeave={() => setHover(false)}
        >
            {label && (
                <label htmlFor={label} className="w-24 text-2xl text-neutral-400 cursor-pointer">
                    {label.split(" ")[0]}
                </label>
            )}
            <form
                className="flex items-center"
                onSubmit={(e) => {
                    e.preventDefault();
                    validateAndUpdate(Number(value));
                }}
            >
                <button
                    type="button"
                    className={`transition-all text-2xl active:-translate-x-1 rotate-180 ${
                        hover ? "opacity-100" : "opacity-0"
                    }`}
                    onClick={() => validateAndUpdate(Number(value) - step)}
                >
                    <BsCaretRightFill />
                </button>
                <input
                    id={label ? label.split(" ")[0] : undefined}
                    type="number"
                    placeholder="-"
                    value={value}
                    onChange={(e) => setValue(e.target.value)}
                    onBlur={() => validateAndUpdate(Number(value))}
                    className={`bg-neutral-700 p-1 rounded-xl w-14 text-2xl text-center transition-all ${
                        hover ? "bg-opacity-100" : "bg-opacity-0"
                    }`}
                />
                <button
                    type="button"
                    className={`transition-all text-2xl active:translate-x-1 ${
                        hover ? "opacity-100" : "opacity-0"
                    }`}
                    onClick={() => validateAndUpdate(Number(value) + step)}
                >
                    <BsCaretRightFill />
                </button>
            </form>
        </div>
    );
}

export default IncrementInput;
