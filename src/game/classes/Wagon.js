import { getSplinePoint } from '../utils/math';
import { audioManager } from '../core/Audio';
import { Container, Graphics, Sprite } from 'pixi.js';

export class Wagon {
    constructor(game, type, id) {
        this.game = game;
        this.type = type;
        this.id = id;
        this.level = 1;
        this.maxLevel = 5;

        this.trackPos = 0;
        this.x = 0;
        this.y = 0;
        this.angle = 0;

        this.turretAngle = 0;
        this.cooldown = 0;
        this.maxCooldown = 60;

        // Base Stats
        this.stats = {
            damage: 1.0,
            fireRate: 1.0,
            range: 1.0,
            turnRate: 0.1 // Radians per frame
        };

        this.initStats();

        // PixiJS Setup
        this.container = new Container();

        // Initial Visuals
        this.updateVisuals();

        this.game.layers.ground.addChild(this.container);
    }

    initStats() {
        if (this.type === 'sniper') { this.stats.range = 1.5; this.stats.damage = 2.0; this.stats.turnRate = 0.02; this.stats.fireRate = 0.5; }
        if (this.type === 'flame') { this.stats.range = 0.6; this.stats.fireRate = 5.0; this.stats.turnRate = 0.15; }
        if (this.type === 'mortar') { this.stats.range = 1.2; this.stats.damage = 1.5; this.stats.turnRate = 0.05; this.stats.fireRate = 0.3; }
        if (this.type === 'tesla') { this.stats.range = 0.8; this.stats.fireRate = 1.2; }
        if (this.type === 'cryo') { this.stats.range = 0.8; this.stats.fireRate = 2.0; }
        if (this.type === 'stasis') { this.stats.range = 1.0; }
        if (this.type === 'railgun') { this.stats.range = 2.0; this.stats.damage = 3.0; this.stats.turnRate = 0.02; this.stats.fireRate = 0.2; }
        if (this.type === 'acid') { this.stats.range = 0.8; this.stats.fireRate = 3.0; this.stats.turnRate = 0.1; }
        if (this.type === 'gravity') { this.stats.range = 1.5; this.stats.damage = 0.5; this.stats.turnRate = 0.05; this.stats.fireRate = 0.2; }
        if (this.type === 'thumper') { this.stats.range = 1.0; this.stats.damage = 1.0; this.stats.fireRate = 0.3; }
        if (this.type === 'missile') { this.stats.range = 1.8; this.stats.damage = 2.5; this.stats.fireRate = 0.4; this.stats.turnRate = 0.1; }
        if (this.type === 'cluster') { this.stats.range = 2.2; this.stats.damage = 4.0; this.stats.fireRate = 0.15; this.stats.turnRate = 0.05; }
    }

    upgrade() {
        if (this.level >= this.maxLevel) return;
        this.level++;

        // General scaling
        this.stats.damage *= 1.2;
        this.stats.fireRate *= 1.1;

        // Specific scaling
        if (this.type === 'sniper') { this.stats.turnRate += 0.02; this.stats.damage *= 1.1; }
        if (this.type === 'flame') { this.stats.range *= 1.1; this.stats.fireRate *= 1.2; }
        if (this.type === 'gunner') { this.stats.fireRate *= 1.15; }
        if (this.type === 'mortar') { this.stats.range *= 1.15; }
        if (this.type === 'tesla') { this.stats.range *= 1.1; }
        if (this.type === 'cryo') { this.stats.range *= 1.1; }

        // Support scaling
        if (this.type === 'fabricator') { this.stats.damage += 0.1; } // Buff strength
        if (this.type === 'medic') { this.stats.fireRate *= 1.2; } // Heal rate
        if (this.type === 'stasis') { this.stats.range *= 1.15; } // Slow radius

        // New Cars Scaling
        if (this.type === 'railgun') { this.stats.damage *= 1.15; }
        if (this.type === 'acid') { this.stats.range *= 1.1; }
        if (this.type === 'gravity') { this.stats.range *= 1.1; }
        if (this.type === 'thumper') { this.stats.damage *= 1.2; }
        if (this.type === 'missile') { this.stats.damage *= 1.15; this.stats.range *= 1.1; }
        if (this.type === 'cluster') { this.stats.damage *= 1.2; }

        audioManager.play('build');
        this.updateVisuals(); // Redraw level indicators
    }

    update(game, idx) {
        // Track following logic
        const player = game.player;
        const targetDist = player.totalDist - (45 * (idx + 1));
        let foundT = player.trackPos;

        for (let i = player.history.length - 1; i >= 0; i--) {
            const rec = player.history[i];
            if (rec.dist <= targetDist) {
                if (i < player.history.length - 1) {
                    const nextRec = player.history[i + 1];
                    const range = nextRec.dist - rec.dist;
                    const diff = targetDist - rec.dist;
                    const ratio = range === 0 ? 0 : diff / range;
                    foundT = rec.t + (nextRec.t - rec.t) * ratio;
                } else {
                    foundT = rec.t;
                }
                break;
            }
        }

        this.trackPos = foundT;
        const p1 = getSplinePoint(this.trackPos, game.trackNodes);
        const p2 = getSplinePoint(this.trackPos + 0.05, game.trackNodes);
        this.x = p1.x; this.y = p1.y;
        this.angle = Math.atan2(p2.y - p1.y, p2.x - p1.x);

        // Update Container
        this.container.x = this.x;
        this.container.y = this.y;
        this.container.rotation = this.angle;

        // Passive Effects
        if (this.type === 'miner' && game.frameCount % Math.max(60, 180 - (this.level * 20)) === 0) game.spawnScrap(this.x, this.y, 5 * this.level);
        if (this.type === 'medic' && game.frameCount % Math.max(30, 120 / this.stats.fireRate) === 0) game.healPlayer(1 * this.level);
        if (this.type === 'stasis') {
            const r = 225 * this.stats.range;
            game.enemies.forEach(e => {
                if (Math.hypot(e.x - this.x, e.y - this.y) < r) {
                    e.speedMult = 0.5 - (this.level * 0.05);
                }
            });
        }

        // Combat Logic
        if (this.cooldown > 0) this.cooldown--;
        else {
            // Check for buff from neighbors (Fabricator)
            let buff = 1.0;
            const prev = game.player.wagons[idx - 1];
            const next = game.player.wagons[idx + 1];
            if (prev && prev.type === 'fabricator') buff += (0.2 + (prev.level * 0.1));
            if (next && next.type === 'fabricator') buff += (0.2 + (next.level * 0.1));

            if (this.type === 'gunner') this.fireStandard(game, buff);
            else if (this.type === 'sniper') this.fireSniper(game, buff);
            else if (this.type === 'flame') this.fireFlame(game, buff);
            else if (this.type === 'tesla') this.fireTesla(game, buff);
            else if (this.type === 'mortar') this.fireMortar(game, buff);
            else if (this.type === 'cryo') this.fireCryo(game, buff);
            else if (this.type === 'drone') this.spawnDrone(game);
            else if (this.type === 'railgun') this.fireRailgun(game, buff);
            else if (this.type === 'acid') this.fireAcid(game, buff);
            else if (this.type === 'gravity') this.fireGravity(game, buff);
            else if (this.type === 'thumper') this.fireThumper(game, buff);
            else if (this.type === 'missile') this.fireMissile(game, buff);
            else if (this.type === 'cluster') this.fireCluster(game, buff);
        }

        // Update Turret Rotation
        if (this.turretSprite) {
            this.turretSprite.rotation = this.turretAngle - this.angle;
        }

        // Update Cooldown Bar
        this.updateCooldownBar();
    }

    updateCooldownBar() {
        if (!this.cooldownBar) {
            this.cooldownBar = new Graphics();
            this.container.addChild(this.cooldownBar);
        }

        this.cooldownBar.clear();
        if (!['shield', 'miner', 'spike', 'drone', 'fabricator', 'stasis', 'medic', 'thumper'].includes(this.type)) {
            const pct = 1 - (this.cooldown / this.maxCooldown);
            if (pct < 1) {
                this.cooldownBar.rect(-12, -22, 24, 4);
                this.cooldownBar.fill(0x000000);
                this.cooldownBar.rect(-12, -22, 24 * pct, 4);
                this.cooldownBar.fill(0x4ade80);
            }
        }
    }

    // Helper to rotate turret towards target
    aim(target) {
        if (!target) return false;
        const dx = target.x - this.x;
        const dy = target.y - this.y;
        const targetAngle = Math.atan2(dy, dx);

        // Normalize angles
        let diff = targetAngle - this.turretAngle;
        while (diff > Math.PI) diff -= Math.PI * 2;
        while (diff < -Math.PI) diff += Math.PI * 2;

        if (Math.abs(diff) < this.stats.turnRate) {
            this.turretAngle = targetAngle;
            return true; // Locked on
        } else {
            this.turretAngle += Math.sign(diff) * this.stats.turnRate;
            return false; // Still turning
        }
    }

    fireStandard(game, buff) {
        const range = 375 * this.stats.range;
        const t = game.getNearestEnemy(this.x, this.y, range);
        if (this.aim(t)) {
            this.maxCooldown = 35 / this.stats.fireRate; this.cooldown = this.maxCooldown;
            game.fireProjectile(this.x, this.y, t, 8, '#60a5fa', game.player.autoDmg * this.stats.damage * buff, false, false, 2); // Small Knockback
            audioManager.play('shoot', (this.x - game.canvas.width / 2) / (game.canvas.width / 2));
        }
    }

    fireSniper(game, buff) {
        const range = 750 * this.stats.range;
        const t = game.getStrongestEnemy(this.x, this.y, range);
        if (this.aim(t)) {
            this.maxCooldown = 90 / this.stats.fireRate; this.cooldown = this.maxCooldown;
            game.fireProjectile(this.x, this.y, t, 20, '#facc15', game.player.autoDmg * 5 * this.stats.damage * buff, false, false, 10); // High Knockback
            audioManager.play('sniper', (this.x - game.canvas.width / 2) / (game.canvas.width / 2));
        }
    }

    fireFlame(game, buff) {
        const range = 270 * this.stats.range;
        const t = game.getNearestEnemy(this.x, this.y, range);
        if (this.aim(t)) {
            this.maxCooldown = 5 / this.stats.fireRate; this.cooldown = this.maxCooldown;
            game.fireProjectile(this.x, this.y, t, 6, '#f97316', game.player.autoDmg * 0.4 * this.stats.damage * buff);
            if (game.frameCount % 5 === 0) audioManager.play('flame', (this.x - game.canvas.width / 2) / (game.canvas.width / 2));
        }
    }

    fireTesla(game, buff) {
        const range = 225 * this.stats.range;
        const t = game.getClusteredEnemy(this.x, this.y, range);
        if (t) {
            this.maxCooldown = 45 / this.stats.fireRate; this.cooldown = this.maxCooldown;
            t.hp -= game.player.autoDmg * 1.5 * this.stats.damage * buff;
            game.createLightning(this.x, this.y, t.x + 16, t.y + 16);
            audioManager.play('tesla', (this.x - game.canvas.width / 2) / (game.canvas.width / 2));
            game.spawnFloater(t.x, t.y - 10, Math.floor(game.player.autoDmg * 1.5 * this.stats.damage * buff), "#a78bfa", 10);
        }
    }

    fireMortar(game, buff) {
        const range = 450 * this.stats.range;
        const t = game.getClusteredEnemy(this.x, this.y, range);
        if (this.aim(t)) {
            this.maxCooldown = 120 / this.stats.fireRate; this.cooldown = this.maxCooldown;
            game.fireProjectile(this.x, this.y, t, 5, '#ef4444', game.player.autoDmg * 4 * this.stats.damage * buff, true);
            audioManager.play('mortar', (this.x - game.canvas.width / 2) / (game.canvas.width / 2));
        }
    }

    fireCryo(game, buff) {
        const range = 375 * this.stats.range;
        const t = game.getNearestEnemy(this.x, this.y, range);
        if (this.aim(t)) {
            this.maxCooldown = 25 / this.stats.fireRate; this.cooldown = this.maxCooldown;
            game.fireProjectile(this.x, this.y, t, 7, '#06b6d4', game.player.autoDmg * 0.5 * this.stats.damage * buff, false, true);
            audioManager.play('cryo', (this.x - game.canvas.width / 2) / (game.canvas.width / 2));
        }
    }

    spawnDrone(game) {
        if (game.drones.length < 3 + this.level) {
            this.maxCooldown = 300 / this.stats.fireRate; this.cooldown = this.maxCooldown;
            game.spawnDrone(this);
        }
    }

    fireRailgun(game, buff) {
        const range = 900 * this.stats.range;
        const t = game.getStrongestEnemy(this.x, this.y, range);
        if (this.aim(t)) {
            this.maxCooldown = 120 / this.stats.fireRate; this.cooldown = this.maxCooldown;
            game.fireProjectile(this.x, this.y, t, 25, '#fff', game.player.autoDmg * 4 * this.stats.damage * buff, false, false, 25); // Massive Knockback
            audioManager.play('railgun', (this.x - game.canvas.width / 2) / (game.canvas.width / 2));
        }
    }

    fireAcid(game, buff) {
        const range = 300 * this.stats.range;
        const t = game.getNearestEnemy(this.x, this.y, range);
        if (this.aim(t)) {
            this.maxCooldown = 10 / this.stats.fireRate; this.cooldown = this.maxCooldown;
            game.fireProjectile(this.x, this.y, t, 7, '#84cc16', game.player.autoDmg * 0.2 * this.stats.damage * buff, false, false, 0, true); // Acid
            audioManager.play('acid', (this.x - game.canvas.width / 2) / (game.canvas.width / 2));
        }
    }

    fireGravity(game, buff) {
        const range = 450 * this.stats.range;
        const t = game.getClusteredEnemy(this.x, this.y, range);
        if (this.aim(t)) {
            this.maxCooldown = 120 / this.stats.fireRate; this.cooldown = this.maxCooldown;
            game.fireProjectile(this.x, this.y, t, 10, '#7c3aed', game.player.autoDmg * 1.0 * this.stats.damage * buff, false, false, 0, false, true); // Gravity
            audioManager.play('gravity', (this.x - game.canvas.width / 2) / (game.canvas.width / 2));
        }
    }

    fireThumper(game, buff) {
        this.maxCooldown = 180 / this.stats.fireRate; this.cooldown = this.maxCooldown;
        game.createShockwave(this.x, this.y, 225 * this.stats.range, 15);
        audioManager.play('thumper', (this.x - game.canvas.width / 2) / (game.canvas.width / 2));
    }

    fireMissile(game, buff) {
        const range = 600 * this.stats.range;
        const t = game.getNearestEnemy(this.x, this.y, range);
        if (this.aim(t)) {
            this.maxCooldown = 60 / this.stats.fireRate; this.cooldown = this.maxCooldown;
            // Fire homing missile
            game.fireProjectile(this.x, this.y, t, 12, 'missile', game.player.autoDmg * 2.5 * this.stats.damage * buff, true, false, 5, false, false, true);
            audioManager.play('shoot', (this.x - game.canvas.width / 2) / (game.canvas.width / 2)); // Use shoot sound for now
        }
    }

    fireCluster(game, buff) {
        const range = 800 * this.stats.range;
        const t = game.getStrongestEnemy(this.x, this.y, range);
        if (this.aim(t)) {
            this.maxCooldown = 180 / this.stats.fireRate; this.cooldown = this.maxCooldown;
            // Fire cluster rocket (isMissile=true for homing, isCluster=true)
            game.fireProjectile(this.x, this.y, t, 10, 'cluster', game.player.autoDmg * 4.0 * this.stats.damage * buff, true, false, 10, false, false, true, true);
            audioManager.play('mortar', (this.x - game.canvas.width / 2) / (game.canvas.width / 2));
        }
    }

    updateVisuals() {
        // Clear existing sprites if any
        if (this.chassisSprite) this.chassisSprite.destroy();
        if (this.turretSprite) this.turretSprite.destroy();

        // Chassis
        const chassisTexture = this.game.textureGen.generateWagonChassisTexture(this.type, this.level, '#334155');
        this.chassisSprite = new Sprite(chassisTexture);
        this.chassisSprite.anchor.set(0.5);
        this.container.addChildAt(this.chassisSprite, 0);

        // Turret (if applicable)
        const hasTurret = ['gunner', 'sniper', 'flame', 'mortar', 'cryo', 'railgun', 'acid', 'gravity', 'shield', 'tesla', 'drone', 'spike', 'fabricator', 'stasis', 'medic', 'thumper', 'missile', 'cluster'].includes(this.type);

        if (hasTurret) {
            const turretTexture = this.game.textureGen.generateWagonTurretTexture(this.type, '#ffffff');
            this.turretSprite = new Sprite(turretTexture);
            this.turretSprite.anchor.set(0.5);
            this.container.addChildAt(this.turretSprite, 1);
        }
    }

    destroy() {
        if (this.container) {
            this.container.destroy({ children: true });
        }
    }
}
