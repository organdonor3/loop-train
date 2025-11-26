import { DEPOTS } from '../constants';
import { Container, Graphics, Text, TextStyle } from 'pixi.js';
import { useGameStore } from '../state';
import { audioManager } from '../core/Audio';

export class Depot {
    constructor(game, x, y, rotation = 0) {
        this.game = game;
        this.x = x;
        this.y = y;
        this.rotation = rotation;
        this.type = DEPOTS[Math.floor(Math.random() * DEPOTS.length)];
        this.radius = 40; // Tunnel length/size
        this.width = 120;
        this.height = 60;

        // Logic
        this.lastLapVisited = -1;
        this.cooldown = 0;

        // Calculate Entrance/Exit positions (local to world)
        // Entrance is "left", Exit is "right" relative to rotation
        const cos = Math.cos(rotation);
        const sin = Math.sin(rotation);
        const offset = this.width / 2;

        this.entrance = { x: x - cos * offset, y: y - sin * offset };
        this.exit = { x: x + cos * offset, y: y + sin * offset };

        // PixiJS Setup - Ground Layer (Floor)
        this.container = new Container();
        this.container.x = x;
        this.container.y = y;
        this.container.rotation = rotation;

        this.graphics = new Graphics();
        this.container.addChild(this.graphics);

        // Roof Layer (Above Train)
        this.roofContainer = new Container();
        this.roofContainer.x = x;
        this.roofContainer.y = y;
        this.roofContainer.rotation = rotation;
        this.roofGraphics = new Graphics();
        this.roofContainer.addChild(this.roofGraphics);

        // Text Labels (On Roof)
        const titleStyle = new TextStyle({
            fontFamily: 'monospace',
            fontSize: 10,
            fontWeight: 'bold',
            fill: '#ffffff',
            align: 'center',
        });
        this.titleText = new Text({ text: this.type.title, style: titleStyle });
        this.titleText.anchor.set(0.5, 1);
        this.titleText.y = -20;
        this.titleText.rotation = -rotation; // Keep text upright-ish? Or just let it rotate. Let's keep it local for now.
        this.roofContainer.addChild(this.titleText);

        const descStyle = new TextStyle({
            fontFamily: 'monospace',
            fontSize: 8,
            fill: '#cbd5e1',
            align: 'center',
        });
        this.descText = new Text({ text: "PER LAP", style: descStyle }); // Simplified text
        this.descText.anchor.set(0.5, 0);
        this.descText.y = 20;
        this.roofContainer.addChild(this.descText);

        this.game.layers.ground.addChild(this.container);
        this.game.layers.air.addChild(this.roofContainer); // Add roof to air layer

        this.updateVisuals();
    }

    update() {
        if (this.cooldown > 0) this.cooldown--;
        this.checkConnection();
        this.updateVisuals();
    }

    checkConnection() {
        // Check if both entrance and exit have a node snapped to them
        const entranceNode = this.game.trackNodes.find(n => Math.hypot(n.x - this.entrance.x, n.y - this.entrance.y) < 5);
        const exitNode = this.game.trackNodes.find(n => Math.hypot(n.x - this.exit.x, n.y - this.exit.y) < 5);

        this.connected = !!(entranceNode && exitNode);
    }

    checkPassage(player, currentLap) {
        if (!this.connected) return false;

        // Simple check: if player is on the segment connecting entrance and exit?
        // Better: Check if player has completed a lap AND is currently passing through.
        // Actually, the prompt says "once per lap".

        // We can check if the player is close to the center
        const dist = Math.hypot(player.x - this.x, player.y - this.y);

        if (dist < this.radius && currentLap > this.lastLapVisited) {
            this.activate();
            this.lastLapVisited = currentLap;
            return true;
        }
        return false;
    }

    activate() {
        this.cooldown = 60; // Visual feedback timer
        const type = this.type.id;
        const store = useGameStore.getState();

        // Bonus Logic
        if (type === 'gearbox') { this.game.player.maxSpeed += 0.1; this.game.spawnFloater(this.x, this.y, "+SPEED", "#facc15"); }
        if (type === 'extender') { store.setStats({ maxWagonCount: store.maxWagonCount + 1 }); this.game.spawnFloater(this.x, this.y, "+CAPACITY", "#38bdf8"); }
        if (type === 'recycler') { store.setStats({ scrap: store.scrap + 50 }); this.game.spawnFloater(this.x, this.y, "+50 SCRAP", "#ef4444"); }
        if (type === 'repair') { this.game.healPlayer(20); this.game.spawnFloater(this.x, this.y, "REPAIR", "#22c55e"); }
        if (type === 'armory') { this.game.player.autoDmg *= 1.05; this.game.spawnFloater(this.x, this.y, "+DMG", "#a855f7"); }
        if (type === 'reactor') { this.game.player.wagons.forEach(w => w.stats.fireRate *= 1.02); this.game.spawnFloater(this.x, this.y, "+FIRE RATE", "#f97316"); }
        if (type === 'shield') { this.game.player.maxHp += 10; this.game.healPlayer(10); this.game.spawnFloater(this.x, this.y, "+MAX HP", "#06b6d4"); }
        if (type === 'magnet') { this.game.player.magnetRange += 20; this.game.spawnFloater(this.x, this.y, "+MAGNET", "#ec4899"); }
        if (type === 'drill') { this.game.player.ramDamage += 20; this.game.spawnFloater(this.x, this.y, "+RAM", "#94a3b8"); }
        if (type === 'lab') { store.setStats({ xp: store.xp + 50 }); this.game.spawnFloater(this.x, this.y, "+50 XP", "#14b8a6"); }

        audioManager.play('collect');
    }

    updateVisuals() {
        // Floor
        this.graphics.clear();
        this.graphics.rect(-this.width / 2, -this.height / 2, this.width, this.height);
        this.graphics.fill({ color: 0x0f172a, alpha: this.connected ? 0.8 : 0.3 }); // Dim if not connected
        this.graphics.stroke({ width: 2, color: this.connected ? 0x334155 : 0x1e293b });

        // Markers for Entrance/Exit
        this.graphics.circle(-this.width / 2, 0, 5);
        this.graphics.fill(0x22c55e); // Green Entrance
        this.graphics.circle(this.width / 2, 0, 5);
        this.graphics.fill(0xef4444); // Red Exit

        // Roof
        this.roofGraphics.clear();

        // Status Light
        const isReady = this.game.currentLap > this.lastLapVisited;
        let lightColor = isReady ? 0x22c55e : 0xef4444;
        if (!this.connected) lightColor = 0x64748b; // Gray if not connected

        // Tunnel Arch
        this.roofGraphics.roundRect(-this.width / 2, -this.height / 2 - 10, this.width, this.height + 20, 10);
        this.roofGraphics.stroke({ width: 4, color: this.connected ? this.type.color : 0x475569 }); // Gray stroke if not connected
        this.roofGraphics.fill({ color: 0x1e293b, alpha: this.connected ? 0.5 : 0.2 }); // Dim roof if not connected

        // Light Strip
        this.roofGraphics.rect(-this.width / 2, -5, this.width, 10);
        this.roofGraphics.fill({ color: lightColor, alpha: 0.5 });

        // Text Opacity
        this.titleText.alpha = this.connected ? 1 : 0.3;
        this.descText.alpha = this.connected ? 1 : 0.3;
    }

    destroy() {
        if (this.container) this.container.destroy({ children: true });
        if (this.roofContainer) this.roofContainer.destroy({ children: true });
    }
}
