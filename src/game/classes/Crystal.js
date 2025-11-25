import { audioManager } from '../core/Audio';

export class Crystal {
    constructor(canvasWidth, canvasHeight) {
        const angle = Math.random() * Math.PI * 2;
        const dist = 300 + Math.random() * 600;
        this.x = (canvasWidth / 2) + Math.cos(angle) * dist;
        this.y = (canvasHeight / 2) + Math.sin(angle) * dist;
        this.active = true;
        this.stage = 0;
        this.growthTimer = 0;
    }

    update(game) {
        if (this.stage < 2) {
            this.growthTimer++;
            if (this.growthTimer > 600) { this.stage++; this.growthTimer = 0; game.createExplosion(this.x, this.y, '#3b82f6', 15); }
        }

        if (Math.hypot(game.player.x - this.x, game.player.y - this.y) < 40) {
            this.active = false;
            let val = 100 * (this.stage + 1);
            game.spawnScrap(this.x, this.y, val);
            game.healPlayer(15);
            game.spawnFloater(this.x, this.y, "HARVESTED", "#3b82f6", 20);
            game.createExplosion(this.x, this.y, '#3b82f6', 25);
            game.shake(5);
            audioManager.play('collect');
        }
    }

    draw(ctx, frameCount) {
        if (!this.active) return;
        const bob = Math.sin(frameCount * 0.05) * 4;
        const s = 1 + (this.stage * 0.5);
        ctx.shadowBlur = 15 + (this.stage * 5); ctx.shadowColor = '#60a5fa';
        ctx.fillStyle = this.stage === 2 ? '#eff6ff' : '#3b82f6';
        ctx.beginPath(); ctx.moveTo(this.x, this.y - 15 * s + bob); ctx.lineTo(this.x + 12 * s, this.y + bob); ctx.lineTo(this.x, this.y + 15 * s + bob); ctx.lineTo(this.x - 12 * s, this.y + bob); ctx.fill(); ctx.shadowBlur = 0;
    }
}
