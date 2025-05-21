let camera, scene, renderer;
let player;
let moveForward = false;
let moveBackward = false;
let moveLeft = false;
let moveRight = false;
let trees = [];
// Add new variables for camera control
let mouseX = 0;
let mouseY = 0;
let targetRotation = 0;
let cameraDistance = 5;
let cameraHeight = 3;

function init() {
    // Scene setup
    scene = new THREE.Scene();
    camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    renderer = new THREE.WebGLRenderer();
    renderer.setSize(window.innerWidth, window.innerHeight);
    document.body.appendChild(renderer.domElement);

    // Lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
    scene.add(ambientLight);
    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.5);
    directionalLight.position.set(0, 10, 0);
    scene.add(directionalLight);

    // Ground
    const groundGeometry = new THREE.PlaneGeometry(100, 100);
    const groundMaterial = new THREE.MeshStandardMaterial({ color: 0x228B22 });
    const ground = new THREE.Mesh(groundGeometry, groundMaterial);
    ground.rotation.x = -Math.PI / 2;
    scene.add(ground);

    // Trees
    for(let i = 0; i < 50; i++) {
        createTree(
            Math.random() * 80 - 40,
            0,
            Math.random() * 80 - 40
        );
    }

    // Player
    const wolfGeometry = new THREE.ConeGeometry(0.5, 2, 4);
    wolfGeometry.rotateX(Math.PI / 2);
    const wolfMaterial = new THREE.MeshStandardMaterial({ color: 0x808080 });
    player = new THREE.Mesh(wolfGeometry, wolfMaterial);
    player.position.y = 1;
    scene.add(player);
    
    // Setup camera separately (don't add to player)
    camera.position.set(0, cameraHeight, cameraDistance);
    camera.lookAt(player.position);

    // Event listeners
    document.addEventListener('mousemove', onMouseMove);
    document.addEventListener('keydown', onKeyDown);
    document.addEventListener('keyup', onKeyUp);
}

function createTree(x, y, z) {
    const trunkGeometry = new THREE.CylinderGeometry(0.2, 0.2, 2, 8);
    const trunkMaterial = new THREE.MeshStandardMaterial({ color: 0x8B4513 });
    const trunk = new THREE.Mesh(trunkGeometry, trunkMaterial);

    const leavesGeometry = new THREE.ConeGeometry(1, 2, 8);
    const leavesMaterial = new THREE.MeshStandardMaterial({ color: 0x006400 });
    const leaves = new THREE.Mesh(leavesGeometry, leavesMaterial);
    leaves.position.y = 2;

    const tree = new THREE.Group();
    tree.add(trunk);
    tree.add(leaves);
    tree.position.set(x, y, z);
    scene.add(tree);

    // Add tree to collision array with position and radius
    trees.push({
        position: new THREE.Vector2(x, z),
        radius: 1
    });
}

function checkCollision(nextPosition) {
    const playerRadius = 0.5;
    
    for (let tree of trees) {
        const distance = nextPosition.distanceTo(tree.position);
        if (distance < (playerRadius + tree.radius)) {
            return true; // Collision detected
        }
    }
    return false; // No collision
}

function onKeyDown(event) {
    switch(event.code) {
        case 'ArrowUp':
        case 'KeyW':
            moveForward = true;
            break;
        case 'ArrowDown':
        case 'KeyS':
            moveBackward = true;
            break;
        case 'ArrowLeft':
        case 'KeyA':
            moveLeft = true;
            break;
        case 'ArrowRight':
        case 'KeyD':
            moveRight = true;
            break;
    }
}

function onKeyUp(event) {
    switch(event.code) {
        case 'ArrowUp':
        case 'KeyW':
            moveForward = false;
            break;
        case 'ArrowDown':
        case 'KeyS':
            moveBackward = false;
            break;
        case 'ArrowLeft':
        case 'KeyA':
            moveLeft = false;
            break;
        case 'ArrowRight':
        case 'KeyD':
            moveRight = false;
            break;
    }
}

function onMouseMove(event) {
    mouseX = -(event.clientX - window.innerWidth / 2) / 100;  // Added negative sign here
    targetRotation = mouseX;
}

function updateCamera() {
    // Calculate camera position
    const cameraOffset = new THREE.Vector3(
        Math.sin(targetRotation) * cameraDistance,
        cameraHeight,
        Math.cos(targetRotation) * cameraDistance
    );
    
    camera.position.copy(player.position).add(cameraOffset);
    camera.lookAt(player.position);
}

function animate() {
    requestAnimationFrame(animate);

    const speed = 0.1;
    let nextPosition = new THREE.Vector2(player.position.x, player.position.z);
    let moved = false;

    // Update movement relative to camera rotation
    if (moveForward) {
        nextPosition.x -= Math.sin(targetRotation) * speed;
        nextPosition.y -= Math.cos(targetRotation) * speed;
        moved = true;
    }
    if (moveBackward) {
        nextPosition.x += Math.sin(targetRotation) * speed;
        nextPosition.y += Math.cos(targetRotation) * speed;
        moved = true;
    }
    if (moveLeft) {
        nextPosition.x -= Math.cos(targetRotation) * speed;
        nextPosition.y += Math.sin(targetRotation) * speed;
        moved = true;
    }
    if (moveRight) {
        nextPosition.x += Math.cos(targetRotation) * speed;
        nextPosition.y -= Math.sin(targetRotation) * speed;
        moved = true;
    }

    if (moved && !checkCollision(nextPosition)) {
        player.position.x = nextPosition.x;
        player.position.z = nextPosition.y;
        player.rotation.y = targetRotation;
    }

    updateCamera();
    renderer.render(scene, camera);
}

init();
animate();
