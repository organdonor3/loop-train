import { useGameStore } from './state';
import { getSplinePoint, getTrackLength } from './utils/math';
import { Wagon } from './classes/Wagon';
import { Enemy } from './classes/Enemy';
import { Crystal } from './classes/Crystal';
import { Drone } from './classes/Drone';
import { Depot } from './classes/Depot';
import { Projectile } from './classes/Projectile';
import { Particle } from './classes/Particle';
import { Floater } from './classes/Floater';
import { Loot } from './classes/Loot';
import { Mine } from './classes/Mine';
import { CARDS, NODE_COST, NODE_RADIUS, BOSSES } from './constants';
import { SpatialGrid } from './utils/SpatialGrid';
import * as PIXI from 'pixi.js';
import { TextureGenerator } from './utils/TextureGenerator';
import { audioManager } from './core/Audio';

export default class Game {
    constructor(canvas) {
        this.canvas = canvas;
        this.initialized = false;
        console.log('Game Constructor Start');

        // Entities (Initialize before resize)
        this.trackNodes = [];
        this.enemies = [];
        this.enemyGrid = new SpatialGrid(5000, 5000, 150); // 150px cells
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
        this.cameraMode = 'follow'; // 'follow' | 'birdseye'
        this.difficulty = { id: 'normal', multiplier: 1.0 }; // Default difficulty

        this.bindInput();

        // Wait for setup
        useGameStore.getState().setGameState('SETUP');
    }

    toggleCamera() {
        this.cameraMode = this.cameraMode === 'follow' ? 'birdseye' : 'follow';
        if (this.cameraMode === 'birdseye') {
            const minDim = Math.min(this.app.screen.width, this.app.screen.height);
            // Zoom to fit world radius with some padding
            this.targetZoom = minDim / ((this.worldRadius * 2) + 100);
        } else {
            // Reset to default zoom (will be updated in manageWaves if needed)
            this.targetZoom = 1;
        }
        this.spawnFloater(this.player.x, this.player.y, `CAMERA: ${this.cameraMode.toUpperCase()}`, "#38bdf8", 16);
        useGameStore.getState().setStats({ cameraMode: this.cameraMode });
    }

    async init(setGameInstance) {
        // PixiJS Setup
        this.app = new PIXI.Application();
        await this.app.init({ canvas: this.canvas, resizeTo: window, backgroundColor: 0x0f172a });

        console.log('PixiJS Initialized');
        this.setupLayers();
        this.textureGen = new TextureGenerator(this.app);
        this.initialized = true;
        if (setGameInstance) setGameInstance(this);
        this.start();
    }

    setupLayers() {
        this.world = new PIXI.Container();
        this.app.stage.addChild(this.world);

        this.layers = {
            background: new PIXI.Container(),
            tracks: new PIXI.Container(),
            shadows: new PIXI.Container(),
            ground: new PIXI.Container(), // Enemies, Wagons, Loot, Mines
            air: new PIXI.Container(), // Drones, Flying Enemies
            projectiles: new PIXI.Container(),
            ui: new PIXI.Container()
        };

        // Add layers in order
        this.world.addChild(this.layers.background);
        this.world.addChild(this.layers.tracks);
        this.world.addChild(this.layers.shadows);
        this.world.addChild(this.layers.ground);
        this.world.addChild(this.layers.air);
        this.world.addChild(this.layers.projectiles);
        this.world.addChild(this.layers.ui);

        // Setup Grid Graphic
        this.gridGraphic = new PIXI.Graphics();
        this.boundsGraphic = new PIXI.Graphics();
        this.layers.background.addChild(this.gridGraphic);
        this.layers.background.addChild(this.boundsGraphic);
    }

    startGame(engine, wagonCard, difficulty) {
        console.log('Game Starting...', difficulty);

        // Initialize Game State
        this.waveTimer = 0;
        this.waveDuration = 1800; // 30 seconds
        this.baseRadius = 600;
        this.worldRadius = 600;
        this.frameCount = 0;
        this.zoom = 1;
        this.targetZoom = 1;
        this.shakeIntensity = 0;
        this.difficulty = difficulty || { id: 'normal', multiplier: 1.0 };



        this.resize();
        this.drawWorldBounds();
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
        audioManager.startMusic();
        console.log('Game Started. State set to PLAY.');
    }

    resize() {
        if (!this.app || !this.app.renderer) return;

        const oldCx = this.canvas.width / 2;
        const oldCy = this.canvas.height / 2;

        // Pixi handles canvas resizing via resizeTo, but we need to update logic coords
        const newCx = this.app.screen.width / 2;
        const newCy = this.app.screen.height / 2;

        if (oldCx && oldCy) {
            const dx = newCx - oldCx;
            const dy = newCy - oldCy;

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
            this.depots.forEach(d => { d.x += dx; d.y += dy; });
            this.mines.forEach(m => { m.x += dx; m.y += dy; });
        }
    }

    bindInput() {
        window.addEventListener('keydown', e => {
            if (e.key.toLowerCase() === 'w') this.keys.w = true;
            if (e.key.toLowerCase() === 's') this.keys.s = true;
            if (e.key === ' ') this.keys.space = true;
            if (e.key.toLowerCase() === 'c') this.toggleCamera();
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
            if (e.button === 0) { this.mouse.down = false; } // Fix: Don't clear dragging here, let handleInput do it
            if (e.button === 2) this.mouse.rightDown = false;
        });

        this.canvas.addEventListener('contextmenu', e => e.preventDefault());
    }

    initTrack(type) {
        const cx = this.app ? this.app.screen.width / 2 : window.innerWidth / 2;
        const cy = this.app ? this.app.screen.height / 2 : window.innerHeight / 2;
        const r = 200;

        if (type === 'oval') {
            for (let i = 0; i < 12; i++) {
                const t = (i / 12) * Math.PI * 2;
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

        // Initialize targets for easing
        this.trackNodes.forEach(n => { n.targetX = n.x; n.targetY = n.y; });

        this.drawTrack();
    }

    drawTrack() {
        const g = new PIXI.Graphics();
        this.layers.tracks.removeChildren();
        this.layers.tracks.addChild(g);

        if (this.trackNodes.length < 2) return;

        // Draw Track Bed (Glow)
        g.moveTo(this.trackNodes[0].x, this.trackNodes[0].y);
        for (let t = 0; t <= this.trackNodes.length; t += 0.1) {
            const p = getSplinePoint(t, this.trackNodes);
            if (t === 0) g.moveTo(p.x, p.y);
            else g.lineTo(p.x, p.y);
        }
        g.stroke({ width: 45, color: 0x0ea5e9, alpha: 0.1 }); // Faint Outer Glow

        // Draw Sleepers (Ties)
        for (let t = 0; t <= this.trackNodes.length; t += 0.05) {
            const p = getSplinePoint(t, this.trackNodes);
            const pNext = getSplinePoint(t + 0.01, this.trackNodes);
            const angle = Math.atan2(pNext.y - p.y, pNext.x - p.x);

            const dx = Math.cos(angle + Math.PI / 2) * 12;
            const dy = Math.sin(angle + Math.PI / 2) * 12;

            g.moveTo(p.x - dx, p.y - dy);
            g.lineTo(p.x + dx, p.y + dy);
            g.stroke({ width: 4, color: 0x1e293b, alpha: 0.8 }); // Dark Slate Tie
        }

        // Draw Rails (Darker Void Style)
        g.moveTo(this.trackNodes[0].x, this.trackNodes[0].y);
        for (let t = 0; t <= this.trackNodes.length; t += 0.1) {
            const p = getSplinePoint(t, this.trackNodes);
            if (t === 0) g.moveTo(p.x, p.y);
            else g.lineTo(p.x, p.y);
        }
        g.stroke({ width: 6, color: 0x0f172a }); // Dark Rail Background
        g.stroke({ width: 2, color: 0x38bdf8 }); // Thin Cyan Center Line

        // GHOST TRACK / PROPOSED TRACK VISUALS
        if (this.mouse.dragging !== null && this.mouse.dragPos) {
            const idx = this.mouse.dragging;
            const curr = this.mouse.dragPos;

            // Create a temporary set of nodes for the proposed track
            const tempNodes = [...this.trackNodes];
            tempNodes[idx] = { x: curr.x, y: curr.y, fixed: this.trackNodes[idx].fixed };

            // Draw Proposed Track Spline
            const color = this.mouse.dragValid ? 0x22c55e : 0xef4444; // Green or Red

            g.moveTo(tempNodes[0].x, tempNodes[0].y);
            for (let t = 0; t <= tempNodes.length; t += 0.1) {
                const p = getSplinePoint(t, tempNodes);
                if (t === 0) g.moveTo(p.x, p.y);
                else g.lineTo(p.x, p.y);
            }
            g.stroke({ width: 6, color: color, alpha: 0.6 }); // Semi-transparent thick line
            g.stroke({ width: 2, color: 0xffffff, alpha: 0.8 }); // White core for visibility

            // Draw Cost Text
            if (this.mouse.dragCost > 0) {
                const text = new PIXI.Text(`-${this.mouse.dragCost}`, {
                    fontFamily: 'monospace',
                    fontSize: 14,
                    fill: this.mouse.dragValid ? 0xfacc15 : 0xef4444,
                    align: 'center',
                    stroke: 0x000000,
                    strokeThickness: 4
                });
                text.x = curr.x - text.width / 2;
                text.y = curr.y - 40;
                this.layers.tracks.addChild(text);
            }

            // Draw Error Text
            if (!this.mouse.dragValid && this.mouse.dragError) {
                const text = new PIXI.Text(this.mouse.dragError, {
                    fontFamily: 'monospace',
                    fontSize: 12,
                    fill: 0xef4444,
                    align: 'center',
                    fontWeight: 'bold',
                    stroke: 0x000000,
                    strokeThickness: 3
                });
                text.x = curr.x - text.width / 2;
                text.y = curr.y + 20;
                this.layers.tracks.addChild(text);
            }
        }

        // Draw Nodes
        this.trackNodes.forEach((n, i) => {
            // If dragging this node, draw it at dragPos
            let x = n.x;
            let y = n.y;
            let color = 0x38bdf8;

            if (this.mouse.dragging === i && this.mouse.dragPos) {
                x = this.mouse.dragPos.x;
                y = this.mouse.dragPos.y;
                color = this.mouse.dragValid ? 0x22c55e : 0xef4444;
            }

            g.circle(x, y, 4);
            g.fill(color);
        });
    }

    drawWorldBounds() {
        if (!this.boundsGraphic) return;
        const g = this.boundsGraphic;
        g.clear();

        const cx = this.app.screen.width / 2;
        const cy = this.app.screen.height / 2;

        // Draw Dashed Circle
        const radius = this.worldRadius;
        const circumference = 2 * Math.PI * radius;
        const dashCount = 60;
        const step = (Math.PI * 2) / dashCount;

        for (let i = 0; i < dashCount; i++) {
            if (i % 2 === 0) {
                const startAngle = i * step;
                const endAngle = (i + 1) * step;
                g.arc(cx, cy, radius, startAngle, endAngle);
                g.stroke({ width: 2, color: 0xef4444, alpha: 0.3 });
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
        const startPoint = getSplinePoint(0, this.trackNodes);
        this.player.x = startPoint.x;
        this.player.y = startPoint.y;
        this.player.trackPos = 0;
        this.player.totalDist = 0;

        this.player.history = [];
        for (let i = 300; i >= 0; i--) {
            this.player.history.push({ dist: -(i * 1.0), t: -(i * 0.01) });
        }

        this.player.wagons.push(new Wagon(this, startingWagon.id, 0));
        useGameStore.getState().setStats({ wagonCount: 1, maxWagonCount: this.trackNodes.length });

        // Engine Sprite
        if (this.playerSprite) this.playerSprite.destroy();
        const engineTexture = this.textureGen.generateEngineTexture(engine.id, '#facc15');
        this.playerSprite = new PIXI.Sprite(engineTexture);
        this.playerSprite.anchor.set(0.5);
        this.layers.ground.addChild(this.playerSprite);
    }

    start() {
        this.running = true;
        if (this.app) this.app.ticker.add(this.update, this);
    }

    stop() {
        this.running = false;
        if (this.app && this.app.ticker) this.app.ticker.remove(this.update, this);
        window.removeEventListener('resize', this.handleResize);
    }

    destroy() {
        this.stop();
        if (this.app) {
            this.app.destroy(true, { children: true, texture: true, baseTexture: true });
            this.app = null;
        }
        this.initialized = false;
    }

    update() {
        if (!this.initialized) return;
        const store = useGameStore.getState();
        if (store.gameState !== 'PLAY') return;

        this.frameCount++;
        this.updateTrackAnimations();
        this.handleInput(store);
        this.updatePhysics();
        this.manageWaves(store);
        this.collectLoot(store);

        // Update Engine Sprite
        if (this.playerSprite) {
            this.playerSprite.x = this.player.x;
            this.playerSprite.y = this.player.y;
            this.playerSprite.rotation = this.player.angle;
        }

        this.player.wagons.forEach((w, idx) => w.update(this, idx));
        this.drones.forEach(d => d.update(this));

        // Camera Follow
        const cx = this.app.screen.width / 2;
        const cy = this.app.screen.height / 2;

        if (this.cameraMode === 'birdseye') {
            this.world.pivot.set(cx, cy);
        } else {
            // Lock camera if dragging a node
            if (this.mouse.dragging === null) {
                this.world.pivot.set(this.player.x, this.player.y);
            }
        }
        this.world.position.set(cx, cy);

        // Smooth Zoom
        this.zoom += (this.targetZoom - this.zoom) * 0.05;
        this.world.scale.set(this.zoom);

        // Auto-fire from Locomotive
        if (this.frameCount % 30 === 0) {
            const t = this.getNearestEnemy(this.player.x, this.player.y, 200);
            if (t) {
                this.fireProjectile(this.player.x + 16, this.player.y + 16, t, 10, '#fbbf24', this.player.autoDmg);
                audioManager.play('shoot', (this.player.x - this.canvas.width / 2) / (this.canvas.width / 2));
            }
        }

        this.crystals.forEach(c => c.update(this));
        this.crystals = this.crystals.filter(c => c.active);

        // Update Enemies
        for (let i = this.enemies.length - 1; i >= 0; i--) {
            const e = this.enemies[i];
            e.update(this);
            if (e.hp <= 0) {
                this.spawnXp(e.x, e.y, e.xp);
                e.destroy();
                this.enemies.splice(i, 1);
            }
        }

        // Update Projectiles and Particles
        this.updateProjectiles();
        this.updateParticles();

        // Update Spatial Grid
        this.enemyGrid.clear();
        this.enemies.forEach(e => this.enemyGrid.add(e));

        // Check Mine Collisions
        for (let i = this.mines.length - 1; i >= 0; i--) {
            const m = this.mines[i];
            m.update();
            if (Math.hypot(this.player.x - m.x, this.player.y - m.y) < 30) {
                this.createExplosion(m.x, m.y, '#ef4444', 10);
                this.damagePlayer(15);
                audioManager.play('explode', (m.x - this.canvas.width / 2) / (this.canvas.width / 2));
                m.destroy();
                this.mines.splice(i, 1);
                continue;
            }
            if (m.life <= 0) {
                m.destroy();
                this.mines.splice(i, 1);
            }
        }

        // Check Depot Passage
        const lap = Math.floor(this.player.trackPos / this.trackNodes.length);
        this.depots.forEach(d => {
            d.update();
            d.checkPassage(this.player, lap);
        });
    }

    advanceWave() {
        this.waveTimer = this.waveDuration;
    }

    toggleGodMode() {
        this.godMode = !this.godMode;
        this.spawnFloater(this.player.x, this.player.y, this.godMode ? "GOD MODE ON" : "GOD MODE OFF", "#facc15", 16);
        useGameStore.getState().setStats({ godMode: this.godMode });
    }

    spawnMiniBoss() {
        const bossType = BOSSES[Math.floor(Math.random() * BOSSES.length)];
        const angle = Math.random() * Math.PI * 2;
        const r = 400; // Closer than normal for debug
        const x = this.player.x + Math.cos(angle) * r;
        const y = this.player.y + Math.sin(angle) * r;

        this.enemies.push(new Enemy(this, x, y, bossType, false, this.wave || 10));
        this.spawnFloater(x, y, "DEBUG BOSS", "#ef4444", 32);
        audioManager.play('spawn', (x - this.canvas.width / 2) / (this.canvas.width / 2));
    }

    getNearestEnemy(x, y, range) {
        let nearest = null, minDist = range;
        const candidates = this.enemyGrid.query(x, y, range);
        candidates.forEach(e => { const d = Math.hypot(e.x - x, e.y - y); if (d < minDist) { minDist = d; nearest = e; } });
        return nearest;
    }

    getStrongestEnemy(x, y, range) {
        let bestTarget = null;
        let maxHp = -1;
        let minDist = range;
        const candidates = this.enemyGrid.query(x, y, range);

        candidates.forEach(e => {
            const dist = Math.hypot(e.x - x, e.y - y);
            if (dist <= range) {
                if (e.hp > maxHp) {
                    maxHp = e.hp;
                    bestTarget = e;
                    minDist = dist;
                } else if (e.hp === maxHp && dist < minDist) {
                    bestTarget = e;
                    minDist = dist;
                }
            }
        });
        return bestTarget;
    }

    getClusteredEnemy(x, y, range) {
        let bestTarget = null;
        let maxNeighbors = -1;
        const clusterRadius = 120;
        const candidates = this.enemyGrid.query(x, y, range);

        candidates.forEach(e => {
            const distToWagon = Math.hypot(e.x - x, e.y - y);
            if (distToWagon <= range) {
                let neighbors = 0;
                // Optimization: Query grid around the enemy for neighbors
                const neighborsList = this.enemyGrid.query(e.x, e.y, clusterRadius);
                neighborsList.forEach(other => {
                    if (e !== other && Math.hypot(e.x - other.x, e.y - other.y) <= clusterRadius) {
                        neighbors++;
                    }
                });

                if (neighbors > maxNeighbors) {
                    maxNeighbors = neighbors;
                    bestTarget = e;
                }
            }
        });

        return bestTarget || this.getNearestEnemy(x, y, range);
    }

    fireProjectile(x, y, target, speed, color, dmg, isExplosive = false, isCryo = false, knockback = 0, isAcid = false, isGravity = false, isMissile = false, isCluster = false) {
        this.projectiles.push(new Projectile(this, x, y, target, speed, color, dmg, isExplosive, isCryo, knockback, isAcid, isGravity, isMissile, isCluster));
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
        this.looseScrap.push(new Loot(this, x, y, val, false));
    }

    spawnXp(x, y, val) {
        this.looseXp.push(new Loot(this, x, y, val, true));
    }

    spawnDrone(parent) {
        this.drones.push(new Drone(this, parent));
    }

    createExplosion(x, y, color, count) {
        for (let i = 0; i < count; i++) {
            const life = 30 + Math.random() * 20;
            const vx = (Math.random() - 0.5) * 8;
            const vy = (Math.random() - 0.5) * 8;
            this.particles.push(new Particle(this, x, y, color, vx, vy, life));
        }
    }

    spawnMine(x, y) {
        this.mines.push(new Mine(this, x, y));
    }

    createLightning(x1, y1, x2, y2) {
        this.particles.push(new Particle(this, x1, y1, '#fff', 0, 0, 5, 1, true, x2, y2));
    }

    spawnFloater(x, y, text, color, size = 12) {
        this.floaters.push(new Floater(this, x, y, text, color, size));
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

    updateTrackAnimations() {
        let moved = false;
        this.trackNodes.forEach(node => {
            if (node.targetX !== undefined && node.targetY !== undefined) {
                const dx = node.targetX - node.x;
                const dy = node.targetY - node.y;
                if (Math.hypot(dx, dy) > 0.5) {
                    node.x += dx * 0.2;
                    node.y += dy * 0.2;
                    moved = true;
                } else {
                    node.x = node.targetX;
                    node.y = node.targetY;
                }
            }
        });
        if (moved) this.drawTrack();
    }

    handleInput(store) {
        if (this.keys.space) {
            this.keys.space = false;
            if (store.scrap >= 20) {
                useGameStore.getState().setStats({ scrap: store.scrap - 20 });
                this.spawnFloater(this.player.x, this.player.y, "SALVO!", "#facc15", 16);
                audioManager.play('shoot', (this.player.x - this.canvas.width / 2) / (this.canvas.width / 2));
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

        // Calculate World Mouse
        const worldMouse = this.world.toLocal({ x: this.mouse.x, y: this.mouse.y });

        let hoverNode = -1;
        for (let i = 0; i < this.trackNodes.length; i++) {
            if (Math.hypot(worldMouse.x - this.trackNodes[i].x, worldMouse.y - this.trackNodes[i].y) < 20) { hoverNode = i; break; }
        }

        let onLine = false;
        if (hoverNode === -1) {
            for (let t = 0; t < this.trackNodes.length; t += 0.2) {
                const p = getSplinePoint(t, this.trackNodes);
                if (Math.hypot(worldMouse.x - p.x, worldMouse.y - p.y) < 20) { onLine = true; break; }
            }
        }

        let cursorType = 'default';
        if (this.mouse.dragging !== null) cursorType = 'grabbing';
        else if (hoverNode !== -1) cursorType = 'grab';
        else if (onLine) cursorType = 'cell';
        this.canvas.style.cursor = cursorType;

        if (this.mouse.down && this.mouse.dragging !== null) {
            const nodeIndex = this.mouse.dragging;
            const node = this.trackNodes[nodeIndex];

            // Check if node is fixed (snapped to depot)
            if (node.fixed) {
                this.spawnFloater(node.x, node.y, "LOCKED", "#ef4444", 10);
                this.mouse.dragging = null;
                return;
            }

            // Proposed new position
            let nx = worldMouse.x;
            let ny = worldMouse.y;

            // Snapping Logic
            let snapped = false;
            for (const depot of this.depots) {
                // Check Entrance
                if (Math.hypot(nx - depot.entrance.x, ny - depot.entrance.y) < 30) {
                    nx = depot.entrance.x;
                    ny = depot.entrance.y;
                    snapped = true;
                }
                // Check Exit
                else if (Math.hypot(nx - depot.exit.x, ny - depot.exit.y) < 30) {
                    nx = depot.exit.x;
                    ny = depot.exit.y;
                    snapped = true;
                }
            }

            // Min Distance Logic (Check neighbors)
            const prevNode = this.trackNodes[(nodeIndex - 1 + this.trackNodes.length) % this.trackNodes.length];
            const nextNode = this.trackNodes[(nodeIndex + 1) % this.trackNodes.length];

            if (Math.hypot(nx - prevNode.x, ny - prevNode.y) < 30 || Math.hypot(nx - nextNode.x, ny - nextNode.y) < 30) {
                // Too close to neighbors
                return;
            }

            // GHOST TRACK: Store drag position but don't update node yet
            this.mouse.dragPos = { x: nx, y: ny };

            // Calculate Validity for Visuals
            this.mouse.dragValid = true;
            this.mouse.dragError = null;

            // 1. Check Sharpness
            if (this.checkSharpness(nodeIndex, nx, ny)) {
                this.mouse.dragValid = false;
                this.mouse.dragError = "TOO SHARP";
            }

            // 2. Check Train Safety (Is train on this segment?)
            // We use the existing isNodeLocked but we need to pass the index
            // Note: isNodeLocked checks if the train is near nodeIndex in the *current* track configuration.
            // This is correct because the train is on the Ghost Track.
            if (this.isNodeLocked(nodeIndex) || store.gameState !== 'PLAY') {
                this.mouse.dragValid = false;
                this.mouse.dragError = "TRAIN ON TRACK";
            }

            // 3. Check Cost
            const oldLen = getTrackLength(this.trackNodes);
            // Temporarily calculate new length
            const originalPos = { x: node.x, y: node.y };
            node.x = nx; node.y = ny;
            const newLen = getTrackLength(this.trackNodes);
            node.x = originalPos.x; node.y = originalPos.y; // Revert

            const diff = newLen - oldLen;
            this.mouse.dragCost = 0;
            if (diff > 0) {
                this.mouse.dragCost = Math.ceil(diff * 0.5);
                if (store.scrap < this.mouse.dragCost) {
                    this.mouse.dragValid = false;
                    this.mouse.dragError = "NO SCRAP";
                }
            }

            this.drawTrack();
        }
        else if (this.mouse.down && hoverNode !== -1 && this.mouse.dragging === null) {
            // Prevent dragging fixed nodes OR nodes under the train
            if (this.trackNodes[hoverNode].fixed) {
                if (this.frameCount % 60 === 0) this.spawnFloater(this.trackNodes[hoverNode].x, this.trackNodes[hoverNode].y, "LOCKED", "#ef4444", 10);
            } else if (this.isNodeLocked(hoverNode)) {
                if (this.frameCount % 60 === 0) this.spawnFloater(this.trackNodes[hoverNode].x, this.trackNodes[hoverNode].y, "TRAIN ON TRACK", "#ef4444", 10);
            } else {
                this.mouse.dragging = hoverNode;
                this.mouse.dragStart = { x: this.trackNodes[hoverNode].x, y: this.trackNodes[hoverNode].y };
                this.mouse.dragPos = { x: this.trackNodes[hoverNode].x, y: this.trackNodes[hoverNode].y };
                this.mouse.dragValid = true;
            }
        }
        else if (!this.mouse.down && this.mouse.dragging !== null) {
            // Released Drag - COMMIT OR REVERT
            const nodeIndex = this.mouse.dragging;
            const node = this.trackNodes[nodeIndex];

            if (this.mouse.dragValid) {
                // COMMIT - Set Target for Easing
                node.targetX = this.mouse.dragPos.x;
                node.targetY = this.mouse.dragPos.y;

                if (this.mouse.dragCost > 0) {
                    useGameStore.getState().setStats({ scrap: store.scrap - this.mouse.dragCost });
                    this.spawnFloater(node.x, node.y, `-${this.mouse.dragCost}`, "#ef4444", 12);
                }

                // Check Snapping (Depots)
                for (const depot of this.depots) {
                    if (Math.hypot(node.x - depot.entrance.x, node.y - depot.entrance.y) < 10) {
                        node.fixed = true;
                        this.spawnFloater(node.x, node.y, "CONNECTED", "#22c55e", 12);
                        audioManager.play('build');
                    }
                    if (Math.hypot(node.x - depot.exit.x, node.y - depot.exit.y) < 10) {
                        node.fixed = true;
                        this.spawnFloater(node.x, node.y, "CONNECTED", "#22c55e", 12);
                        audioManager.play('build');
                    }
                }
                audioManager.play('build');
            } else {
                // REVERT
                this.spawnFloater(this.mouse.dragPos.x, this.mouse.dragPos.y, this.mouse.dragError || "INVALID", "#ef4444", 12);
            }

            this.mouse.dragging = null;
            this.mouse.dragPos = null;
            this.drawTrack();
        }

        if (this.mouse.rightDown) {
            if (hoverNode !== -1) {
                if (this.trackNodes.length > 4 && store.scrap >= 10) {
                    // Allow deleting fixed nodes (unlocks them)
                    this.trackNodes.splice(hoverNode, 1);
                    useGameStore.getState().setStats({ scrap: store.scrap - 10 });
                    this.mouse.rightDown = false;
                    audioManager.play('build', (worldMouse.x - this.canvas.width / 2) / (this.canvas.width / 2));
                    useGameStore.getState().setStats({ maxWagonCount: this.trackNodes.length });
                    this.drawTrack();
                }
            } else {
                // Add Node (Right Click on Line)
                let closestDist = 999; let closestT = -1;
                for (let t = 0; t < this.trackNodes.length; t += 0.1) {
                    const p = getSplinePoint(t, this.trackNodes);
                    const d = Math.hypot(worldMouse.x - p.x, worldMouse.y - p.y);
                    if (d < 20 && d < closestDist) { closestDist = d; closestT = t; }
                }
                if (closestT !== -1 && store.scrap >= NODE_COST) {
                    // Check radius limit
                    const p = getSplinePoint(closestT, this.trackNodes);
                    const dist = Math.hypot(worldMouse.x - (this.canvas.width / 2), worldMouse.y - (this.canvas.height / 2));

                    if (dist > this.worldRadius) {
                        this.spawnFloater(worldMouse.x, worldMouse.y, "OUT OF BOUNDS", "#ef4444", 12);
                        return;
                    }

                    const idx = Math.floor(closestT) + 1;

                    // Check Sharpness BEFORE adding
                    // Temporarily add to check angle
                    const tempNodes = [...this.trackNodes];
                    tempNodes.splice(idx, 0, { x: worldMouse.x, y: worldMouse.y });

                    // We need to check the new node (at idx) and its neighbors (idx-1, idx+1)
                    // But checkSharpness uses this.trackNodes. 
                    // Let's just use the helper but pass the temp array? 
                    // No, helper uses this.trackNodes.
                    // Let's just do it manually or modify helper. 
                    // Actually, let's just add it, check, and remove if bad?
                    // Or better: Update helper to accept nodes array? No, too much change.
                    // Let's just splice, check, and if bad, undo.

                    this.trackNodes.splice(idx, 0, { x: worldMouse.x, y: worldMouse.y });

                    if (this.checkSharpness(idx, worldMouse.x, worldMouse.y)) {
                        this.trackNodes.splice(idx, 1); // Undo
                        this.spawnFloater(worldMouse.x, worldMouse.y, "TOO SHARP", "#ef4444", 12);
                        return;
                    }

                    // Fix Train Jumping
                    // Capture old positions
                    const oldPx = this.player.x; const oldPy = this.player.y;
                    const wagonPos = this.player.wagons.map(w => ({ x: w.x, y: w.y }));

                    // Recalculate positions on new track
                    this.player.trackPos = this.getClosestT(oldPx, oldPy);

                    // Rebuild History to prevent wagons from jumping to old 't' values
                    // We create a synthetic history containing the exact positions of wagons and player on the new track
                    const newHistory = [];

                    newHistory.push({
                        dist: this.player.totalDist,
                        t: this.player.trackPos
                    });

                    this.player.history = newHistory;

                    useGameStore.getState().setStats({ scrap: store.scrap - NODE_COST });
                    this.spawnFloater(worldMouse.x, worldMouse.y, "-40", "#ef4444");
                    audioManager.play('build', (worldMouse.x - this.canvas.width / 2) / (this.canvas.width / 2));
                    this.mouse.rightDown = false;
                    useGameStore.getState().setStats({ maxWagonCount: this.trackNodes.length });
                    this.drawTrack();
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
            if (card) totalWeight += (card.weight || 10);
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

        // Sync Speed to UI
        if (this.frameCount % 5 === 0) {
            useGameStore.getState().setStats({ speed: this.player.speed, gear: this.player.gear });
        }

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

        if (this.player.history.length === 0 || Math.abs(this.player.totalDist - this.player.history[this.player.history.length - 1].dist) > 0.5) {
            this.player.history.push({ dist: this.player.totalDist, t: this.player.trackPos });
            if (this.player.history.length > 2000) this.player.history.shift();
        }

        // Reduced Smoke Frequency
        if (Math.abs(this.player.speed) > 0.1 && this.frameCount % 20 === 0) {
            const vx = (Math.random() - 0.5);
            const vy = (Math.random() - 0.5);
            this.particles.push(new Particle(this, this.player.x, this.player.y, 'rgba(255,255,255,0.1)', vx, vy, 60, 5));
        }
    }

    manageWaves(store) {
        this.waveTimer++;
        // Sync timer to store for HUD (throttle if needed, but per-frame is smoothest)
        if (this.frameCount % 5 === 0) {
            useGameStore.getState().setStats({ waveTimer: this.waveTimer });
        }

        let spawnRateBase = 180;
        if (this.difficulty.id === 'easy') spawnRateBase = 240;
        if (this.difficulty.id === 'hard') spawnRateBase = 120;

        // Dynamic Spawn Rate based on Wave
        const spawnRate = Math.max(30, spawnRateBase - (store.wave * 5));

        if (this.waveTimer % spawnRate === 0) {
            this.spawnOneEnemy(store.wave);
        }

        if (this.waveTimer >= this.waveDuration) {
            this.waveTimer = 0;
            const newWave = store.wave + 1;
            useGameStore.getState().setStats({ wave: newWave });
            this.spawnFloater(this.player.x, this.player.y, `WAVE ${newWave}`, "#facc15", 32);
            audioManager.play('levelup');

            // Increase Difficulty
            this.difficulty.multiplier += 0.1;

            // Expand World
            this.worldRadius += 100;
            this.drawWorldBounds(); // Redraw boundary visual

            // Adjust Zoom if in Birdseye
            if (this.cameraMode === 'birdseye') {
                const minDim = Math.min(this.app.screen.width, this.app.screen.height);
                this.targetZoom = minDim / ((this.worldRadius * 2) + 100);
            }
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

            this.enemies.push(new Enemy(this, x, y, bossType, false, wave));
            this.spawnFloater(x, y, "BOSS APPROACHING!", "#ef4444", 32);
            audioManager.play('spawn', (x - this.canvas.width / 2) / (this.canvas.width / 2));

            // Spawn Minions
            this.enemies.push(new Enemy(this, x + 40, y + 40, 'tank', false, wave));
            this.enemies.push(new Enemy(this, x - 40, y - 40, 'tank', false, wave));
        } else {
            // Squad Chance
            if (wave > 4 && Math.random() < 0.15) {
                const squadTypes = ['screamer', 'healer', 'shielder'];
                const squadType = squadTypes[Math.floor(Math.random() * squadTypes.length)];

                // Spawn at edge of world
                const angle = Math.random() * Math.PI * 2;
                const dist = this.worldRadius + 50;
                const x = this.canvas.width / 2 + Math.cos(angle) * dist;
                const y = this.canvas.height / 2 + Math.sin(angle) * dist;

                this.spawnSquad(squadType, x, y, wave);
                return;
            }

            // Standard Random Spawn
            let type = 'normal';
            const r = Math.random();
            if (wave > 2 && r < 0.3) type = 'swarmer';
            if (wave > 3 && r > 0.6) type = 'dasher';
            if (wave > 4 && r > 0.75) type = 'miner';
            if (wave > 5 && r > 0.85) type = 'boomer';
            if (wave > 6 && r > 0.9) type = 'tank';
            if (wave > 2 && r > 0.5 && r < 0.6) type = 'shooter';

            // New Types
            if (wave > 4 && r > 0.3 && r < 0.4) type = 'screamer';
            if (wave > 5 && r > 0.4 && r < 0.5) type = 'healer';
            if (wave > 6 && r > 0.1 && r < 0.2) type = 'shielder';

            // Elite Chance
            const isElite = Math.random() < 0.05 + (wave * 0.005);
            const isRare = !isElite && Math.random() < 0.05; // 5% chance for Rare if not Elite

            // Spawn at edge of world
            const angle = Math.random() * Math.PI * 2;
            const dist = this.worldRadius + 50;
            const x = this.canvas.width / 2 + Math.cos(angle) * dist;
            const y = this.canvas.height / 2 + Math.sin(angle) * dist;

            this.enemies.push(new Enemy(this, x, y, type, isElite, wave, isRare));
        }
    }

    spawnSquad(type, x, y, wave) {
        // Leader
        this.enemies.push(new Enemy(this, x, y, type, true, wave)); // Elite leader
        this.spawnFloater(x, y, "SQUAD DETECTED", "#facc15", 20);

        // Minions
        const offsets = [
            { x: -30, y: -30 }, { x: 30, y: -30 },
            { x: -30, y: 30 }, { x: 30, y: 30 }
        ];

        let minionType = 'tank';
        if (type === 'screamer') minionType = 'swarmer';
        if (type === 'healer') minionType = 'shooter';
        if (type === 'shielder') minionType = 'tank';

        offsets.forEach(off => {
            this.enemies.push(new Enemy(this, x + off.x, y + off.y, minionType, false, wave));
        });
    }


    spawnDepot(x, y) {
        this.depots.push(new Depot(this, x, y));
        this.spawnFloater(x, y, "DEPOT DROPPED!", "#fbbf24", 20);
        audioManager.play('build', (x - this.canvas.width / 2) / (this.canvas.width / 2));
    }



    collectLoot(store) {
        const check = (arr) => {
            for (let i = arr.length - 1; i >= 0; i--) {
                const s = arr[i];
                s.update();
                const d = Math.hypot(this.player.x - s.x, this.player.y - s.y);
                if (d < this.player.magnetRange) {
                    s.x += (this.player.x - s.x) * 0.15; s.y += (this.player.y - s.y) * 0.15;
                    if (d < 30) {
                        if (s.isXp) {
                            this.gainXp(s.val, store);
                            this.spawnFloater(s.x, s.y, `+${s.val} XP`, "#a855f7");
                        } else {
                            useGameStore.getState().setStats({ scrap: store.scrap + s.val });
                            this.spawnFloater(s.x, s.y, `+${s.val}`, "#fbbf24");
                        }
                        s.destroy();
                        arr.splice(i, 1);
                        audioManager.play('collect', (s.x - this.canvas.width / 2) / (this.canvas.width / 2));
                        continue;
                    }
                }
                if (s.life <= 0) {
                    s.destroy();
                    arr.splice(i, 1);
                }
            }
        };
        check(this.looseScrap);
        check(this.looseXp);
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

    forceLevelUp() {
        const store = useGameStore.getState();
        this.gainXp(store.maxXp - store.xp, store);
    }

    debugAutoLevelUp() {
        const { ownedWagons, wagonCount, maxWagonCount } = useGameStore.getState();

        let poolSource = CARDS;
        if (wagonCount >= maxWagonCount) {
            poolSource = CARDS.filter(c =>
                c.type === 'stat' ||
                (c.type === 'wagon' && ownedWagons.some(w => w.id === c.id))
            );
        }

        if (poolSource.length > 0) {
            const randomCard = poolSource[Math.floor(Math.random() * poolSource.length)];
            this.selectCard(randomCard);
        }
    }

    debugAddScrap() {
        const store = useGameStore.getState();
        useGameStore.getState().setStats({ scrap: store.scrap + 1000 });
        this.spawnFloater(this.player.x, this.player.y, "+1000 SCRAP", "#fbbf24", 24);
        audioManager.play('collect');
    }

    debugSpawnDepot() {
        // Spawn depot near player
        const angle = Math.random() * Math.PI * 2;
        const dist = 300;
        const x = this.player.x + Math.cos(angle) * dist;
        const y = this.player.y + Math.sin(angle) * dist;
        this.spawnDepot(x, y);
    }

    isNodeLocked(nodeIndex) {
        const len = this.trackNodes.length;
        const check = (t) => {
            const idx = Math.floor(t);
            // Nodes involved in segment 'idx' are idx-1, idx, idx+1, idx+2
            // So if nodeIndex is any of those, it's locked.
            // Check distance in index space (handling wrap)
            const diff = Math.abs(idx - nodeIndex);
            const diffWrap = Math.abs(idx - nodeIndex + len) % len;
            const diffWrap2 = Math.abs(idx - nodeIndex - len) % len;

            // If the train is on segment 'idx', it depends on nodes idx-1, idx, idx+1, idx+2
            // So if nodeIndex == idx-1, idx, idx+1, idx+2, return true.

            // Let's simplify: If nodeIndex is within 1 index of idx (idx-1, idx, idx+1)
            // This covers the immediate segment. idx+2 is technically involved but less critical for small moves.
            // Let's try tightening to <= 1.
            return (diff <= 1 || diffWrap <= 1 || diffWrap2 <= 1);
        };

        if (check(this.player.trackPos)) return true;
        for (const w of this.player.wagons) {
            if (check(w.trackPos)) return true;
        }
        return false;
    }

    getClosestT(x, y) {
        let bestT = 0;
        let minDist = Infinity;
        // Coarse search
        for (let t = 0; t < this.trackNodes.length; t += 0.5) {
            const p = getSplinePoint(t, this.trackNodes);
            const d = Math.hypot(p.x - x, p.y - y);
            if (d < minDist) { minDist = d; bestT = t; }
        }
        // Refine search
        let start = bestT - 0.5;
        let end = bestT + 0.5;
        for (let t = start; t <= end; t += 0.05) {
            const p = getSplinePoint(t, this.trackNodes);
            const d = Math.hypot(p.x - x, p.y - y);
            if (d < minDist) { minDist = d; bestT = t; }
        }
        return bestT;
    }

    checkSharpness(nodeIndex, nx, ny) {
        const len = this.trackNodes.length;
        const prev = this.trackNodes[(nodeIndex - 1 + len) % len];
        const next = this.trackNodes[(nodeIndex + 1) % len];

        // Vector 1: Prev -> Node
        const v1x = nx - prev.x;
        const v1y = ny - prev.y;
        // Vector 2: Node -> Next
        const v2x = next.x - nx;
        const v2y = next.y - ny;

        const angle1 = Math.atan2(v1y, v1x);
        const angle2 = Math.atan2(v2y, v2x);

        let diff = Math.abs(angle1 - angle2);
        if (diff > Math.PI) diff = 2 * Math.PI - diff;

        return diff > (Math.PI / 2.5);
    }

    updateProjectiles() {
        for (let i = this.projectiles.length - 1; i >= 0; i--) {
            const p = this.projectiles[i];
            p.update();
            let hit = false;

            // Spatial Grid Collision
            const candidates = this.enemyGrid.query(p.x, p.y, 60); // Query slightly larger than max enemy size
            for (const e of candidates) {
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
                        const nearby = this.enemyGrid.query(p.x, p.y, 150);
                        nearby.forEach(sub => {
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
                            if (Math.hypot(sub.x - p.x, sub.y - p.y) < 50) {
                                sub.hp -= p.damage * 0.5;
                            }
                        });
                    }
                    break;
                }
            }

            if (hit || p.life <= 0) {
                if (p.isCluster) {
                    // Split into mini rockets
                    for (let j = 0; j < 6; j++) {
                        const angle = (j / 6) * Math.PI * 2;
                        const mx = p.x + Math.cos(angle) * 10;
                        const my = p.y + Math.sin(angle) * 10;
                        const mini = new Projectile(this, mx, my, null, 8, 'cluster_mini', p.damage * 0.3, true, false, 2, false, false, false, false);
                        mini.vx = Math.cos(angle) * 8;
                        mini.vy = Math.sin(angle) * 8;
                        mini.life = 30;
                        this.projectiles.push(mini);
                    }
                    this.createExplosion(p.x, p.y, '#facc15', 15);
                    audioManager.play('explode');
                }
                p.destroy();
                this.projectiles.splice(i, 1);
            }
        }
    }

    updateParticles() {
        for (let i = this.particles.length - 1; i >= 0; i--) {
            const p = this.particles[i];
            p.update();
            if (p.life <= 0) {
                p.destroy();
                this.particles.splice(i, 1);
            }
        }

        for (let i = this.floaters.length - 1; i >= 0; i--) {
            const f = this.floaters[i];
            f.update();
            if (f.life <= 0) {
                f.destroy();
                this.floaters.splice(i, 1);
            }
        }
    }

    draw() {
        // Deprecated: Canvas drawing disabled.
        // All rendering is now handled by PixiJS entities.
    }

    // Actions exposed to UI
    selectCard(card) {
        const store = useGameStore.getState();
        if (card.type === 'wagon') {
            // Check if we already have this wagon
            const existing = this.player.wagons.find(w => w.type === card.id && w.level < w.maxLevel);

            if (existing) {
                existing.upgrade();
                this.spawnFloater(existing.x, existing.y, "LEVEL UP!", "#fbbf24", 16);
            } else {
                const cap = Math.floor(this.trackNodes.length);
                if (this.player.wagons.length < cap) {
                    this.player.wagons.push(new Wagon(this, card.id, this.player.wagons.length));
                    useGameStore.getState().setStats({ wagonCount: this.player.wagons.length });
                } else {
                    useGameStore.getState().setStats({ scrap: store.scrap + 100 });
                    this.spawnFloater(this.player.x, this.player.y, "CAPACITY FULL (+100 SCRAP)", "#ef4444", 16);
                    audioManager.play('build');
                    useGameStore.getState().setGameState('PLAY');
                    return;
                }
            }

            // Sync owned wagons to store for UI
            const owned = this.player.wagons.map(w => ({ id: w.type, level: w.level, maxLevel: w.maxLevel }));
            useGameStore.getState().setStats({ ownedWagons: owned });

        } else {
            if (card.id === 'repair') { this.player.hp = this.player.maxHp; useGameStore.getState().setStats({ hp: this.player.hp }); }
            if (card.id === 'dmg') this.player.autoDmg *= 1.5;
            if (card.id === 'speed') this.player.maxSpeed += 0.5;
            if (card.id === 'magnet') this.player.magnetRange += 100;
            if (card.id === 'ram') { this.player.ramReduction = 0.8; this.player.ramDamage += 50; }
        }
        audioManager.play('build'); // UI sound, center pan
        useGameStore.getState().setGameState('PLAY');
    }
}
