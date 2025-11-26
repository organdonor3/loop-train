import { Container, Graphics } from 'pixi.js';

export class Mine {
    constructor(game, x, y) {
        this.game = game;
        this.x = x;
        this.y = y;
        this.life = 600;

        // PixiJS Setup
        this.container = new Container();
        this.container.x = x;
        this.container.y = y;

        this.graphics = new Graphics();
        this.container.addChild(this.graphics);

        this.game.layers.ground.addChild(this.container);
        this.updateVisuals();
    }

    update() {
        this.life--;

        if (this.life % 30 === 0) {
            this.graphics.tint = this.graphics.tint === 0xffffff ? 0xff0000 : 0xffffff;
        }
    }

    updateVisuals() {
        this.graphics.clear();
        this.graphics.circle(0, 0, 6);
        this.graphics.fill(0xef4444);
        this.graphics.stroke({ width: 2, color: 0x000000 });

        // Spikes
        for (let i = 0; i < 4; i++) {
            const angle = (i / 4) * Math.PI * 2;
            this.graphics.moveTo(Math.cos(angle) * 6, Math.sin(angle) * 6);
            this.graphics.lineTo(Math.cos(angle) * 10, Math.sin(angle) * 10);
            this.graphics.stroke({ width: 2, color: 0xef4444 });
        }
    }

    destroy() {
        if (this.container) {
            this.container.destroy({ children: true });
        }
    }
}
