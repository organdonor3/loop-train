import { Graphics, RenderTexture, Matrix } from 'pixi.js';

export class TextureGenerator {
    constructor(app) {
        this.app = app;
        this.textures = new Map();
    }

    getTexture(key, drawFn) {
        if (this.textures.has(key)) {
            return this.textures.get(key);
        }

        const graphics = new Graphics();
        drawFn(graphics);

        // Render to texture
        const texture = this.app.renderer.generateTexture(graphics);
        this.textures.set(key, texture);

        return texture;
    }

    generateEnemyTexture(type, color, size) {
        const key = `enemy_${type}_${color}_${size}`;
        return this.getTexture(key, (g) => {
            if (type === 'kamikaze') {
                // Triangle
                g.poly([0, -size, size, size, -size, size]);
                g.fill(color);
                g.stroke({ width: 2, color: 0x000000 });
            } else if (type === 'tank') {
                // Square
                g.rect(-size, -size, size * 2, size * 2);
                g.fill(color);
                g.stroke({ width: 2, color: 0x000000 });
            } else if (type === 'swarmer') {
                // Diamond
                g.poly([0, -size, size, 0, 0, size, -size, 0]);
                g.fill(color);
            } else if (type === 'shooter') {
                // Hexagon
                const points = [];
                for (let i = 0; i < 6; i++) {
                    const angle = (i / 6) * Math.PI * 2;
                    points.push(Math.cos(angle) * size, Math.sin(angle) * size);
                }
                g.poly(points);
                g.fill(color);
                g.stroke({ width: 2, color: 0x000000 });
            } else if (type === 'crusher') {
                g.circle(0, 0, size);
                g.fill(color);
                g.stroke({ width: 3, color: 0x000000 });
                // Spikes
                for (let i = 0; i < 8; i++) {
                    const angle = (i / 8) * Math.PI * 2;
                    const x = Math.cos(angle) * (size + 5);
                    const y = Math.sin(angle) * (size + 5);
                    g.moveTo(Math.cos(angle) * size, Math.sin(angle) * size);
                    g.lineTo(x, y);
                    g.stroke({ width: 4, color: 0x7f1d1d });
                }
            } else if (type === 'fortress') {
                g.stroke({ width: 4, color: 0x52525b }); // Zinc-600
                g.rect(-size * 0.6, -size * 0.6, size * 1.2, size * 1.2); // Central block
                g.stroke({ width: 2, color: 0x000000 });
            } else {
                // Default Circle
                g.circle(0, 0, size);
                g.fill(color);
            }
        });
    }

    generateProjectileTexture(color, size) {
        const key = `proj_${color}_${size}`;
        return this.getTexture(key, (g) => {
            if (color === 'missile') {
                // Rocket shape
                g.rect(-4, -8, 8, 16);
                g.fill(0xe11d48); // Red body
                g.poly([0, -12, 4, -8, -4, -8]); // Nose cone
                g.fill(0xffffff);
                g.poly([-4, 4, -8, 12, -4, 8]); // Left fin
                g.fill(0x9f1239);
                g.poly([4, 4, 8, 12, 4, 8]); // Right fin
                g.fill(0x9f1239);
            } else if (color === 'cluster') {
                // Large Rocket
                g.rect(-6, -12, 12, 24);
                g.fill(0x1e293b); // Dark body
                g.poly([0, -18, 6, -12, -6, -12]); // Nose
                g.fill(0xff0000);
                g.poly([-6, 6, -10, 16, -6, 12]); // Left fin
                g.fill(0x334155);
                g.poly([6, 6, 10, 16, 6, 12]); // Right fin
                g.fill(0x334155);
            } else if (color === 'cluster_mini') {
                // Mini Rocket
                g.rect(-2, -4, 4, 8);
                g.fill(0xfacc15);
                g.poly([0, -6, 2, -4, -2, -4]);
                g.fill(0xff0000);
            } else {
                // Core
                g.circle(0, 0, size);
                g.fill(color);

                // Glow
                g.circle(0, 0, size * 2);
                g.fill({ color: color, alpha: 0.3 });
            }
        });
    }

    generateParticleTexture(color, size) {
        const key = `part_${color}_${size}`;
        return this.getTexture(key, (g) => {
            g.circle(0, 0, size);

            let fill = color;
            if (color === 'cluster') fill = 0xef4444;
            if (color === 'cluster_mini') fill = 0xfacc15;
            if (color === 'missile') fill = 0xfacc15;

            g.fill(fill);
        });
    }

    generateWagonChassisTexture(type, level, color) {
        const key = `wagon_chassis_${type}_${level}_${color}`;
        return this.getTexture(key, (g) => {
            // Base Chassis
            g.rect(-18, -14, 36, 28);
            g.fill(0x334155);
            g.stroke({ width: 2, color: 0x1e293b });

            // Level Indicators
            for (let i = 0; i < level; i++) {
                g.circle(-14 + (i * 6), -8, 2);
                g.fill(0xfbbf24);
            }

            // Type specific details (simplified for chassis)
            if (type === 'miner') {
                g.rect(-12, -4, 24, 8);
                g.fill(0x854d0e);
            }
        });
    }

    generateWagonTurretTexture(type, color) {
        const key = `wagon_turret_${type}_${color}`;
        return this.getTexture(key, (g) => {
            if (type === 'gunner') {
                g.rect(-12, -12, 24, 24); g.fill(0x475569);
                g.rect(0, -4, 22, 8); g.fill(0x3b82f6);
            }
            else if (type === 'sniper') {
                g.rect(-12, -12, 24, 24); g.fill(0x1e293b);
                g.rect(0, -3, 32, 6); g.fill(0xfacc15);
            }
            else if (type === 'flame') {
                g.rect(-12, -12, 24, 24); g.fill(0x7f1d1d);
                g.rect(0, -6, 20, 12); g.fill(0xf97316);
            }
            else if (type === 'mortar') {
                g.rect(-12, -12, 24, 24); g.fill(0x3f3f46);
                g.circle(0, 0, 12); g.fill(0x000000);
            }
            else if (type === 'cryo') {
                g.rect(-12, -12, 24, 24); g.fill(0x164e63);
                g.rect(0, -4, 20, 8); g.fill(0x67e8f9);
            }
            else if (type === 'railgun') {
                g.rect(-12, -12, 24, 24); g.fill(0x0f172a);
                g.rect(0, -2, 36, 4); g.fill(0xffffff);
            }
            else if (type === 'acid') {
                g.rect(-12, -12, 24, 24); g.fill(0x365314);
                g.rect(0, -5, 18, 10); g.fill(0x84cc16);
            }
            else if (type === 'gravity') {
                g.rect(-12, -12, 24, 24); g.fill(0x2e1065);
                g.circle(8, 0, 8); g.fill(0x7c3aed);
            }
            else if (type === 'shield') {
                g.circle(0, 0, 16); g.fill(0x0369a1);
                g.stroke({ width: 2, color: 0x38bdf8 });
            }
            else if (type === 'tesla') {
                g.rect(-12, -12, 24, 24); g.fill(0x4c1d95);
                g.circle(0, 0, 8); g.fill(0xa78bfa);
            }
            else if (type === 'drone') {
                g.rect(-12, -12, 24, 24); g.fill(0x14532d);
                g.rect(-8, -8, 16, 16); g.stroke({ width: 1, color: 0x4ade80 });
            }
            else if (type === 'spike') {
                g.rect(-12, -12, 24, 24); g.fill(0x7f1d1d);
                g.poly([12, -12, 24, -12, 18, 0]); g.fill(0x991b1b);
                g.poly([12, 12, 24, 12, 18, 0]); g.fill(0x991b1b);
            }
            else if (type === 'fabricator') {
                g.rect(-12, -12, 24, 24); g.fill(0xc2410c);
                g.circle(0, 0, 10); g.fill(0xfdba74);
            }
            else if (type === 'stasis') {
                g.rect(-12, -12, 24, 24); g.fill(0x312e81);
                g.circle(0, 0, 12); g.stroke({ width: 2, color: 0x818cf8 });
            }
            else if (type === 'medic') {
                g.rect(-12, -12, 24, 24); g.fill(0xbe123c);
                g.rect(-4, -8, 8, 16); g.fill(0xffffff);
                g.rect(-8, -4, 16, 8); g.fill(0xffffff);
            }
            else if (type === 'thumper') {
                g.rect(-14, -14, 28, 28); g.fill(0x4b5563);
                g.circle(0, 0, 10); g.stroke({ width: 2, color: 0xffffff });
            }
            else if (type === 'missile') {
                g.rect(-12, -12, 24, 24); g.fill(0x881337);
                // Rocket pods
                g.rect(-10, -8, 6, 16); g.fill(0xe11d48);
                g.rect(4, -8, 6, 16); g.fill(0xe11d48);
            }
            else if (type === 'cluster') {
                g.rect(-14, -14, 28, 28); g.fill(0x1e293b);
                // 4 tubes
                g.circle(-6, -6, 4); g.fill(0x000000);
                g.circle(6, -6, 4); g.fill(0x000000);
                g.circle(-6, 6, 4); g.fill(0x000000);
                g.circle(6, 6, 4); g.fill(0x000000);
            }
        });
    }

    generateEngineTexture(type, color) {
        const key = `engine_${type}_${color}`;
        return this.getTexture(key, (g) => {
            // Locomotive Body
            g.rect(-20, -16, 40, 32);
            g.fill(0x0f172a);
            g.stroke({ width: 2, color: 0xfacc15 });

            // Cab
            g.rect(-10, -10, 20, 20);
            g.fill(0x1e293b);

            // Front Cowcatcher
            g.poly([20, -16, 30, 0, 20, 16]);
            g.fill(0xfacc15);
        });
    }
}
