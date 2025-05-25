import { ChangeEvent } from "react";
import CountInput from "./CountInput";
import CurrencyInput from "./CurrencyInput";
import TextInput from "./TextInput";

type InputType = {
    type?: string;
    value?: string;
    onChange?: (e: ChangeEvent<HTMLInputElement>) => void;
    unit?: string;
    min?: number;
    max?: number;
    step?: number;
};

function Input({ type, value, onChange, unit, min, max, step }: InputType) {
    function getInput() {
        switch (type) {
            case "currency":
                return (
                    <CurrencyInput
                        value={value}
                        onChange={onChange}
                    />
                );
            case "count":
                return (
                    <CountInput
                        step={step || 1}
                        unit={unit}
                        value={value}
                        onChange={onChange}
                        min={min}
                        max={max}
                    />
                );
            case "float":
                return (
                    <CountInput
                        step={step || 0.01}
                        unit={unit}
                        value={value}
                        onChange={onChange}
                        min={min}
                        max={max}
                    />
                );
            default:
                return (
                    <TextInput
                        value={value}
                        onChange={onChange}
                        min={min}
                        max={max}
                        step={step}
                    />
                );
        }
    }

    return <div>{getInput()}</div>;
}

export default Input;
