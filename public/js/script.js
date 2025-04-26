document.addEventListener('DOMContentLoaded', function() {
    // Randomize wipe counter
    const wipeCounter = document.querySelector('.count');
    const randomWipes = Math.floor(Math.random() * 900) + 100; // Random number between 100-999
    wipeCounter.textContent = randomWipes;
    
    // Add more sparkles dynamically
    const sparklesContainer = document.querySelector('.sparkles');
    for (let i = 0; i < 5; i++) {
        const sparkle = document.createElement('span');
        sparkle.textContent = '✦';
        sparkle.className = 'extra-sparkle';
        sparkle.style.position = 'absolute';
        sparkle.style.color = 'gold';
        sparkle.style.fontSize = (15 + Math.random() * 10) + 'px';
        sparkle.style.top = (Math.random() * 100) + '%';
        sparkle.style.left = (Math.random() * 100) + '%';
        sparkle.style.opacity = '0.2';
        sparkle.style.animation = 'sparkle ' + (1.5 + Math.random() * 2) + 's ease-in-out infinite';
        sparkle.style.animationDelay = (Math.random() * 2) + 's';
        sparklesContainer.appendChild(sparkle);
    }
    
    // Make join button extra fun on hover
    const joinButton = document.querySelector('.join-button');
    joinButton.addEventListener('mouseover', function() {
        this.style.transform = 'rotate(' + (Math.random() * 6 - 3) + 'deg) translateY(-5px)';
    });
    
    joinButton.addEventListener('mouseout', function() {
        setTimeout(() => {
            this.style.transform = 'rotate(-2deg)';
        }, 300);
    });
}); 