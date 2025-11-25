import React, { useState } from 'react';
import { useGameStore } from '../game/state';
import { Heart, Zap, Coins, Activity, Shield, Gauge, ChevronUp, ChevronDown } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function HUD() {
    const { hp, maxHp, scrap, wave, level, xp, maxXp, wagonCount, maxWagonCount, speed, gear, waveTimer, waveDuration } = useGameStore();
    const [isVisible, setIsVisible] = useState(true);

    const hpPct = (hp / maxHp) * 100;
    const xpPct = (xp / maxXp) * 100;

    // Calculate speed percentage for the gauge (assuming max speed ~5)
    const speedPct = Math.min(100, Math.abs(speed) / 5 * 100);

    return (
        <div className="absolute top-0 left-0 w-full p-4 pointer-events-none flex flex-col items-center z-40">
            {/* Toggle Button */}
            <button
                onClick={() => setIsVisible(!isVisible)}
                className="pointer-events-auto absolute top-4 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-slate-800/50 hover:bg-slate-700 text-slate-400 hover:text-white p-1 rounded-b-lg border-x border-b border-slate-700 transition-colors z-50"
            >
                {isVisible ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </button>

            <AnimatePresence>
                {isVisible && (
                    <motion.div
                        initial={{ y: -100, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        exit={{ y: -100, opacity: 0 }}
                        transition={{ type: "spring", stiffness: 300, damping: 30 }}
                        className="bg-slate-900/90 border border-slate-700 rounded-lg p-4 shadow-2xl w-full max-w-5xl flex flex-col gap-3 backdrop-blur-md"
                    >
                        {/* Stats Row */}
                        <div className="flex justify-between items-center border-b border-slate-700 pb-3">

                            {/* Left: Resources */}
                            <div className="flex gap-8">
                                <div className="flex items-center gap-2">
                                    <Coins className="w-5 h-5 text-yellow-400" />
                                    <div>
                                        <div className="text-[10px] text-slate-500 font-bold tracking-widest">SCRAP</div>
                                        <div className="text-2xl font-black text-yellow-400 leading-none drop-shadow-lg">{Math.floor(scrap)}</div>
                                    </div>
                                </div>
                                <div className="flex items-center gap-2">
                                    <Zap className="w-5 h-5 text-purple-400" />
                                    <div>
                                        <div className="text-[10px] text-slate-500 font-bold tracking-widest">LEVEL</div>
                                        <div className="text-2xl font-black text-purple-400 leading-none drop-shadow-lg">{level}</div>
                                    </div>
                                </div>
                            </div>

                            {/* Center: Speedometer & Title */}
                            <div className="flex flex-col items-center">
                                <div className="text-slate-700 font-bold text-xs tracking-[0.3em] mb-2">ARMORED TRAIN COMMAND</div>
                                <div className="flex items-center gap-4 bg-slate-950/50 px-4 py-1 rounded-full border border-slate-800">
                                    <Gauge className={`w-4 h-4 ${speed > 0 ? 'text-green-400' : speed < 0 ? 'text-red-400' : 'text-slate-500'}`} />
                                    <div className="flex gap-1">
                                        {[-1, 0, 1, 2, 3].map(g => (
                                            <div
                                                key={g}
                                                className={`w-2 h-4 rounded-sm transition-colors ${gear === g
                                                    ? (g === 0 ? 'bg-slate-400' : g < 0 ? 'bg-red-500' : 'bg-green-500')
                                                    : 'bg-slate-800'
                                                    }`}
                                            />
                                        ))}
                                    </div>
                                    <div className="text-xs font-mono font-bold text-slate-300 w-12 text-right">
                                        {Math.abs(speed).toFixed(1)} <span className="text-slate-600">KM/H</span>
                                    </div>
                                </div>
                            </div>

                            {/* Right: Status */}
                            <div className="flex gap-8 text-right">
                                <div className="flex items-center gap-2 flex-row-reverse">
                                    <Heart className="w-5 h-5 text-red-400" />
                                    <div>
                                        <div className="text-[10px] text-slate-500 font-bold tracking-widest">INTEGRITY</div>
                                        <div className="text-2xl font-black text-red-400 leading-none drop-shadow-lg">{Math.floor(hp)}%</div>
                                    </div>
                                </div>
                                <div className="flex items-center gap-2 flex-row-reverse">
                                    <Activity className="w-5 h-5 text-blue-400" />
                                    <div>
                                        <div className="text-[10px] text-slate-500 font-bold tracking-widest">CARS</div>
                                        <div className="text-2xl font-black text-blue-400 leading-none drop-shadow-lg">
                                            {wagonCount}<span className="text-base text-slate-600">/</span><span className="text-base text-slate-600">{maxWagonCount}</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Bars Row */}
                        <div className="flex flex-col gap-1">
                            {/* XP Bar */}
                            <div className="w-full h-3 bg-slate-950 rounded-full overflow-hidden border border-slate-800 relative">
                                <div
                                    className="h-full bg-gradient-to-r from-purple-800 to-purple-500 transition-all duration-300"
                                    style={{ width: `${xpPct}%` }}
                                />
                                <div className="absolute inset-0 flex items-center justify-center">
                                    <span className="text-[8px] font-bold text-white/30 tracking-widest">XP SEQUENCE</span>
                                </div>
                            </div>

                            {/* Wave Info */}
                            <div className="flex flex-col gap-1 mt-1">
                                <div className="flex justify-between items-end px-2">
                                    <div className="text-[10px] font-bold text-red-500 whitespace-nowrap">WAVE {wave}</div>
                                    <div className="text-[8px] font-bold text-slate-500">{(waveDuration - waveTimer) / 60 | 0}s</div>
                                </div>
                                <div className="w-full h-1 bg-slate-900 rounded-full overflow-hidden">
                                    <div
                                        className="h-full bg-red-600"
                                        style={{ width: `${(waveTimer / waveDuration) * 100}%` }}
                                    />
                                </div>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
