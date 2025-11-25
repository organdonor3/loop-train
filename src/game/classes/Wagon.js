import { getSplinePoint } from '../utils/math';
import { audioManager } from '../core/Audio';

export class Wagon {
    constructor(type, id) {
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

        audioManager.play('build');
    }

    update(game, idx) {
        // Track following logic
        const player = game.player;
        const targetDist = player.totalDist - (30 * (idx + 1));
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

        // Passive Effects
        if (this.type === 'miner' && game.frameCount % Math.max(60, 180 - (this.level * 20)) === 0) game.spawnScrap(this.x, this.y, 5 * this.level);
        if (this.type === 'medic' && game.frameCount % Math.max(30, 120 / this.stats.fireRate) === 0) game.healPlayer(1 * this.level);
        if (this.type === 'stasis') {
            const r = 150 * this.stats.range;
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
        const range = 250 * this.stats.range;
        const t = game.getNearestEnemy(this.x, this.y, range);
        if (this.aim(t)) {
            this.maxCooldown = 35 / this.stats.fireRate; this.cooldown = this.maxCooldown;
            game.fireProjectile(this.x, this.y, t, 8, '#60a5fa', game.player.autoDmg * this.stats.damage * buff, false, false, 2); // Small Knockback
            audioManager.play('shoot');
        }
    }
    fireSniper(game, buff) {
        const range = 500 * this.stats.range;
        const t = game.getNearestEnemy(this.x, this.y, range);
        if (this.aim(t)) {
            this.maxCooldown = 90 / this.stats.fireRate; this.cooldown = this.maxCooldown;
            game.fireProjectile(this.x, this.y, t, 20, '#facc15', game.player.autoDmg * 5 * this.stats.damage * buff, false, false, 10); // High Knockback
            audioManager.play('shoot');
        }
    }
    fireFlame(game, buff) {
        const range = 180 * this.stats.range;
        const t = game.getNearestEnemy(this.x, this.y, range);
        if (this.aim(t)) {
            this.maxCooldown = 5 / this.stats.fireRate; this.cooldown = this.maxCooldown;
            game.fireProjectile(this.x, this.y, t, 6, '#f97316', game.player.autoDmg * 0.4 * this.stats.damage * buff);
        }
    }
    fireTesla(game, buff) {
        const range = 150 * this.stats.range;
        const t = game.getNearestEnemy(this.x, this.y, range);
        if (t) {
            this.maxCooldown = 45 / this.stats.fireRate; this.cooldown = this.maxCooldown;
            t.hp -= game.player.autoDmg * 1.5 * this.stats.damage * buff;
            game.createLightning(this.x, this.y, t.x + 16, t.y + 16);
            audioManager.play('zap');
            game.spawnFloater(t.x, t.y - 10, Math.floor(game.player.autoDmg * 1.5 * this.stats.damage * buff), "#a78bfa", 10);
        }
    }
    fireMortar(game, buff) {
        const range = 400 * this.stats.range;
        const t = game.getNearestEnemy(this.x, this.y, range);
        if (this.aim(t)) {
            this.maxCooldown = 120 / this.stats.fireRate; this.cooldown = this.maxCooldown;
            game.fireProjectile(this.x, this.y, t, 5, '#ef4444', game.player.autoDmg * 4 * this.stats.damage * buff, true);
            audioManager.play('mortar');
        }
    }
    fireCryo(game, buff) {
        const range = 250 * this.stats.range;
        const t = game.getNearestEnemy(this.x, this.y, range);
        if (this.aim(t)) {
            this.maxCooldown = 25 / this.stats.fireRate; this.cooldown = this.maxCooldown;
            game.fireProjectile(this.x, this.y, t, 7, '#06b6d4', game.player.autoDmg * 0.5 * this.stats.damage * buff, false, true);
            audioManager.play('shoot');
        }
    }
    spawnDrone(game) {
        if (game.drones.length < 3 + this.level) {
            this.maxCooldown = 300 / this.stats.fireRate; this.cooldown = this.maxCooldown;
            game.spawnDrone(this);
        }
    }

    fireRailgun(game, buff) {
        const range = 600 * this.stats.range;
        const t = game.getNearestEnemy(this.x, this.y, range);
        if (this.aim(t)) {
            this.maxCooldown = 120 / this.stats.fireRate; this.cooldown = this.maxCooldown;
            game.fireProjectile(this.x, this.y, t, 25, '#fff', game.player.autoDmg * 4 * this.stats.damage * buff, false, false, 25); // Massive Knockback
            audioManager.play('shoot');
        }
    }

    fireAcid(game, buff) {
        const range = 200 * this.stats.range;
        const t = game.getNearestEnemy(this.x, this.y, range);
        if (this.aim(t)) {
            this.maxCooldown = 10 / this.stats.fireRate; this.cooldown = this.maxCooldown;
            game.fireProjectile(this.x, this.y, t, 7, '#84cc16', game.player.autoDmg * 0.2 * this.stats.damage * buff, false, false, 0, true); // Acid
        }
    }

    fireGravity(game, buff) {
        const range = 300 * this.stats.range;
        const t = game.getNearestEnemy(this.x, this.y, range);
        if (this.aim(t)) {
            this.maxCooldown = 120 / this.stats.fireRate; this.cooldown = this.maxCooldown;
            game.fireProjectile(this.x, this.y, t, 10, '#7c3aed', game.player.autoDmg * 1.0 * this.stats.damage * buff, false, false, 0, false, true); // Gravity
            audioManager.play('shoot');
        }
    }

    fireThumper(game, buff) {
        this.maxCooldown = 180 / this.stats.fireRate; this.cooldown = this.maxCooldown;
        game.createShockwave(this.x, this.y, 150 * this.stats.range, 15);
        audioManager.play('explode');
    }

    draw(ctx) {
        ctx.save(); ctx.translate(this.x, this.y); ctx.rotate(this.angle);

        // Base
        ctx.fillStyle = '#334155'; ctx.fillRect(-18, -4, 18, 8);

        // Level Indicators
        for (let i = 0; i < this.level; i++) {
            ctx.fillStyle = '#fbbf24';
            ctx.beginPath(); ctx.arc(-14 + (i * 4), -6, 1.5, 0, Math.PI * 2); ctx.fill();
        }

        ctx.shadowBlur = 10;

        // Turret Rotation (if applicable)
        const hasTurret = ['gunner', 'sniper', 'flame', 'mortar', 'cryo', 'railgun', 'acid', 'gravity'].includes(this.type);

        if (hasTurret) {
            ctx.save();
            ctx.rotate(this.turretAngle - this.angle); // Relative rotation
        }

        if (this.type === 'gunner') { ctx.fillStyle = '#475569'; ctx.shadowColor = '#000'; ctx.fillRect(-12, -12, 24, 24); ctx.fillStyle = '#3b82f6'; ctx.fillRect(0, -4, 18, 8); }
        else if (this.type === 'sniper') { ctx.fillStyle = '#1e293b'; ctx.shadowColor = '#000'; ctx.fillRect(-12, -12, 24, 24); ctx.fillStyle = '#facc15'; ctx.fillRect(0, -3, 28, 6); }
        else if (this.type === 'flame') { ctx.fillStyle = '#7f1d1d'; ctx.shadowColor = 'red'; ctx.fillRect(-12, -12, 24, 24); ctx.fillStyle = '#f97316'; ctx.fillRect(0, -6, 16, 12); }
        else if (this.type === 'mortar') { ctx.fillStyle = '#3f3f46'; ctx.shadowColor = '#000'; ctx.fillRect(-12, -12, 24, 24); ctx.fillStyle = '#000'; ctx.beginPath(); ctx.arc(0, 0, 10, 0, Math.PI * 2); ctx.fill(); }
        else if (this.type === 'cryo') { ctx.fillStyle = '#164e63'; ctx.shadowColor = '#06b6d4'; ctx.fillRect(-12, -12, 24, 24); ctx.fillStyle = '#67e8f9'; ctx.fillRect(0, -4, 16, 8); }
        else if (this.type === 'railgun') { ctx.fillStyle = '#0f172a'; ctx.shadowColor = '#fff'; ctx.fillRect(-12, -12, 24, 24); ctx.fillStyle = '#fff'; ctx.fillRect(0, -2, 32, 4); }
        else if (this.type === 'acid') { ctx.fillStyle = '#365314'; ctx.shadowColor = '#84cc16'; ctx.fillRect(-12, -12, 24, 24); ctx.fillStyle = '#84cc16'; ctx.fillRect(0, -5, 14, 10); }
        else if (this.type === 'gravity') { ctx.fillStyle = '#2e1065'; ctx.shadowColor = '#7c3aed'; ctx.fillRect(-12, -12, 24, 24); ctx.fillStyle = '#7c3aed'; ctx.beginPath(); ctx.arc(8, 0, 6, 0, Math.PI * 2); ctx.fill(); }

        if (hasTurret) ctx.restore();

        // Non-turret cars
        if (this.type === 'shield') { ctx.fillStyle = '#0369a1'; ctx.shadowColor = '#0ea5e9'; ctx.beginPath(); ctx.arc(0, 0, 14, 0, Math.PI * 2); ctx.fill(); ctx.strokeStyle = '#38bdf8'; ctx.lineWidth = 2; ctx.stroke(); }
        else if (this.type === 'miner') { ctx.fillStyle = '#854d0e'; ctx.shadowColor = 'gold'; ctx.fillRect(-12, -12, 24, 24); ctx.fillStyle = '#fde047'; ctx.fillRect(-6, -6, 12, 12); }
        else if (this.type === 'tesla') { ctx.fillStyle = '#4c1d95'; ctx.shadowColor = '#a78bfa'; ctx.fillRect(-12, -12, 24, 24); ctx.fillStyle = '#a78bfa'; ctx.beginPath(); ctx.arc(0, 0, 6, 0, Math.PI * 2); ctx.fill(); }
        else if (this.type === 'drone') { ctx.fillStyle = '#14532d'; ctx.shadowColor = '#4ade80'; ctx.fillRect(-12, -12, 24, 24); ctx.strokeStyle = '#4ade80'; ctx.strokeRect(-8, -8, 16, 16); }
        else if (this.type === 'spike') { ctx.fillStyle = '#7f1d1d'; ctx.shadowColor = 'red'; ctx.fillRect(-12, -12, 24, 24); ctx.fillStyle = '#991b1b'; ctx.beginPath(); ctx.moveTo(12, -12); ctx.lineTo(20, -12); ctx.lineTo(16, 0); ctx.fill(); ctx.beginPath(); ctx.moveTo(12, 12); ctx.lineTo(20, 12); ctx.lineTo(16, 0); ctx.fill(); }
        else if (this.type === 'fabricator') { ctx.fillStyle = '#c2410c'; ctx.shadowColor = '#f97316'; ctx.fillRect(-12, -12, 24, 24); ctx.fillStyle = '#fdba74'; ctx.beginPath(); ctx.arc(0, 0, 8, 0, Math.PI * 2); ctx.fill(); }
        else if (this.type === 'stasis') { ctx.fillStyle = '#312e81'; ctx.shadowColor = '#6366f1'; ctx.fillRect(-12, -12, 24, 24); ctx.strokeStyle = '#818cf8'; ctx.lineWidth = 2; ctx.beginPath(); ctx.arc(0, 0, 10, 0, Math.PI * 2); ctx.stroke(); }
        else if (this.type === 'medic') { ctx.fillStyle = '#be123c'; ctx.shadowColor = '#f43f5e'; ctx.fillRect(-12, -12, 24, 24); ctx.fillStyle = '#fff'; ctx.fillRect(-4, -8, 8, 16); ctx.fillRect(-8, -4, 16, 8); }
        else if (this.type === 'thumper') { ctx.fillStyle = '#4b5563'; ctx.shadowColor = '#9ca3af'; ctx.fillRect(-14, -14, 28, 28); ctx.strokeStyle = '#fff'; ctx.lineWidth = 2; ctx.beginPath(); ctx.arc(0, 0, 8, 0, Math.PI * 2); ctx.stroke(); }

        ctx.restore();

        if (!['shield', 'miner', 'spike', 'drone', 'fabricator', 'stasis', 'medic', 'thumper'].includes(this.type)) {
            const pct = 1 - (this.cooldown / this.maxCooldown);
            if (pct < 1) {
                ctx.fillStyle = '#000'; ctx.fillRect(this.x - 12, this.y - 22, 24, 4);
                ctx.fillStyle = '#4ade80'; ctx.fillRect(this.x - 12, this.y - 22, 24 * pct, 4);
            }
        }
    }
}
