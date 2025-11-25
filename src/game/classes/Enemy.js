import { audioManager } from '../core/Audio';

export class Enemy {
    constructor(x, y, type, isElite, wave) {
        this.x = x; this.y = y; this.type = type; this.isElite = isElite;
        const wMod = wave * 0.08;
        const eliteMod = isElite ? 2.5 : 1;
        this.scale = isElite ? 1.5 : 1;
        this.speedMod = 1.0;
        this.wave = wave;

        // Boss Stats
        if (type === 'crusher') { this.hp = 2000 * (1 + wMod); this.speed = 0.8; this.color = '#7f1d1d'; this.size = 40; this.score = 500; this.xp = 200; this.isBoss = true; }
        else if (type === 'queen') { this.hp = 1500 * (1 + wMod); this.speed = 0.5; this.color = '#be185d'; this.size = 35; this.score = 500; this.xp = 200; this.isBoss = true; }
        else if (type === 'sniper_boss') { this.hp = 1200 * (1 + wMod); this.speed = 0.6; this.color = '#facc15'; this.size = 30; this.score = 500; this.xp = 200; this.isBoss = true; }
        else if (type === 'tesla_boss') { this.hp = 1800 * (1 + wMod); this.speed = 1.0; this.color = '#4c1d95'; this.size = 35; this.score = 500; this.xp = 200; this.isBoss = true; }
        else if (type === 'fortress') { this.hp = 3000 * (1 + wMod); this.speed = 0.2; this.color = '#3f3f46'; this.size = 45; this.score = 500; this.xp = 200; this.isBoss = true; }
        else if (type === 'phantom') { this.hp = 1000 * (1 + wMod); this.speed = 1.5; this.color = '#0f172a'; this.size = 30; this.score = 500; this.xp = 200; this.isBoss = true; }

        // Normal Enemies
        else if (type === 'tank') { this.hp = 120 * (1 + wMod) * eliteMod; this.speed = 0.35; this.color = '#166534'; this.size = 18 * this.scale; this.score = 30; this.xp = 30 * eliteMod; }
        else if (type === 'swarmer') { this.hp = 10 * (1 + wMod) * eliteMod; this.speed = 2.8; this.color = '#ef4444'; this.size = 8 * this.scale; this.score = 5; this.xp = 5 * eliteMod; }
        else if (type === 'dasher') { this.hp = 25 * (1 + wMod) * eliteMod; this.speed = 3.5; this.color = '#f97316'; this.size = 12 * this.scale; this.score = 12; this.xp = 15 * eliteMod; }
        else if (type === 'boomer') { this.hp = 50 * (1 + wMod) * eliteMod; this.speed = 1.0; this.color = '#facc15'; this.size = 16 * this.scale; this.score = 20; this.xp = 20 * eliteMod; }
        else if (type === 'miner') { this.hp = 60 * (1 + wMod) * eliteMod; this.speed = 1.5; this.color = '#71717a'; this.size = 15 * this.scale; this.score = 25; this.xp = 25 * eliteMod; }
        else { this.hp = 40 * (1 + wMod) * eliteMod; this.speed = 1.2; this.color = '#a855f7'; this.size = 14 * this.scale; this.score = 10; this.xp = 10 * eliteMod; }

        this.vx = 0; this.vy = 0;
        this.knockbackX = 0; this.knockbackY = 0;
        this.frozenTimer = 0;
        this.acidTimer = 0;
        this.skillTimer = 0;
    }

    update(game) {
        const player = game.player;
        let angle = Math.atan2(player.y - this.y, player.x - this.x);

        // Acid Damage
        if (this.acidTimer > 0) {
            this.acidTimer--;
            if (this.acidTimer % 60 === 0) {
                this.hp -= 5;
                game.spawnFloater(this.x, this.y, "5", "#84cc16", 10);
            }
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
        const actualSpeed = this.speed * this.speedMod;

        this.vx = (Math.cos(angle) * actualSpeed) + this.knockbackX;
        this.vy = (Math.sin(angle) * actualSpeed) + this.knockbackY;
        this.x += this.vx; this.y += this.vy;

        // Boss Skills
        if (this.isBoss) {
            this.skillTimer++;
            if (this.type === 'queen' && this.skillTimer % 120 === 0) {
                for (let i = 0; i < 3; i++) game.enemies.push(new Enemy(this.x + (Math.random() * 40 - 20), this.y + (Math.random() * 40 - 20), 'swarmer', false, this.wave));
            }
            if (this.type === 'sniper_boss' && this.skillTimer % 180 === 0) {
                game.fireProjectile(this.x, this.y, player, 15, '#ef4444', 30, true); // Hostile projectile
            }
            if (this.type === 'tesla_boss' && this.skillTimer % 90 === 0) {
                if (Math.hypot(player.x - this.x, player.y - this.y) < 200) {
                    game.createLightning(this.x, this.y, player.x, player.y);
                    game.damagePlayer(10);
                }
            }
            if (this.type === 'phantom' && this.skillTimer % 200 === 0) {
                this.x = player.x + (Math.random() > 0.5 ? 300 : -300);
                this.y = player.y + (Math.random() > 0.5 ? 300 : -300);
                game.createExplosion(this.x, this.y, '#fff', 20);
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
    }

    draw(ctx) {
        ctx.shadowBlur = this.isElite || this.isBoss ? 20 : 5; ctx.shadowColor = this.color;
        ctx.fillStyle = this.frozenTimer > 0 ? '#67e8f9' : (this.isElite ? '#fff' : this.color);

        if (this.isBoss) {
            // Boss HP Bar
            ctx.fillStyle = '#000'; ctx.fillRect(this.x - 20, this.y - this.size - 15, 40, 6);
            ctx.fillStyle = '#ef4444'; ctx.fillRect(this.x - 20, this.y - this.size - 15, 40 * (this.hp / (this.type === 'crusher' ? 2000 : 1500)), 6); // Approx max HP
            ctx.fillStyle = this.color;
        }

        if (this.type === 'tank' || this.type === 'boomer' || this.type === 'crusher' || this.type === 'fortress') {
            ctx.fillRect(this.x - this.size, this.y - this.size, this.size * 2, this.size * 2);
            if (!this.isElite && !this.isBoss) { ctx.fillStyle = 'rgba(0,0,0,0.4)'; ctx.fillRect(this.x - this.size / 2, this.y - this.size / 2, this.size, this.size); }
        }
        else { ctx.beginPath(); ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2); ctx.fill(); }

        if (this.isElite || this.isBoss) { ctx.strokeStyle = this.color; ctx.lineWidth = 3; ctx.beginPath(); ctx.arc(this.x, this.y, this.size + 6, 0, Math.PI * 2); ctx.stroke(); }
        ctx.shadowBlur = 0;
    }
}
