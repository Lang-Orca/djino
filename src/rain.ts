import { storageKeys, StorageService } from "./services/storage";
import type { WeatherData } from "./services/weather_time";

export class RainManager {
    private canvas: HTMLCanvasElement;
    private ctx: CanvasRenderingContext2D;
    private drops: RainDrop[] = [];
    private intensity: number = 0; // 0 to 1
    private animationId: number | null = null;

    constructor() {
        this.canvas = document.createElement('canvas');
        this.canvas.id = 'rain-canvas';
        this.ctx = this.canvas.getContext('2d')!;
        
        // Setup canvas styles
        Object.assign(this.canvas.style, {
            position: 'fixed',
            top: '0',
            left: '0',
            width: '100%',
            height: '100%',
            pointerEvents: 'none',
            zIndex: '100',
            display: 'none'
        });

        document.body.appendChild(this.canvas);
        window.addEventListener('resize', () => this.resize());
        this.resize();
    }

    private resize() {
        this.canvas.width = window.innerWidth;
        this.canvas.height = window.innerHeight;
    }

    public update(weather: WeatherData) {
        if (!weather.isRaining) {
            this.stop();
            return;
        }

        this.canvas.style.display = 'block';
        this.calculateIntensity(weather.weatherCode);
        this.start();
    }

    private calculateIntensity(code: number) {
        // Mapping WMO codes to intensity (0.1 to 1.0)
        switch (code) {
            case 51: case 80: this.intensity = 0.2; break; // Drizzle/Slight shower
            case 53: case 61: case 81: this.intensity = 0.5; break; // Moderate drizzle/rain
            case 55: case 63: this.intensity = 0.8; break; // Heavy drizzle/rain
            case 65: case 82: this.intensity = 1.0; break; // Violent rain/shower
            default: this.intensity = 0.3;
        }
    }

    private start() {
        if (this.animationId) return;
        this.animate();
    }

    private stop() {
        if (this.animationId) {
            cancelAnimationFrame(this.animationId);
            this.animationId = null;
        }
        this.canvas.style.display = 'none';
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        this.drops = [];
    }

    private animate() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        
        // Create darkening overlay based on intensity
        const overlayOpacity = this.intensity * 0.4;
        this.ctx.fillStyle = `rgba(0, 0, 0, ${overlayOpacity})`;
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

        // Manage drops count based on intensity
        const targetDropCount = Math.floor(this.intensity * 300);
        if (this.drops.length < targetDropCount) {
            for (let i = 0; i < 5; i++) {
                this.drops.push(new RainDrop(this.canvas.width, this.canvas.height, this.intensity));
            }
        }

        this.drops.forEach((drop, index) => {
            drop.update(this.intensity);
            drop.draw(this.ctx);

            if (drop.y > this.canvas.height) {
                this.drops[index] = new RainDrop(this.canvas.width, this.canvas.height, this.intensity);
            }
        });

        this.animationId = requestAnimationFrame(() => this.animate());
    }
}

class RainDrop {
    x: number;
    y: number;
    length: number;
    speed: number;
    opacity: number;

    constructor(canvasWidth: number, canvasHeight: number, intensity: number) {
        this.x = Math.random() * canvasWidth;
        this.y = Math.random() * -canvasHeight;
        this.length = 10 + Math.random() * 20;
        this.speed = (15 + Math.random() * 10) * (0.8 + intensity);
        this.opacity = 0.1 + Math.random() * 0.4;
    }

    update( _intensity: number ) {
        this.y += this.speed;
    }

    draw(ctx: CanvasRenderingContext2D) {
        ctx.beginPath();
        ctx.strokeStyle = StorageService.get(storageKeys.theme ) === 'dark' ? `rgba(174, 194, 224, ${this.opacity})` : `rgba(10, 25, 47, ${this.opacity})`;
        ctx.lineWidth = 1;
        ctx.moveTo(this.x, this.y);
        ctx.lineTo(this.x, this.y + this.length);
        ctx.stroke();
    }
}
