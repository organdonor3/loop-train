import { Container, Graphics } from 'pixi.js';

export class Loot {
    constructor(game, x, y, val, isXp) {
        this.game = game;
        this.x = x;
        this.y = y;
        this.val = val;
        this.isXp = isXp;
        this.life = 1800;
        this.maxLife = 1800;

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
        this.container.x = this.x;
        this.container.y = this.y;

        if (this.life < 300 && this.life % 20 === 0) {
            this.container.visible = !this.container.visible;
        } else {
            this.container.visible = true;
        }
    }

    updateVisuals() {
        this.graphics.clear();
        if (this.isXp) {
            // XP Gem
            this.graphics.poly([0, -4, 4, 0, 0, 4, -4, 0]);
            this.graphics.fill(0xa855f7);
            this.graphics.stroke({ width: 1, color: 0xd8b4fe });
        } else {
            // Scrap
            this.graphics.rect(-3, -3, 6, 6);
            this.graphics.fill(0xfbbf24);
            this.graphics.stroke({ width: 1, color: 0xf59e0b });
        }
    }

    destroy() {
        if (this.container) {
            this.container.destroy({ children: true });
        }
    }
}
