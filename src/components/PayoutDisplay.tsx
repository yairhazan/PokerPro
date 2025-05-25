import { formatCurrency } from "../helpers/format";
import { useTournament } from "../providers/TournamentProvider";
import PrizeTable from "./PrizeTable";
import BlindsTable from "./BlindsTable";
import IncrementInput from "./IncrementInput";

function PayoutDisplay() {
    const { state, setRebuys } = useTournament();

    console.log(state);

    return (
        <div className="flex flex-col justify-between gap-5 bg-neutral-900 p-10 pt-5 rounded-lg h-full overflow-scroll-y">
            <div>
                <div className="flex justify-between items-end mb-4">
                    <h2 className="flex h-full font-bold text-4xl italic">
                        <span>PAYOUTS</span>
                    </h2>
                    <div className="flex flex-col gap-1">
                        <div className="text-right text-neutral-600 text-xl">
                            TOTAL
                        </div>
                        <div className="text-right font-mono text-5xl">
                            {formatCurrency(state.payoutStructure.total)}
                        </div>
                    </div>
                </div>
                <div className="w-full">
                    <PrizeTable
                        playerCount={state.playerCount}
                        buyIn={state.buyIn}
                        rebuyCount={state.rebuys}
                        percentages={state.payoutStructure.percentages}
                        payoutCount={state.payoutStructure.count}
                        compact
                    />
                </div>
            </div>
            <div>
                <h2 className="mb-4 font-bold text-4xl italic">BLINDS</h2>
                <div className="w-full">
                    <BlindsTable
                        blindStructure={state.blindStructure}
                        smallHeaders
                        focus={{
                            rowIdx: state.currentRound,
                            rowsAround: 5,
                        }}
                        compact
                    />
                </div>
            </div>
        </div>
    );
}

export default PayoutDisplay;
