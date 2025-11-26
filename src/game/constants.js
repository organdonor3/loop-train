export const CARDS = [
    { id: 'gunner', type: 'wagon', title: 'GUNNER CAR', desc: 'Standard auto-turret.', rarity: 'common', maxLevel: 5, weight: 10 },
    { id: 'sniper', type: 'wagon', title: 'SNIPER CAR', desc: 'Long range, high damage.', rarity: 'rare', maxLevel: 5, weight: 5 },
    { id: 'flame', type: 'wagon', title: 'FLAMER CAR', desc: 'Short range rapid fire.', rarity: 'rare', maxLevel: 5, weight: 10 },
    { id: 'shield', type: 'wagon', title: 'SHIELD CAR', desc: 'Protects nearby cars.', rarity: 'common', maxLevel: 5, weight: 20 },
    { id: 'miner', type: 'wagon', title: 'SCRAPPER', desc: 'Generates scrap over time.', rarity: 'common', maxLevel: 5, weight: 15 },
    { id: 'tesla', type: 'wagon', title: 'TESLA COIL', desc: 'Zaps nearby enemies instantly.', rarity: 'rare', maxLevel: 5, weight: 10 },
    { id: 'mortar', type: 'wagon', title: 'HEAVY MORTAR', desc: 'Lobs explosive shells.', rarity: 'rare', maxLevel: 5, weight: 20 },
    { id: 'cryo', type: 'wagon', title: 'CRYO BEAM', desc: 'Slows enemies down.', rarity: 'common', maxLevel: 5, weight: 10 },
    { id: 'drone', type: 'wagon', title: 'DRONE BAY', desc: 'Deploys attack drones.', rarity: 'legendary', maxLevel: 5, weight: 5 },
    { id: 'spike', type: 'wagon', title: 'SPIKE ARMOR', desc: 'Deals damage on contact.', rarity: 'common', maxLevel: 5, weight: 15 },

    // New Support Cars
    { id: 'fabricator', type: 'wagon', title: 'FABRICATOR', desc: 'Buffs adjacent wagons damage.', rarity: 'rare', maxLevel: 5, weight: 10 },
    { id: 'stasis', type: 'wagon', title: 'STASIS FIELD', desc: 'Slows nearby enemies.', rarity: 'common', maxLevel: 5, weight: 10 },
    { id: 'medic', type: 'wagon', title: 'MEDIC BAY', desc: 'Repairs hull over time.', rarity: 'rare', maxLevel: 5, weight: 10 },

    // New Combat Cars
    { id: 'railgun', type: 'wagon', title: 'RAILGUN', desc: 'High velocity slug, massive knockback.', rarity: 'rare', maxLevel: 5, weight: 15 },
    { id: 'acid', type: 'wagon', title: 'ACID TANK', desc: 'Corrosive spray, melts enemies over time.', rarity: 'common', maxLevel: 5, weight: 10 },
    { id: 'gravity', type: 'wagon', title: 'GRAVITY WELL', desc: 'Pulls enemies in.', rarity: 'rare', maxLevel: 5, weight: 15 },
    { id: 'thumper', type: 'wagon', title: 'THUMPER', desc: 'Shockwave pushes enemies back.', rarity: 'common', maxLevel: 5, weight: 20 },
    { id: 'missile', type: 'wagon', title: 'MISSILE CAR', desc: 'Fires homing rockets.', rarity: 'rare', maxLevel: 5, weight: 10 },
    { id: 'cluster', type: 'wagon', title: 'CLUSTER LAUNCHER', desc: 'Rocket splits on impact.', rarity: 'legendary', maxLevel: 5, weight: 5 },

    { id: 'repair', type: 'stat', title: 'FULL REPAIR', desc: 'Restore 100% Hull.', rarity: 'common' },
    { id: 'dmg', type: 'stat', title: 'TURRET MK2', desc: '+50% Locomotive Damage.', rarity: 'rare' },
    { id: 'speed', type: 'stat', title: 'TURBO PISTON', desc: '+25% Max Speed.', rarity: 'rare' },
    { id: 'omni', type: 'wagon', title: 'OMNI-BATTERY', desc: 'Legendary rapid fire array.', rarity: 'legendary', weight: 10 },
    { id: 'ram', type: 'stat', title: 'RAM PLATING', desc: 'Ram damage up, self dmg down.', rarity: 'legendary' },
    { id: 'magnet', type: 'stat', title: 'MAG-CRANE', desc: '+100% Collection Range.', rarity: 'rare' }
];

export const NODE_RADIUS = 8;
export const NODE_COST = 40;

export const DEPOTS = [
    { id: 'gearbox', title: 'GEARBOX', desc: '+1 Max Speed Gear', color: '#facc15' },
    { id: 'extender', title: 'EXTENDER', desc: '+3 Max Wagons', color: '#3b82f6' },
    { id: 'recycler', title: 'RECYCLER', desc: 'Scrap last wagon for 200 Scrap', color: '#ef4444' },
    { id: 'repair', title: 'REPAIR STATION', desc: 'Full Heal + 50 Max HP', color: '#22c55e' },
    { id: 'armory', title: 'ARMORY', desc: '+20% Global Damage', color: '#a855f7' },
    { id: 'reactor', title: 'REACTOR', desc: '+15% Fire Rate', color: '#f97316' },
    { id: 'shield', title: 'SHIELD GEN', desc: 'Permanent 50 HP Shield', color: '#06b6d4' },
    { id: 'magnet', title: 'MAGNET TOWER', desc: '+200% Magnet Range', color: '#ec4899' },
    { id: 'drill', title: 'DRILL STATION', desc: '+50 Ram Damage', color: '#94a3b8' },
    { id: 'lab', title: 'LABORATORY', desc: 'Get a random Rare Wagon', color: '#14b8a6' }
];

export const BOSSES = ['crusher', 'queen', 'sniper_boss', 'tesla_boss', 'fortress', 'phantom'];

export const ENGINES = [
    {
        id: 'pioneer',
        name: 'THE PIONEER',
        desc: 'Balanced and reliable. Good for beginners.',
        stats: { hp: 100, speed: 5.0, ram: 0, magnet: 120 },
        track: 'circle',
        color: '#3b82f6'
    },
    {
        id: 'juggernaut',
        name: 'THE JUGGERNAUT',
        desc: 'Heavy armor and crushing ram damage. Slow but tough.',
        stats: { hp: 200, speed: 4.0, ram: 50, magnet: 100 },
        track: 'oval',
        color: '#ef4444'
    },
    {
        id: 'interceptor',
        name: 'THE INTERCEPTOR',
        desc: 'High speed and agility. Weak hull.',
        stats: { hp: 60, speed: 7.0, ram: -20, magnet: 150 },
        track: 'figure8',
        color: '#facc15'
    },
    {
        id: 'scavenger',
        name: 'THE SCAVENGER',
        desc: 'Optimized for loot collection. Starts with extra scrap.',
        stats: { hp: 80, speed: 5.5, ram: 0, magnet: 200, scrap: 50 },
        track: 'wide',
        color: '#a855f7'
    },
    {
        id: 'bastion',
        name: 'THE BASTION',
        desc: 'Defensive powerhouse. Starts with a Shield.',
        stats: { hp: 150, speed: 4.5, ram: 20, magnet: 120, shield: 50 },
        track: 'compact',
        color: '#10b981'
    }
];
