import { TimerState, useTimer } from "../hooks/useTimer";
import { useEffect, useState } from "react";
import { useTournament } from "../providers/TournamentProvider";
import {
    BsArrowCounterclockwise,
    BsFillArrowLeftCircleFill,
    BsFillArrowRightCircleFill,
    BsFillVolumeMuteFill,
    BsPauseFill,
    BsPlayFill,
    BsVolumeUpFill,
} from "react-icons/bs";
import Tooltip from "./Tooltip";
import nextRound from "../assets/audio/next_round.wav";
import beep from "../assets/audio/beep.wav";

// Add new props for confirmation and clock control
interface BlindLevelCountdownProps {
    onRequestBlindAdvance?: (nextRound: number, nextSmallBlind: number) => boolean | void;
    isClockPaused?: boolean;
}

function BlindLevelCountdown({ onRequestBlindAdvance, isClockPaused }: BlindLevelCountdownProps) {
    const { state, setCurrentRound, setOnBreak: setTournamentOnBreak } = useTournament();
    const restBreaks = state.blindStructure.restBreaks;

    const [blindLevel, setBlindLevel] = useState<number>(0);

    const [onBreak, setOnBreak] = useState<boolean>(false);
    // const [breakIdx, setBreakIdx] = useState<number>(0);

    const [isMuted, setIsMuted] = useState<boolean>(true);

    const timer = useTimer();
    const breakTimer = useTimer();

    // Pause timer if isClockPaused is true
    useEffect(() => {
        if (isClockPaused) {
            if (timer.state === TimerState.ACTIVE) timer.togglePause();
        } else {
            if (timer.state === TimerState.PAUSED) timer.togglePause();
        }
    }, [isClockPaused]);

    const isBreakIncoming = (idxOffset: number = 0) =>
        restBreaks[getNextBreakIdx() + idxOffset] !== undefined;
    const getNextBreakIdx = () => {
        for (let i = 0; i < restBreaks.length; i++) {
            if (restBreaks[i].minutesIn * 60 * 1000 >= timer.time) {
                return i;
            }
        }
        return restBreaks.length;
    };

    useEffect(()=> {
        setTournamentOnBreak(onBreak);
    }, [onBreak])

    useEffect(() => {
        setCurrentRound(blindLevel);
    }, [blindLevel]);

    useEffect(() => {
        if (!onBreak && isBreakIncoming() && getTimeUntilBreak() === 0) {
            // only start timer if the clock got there on it's own (not by skip buttons)
            if (timer.state !== TimerState.IDLE) breakTimer.togglePause();

            setOnBreak(true);
            timer.setTime(timer.time); // stop timer and set to idle
            return;
        }

        if (timer.state === TimerState.IDLE) return;

        if (getRoundTimeLeft() === 0) {
            if (!isMuted && timer.state === TimerState.ACTIVE) {
                const roundCompleteSound = new Audio(nextRound);
                roundCompleteSound.play();
            }

            // stop timer at end of blind structure
            if (blindLevel === state.blindStructure.structure.length - 1) {
                timer.togglePause();
                return;
            }

            setTimeout(() => {
                const nextRound = blindLevel + 1;
                const nextSmallBlind = state.blindStructure.structure[nextRound]?.[0];
                if (onRequestBlindAdvance) {
                    const shouldAdvance = onRequestBlindAdvance(nextRound, nextSmallBlind);
                    if (shouldAdvance === false) return;
                }
                setBlindLevel(nextRound);
            }, 1000);
        } else if (!isMuted && getRoundTimeLeft() < 10000) {
            const underTenSound = new Audio(beep);
            underTenSound.play();
        }
    }, [timer.time]);

    useEffect(() => {
        if (!onBreak || !isBreakIncoming()) return;

        if (breakTimer.state === TimerState.IDLE) return;

        if (getBreakTimeLeft() === 0) {
            if (!isMuted && breakTimer.state === TimerState.ACTIVE) {
                const roundCompleteSound = new Audio(nextRound);
                roundCompleteSound.play();
            }

            setTimeout(() => {
                breakTimer.reset();
                setOnBreak(false);
                timer.togglePause();
            }, 1000);
        } else if (!isMuted && getBreakTimeLeft() < 10000) {
            const underTenSound = new Audio(beep);
            underTenSound.play();
        }
    }, [breakTimer, onBreak]);

    const getRoundTimeLeft = () => {
        const roundLengthMs = state.blindStructure.roundLength * 60 * 1000;

        if (timer.state === TimerState.IDLE) return roundLengthMs;

        const timeIntoRound = (timer.time % roundLengthMs) + 1000;
        return roundLengthMs - timeIntoRound;
    };

    const getBreakTimeLeft = () => {
        if (!isBreakIncoming()) return 100000000;
        const breakLengthMs =
            restBreaks[getNextBreakIdx()].breakLength * 60 * 1000;
        if (breakTimer.state === TimerState.IDLE) return breakLengthMs;
        return breakLengthMs - breakTimer.time;
    };

    const getTimeUntilBreak = (idxOffset: number = 0) => {
        if (!isBreakIncoming(idxOffset)) return 100000000;
        let time =
            restBreaks[getNextBreakIdx() + idxOffset].minutesIn * 60 * 1000 -
            timer.time;
        return time;
    };

    const displayGetTimeUntilBreak = () => {
        let time = getTimeUntilBreak();
        if (time === 0) time = getTimeUntilBreak(1);
        return time - (timer.state === TimerState.IDLE ? 0 : 1000);
    };

    const minutes = (time: number) => {
        return Math.floor(time / (1000 * 60)) % 60;
    };

    const seconds = (time: number) => {
        return Math.round((time / 1000) % 60);
    };
    const hours = (time: number) => {
        return Math.floor(time / (1000 * 60 * 60));
    };

    const padTime = (time: number) => {
        return time < 10 ? `0${time}` : time.toString();
    };

    const convertThousands = (amount: number) => {
        return amount >= 1000 ? `${amount / 1000}k` : amount.toString();
    };

    const getRoundCompletionPercentage = () => {
        const roundTimeSec = getRoundTimeLeft() / 1000;
        const roundLengthSec = state.blindStructure.roundLength * 60;

        const percentage = (roundLengthSec - roundTimeSec) / roundLengthSec;
        return percentage;
    };

    const getBreakCompletionPercentage = () => {
        if (!isBreakIncoming()) return 0;
        return (
            breakTimer.time /
            (1000 * 60) /
            restBreaks[getNextBreakIdx()].breakLength
        );
    };

    return (
        <div className="relative flex flex-col justify-center bg-neutral-900 px-4 py-6 md:px-20 md:p-10 rounded-lg w-full h-full overflow-hidden">
            {/* Background Progress Bar */}
            <div
                className={`top-0 left-1/2 absolute ${
                    onBreak ? "bg-blue-400" : "bg-white"
                } bg-opacity-5 h-full transition-all -translate-x-1/2`}
                style={{
                    width: `${
                        (1 -
                            (onBreak
                                ? getBreakCompletionPercentage()
                                : getRoundCompletionPercentage())) *
                        100
                    }%`,
                }}
            />
            <div className="relative flex flex-col items-center justify-center w-full h-full min-h-[400px]">
                {/* Timer Center */}
                <div className="flex flex-col items-center justify-center flex-1 min-w-[340px] md:min-w-[420px] gap-6 z-10">
                    <div>
                        <h4 className="mb-3 text-2xl text-center text-neutral-600 italic">Next Break</h4>
                        {onBreak ? (
                            <div className="opacity-25 font-mono text-[40px] md:text-[60px] lg:text-[70px] leading-none break-words text-center">Now</div>
                        ) : isBreakIncoming(getTimeUntilBreak() === 0 ? 1 : 0) ? (
                            <div className={`font-mono text-[40px] md:text-[60px] lg:text-[70px] opacity-25 leading-none break-words text-center`}>
                                {padTime(hours(displayGetTimeUntilBreak()))}:{padTime(minutes(displayGetTimeUntilBreak()))}:{padTime(seconds(displayGetTimeUntilBreak()))}
                            </div>
                        ) : (
                            <div className="opacity-25 font-mono text-[40px] md:text-[60px] lg:text-[70px] text-center leading-none break-words">-</div>
                        )}
                    </div>
                    {!onBreak ? (
                        <div className={`font-mono text-[70px] md:text-[120px] lg:text-[180px] xl:text-[200px] leading-none truncate text-center ${getRoundTimeLeft() < 10000 ? "text-red-400" : ""} ${timer.state === TimerState.PAUSED ? "text-neutral-400" : ""}`}
                        >
                            {padTime(minutes(getRoundTimeLeft()))}:{padTime(seconds(getRoundTimeLeft()))}
                        </div>
                    ) : (
                        <div className={`font-mono text-[70px] md:text-[120px] lg:text-[180px] xl:text-[200px] leading-none truncate text-center ${getBreakTimeLeft() < 10000 ? "text-red-400" : "text-blue-400"} ${breakTimer.state === TimerState.PAUSED ? "text-opacity-75" : ""}`}
                        >
                            {padTime(minutes(getBreakTimeLeft()))}:{padTime(seconds(getBreakTimeLeft()))}
                        </div>
                    )}
                    <div className={`font-mono text-[30px] md:text-[50px] lg:text-[70px] opacity-25 leading-none truncate text-center`}>
                        {padTime(hours(timer.time))}:{padTime(minutes(timer.time))}:{padTime(seconds(timer.time))}
                    </div>
                    <div className="flex gap-4 mt-9 flex-wrap justify-center">
                        <Tooltip
                            text={
                                onBreak
                                    ? breakTimer.state !== TimerState.ACTIVE
                                        ? "Pause"
                                        : "Play"
                                    : timer.state !== TimerState.ACTIVE
                                    ? "Pause"
                                    : "Play"
                            }
                            waitTime={500}
                        >
                            <button
                                onClick={
                                    onBreak
                                        ? breakTimer.togglePause
                                        : timer.togglePause
                                }
                                className="relative hover:bg-neutral-800 opacity-50 hover:opacity-100 p-2 rounded-full transition-colors"
                            >
                                {(
                                    onBreak
                                        ? breakTimer.state !== TimerState.ACTIVE
                                        : timer.state !== TimerState.ACTIVE
                                ) ? (
                                    <BsPlayFill size={40} />
                                ) : (
                                    <BsPauseFill size={40} />
                                )}
                            </button>
                        </Tooltip>
                        <Tooltip
                            text={onBreak ? "Reset Break" : "Reset Round"}
                            waitTime={500}
                        >
                            <button
                                onClick={() => {
                                    onBreak
                                        ? breakTimer.reset()
                                        : timer.setTime(
                                              blindLevel *
                                                  state.blindStructure
                                                      .roundLength *
                                                  60 *
                                                  1000
                                          );
                                }}
                                className="relative hover:bg-neutral-800 opacity-50 hover:opacity-100 p-2 rounded-full transition-colors"
                            >
                                <BsArrowCounterclockwise size={40} />
                            </button>
                        </Tooltip>
                        <Tooltip text="Previous Round" waitTime={500}>
                            <button
                                onClick={() => {
                                    const newLevel = Math.max(
                                        0,
                                        blindLevel - 1
                                    );
                                    setBlindLevel(newLevel);
                                    timer.setTime(
                                        newLevel *
                                            state.blindStructure.roundLength *
                                            60 *
                                            1000
                                    );

                                    if (onBreak) {
                                        setOnBreak(false);
                                        breakTimer.setTime(0);
                                    }
                                }}
                                className="relative hover:bg-neutral-800 disabled:opacity-5 disabled:scale-100 active:scale-95 opacity-50 hover:opacity-100 p-2 rounded-full transition-colors"
                                disabled={blindLevel <= 0}
                            >
                                <BsFillArrowLeftCircleFill size={40} />
                            </button>
                        </Tooltip>
                        <Tooltip text="Next Round" waitTime={500}>
                            <button
                                onClick={() => {
                                    if (!onBreak) {
                                        const newLevel = Math.min(
                                            state.blindStructure.structure.length - 1,
                                            blindLevel + 1
                                        );
                                        const nextSmallBlind = state.blindStructure.structure[newLevel]?.[0];
                                        if (onRequestBlindAdvance) {
                                            const shouldAdvance = onRequestBlindAdvance(newLevel, nextSmallBlind);
                                            if (shouldAdvance === false) return;
                                        }
                                        setBlindLevel(newLevel);
                                        timer.setTime(
                                            newLevel *
                                                state.blindStructure.roundLength *
                                                60 *
                                                1000
                                        );
                                    } else {
                                        setOnBreak(false);
                                        breakTimer.reset();
                                    }
                                }}
                                className="relative hover:bg-neutral-800 active:scale-95 opacity-50 disabled:scale-100 hover:opacity-100 disabled:opacity-5 p-2 rounded-full transition-colors"
                                disabled={
                                    blindLevel >=
                                    state.blindStructure.structure.length - 1
                                }
                            >
                                <BsFillArrowRightCircleFill size={40} />
                            </button>
                        </Tooltip>
                        <Tooltip
                            text={isMuted ? "Unmute" : "Mute"}
                            waitTime={500}
                        >
                            <button
                                onClick={() => setIsMuted((prev) => !prev)}
                                className="relative hover:bg-neutral-800 active:scale-95 opacity-50 disabled:scale-100 hover:opacity-100 disabled:opacity-5 p-2 rounded-full transition-colors"
                            >
                                {isMuted ? (
                                    <BsFillVolumeMuteFill size={40} />
                                ) : (
                                    <BsVolumeUpFill size={40} />
                                )}
                            </button>
                        </Tooltip>
                    </div>
                </div>
                {/* Blinds bottom left */}
                <div className="absolute left-0 bottom-0 mb-8 ml-8 flex flex-col items-start gap-2 z-20">
                    <span className="text-2xl text-neutral-600">SB</span>
                    <span className="font-mono text-5xl text-white">{convertThousands(state.blindStructure.structure[blindLevel][0])}</span>
                    <span className="text-2xl text-neutral-600">BB</span>
                    <span className="font-mono text-5xl text-white">{convertThousands(state.blindStructure.structure[blindLevel][1])}</span>
                </div>
                {/* Ante bottom right */}
                <div className="absolute right-0 bottom-0 mb-8 mr-8 flex flex-col items-end gap-2 z-20">
                    <span className="text-2xl text-neutral-600">ANTE</span>
                    <span className="font-mono text-5xl text-white">{convertThousands(state.blindStructure.structure[blindLevel][2])}</span>
                </div>
            </div>
        </div>
    );
}

export default BlindLevelCountdown;
