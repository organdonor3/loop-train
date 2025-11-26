import { Container, Graphics, Sprite } from 'pixi.js';

export class Particle {
    constructor(game, x, y, color, vx, vy, life, size = 3, isLightning = false, x2, y2) {
        this.game = game;
        this.x = x;
        this.y = y;
        this.vx = vx;
        this.vy = vy;
        this.life = life;
        this.maxLife = life;
        this.color = color;
        this.size = size;
        this.isLightning = isLightning;
        this.x2 = x2;
        this.y2 = y2;

        // PixiJS Setup
        this.container = new Container();

        if (isLightning) {
            this.graphics = new Graphics();
            this.container.addChild(this.graphics);
            this.game.layers.projectiles.addChild(this.container); // Lightning on top
        } else {
            const texture = this.game.textureGen.generateParticleTexture(color, size);
            this.sprite = new Sprite(texture);
            this.sprite.anchor.set(0.5);
            this.container.addChild(this.sprite);
            this.game.layers.projectiles.addChild(this.container); // Particles on projectile layer
        }

        this.updateVisuals();
    }

    update() {
        if (!this.isLightning) {
            this.x += this.vx;
            this.y += this.vy;
            this.container.x = this.x;
            this.container.y = this.y;

            this.life--;
            this.sprite.alpha = this.life / this.maxLife;
        } else {
            this.life--;
            // Lightning flickers or fades
            this.graphics.alpha = Math.random();
            this.updateVisuals(); // Redraw lightning every frame if needed, or just alpha
        }
    }

    updateVisuals() {
        if (this.isLightning) {
            this.graphics.clear();
            this.graphics.moveTo(this.x, this.y);
            this.graphics.lineTo(this.x2, this.y2);
            this.graphics.stroke({ width: 2, color: 0xffffff });
            // Glow
            this.graphics.stroke({ width: 6, color: 0xa78bfa, alpha: 0.5 });
        }
    }

    destroy() {
        if (this.container) {
            this.container.destroy({ children: true });
        }
    }
}
