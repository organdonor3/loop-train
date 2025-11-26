import { Container, Text, TextStyle } from 'pixi.js';

export class Floater {
    constructor(game, x, y, text, color, size = 12) {
        this.game = game;
        this.x = x;
        this.y = y;
        this.life = 60;
        this.maxLife = 60;

        // PixiJS Setup
        this.container = new Container();
        this.container.x = x;
        this.container.y = y;

        const style = new TextStyle({
            fontFamily: 'monospace',
            fontSize: size,
            fontWeight: 'bold',
            fill: color,
            stroke: '#000000',
            strokeThickness: 2,
            align: 'center',
        });

        this.text = new Text({ text: text, style: style });
        this.text.anchor.set(0.5);
        this.container.addChild(this.text);

        this.game.layers.ui.addChild(this.container);
    }

    update() {
        this.y -= 0.5;
        this.life--;

        this.container.y = this.y;
        this.container.alpha = this.life / this.maxLife;
    }

    destroy() {
        if (this.container) {
            this.container.destroy({ children: true });
        }
    }
}
