import * as THREE from 'three';
import RAPIER from '@dimforge/rapier3d-compat';
import { world as physicsWorld } from './physics.js';

export function createWorld(scene) {
    // Fog
    scene.fog = new THREE.FogExp2(0x020008, 0.035);

    // Ground
    const groundGeo = new THREE.PlaneGeometry(200, 200);
    const groundMat = new THREE.MeshStandardMaterial({
        color: 0x111118,
        roughness: 0.05,
        metalness: 0.6
    });
    const ground = new THREE.Mesh(groundGeo, groundMat);
    ground.rotation.x = -Math.PI / 2;
    scene.add(ground);

    // Physics Ground
    const groundBodyDesc = RAPIER.RigidBodyDesc.fixed();
    const groundBody = physicsWorld.createRigidBody(groundBodyDesc);
    const groundColliderDesc = RAPIER.ColliderDesc.cuboid(100, 0.1, 100);
    physicsWorld.createCollider(groundColliderDesc, groundBody);

    // Lights
    const ambientLight = new THREE.AmbientLight(0x0a000f, 0.5);
    scene.add(ambientLight);

    const colors = [0x00f5ff, 0xff00c8, 0x9d00ff, 0xffaa00];
    for (let i = 0; i < 8; i++) {
        const light = new THREE.PointLight(colors[i % colors.length], 2, 15);
        light.position.set(
            (Math.random() - 0.5) * 40,
            2,
            (Math.random() - 0.5) * 40
        );
        scene.add(light);
    }

    // Buildings
    createBuildings(scene);

    // Streets and props
    createStreets(scene);
    createProps(scene);
}

function createBuildings(scene) {
    const buildMat = new THREE.MeshStandardMaterial({
        color: 0x0d0d14,
        emissive: 0x0a0015
    });

    const winColors = [0x00f5ff, 0xffaa00];

    const createRow = (zPos) => {
        for (let i = 0; i < 10; i++) {
            const w = 3 + Math.random() * 5;
            const h = 8 + Math.random() * 32;
            const d = 3 + Math.random() * 5;
            const x = -80 + i * 16 + (Math.random() - 0.5) * 5;

            const geo = new THREE.BoxGeometry(w, h, d);
            const mesh = new THREE.Mesh(geo, buildMat);
            mesh.position.set(x, h / 2, zPos);
            scene.add(mesh);

            // Physics
            const bodyDesc = RAPIER.RigidBodyDesc.fixed().setTranslation(x, h / 2, zPos);
            const body = physicsWorld.createRigidBody(bodyDesc);
            const colliderDesc = RAPIER.ColliderDesc.cuboid(w / 2, h / 2, d / 2);
            physicsWorld.createCollider(colliderDesc, body);

            // Windows
            for (let j = 0; j < 20; j++) {
                const winW = 0.2;
                const winH = 0.2;
                const winGeo = new THREE.BoxGeometry(winW, winH, 0.1);
                const winMat = new THREE.MeshStandardMaterial({
                    emissive: winColors[Math.floor(Math.random() * winColors.length)],
                    emissiveIntensity: 2
                });
                const win = new THREE.Mesh(winGeo, winMat);

                // Random side
                const side = Math.floor(Math.random() * 4);
                if (side === 0) win.position.set((Math.random() - 0.5) * w, (Math.random() - 0.5) * h, d / 2 + 0.05);
                else if (side === 1) win.position.set((Math.random() - 0.5) * w, (Math.random() - 0.5) * h, -d / 2 - 0.05);
                else if (side === 2) win.position.set(w / 2 + 0.05, (Math.random() - 0.5) * h, (Math.random() - 0.5) * d);
                else win.position.set(-w / 2 - 0.05, (Math.random() - 0.5) * h, (Math.random() - 0.5) * d);

                mesh.add(win);
            }
        }
    };

    createRow(-40);
    createRow(-60);
}

function createStreets(scene) {
    // Main street is actually part of the ground, but let's add visual markers or just use the planes for rooftop
    // Rooftop access
    for (let i = 0; i < 10; i++) {
        const stepW = 2;
        const stepH = 0.5;
        const stepD = 1;
        const x = 12;
        const y = i * 0.5 + 0.25;
        const z = -10 - i * 0.8;

        const geo = new THREE.BoxGeometry(stepW, stepH, stepD);
        const mesh = new THREE.Mesh(geo, new THREE.MeshStandardMaterial({ color: 0x222222 }));
        mesh.position.set(x, y, z);
        scene.add(mesh);

        const bodyDesc = RAPIER.RigidBodyDesc.fixed().setTranslation(x, y, z);
        const body = physicsWorld.createRigidBody(bodyDesc);
        const colliderDesc = RAPIER.ColliderDesc.cuboid(stepW / 2, stepH / 2, stepD / 2);
        physicsWorld.createCollider(colliderDesc, body);
    }

    // Elevated platform
    const platW = 10;
    const platH = 0.5;
    const platD = 10;
    const platX = 12;
    const platY = 5;
    const platZ = -20;
    const platGeo = new THREE.BoxGeometry(platW, platH, platD);
    const platMesh = new THREE.Mesh(platGeo, new THREE.MeshStandardMaterial({ color: 0x151515 }));
    platMesh.position.set(platX, platY, platZ);
    scene.add(platMesh);

    const platBodyDesc = RAPIER.RigidBodyDesc.fixed().setTranslation(platX, platY, platZ);
    const platBody = physicsWorld.createRigidBody(platBodyDesc);
    const platColliderDesc = RAPIER.ColliderDesc.cuboid(platW / 2, platH / 2, platD / 2);
    physicsWorld.createCollider(platColliderDesc, platBody);
}

function createProps(scene) {
    // Streetlamps
    const lampColors = [0x00f5ff, 0xff00c8];
    const lampPositions = [
        [6, 0, -5], [-6, 0, -15], [6, 0, -25], [-6, 0, -35], [6, 0, -45], [-6, 0, -55]
    ];

    lampPositions.forEach((pos, i) => {
        const group = new THREE.Group();
        group.position.set(...pos);

        const poleGeo = new THREE.CylinderGeometry(0.1, 0.1, 5);
        const pole = new THREE.Mesh(poleGeo, new THREE.MeshStandardMaterial({ color: 0x111111 }));
        pole.position.y = 2.5;
        group.add(pole);

        const topGeo = new THREE.BoxGeometry(0.5, 0.2, 0.5);
        const top = new THREE.Mesh(topGeo, new THREE.MeshStandardMaterial({ color: 0x333333 }));
        top.position.y = 5;
        group.add(top);

        const light = new THREE.PointLight(lampColors[i % 2], 2, 15);
        light.position.y = 4.8;
        group.add(light);

        scene.add(group);

        // Physics for pole
        const bodyDesc = RAPIER.RigidBodyDesc.fixed().setTranslation(pos[0], 2.5, pos[2]);
        const body = physicsWorld.createRigidBody(bodyDesc);
        const colliderDesc = RAPIER.ColliderDesc.cylinder(2.5, 0.1);
        physicsWorld.createCollider(colliderDesc, body);
    });

    // Dumpsters
    const dumpPositions = [[-4, 0, -8], [4, 0, -18], [-3, 0, -28], [7, 0, -38]];
    dumpPositions.forEach(pos => {
        const geo = new THREE.BoxGeometry(1.5, 1.2, 1);
        const mat = new THREE.MeshStandardMaterial({ color: 0x1a2e1a });
        const mesh = new THREE.Mesh(geo, mat);
        mesh.position.set(pos[0], 0.6, pos[2]);
        scene.add(mesh);

        const bodyDesc = RAPIER.RigidBodyDesc.fixed().setTranslation(pos[0], 0.6, pos[2]);
        const body = physicsWorld.createRigidBody(bodyDesc);
        const colliderDesc = RAPIER.ColliderDesc.cuboid(0.75, 0.6, 0.5);
        physicsWorld.createCollider(colliderDesc, body);
    });

    // Neon Signs
    const createSign = (text, pos, color) => {
        const canvas = document.createElement('canvas');
        canvas.width = 256;
        canvas.height = 128;
        const ctx = canvas.getContext('2d');
        ctx.fillStyle = '#000';
        ctx.fillRect(0, 0, 256, 128);
        ctx.fillStyle = `#${color.toString(16).padStart(6, '0')}`;
        ctx.font = 'Bold 80px Arial';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(text, 128, 64);

        const tex = new THREE.CanvasTexture(canvas);
        const geo = new THREE.BoxGeometry(2, 1, 0.1);
        const mat = new THREE.MeshStandardMaterial({
            map: tex,
            emissive: color,
            emissiveIntensity: 5,
            emissiveMap: tex
        });
        const mesh = new THREE.Mesh(geo, mat);
        mesh.position.set(...pos);
        scene.add(mesh);
    };

    createSign("HACK", [-5, 4, -12], 0x00f5ff);
    createSign("SYS", [5, 5, -22], 0xff00c8);
    createSign("42", [0, 6, -32], 0xffaa00);

    // Parked Cars
    const createCar = (pos, color) => {
        const group = new THREE.Group();
        group.position.set(...pos);

        const bodyGeo = new THREE.BoxGeometry(1.8, 0.6, 4);
        const body = new THREE.Mesh(bodyGeo, new THREE.MeshStandardMaterial({ color: 0x111111 }));
        body.position.y = 0.5;
        group.add(body);

        const roofGeo = new THREE.BoxGeometry(1.6, 0.5, 2);
        const roof = new THREE.Mesh(roofGeo, new THREE.MeshStandardMaterial({ color: color }));
        roof.position.y = 1.05;
        roof.position.z = -0.2;
        group.add(roof);

        for (let i = 0; i < 4; i++) {
            const wheelGeo = new THREE.CylinderGeometry(0.3, 0.3, 0.2);
            const wheel = new THREE.Mesh(wheelGeo, new THREE.MeshStandardMaterial({ color: 0x050505 }));
            wheel.rotation.z = Math.PI / 2;
            wheel.position.set(i < 2 ? 0.9 : -0.9, 0.3, i % 2 === 0 ? 1.2 : -1.2);
            group.add(wheel);
        }

        scene.add(group);

        const rBodyDesc = RAPIER.RigidBodyDesc.fixed().setTranslation(pos[0], 0.6, pos[2]);
        const rBody = physicsWorld.createRigidBody(rBodyDesc);
        const rColliderDesc = RAPIER.ColliderDesc.cuboid(0.9, 0.6, 2);
        physicsWorld.createCollider(rColliderDesc, rBody);
    };

    createCar([-7, 0, -10], 0x330033);
    createCar([7, 0, -25], 0x003333);

    // Puddles
    for (let i = 0; i < 10; i++) {
        const geo = new THREE.CircleGeometry(1 + Math.random(), 32);
        const mat = new THREE.MeshStandardMaterial({
            color: 0x111111,
            roughness: 0,
            metalness: 1,
            transparent: true,
            opacity: 0.5
        });
        const mesh = new THREE.Mesh(geo, mat);
        mesh.rotation.x = -Math.PI / 2;
        mesh.position.set((Math.random() - 0.5) * 20, 0.01, (Math.random() - 0.5) * 60 - 20);
        scene.add(mesh);
    }
}
