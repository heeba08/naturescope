let currentPage = 'home';
        let pageData = {
            explore: { loaded: false, cleanup: null },
            learn: { loaded: false, cleanup: null },
            quiz: { loaded: false, cleanup: null },
            scan: { loaded: false, cleanup: null },
            act: { loaded: false, cleanup: null }
        };

        // Initialize home page particles
        function initHomeParticles() {
            const container = document.getElementById('homeParticles');
            if (!container) return;
            container.innerHTML = '';
            const particles = ['🌿', '🍃', '✨', '⭐', '🦋', '🌸'];
            
            for (let i = 0; i < 20; i++) {
                const particle = document.createElement('div');
                particle.className = 'particle';
                particle.textContent = particles[Math.floor(Math.random() * particles.length)];
                particle.style.left = Math.random() * 100 + '%';
                particle.style.top = Math.random() * 100 + '%';
                particle.style.animationDelay = Math.random() * 8 + 's';
                particle.style.animationDuration = (8 + Math.random() * 4) + 's';
                container.appendChild(particle);
            }
        }

        function toggleMenu() {
            document.getElementById('navMenu').classList.toggle('open');
        }

        function updateActiveNav(page) {
            document.querySelectorAll('.nav-link').forEach(link => {
                link.classList.remove('active');
            });
            
            const pageMap = {
                'home': 0,
                'explore': 1,
                'learn': 2,
                'quiz': 3,
                'scan': 4,
                'act': 5
            };
            
            const links = document.querySelectorAll('.nav-link');
            if (links[pageMap[page]]) {
                links[pageMap[page]].classList.add('active');
            }
        }

        // ---------- PAGE NAVIGATION (GLOBAL) ----------
window.showPage = function (pageName) {

    // Cleanup previous page
    if (
        currentPage !== 'home' &&
        currentPage !== pageName &&
        pageData[currentPage]?.cleanup
    ) {
        pageData[currentPage].cleanup();
    }

    // Hide all pages
    document.querySelectorAll('.page').forEach(page => {
        page.classList.remove('active');
    });

    // Close mobile menu safely
    const menu = document.getElementById('navMenu');
    if (menu) {
        menu.classList.remove('open');
    }

    // Update nav
    updateActiveNav(pageName);
    currentPage = pageName;

    // Show selected page
    const pageElement = document.getElementById(pageName + 'Page');
    if (!pageElement) {
        console.error('Page not found:', pageName + 'Page');
        return;
    }

    pageElement.classList.add('active');

    // Lazy-load page content
    if (pageName !== 'home') {
    if (typeof loadPageContent === 'function') {
        loadPageContent(pageName, pageElement);
        pageData[pageName].loaded = true;
    }
}

    // ✅ AUTO-SCROLL TO PAGE CONTENT (IMPORTANT)
    setTimeout(() => {
        const content = document.getElementById(pageName + 'Content');
        const navHeight = document.querySelector('.navbar')?.offsetHeight || 0;

        if (content) {
            const y =
                content.getBoundingClientRect().top +
                window.pageYOffset -
                navHeight;

            window.scrollTo({ top: y, behavior: 'smooth' });
        } else {
            // fallback
            window.scrollTo({ top: 0, behavior: 'smooth' });
        }
    }, 50);
};
        function loadPageContent(pageName, container) {
            switch(pageName) {
                case 'explore':
                    loadExplorePage(container);
                    break;
                case 'learn':
                    loadLearnPage(container);
                    break;
                case 'quiz':
                    loadQuizPage(container);
                    break;
                case 'scan':
                    loadScanPage(container);
                    break;
                case 'act':
                    loadActPage(container);
                    break;
            }
        }

        // EXPLORE PAGE - Full Three.js Implementation
        function loadExplorePage(container) {
            container.innerHTML = `
                <style>
                    #exploreContent {
                        width: 100vw;
                        height: 100vh;
                        position: relative;
                        background: #000;
                    }
                    #canvas-container-explore {
                        width: 100%;
                        height: 100%;
                        position: relative;
                    }
                    .explore-ui-overlay {
                        position: absolute;
                        top: 0;
                        left: 0;
                        width: 100%;
                        height: 100%;
                        pointer-events: none;
                        z-index: 10;
                    }
                    .explore-top-bar {
                        display: flex;
                        justify-content: center;
                        align-items: center;
                        padding: 6rem 2rem 1rem;
                        pointer-events: auto;
                    }
                    .time-control {
                        display: flex;
                        gap: 0.5rem;
                        align-items: center;
                    }
                    .time-btn {
                        background: rgba(0, 0, 0, 0.7);
                        backdrop-filter: blur(10px);
                        border: 2px solid #8bc34a;
                        color: #8bc34a;
                        padding: 0.5rem 1rem;
                        border-radius: 20px;
                        cursor: pointer;
                        font-family: 'Baloo 2', cursive;
                        font-size: 0.9rem;
                        transition: all 0.3s ease;
                        box-shadow: 0 0 10px rgba(139, 195, 74, 0.3);
                    }
                    .time-btn:hover, .time-btn.active {
                        background: rgba(139, 195, 74, 0.6);
                        box-shadow: 0 0 20px rgba(139, 195, 74, 0.8);
                    }
                    .explore-instructions {
                        position: absolute;
                        bottom: 2rem;
                        left: 50%;
                        transform: translateX(-50%);
                        background: rgba(0,0,0,0.9);
                        backdrop-filter: blur(10px);
                        color: #8bc34a;
                        padding: 1rem 2rem;
                        border-radius: 15px;
                        text-align: center;
                        font-size: 0.9rem;
                        pointer-events: none;
                        border: 1px solid rgba(139, 195, 74, 0.3);
                    }
                    .explore-info-panel {
                        position: absolute;
                        right: 2rem;
                        top: 50%;
                        transform: translateY(-50%);
                        width: 300px;
                        background: rgba(0,0,0,0.95);
                        backdrop-filter: blur(20px);
                        border: 2px solid rgba(139, 195, 74, 0.8);
                        border-radius: 20px;
                        padding: 1.5rem;
                        color: #fff;
                        pointer-events: auto;
                        opacity: 0;
                        transition: all 0.5s ease;
                        pointer-events: none;
                        box-shadow: 0 0 30px rgba(139, 195, 74, 0.5);
                        z-index: 20;
                    }
                    .explore-info-panel.visible {
                        opacity: 1;
                        pointer-events: auto;
                    }
                    .explore-info-panel h3 {
                        color: #8bc34a;
                        font-size: 1.5rem;
                        margin-bottom: 0.5rem;
                    }
                    .explore-close-btn {
                        position: absolute;
                        top: 1rem;
                        right: 1rem;
                        background: rgba(139, 195, 74, 0.3);
                        border: none;
                        color: #8bc34a;
                        width: 30px;
                        height: 30px;
                        border-radius: 50%;
                        cursor: pointer;
                        font-size: 1.2rem;
                        display: flex;
                        align-items: center;
                        justify-content: center;
                        transition: all 0.3s ease;
                    }
                    .explore-close-btn:hover {
                        background: rgba(244, 67, 54, 0.8);
                        color: #fff;
                    }
                </style>
                <div id="exploreContent">
                    <div id="canvas-container-explore"></div>
                    <div class="explore-ui-overlay">
                        <div class="explore-top-bar">
                            <div class="time-control">
                                <button class="time-btn" onclick="exploreSetTime('day')">☀️ Day</button>
                                <button class="time-btn active" onclick="exploreSetTime('sunset')">🌅 Sunset</button>
                                <button class="time-btn" onclick="exploreSetTime('night')">🌙 Night</button>
                            </div>
                        </div>
                        <div class="explore-instructions">
                            Click and drag to look around | WASD or Arrow keys to move | Click on animals to learn more
                        </div>
                        <div class="explore-info-panel" id="exploreInfoPanel">
                            <button class="explore-close-btn" onclick="exploreCloseInfo()">×</button>
                            <h3 id="exploreAnimalName">Red Fox</h3>
                            <div style="font-style: italic; color: #aed581; margin-bottom: 1rem;" id="exploreSpeciesName">Vulpes vulpes</div>
                            <div style="line-height: 1.6; margin-bottom: 1rem;" id="exploreDescription">
                                A highly adaptable omnivore found throughout the Northern Hemisphere.
                            </div>
                            <div style="background: rgba(139, 195, 74, 0.2); padding: 1rem; border-radius: 10px; margin-top: 1rem; border: 1px solid rgba(139, 195, 74, 0.4);" id="exploreFacts">
                                <div style="font-size: 0.85rem; margin: 0.5rem 0;">Active during dawn and dusk</div>
                            </div>
                        </div>
                    </div>
                </div>
            `;

            // Initialize Three.js scene
            initExploreScene();
        }

        let exploreScene, exploreCamera, exploreRenderer;
        let exploreAnimals = [];
        let exploreTrees = [];
        let exploreAnimationId;
        let exploreMoveForward = false, exploreMoveBackward = false, exploreMoveLeft = false, exploreMoveRight = false;
        let exploreVelocity = null;
        let exploreCameraRotation = { x: 0, y: Math.PI };
        let exploreIsMouseDown = false;
        let exploreMouseX = 0, exploreMouseY = 0;
        let exploreRaycaster, exploreMouse;
        let exploreTimeOfDay = 'sunset';

        const exploreSpeciesData = {
            'deer': {
                name: 'White-tailed Deer',
                scientific: 'Odocoileus virginianus',
                description: 'A graceful herbivore common in North American forests. They are excellent jumpers and can leap up to 3 meters high.',
                facts: ['Can run up to 50 km/h', 'Excellent swimmers', 'Males shed their antlers annually']
            },
            'fox': {
                name: 'Red Fox',
                scientific: 'Vulpes vulpes',
                description: 'A highly adaptable omnivore found throughout the Northern Hemisphere.',
                facts: ['Active during dawn and dusk', 'Excellent hearing and sense of smell', 'Can run up to 45 km/h']
            },
            'bird': {
                name: 'Great Horned Owl',
                scientific: 'Bubo virginianus',
                description: 'A powerful nocturnal predator with distinctive ear tufts.',
                facts: ['Can rotate head 270 degrees', 'Silent flight', 'Active primarily at night']
            }
        };

        function initExploreScene() {
            const container = document.getElementById('canvas-container-explore');
            if (!container) return;

            exploreScene = new THREE.Scene();
            exploreScene.fog = new THREE.FogExp2(0x001100, 0.015);

            exploreCamera = new THREE.PerspectiveCamera(75, container.clientWidth / container.clientHeight, 0.1, 1000);
            exploreCamera.position.set(0, 2, 5);

            exploreRenderer = new THREE.WebGLRenderer({ antialias: true });
            exploreRenderer.setSize(container.clientWidth, container.clientHeight);
            exploreRenderer.shadowMap.enabled = true;
            container.appendChild(exploreRenderer.domElement);

            exploreVelocity = new THREE.Vector3();
            exploreRaycaster = new THREE.Raycaster();
            exploreMouse = new THREE.Vector2();

            createExploreLighting();
            createExploreGround();
            createExploreSky();
            createExploreTrees();
            createExploreAnimals();

            // Event listeners
            window.addEventListener('resize', onExploreResize);
            document.addEventListener('keydown', onExploreKeyDown);
            document.addEventListener('keyup', onExploreKeyUp);
            exploreRenderer.domElement.addEventListener('mousedown', onExploreMouseDown);
            exploreRenderer.domElement.addEventListener('mouseup', onExploreMouseUp);
            exploreRenderer.domElement.addEventListener('mousemove', onExploreMouseMove);
            exploreRenderer.domElement.addEventListener('click', onExploreClick);

            exploreAnimate();

            // Cleanup function
            pageData.explore.cleanup = () => {
                if (exploreAnimationId) cancelAnimationFrame(exploreAnimationId);
                window.removeEventListener('resize', onExploreResize);
                document.removeEventListener('keydown', onExploreKeyDown);
                document.removeEventListener('keyup', onExploreKeyUp);
                if (exploreRenderer) {
                    exploreRenderer.domElement.remove();
                    exploreRenderer.dispose();
                }
            };
        }

        function createExploreLighting() {
            const ambient = new THREE.AmbientLight(0xffffff, 0.4);
            exploreScene.add(ambient);

            const sun = new THREE.DirectionalLight(0xfff4e6, 0.8);
            sun.position.set(50, 50, 50);
            sun.castShadow = true;
            exploreScene.add(sun);
            exploreScene.userData.sun = sun;
        }

        function createExploreGround() {
            const groundGeometry = new THREE.PlaneGeometry(200, 200, 50, 50);
            const groundMaterial = new THREE.MeshStandardMaterial({
                color: 0x1a2a1a,
                roughness: 0.9
            });
            const ground = new THREE.Mesh(groundGeometry, groundMaterial);
            ground.rotation.x = -Math.PI / 2;
            ground.receiveShadow = true;
            exploreScene.add(ground);
        }

        function createExploreSky() {
            const skyGeometry = new THREE.SphereGeometry(500, 32, 32);
            const skyMaterial = new THREE.MeshBasicMaterial({
                color: 0xff9a56,
                side: THREE.BackSide
            });
            const sky = new THREE.Mesh(skyGeometry, skyMaterial);
            exploreScene.add(sky);
            exploreScene.userData.sky = sky;
        }

        function createExploreTrees() {
            for (let i = 0; i < 50; i++) {
                const tree = createExploreTree();
                tree.position.x = (Math.random() - 0.5) * 150;
                tree.position.z = (Math.random() - 0.5) * 150;
                if (Math.abs(tree.position.x) < 10 && Math.abs(tree.position.z) < 10) continue;
                exploreScene.add(tree);
                exploreTrees.push(tree);
            }
        }

        function createExploreTree() {
            const tree = new THREE.Group();
            const trunkGeometry = new THREE.CylinderGeometry(0.3, 0.4, 4, 8);
            const trunkMaterial = new THREE.MeshStandardMaterial({ color: 0x4d3319 });
            const trunk = new THREE.Mesh(trunkGeometry, trunkMaterial);
            trunk.position.y = 2;
            tree.add(trunk);

            const foliageMaterial = new THREE.MeshStandardMaterial({ color: 0x2d5016 });
            for (let i = 0; i < 3; i++) {
                const size = 2 - i * 0.4;
                const foliageGeometry = new THREE.ConeGeometry(size, size * 1.5, 8);
                const foliage = new THREE.Mesh(foliageGeometry, foliageMaterial);
                foliage.position.y = 4 + i * 1.2;
                tree.add(foliage);
            }
            return tree;
        }

        function createExploreAnimals() {
            const types = ['deer', 'fox', 'bird'];
            for (let i = 0; i < 15; i++) {
                const type = types[Math.floor(Math.random() * types.length)];
                const animal = createExploreAnimal(type);
                animal.position.x = (Math.random() - 0.5) * 120;
                animal.position.z = (Math.random() - 0.5) * 120;
                animal.position.y = type === 'bird' ? 5 + Math.random() * 10 : 0.5;
                animal.userData.type = type;
                animal.userData.speed = 0.02 + Math.random() * 0.02;
                animal.userData.direction = Math.random() * Math.PI * 2;
                exploreScene.add(animal);
                exploreAnimals.push(animal);
            }
        }

        function createExploreAnimal(type) {
            const group = new THREE.Group();
            const bodyMaterial = new THREE.MeshStandardMaterial({ color: type === 'deer' ? 0xc9a876 : type === 'fox' ? 0xff6b35 : 0x8b4513 });
            const body = new THREE.Mesh(new THREE.BoxGeometry(0.5, 0.4, 0.8), bodyMaterial);
            body.position.y = 0.4;
            group.add(body);
            return group;
        }

        function exploreAnimate() {
            exploreAnimationId = requestAnimationFrame(exploreAnimate);
            exploreUpdateMovement();
            
            exploreAnimals.forEach((animal, index) => {
                if (animal.userData.type === 'bird') {
                    animal.position.x += Math.cos(Date.now() * 0.0005 + index) * 0.05;
                    animal.position.z += Math.sin(Date.now() * 0.0005 + index) * 0.05;
                    animal.position.y += Math.sin(Date.now() * 0.001 + index) * 0.01;
                } else {
                    animal.userData.direction += (Math.random() - 0.5) * 0.05;
                    animal.position.x += Math.cos(animal.userData.direction) * animal.userData.speed;
                    animal.position.z += Math.sin(animal.userData.direction) * animal.userData.speed;
                    if (Math.abs(animal.position.x) > 90) animal.userData.direction += Math.PI;
                    if (Math.abs(animal.position.z) > 90) animal.userData.direction += Math.PI;
                    animal.rotation.y = animal.userData.direction;
                }
            });

            exploreTrees.forEach((tree, index) => {
                tree.rotation.z = Math.sin(Date.now() * 0.0005 + index * 0.1) * 0.02;
            });

            if (exploreRenderer && exploreScene && exploreCamera) {
                exploreRenderer.render(exploreScene, exploreCamera);
            }
        }

        function exploreUpdateMovement() {
            const speed = 0.1;
            if (exploreMoveForward) {
                exploreVelocity.x += Math.sin(exploreCameraRotation.y) * speed;
                exploreVelocity.z += Math.cos(exploreCameraRotation.y) * speed;
            }
            if (exploreMoveBackward) {
                exploreVelocity.x -= Math.sin(exploreCameraRotation.y) * speed;
                exploreVelocity.z -= Math.cos(exploreCameraRotation.y) * speed;
            }
            if (exploreMoveLeft) {
                exploreVelocity.x += Math.cos(exploreCameraRotation.y) * speed;
                exploreVelocity.z -= Math.sin(exploreCameraRotation.y) * speed;
            }
            if (exploreMoveRight) {
                exploreVelocity.x -= Math.cos(exploreCameraRotation.y) * speed;
                exploreVelocity.z += Math.sin(exploreCameraRotation.y) * speed;
            }

            exploreCamera.position.x += exploreVelocity.x;
            exploreCamera.position.z += exploreVelocity.z;
            exploreVelocity.multiplyScalar(0.85);
            exploreCamera.position.y = Math.max(exploreCamera.position.y, 2);
            exploreCamera.rotation.order = 'YXZ';
            exploreCamera.rotation.y = exploreCameraRotation.y;
            exploreCamera.rotation.x = exploreCameraRotation.x;
        }

        function onExploreKeyDown(event) {
    const keysToBlock = ['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', ' '];

    if (keysToBlock.includes(event.key)) {
        event.preventDefault();   // 🔥 STOP PAGE SCROLL
    }

    exploreKeys[event.key.toLowerCase()] = true;
}

       function onExploreKeyUp(event) {
    const keysToBlock = ['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', ' '];

    if (keysToBlock.includes(event.key)) {
        event.preventDefault();   // 🔥 STOP PAGE SCROLL
    }

    exploreKeys[event.key.toLowerCase()] = false;
}

        function onExploreMouseDown(event) {
            exploreIsMouseDown = true;
            exploreMouseX = event.clientX;
            exploreMouseY = event.clientY;
        }

        function onExploreMouseUp() {
            exploreIsMouseDown = false;
        }

        function onExploreMouseMove(event) {
            if (exploreIsMouseDown) {
                const deltaX = event.clientX - exploreMouseX;
                const deltaY = event.clientY - exploreMouseY;
                exploreCameraRotation.y -= deltaX * 0.002;
                exploreCameraRotation.x -= deltaY * 0.002;
                exploreCameraRotation.x = Math.max(-Math.PI / 2, Math.min(Math.PI / 2, exploreCameraRotation.x));
                exploreMouseX = event.clientX;
                exploreMouseY = event.clientY;
            }
        }

        function onExploreClick(event) {
            const rect = exploreRenderer.domElement.getBoundingClientRect();
            exploreMouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
            exploreMouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;
            exploreRaycaster.setFromCamera(exploreMouse, exploreCamera);
            const intersects = exploreRaycaster.intersectObjects(exploreAnimals, true);
            if (intersects.length > 0) {
                let target = intersects[0].object;
                while (target.parent && !exploreAnimals.includes(target)) {
                    target = target.parent;
                }
                if (exploreAnimals.includes(target)) {
                    exploreShowAnimalInfo(target);
                }
            }
        }

        function exploreShowAnimalInfo(animal) {
            const type = animal.userData.type;
            const data = exploreSpeciesData[type];
            if (data) {
                document.getElementById('exploreAnimalName').textContent = data.name;
                document.getElementById('exploreSpeciesName').textContent = data.scientific;
                document.getElementById('exploreDescription').textContent = data.description;
                const factsContainer = document.getElementById('exploreFacts');
                factsContainer.innerHTML = data.facts.map(fact => 
                    `<div style="font-size: 0.85rem; margin: 0.5rem 0; padding-left: 1.5rem; position: relative;">
                        <span style="position: absolute; left: 0;">🌿</span>${fact}
                    </div>`
                ).join('');
                document.getElementById('exploreInfoPanel').classList.add('visible');
            }
        }

        function exploreCloseInfo() {
            document.getElementById('exploreInfoPanel').classList.remove('visible');
        }

        function exploreSetTime(time) {
            exploreTimeOfDay = time;
            document.querySelectorAll('.time-btn').forEach(btn => btn.classList.remove('active'));
            event.currentTarget.classList.add('active');
            
            const sky = exploreScene.userData.sky;
            const sun = exploreScene.userData.sun;
            
            if (time === 'day') {
                sky.material.color.setHex(0x87ceeb);
                exploreScene.fog.color.setHex(0x88ccaa);
                sun.intensity = 1;
            } else if (time === 'sunset') {
                sky.material.color.setHex(0xff9a56);
                exploreScene.fog.color.setHex(0x442200);
                sun.intensity = 0.8;
            } else if (time === 'night') {
                sky.material.color.setHex(0x000033);
                exploreScene.fog.color.setHex(0x000000);
                sun.intensity = 0.2;
            }
        }

        function onExploreResize() {
            if (currentPage !== 'explore' || !exploreCamera || !exploreRenderer) return;
            const container = document.getElementById('canvas-container-explore');
            if (container) {
                exploreCamera.aspect = container.clientWidth / container.clientHeight;
                exploreCamera.updateProjectionMatrix();
                exploreRenderer.setSize(container.clientWidth, container.clientHeight);
            }
        }

        // LEARN PAGE - Full Implementation
        function loadLearnPage(container) {
            container.innerHTML = `
                <style>
                    #learnContent {
                        background: linear-gradient(135deg, #1a472a 0%, #2d5a3d 50%, #4a7c59 100%);
                        min-height: 100vh;
                        padding-top: 100px;
                    }
                    .learn-container {
                        max-width: 1400px;
                        margin: 0 auto;
                        padding: 2rem;
                    }
                    .learn-header {
                        text-align: center;
                        margin-bottom: 2rem;
                    }
                    .learn-header h1 {
                        font-size: 3rem;
                        color: #fff;
                        margin-bottom: 0.5rem;
                    }
                    .learn-subtitle {
                        color: #c8e6c9;
                        font-size: 1.2rem;
                    }
                    .filter-tabs {
                        display: flex;
                        gap: 1rem;
                        justify-content: center;
                        margin: 2rem 0;
                        flex-wrap: wrap;
                    }
                    .filter-btn {
                        padding: 0.7rem 1.5rem;
                        border: 2px solid rgba(139, 195, 74, 0.5);
                        background: rgba(255,255,255,0.1);
                        backdrop-filter: blur(10px);
                        color: #fff;
                        border-radius: 25px;
                        cursor: pointer;
                        font-family: 'Baloo 2', cursive;
                        font-size: 1rem;
                        font-weight: 600;
                        transition: all 0.3s ease;
                    }
                    .filter-btn:hover, .filter-btn.active {
                        background: linear-gradient(135deg, #8bc34a 0%, #689f38 100%);
                        border-color: #8bc34a;
                        transform: translateY(-2px);
                        box-shadow: 0 5px 15px rgba(139, 195, 74, 0.4);
                    }
                    .learn-cards-grid {
                        display: grid;
                        grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
                        gap: 2rem;
                        margin: 2rem 0;
                    }
                    .learn-card-container {
                        perspective: 1000px;
                        height: 400px;
                    }
                    .learn-card {
                        width: 100%;
                        height: 100%;
                        position: relative;
                        transform-style: preserve-3d;
                        transition: transform 0.6s;
                        cursor: pointer;
                    }
                    .learn-card.flipped {
                        transform: rotateY(180deg);
                    }
                    .learn-card-face {
                        position: absolute;
                        width: 100%;
                        height: 100%;
                        backface-visibility: hidden;
                        border-radius: 20px;
                        overflow: hidden;
                        box-shadow: 0 10px 30px rgba(0,0,0,0.3);
                    }
                    .learn-card-front {
                        background: linear-gradient(135deg, rgba(255,255,255,0.15) 0%, rgba(255,255,255,0.05) 100%);
                        backdrop-filter: blur(10px);
                        border: 2px solid rgba(255,255,255,0.2);
                        display: flex;
                        flex-direction: column;
                        align-items: center;
                        justify-content: center;
                        padding: 2rem;
                        transition: all 0.3s ease;
                    }
                    .learn-card-front:hover {
                        border-color: rgba(139, 195, 74, 0.5);
                        transform: translateY(-5px);
                    }
                    .learn-card-icon {
                        font-size: 6rem;
                        margin-bottom: 1rem;
                    }
                    .learn-card-title {
                        font-size: 1.8rem;
                        color: #fff;
                        font-weight: 700;
                        text-align: center;
                        margin-bottom: 0.5rem;
                    }
                    .learn-card-category {
                        color: #8bc34a;
                        font-size: 1rem;
                    }
                    .learn-card-back {
                        background: linear-gradient(135deg, #1a472a 0%, #2d5a3d 100%);
                        border: 2px solid #8bc34a;
                        transform: rotateY(180deg);
                        padding: 2rem;
                        color: #fff;
                        overflow-y: auto;
                    }
                    .learn-card-back h3 {
                        color: #8bc34a;
                        font-size: 1.5rem;
                        margin-bottom: 0.5rem;
                    }
                    .learn-scientific {
                        font-style: italic;
                        color: #aed581;
                        margin-bottom: 1rem;
                    }
                    .learn-facts-list {
                        background: rgba(139, 195, 74, 0.2);
                        padding: 1rem;
                        border-radius: 10px;
                        margin-top: 1rem;
                    }
                    .learn-fact {
                        margin: 0.5rem 0;
                        padding-left: 1.5rem;
                        position: relative;
                        font-size: 0.9rem;
                    }
                    .learn-fact::before {
                        content: '🌿';
                        position: absolute;
                        left: 0;
                    }
                </style>
                <div id="learnContent">
                    <div class="learn-container">
                        <div class="learn-header">
                            <h1>📚 Learn About Nature</h1>
                            <p class="learn-subtitle">Discover amazing species and unlock new knowledge!</p>
                        </div>
                        <div class="filter-tabs">
                            <button class="filter-btn active" onclick="learnFilterCards('all')">🌍 All</button>
                            <button class="filter-btn" onclick="learnFilterCards('mammals')">🦊 Mammals</button>
                            <button class="filter-btn" onclick="learnFilterCards('birds')">🦅 Birds</button>
                            <button class="filter-btn" onclick="learnFilterCards('insects')">🦋 Insects</button>
                            <button class="filter-btn" onclick="learnFilterCards('plants')">🌻 Plants</button>
                        </div>
                        <div class="learn-cards-grid" id="learnCardsGrid"></div>
                    </div>
                </div>
            `;
            
            learnRenderCards();
        }

        const learnSpeciesData = [
            {
                id: 1,
                name: 'Red Fox',
                scientific: 'Vulpes vulpes',
                category: 'mammals',
                icon: '🦊',
                description: 'The red fox is one of the most widely distributed carnivores. They are incredibly adaptable and can thrive in various environments.',
                facts: ['Can hear a mouse 100 feet away', 'Uses Earth\'s magnetic field to hunt', 'Can run up to 45 km/h']
            },
            {
                id: 2,
                name: 'Monarch Butterfly',
                scientific: 'Danaus plexippus',
                category: 'insects',
                icon: '🦋',
                description: 'Famous for their incredible migration spanning up to 4,800 km across North America.',
                facts: ['Migrates thousands of kilometers', 'Four generations complete one cycle', 'Only eats milkweed as caterpillar']
            },
            {
                id: 3,
                name: 'Bald Eagle',
                scientific: 'Haliaeetus leucocephalus',
                category: 'birds',
                icon: '🦅',
                description: 'The national bird of the United States, this magnificent raptor has made a remarkable recovery.',
                facts: ['Can see fish from 300 meters high', 'Mates for life', 'Nests can weigh up to 2,000 pounds']
            },
            {
                id: 4,
                name: 'Sunflower',
                scientific: 'Helianthus annuus',
                category: 'plants',
                icon: '🌻',
                description: 'These cheerful flowers are famous for tracking the sun across the sky in heliotropism.',
                facts: ['Young flowers track the sun', 'Can grow up to 5 meters tall', 'Each head contains up to 2,000 seeds']
            },
            {
                id: 5,
                name: 'White-tailed Deer',
                scientific: 'Odocoileus virginianus',
                category: 'mammals',
                icon: '🦌',
                description: 'Common in North America, these graceful herbivores are named for their distinctive white tail.',
                facts: ['Can jump 3 meters high', 'Excellent swimmers', 'Males shed antlers every winter']
            },
{
    id: 6,
    name: 'African Elephant',
    scientific: 'Loxodonta africana',
    category: 'mammals',
    icon: '🐘',
    description: 'The largest land mammal on Earth, African elephants are known for their intelligence and strong social structures.',
    facts: ['Can communicate through vibrations', 'Have a memory span of up to 50 years', 'Can weigh up to 6,000 kg']
},
{
    id: 7,
    name: 'Great White Shark',
    scientific: 'Carcharodon carcharias',
    category: 'fish',
    icon: '🦈',
    description: 'A formidable predator, the great white shark is known for its size, speed, and hunting efficiency.',
    facts: ['Can swim at speeds of up to 60 km/h', 'Has up to 300 teeth in its mouth at once', 'Can detect a drop of blood in 100 liters of water']
},
{
    id: 8,
    name: 'Giraffe',
    scientific: 'Giraffa camelopardalis',
    category: 'mammals',
    icon: '🦒',
    description: 'The world\'s tallest land animal, giraffes have long necks to reach leaves high in trees.',
    facts: ['Can run up to 56 km/h', 'Necks can be 2 meters long', 'Only sleep 10 minutes at a time']
},
{
    id: 9,
    name: 'Koala',
    scientific: 'Phascolarctos cinereus',
    category: 'mammals',
    icon: '🐨',
    description: 'Koalas are arboreal marsupials native to Australia, known for their adorable appearance and love of eucalyptus leaves.',
    facts: ['Sleep up to 18 hours a day', 'Eucalyptus leaves are toxic to most animals but not to them', 'Can weigh up to 14 kilograms']
},
{
    id: 10,
    name: 'Penguin',
    scientific: 'Spheniscidae',
    category: 'birds',
    icon: '🐧',
    description: 'Penguins are flightless birds that are superb swimmers, found primarily in the Southern Hemisphere.',
    facts: ['Can swim up to 20 miles per hour', 'Some species can dive to depths of 500 meters', 'Male penguins are known for giving pebbles to females as gifts']
},
{
    id: 11,
    name: 'Lion',
    scientific: 'Panthera leo',
    category: 'mammals',
    icon: '🦁',
    description: 'The king of the jungle, lions are apex predators known for their social pride structure.',
    facts: ['Live in groups called prides', 'Males have impressive manes', 'Can run up to 50 km/h in short bursts']
},
{
    id: 12,
    name: 'Kangaroo',
    scientific: 'Macropus',
    category: 'mammals',
    icon: '🦘',
    description: 'Kangaroos are marsupials native to Australia, famous for their powerful hind legs used for hopping.',
    facts: ['Can jump up to 3 meters high', 'Use their tails for balance while hopping', 'Males can weigh up to 90 kg']
},
{
    id: 13,
    name: 'Panda',
    scientific: 'Ailuropoda melanoleuca',
    category: 'mammals',
    icon: '🐼',
    description: 'Pandas are herbivorous bears known for their black-and-white fur and their diet of bamboo.',
    facts: ['Eat up to 38 kg of bamboo per day', 'Spend most of their day eating or sleeping', 'Males can weigh up to 160 kg']
},
{
    id: 14,
    name: 'Tiger',
    scientific: 'Panthera tigris',
    category: 'mammals',
    icon: '🐅',
    description: 'Tigers are solitary, apex predators and the largest of the big cats.',
    facts: ['Can swim long distances', 'Can leap 10 meters in one bound', 'Have unique stripe patterns']
},
{
    id: 15,
    name: 'Sloth',
    scientific: 'Bradypodidae',
    category: 'mammals',
    icon: '🦥',
    description: 'Sloths are known for their slow movements and are native to Central and South America.',
    facts: ['Can sleep up to 20 hours a day', 'Move at a maximum speed of 0.03 km/h', 'Spend most of their lives hanging upside down']
},
{
    id: 16,
    name: 'Clownfish',
    scientific: 'Amphiprioninae',
    category: 'fish',
    icon: '🐠',
    description: 'Clownfish are small, brightly colored fish known for their symbiotic relationship with sea anemones.',
    facts: ['Have a natural immunity to the sting of sea anemones', 'Male clownfish can change sex', 'Can live up to 10 years in the wild']
},
{
    id: 17,
    name: 'Anglerfish',
    scientific: 'Lasiognathidae',
    category: 'fish',
    icon: '🐟',
    description: 'Anglerfish are deep-sea fish known for their bioluminescent lure used to attract prey.',
    facts: ['Can live at depths of up to 2,000 meters', 'Males are much smaller than females', 'Have a glowing lure on top of their heads']
},
{
    id: 18,
    name: 'Seahorse',
    scientific: 'Hippocampus',
    category: 'fish',
    icon: '🦐',
    description: 'Seahorses are small marine fish with a horse-like head, known for their unique method of reproduction.',
    facts: ['Males carry and give birth to the young', 'Can change color to blend in with their surroundings', 'Can swim upright like a horse']
},
{
    id: 19,
    name: 'Hammerhead Shark',
    scientific: 'Sphyrnidae',
    category: 'fish',
    icon: '🦈',
    description: 'Hammerhead sharks are known for their wide, flattened heads that improve their sensory abilities.',
    facts: ['Have enhanced electroreception to detect prey', 'Can swim in schools of over 100 individuals', 'Some species can grow over 6 meters long']
},
{
    id: 20,
    name: 'Manta Ray',
    scientific: 'Manta birostris',
    category: 'fish',
    icon: '🦋',
    description: 'Manta rays are large, flat fish that glide through the water and are known for their gracefulness.',
    facts: ['Can weigh up to 3,000 kg', 'Have a wingspan of up to 7 meters', 'Use their large pectoral fins to filter plankton']
},
{
    id: 21,
    name: 'Honeybee',
    scientific: 'Apis mellifera',
    category: 'insects',
    icon: '🐝',
    description: 'Honeybees are essential pollinators, famous for producing honey and beeswax.',
    facts: ['Can fly at speeds up to 24 km/h', 'Communicate through a unique “waggle dance”', 'One bee colony can produce over 100 pounds of honey per year']
},
{
    id: 22,
    name: 'Ladybug',
    scientific: 'Coccinellidae',
    category: 'insects',
    icon: '🐞',
    description: 'Ladybugs are small beetles known for their distinctive red-and-black spotted appearance.',
    facts: ['Are natural pest control, eating aphids', 'Can have up to 500 eggs in one season', 'Their spots can indicate species and age']
},
{
    id: 23,
    name: 'Dragonfly',
    scientific: 'Anisoptera',
    category: 'insects',
    icon: '🦗',
    description: 'Dragonflies are predatory insects with large, transparent wings and excellent flight abilities.',
    facts: ['Can fly at speeds of up to 60 km/h', 'Can hover in one spot', 'Their larvae live underwater for up to 5 years']
},
{
    id: 24,
    name: 'Praying Mantis',
    scientific: 'Mantodea',
    category: 'insects',
    icon: '🦗',
    description: 'Praying mantises are known for their unique posture and exceptional predatory skills.',
    facts: ['Can turn their heads 180 degrees', 'Are capable of eating prey larger than themselves', 'Females sometimes eat males after mating']
},
{
    id: 25,
    name: 'Caterpillar',
    scientific: 'Lepidoptera (larval stage)',
    category: 'insects',
    icon: '🐛',
    description: 'Caterpillars are the larvae of butterflies and moths, known for their remarkable metamorphosis into adult insects.',
    facts: ['Molts up to 4 times before becoming a pupa', 'Can consume up to 27,000 times their body weight in leaves', 'Transform into butterflies or moths in a cocoon']
},
{
    id: 26,
    name: 'Cactus',
    scientific: 'Cactaceae',
    category: 'plants',
    icon: '🌵',
    description: 'Cacti are plants adapted to survive in arid environments, famous for their water-storing capabilities.',
    facts: ['Can store up to 200 liters of water in their stems', 'Some species can live for over 200 years', 'Produce beautiful flowers that bloom once a year']
},
{
    id: 27,
    name: 'Oak Tree',
    scientific: 'Quercus',
    category: 'plants',
    icon: '🌳',
    description: 'Oak trees are hardwood trees known for their strength, longevity, and acorn production.',
    facts: ['Can live for over 1,000 years', 'Acorns are a primary food source for many animals', 'Provide habitat for hundreds of species']
},
{
    id: 28,
    name: 'Rose',
    scientific: 'Rosa',
    category: 'plants',
    icon: '🌹',
    description: 'Roses are one of the most popular flowering plants, cherished for their beauty and fragrance.',
    facts: ['Over 100 species exist worldwide', 'Can have thorns to protect themselves from herbivores', 'Symbolize love and passion in many cultures']
},
{
    id: 29,
    name: 'Venus Flytrap',
    scientific: 'Dionaea muscipula',
    category: 'plants',
    icon: '🪴',
    description: 'A carnivorous plant known for its jaw-like leaves that snap shut when prey touches them.',
    facts: ['Can trap insects in less than 1 second', 'Can count how many times prey touches its hairs', 'Thrives in nutrient-poor soil']
},
{
    id: 30,
    name: 'Baobab Tree',
    scientific: 'Adansonia',
    category: 'plants',
    icon: '🌳',
    description: 'Baobab trees are iconic trees of the African savannah, known for their massive trunks that store water.',
    facts: ['Can live for over 6,000 years', 'Trunks can store up to 120,000 liters of water', 'Flowers only bloom at night']
},
        ];

        let learnCurrentFilter = 'all';

        function learnRenderCards() {
            const grid = document.getElementById('learnCardsGrid');
            if (!grid) return;
            
            grid.innerHTML = '';
            const filtered = learnCurrentFilter === 'all' 
                ? learnSpeciesData 
                : learnSpeciesData.filter(s => s.category === learnCurrentFilter);

            filtered.forEach(species => {
                const cardContainer = document.createElement('div');
                cardContainer.className = 'learn-card-container';
                cardContainer.innerHTML = `
                    <div class="learn-card" onclick="learnFlipCard(this)">
                        <div class="learn-card-face learn-card-front">
                            <div class="learn-card-icon">${species.icon}</div>
                            <div class="learn-card-title">${species.name}</div>
                            <div class="learn-card-category">${species.category.charAt(0).toUpperCase() + species.category.slice(1)}</div>
                            <div style="color: #c8e6c9; font-size: 0.9rem; margin-top: 1rem;">Tap to learn more ↻</div>
                        </div>
                        <div class="learn-card-face learn-card-back">
                            <h3>${species.name}</h3>
                            <div class="learn-scientific">${species.scientific}</div>
                            <p style="line-height: 1.6; margin-bottom: 1rem;">${species.description}</p>
                            <div class="learn-facts-list">
                                <h4 style="color: #8bc34a; margin-bottom: 0.5rem;">🌟 Fun Facts</h4>
                                ${species.facts.map(fact => `<div class="learn-fact">${fact}</div>`).join('')}
                            </div>
                        </div>
                    </div>
                `;
                grid.appendChild(cardContainer);
            });
        }

        function learnFlipCard(card) {
            card.classList.toggle('flipped');
        }

        function learnFilterCards(category) {
            learnCurrentFilter = category;
            document.querySelectorAll('.filter-btn').forEach(btn => btn.classList.remove('active'));
            event.currentTarget.classList.add('active');
            learnRenderCards();
        }

        // QUIZ PAGE - Full Implementation
        function loadQuizPage(container) {
            container.innerHTML = `
                <style>
                    #quizContent {
                        background: linear-gradient(135deg, #1a472a 0%, #2d5a3d 50%, #4a7c59 100%);
                        min-height: 100vh;
                        padding: 100px 20px 20px;
                    }
                    .quiz-container {
                        max-width: 900px;
                        margin: 0 auto;
                    }
                    .quiz-header {
                        text-align: center;
                        margin-bottom: 2rem;
                    }
                    .quiz-header h1 {
                        font-size: 3rem;
                        color: #fff;
                        margin-bottom: 0.5rem;
                    }
                    .quiz-progress {
                        display: flex;
                        justify-content: center;
                        gap: 1rem;
                        margin: 2rem 0;
                    }
                    .progress-dot {
                        width: 20px;
                        height: 20px;
                        border-radius: 50%;
                        background: rgba(255,255,255,0.3);
                        transition: all 0.3s ease;
                    }
                    .progress-dot.active {
                        background: #ffd54f;
                        transform: scale(1.3);
                    }
                    .progress-dot.correct {
                        background: #4caf50;
                    }
                    .progress-dot.incorrect {
                        background: #f44336;
                    }
                    .quiz-card {
                        background: rgba(255,255,255,0.15);
                        backdrop-filter: blur(20px);
                        border: 2px solid rgba(255,255,255,0.2);
                        border-radius: 30px;
                        padding: 3rem;
                        margin: 2rem 0;
                    }
                    .question-image {
                        font-size: 6rem;
                        text-align: center;
                        margin-bottom: 1rem;
                    }
                    .question-text {
                        color: #fff;
                        font-size: 1.8rem;
                        font-weight: 600;
                        text-align: center;
                        margin-bottom: 2rem;
                    }
                    .answers-grid {
                        display: grid;
                        grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
                        gap: 1rem;
                    }
                    .answer-btn {
                        background: rgba(255,255,255,0.2);
                        border: 3px solid rgba(255,255,255,0.3);
                        color: #fff;
                        padding: 1.5rem;
                        border-radius: 20px;
                        cursor: pointer;
                        font-family: 'Baloo 2', cursive;
                        font-size: 1.1rem;
                        font-weight: 600;
                        transition: all 0.3s ease;
                    }
                    .answer-btn:hover:not(.disabled) {
                        background: rgba(139, 195, 74, 0.3);
                        border-color: #8bc34a;
                        transform: translateY(-5px);
                    }
                    .answer-btn.correct {
                        background: rgba(76, 175, 80, 0.8);
                        border-color: #4caf50;
                    }
                    .answer-btn.incorrect {
                        background: rgba(244, 67, 54, 0.8);
                        border-color: #f44336;
                    }
                    .answer-btn.disabled {
                        cursor: not-allowed;
                        opacity: 0.6;
                    }
                    .quiz-feedback {
                        background: rgba(139, 195, 74, 0.2);
                        border: 2px solid #8bc34a;
                        border-radius: 15px;
                        padding: 1.5rem;
                        margin-top: 1.5rem;
                        opacity: 0;
                        transition: all 0.3s ease;
                    }
                    .quiz-feedback.visible {
                        opacity: 1;
                    }
                    .quiz-feedback.incorrect-feedback {
                        background: rgba(244, 67, 54, 0.2);
                        border-color: #f44336;
                    }
                    .next-btn {
                        background: linear-gradient(135deg, #8bc34a 0%, #689f38 100%);
                        border: none;
                        color: #fff;
                        padding: 1rem 3rem;
                        border-radius: 30px;
                        cursor: pointer;
                        font-family: 'Baloo 2', cursive;
                        font-size: 1.2rem;
                        font-weight: 700;
                        margin-top: 2rem;
                        display: none;
                    }
                    .next-btn.visible {
                        display: inline-block;
                    }
                    .next-btn:hover {
                        transform: translateY(-3px);
                        box-shadow: 0 10px 25px rgba(139, 195, 74, 0.5);
                    }
                    .results-screen {
                        display: none;
                        text-align: center;
                    }
                    .results-screen.visible {
                        display: block;
                    }
                    .score-display {
                        font-size: 6rem;
                        color: #ffd54f;
                        font-weight: 800;
                        margin: 2rem 0;
                    }
                    .action-buttons {
                        display: flex;
                        gap: 1rem;
                        justify-content: center;
                        margin-top: 3rem;
                    }
                    .action-btn {
                        padding: 1rem 2rem;
                        border: none;
                        border-radius: 25px;
                        font-family: 'Baloo 2', cursive;
                        font-size: 1.1rem;
                        font-weight: 600;
                        cursor: pointer;
                        transition: all 0.3s ease;
                    }
                    .btn-retry {
                        background: linear-gradient(135deg, #8bc34a 0%, #689f38 100%);
                        color: #fff;
                    }
                </style>
                <div id="quizContent">
                    <div class="quiz-container">
                        <div id="quizScreen">
                            <div class="quiz-header">
                                <h1>🎯 Nature Quiz</h1>
                                <p style="color: #c8e6c9; font-size: 1.2rem;">Test your knowledge and earn badges!</p>
                            </div>
                            <div class="quiz-progress" id="quizProgress"></div>
                            <div class="quiz-card">
                                <div class="question-image" id="questionImage"></div>
                                <div class="question-text" id="questionText"></div>
                                <div class="answers-grid" id="answersGrid"></div>
                                <div class="quiz-feedback" id="quizFeedback">
                                    <div style="font-size: 1.3rem; font-weight: 700; margin-bottom: 0.5rem;" id="feedbackTitle"></div>
                                    <div id="feedbackText"></div>
                                </div>
                                <button class="next-btn" id="nextBtn" onclick="quizNextQuestion()">Next Question →</button>
                            </div>
                        </div>
                        <div class="results-screen" id="resultsScreen">
                            <div class="quiz-header">
                                <h1>🎉 Quiz Complete!</h1>
                            </div>
                            <div class="score-display" id="scoreDisplay"></div>
                            <div style="font-size: 2rem; color: #fff; margin: 1rem 0;" id="performanceMessage"></div>
                            <div class="action-buttons">
                                <button class="action-btn btn-retry" onclick="quizRestart()">🔄 Try Again</button>
                            </div>
                        </div>
                    </div>
                </div>
            `;
            
            quizInit();
        }

        const quizQuestions = [
            {
                question: "Which animal uses Earth's magnetic field to hunt prey hidden under snow?",
                image: "🦊",
                answers: ["Red Fox", "Wolf", "Bear", "Owl"],
                correct: 0,
                explanation: "Red foxes can sense Earth's magnetic field and use it to triangulate prey with incredible accuracy!"
            },
            {
                question: "How far can a Monarch Butterfly migrate in a single journey?",
                image: "🦋",
                answers: ["500 km", "1,000 km", "2,500 km", "4,800 km"],
                correct: 3,
                explanation: "Monarch butterflies can migrate up to 4,800 km! It takes four generations to complete the cycle."
            },
            {
                question: "How many degrees can a Great Horned Owl rotate its head?",
                image: "🦉",
                answers: ["90 degrees", "180 degrees", "270 degrees", "360 degrees"],
                correct: 2,
                explanation: "Owls can rotate their heads 270 degrees because they cannot move their eyes!"
            },
            {
                question: "What do young sunflowers do during the day?",
                image: "🌻",
                answers: ["Stay still", "Track the sun", "Close petals", "Produce seeds"],
                correct: 1,
                explanation: "Young sunflowers exhibit heliotropism - they follow the sun from east to west!"
            },
            {
                question: "How fast can a White-tailed Deer run?",
                image: "🦌",
                answers: ["20 km/h", "35 km/h", "50 km/h", "70 km/h"],
                correct: 2,
                explanation: "White-tailed deer can run up to 50 km/h and jump 3 meters high!"
            },
            {
        question: "Which animal is known as the 'King of the Jungle'?",
        image: "🦁",
        answers: ["Lion", "Tiger", "Elephant", "Leopard"],
        correct: 0,
        explanation: "The lion is often referred to as the 'King of the Jungle' due to its power and social structure."
    },
    {
        question: "What is the largest species of shark?",
        image: "🦈",
        answers: ["Great White Shark", "Whale Shark", "Hammerhead Shark", "Tiger Shark"],
        correct: 1,
        explanation: "The whale shark is the largest species of shark, growing up to 18 meters long!"
    },
    {
        question: "Which tree is known for its acorns and strength?",
        image: "🌳",
        answers: ["Pine Tree", "Oak Tree", "Maple Tree", "Birch Tree"],
        correct: 1,
        explanation: "Oak trees are famous for their hard wood and acorn production, making them very important to wildlife."
    },
    {
        question: "How long can a Giraffe's neck be?",
        image: "🦒",
        answers: ["1 meter", "2 meters", "3 meters", "4 meters"],
        correct: 1,
        explanation: "Giraffes have necks that can be up to 2 meters long, which helps them reach high foliage."
    },
    {
        question: "How many years can an African Elephant live in the wild?",
        image: "🐘",
        answers: ["40-50 years", "50-60 years", "60-70 years", "70-80 years"],
        correct: 2,
        explanation: "African elephants can live up to 60-70 years in the wild, though they face many threats from poaching."
    },
    {
        question: "Which species of bird mates for life?",
        image: "🦅",
        answers: ["Bald Eagle", "Penguin", "Albatross", "Peacock"],
        correct: 0,
        explanation: "Bald eagles are known to mate for life, creating strong, long-lasting bonds with their partners."
    },
    {
        question: "What is the primary diet of a Panda?",
        image: "🐼",
        answers: ["Fish", "Bamboo", "Insects", "Fruits"],
        correct: 1,
        explanation: "Pandas are almost exclusively herbivores, with bamboo making up 99% of their diet."
    },
    {
        question: "Which insect is known for its ability to 'dance' to communicate?",
        image: "🐝",
        answers: ["Honeybee", "Ant", "Dragonfly", "Moth"],
        correct: 0,
        explanation: "Honeybees perform a 'waggle dance' to communicate the location of food sources to their hive mates."
    },
    {
        question: "What is the longest migration of any animal?",
        image: "🦋",
        answers: ["Gray Whale", "Monarch Butterfly", "Arctic Tern", "Caribou"],
        correct: 2,
        explanation: "The Arctic Tern migrates an incredible 70,000 km every year, from the Arctic to the Antarctic and back!"
    },
    {
        question: "Which plant is known for its ability to trap insects for nourishment?",
        image: "🪴",
        answers: ["Venus Flytrap", "Sunflower", "Cactus", "Rose"],
        correct: 0,
        explanation: "The Venus Flytrap uses its modified leaves to snap shut when an insect triggers its 'hairs'!"
    },
    {
        question: "Which is the fastest land animal?",
        image: "🐆",
        answers: ["Lion", "Cheetah", "Elephant", "Horse"],
        correct: 1,
        explanation: "The cheetah is the fastest land animal, capable of running at speeds of up to 100 km/h in short bursts."
    },
    {
        question: "What is the largest plant on Earth?",
        image: "🌳",
        answers: ["Giant Sequoia", "Baobab Tree", "Redwood", "Titan Arum"],
        correct: 2,
        explanation: "The giant redwood tree (Sequoia sempervirens) can grow over 300 feet tall and is the largest plant by volume."
    },
    {
        question: "Which animal is known for its ability to change color for camouflage?",
        image: "🦎",
        answers: ["Chameleon", "Octopus", "Cuttlefish", "Squid"],
        correct: 0,
        explanation: "Chameleons are famous for their ability to change color to blend into their surroundings."
    },
    {
        question: "Which mammal is known for having the longest pregnancy?",
        image: "🐘",
        answers: ["Blue Whale", "Elephant", "Giraffe", "Kangaroo"],
        correct: 1,
        explanation: "Elephants have the longest gestation period of any mammal, lasting about 660 days (22 months)."
    }
];

        let quizCurrentQuestion = 0;
        let quizScore = 0;
        let quizAnswered = false;

        function quizInit() {
            quizCurrentQuestion = 0;
            quizScore = 0;
            quizAnswered = false;
            quizLoadQuestion();
            quizRenderProgress();
        }

        function quizRenderProgress() {
            const progress = document.getElementById('quizProgress');
            if (!progress) return;
            progress.innerHTML = '';
            for (let i = 0; i < quizQuestions.length; i++) {
                const dot = document.createElement('div');
                dot.className = 'progress-dot';
                if (i === quizCurrentQuestion) dot.classList.add('active');
                progress.appendChild(dot);
            }
        }

        function quizLoadQuestion() {
            quizAnswered = false;
            const q = quizQuestions[quizCurrentQuestion];
            
            document.getElementById('questionImage').textContent = q.image;
            document.getElementById('questionText').textContent = q.question;
            document.getElementById('quizFeedback').classList.remove('visible');
            document.getElementById('nextBtn').classList.remove('visible');
            
            const answersGrid = document.getElementById('answersGrid');
            if (!answersGrid) return;
            answersGrid.innerHTML = '';
            
            q.answers.forEach((answer, index) => {
                const btn = document.createElement('button');
                btn.className = 'answer-btn';
                btn.textContent = answer;
                btn.onclick = () => quizSelectAnswer(index);
                answersGrid.appendChild(btn);
            });
        }

        function quizSelectAnswer(index) {
            if (quizAnswered) return;
            quizAnswered = true;

            const q = quizQuestions[quizCurrentQuestion];
            const buttons = document.querySelectorAll('.answer-btn');
            
            buttons.forEach(btn => btn.classList.add('disabled'));
            
            if (index === q.correct) {
                buttons[index].classList.add('correct');
                quizScore++;
                quizShowFeedback(true, q.explanation);
                quizUpdateProgress(true);
            } else {
                buttons[index].classList.add('incorrect');
                buttons[q.correct].classList.add('correct');
                quizShowFeedback(false, q.explanation);
                quizUpdateProgress(false);
            }

            document.getElementById('nextBtn').classList.add('visible');
        }

        function quizShowFeedback(correct, explanation) {
            const feedback = document.getElementById('quizFeedback');
            const title = document.getElementById('feedbackTitle');
            const text = document.getElementById('feedbackText');
            
            if (correct) {
                title.textContent = "🎉 Correct!";
                feedback.classList.remove('incorrect-feedback');
            } else {
                title.textContent = "❌ Not quite!";
                feedback.classList.add('incorrect-feedback');
            }
            
            text.textContent = explanation;
            feedback.classList.add('visible');
        }

        function quizUpdateProgress(correct) {
            const dots = document.querySelectorAll('.progress-dot');
            if (dots[quizCurrentQuestion]) {
                dots[quizCurrentQuestion].classList.remove('active');
                dots[quizCurrentQuestion].classList.add(correct ? 'correct' : 'incorrect');
            }
        }

        function quizNextQuestion() {
            quizCurrentQuestion++;
            
            if (quizCurrentQuestion < quizQuestions.length) {
                const dots = document.querySelectorAll('.progress-dot');
                if (dots[quizCurrentQuestion]) {
                    dots[quizCurrentQuestion].classList.add('active');
                }
                quizLoadQuestion();
            } else {
                quizShowResults();
            }
        }

        function quizShowResults() {
            document.getElementById('quizScreen').style.display = 'none';
            document.getElementById('resultsScreen').classList.add('visible');
            
            const percentage = (quizScore / quizQuestions.length) * 100;
            document.getElementById('scoreDisplay').textContent = `${quizScore}/${quizQuestions.length}`;
            
            let message = '';
            if (percentage === 100) {
                message = "🏆 Perfect Score! You're a Nature Expert!";
            } else if (percentage >= 80) {
                message = "🌟 Excellent! You know your nature!";
            } else if (percentage >= 60) {
                message = "👍 Good job! Keep learning!";
            } else {
                message = "📚 Nice try! Review and try again!";
            }
            document.getElementById('performanceMessage').textContent = message;
        }

        function quizRestart() {
            document.getElementById('resultsScreen').classList.remove('visible');
            document.getElementById('quizScreen').style.display = 'block';
            quizInit();
        }

        // SCAN PAGE - Full Implementation
        function loadScanPage(container) {
            container.innerHTML = `
                <style>
                    #scanContent {
                        width: 100vw;
                        height: 100vh;
                        position: relative;
                        background: #000;
                    }
                    #scanVideo {
                        width: 100%;
                        height: 100%;
                        object-fit: cover;
                    }
                    .scan-overlay {
                        position: absolute;
                        top: 0;
                        left: 0;
                        width: 100%;
                        height: 100%;
                        pointer-events: none;
                    }
                    .scan-line {
                        position: absolute;
                        width: 100%;
                        height: 2px;
                        background: linear-gradient(90deg, transparent, #8bc34a, transparent);
                        box-shadow: 0 0 10px #8bc34a;
                        animation: scanLine 2s linear infinite;
                    }
                    @keyframes scanLine {
                        0% { top: 0; }
                        100% { top: 100%; }
                    }
                    .scan-corner {
                        position: absolute;
                        width: 60px;
                        height: 60px;
                        border: 3px solid #8bc34a;
                        opacity: 0.8;
                    }
                    .scan-corner.tl { top: 20px; left: 20px; border-right: none; border-bottom: none; }
                    .scan-corner.tr { top: 20px; right: 20px; border-left: none; border-bottom: none; }
                    .scan-corner.bl { bottom: 20px; left: 20px; border-right: none; border-top: none; }
                    .scan-corner.br { bottom: 20px; right: 20px; border-left: none; border-top: none; }
                    .scan-top-bar {
                        position: absolute;
                        top: 80px;
                        left: 0;
                        width: 100%;
                        display: flex;
                        justify-content: space-between;
                        align-items: center;
                        padding: 1rem 2rem;
                        z-index: 10;
                        pointer-events: none;
                    }
                    .scan-stats {
                        display: flex;
                        gap: 1rem;
                        background: rgba(0,0,0,0.7);
                        backdrop-filter: blur(10px);
                        padding: 0.5rem 1rem;
                        border-radius: 25px;
                        pointer-events: auto;
                    }
                    .scan-stat {
                        color: #fff;
                        font-size: 0.9rem;
                    }
                    .capture-btn {
                        position: absolute;
                        bottom: 2rem;
                        left: 50%;
                        transform: translateX(-50%);
                        width: 80px;
                        height: 80px;
                        border-radius: 50%;
                        background: linear-gradient(135deg, #8bc34a 0%, #689f38 100%);
                        border: 5px solid #fff;
                        box-shadow: 0 5px 20px rgba(139, 195, 74, 0.5);
                        cursor: pointer;
                        z-index: 10;
                        display: flex;
                        align-items: center;
                        justify-content: center;
                        font-size: 2rem;
                        transition: all 0.3s ease;
                    }
                    .capture-btn:hover {
                        transform: translateX(-50%) scale(1.1);
                    }
                    .scan-flash {
                        position: absolute;
                        top: 0;
                        left: 0;
                        width: 100%;
                        height: 100%;
                        background: #fff;
                        opacity: 0;
                        pointer-events: none;
                    }
                    .scan-flash.active {
                        animation: flashAnim 0.3s ease-out;
                    }
                    @keyframes flashAnim {
                        0% { opacity: 0; }
                        50% { opacity: 0.8; }
                        100% { opacity: 0; }
                    }
                    .species-popup {
                        position: absolute;
                        top: 50%;
                        left: 50%;
                        transform: translate(-50%, -50%) scale(0);
                        width: 90%;
                        max-width: 500px;
                        background: linear-gradient(135deg, rgba(26, 71, 42, 0.98) 0%, rgba(45, 90, 61, 0.98) 100%);
                        backdrop-filter: blur(20px);
                        border: 3px solid #8bc34a;
                        border-radius: 30px;
                        padding: 2rem;
                        color: #fff;
                        z-index: 20;
                        opacity: 0;
                        transition: all 0.5s ease;
                    }
                    .species-popup.visible {
                        transform: translate(-50%, -50%) scale(1);
                        opacity: 1;
                    }
                    .popup-close {
                        position: absolute;
                        top: 1rem;
                        right: 1rem;
                        width: 40px;
                        height: 40px;
                        border-radius: 50%;
                        background: rgba(255,255,255,0.2);
                        border: none;
                        color: #fff;
                        font-size: 1.5rem;
                        cursor: pointer;
                        display: flex;
                        align-items: center;
                        justify-content: center;
                        transition: all 0.3s ease;
                    }
                    .popup-close:hover {
                        background: rgba(244, 67, 54, 0.8);
                    }
                    .species-emoji {
                        font-size: 5rem;
                        text-align: center;
                        margin-bottom: 1rem;
                    }
                    .species-name {
                        font-size: 2rem;
                        font-weight: 800;
                        color: #8bc34a;
                        text-align: center;
                        margin-bottom: 0.5rem;
                    }
                    .species-scientific {
                        font-size: 1.2rem;
                        font-style: italic;
                        color: #aed581;
                        text-align: center;
                        margin-bottom: 1rem;
                    }
                    .species-facts {
                        background: rgba(139, 195, 74, 0.2);
                        padding: 1rem;
                        border-radius: 15px;
                        margin-top: 1rem;
                    }
                    .species-fact {
                        margin: 0.5rem 0;
                        padding-left: 1.5rem;
                        position: relative;
                    }
                    .species-fact::before {
                        content: '🌿';
                        position: absolute;
                        left: 0;
                    }
                    .permission-request {
                        position: absolute;
                        top: 50%;
                        left: 50%;
                        transform: translate(-50%, -50%);
                        text-align: center;
                        background: rgba(0,0,0,0.9);
                        padding: 2rem;
                        border-radius: 20px;
                        color: #fff;
                        z-index: 30;
                    }
                    .permission-btn {
                        background: linear-gradient(135deg, #8bc34a 0%, #689f38 100%);
                        color: #fff;
                        border: none;
                        padding: 1rem 2rem;
                        border-radius: 25px;
                        font-family: 'Baloo 2', cursive;
                        font-size: 1.1rem;
                        font-weight: 600;
                        cursor: pointer;
                        margin-top: 1rem;
                    }
                </style>
                <div id="scanContent">
                    <video id="scanVideo" autoplay playsinline></video>
                    <div class="scan-flash" id="scanFlash"></div>
                    <div class="scan-overlay">
                        <div class="scan-line"></div>
                        <div class="scan-corner tl"></div>
                        <div class="scan-corner tr"></div>
                        <div class="scan-corner bl"></div>
                        <div class="scan-corner br"></div>
                    </div>
                    <div class="scan-top-bar">
                        <div class="scan-stats">
                            <div class="scan-stat">📷 <span id="scanCount">0</span> Scanned</div>
                            <div class="scan-stat">🏆 <span id="newCount">0</span> New</div>
                        </div>
                    </div>
                    <button class="capture-btn" onclick="scanCapture()">📷</button>
                    <div class="species-popup" id="speciesPopup">
                        <button class="popup-close" onclick="scanClosePopup()">×</button>
                        <div class="species-emoji" id="speciesEmoji">🦊</div>
                        <div class="species-name" id="speciesName">Red Fox</div>
                        <div class="species-scientific" id="speciesScientific">Vulpes vulpes</div>
                        <div id="speciesDescription" style="text-align: center; margin-bottom: 1rem;">A highly adaptable omnivore.</div>
                        <div class="species-facts" id="speciesFacts"></div>
                    </div>
                    <div class="permission-request" id="permissionRequest" style="display: none;">
                        <h2 style="color: #8bc34a; margin-bottom: 1rem;">📷 Camera Access Required</h2>
                        <p>NatureScope needs camera access to identify species.</p>
                        <button class="permission-btn" onclick="scanRequestCamera()">Enable Camera</button>
                    </div>
                </div>
            `;
            
            scanInit();
        }

const scanSpeciesDatabase = [
  // 1–10: Wild Animals
  {name:'Red Fox',scientific:'Vulpes vulpes',emoji:'🦊',description:'Highly adaptable omnivore found throughout the Northern Hemisphere.',facts:['Can run up to 45 km/h','Excellent hearing and smell','Active during dawn and dusk']},
  {name:'White-tailed Deer',scientific:'Odocoileus virginianus',emoji:'🦌',description:'Graceful herbivore common in North American forests.',facts:['Can jump 3 meters high','Excellent swimmers','Males shed antlers annually']},
  {name:'Bald Eagle',scientific:'Haliaeetus leucocephalus',emoji:'🦅',description:'Powerful raptor and national bird of the United States.',facts:['Can see fish from 300 meters high','Mates for life','Massive nests']},
  {name:'Tiger',scientific:'Panthera tigris',emoji:'🐅',description:'Largest wild cat species known for its strength and stripes.',facts:['Can leap over 10 meters','No two tigers have the same stripes','Strong swimmers']},
  {name:'Wolf',scientific:'Canis lupus',emoji:'🐺',description:'Highly social predator with complex pack dynamics.',facts:['Communicates with howls','Can run up to 60 km/h','Crucial for ecosystem balance']},
  {name:'Grizzly Bear',scientific:'Ursus arctos horribilis',emoji:'🐻',description:'Massive North American bear known for strength and hibernation.',facts:['Can weigh over 600 kg','Can run 50 km/h','Eats berries, fish, and meat']},
  {name:'Lion',scientific:'Panthera leo',emoji:'🦁',description:'Social big cat often called the king of the jungle.',facts:['Lives in prides','Roars can be heard 8 km away','Mostly active at night']},
  {name:'Elephant',scientific:'Loxodonta africana',emoji:'🐘',description:'Largest land animal with strong memory and intelligence.',facts:['Lives up to 70 years','Uses trunk for drinking and grabbing','Mourns its dead']},
  {name:'Giraffe',scientific:'Giraffa camelopardalis',emoji:'🦒',description:'Tallest animal on Earth with a long neck and unique spots.',facts:['Necks can be 2m long','Only needs 5–30 mins of sleep','Can run up to 60 km/h']},
  {name:'Cheetah',scientific:'Acinonyx jubatus',emoji:'🐆',description:'Fastest land animal, built for speed over short distances.',facts:['Reaches 100 km/h in 3 seconds','Can’t roar','Has black “tear marks” under eyes']},

  // 11–20: Domestic Animals
  {name:'Dog',scientific:'Canis lupus familiaris',emoji:'🐶',description:'Loyal and intelligent companion animal with many breeds.',facts:['Can understand over 100 words','First domesticated animal','Excellent sense of smell']},
  {name:'Cat',scientific:'Felis catus',emoji:'🐱',description:'Independent and curious companion animal known for agility.',facts:['Can jump 6 times its height','Communicates with tail','Purrs for comfort']},
  {name:'Cow',scientific:'Bos taurus',emoji:'🐄',description:'Domesticated herbivore raised for milk and meat.',facts:['Has four stomach compartments','Forms strong social bonds','Can recognize human faces']},
  {name:'Chicken',scientific:'Gallus gallus domesticus',emoji:'🐔',description:'Common farm bird raised for eggs and meat.',facts:['Sees in color','Has over 30 vocalizations','Can remember 100+ faces']},
  {name:'Horse',scientific:'Equus ferus caballus',emoji:'🐴',description:'Strong, fast animal domesticated for transport and work.',facts:['Can sleep standing up','Communicates with ears and tail','Recognizes human emotions']},
  {name:'Goat',scientific:'Capra aegagrus hircus',emoji:'🐐',description:'Agile farm animal known for climbing and curiosity.',facts:['Can climb trees and cliffs','Social and intelligent','Used for milk, meat, and fiber']},
  {name:'Pig',scientific:'Sus scrofa domesticus',emoji:'🐖',description:'Highly intelligent and social farm animal.',facts:['Smarter than dogs','Great memory','Roll in mud to cool down']},
  {name:'Rabbit',scientific:'Oryctolagus cuniculus',emoji:'🐇',description:'Small herbivore known for its long ears and fast hopping.',facts:['Can see behind without turning head','Digest food twice','Great jumpers']},
  {name:'Duck',scientific:'Anas platyrhynchos',emoji:'🦆',description:'Aquatic bird with waterproof feathers and a broad bill.',facts:['Can sleep with one eye open','Quack doesn’t echo','Excellent navigators']},
  {name:'Sheep',scientific:'Ovis aries',emoji:'🐑',description:'Domesticated for wool and meat, known for flock behavior.',facts:['Recognize 50+ faces','Have nearly 300° vision','Strong memory for grazing paths']},

  // 21–30: Insects and Fish
  {name:'Monarch Butterfly',scientific:'Danaus plexippus',emoji:'🦋',description:'Famous for incredible migration up to 4,800 km.',facts:['Migrates across North America','Lays eggs only on milkweed','Bright colors warn predators']},
  {name:'Honeybee',scientific:'Apis mellifera',emoji:'🐝',description:'Vital pollinator known for making honey and communicating by dancing.',facts:['One bee visits 5,000 flowers a day','Dies after stinging','Has five eyes']},
  {name:'Ladybug',scientific:'Coccinellidae',emoji:'🐞',description:'Small beetle known for its red shell with black spots.',facts:['Eats up to 5,000 aphids','Bright color warns predators','Can play dead']},
  {name:'Dragonfly',scientific:'Anisoptera',emoji:'🪰',description:'Strong flier and predator of mosquitoes and flies.',facts:['Can hover like a helicopter','Eyes cover nearly entire head','Exists since before dinosaurs']},
  {name:'Clownfish',scientific:'Amphiprioninae',emoji:'🐠',description:'Colorful reef fish living in symbiosis with sea anemones.',facts:['Changes sex','Protected by mucus layer','Popularized by “Finding Nemo”']},
  {name:'Seahorse',scientific:'Hippocampus',emoji:'🦐',description:'Fish that swims upright and uses its tail to hold onto sea grass.',facts:['Males give birth','Poor swimmers','Eyes move independently']},
  {name:'Octopus',scientific:'Octopoda',emoji:'🐙',description:'Incredibly intelligent marine animal with eight arms.',facts:['Three hearts','Can regenerate arms','Uses tools']},
  {name:'Anglerfish',scientific:'Lasiognathus',emoji:'🐟',description:'Deep-sea fish with bioluminescent lure to attract prey.',facts:['Females much larger','Lives in total darkness','Glows to hunt']}
];

// State variables
let scanStream = null;
let model = null;
let scanCount = 0;
let scanNewCount = 0;
let realTimeInterval = null;

// Load the model (assuming cocoSsd library loaded)
async function loadModel() {
  model = await cocoSsd.load();
  console.log('Model loaded');
}

// Initialize scanning and camera
async function scanInit() {
  try {
    scanStream = await navigator.mediaDevices.getUserMedia({
      video: { facingMode: 'environment' },
      audio: false
    });
    const video = document.getElementById('scanVideo');
    if (video) {
      video.srcObject = scanStream;
    }
    startRealTimeRecognition();
  } catch (error) {
    console.log('Camera permission needed');
    const permRequest = document.getElementById('permissionRequest');
    if (permRequest) permRequest.style.display = 'block';
  }

  // Cleanup handler
  pageData.scan.cleanup = () => {
    if (scanStream) {
      scanStream.getTracks().forEach(track => track.stop());
      scanStream = null;
    }
    stopRealTimeRecognition();
  };
}

// Request camera permissions on demand
async function scanRequestCamera() {
  try {
    scanStream = await navigator.mediaDevices.getUserMedia({
      video: { facingMode: 'environment' },
      audio: false
    });
    const video = document.getElementById('scanVideo');
    if (video) video.srcObject = scanStream;
    const permRequest = document.getElementById('permissionRequest');
    if (permRequest) permRequest.style.display = 'none';

    startRealTimeRecognition();
  } catch (error) {
    alert('Camera access denied. Please enable camera permissions.');
  }
}

// Capture scan snapshot & display a species
// ---------- CAPTURE & DISPLAY DETECTION ----------
async function scanCaptureReal() {
    const video = document.getElementById('scanVideo');
    if (!model || !video) return;

    // Flash effect
    const flash = document.getElementById('scanFlash');
    if (flash) {
        flash.classList.add('active');
        setTimeout(() => flash.classList.remove('active'), 300);
    }

    try {
        // Detect objects in current video frame
        const predictions = await model.detect(video);

        if (predictions.length === 0) return;

        // Take top prediction
        const topPrediction = predictions[0];
        const detectedClass = topPrediction.class;

        // Map detectedClass to species database
        const species = scanSpeciesDatabase.find(s =>
            s.name.toLowerCase().includes(detectedClass.toLowerCase())
        ) || scanSpeciesDatabase[Math.floor(Math.random() * scanSpeciesDatabase.length)]; // fallback

        // Show popup
        scanDisplaySpecies(species);

        // Update counters
        scanCount++;
        scanNewCount++;
        document.getElementById('scanCount').textContent = scanCount;
        document.getElementById('newCount').textContent = scanNewCount;

    } catch (err) {
        console.error('Error scanning frame:', err);
    }
}

// Display species info popup
function scanDisplaySpecies(species) {
  document.getElementById('speciesEmoji').textContent = species.emoji;
  document.getElementById('speciesName').textContent = species.name;
  document.getElementById('speciesScientific').textContent = species.scientific;
  document.getElementById('speciesDescription').textContent = species.description;

  const factsContainer = document.getElementById('speciesFacts');
  if (factsContainer) {
    factsContainer.innerHTML = species.facts.map(fact =>
      `<div class="species-fact">${fact}</div>`
    ).join('');
  }

  document.getElementById('speciesPopup').classList.add('visible');
}

// Close species popup
function scanClosePopup() {
  document.getElementById('speciesPopup').classList.remove('visible');
}

// Start continuous real-time recognition simulation
function startRealTimeRecognition() {
  if (realTimeInterval) return; // already running
  realTimeInterval = setInterval(() => {
    scanCapture();
  }, 2000); // scan every 2 seconds
}

// Stop real-time recognition
function stopRealTimeRecognition() {
  if (realTimeInterval) {
    clearInterval(realTimeInterval);
    realTimeInterval = null;
  }
}


        // ACT PAGE - Full Implementation
        function loadActPage(container) {
            container.innerHTML = `
                <style>
                    #actContent {
                        background: linear-gradient(135deg, #1a472a 0%, #2d5a3d 50%, #4a7c59 100%);
                        min-height: 100vh;
                        padding: 100px 20px 20px;
                    }
                    .act-container {
                        max-width: 1200px;
                        margin: 0 auto;
                    }
                    .act-header {
                        text-align: center;
                        margin-bottom: 2rem;
                    }
                    .act-header h1 {
                        font-size: 3rem;
                        color: #fff;
                        margin-bottom: 0.5rem;
                    }
                    .stats-dashboard {
                        display: grid;
                        grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
                        gap: 1.5rem;
                        margin: 2rem 0;
                    }
                    .stat-card {
                        background: rgba(255,255,255,0.15);
                        backdrop-filter: blur(10px);
                        border: 2px solid rgba(255,255,255,0.2);
                        border-radius: 20px;
                        padding: 1.5rem;
                        text-align: center;
                        transition: all 0.3s ease;
                    }
                    .stat-card:hover {
                        transform: translateY(-5px);
                    }
                    .stat-icon {
                        font-size: 2.5rem;
                        margin-bottom: 0.5rem;
                    }
                    .stat-value {
                        font-size: 2.5rem;
                        font-weight: 800;
                        color: #ffd54f;
                        margin-bottom: 0.3rem;
                    }
                    .stat-label {
                        color: #c8e6c9;
                        font-size: 0.95rem;
                    }
                    .actions-section {
                        background: rgba(255,255,255,0.15);
                        backdrop-filter: blur(10px);
                        border: 2px solid rgba(255,255,255,0.2);
                        border-radius: 25px;
                        padding: 2rem;
                        margin: 2rem 0;
                    }
                    .actions-section h2 {
                        font-size: 1.8rem;
                        color: #fff;
                        margin-bottom: 1.5rem;
                    }
                    .actions-grid {
                        display: grid;
                        grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
                        gap: 1.5rem;
                    }
                    .action-card {
                        background: rgba(255,255,255,0.1);
                        border: 2px solid rgba(255,255,255,0.2);
                        border-radius: 20px;
                        padding: 1.5rem;
                        transition: all 0.3s ease;
                    }
                    .action-card:hover {
                        transform: translateY(-5px);
                        border-color: rgba(139, 195, 74, 0.5);
                    }
                    .action-header {
                        display: flex;
                        justify-content: space-between;
                        align-items: center;
                        margin-bottom: 1rem;
                    }
                    .action-icon {
                        font-size: 2.5rem;
                    }
                    .action-points {
                        background: rgba(255, 213, 79, 0.3);
                        color: #ffd54f;
                        padding: 0.3rem 0.8rem;
                        border-radius: 15px;
                        font-weight: 600;
                        font-size: 0.9rem;
                    }
                    .action-title {
                        font-size: 1.3rem;
                        color: #fff;
                        font-weight: 600;
                        margin-bottom: 0.5rem;
                    }
                    .action-description {
                        color: #c8e6c9;
                        font-size: 0.9rem;
                        line-height: 1.5;
                        margin-bottom: 1rem;
                    }
                    .action-btn {
                        width: 100%;
                        padding: 0.8rem;
                        border: none;
                        border-radius: 15px;
                        background: linear-gradient(135deg, #8bc34a 0%, #689f38 100%);
                        color: #fff;
                        font-family: 'Baloo 2', cursive;
                        font-size: 1rem;
                        font-weight: 600;
                        cursor: pointer;
                        transition: all 0.3s ease;
                    }
                    .action-btn:hover {
                        transform: translateY(-2px);
                        box-shadow: 0 5px 15px rgba(139, 195, 74, 0.4);
                    }
                    .action-btn.completed {
                        background: rgba(76, 175, 80, 0.6);
                    }
                </style>
                <div id="actContent">
                    <div class="act-container">
                        <div class="act-header">
                            <h1>🌱 Take Action</h1>
                            <p style="color: #c8e6c9; font-size: 1.2rem;">Make a difference and earn rewards!</p>
                        </div>
                        <div class="stats-dashboard">
                            <div class="stat-card">
                                <div class="stat-icon">🌍</div>
                                <div class="stat-value" id="actActionsCompleted">0</div>
                                <div class="stat-label">Actions Completed</div>
                            </div>
                            <div class="stat-card">
                                <div class="stat-icon">⭐</div>
                                <div class="stat-value" id="actEcoPoints">0</div>
                                <div class="stat-label">Eco Points</div>
                            </div>
                            <div class="stat-card">
                                <div class="stat-icon">🏆</div>
                                <div class="stat-value" id="actBadgesEarned">0</div>
                                <div class="stat-label">Badges Earned</div>
                            </div>
                            <div class="stat-card">
                                <div class="stat-icon">🌲</div>
                                <div class="stat-value" id="actTreesPlanted">0</div>
                                <div class="stat-label">Trees Planted</div>
                            </div>
                        </div>
                        <div class="actions-section">
                            <h2>🎯 Daily Eco-Actions</h2>
                            <div class="actions-grid" id="actActionsGrid"></div>
                        </div>
                    </div>
                </div>
            `;
            
            actInit();
        }

        const actActions = [
            {
                id: 1,
                icon: '🌱',
                title: 'Plant a Seed',
                description: 'Plant seeds or seedlings in your garden or community',
                points: 50,
                completed: false
            },
            {
                id: 2,
                icon: '💡',
                title: 'Turn Off Lights',
                description: 'Switch off lights when leaving rooms for one day',
                points: 30,
                completed: false
            },
            {
                id: 3,
                icon: '♻️',
                title: 'Recycle Plastic',
                description: 'Properly recycle plastic bottles and containers',
                points: 40,
                completed: false
            },
            {
                id: 4,
                icon: '🚰',
                title: 'Save Water',
                description: 'Take shorter showers and fix leaky faucets',
                points: 35,
                completed: false
            },
            {
                id: 5,
                icon: '🌳',
                title: 'Use Reusable Bags',
                description: 'Bring your own bags when shopping',
                points: 25,
                completed: false
            },
            {
                id: 6,
                icon: '🍃',
                title: 'Compost Waste',
                description: 'Start composting food scraps and yard waste',
                points: 45,
                completed: false
            }
        ];

        let actUserData = {
            actionsCompleted: 0,
            ecoPoints: 0,
            badgesEarned: 0,
            treesPlanted: 0
        };

        function actInit() {
            actLoadStats();
            actRenderActions();
        }

        function actLoadStats() {
            document.getElementById('actActionsCompleted').textContent = actUserData.actionsCompleted;
            document.getElementById('actEcoPoints').textContent = actUserData.ecoPoints;
            document.getElementById('actBadgesEarned').textContent = actUserData.badgesEarned;
            document.getElementById('actTreesPlanted').textContent = actUserData.treesPlanted;
        }

        function actRenderActions() {
            const grid = document.getElementById('actActionsGrid');
            if (!grid) return;
            grid.innerHTML = '';

            actActions.forEach(action => {
                const card = document.createElement('div');
                card.className = 'action-card';
                card.innerHTML = `
                    <div class="action-header">
                        <div class="action-icon">${action.icon}</div>
                        <div class="action-points">+${action.points} pts</div>
                    </div>
                    <div class="action-title">${action.title}</div>
                    <div class="action-description">${action.description}</div>
                    <button class="action-btn ${action.completed ? 'completed' : ''}" 
                            onclick="actCompleteAction(${action.id})">
                        ${action.completed ? '✓ Completed' : 'Complete Action'}
                    </button>
                `;
                grid.appendChild(card);
            });
        }

        function actCompleteAction(id) {
            const action = actActions.find(a => a.id === id);
            if (!action || action.completed) return;

            action.completed = true;
            actUserData.actionsCompleted++;
            actUserData.ecoPoints += action.points;
            
            if (action.id === 1 || action.id === 6) {
                actUserData.treesPlanted++;
            }
            if (action.id === 2 || action.id === 4) {
                actUserData.badgesEarned++;
            }

            actLoadStats();
            actRenderActions();
            
            alert(`🎉 Action Complete!\n\nYou earned ${action.points} Eco Points!`);
        }

        // Initialize on load
        window.addEventListener('load', () => {
            initHomeParticles();
            updateActiveNav('home');
        });

        // Handle browser back button
        window.addEventListener('popstate', (event) => {
            if (event.state && event.state.page) {
                showPage(event.state.page);
            }
        });

        // Push initial state
        history.replaceState({ page: 'home' }, '', '#home');

        // Wrap showPage to update history
        const originalShowPage = showPage;
        showPage = function(pageName) {
            originalShowPage(pageName);
            history.pushState({ page: pageName }, '', '#' + pageName);
        };