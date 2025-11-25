import { audioManager } from '../core/Audio';

export class Drone {
    constructor(parent) {
        this.parent = parent;
        this.angle = Math.random() * Math.PI * 2;
        this.dist = 40;
        this.x = 0; this.y = 0;
        this.cooldown = 0;
    }
    update(game) {
        this.angle += 0.05;
        this.x = this.parent.x + Math.cos(this.angle) * this.dist;
        this.y = this.parent.y + Math.sin(this.angle) * this.dist;
        if (this.cooldown > 0) this.cooldown--;
        else {
            const t = game.getNearestEnemy(this.x, this.y, 150);
            if (t) {
                this.cooldown = 30;
                game.fireProjectile(this.x, this.y, t, 10, '#4ade80', 5);
            }
        }
    }
    draw(ctx) {
        ctx.fillStyle = '#4ade80'; ctx.shadowColor = '#4ade80'; ctx.shadowBlur = 5;
        ctx.beginPath(); ctx.arc(this.x, this.y, 3, 0, Math.PI * 2); ctx.fill(); ctx.shadowBlur = 0;
    }
}
