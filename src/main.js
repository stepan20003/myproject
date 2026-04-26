import * as THREE from 'three';
import { initPhysics, world as physicsWorld } from './physics.js';
import { createWorld } from './world.js';
import { CharacterController } from './character.js';
import { Rain } from './rain.js';
import { createPostProcessing } from './postprocessing.js';
import { Zones } from './zones.js';
import { initUI } from './ui.js';

let scene, camera, renderer, composer, clock;
let character, rain, zones;
let isStarted = false;

async function init() {
    // Basic Three.js setup
    scene = new THREE.Scene();
    scene.background = new THREE.Color(0x020008);

    camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.set(0, 5, 10);

    renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(window.devicePixelRatio);
    document.getElementById('app').appendChild(renderer.domElement);

    clock = new THREE.Clock();

    // Init Physics
    await initPhysics();

    // Create World
    createWorld(scene);

    // Character
    character = new CharacterController(scene, camera);

    // Rain
    rain = new Rain(scene);

    // Zones
    zones = new Zones(scene);
    initUI();

    // Post Processing
    composer = createPostProcessing(scene, camera, renderer);

    // Events
    window.addEventListener('resize', onWindowResize);

    // Typewriter
    runTypewriter();
}

function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
    composer.setSize(window.innerWidth, window.innerHeight);
}

function runTypewriter() {
    const text = "STEPAN STEPANYAN\n> LOADING CITY...\n> SYSTEMS ONLINE";
    const el = document.getElementById('typewriter');
    let i = 0;
    const interval = setInterval(() => {
        el.textContent += text[i];
        i++;
        if (i >= text.length) {
            clearInterval(interval);
            document.getElementById('press-key').style.display = 'block';
            window.addEventListener('keydown', startExperience, { once: true });
            window.addEventListener('touchstart', startExperience, { once: true });
            window.addEventListener('mousedown', startExperience, { once: true });
        }
    }, 20);
}

function startExperience() {
    isStarted = true;
    document.getElementById('intro-overlay').style.opacity = '0';
    setTimeout(() => {
        document.getElementById('intro-overlay').style.display = 'none';
    }, 1000);
}

function animate() {
    requestAnimationFrame(animate);

    const delta = clock.getDelta();
    const time = clock.getElapsedTime();

    if (isStarted) {
        physicsWorld.step();
        character.update();
        rain.update();
        zones.update(character.mesh.position, time);
    }

    composer.render();
}

init().then(() => {
    animate();
});
