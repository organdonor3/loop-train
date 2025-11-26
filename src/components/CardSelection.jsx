import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useGameStore } from '../game/state';
import { CARDS } from '../game/constants';
import { RefreshCw } from 'lucide-react';

export default function CardSelection({ onSelect }) {
    const { scrap, rerollCost, increaseRerollCost, setStats, ownedWagons, wagonCount, maxWagonCount } = useGameStore();
    const [cards, setCards] = useState([]);

    const generateCards = () => {
        const newCards = [];

        // Filter cards if train is full
        let poolSource = CARDS;
        if (wagonCount >= maxWagonCount) {
            poolSource = CARDS.filter(c =>
                c.type === 'stat' ||
                (c.type === 'wagon' && ownedWagons.some(w => w.id === c.id))
            );
        }

        for (let i = 0; i < 3; i++) {
            const r = Math.random();
            let pool = poolSource.filter(c => c.rarity === 'common');
            if (r > 0.6) pool = poolSource.filter(c => c.rarity === 'rare');
            if (r > 0.9) pool = poolSource.filter(c => c.rarity === 'legendary');

            // Fallback if pool is empty (e.g. no legendary upgrades available)
            if (pool.length === 0) pool = poolSource.filter(c => c.rarity === 'common');
            if (pool.length === 0) pool = poolSource; // Last resort

            const card = pool[Math.floor(Math.random() * pool.length)];
            newCards.push(card);
        }
        setCards(newCards);
    };

    useEffect(() => {
        generateCards();
    }, []);

    const handleReroll = () => {
        if (scrap >= rerollCost) {
            setStats({ scrap: scrap - rerollCost });
            increaseRerollCost();
            generateCards();
        }
    };

    const getIcon = (id) => {
        const map = { gunner: '🔫', sniper: '🎯', flame: '🔥', shield: '🛡️', miner: '💰', tesla: '⚡', mortar: '💣', cryo: '❄️', drone: '🛸', spike: '🌵', repair: '🔧', dmg: '⚡', speed: '🚀', omni: '⚛️', ram: '🐗', magnet: '🧲', fabricator: '🏭', stasis: '🛑', medic: '🚑' };
        return map[id] || '📦';
    };

    return (
        <div className="absolute inset-0 flex items-center justify-center bg-black/80 backdrop-blur-sm z-50 pointer-events-auto">
            <div className="flex flex-col items-center w-full max-w-5xl">
                <motion.div
                    initial={{ y: -50, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    className="text-center mb-8"
                >
                    <h1 className="text-5xl font-black text-transparent bg-clip-text bg-gradient-to-b from-purple-300 to-purple-600 mb-2 drop-shadow-lg">LEVEL UP!</h1>
                    <p className="text-slate-400 tracking-widest font-bold">CHOOSE UPGRADE</p>
                </motion.div>

                <div className="flex gap-6 justify-center w-full flex-wrap">
                    <AnimatePresence mode='wait'>
                        {cards.map((card, idx) => (
                            <motion.div
                                key={`${card.id}-${idx}`}
                                initial={{ opacity: 0, scale: 0.8, y: 20 }}
                                animate={{ opacity: 1, scale: 1, y: 0 }}
                                exit={{ opacity: 0, scale: 0.8 }}
                                transition={{ delay: idx * 0.1 }}
                                whileHover={{ scale: 1.05, y: -10 }}
                                onClick={() => onSelect(card)}
                                className={`
                  relative w-64 h-80 p-6 rounded-xl border-2 cursor-pointer flex flex-col items-center text-center transition-colors
                  ${card.rarity === 'common' ? 'bg-slate-800 border-slate-600 hover:border-slate-400' : ''}
                  ${card.rarity === 'rare' ? 'bg-slate-900 border-blue-500 hover:border-blue-300 shadow-[0_0_20px_rgba(59,130,246,0.3)]' : ''}
                  ${card.rarity === 'legendary' ? 'bg-slate-950 border-yellow-500 hover:border-yellow-300 shadow-[0_0_30px_rgba(234,179,8,0.4)]' : ''}
                `}
                            >
                                <div className={`absolute top-0 right-0 px-3 py-1 text-[10px] font-bold uppercase rounded-bl-lg rounded-tr-lg
                  ${card.rarity === 'common' ? 'bg-slate-600 text-slate-200' : ''}
                  ${card.rarity === 'rare' ? 'bg-blue-600 text-white' : ''}
                  ${card.rarity === 'legendary' ? 'bg-yellow-500 text-black' : ''}
                `}>
                                    {card.rarity}
                                </div>

                                {/* Level Up Indicator */}
                                {(() => {
                                    const owned = ownedWagons && (ownedWagons.find(w => w.id === card.id && w.level < w.maxLevel) || ownedWagons.find(w => w.id === card.id));
                                    if (owned) {
                                        const isMax = owned.level >= owned.maxLevel;
                                        return (
                                            <div className={`absolute top-0 left-0 px-3 py-1 text-[10px] font-bold uppercase rounded-br-lg rounded-tl-lg ${isMax ? 'bg-red-500 text-white' : 'bg-green-500 text-black'}`}>
                                                {isMax ? 'MAX LEVEL' : `LEVEL ${owned.level} ➜ ${owned.level + 1}`}
                                            </div>
                                        );
                                    }
                                    return null;
                                })()}

                                <div className="text-6xl my-6 filter drop-shadow-lg">{getIcon(card.id)}</div>

                                <h3 className={`text-xl font-bold mb-4
                   ${card.rarity === 'common' ? 'text-slate-200' : ''}
                   ${card.rarity === 'rare' ? 'text-blue-400' : ''}
                   ${card.rarity === 'legendary' ? 'text-yellow-400' : ''}
                `}>{card.title}</h3>

                                <p className="text-sm text-slate-400 leading-relaxed">{card.desc}</p>
                            </motion.div>
                        ))}
                    </AnimatePresence>
                </div>

                <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={handleReroll}
                    className={`mt-12 px-8 py-3 rounded-full font-bold flex items-center gap-2 transition-all
            ${scrap >= rerollCost ? 'bg-slate-700 hover:bg-slate-600 text-white' : 'bg-slate-800 text-slate-500 cursor-not-allowed'}
          `}
                >
                    <RefreshCw className={`w-5 h-5 ${scrap >= rerollCost ? 'text-yellow-400' : ''}`} />
                    REROLL ({rerollCost})
                </motion.button>
            </div>
        </div>
    );
}
