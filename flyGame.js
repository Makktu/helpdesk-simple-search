/**
 * Fly Game - A mini-game where flies appear on screen when the user searches for "flies"
 */
class FlyGame {
    constructor() {
        this.active = false;
        this.score = 0;
        this.flies = [];
        this.flyInterval = null;
        this.scoreElement = null;
        this.createScoreDisplay();
        this.lastFlyTime = 0;
        this.minFlySize = 5;  // Minimum fly size in pixels (increased from 3)
        this.maxFlySize = 20; // Maximum fly size in pixels (increased from 15)
        this.flyLifespan = 2500; // How long a fly stays on screen in ms (increased from 2000)
        this.clickHandler = this.handleClick.bind(this);
    }

    createScoreDisplay() {
        // Create score display in top-right corner
        this.scoreElement = document.createElement('div');
        this.scoreElement.id = 'flyGameScore';
        this.scoreElement.innerHTML = 'Fly Game: 0 points';
        this.scoreElement.style.position = 'fixed';
        this.scoreElement.style.top = '10px';
        this.scoreElement.style.right = '10px';
        this.scoreElement.style.backgroundColor = 'rgba(0, 0, 0, 0.7)';
        this.scoreElement.style.color = 'white';
        this.scoreElement.style.padding = '5px 10px';
        this.scoreElement.style.borderRadius = '5px';
        this.scoreElement.style.fontSize = '14px';
        this.scoreElement.style.fontWeight = 'bold';
        this.scoreElement.style.zIndex = '1000';
        this.scoreElement.style.display = 'none';
        document.body.appendChild(this.scoreElement);
    }

    start() {
        if (this.active) return;
        
        this.active = true;
        this.score = 0;
        this.updateScoreDisplay();
        this.scoreElement.style.display = 'block';
        
        // Start generating flies
        this.flyInterval = setInterval(() => this.generateFly(), 2000 + Math.random() * 3000);
        
        // Add click event listener to the entire window
        window.addEventListener('click', this.clickHandler, true);
        
        console.log('Fly game started!');
    }

    stop() {
        if (!this.active) return;
        
        this.active = false;
        this.scoreElement.style.display = 'none';
        
        // Stop generating flies
        clearInterval(this.flyInterval);
        
        // Remove all existing flies
        this.removeAllFlies();
        
        // Remove click event listener
        window.removeEventListener('click', this.clickHandler, true);
        
        console.log('Fly game stopped!');
    }

    generateFly() {
        if (!this.active) return;
        
        // Create a new fly element
        const fly = document.createElement('div');
        fly.className = 'game-fly';
        
        // Random position
        const viewportWidth = Math.max(document.documentElement.clientWidth || 0, window.innerWidth || 0);
        const viewportHeight = Math.max(document.documentElement.clientHeight || 0, window.innerHeight || 0);
        
        const left = Math.random() * (viewportWidth - 20);
        const top = Math.random() * (viewportHeight - 20);
        
        // Random size - make flies a bit bigger for easier visibility and clicking
        const size = this.minFlySize + Math.random() * (this.maxFlySize - this.minFlySize);
        
        // Style the fly
        fly.style.position = 'fixed';
        fly.style.left = `${left}px`;
        fly.style.top = `${top}px`;
        fly.style.width = `${size}px`;
        fly.style.height = `${size}px`;
        fly.style.backgroundColor = 'black';
        fly.style.borderRadius = '50%';
        fly.style.zIndex = '999';
        fly.style.pointerEvents = 'none'; // Make sure it doesn't interfere with clicks
        fly.style.transition = 'left 0.2s, top 0.2s'; // Add smooth transition for movement
        fly.style.boxShadow = '0 0 3px 1px rgba(255,255,255,0.5)'; // Add a subtle glow to make flies more visible
        
        // Add to document
        document.body.appendChild(fly);
        
        // Store creation time and position
        fly.dataset.createdAt = Date.now().toString();
        fly.dataset.left = left.toString();
        fly.dataset.top = top.toString();
        fly.dataset.size = size.toString();
        
        // Add to flies array
        this.flies.push(fly);
        
        // Add random movement after a short delay
        setTimeout(() => {
            if (fly.parentNode) {
                // Random movement distance (between 20 and 50 pixels)
                const moveX = (Math.random() * 30 + 20) * (Math.random() > 0.5 ? 1 : -1);
                const moveY = (Math.random() * 30 + 20) * (Math.random() > 0.5 ? 1 : -1);
                
                // Calculate new position, ensuring it stays within viewport
                const newLeft = Math.max(0, Math.min(viewportWidth - size, left + moveX));
                const newTop = Math.max(0, Math.min(viewportHeight - size, top + moveY));
                
                // Apply the movement
                fly.style.left = `${newLeft}px`;
                fly.style.top = `${newTop}px`;
                
                // Update position data
                fly.dataset.left = newLeft.toString();
                fly.dataset.top = newTop.toString();
            }
        }, 300); // Wait 300ms before moving
        
        // Set timeout to remove the fly
        setTimeout(() => {
            if (fly.parentNode) {
                fly.parentNode.removeChild(fly);
                this.flies = this.flies.filter(f => f !== fly);
            }
        }, this.flyLifespan);
        
        this.lastFlyTime = Date.now();
    }

    handleClick(event) {
        if (!this.active) return;
        
        console.log('Click detected in fly game');
        
        // Show a click indicator regardless of whether a fly was hit
        this.showClickIndicator(event.clientX, event.clientY);
        
        if (this.flies.length === 0) return;
        
        const now = Date.now();
        let hitFly = false;
        
        // Check each fly to see if it was clicked
        for (let i = this.flies.length - 1; i >= 0; i--) {
            const fly = this.flies[i];
            const flyCreatedAt = parseInt(fly.dataset.createdAt);
            const flyLeft = parseFloat(fly.dataset.left);
            const flyTop = parseFloat(fly.dataset.top);
            const flySize = parseFloat(fly.dataset.size);
            
            // Get current position from the DOM element (in case it moved)
            const rect = fly.getBoundingClientRect();
            const currentLeft = rect.left;
            const currentTop = rect.top;
            
            // Calculate distance from click to fly center
            const dx = event.clientX - (currentLeft + flySize/2);
            const dy = event.clientY - (currentTop + flySize/2);
            const distance = Math.sqrt(dx*dx + dy*dy);
            
            console.log(`Fly #${i}: size=${flySize}, distance=${distance.toFixed(2)}, max=${flySize/2 + 30}`);
            
            // Much more generous hit area for easier scoring
            const hitArea = Math.max(30, flySize + 20); // At least 30px, or fly size + 20px
            
            if (distance <= hitArea) {
                console.log(`HIT! Fly #${i} was hit!`);
                hitFly = true;
                
                // Always give a point if you hit a fly
                this.score++;
                this.updateScoreDisplay();
                
                // Show a quick animation at the click spot
                this.showClickAnimation(event.clientX, event.clientY);
                
                // Remove the fly
                if (fly.parentNode) {
                    fly.parentNode.removeChild(fly);
                    this.flies.splice(i, 1);
                }
                
                break; // Only count one fly per click
            }
        }
        
        if (!hitFly) {
            console.log('No flies were hit');
        }
    }

    showClickAnimation(x, y) {
        const anim = document.createElement('div');
        anim.className = 'click-animation';
        anim.style.position = 'fixed';
        anim.style.left = `${x - 15}px`;
        anim.style.top = `${y - 15}px`;
        anim.style.width = '30px';
        anim.style.height = '30px';
        anim.style.borderRadius = '50%';
        anim.style.backgroundColor = 'rgba(0, 255, 0, 0.5)';
        anim.style.zIndex = '998';
        anim.style.pointerEvents = 'none';
        anim.style.animation = 'click-anim 0.5s forwards';
        
        document.body.appendChild(anim);
        
        setTimeout(() => {
            if (anim.parentNode) {
                anim.parentNode.removeChild(anim);
            }
        }, 500);
    }
    
    showClickIndicator(x, y) {
        // Create a small indicator to show where clicks are happening
        const indicator = document.createElement('div');
        indicator.style.position = 'fixed';
        indicator.style.left = `${x - 5}px`;
        indicator.style.top = `${y - 5}px`;
        indicator.style.width = '10px';
        indicator.style.height = '10px';
        indicator.style.borderRadius = '50%';
        indicator.style.backgroundColor = 'rgba(255, 0, 0, 0.5)';
        indicator.style.zIndex = '997';
        indicator.style.pointerEvents = 'none';
        
        document.body.appendChild(indicator);
        
        setTimeout(() => {
            if (indicator.parentNode) {
                indicator.parentNode.removeChild(indicator);
            }
        }, 200);
    }

    updateScoreDisplay() {
        if (this.scoreElement) {
            this.scoreElement.innerHTML = `Fly Game: ${this.score} points`;
        }
    }

    removeAllFlies() {
        this.flies.forEach(fly => {
            if (fly.parentNode) {
                fly.parentNode.removeChild(fly);
            }
        });
        this.flies = [];
    }
}

// Add CSS for the click animation
const style = document.createElement('style');
style.textContent = `
@keyframes click-anim {
    0% { transform: scale(0.5); opacity: 1; }
    100% { transform: scale(1.5); opacity: 0; }
}

/* Make sure all elements can be clicked through for the game */
.game-fly, .click-animation {
    pointer-events: none !important;
}
`;
document.head.appendChild(style);

// Create a global instance of the fly game
window.flyGame = new FlyGame();
