const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const scoreElement = document.getElementById('score');

canvas.width = 400;
canvas.height = 600;

// Add wing animation state
const bird = {
    x: 50,
    y: canvas.height / 2,
    radius: 20,
    velocity: 0,
    gravity: 0.5,
    jump: -8,
    wingAngle: 0,
    wingSpeed: 0.15
};

let pipes = [];
let score = 0;
let gameOver = false;

function createPipe() {
    const gap = 150;
    const pipeWidth = 50;
    const minHeight = 50;
    const maxHeight = canvas.height - gap - minHeight;
    const topHeight = Math.random() * (maxHeight - minHeight) + minHeight;

    pipes.push({
        x: canvas.width,
        topHeight: topHeight,
        bottomY: topHeight + gap,
        width: pipeWidth,
        counted: false
    });
}

function drawBird() {
    ctx.save();
    ctx.translate(bird.x, bird.y);
    
    // Rotate bird based on velocity
    const rotation = Math.min(Math.max(bird.velocity * 0.1, -0.5), 0.5);
    ctx.rotate(rotation);

    // Draw body (triangle)
    ctx.fillStyle = '#f1c40f';
    ctx.beginPath();
    ctx.moveTo(-20, 0);
    ctx.lineTo(20, -10);
    ctx.lineTo(20, 10);
    ctx.closePath();
    ctx.fill();

    // Draw wing with animation
    ctx.fillStyle = '#f39c12';
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.lineTo(-10, Math.sin(bird.wingAngle) * 10);
    ctx.lineTo(10, Math.sin(bird.wingAngle) * 10);
    ctx.closePath();
    ctx.fill();

    // Draw head
    ctx.fillStyle = '#e67e22';
    ctx.beginPath();
    ctx.arc(15, -5, 8, 0, Math.PI * 2);
    ctx.fill();

    // Draw beak
    ctx.fillStyle = '#e74c3c';
    ctx.beginPath();
    ctx.moveTo(22, -5);
    ctx.lineTo(30, -2);
    ctx.lineTo(22, 0);
    ctx.closePath();
    ctx.fill();

    ctx.restore();
}

function drawPipes() {
    pipes.forEach(pipe => {
        // Top pipe
        ctx.fillStyle = '#2ecc71';
        ctx.fillRect(pipe.x, 0, pipe.width, pipe.topHeight);
        // Bottom pipe
        ctx.fillRect(pipe.x, pipe.bottomY, pipe.width, canvas.height - pipe.bottomY);
    });
}

function checkCollision(pipe) {
    if (bird.y - bird.radius < 0 || bird.y + bird.radius > canvas.height) {
        return true;
    }

    if (bird.x + bird.radius > pipe.x && 
        bird.x - bird.radius < pipe.x + pipe.width) {
        if (bird.y - bird.radius < pipe.topHeight || 
            bird.y + bird.radius > pipe.bottomY) {
            return true;
        }
    }
    return false;
}

function updateScore(pipe) {
    if (!pipe.counted && bird.x > pipe.x + pipe.width) {
        score++;
        scoreElement.textContent = `Score: ${score}`;
        pipe.counted = true;
    }
}

function gameLoop() {
    if (gameOver) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Update wing animation
    bird.wingAngle += bird.wingSpeed;

    // Update bird position
    bird.velocity += bird.gravity;
    bird.y += bird.velocity;

    // Update pipes
    pipes.forEach(pipe => {
        pipe.x -= 2;
        if (checkCollision(pipe)) {
            gameOver = true;
        }
        updateScore(pipe);
    });

    // Remove off-screen pipes
    pipes = pipes.filter(pipe => pipe.x + pipe.width > 0);

    // Add new pipes
    if (pipes.length === 0 || pipes[pipes.length - 1].x < canvas.width - 200) {
        createPipe();
    }

    drawBird();
    drawPipes();

    requestAnimationFrame(gameLoop);
}

// Handle user input
document.addEventListener('keydown', (e) => {
    if (e.code === 'Space') {
        if (gameOver) {
            // Reset game
            bird.y = canvas.height / 2;
            bird.velocity = 0;
            pipes = [];
            score = 0;
            scoreElement.textContent = 'Score: 0';
            gameOver = false;
            gameLoop();
        } else {
            bird.velocity = bird.jump;
        }
    }
});

// Start the game
gameLoop();
