/**
 * Rain Animation - Creates a rain effect when triggered by "make it rain" search
 */
class RainAnimation {
    constructor() {
        this.active = false;
        this.raindrops = [];
        this.animationContainer = null;
        this.rainInterval = null;
        this.duration = 60000; // 1 minute in milliseconds
        this.createAnimationContainer();
        console.log('Rain animation initialized');
    }

    createAnimationContainer() {
        // Create container for raindrops
        this.animationContainer = document.createElement('div');
        this.animationContainer.id = 'rainAnimationContainer';
        this.animationContainer.style.position = 'fixed';
        this.animationContainer.style.top = '0';
        this.animationContainer.style.left = '0';
        this.animationContainer.style.width = '100%';
        this.animationContainer.style.height = '100%';
        this.animationContainer.style.pointerEvents = 'none';
        this.animationContainer.style.zIndex = '998';
        this.animationContainer.style.overflow = 'hidden';
        this.animationContainer.style.display = 'none';
        document.body.appendChild(this.animationContainer);

        // Add CSS for rain animation - using simpler, more direct styling
        const style = document.createElement('style');
        style.textContent = `
            .raindrop {
                position: fixed;
                background-color: #99ccff;
                width: 2px;
                height: 20px;
                opacity: 0.7;
                z-index: 999;
                pointer-events: none;
                box-shadow: 0 0 4px #ffffff;
            }
            
            @keyframes rainfall {
                0% { transform: translateY(-20px); }
                100% { transform: translateY(100vh); }
            }
        `;
        document.head.appendChild(style);
    }

    start() {
        if (this.active) return;
        
        this.active = true;
        this.animationContainer.style.display = 'block';
        
        console.log('Rain animation started!');
        
        // Create initial batch of raindrops
        for (let i = 0; i < 100; i++) {
            this.createRaindrop();
        }
        
        // Continue creating raindrops at an interval
        this.rainInterval = setInterval(() => {
            if (this.active) {
                for (let i = 0; i < 5; i++) {
                    this.createRaindrop();
                }
            }
        }, 50);
        
        // Stop the animation after the specified duration
        setTimeout(() => {
            this.stop();
        }, this.duration);
    }

    stop() {
        if (!this.active) return;
        
        this.active = false;
        
        // Stop creating new raindrops
        clearInterval(this.rainInterval);
        
        // Fade out existing raindrops
        const fadeOut = () => {
            this.animationContainer.style.opacity = parseFloat(this.animationContainer.style.opacity || 1) - 0.05;
            
            if (parseFloat(this.animationContainer.style.opacity) <= 0) {
                this.animationContainer.style.display = 'none';
                this.animationContainer.style.opacity = '1';
                this.clearAllRaindrops();
            } else {
                setTimeout(fadeOut, 50);
            }
        };
        
        fadeOut();
        console.log('Rain animation stopped!');
    }

    createRaindrop() {
        if (!this.active) return;
        
        const viewportWidth = Math.max(document.documentElement.clientWidth || 0, window.innerWidth || 0);
        const viewportHeight = Math.max(document.documentElement.clientHeight || 0, window.innerHeight || 0);
        
        // Create raindrop element
        const raindrop = document.createElement('div');
        raindrop.className = 'raindrop';
        
        // Random properties
        const width = 1 + Math.random() * 3; // Width between 1px and 4px
        const height = 15 + Math.random() * 25; // Height between 15px and 40px
        const posX = Math.random() * viewportWidth;
        const duration = 0.5 + Math.random() * 1.5; // Fall duration between 0.5s and 2s
        
        // Style the raindrop
        raindrop.style.width = `${width}px`;
        raindrop.style.height = `${height}px`;
        raindrop.style.left = `${posX}px`;
        raindrop.style.top = '0px';
        raindrop.style.opacity = 0.2 + Math.random() * 0.6; // Random opacity
        raindrop.style.animation = `rainfall ${duration}s linear forwards`;
        
        // Add to container
        this.animationContainer.appendChild(raindrop);
        this.raindrops.push(raindrop);
        
        // Remove raindrop after animation completes
        setTimeout(() => {
            if (raindrop.parentNode) {
                raindrop.parentNode.removeChild(raindrop);
                this.raindrops = this.raindrops.filter(d => d !== raindrop);
            }
        }, duration * 1000 + 100);
    }

    clearAllRaindrops() {
        this.raindrops.forEach(raindrop => {
            if (raindrop.parentNode) {
                raindrop.parentNode.removeChild(raindrop);
            }
        });
        this.raindrops = [];
    }
}

// Create a global instance of the rain animation
window.rainAnimation = new RainAnimation();
