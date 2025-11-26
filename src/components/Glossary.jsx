import React, { useState, useEffect, useRef } from 'react';
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
                                    <GlossaryItem category="wagon" type="gunner" title="GUNNER CAR" tag="COMMON" desc="The workhorse. Fires standard rounds at medium range. Reliable and versatile." stats="+20% Dmg, +25% Fire Rate" />
                                    <GlossaryItem category="wagon" type="cryo" title="CRYO BEAM" tag="COMMON" desc="Low damage output, but significantly slows enemy movement speed on impact. Essential for crowd control." stats="+20% Dmg, +10% Fire Rate, +10% Range" />
                                    <GlossaryItem category="wagon" type="sniper" title="SNIPER CAR" tag="RARE" color="text-blue-400" desc="High damage, extreme range, very slow reload. Ideal for taking out Tanks before they reach you." stats="+32% Dmg, +10% Fire Rate, +Turn Speed" />
                                    <GlossaryItem category="wagon" type="flame" title="FLAMER CAR" tag="RARE" color="text-blue-400" desc="Spews short-range flames rapidly. Devastating against Swarmers but requires close range." stats="+20% Dmg, +32% Fire Rate, +10% Range" />
                                    <GlossaryItem category="wagon" type="tesla" title="TESLA COIL" tag="RARE" color="text-blue-400" desc="Instantly zaps nearby enemies with 100% accuracy. Perfect for fast moving targets like Dashers." stats="+20% Dmg, +10% Fire Rate, +10% Range" />
                                    <GlossaryItem category="wagon" type="mortar" title="HEAVY MORTAR" tag="RARE" color="text-blue-400" desc="Lobs explosive shells over long distances. Deals massive area damage but has flight time." stats="+20% Dmg, +10% Fire Rate, +15% Range" />
                                    <GlossaryItem category="wagon" type="drone" title="DRONE BAY" tag="LEGENDARY" color="text-yellow-400" desc="Deploys autonomous drones that orbit the train and intercept enemies." stats="+1 Drone Count" />
                                    <GlossaryItem category="wagon" type="railgun" title="OMNI-BATTERY" tag="LEGENDARY" color="text-yellow-400" desc="Advanced tech that fires rapid laser beams in a 360-degree arc." stats="+20% Dmg, +10% Fire Rate" />
                                    <GlossaryItem category="wagon" type="missile" title="MISSILE CAR" tag="RARE" color="text-blue-400" desc="Fires homing rockets that track targets." stats="+38% Dmg, +10% Fire Rate, +10% Range" />
                                    <GlossaryItem category="wagon" type="cluster" title="CLUSTER CAR" tag="LEGENDARY" color="text-yellow-400" desc="Fires a large rocket that splits into mini-rockets on impact." stats="+44% Dmg, +10% Fire Rate" />
                                </div>
                            </div>

                            <div>
                                <h3 className="text-slate-500 text-xs font-bold mb-4 uppercase tracking-wider">Support & Passive</h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <GlossaryItem category="wagon" type="fabricator" title="FABRICATOR" tag="RARE" desc="Buffs the damage of adjacent wagons. Position carefully for maximum effect." stats="+10% Buff Strength" />
                                    <GlossaryItem category="wagon" type="stasis" title="STASIS FIELD" tag="COMMON" desc="Slows down all enemies within a short radius around the wagon." stats="+15% Range, +5% Slow" />
                                    <GlossaryItem category="wagon" type="medic" title="MEDIC BAY" tag="RARE" desc="Slowly repairs the train's hull over time. Critical for long runs." stats="+32% Heal Rate" />
                                    <GlossaryItem category="wagon" type="shield" title="SHIELD CAR" tag="COMMON" desc="Reinforces the train's hull, reducing collision damage taken from all sources." stats="+20% Effectiveness" />
                                    <GlossaryItem category="wagon" type="miner" title="SCRAPPER" tag="COMMON" desc="Contains automated recycling units that generate Scrap periodically." stats="+5 Scrap per Cycle" />
                                    <GlossaryItem category="wagon" type="spike" title="SPIKE ARMOR" tag="COMMON" desc="Covers the train in spikes, dealing contact damage to any enemy that touches you." stats="+20% Dmg" />
                                </div>
                            </div>
                        </div>
                    )}
                    {tab === 'threats' && (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <GlossaryItem category="enemy" type="crusher" title="MINI-BOSSES" color="text-red-500" desc="Every 10 waves, a massive Boss will appear. They have unique skills and high HP. Defeat them to spawn a Depot." />
                            <GlossaryItem category="enemy" type="swarmer" title="SWARMER" color="text-red-400" desc="Small, fast, and weak. They attack in large swarms to overwhelm defenses. Vulnerable to splash damage." />
                            <GlossaryItem category="enemy" type="normal" title="GRUNT" color="text-purple-400" desc="Standard combat unit. Average speed and durability. The most common threat." />
                            <GlossaryItem category="enemy" type="dasher" title="DASHER" color="text-orange-400" desc="High-speed interceptor. Rushes the train head-on. Prioritize with fast-firing weapons or Tesla." />
                            <GlossaryItem category="enemy" type="tank" title="TANK" color="text-green-600" desc="Heavily armored and slow. Deals massive collision damage if it rams you. Use Snipers or Mortars." />
                            <GlossaryItem category="enemy" type="boomer" title="BOOMER" color="text-yellow-400" desc="Unstable unit. Explodes upon death, dealing massive area damage to everything nearby, including the train." />
                            <GlossaryItem category="enemy" type="screamer" title="SCREAMER" color="text-pink-400" desc="Fast support unit. Emits a speed aura that buffs nearby enemies." />
                            <GlossaryItem category="enemy" type="healer" title="HEALER" color="text-green-400" desc="Durable support unit. Regenerates the HP of nearby allies." />
                            <GlossaryItem category="enemy" type="shielder" title="SHIELDER" color="text-blue-400" desc="Grants temporary shields to nearby allies." />
                        </div>
                    )}
                    {tab === 'depots' && (
                        <div className="space-y-4">
                            <div className="bg-slate-800/50 p-4 rounded border border-slate-700 mb-6">
                                <h3 className="text-yellow-400 font-bold mb-2">HOW TO CLAIM</h3>
                                <p className="text-sm text-slate-300">Depots are dropped by Bosses. To claim a Depot, you must <span className="text-white font-bold">build your track directly over it</span>. The train will automatically secure the asset once the track is connected.</p>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <GlossaryItem category="depot" type="gearbox" title="GEARBOX" color="text-yellow-400" desc="+1 Max Speed Gear. Allows the train to reach higher top speeds." />
                                <GlossaryItem category="depot" type="extender" title="EXTENDER" color="text-blue-400" desc="+3 Max Wagon Capacity. Essential for building a longer train." />
                                <GlossaryItem category="depot" type="recycler" title="RECYCLER" color="text-red-400" desc="Instantly scraps your last wagon for 200 Scrap. Useful for getting rid of early game units." />
                                <GlossaryItem category="depot" type="repair" title="REPAIR STATION" color="text-green-400" desc="Restores 100% Hull and increases Max HP by 50." />
                                <GlossaryItem category="depot" type="armory" title="ARMORY" color="text-purple-400" desc="Grants a permanent +20% Damage boost to all weapons." />
                                <GlossaryItem category="depot" type="reactor" title="REACTOR" color="text-orange-400" desc="Increases the Fire Rate of all wagons by 15%." />
                                <GlossaryItem category="depot" type="shield" title="SHIELD GEN" color="text-cyan-400" desc="Adds a permanent 50 HP Shield layer that regenerates over time." />
                                <GlossaryItem category="depot" type="magnet" title="MAGNET TOWER" color="text-pink-400" desc="Increases Loot Collection Range by 200%." />
                                <GlossaryItem category="depot" type="drill" title="DRILL STATION" color="text-slate-400" desc="Increases Ram Damage by 50. Good for aggressive playstyles." />
                                <GlossaryItem category="depot" type="lab" title="LABORATORY" color="text-teal-400" desc="Immediately grants a random Rare Wagon card." />
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

function GlossaryItem({ category, type, icon, title, tag, color = "text-slate-200", desc, stats }) {
    return (
        <div className="bg-slate-800 p-4 rounded-lg flex gap-4 items-start border border-slate-700/50 hover:border-slate-600 transition-colors">
            <div className="mt-1 shrink-0">
                {category ? (
                    <GlossaryIcon category={category} type={type} size={48} />
                ) : (
                    <div className="text-3xl">{icon}</div>
                )}
            </div>
            <div className="flex-1">
                <h4 className={`font-bold ${color} flex items-center gap-2`}>
                    {title}
                    {tag && <span className="text-[10px] bg-slate-700 text-slate-300 px-1.5 py-0.5 rounded">{tag}</span>}
                </h4>
                <p className="text-sm text-slate-400 mt-1 leading-relaxed">{desc}</p>
                {stats && (
                    <div className="mt-2 pt-2 border-t border-slate-700/50 text-xs text-slate-500 font-mono">
                        <p><span className="text-slate-400">MAX LVL:</span> 5</p>
                        <p><span className="text-slate-400">UPGRADE:</span> {stats}</p>
                    </div>
                )}
            </div>
        </div>
    );
}

function GlossaryIcon({ category, type, size }) {
    const canvasRef = useRef(null);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        const cx = size / 2;
        const cy = size / 2;
        const s = size * 0.4; // Scale factor

        ctx.clearRect(0, 0, size, size);
        ctx.save();
        ctx.translate(cx, cy);

        if (category === 'wagon') {
            // Chassis
            ctx.fillStyle = '#334155';
            ctx.strokeStyle = '#1e293b';
            ctx.lineWidth = 2;
            ctx.fillRect(-s * 0.9, -s * 0.7, s * 1.8, s * 1.4);
            ctx.strokeRect(-s * 0.9, -s * 0.7, s * 1.8, s * 1.4);

            // Turret Logic (Simplified from TextureGenerator)
            if (type === 'gunner') { ctx.fillStyle = '#475569'; ctx.fillRect(-s * 0.6, -s * 0.6, s * 1.2, s * 1.2); ctx.fillStyle = '#3b82f6'; ctx.fillRect(0, -s * 0.2, s * 1.1, s * 0.4); }
            else if (type === 'sniper') { ctx.fillStyle = '#1e293b'; ctx.fillRect(-s * 0.6, -s * 0.6, s * 1.2, s * 1.2); ctx.fillStyle = '#facc15'; ctx.fillRect(0, -s * 0.15, s * 1.6, s * 0.3); }
            else if (type === 'flame') { ctx.fillStyle = '#7f1d1d'; ctx.fillRect(-s * 0.6, -s * 0.6, s * 1.2, s * 1.2); ctx.fillStyle = '#f97316'; ctx.fillRect(0, -s * 0.3, s, s * 0.6); }
            else if (type === 'mortar') { ctx.fillStyle = '#3f3f46'; ctx.fillRect(-s * 0.6, -s * 0.6, s * 1.2, s * 1.2); ctx.fillStyle = '#000000'; ctx.beginPath(); ctx.arc(0, 0, s * 0.6, 0, Math.PI * 2); ctx.fill(); }
            else if (type === 'cryo') { ctx.fillStyle = '#164e63'; ctx.fillRect(-s * 0.6, -s * 0.6, s * 1.2, s * 1.2); ctx.fillStyle = '#67e8f9'; ctx.fillRect(0, -s * 0.2, s, s * 0.4); }
            else if (type === 'railgun') { ctx.fillStyle = '#0f172a'; ctx.fillRect(-s * 0.6, -s * 0.6, s * 1.2, s * 1.2); ctx.fillStyle = '#ffffff'; ctx.fillRect(0, -s * 0.1, s * 1.8, s * 0.2); }
            else if (type === 'shield') { ctx.fillStyle = '#0369a1'; ctx.strokeStyle = '#38bdf8'; ctx.beginPath(); ctx.arc(0, 0, s * 0.8, 0, Math.PI * 2); ctx.fill(); ctx.stroke(); }
            else if (type === 'tesla') { ctx.fillStyle = '#4c1d95'; ctx.fillRect(-s * 0.6, -s * 0.6, s * 1.2, s * 1.2); ctx.fillStyle = '#a78bfa'; ctx.beginPath(); ctx.arc(0, 0, s * 0.4, 0, Math.PI * 2); ctx.fill(); }
            else if (type === 'drone') { ctx.fillStyle = '#14532d'; ctx.fillRect(-s * 0.6, -s * 0.6, s * 1.2, s * 1.2); ctx.strokeStyle = '#4ade80'; ctx.lineWidth = 1; ctx.strokeRect(-s * 0.4, -s * 0.4, s * 0.8, s * 0.8); }
            else if (type === 'spike') { ctx.fillStyle = '#7f1d1d'; ctx.fillRect(-s * 0.6, -s * 0.6, s * 1.2, s * 1.2); ctx.fillStyle = '#991b1b'; ctx.beginPath(); ctx.moveTo(s * 0.6, -s * 0.6); ctx.lineTo(s * 1.2, -s * 0.6); ctx.lineTo(s * 0.9, 0); ctx.fill(); }
            else if (type === 'fabricator') { ctx.fillStyle = '#c2410c'; ctx.fillRect(-s * 0.6, -s * 0.6, s * 1.2, s * 1.2); ctx.fillStyle = '#fdba74'; ctx.beginPath(); ctx.arc(0, 0, s * 0.5, 0, Math.PI * 2); ctx.fill(); }
            else if (type === 'stasis') { ctx.fillStyle = '#312e81'; ctx.fillRect(-s * 0.6, -s * 0.6, s * 1.2, s * 1.2); ctx.strokeStyle = '#818cf8'; ctx.lineWidth = 2; ctx.beginPath(); ctx.arc(0, 0, s * 0.6, 0, Math.PI * 2); ctx.stroke(); }
            else if (type === 'medic') { ctx.fillStyle = '#be123c'; ctx.fillRect(-s * 0.6, -s * 0.6, s * 1.2, s * 1.2); ctx.fillStyle = '#ffffff'; ctx.fillRect(-s * 0.2, -s * 0.4, s * 0.4, s * 0.8); ctx.fillRect(-s * 0.4, -s * 0.2, s * 0.8, s * 0.4); }
            else if (type === 'miner') { ctx.fillStyle = '#334155'; ctx.fillRect(-s * 0.6, -s * 0.6, s * 1.2, s * 1.2); ctx.fillStyle = '#854d0e'; ctx.fillRect(-s * 0.6, -s * 0.2, s * 1.2, s * 0.4); }
            else if (type === 'missile') { ctx.fillStyle = '#881337'; ctx.fillRect(-s * 0.6, -s * 0.6, s * 1.2, s * 1.2); ctx.fillStyle = '#e11d48'; ctx.fillRect(-s * 0.5, -s * 0.4, s * 0.3, s * 0.8); ctx.fillRect(s * 0.2, -s * 0.4, s * 0.3, s * 0.8); }
            else if (type === 'cluster') { ctx.fillStyle = '#1e293b'; ctx.fillRect(-s * 0.7, -s * 0.7, s * 1.4, s * 1.4); ctx.fillStyle = '#000000'; ctx.beginPath(); ctx.arc(-s * 0.3, -s * 0.3, s * 0.2, 0, Math.PI * 2); ctx.fill(); ctx.beginPath(); ctx.arc(s * 0.3, -s * 0.3, s * 0.2, 0, Math.PI * 2); ctx.fill(); ctx.beginPath(); ctx.arc(-s * 0.3, s * 0.3, s * 0.2, 0, Math.PI * 2); ctx.fill(); ctx.beginPath(); ctx.arc(s * 0.3, s * 0.3, s * 0.2, 0, Math.PI * 2); ctx.fill(); }

        } else if (category === 'enemy') {
            let color = '#a855f7';
            if (type === 'swarmer') color = '#ef4444';
            if (type === 'tank') color = '#166534';
            if (type === 'dasher') color = '#f97316';
            if (type === 'boomer') color = '#facc15';
            if (type === 'crusher') color = '#7f1d1d';
            if (type === 'screamer') color = '#ec4899';
            if (type === 'healer') color = '#22c55e';
            if (type === 'shielder') color = '#3b82f6';

            ctx.fillStyle = color;
            ctx.strokeStyle = '#000000';
            ctx.lineWidth = 2;

            if (type === 'swarmer') {
                ctx.beginPath(); ctx.moveTo(0, -s); ctx.lineTo(s, 0); ctx.lineTo(0, s); ctx.lineTo(-s, 0); ctx.closePath(); ctx.fill();
            } else if (type === 'tank') {
                ctx.fillRect(-s, -s, s * 2, s * 2); ctx.strokeRect(-s, -s, s * 2, s * 2);
            } else if (type === 'crusher') {
                ctx.beginPath(); ctx.arc(0, 0, s, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
                // Spikes
                ctx.strokeStyle = '#7f1d1d'; ctx.lineWidth = 3;
                for (let i = 0; i < 8; i++) {
                    const a = (i / 8) * Math.PI * 2;
                    ctx.beginPath(); ctx.moveTo(Math.cos(a) * s, Math.sin(a) * s); ctx.lineTo(Math.cos(a) * s * 1.3, Math.sin(a) * s * 1.3); ctx.stroke();
                }
            } else if (type === 'dasher') {
                // Triangle
                ctx.beginPath(); ctx.moveTo(0, -s); ctx.lineTo(s, s); ctx.lineTo(-s, s); ctx.closePath(); ctx.fill();
            } else {
                ctx.beginPath(); ctx.arc(0, 0, s, 0, Math.PI * 2); ctx.fill();
            }

        } else if (category === 'depot') {
            // Depot Visual
            ctx.fillStyle = '#0f172a';
            ctx.strokeStyle = '#334155';
            ctx.lineWidth = 2;
            ctx.fillRect(-s * 1.5, -s * 0.8, s * 3, s * 1.6);
            ctx.strokeRect(-s * 1.5, -s * 0.8, s * 3, s * 1.6);

            // Roof Light
            let color = '#facc15';
            if (type === 'extender') color = '#38bdf8';
            if (type === 'recycler') color = '#ef4444';
            if (type === 'repair') color = '#22c55e';
            if (type === 'armory') color = '#a855f7';
            if (type === 'reactor') color = '#f97316';
            if (type === 'shield') color = '#06b6d4';
            if (type === 'magnet') color = '#ec4899';
            if (type === 'drill') color = '#94a3b8';
            if (type === 'lab') color = '#14b8a6';

            ctx.fillStyle = color;
            ctx.globalAlpha = 0.8;
            ctx.fillRect(-s * 1.5, -s * 0.1, s * 3, s * 0.2);
            ctx.globalAlpha = 1.0;
        }

        ctx.restore();

    }, [category, type, size]);

    return <canvas ref={canvasRef} width={size} height={size} style={{ position: 'static', display: 'block' }} />;
}
