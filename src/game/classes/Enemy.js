import { audioManager } from '../core/Audio';
import { Container, Sprite, Graphics } from 'pixi.js';

export class Enemy {
    constructor(game, x, y, type, isElite, wave, isRare = false) {
        this.game = game;
        this.x = x; this.y = y; this.type = type; this.isElite = isElite; this.isRare = isRare;
        const wMod = wave * 0.08;
        const eliteMod = isElite ? 2.5 : 1;
        const rareMod = isRare ? 1.5 : 1;
        this.scale = isElite ? 1.5 : (isRare ? 1.2 : 1);
        this.speedMod = 1.0;
        this.wave = wave;

        // Rare Passive
        this.passive = null;
        if (this.isRare) {
            const passives = ['REGEN', 'SPEED'];
            this.passive = passives[Math.floor(Math.random() * passives.length)];
        }

        // Boss Stats
        if (type === 'crusher') { this.hp = 2000 * (1 + wMod); this.speed = 0.6; this.color = '#7f1d1d'; this.size = 40; this.score = 500; this.xp = 200; this.isBoss = true; }
        else if (type === 'queen') { this.hp = 1500 * (1 + wMod); this.speed = 0.375; this.color = '#be185d'; this.size = 35; this.score = 500; this.xp = 200; this.isBoss = true; }
        else if (type === 'sniper_boss') { this.hp = 1200 * (1 + wMod); this.speed = 0.45; this.color = '#facc15'; this.size = 30; this.score = 500; this.xp = 200; this.isBoss = true; }
        else if (type === 'tesla_boss') { this.hp = 1800 * (1 + wMod); this.speed = 0.75; this.color = '#4c1d95'; this.size = 35; this.score = 500; this.xp = 200; this.isBoss = true; }
        else if (type === 'fortress') { this.hp = 3000 * (1 + wMod); this.speed = 0.15; this.color = '#3f3f46'; this.size = 45; this.score = 500; this.xp = 200; this.isBoss = true; }
        else if (type === 'phantom') { this.hp = 1000 * (1 + wMod); this.speed = 1.125; this.color = '#0f172a'; this.size = 30; this.score = 500; this.xp = 200; this.isBoss = true; }

        // Normal Enemies
        else if (type === 'tank') { this.hp = 120 * (1 + wMod) * eliteMod * rareMod; this.speed = 0.26; this.color = '#166534'; this.size = 18 * this.scale; this.score = 30; this.xp = 30 * eliteMod * rareMod; }
        else if (type === 'swarmer') { this.hp = 10 * (1 + wMod) * eliteMod * rareMod; this.speed = 2.1; this.color = '#ef4444'; this.size = 8 * this.scale; this.score = 5; this.xp = 5 * eliteMod * rareMod; }
        else if (type === 'dasher') { this.hp = 25 * (1 + wMod) * eliteMod * rareMod; this.speed = 2.6; this.color = '#f97316'; this.size = 12 * this.scale; this.score = 12; this.xp = 15 * eliteMod * rareMod; }
        else if (type === 'boomer') { this.hp = 50 * (1 + wMod) * eliteMod * rareMod; this.speed = 0.75; this.color = '#facc15'; this.size = 16 * this.scale; this.score = 20; this.xp = 20 * eliteMod * rareMod; }
        else if (type === 'miner') { this.hp = 60 * (1 + wMod) * eliteMod * rareMod; this.speed = 1.125; this.color = '#71717a'; this.size = 15 * this.scale; this.score = 25; this.xp = 25 * eliteMod * rareMod; }
        // New Types
        else if (type === 'screamer') { this.hp = 30 * (1 + wMod) * eliteMod * rareMod; this.speed = 1.8; this.color = '#ec4899'; this.size = 12 * this.scale; this.score = 25; this.xp = 25 * eliteMod * rareMod; }
        else if (type === 'healer') { this.hp = 150 * (1 + wMod) * eliteMod * rareMod; this.speed = 0.4; this.color = '#22c55e'; this.size = 20 * this.scale; this.score = 40; this.xp = 40 * eliteMod * rareMod; }
        else if (type === 'shielder') { this.hp = 100 * (1 + wMod) * eliteMod * rareMod; this.speed = 0.6; this.color = '#3b82f6'; this.size = 18 * this.scale; this.score = 35; this.xp = 35 * eliteMod * rareMod; }
        else { this.hp = 40 * (1 + wMod) * eliteMod * rareMod; this.speed = 0.9; this.color = '#a855f7'; this.size = 14 * this.scale; this.score = 10; this.xp = 10 * eliteMod * rareMod; }

        this.maxHp = this.hp;
        this.shield = 0;

        this.vx = 0; this.vy = 0;
        this.knockbackX = 0; this.knockbackY = 0;
        this.frozenTimer = 0;
        this.acidTimer = 0;
        this.skillTimer = 0;

        // Movement State
        this.swarmerAngle = Math.random() * Math.PI * 2;
        this.dashState = 'IDLE'; // IDLE, WINDUP, DASHING, COOLDOWN
        this.dashTimer = 0;
        this.dashDir = 0;
        this.stutterTimer = 0;
        this.age = Math.random() * 100;
        this.supportTimer = 0;

        // PixiJS Setup
        this.container = new Container();
        this.container.x = x;
        this.container.y = y;

        // Visuals
        this.appendages = new Graphics();
        this.container.addChild(this.appendages);

        const texture = this.game.textureGen.generateEnemyTexture(type, this.color, this.size);
        this.sprite = new Sprite(texture);
        this.sprite.anchor.set(0.5);
        this.container.addChild(this.sprite);

        // Elite/Boss/Rare Indicator
        if (this.isElite || this.isBoss || this.isRare) {
            const ring = new Graphics();
            ring.stroke({ width: 3, color: this.isRare ? 0xfacc15 : this.color }); // Gold for Rare
            ring.circle(0, 0, this.size + 6);
            this.container.addChild(ring);
        }

        // Boss HP Bar
        if (this.isBoss) {
            this.hpBar = new Graphics();
            this.container.addChild(this.hpBar);
        }

        this.game.layers.ground.addChild(this.container);
    }

    update(game) {
        const player = game.player;
        this.age += 0.1;

        // Predictive Targeting for fast enemies
        let tx = player.x;
        let ty = player.y;
        if (this.type === 'dasher' || this.type === 'screamer') {
            const lead = 30; // Look ahead
            tx += Math.cos(player.angle) * player.speed * lead;
            ty += Math.sin(player.angle) * player.speed * lead;
        }

        let angle = Math.atan2(ty - this.y, tx - this.x);
        let targetSpeed = this.speed;

        // Boid Separation
        const neighbors = game.enemyGrid.query(this.x, this.y, this.size * 2);
        let sepX = 0; let sepY = 0;
        let count = 0;
        neighbors.forEach(n => {
            if (n !== this) {
                const d = Math.hypot(this.x - n.x, this.y - n.y);
                if (d < this.size + n.size) {
                    const push = (this.size + n.size - d) * 0.05;
                    const a = Math.atan2(this.y - n.y, this.x - n.x);
                    sepX += Math.cos(a) * push;
                    sepY += Math.sin(a) * push;
                    count++;
                }
            }
        });
        if (count > 0) {
            this.vx += sepX;
            this.vy += sepY;
        }

        // Organic Stutter
        if (Math.random() < 0.005) this.stutterTimer = Math.random() * 20 + 10;
        if (this.stutterTimer > 0) {
            this.stutterTimer--;
            targetSpeed *= 0.1;
            this.sprite.x = (Math.random() - 0.5) * 2; // Shake
        } else {
            this.sprite.x = 0;
        }

        // --- Unique Movement Logic ---

        // Swarmer: Circle the player
        if (this.type === 'swarmer') {
            this.swarmerAngle += 0.02; // Rotate
            const radius = 120;
            const targetX = player.x + Math.cos(this.swarmerAngle) * radius;
            const targetY = player.y + Math.sin(this.swarmerAngle) * radius;
            angle = Math.atan2(targetY - this.y, targetX - this.x);
        }

        // Shooter: Kite the player
        else if (this.type === 'shooter') {
            const dist = Math.hypot(player.x - this.x, player.y - this.y);
            if (dist < 250) {
                // Too close, back away
                angle = Math.atan2(this.y - player.y, this.x - player.x);
            } else if (dist > 400) {
                // Too far, approach
                angle = Math.atan2(player.y - this.y, player.x - this.x);
            } else {
                // Sweet spot, strafe
                angle += Math.PI / 2;
            }
        }

        // Dasher: Charge Attack
        else if (this.type === 'dasher') {
            const dist = Math.hypot(player.x - this.x, player.y - this.y);

            if (this.dashState === 'IDLE') {
                if (dist < 300) {
                    this.dashState = 'WINDUP';
                    this.dashTimer = 45;
                }
            } else if (this.dashState === 'WINDUP') {
                targetSpeed = 0;
                this.dashTimer--;
                // Shake effect
                this.x += (Math.random() - 0.5) * 2;
                this.y += (Math.random() - 0.5) * 2;
                if (this.dashTimer <= 0) {
                    this.dashState = 'DASHING';
                    this.dashTimer = 30;
                    this.dashDir = Math.atan2(player.y - this.y, player.x - this.x);
                    game.createExplosion(this.x, this.y, '#f97316', 5);
                }
            } else if (this.dashState === 'DASHING') {
                angle = this.dashDir;
                targetSpeed = this.speed * 4; // Fast dash
                this.dashTimer--;
                if (this.dashTimer <= 0) {
                    this.dashState = 'COOLDOWN';
                    this.dashTimer = 60;
                }
            } else if (this.dashState === 'COOLDOWN') {
                targetSpeed = this.speed * 0.2;
                this.dashTimer--;
                if (this.dashTimer <= 0) {
                    this.dashState = 'IDLE';
                }
            }
        }

        // Support Types Logic
        this.supportTimer++;
        if (this.supportTimer % 60 === 0) {
            const range = 150;
            const allies = game.enemyGrid.query(this.x, this.y, range);

            if (this.type === 'screamer') {
                allies.forEach(e => {
                    if (e !== this) {
                        e.buffTimer = 120; // Speed boost
                        game.spawnFloater(e.x, e.y, "SPD", "#ec4899", 8);
                    }
                });
            } else if (this.type === 'healer') {
                allies.forEach(e => {
                    if (e !== this && e.hp < e.maxHp) {
                        e.hp = Math.min(e.maxHp, e.hp + 10);
                        game.spawnFloater(e.x, e.y, "+10", "#22c55e", 8);
                    }
                });
            } else if (this.type === 'shielder') {
                allies.forEach(e => {
                    if (e !== this && e.shield < 20) {
                        e.shield = 20;
                        game.spawnFloater(e.x, e.y, "SHIELD", "#3b82f6", 8);
                    }
                });
            }
        }

        // Acid Damage
        if (this.acidTimer > 0) {
            this.acidTimer--;
            if (this.acidTimer % 60 === 0) {
                this.hp -= 5;
                game.spawnFloater(this.x, this.y, "5", "#84cc16", 10);
            }
        }

        // Rare Passives
        if (this.isRare && game.frameCount % 60 === 0) {
            const range = 200;
            game.enemies.forEach(e => {
                if (e !== this && Math.hypot(e.x - this.x, e.y - this.y) < range) {
                    if (this.passive === 'REGEN') {
                        e.hp += 2;
                        game.spawnFloater(e.x, e.y, "+2", "#22c55e", 10);
                    }
                    if (this.passive === 'SPEED') {
                        e.speedMod = 1.5; // Temporary speed boost
                        // Reset speed mod logic needs to be robust, for now relies on next frame reset or similar
                        // Actually, let's just apply a push? No, speed mod is better.
                        // We need to ensure it doesn't get stuck.
                        // Let's set a timer on the target?
                        e.buffTimer = 60;
                    }
                }
            });

            // Visual Pulse
            const pulse = new Graphics();
            pulse.stroke({ width: 2, color: 0xfacc15, alpha: 0.5 });
            pulse.circle(0, 0, range);
            this.container.addChild(pulse);
            // Animate pulse (simple fade out)
            // For now just add and remove next frame? No, let's skip complex animation for this step.
            setTimeout(() => pulse.destroy(), 200);
        }

        // Buff Timer (from Speed Aura)
        if (this.buffTimer > 0) {
            this.speedMod = 1.5;
            this.buffTimer--;
        }

        // Miner Logic: Move towards track, avoid player if too close
        if (this.type === 'miner') {
            // Find nearest track node
            let nearest = null; let minDist = 9999;
            game.trackNodes.forEach(n => {
                const d = Math.hypot(n.x - this.x, n.y - this.y);
                if (d < minDist) { minDist = d; nearest = n; }
            });

            if (nearest) {
                // Move towards track
                angle = Math.atan2(nearest.y - this.y, nearest.x - this.x);

                // If too close to player, run away
                if (Math.hypot(player.x - this.x, player.y - this.y) < 200) {
                    angle = Math.atan2(this.y - player.y, this.x - player.x);
                }
            }

            this.skillTimer++;
            if (this.skillTimer % 180 === 0) {
                game.spawnMine(this.x, this.y);
            }
        }

        this.knockbackX *= 0.8; this.knockbackY *= 0.8;

        if (this.frozenTimer > 0) { this.speedMod = 0.5; this.frozenTimer--; } else { this.speedMod = 1.0; }
        const actualSpeed = targetSpeed * this.speedMod;

        this.vx = (Math.cos(angle) * actualSpeed) + this.knockbackX;
        this.vy = (Math.sin(angle) * actualSpeed) + this.knockbackY;
        this.x += this.vx; this.y += this.vy;

        // Update Container Position
        this.container.x = this.x;
        this.container.y = this.y;
        this.container.rotation = angle; // Rotate sprite to face movement

        // Boss Skills
        if (this.isBoss) {
            this.skillTimer++;

            // Queen: Spawn Swarmers
            if (this.type === 'queen' && this.skillTimer % 120 === 0) {
                for (let i = 0; i < 3; i++) game.enemies.push(new Enemy(game, this.x + (Math.random() * 40 - 20), this.y + (Math.random() * 40 - 20), 'swarmer', false, this.wave));
            }

            // Sniper Boss: Snipe
            if (this.type === 'sniper_boss' && this.skillTimer % 180 === 0) {
                game.fireProjectile(this.x, this.y, player, 15, '#ef4444', 30, true); // Hostile projectile
            }

            // Tesla Boss: Zap
            if (this.type === 'tesla_boss' && this.skillTimer % 90 === 0) {
                if (Math.hypot(player.x - this.x, player.y - this.y) < 200) {
                    game.createLightning(this.x, this.y, player.x, player.y);
                    game.damagePlayer(10);
                }
            }

            // Phantom: Teleport
            if (this.type === 'phantom' && this.skillTimer % 200 === 0) {
                this.x = player.x + (Math.random() > 0.5 ? 300 : -300);
                this.y = player.y + (Math.random() > 0.5 ? 300 : -300);
                game.createExplosion(this.x, this.y, '#fff', 20);
            }

            // Crusher: Charge Attack
            if (this.type === 'crusher') {
                const chargeCycle = this.skillTimer % 240;
                if (chargeCycle < 180) {
                    // Normal Movement
                    this.speedMod = 1.0;
                } else if (chargeCycle < 210) {
                    // Wind up (Stop and Shake)
                    this.speedMod = 0;
                    this.x += (Math.random() - 0.5) * 2;
                    this.y += (Math.random() - 0.5) * 2;
                } else if (chargeCycle === 210) {
                    // Dash
                    const angle = Math.atan2(player.y - this.y, player.x - this.x);
                    this.vx = Math.cos(angle) * 15;
                    this.vy = Math.sin(angle) * 15;
                    game.createExplosion(this.x, this.y, '#7f1d1d', 10);
                    audioManager.play('spawn'); // Re-use spawn sound for roar
                } else {
                    // Decelerate
                    this.x += this.vx;
                    this.y += this.vy;
                    this.vx *= 0.9;
                    this.vy *= 0.9;
                    this.speedMod = 0; // Override normal movement

                    // Damage while dashing
                    if (Math.hypot(player.x - this.x, player.y - this.y) < this.size + 20) {
                        game.damagePlayer(2);
                    }
                }
            }

            // Fortress: Spawn Turrets
            if (this.type === 'fortress' && this.skillTimer % 300 === 0) {
                const turret = new Enemy(game, this.x, this.y, 'tank', true, this.wave);
                turret.speed = 0; // Static
                turret.color = '#52525b'; // Zinc
                // Override update to just shoot? For now, let it be a static tank that hurts on contact.
                // Better: Spawn a "sniper_boss" variant but smaller/weaker?
                // Let's just spawn a static 'tank' that acts as a wall.
                game.enemies.push(turret);
                game.createExplosion(this.x, this.y, '#52525b', 10);
            }

            // Update Boss HP Bar
            if (this.hpBar) {
                this.hpBar.clear();
                this.hpBar.fill(0x000000);
                this.hpBar.rect(-20, -this.size - 15, 40, 6);
                this.hpBar.fill(0xef4444);
                const maxHp = (this.type === 'crusher' ? 2000 : 1500) * (1 + this.wave * 0.08); // Approx
                const pct = Math.max(0, this.hp / maxHp);
                this.hpBar.rect(-20, -this.size - 15, 40 * pct, 6);
            }
        }

        const hitCheck = (obj) => Math.hypot(obj.x - this.x, obj.y - this.y) < 24 + this.size;
        let hit = hitCheck(player);

        if (hit && player.wagons.some(w => w.type === 'spike')) { this.hp -= 2; }

        if (hit) {
            const kAngle = Math.atan2(this.y - player.y, this.x - player.x);
            this.knockbackX = Math.cos(kAngle) * 10; this.knockbackY = Math.sin(kAngle) * 10;

            let dmgTake = (this.isBoss ? 20 : (this.type === 'tank' ? 8 : 1)) * (this.isElite ? 2 : 1);
            dmgTake *= (1 - player.ramReduction); dmgTake *= 0.8;

            game.damagePlayer(dmgTake);
            this.hp -= (5 + player.ramDamage);
            game.shake(5);
            game.createExplosion(this.x, this.y, '#ef4444', 5);
            audioManager.play('explode');

            if (this.type === 'boomer') {
                game.createExplosion(this.x, this.y, '#facc15', 40);
                game.damagePlayer(20);
                this.hp = 0;
            }
        }

        // Visual updates
        this.sprite.tint = this.frozenTimer > 0 ? 0x67e8f9 : 0xFFFFFF;

        // Breathing Effect
        const breath = 1 + Math.sin(this.age * 0.1) * 0.05;
        this.sprite.scale.set(breath);

        // Draw Appendages
        if (this.frameCount % 2 === 0 || true) { // Always update for smoothness
            const g = this.appendages;
            g.clear();
            const legCount = this.type === 'swarmer' ? 6 : (this.type === 'tank' ? 4 : 8);
            const legLen = this.size * 0.8;

            g.stroke({ width: 2, color: this.color });
            for (let i = 0; i < legCount; i++) {
                const baseAngle = (i / legCount) * Math.PI * 2 + this.age * 0.05;
                const wiggle = Math.sin(this.age * 0.5 + i) * 0.3;
                const lx = Math.cos(baseAngle + wiggle) * legLen;
                const ly = Math.sin(baseAngle + wiggle) * legLen;
                g.moveTo(0, 0);
                g.lineTo(lx, ly);
            }

            // Draw Shield
            if (this.shield > 0) {
                g.stroke({ width: 2, color: 0x3b82f6, alpha: 0.6 });
                g.circle(0, 0, this.size + 8);
            }
        }
    }

    destroy() {
        if (this.container) {
            this.container.destroy({ children: true });
        }
    }
}
