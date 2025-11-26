import { audioManager } from '../core/Audio';
import { Container, Graphics } from 'pixi.js';

export class Crystal {
    constructor(game) {
        this.game = game;
        const angle = Math.random() * Math.PI * 2;
        const dist = 300 + Math.random() * 600;
        this.x = (game.app.screen.width / 2) + Math.cos(angle) * dist;
        this.y = (game.app.screen.height / 2) + Math.sin(angle) * dist;
        this.active = true;
        this.stage = 0;
        this.growthTimer = 0;
        this.frameCount = 0;

        // PixiJS Setup
        this.container = new Container();
        this.container.x = this.x;
        this.container.y = this.y;

        this.graphics = new Graphics();
        this.container.addChild(this.graphics);

        this.game.layers.ground.addChild(this.container);
        this.updateVisuals();
    }

    update(game) {
        this.frameCount++;
        if (this.stage < 2) {
            this.growthTimer++;
            if (this.growthTimer > 600) {
                this.stage++;
                this.growthTimer = 0;
                game.createExplosion(this.x, this.y, '#3b82f6', 15);
                this.updateVisuals();
            }
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
            this.destroy();
        } else {
            // Bobbing effect
            const bob = Math.sin(this.frameCount * 0.05) * 4;
            this.graphics.y = bob;
        }
    }

    updateVisuals() {
        this.graphics.clear();
        const s = 1 + (this.stage * 0.5);

        // Glow
        this.graphics.circle(0, 0, 20 * s);
        this.graphics.fill({ color: 0x60a5fa, alpha: 0.3 });

        // Crystal Shape
        this.graphics.poly([
            0, -15 * s,
            12 * s, 0,
            0, 15 * s,
            -12 * s, 0
        ]);
        this.graphics.fill(this.stage === 2 ? 0xeff6ff : 0x3b82f6);
    }

    destroy() {
        if (this.container) {
            this.container.destroy({ children: true });
        }
    }
}
