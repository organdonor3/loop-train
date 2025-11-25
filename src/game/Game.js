import { useGameStore } from './state';
import { getSplinePoint, getTrackLength } from './utils/math';
import { Wagon } from './classes/Wagon';
import { Enemy } from './classes/Enemy';
import { Crystal } from './classes/Crystal';
import { Drone } from './classes/Drone';
import { Depot } from './classes/Depot';
import { audioManager } from './core/Audio';
import { CARDS, NODE_COST, NODE_RADIUS, BOSSES } from './constants';

export default class Game {
    constructor(canvas) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');

        // Entities (Initialize before resize)
        this.trackNodes = [];
        this.enemies = [];
        this.particles = [];
        this.floaters = [];
        this.projectiles = [];
        this.crystals = [];
        this.looseScrap = [];
        this.looseXp = [];
        this.drones = [];
        this.depots = [];
        this.mines = [];
        this.player = {
            trackPos: 0, totalDist: 0, x: 0, y: 0, angle: 0,
            speed: 0, gear: 0, maxSpeed: 5.0,
            hp: 100, maxHp: 100, autoDmg: 10,
            range: 5, magnetRange: 120,
            ramReduction: 0, ramDamage: 0,
            history: [], wagons: []
        };

        this.keys = { w: false, s: false, space: false };
        this.mouse = { x: 0, y: 0, down: false, rightDown: false, dragging: null };

        this.bindInput();

        // Wait for setup
        useGameStore.getState().setGameState('SETUP');
    }

    startGame(engine, wagonCard) {
        console.log('Game Starting...');

        // Initialize Game State
        this.waveTimer = 0;
        this.waveDuration = 1800; // 30 seconds
        this.baseRadius = 600;
        this.worldRadius = 600;
        this.frameCount = 0;
        this.zoom = 1;
        this.targetZoom = 1;
        this.shakeIntensity = 0;
        this.resize();
        this.initTrack(engine.track);
        this.initPlayer(engine, wagonCard);

        // Sync initial state
        useGameStore.getState().setStats({
            hp: this.player.hp,
            maxHp: this.player.maxHp,
            scrap: engine.stats.scrap || 100,
            wave: 1,
            level: 1,
            xp: 0,
            maxXp: 100
        });

        this.start();
        useGameStore.getState().setGameState('PLAY');
        console.log('Game Started. State set to PLAY.');
    }

    resize() {
        const oldCx = this.canvas.width / 2;
        const oldCy = this.canvas.height / 2;

        this.canvas.width = window.innerWidth;
        this.canvas.height = window.innerHeight;

        if (oldCx && oldCy) {
            const dx = (this.canvas.width / 2) - oldCx;
            const dy = (this.canvas.height / 2) - oldCy;

            // Shift Track
            this.trackNodes.forEach(n => { n.x += dx; n.y += dy; });

            // Shift Player
            this.player.x += dx;
            this.player.y += dy;

            // Shift Entities
            this.enemies.forEach(e => { e.x += dx; e.y += dy; });
            this.crystals.forEach(c => { c.x += dx; c.y += dy; });
            this.looseScrap.forEach(s => { s.x += dx; s.y += dy; });
            this.looseXp.forEach(x => { x.x += dx; x.y += dy; });
            this.projectiles.forEach(p => { p.x += dx; p.y += dy; });
            this.particles.forEach(p => {
                p.x += dx; p.y += dy;
                if (p.isLightning) { p.x1 += dx; p.y1 += dy; p.x2 += dx; p.y2 += dy; }
            });
            this.floaters.forEach(f => { f.x += dx; f.y += dy; });
            this.drones.forEach(d => d.update(this)); // Fix: drones don't have x/y directly? They follow player.
            // Actually drones array contains Drone instances.
            this.drones.forEach(d => { d.x += dx; d.y += dy; });
            this.depots.forEach(d => { d.x += dx; d.y += dy; });
            this.mines.forEach(m => { m.x += dx; m.y += dy; });
        }
    }

    bindInput() {
        window.addEventListener('keydown', e => {
            if (e.key.toLowerCase() === 'w') this.keys.w = true;
            if (e.key.toLowerCase() === 's') this.keys.s = true;
            if (e.key === ' ') this.keys.space = true;
        });

        this.canvas.addEventListener('mousemove', e => {
            const r = this.canvas.getBoundingClientRect();
            this.mouse.x = e.clientX - r.left;
            this.mouse.y = e.clientY - r.top;
        });

        this.canvas.addEventListener('mousedown', e => {
            if (e.button === 0) this.mouse.down = true;
            if (e.button === 2) this.mouse.rightDown = true;
        });

        this.canvas.addEventListener('mouseup', e => {
            if (e.button === 0) { this.mouse.down = false; this.mouse.dragging = null; }
            if (e.button === 2) this.mouse.rightDown = false;
        });

        this.canvas.addEventListener('contextmenu', e => e.preventDefault());
    }

    initTrack(type) {
        const cx = this.canvas.width / 2;
        const cy = this.canvas.height / 2;
        const r = 150;
        this.trackNodes = [];

        if (type === 'oval') {
            for (let i = 0; i < 12; i++) {
                const angle = (i / 12) * Math.PI * 2;
                const xr = 250; const yr = 120;
                this.trackNodes.push({ x: cx + Math.cos(angle) * xr, y: cy + Math.sin(angle) * yr });
            }
        } else if (type === 'figure8') {
            // Simple figure 8 approximation or just a complex loop
            for (let i = 0; i < 16; i++) {
                const t = (i / 16) * Math.PI * 2;
                const x = cx + 200 * Math.sin(t);
                const y = cy + 100 * Math.sin(2 * t);
                this.trackNodes.push({ x, y });
            }
        } else if (type === 'wide') {
            for (let i = 0; i < 10; i++) {
                const angle = (i / 10) * Math.PI * 2;
                this.trackNodes.push({ x: cx + Math.cos(angle) * 220, y: cy + Math.sin(angle) * 220 });
            }
        } else if (type === 'compact') {
            for (let i = 0; i < 6; i++) {
                const angle = (i / 6) * Math.PI * 2;
                this.trackNodes.push({ x: cx + Math.cos(angle) * 100, y: cy + Math.sin(angle) * 100 });
            }
        } else {
            // Circle (Default)
            for (let i = 0; i < 8; i++) {
                const angle = (i / 8) * Math.PI * 2;
                this.trackNodes.push({ x: cx + Math.cos(angle) * r, y: cy + Math.sin(angle) * r });
            }
        }
    }

    initPlayer(engine, startingWagon) {
        // Apply Engine Stats
        this.player.maxHp = engine.stats.hp;
        this.player.hp = engine.stats.hp;
        this.player.maxSpeed = engine.stats.speed;
        this.player.ramDamage = engine.stats.ram;
        this.player.magnetRange = engine.stats.magnet;
        this.player.gear = 1; // Start moving
        this.player.speed = 1.0; // Start with speed

        // Pre-fill history to unstack wagons
        // We assume a constant speed of 1.0 for the history generation
        const startPoint = getSplinePoint(0, this.trackNodes);
        this.player.x = startPoint.x;
        this.player.y = startPoint.y;
        this.player.trackPos = 0;
        this.player.totalDist = 0;

        // Generate history backwards
        // 200 points of history, enough for a few wagons
        for (let i = 0; i < 300; i++) {
            // Approximate t going backwards
            // If speed is 1, and pixelsPerT is roughly 1000 / nodes.length
            // Let's just step back t by small amounts
            const t = - (i * 0.01);
            // Normalize t for getSplinePoint if needed, but our getSplinePoint handles negative? 
            // Actually getSplinePoint usually expects positive. Let's handle wrapping in getSplinePoint or just here.
            // But wait, the history stores { dist, t }. 
            // Wagon uses binary search on dist.
            // So we just need dist to be decreasing.
            this.player.history.unshift({ dist: -(i * 1.0), t: t });
        }
        // Fix: history should be ordered from oldest to newest?
        // this.player.history.push pushes to end (newest).
        // So we want the oldest (furthest back) at index 0.
        // The loop above unshifts, so i=0 (dist 0) is at end? No.
        // Let's redo.
        this.player.history = [];
        for (let i = 300; i >= 0; i--) {
            this.player.history.push({ dist: -(i * 1.0), t: -(i * 0.01) });
        }

        this.player.wagons.push(new Wagon(startingWagon.id, 0));
        useGameStore.getState().setStats({ wagonCount: 1, maxWagonCount: this.trackNodes.length });
    }

    start() {
        this.running = true;
        this.loop();
    }

    stop() {
        this.running = false;
        cancelAnimationFrame(this.rafId);
        window.removeEventListener('resize', this.handleResize);
    }

    loop() {
        if (!this.running) return;
        this.update();
        this.draw();
        this.rafId = requestAnimationFrame(() => this.loop());
    }

    update() {
        const store = useGameStore.getState();
        // console.error('Update Loop. State:', store.gameState);
        if (store.gameState !== 'PLAY') return;

        this.frameCount++;
        this.handleInput(store);
        this.updatePhysics();
        this.manageWaves(store);

        this.player.wagons.forEach((w, idx) => w.update(this, idx));
        this.drones.forEach(d => d.update(this));

        // Auto-fire from Locomotive
        if (this.frameCount % 30 === 0) {
            const t = this.getNearestEnemy(this.player.x, this.player.y, 200);
            if (t) {
                this.fireProjectile(this.player.x + 16, this.player.y + 16, t, 10, '#fbbf24', this.player.autoDmg);
                audioManager.play('shoot');
            }
        }

        this.crystals.forEach(c => c.update(this));
        this.crystals = this.crystals.filter(c => c.active);

        this.enemies.forEach(e => e.update(this));
        this.enemies = this.enemies.filter(e => e.hp > 0);

        // Check Mine Collisions
        for (let i = this.mines.length - 1; i >= 0; i--) {
            const m = this.mines[i];
            m.life--;
            if (Math.hypot(this.player.x - m.x, this.player.y - m.y) < 30) {
                this.createExplosion(m.x, m.y, '#ef4444', 10);
                this.damagePlayer(15);
                audioManager.play('explode');
                this.mines.splice(i, 1);
                continue;
            }
            if (m.life <= 0) this.mines.splice(i, 1);
        }

        // Check Depot Claims
        for (let i = this.depots.length - 1; i >= 0; i--) {
            const d = this.depots[i];
            // Check if any track node is inside the depot
            const claimed = this.trackNodes.some(n => Math.hypot(n.x - d.x, n.y - d.y) < d.radius);
            if (claimed) {
                this.claimDepot(d, i);
            }
        }

        this.collectLoot(store);
        this.updateProjectiles();
        this.updateParticles();

        if (this.player.hp <= 0) {
            store.setGameState('GAMEOVER');
            audioManager.play('explode');
        }

        // Sync UI
        if (this.frameCount % 5 === 0) {
            store.setStats({
                hp: this.player.hp,
                scrap: store.scrap,
                speed: this.player.speed,
                gear: this.player.gear,
                ownedWagons: this.player.wagons.map(w => ({ id: w.id, level: w.level, maxLevel: w.maxLevel })),
                waveTimer: this.waveTimer,
                waveDuration: this.waveDuration
            });
        }
    }

    // Debug Methods
    forceLevelUp() {
        const store = useGameStore.getState();
        this.gainXp(store.maxXp - store.xp, store);
    }

    advanceWave() {
        this.waveTimer = this.waveDuration;
    }

    toggleGodMode() {
        this.godMode = !this.godMode;
        this.spawnFloater(this.player.x, this.player.y, this.godMode ? "GOD MODE ON" : "GOD MODE OFF", "#facc15", 16);
    }

    getNearestEnemy(x, y, range) {
        let nearest = null, minDist = range;
        this.enemies.forEach(e => { const d = Math.hypot(e.x - x, e.y - y); if (d < minDist) { minDist = d; nearest = e; } });
        return nearest;
    }

    fireProjectile(x, y, target, speed, color, dmg, isExplosive = false, isCryo = false, knockback = 0, isAcid = false, isGravity = false) {
        const dist = Math.hypot(target.x - x, target.y - y);
        const time = dist / speed;
        const fx = target.x + (target.vx * time);
        const fy = target.y + (target.vy * time);
        const angle = Math.atan2(fy - y, fx - x);
        this.projectiles.push({ x, y, vx: Math.cos(angle) * speed, vy: Math.sin(angle) * speed, color, damage: dmg, life: 80, isExplosive, isCryo, knockback, isAcid, isGravity });
    }

    createShockwave(x, y, range, force) {
        this.createExplosion(x, y, '#fff', 10);
        this.enemies.forEach(e => {
            const d = Math.hypot(e.x - x, e.y - y);
            if (d < range) {
                const angle = Math.atan2(e.y - y, e.x - x);
                e.knockbackX += Math.cos(angle) * force;
                e.knockbackY += Math.sin(angle) * force;
                e.hp -= 5;
            }
        });
    }

    spawnScrap(x, y, val) {
        this.looseScrap.push({ x, y, val, life: 1800 });
    }

    spawnDrone(parent) {
        this.drones.push(new Drone(parent));
    }

    createExplosion(x, y, color, count) {
        for (let i = 0; i < count; i++) {
            const life = 30 + Math.random() * 20;
            this.particles.push({ x, y, color, vx: (Math.random() - 0.5) * 8, vy: (Math.random() - 0.5) * 8, life, maxLife: life });
        }
    }

    spawnMine(x, y) {
        this.mines.push({ x, y, life: 600 }); // 10 seconds
    }

    createLightning(x1, y1, x2, y2) {
        this.particles.push({ isLightning: true, x1, y1, x2, y2, life: 5 });
    }

    spawnFloater(x, y, text, color, size = 12) {
        this.floaters.push({ x, y, text, color, size, life: 60 });
    }

    shake(amt) {
        this.shakeIntensity = amt;
    }

    damagePlayer(amount) {
        if (this.godMode) return;
        this.player.hp -= amount;
        useGameStore.getState().setStats({ hp: this.player.hp });
    }

    healPlayer(amount) {
        this.player.hp = Math.min(this.player.maxHp, this.player.hp + amount);
        useGameStore.getState().setStats({ hp: this.player.hp });
    }

    handleInput(store) {
        if (this.keys.space) {
            this.keys.space = false;
            if (store.scrap >= 20) {
                useGameStore.getState().setStats({ scrap: store.scrap - 20 });
                this.spawnFloater(this.player.x, this.player.y, "SALVO!", "#facc15", 16);
                audioManager.play('shoot');
                for (let i = 0; i < 5; i++) {
                    const t = this.getNearestEnemy(this.player.x, this.player.y, 400);
                    if (t) {
                        setTimeout(() => {
                            this.fireProjectile(this.player.x, this.player.y, t, 12, '#facc15', this.player.autoDmg * 2);
                            this.createExplosion(this.player.x, this.player.y, '#facc15', 2);
                        }, i * 50);
                    }
                }
            } else {
                this.spawnFloater(this.player.x, this.player.y, "NO SCRAP", "#ef4444", 12);
            }
        }

        let hoverNode = -1;
        for (let i = 0; i < this.trackNodes.length; i++) {
            if (Math.hypot(this.mouse.x - this.trackNodes[i].x, this.mouse.y - this.trackNodes[i].y) < 15) { hoverNode = i; break; }
        }

        let onLine = false;
        if (hoverNode === -1) {
            for (let t = 0; t < this.trackNodes.length; t += 0.2) {
                const p = getSplinePoint(t, this.trackNodes);
                if (Math.hypot(this.mouse.x - p.x, this.mouse.y - p.y) < 20) { onLine = true; break; }
            }
        }

        let cursorType = 'default';
        if (this.mouse.dragging !== null) cursorType = 'grabbing';
        else if (hoverNode !== -1) cursorType = 'grab';
        else if (onLine) cursorType = 'cell';
        this.canvas.style.cursor = cursorType;

        if (this.mouse.down && this.mouse.dragging !== null) {
            const oldLen = getTrackLength(this.trackNodes);
            const node = this.trackNodes[this.mouse.dragging];
            const ox = node.x; const oy = node.y;
            this.trackNodes[this.mouse.dragging].x = this.mouse.x;
            this.trackNodes[this.mouse.dragging].y = this.mouse.y;
            const newLen = getTrackLength(this.trackNodes);
            const diff = newLen - oldLen;

            if (diff > 0) {
                const cost = diff * 0.5;
                if (store.scrap >= cost) {
                    useGameStore.getState().setStats({ scrap: store.scrap - cost });
                    if (Math.random() < 0.1) this.spawnFloater(this.mouse.x, this.mouse.y, `-${Math.ceil(cost)}`, "#ef4444", 10);
                } else {
                    this.trackNodes[this.mouse.dragging].x = ox;
                    this.trackNodes[this.mouse.dragging].y = oy;
                }
            }
        }
        else if (this.mouse.down && hoverNode !== -1 && this.mouse.dragging === null) { this.mouse.dragging = hoverNode; }

        if (this.mouse.rightDown) {
            if (hoverNode !== -1) {
                if (this.trackNodes.length > 4 && store.scrap >= 10) {
                    this.trackNodes.splice(hoverNode, 1);
                    useGameStore.getState().setStats({ scrap: store.scrap - 10 });
                    this.mouse.rightDown = false;
                    audioManager.play('build');
                    useGameStore.getState().setStats({ maxWagonCount: this.trackNodes.length });
                }
            } else {
                // Add Node (Right Click on Line)
                let closestDist = 999; let closestT = -1;
                for (let t = 0; t < this.trackNodes.length; t += 0.1) {
                    const p = getSplinePoint(t, this.trackNodes);
                    const d = Math.hypot(this.mouse.x - p.x, this.mouse.y - p.y);
                    if (d < 20 && d < closestDist) { closestDist = d; closestT = t; }
                }
                if (closestT !== -1 && store.scrap >= NODE_COST) {
                    // Check radius limit
                    const p = getSplinePoint(closestT, this.trackNodes);
                    const dist = Math.hypot(this.mouse.x - (this.canvas.width / 2), this.mouse.y - (this.canvas.height / 2));

                    if (dist > this.worldRadius) {
                        this.spawnFloater(this.mouse.x, this.mouse.y, "OUT OF BOUNDS", "#ef4444", 12);
                        return;
                    }

                    const idx = Math.floor(closestT) + 1;
                    this.trackNodes.splice(idx, 0, { x: this.mouse.x, y: this.mouse.y });
                    useGameStore.getState().setStats({ scrap: store.scrap - NODE_COST });
                    this.spawnFloater(this.mouse.x, this.mouse.y, "-40", "#ef4444");
                    audioManager.play('build');
                    this.mouse.rightDown = false;
                    useGameStore.getState().setStats({ maxWagonCount: this.trackNodes.length });
                }
            }
        }
    }

    updatePhysics() {
        if (!this.trackNodes || this.trackNodes.length === 0) return;

        if (this.keys.w) { this.player.gear = Math.min(3, this.player.gear + 1); this.keys.w = false; }
        if (this.keys.s) { this.player.gear = Math.max(-1, this.player.gear - 1); this.keys.s = false; }

        // Calculate Weight
        let totalWeight = 100; // Locomotive base weight
        this.player.wagons.forEach(w => {
            const card = CARDS.find(c => c.id === w.type);
            if (card) totalWeight += card.weight;
        });

        let tSpeed = 0;
        // Acceleration affected by weight (heavier = slower accel)
        let acceleration = 0.05 * (100 / totalWeight);

        if (this.player.gear === 1) { tSpeed = this.player.maxSpeed * 0.25; acceleration = 0.1 * (100 / totalWeight); }
        else if (this.player.gear === 2) { tSpeed = this.player.maxSpeed * 0.6; acceleration = 0.08 * (100 / totalWeight); }
        else if (this.player.gear === 3) { tSpeed = this.player.maxSpeed; acceleration = 0.05 * (100 / totalWeight); }
        else if (this.player.gear === -1) { tSpeed = -1.5; acceleration = 0.1; }
        else if (this.player.gear === 0) { tSpeed = 0; acceleration = 0.2; }

        this.player.speed += (tSpeed - this.player.speed) * acceleration;

        // Ram Damage based on Weight and Speed
        this.player.ramDamage = (totalWeight * Math.abs(this.player.speed) * 0.1);

        if (Math.abs(this.player.speed) < 0.05 && this.player.gear === 0) this.player.speed = 0;
        if (this.player.speed === 0) return;

        const sampleStep = 0.05;
        const pCurrent = getSplinePoint(this.player.trackPos, this.trackNodes);
        const pNext = getSplinePoint(this.player.trackPos + sampleStep, this.trackNodes);
        const segmentDist = Math.hypot(pNext.x - pCurrent.x, pNext.y - pCurrent.y);
        const safeDist = Math.max(0.1, segmentDist);
        const pixelsPerT = safeDist / sampleStep;
        const tSpeedVal = this.player.speed / Math.max(1, pixelsPerT);

        this.player.trackPos += tSpeedVal;
        this.player.totalDist += this.player.speed;

        const p1 = getSplinePoint(this.player.trackPos, this.trackNodes);
        const p2 = getSplinePoint(this.player.trackPos + 0.1, this.trackNodes);

        this.player.x = p1.x; this.player.y = p1.y;
        this.player.angle = Math.atan2(p2.y - p1.y, p2.x - p1.x);

        if (this.player.history.length === 0 || Math.abs(this.player.totalDist - this.player.history[this.player.history.length - 1].dist) > 2) {
            this.player.history.push({ dist: this.player.totalDist, t: this.player.trackPos });
            if (this.player.history.length > 1000) this.player.history.shift();
        }

        // Reduced Smoke Frequency
        if (Math.abs(this.player.speed) > 0.1 && this.frameCount % 20 === 0) {
            this.particles.push({ x: this.player.x, y: this.player.y, vx: (Math.random() - 0.5), vy: (Math.random() - 0.5), color: 'rgba(255,255,255,0.1)', life: 60, isSmoke: true, size: 5 });
        }
    }

    manageWaves(store) {
        this.waveTimer++;
        const spawnRate = Math.max(30, 180 - (store.wave * 10));

        // console.log('WaveTimer:', this.waveTimer, 'Duration:', this.waveDuration, 'Wave:', store.wave, 'SpawnRate:', spawnRate);

        if (this.waveTimer >= this.waveDuration) {
            const newWave = store.wave + 1;
            console.log('New Wave Triggered:', newWave);
            useGameStore.getState().setStats({ wave: newWave });
            this.waveTimer = 0;
            this.spawnScrap(this.player.x, this.player.y, 100);
            this.spawnFloater(this.player.x, this.player.y - 50, `WAVE ${newWave}`, "#ef4444", 24);

            // Expand World
            this.worldRadius = this.baseRadius + (newWave * 50);
            this.spawnFloater(this.canvas.width / 2, this.canvas.height / 2 - this.worldRadius, "ZONE EXPANDED", "#38bdf8", 20);

            // Zoom Out every 4 waves
            if (newWave % 4 === 0) {
                this.targetZoom = Math.max(0.5, 1 - (Math.floor(newWave / 4) * 0.1));
            }
        }

        if (this.frameCount % spawnRate === 0) {
            console.log('Spawning Enemy. Frame:', this.frameCount);
            this.spawnOneEnemy(store.wave);
        }
    }

    spawnOneEnemy(wave) {
        if (wave % 10 === 0 && this.enemies.filter(e => e.isBoss).length === 0) {
            // Spawn Boss
            const bossType = BOSSES[Math.floor((wave / 10) % BOSSES.length)];
            const angle = Math.random() * Math.PI * 2;
            const r = this.worldRadius + 100;
            const x = this.canvas.width / 2 + Math.cos(angle) * r;
            const y = this.canvas.height / 2 + Math.sin(angle) * r;

            this.enemies.push(new Enemy(x, y, bossType, false, wave));
            this.spawnFloater(x, y, "BOSS APPROACHING!", "#ef4444", 32);
            audioManager.play('spawn');
            return;
        }

        const angle = Math.random() * Math.PI * 2;
        // Spawn just outside the current world radius
        const r = this.worldRadius + 50 + (Math.random() * 100);
        const cx = this.canvas.width / 2;
        const cy = this.canvas.height / 2;
        const x = cx + Math.cos(angle) * r;
        const y = cy + Math.sin(angle) * r;

        let type = 'normal';
        const rnd = Math.random();
        if (wave > 2 && rnd < 0.4) type = 'swarmer';
        if (wave > 3 && rnd > 0.7) type = 'dasher';
        if (wave > 4 && rnd > 0.8) type = 'miner';
        if (wave > 5 && rnd > 0.85) type = 'boomer';
        if (wave > 6 && rnd > 0.9) type = 'tank';

        const isElite = (Math.random() < 0.05 + (wave * 0.01));

        if (type === 'swarmer') {
            this.enemies.push(new Enemy(x, y, 'swarmer', isElite, wave));
            this.enemies.push(new Enemy(x + 10, y + 10, 'swarmer', false, wave));
            this.enemies.push(new Enemy(x - 10, y - 10, 'swarmer', false, wave));
        } else {
            this.enemies.push(new Enemy(x, y, type, isElite, wave));
        }
    }

    spawnDepot(x, y) {
        this.depots.push(new Depot(x, y));
        this.spawnFloater(x, y, "DEPOT DROPPED!", "#fbbf24", 20);
        audioManager.play('build');
    }

    claimDepot(depot, idx) {
        const store = useGameStore.getState();
        const type = depot.type.id;

        if (type === 'gearbox') { this.player.gear++; useGameStore.getState().setStats({ gear: this.player.gear }); }
        if (type === 'extender') { useGameStore.getState().setStats({ maxWagonCount: store.maxWagonCount + 3 }); }
        if (type === 'recycler') {
            if (this.player.wagons.length > 0) {
                this.player.wagons.pop();
                useGameStore.getState().setStats({ scrap: store.scrap + 200, wagonCount: this.player.wagons.length });
                this.spawnFloater(this.player.x, this.player.y, "RECYCLED! +200 SCRAP", "#ef4444");
            }
        }
        if (type === 'repair') { this.player.hp = this.player.maxHp + 50; this.player.maxHp += 50; }
        if (type === 'armory') { this.player.autoDmg *= 1.2; }
        if (type === 'reactor') { this.player.wagons.forEach(w => w.stats.fireRate *= 1.15); }
        if (type === 'shield') { /* Implement shield logic later if needed, for now just HP */ this.player.hp += 50; }
        if (type === 'magnet') { this.player.magnetRange += 200; }
        if (type === 'drill') { this.player.ramDamage += 50; }
        if (type === 'lab') {
            const rare = CARDS.filter(c => c.rarity === 'rare' && c.type === 'wagon');
            const card = rare[Math.floor(Math.random() * rare.length)];
            this.selectCard(card);
        }

        this.spawnFloater(depot.x, depot.y, `${depot.type.title} CLAIMED!`, depot.type.color, 24);
        audioManager.play('levelup');
        this.depots.splice(idx, 1);
    }

    collectLoot(store) {
        const check = (arr, isXp) => {
            for (let i = arr.length - 1; i >= 0; i--) {
                const s = arr[i]; s.life--;
                const d = Math.hypot(this.player.x - s.x, this.player.y - s.y);
                if (d < this.player.magnetRange) {
                    s.x += (this.player.x - s.x) * 0.15; s.y += (this.player.y - s.y) * 0.15;
                    if (d < 30) {
                        if (isXp) {
                            this.gainXp(s.val, store);
                            this.spawnFloater(s.x, s.y, `+${s.val} XP`, "#a855f7");
                        }
                        else {
                            useGameStore.getState().setStats({ scrap: store.scrap + s.val });
                            this.spawnFloater(s.x, s.y, `+${s.val}`, "#fbbf24");
                        }
                        arr.splice(i, 1); audioManager.play('collect');
                        continue;
                    }
                }
                if (s.life <= 0) arr.splice(i, 1);
            }
        };
        check(this.looseScrap, false);
        check(this.looseXp, true);
    }

    gainXp(amount, store) {
        let newXp = store.xp + amount;
        if (newXp >= store.maxXp) {
            newXp -= store.maxXp;
            const newLevel = store.level + 1;
            const newMaxXp = Math.floor(store.maxXp * 1.2);
            useGameStore.getState().setStats({ xp: newXp, level: newLevel, maxXp: newMaxXp });
            useGameStore.getState().setGameState('LEVEL_UP');
            audioManager.play('levelup');
        } else {
            useGameStore.getState().setStats({ xp: newXp });
        }
    }

    updateProjectiles() {
        for (let i = this.projectiles.length - 1; i >= 0; i--) {
            const p = this.projectiles[i];
            p.x += p.vx; p.y += p.vy; p.life--;
            let hit = false;
            for (const e of this.enemies) {
                if (Math.hypot(p.x - e.x, p.y - e.y) < e.size + 5) {
                    e.hp -= p.damage; hit = true;
                    this.createExplosion(p.x, p.y, p.color, 3);
                    this.spawnFloater(e.x, e.y - 15, Math.floor(p.damage), "#fff", 10);

                    // Apply Knockback
                    if (p.knockback) {
                        const kAngle = Math.atan2(e.y - p.y, e.x - p.x);
                        e.knockbackX += Math.cos(kAngle) * p.knockback;
                        e.knockbackY += Math.sin(kAngle) * p.knockback;
                    }

                    if (p.isCryo) e.frozenTimer = 120;
                    if (p.isAcid) e.acidTimer = 300; // 5 seconds of acid

                    if (p.isGravity) {
                        // Pull other enemies in
                        this.enemies.forEach(sub => {
                            const d = Math.hypot(sub.x - p.x, sub.y - p.y);
                            if (d < 150 && sub !== e) {
                                const angle = Math.atan2(p.y - sub.y, p.x - sub.x);
                                sub.knockbackX += Math.cos(angle) * 5;
                                sub.knockbackY += Math.sin(angle) * 5;
                            }
                        });
                    }

                    if (p.isExplosive) {
                        this.createExplosion(p.x, p.y, '#ef4444', 10);
                        this.enemies.forEach(sub => {
                            if (Math.hypot(sub.x - p.x, sub.y - p.y) < 100) {
                                sub.hp -= p.damage * 0.5;
                                const kAngle = Math.atan2(sub.y - p.y, sub.x - p.x);
                                sub.knockbackX += Math.cos(kAngle) * 5;
                                sub.knockbackY += Math.sin(kAngle) * 5;
                            }
                        });
                    }

                    if (e.hp <= 0) {
                        this.spawnScrap(e.x, e.y, e.score);
                        this.looseXp.push({ x: e.x + 10, y: e.y + 10, val: e.xp, life: 1800 });
                        if (e.isBoss) {
                            this.spawnDepot(e.x, e.y);
                            this.spawnFloater(e.x, e.y, "BOSS DEFEATED!", "#fbbf24", 32);
                        }
                        audioManager.play('explode');
                        if (e.type === 'boomer') {
                            this.createExplosion(e.x, e.y, '#facc15', 20);
                            if (Math.hypot(this.player.x - e.x, this.player.y - e.y) < 80) this.damagePlayer(20);
                        }
                    }
                    break;
                }
            }
            if (hit || p.life <= 0) this.projectiles.splice(i, 1);
        }
    }

    updateParticles() {
        this.particles.forEach(p => {
            if (p.isLightning) { p.life--; } else { p.x += p.vx; p.y += p.vy; p.life--; if (p.isSmoke) { p.size += 0.1; p.vy -= 0.05; } }
        });
        this.particles = this.particles.filter(p => p.life > 0);
        this.floaters.forEach(f => { f.y -= 0.8; f.x += (Math.random() - 0.5); f.life--; });
        this.floaters = this.floaters.filter(f => f.life > 0);
    }

    draw() {
        this.ctx.fillStyle = '#020617';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

        // Smooth Zoom
        this.zoom += (this.targetZoom - this.zoom) * 0.05;

        this.ctx.save();

        // Center Zoom
        this.ctx.translate(this.canvas.width / 2, this.canvas.height / 2);
        this.ctx.scale(this.zoom, this.zoom);
        this.ctx.translate(-this.canvas.width / 2, -this.canvas.height / 2);

        if (this.shakeIntensity > 0) {
            this.ctx.translate((Math.random() - 0.5) * this.shakeIntensity, (Math.random() - 0.5) * this.shakeIntensity);
            this.shakeIntensity *= 0.9;
            if (this.shakeIntensity < 0.5) this.shakeIntensity = 0;
        }

        // Draw World Boundary
        this.ctx.strokeStyle = '#1e293b';
        this.ctx.lineWidth = 2;
        this.ctx.setLineDash([20, 20]);
        this.ctx.beginPath();
        this.ctx.arc(this.canvas.width / 2, this.canvas.height / 2, this.worldRadius, 0, Math.PI * 2);
        this.ctx.stroke();
        this.ctx.setLineDash([]);

        // Draw Track
        this.ctx.strokeStyle = '#334155'; this.ctx.lineWidth = 16; this.ctx.lineCap = 'round'; this.ctx.lineJoin = 'round';
        this.ctx.beginPath();
        const start = getSplinePoint(0, this.trackNodes);
        this.ctx.moveTo(start.x, start.y);
        for (let t = 0; t <= this.trackNodes.length; t += 0.1) { const p = getSplinePoint(t, this.trackNodes); this.ctx.lineTo(p.x, p.y); }
        this.ctx.stroke();

        this.ctx.strokeStyle = '#38bdf8'; this.ctx.lineWidth = 4; this.ctx.shadowBlur = 10; this.ctx.shadowColor = '#0ea5e9'; this.ctx.stroke(); this.ctx.shadowBlur = 0;

        this.ctx.fillStyle = '#64748b';
        this.trackNodes.forEach(n => { this.ctx.beginPath(); this.ctx.arc(n.x, n.y, 4, 0, Math.PI * 2); this.ctx.fill(); });

        // Draw Loot
        this.looseScrap.forEach(s => {
            this.ctx.fillStyle = '#fbbf24'; this.ctx.shadowBlur = 10; this.ctx.shadowColor = '#f59e0b';
            this.ctx.beginPath(); this.ctx.arc(s.x, s.y, 4, 0, Math.PI * 2); this.ctx.fill(); this.ctx.shadowBlur = 0;
        });
        this.looseXp.forEach(s => {
            this.ctx.fillStyle = '#a855f7'; this.ctx.shadowBlur = 10; this.ctx.shadowColor = '#a855f7';
            this.ctx.beginPath(); this.ctx.moveTo(s.x, s.y - 5); this.ctx.lineTo(s.x + 4, s.y + 2); this.ctx.lineTo(s.x - 4, s.y + 2); this.ctx.fill(); this.ctx.shadowBlur = 0;
        });

        this.crystals.forEach(c => c.draw(this.ctx, this.frameCount));
        this.depots.forEach(d => d.draw(this.ctx));

        // Draw Mines
        this.mines.forEach(m => {
            this.ctx.fillStyle = '#ef4444';
            this.ctx.shadowBlur = 10; this.ctx.shadowColor = '#ef4444';
            this.ctx.beginPath(); this.ctx.arc(m.x, m.y, 6, 0, Math.PI * 2); this.ctx.fill();
            this.ctx.shadowBlur = 0;
            // Blink
            if (Math.floor(Date.now() / 200) % 2 === 0) {
                this.ctx.fillStyle = '#fff';
                this.ctx.beginPath(); this.ctx.arc(m.x, m.y, 3, 0, Math.PI * 2); this.ctx.fill();
            }
        });

        this.enemies.forEach(e => e.draw(this.ctx));
        for (let i = this.player.wagons.length - 1; i >= 0; i--) this.player.wagons[i].draw(this.ctx);
        this.drones.forEach(d => d.draw(this.ctx));

        // Draw Player
        this.ctx.save(); this.ctx.translate(this.player.x, this.player.y); this.ctx.rotate(this.player.angle);
        this.ctx.fillStyle = '#1e293b'; this.ctx.fillRect(-10, -10, 30, 20);
        this.ctx.fillStyle = '#3b82f6'; this.ctx.fillRect(5, -10, 10, 20);
        this.ctx.fillStyle = '#fbbf24'; this.ctx.beginPath(); this.ctx.arc(20, 0, 6, 0, Math.PI * 2); this.ctx.fill();
        if (this.player.ramDamage > 0) { this.ctx.fillStyle = '#ef4444'; this.ctx.beginPath(); this.ctx.moveTo(20, -12); this.ctx.lineTo(35, 0); this.ctx.lineTo(20, 12); this.ctx.fill(); }
        this.ctx.restore();

        // Draw Projectiles (Enhanced)
        this.projectiles.forEach(p => {
            this.ctx.shadowBlur = 10; this.ctx.shadowColor = p.color;
            this.ctx.fillStyle = p.color;
            this.ctx.beginPath(); this.ctx.arc(p.x, p.y, 4, 0, Math.PI * 2); this.ctx.fill();
            // Core
            this.ctx.fillStyle = '#fff';
            this.ctx.beginPath(); this.ctx.arc(p.x, p.y, 2, 0, Math.PI * 2); this.ctx.fill();
            this.ctx.shadowBlur = 0;
        });

        this.particles.forEach(p => {
            if (p.isLightning) { this.ctx.strokeStyle = '#a78bfa'; this.ctx.lineWidth = 2; this.ctx.beginPath(); this.ctx.moveTo(p.x1, p.y1); this.ctx.lineTo(p.x2, p.y2); this.ctx.stroke(); }
            else {
                this.ctx.globalAlpha = p.life / (p.maxLife || 60);
                this.ctx.fillStyle = p.color;
                const s = p.isSmoke ? p.size : 3;
                this.ctx.beginPath(); this.ctx.arc(p.x, p.y, s, 0, Math.PI * 2); this.ctx.fill();
                this.ctx.globalAlpha = 1.0;
            }
        });

        this.floaters.forEach(f => { this.ctx.fillStyle = f.color; this.ctx.font = `bold ${f.size}px monospace`; this.ctx.fillText(f.text, f.x, f.y); });

        this.ctx.restore();
    }

    // Actions exposed to UI
    selectCard(card) {
        const store = useGameStore.getState();
        if (card.type === 'wagon') {
            // Check if we already have this wagon
            const existing = this.player.wagons.find(w => w.id === card.id && w.level < w.maxLevel);

            if (existing) {
                existing.upgrade();
                this.spawnFloater(existing.x, existing.y, "LEVEL UP!", "#fbbf24", 16);
            } else {
                const cap = Math.floor(this.trackNodes.length);
                if (this.player.wagons.length < cap) {
                    this.player.wagons.push(new Wagon(card.id, this.player.wagons.length));
                    useGameStore.getState().setStats({ wagonCount: this.player.wagons.length });
                } else {
                    useGameStore.getState().setStats({ scrap: store.scrap + 100 });
                    this.spawnFloater(this.player.x, this.player.y, "CAPACITY FULL (+100 SCRAP)", "#ef4444", 16);
                }
            }
        } else {
            if (card.id === 'repair') { this.player.hp = this.player.maxHp; useGameStore.getState().setStats({ hp: this.player.hp }); }
            if (card.id === 'dmg') this.player.autoDmg *= 1.5;
            if (card.id === 'speed') this.player.maxSpeed += 0.5;
            if (card.id === 'magnet') this.player.magnetRange += 100;
            if (card.id === 'ram') { this.player.ramReduction = 0.8; this.player.ramDamage += 50; }
        }
        audioManager.play('build');
        useGameStore.getState().setGameState('PLAY');
    }
}
