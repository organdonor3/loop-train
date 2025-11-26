import { Container, Sprite } from 'pixi.js';

export class Projectile {
    constructor(game, x, y, target, speed, color, damage, isExplosive, isCryo, knockback, isAcid, isGravity, isMissile, isCluster) {
        this.game = game;
        this.x = x;
        this.y = y;
        this.color = color;
        this.damage = damage;
        this.life = 80;
        this.isExplosive = isExplosive;
        this.isCryo = isCryo;
        this.knockback = knockback;
        this.isAcid = isAcid;
        this.isGravity = isGravity;
        this.isMissile = isMissile;
        this.isCluster = isCluster;
        this.speed = speed;
        this.target = target; // Keep reference for homing

        // Calculate Velocity
        let angle = 0;
        if (target) {
            const dist = Math.hypot(target.x - x, target.y - y);
            const time = dist / speed;
            const fx = target.x + (target.vx * time);
            const fy = target.y + (target.vy * time);
            angle = Math.atan2(fy - y, fx - x);
            this.vx = Math.cos(angle) * speed;
            this.vy = Math.sin(angle) * speed;
        } else {
            // Default to straight line if no target (or set externally)
            this.vx = speed;
            this.vy = 0;
            angle = Math.atan2(this.vy, this.vx);
        }

        // PixiJS Setup
        this.container = new Container();
        this.container.x = x;
        this.container.y = y;

        const texture = this.game.textureGen.generateProjectileTexture(color, 4);
        this.sprite = new Sprite(texture);
        this.sprite.anchor.set(0.5);
        this.container.addChild(this.sprite);

        // Rotate sprite for missiles
        if (this.isMissile) {
            this.sprite.rotation = angle + Math.PI / 2;
        }

        this.game.layers.projectiles.addChild(this.container);
    }

    update() {
        if (this.isMissile && this.target && this.target.hp > 0) {
            // Homing Logic
            const dx = this.target.x - this.x;
            const dy = this.target.y - this.y;
            const angle = Math.atan2(dy, dx);

            // Steer towards target
            const currentAngle = Math.atan2(this.vy, this.vx);
            let diff = angle - currentAngle;
            while (diff > Math.PI) diff -= Math.PI * 2;
            while (diff < -Math.PI) diff += Math.PI * 2;

            const turnRate = 0.15;
            const newAngle = currentAngle + Math.sign(diff) * Math.min(Math.abs(diff), turnRate);

            this.vx = Math.cos(newAngle) * this.speed;
            this.vy = Math.sin(newAngle) * this.speed;

            this.sprite.rotation = newAngle + Math.PI / 2;
        }

        this.x += this.vx;
        this.y += this.vy;
        this.life--;

        this.container.x = this.x;
        this.container.y = this.y;
    }

    destroy() {
        if (this.container) {
            this.container.destroy({ children: true });
        }
    }
}
