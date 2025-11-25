import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { X } from 'lucide-react';

export default function Glossary({ onClose }) {
    const [tab, setTab] = useState('wagons');

    return (
        <div className="absolute inset-0 flex items-center justify-center bg-black/80 backdrop-blur-sm z-50 p-8 pointer-events-auto">
            <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="bg-slate-900 border border-slate-700 w-full max-w-4xl h-[80vh] rounded-xl shadow-2xl flex flex-col overflow-hidden"
            >
                {/* Header */}
                <div className="flex justify-between items-center p-6 border-b border-slate-800 bg-slate-950">
                    <h2 className="text-2xl font-bold tracking-widest text-slate-200">FIELD MANUAL</h2>
                    <button onClick={onClose} className="p-2 hover:bg-slate-800 rounded-full transition-colors">
                        <X className="w-6 h-6 text-slate-400 hover:text-white" />
                    </button>
                </div>

                {/* Tabs */}
                <div className="flex border-b border-slate-800 bg-slate-900">
                    {['wagons', 'threats', 'depots', 'systems'].map(t => (
                        <button
                            key={t}
                            onClick={() => setTab(t)}
                            className={`flex-1 py-4 text-sm font-bold tracking-wider uppercase transition-colors
                ${tab === t ? 'bg-slate-800 text-blue-400 border-b-2 border-blue-400' : 'text-slate-500 hover:text-slate-300'}
              `}
                        >
                            {t}
                        </button>
                    ))}
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto p-8 bg-slate-900/50">
                    {tab === 'wagons' && (
                        <div className="space-y-8">
                            <div>
                                <h3 className="text-slate-500 text-xs font-bold mb-4 uppercase tracking-wider">Offensive Wagons</h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <GlossaryItem icon="🔫" title="GUNNER CAR" tag="COMMON" desc="The workhorse. Fires standard rounds at medium range. Reliable and versatile." />
                                    <GlossaryItem icon="❄️" title="CRYO BEAM" tag="COMMON" desc="Low damage output, but significantly slows enemy movement speed on impact. Essential for crowd control." />
                                    <GlossaryItem icon="🎯" title="SNIPER CAR" tag="RARE" color="text-blue-400" desc="High damage, extreme range, very slow reload. Ideal for taking out Tanks before they reach you." />
                                    <GlossaryItem icon="🔥" title="FLAMER CAR" tag="RARE" color="text-blue-400" desc="Spews short-range flames rapidly. Devastating against Swarmers but requires close range." />
                                    <GlossaryItem icon="⚡" title="TESLA COIL" tag="RARE" color="text-blue-400" desc="Instantly zaps nearby enemies with 100% accuracy. Perfect for fast moving targets like Dashers." />
                                    <GlossaryItem icon="💣" title="HEAVY MORTAR" tag="RARE" color="text-blue-400" desc="Lobs explosive shells over long distances. Deals massive area damage but has flight time." />
                                    <GlossaryItem icon="🛸" title="DRONE BAY" tag="LEGENDARY" color="text-yellow-400" desc="Deploys autonomous drones that orbit the train and intercept enemies." />
                                    <GlossaryItem icon="⚛️" title="OMNI-BATTERY" tag="LEGENDARY" color="text-yellow-400" desc="Advanced tech that fires rapid laser beams in a 360-degree arc." />
                                </div>
                            </div>

                            <div>
                                <h3 className="text-slate-500 text-xs font-bold mb-4 uppercase tracking-wider">Support & Passive</h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <GlossaryItem icon="🏭" title="FABRICATOR" tag="RARE" desc="Buffs the damage of adjacent wagons. Position carefully for maximum effect." />
                                    <GlossaryItem icon="🧊" title="STASIS FIELD" tag="COMMON" desc="Slows down all enemies within a short radius around the wagon." />
                                    <GlossaryItem icon="🚑" title="MEDIC BAY" tag="RARE" desc="Slowly repairs the train's hull over time. Critical for long runs." />
                                    <GlossaryItem icon="🛡️" title="SHIELD CAR" tag="COMMON" desc="Reinforces the train's hull, reducing collision damage taken from all sources." />
                                    <GlossaryItem icon="💰" title="SCRAPPER" tag="COMMON" desc="Contains automated recycling units that generate Scrap periodically." />
                                    <GlossaryItem icon="🌵" title="SPIKE ARMOR" tag="COMMON" desc="Covers the train in spikes, dealing contact damage to any enemy that touches you." />
                                </div>
                            </div>
                        </div>
                    )}
                    {tab === 'threats' && (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <GlossaryItem icon="👹" title="MINI-BOSSES" color="text-red-500" desc="Every 10 waves, a massive Boss will appear. They have unique skills and high HP. Defeat them to spawn a Depot." />
                            <GlossaryItem icon="👾" title="SWARMER" color="text-red-400" desc="Small, fast, and weak. They attack in large swarms to overwhelm defenses. Vulnerable to splash damage." />
                            <GlossaryItem icon="🤖" title="GRUNT" color="text-purple-400" desc="Standard combat unit. Average speed and durability. The most common threat." />
                            <GlossaryItem icon="⚡" title="DASHER" color="text-orange-400" desc="High-speed interceptor. Rushes the train head-on. Prioritize with fast-firing weapons or Tesla." />
                            <GlossaryItem icon="🐢" title="TANK" color="text-green-600" desc="Heavily armored and slow. Deals massive collision damage if it rams you. Use Snipers or Mortars." />
                            <GlossaryItem icon="💥" title="BOOMER" color="text-yellow-400" desc="Unstable unit. Explodes upon death, dealing massive area damage to everything nearby, including the train." />
                            <GlossaryItem icon="✨" title="ELITES" color="text-white" desc="Any enemy has a chance to spawn as an Elite. They glow white, have 2.5x HP, deal double damage, and drop 5x Loot." />
                        </div>
                    )}
                    {tab === 'depots' && (
                        <div className="space-y-4">
                            <div className="bg-slate-800/50 p-4 rounded border border-slate-700 mb-6">
                                <h3 className="text-yellow-400 font-bold mb-2">HOW TO CLAIM</h3>
                                <p className="text-sm text-slate-300">Depots are dropped by Bosses. To claim a Depot, you must <span className="text-white font-bold">build your track directly over it</span>. The train will automatically secure the asset once the track is connected.</p>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <GlossaryItem icon="⚙️" title="GEARBOX" color="text-yellow-400" desc="+1 Max Speed Gear. Allows the train to reach higher top speeds." />
                                <GlossaryItem icon="🚃" title="EXTENDER" color="text-blue-400" desc="+3 Max Wagon Capacity. Essential for building a longer train." />
                                <GlossaryItem icon="♻️" title="RECYCLER" color="text-red-400" desc="Instantly scraps your last wagon for 200 Scrap. Useful for getting rid of early game units." />
                                <GlossaryItem icon="🔧" title="REPAIR STATION" color="text-green-400" desc="Restores 100% Hull and increases Max HP by 50." />
                                <GlossaryItem icon="⚔️" title="ARMORY" color="text-purple-400" desc="Grants a permanent +20% Damage boost to all weapons." />
                                <GlossaryItem icon="☢️" title="REACTOR" color="text-orange-400" desc="Increases the Fire Rate of all wagons by 15%." />
                                <GlossaryItem icon="🛡️" title="SHIELD GEN" color="text-cyan-400" desc="Adds a permanent 50 HP Shield layer that regenerates over time." />
                                <GlossaryItem icon="🧲" title="MAGNET TOWER" color="text-pink-400" desc="Increases Loot Collection Range by 200%." />
                                <GlossaryItem icon="🔩" title="DRILL STATION" color="text-slate-400" desc="Increases Ram Damage by 50. Good for aggressive playstyles." />
                                <GlossaryItem icon="🔬" title="LABORATORY" color="text-teal-400" desc="Immediately grants a random Rare Wagon card." />
                            </div>
                        </div>
                    )}
                    {tab === 'systems' && (
                        <div className="space-y-6">
                            <div>
                                <h3 className="text-xs font-bold text-slate-500 uppercase mb-4">Controls</h3>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="bg-slate-800 p-4 rounded border border-slate-700">
                                        <span className="text-yellow-400 font-bold">W / S</span>
                                        <p className="text-sm text-slate-400 mt-1">Increase / Decrease Throttle Gear.</p>
                                    </div>
                                    <div className="bg-slate-800 p-4 rounded border border-slate-700">
                                        <span className="text-blue-400 font-bold">LMB (HOLD)</span>
                                        <p className="text-sm text-slate-400 mt-1">Drag Nodes to reshape the track.</p>
                                    </div>
                                    <div className="bg-slate-800 p-4 rounded border border-slate-700">
                                        <span className="text-red-400 font-bold">RMB (CLICK)</span>
                                        <p className="text-sm text-slate-400 mt-1">Click Line to Add Node / Click Node to Delete.</p>
                                    </div>
                                    <div className="bg-slate-800 p-4 rounded border border-slate-700">
                                        <span className="text-purple-400 font-bold">SPACEBAR</span>
                                        <p className="text-sm text-slate-400 mt-1">Fire Scrap Salvo (Costs 20 Scrap).</p>
                                    </div>
                                </div>
                            </div>

                            <div>
                                <h3 className="text-xs font-bold text-slate-500 uppercase mb-4">Mechanics</h3>
                                <div className="grid grid-cols-1 gap-4">
                                    <GlossaryItem icon="⭐" title="LEVELING" desc="Picking a card for a wagon you already own upgrades it (Max Level 5). Stats scale with level." />
                                    <GlossaryItem icon="🛤️" title="TRACK PHYSICS" desc="The train follows a continuous spline curve. Adding nodes increases track length and wagon capacity. Expanding the loop area costs Scrap." />
                                    <GlossaryItem icon="💎" title="CRYSTALS" desc="Crystals spawn randomly. They grow through 3 stages over time. Harvesting a fully grown crystal yields massive Scrap." />
                                    <GlossaryItem icon="🧲" title="LOOT & MAGNET" desc="Enemies drop Scrap (Yellow) and XP (Purple). The train has a Magnet Range - you must drive near loot to collect it. Increase range with upgrades." />
                                    <GlossaryItem icon="🐗" title="RAMMING" desc="Running into enemies deals damage to them but hurts your hull. The faster you go, the more damage you deal." />
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </motion.div>
        </div>
    );
}

function GlossaryItem({ icon, title, tag, color = "text-slate-200", desc }) {
    return (
        <div className="bg-slate-800 p-4 rounded-lg flex gap-4 items-start border border-slate-700/50 hover:border-slate-600 transition-colors">
            <div className="text-3xl mt-1">{icon}</div>
            <div>
                <h4 className={`font-bold ${color} flex items-center gap-2`}>
                    {title}
                    {tag && <span className="text-[10px] bg-slate-700 text-slate-300 px-1.5 py-0.5 rounded">{tag}</span>}
                </h4>
                <p className="text-sm text-slate-400 mt-1 leading-relaxed">{desc}</p>
            </div>
        </div>
    );
}
