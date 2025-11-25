import { DEPOTS } from '../constants';

export class Depot {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.type = DEPOTS[Math.floor(Math.random() * DEPOTS.length)];
        this.radius = 24;
        this.claimed = false;
        this.pulse = 0;
    }

    draw(ctx) {
        this.pulse += 0.05;
        const r = this.radius + Math.sin(this.pulse) * 2;

        ctx.save();
        ctx.translate(this.x, this.y);

        // Glow
        ctx.shadowBlur = 20;
        ctx.shadowColor = this.type.color;

        // Base
        ctx.fillStyle = '#1e293b';
        ctx.beginPath(); ctx.arc(0, 0, r, 0, Math.PI * 2); ctx.fill();

        // Icon/Symbol
        ctx.fillStyle = this.type.color;
        ctx.beginPath(); ctx.arc(0, 0, r * 0.6, 0, Math.PI * 2); ctx.fill();

        // Border
        ctx.strokeStyle = '#fff';
        ctx.lineWidth = 2;
        ctx.stroke();

        // Label
        ctx.fillStyle = '#fff';
        ctx.font = 'bold 10px monospace';
        ctx.textAlign = 'center';
        ctx.shadowBlur = 0;
        ctx.fillText(this.type.title, 0, -r - 10);
        ctx.font = '8px monospace';
        ctx.fillStyle = '#cbd5e1';
        ctx.fillText(this.type.desc, 0, -r + 40);

        ctx.restore();
    }
}
