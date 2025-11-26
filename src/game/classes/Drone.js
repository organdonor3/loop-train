import { audioManager } from '../core/Audio';
import { Container, Graphics } from 'pixi.js';

export class Drone {
    constructor(game, parent) {
        this.game = game;
        this.parent = parent;
        this.angle = Math.random() * Math.PI * 2;
        this.dist = 40;
        this.x = 0; this.y = 0;
        this.cooldown = 0;

        // PixiJS Setup
        this.container = new Container();
        this.graphics = new Graphics();
        this.container.addChild(this.graphics);

        this.graphics.circle(0, 0, 3);
        this.graphics.fill(0x4ade80);

        // Glow effect (simulated with another circle or filter, but simple is fine for now)
        // Pixi Graphics doesn't support shadowBlur directly in the same way.
        // We can add a larger transparent circle for glow.
        this.graphics.circle(0, 0, 6);
        this.graphics.fill({ color: 0x4ade80, alpha: 0.3 });

        this.game.layers.air.addChild(this.container);
    }

    update(game) {
        this.angle += 0.05;
        this.x = this.parent.x + Math.cos(this.angle) * this.dist;
        this.y = this.parent.y + Math.sin(this.angle) * this.dist;

        this.container.x = this.x;
        this.container.y = this.y;

        if (this.cooldown > 0) this.cooldown--;
        else {
            const t = game.getNearestEnemy(this.x, this.y, 150);
            if (t) {
                this.cooldown = 30;
                game.fireProjectile(this.x, this.y, t, 10, '#4ade80', 5);
            }
        }
    }

    destroy() {
        if (this.container) {
            this.container.destroy({ children: true });
        }
    }
}
