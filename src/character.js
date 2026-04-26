import * as THREE from 'three';
import RAPIER from '@dimforge/rapier3d-compat';
import { world as physicsWorld } from './physics.js';

export class CharacterController {
    constructor(scene, camera) {
        this.scene = scene;
        this.camera = camera;

        // Character Mesh
        const group = new THREE.Group();
        const bodyGeo = new THREE.CylinderGeometry(0.4, 0.4, 1.2, 16);
        const bodyMat = new THREE.MeshStandardMaterial({
            color: 0x1a1a2e,
            emissive: 0x00f5ff,
            emissiveIntensity: 0.2
        });
        const body = new THREE.Mesh(bodyGeo, bodyMat);
        group.add(body);

        const capGeo = new THREE.SphereGeometry(0.4, 16, 16);
        const topCap = new THREE.Mesh(capGeo, bodyMat);
        topCap.position.y = 0.6;
        group.add(topCap);

        const botCap = new THREE.Mesh(capGeo, bodyMat);
        botCap.position.y = -0.6;
        group.add(botCap);

        this.mesh = group;
        this.scene.add(this.mesh);

        // Physics
        const bodyDesc = RAPIER.RigidBodyDesc.dynamic()
            .setTranslation(0, 5, 0)
            .lockRotations()
            .setCanSleep(false);
        this.rigidBody = physicsWorld.createRigidBody(bodyDesc);

        const colliderDesc = RAPIER.ColliderDesc.capsule(0.6, 0.4);
        physicsWorld.createCollider(colliderDesc, this.rigidBody);

        // Controls
        this.keys = {};
        window.addEventListener('keydown', (e) => this.keys[e.code] = true);
        window.addEventListener('keyup', (e) => this.keys[e.code] = false);

        this.speed = 0.15; // Adjusted from 0.08 units per frame to something more standard for rapier steps
        this.rotationSpeed = 0.1;
    }

    update() {
        const moveDir = { x: 0, z: 0 };
        if (this.keys['KeyW'] || this.keys['ArrowUp']) moveDir.z -= 1;
        if (this.keys['KeyS'] || this.keys['ArrowDown']) moveDir.z += 1;
        if (this.keys['KeyA'] || this.keys['ArrowLeft']) moveDir.x -= 1;
        if (this.keys['KeyD'] || this.keys['ArrowRight']) moveDir.x += 1;

        if (moveDir.x !== 0 || moveDir.z !== 0) {
            const length = Math.sqrt(moveDir.x * moveDir.x + moveDir.z * moveDir.z);
            moveDir.x /= length;
            moveDir.z /= length;

            const vel = this.rigidBody.linvel();
            this.rigidBody.setLinvel({
                x: moveDir.x * 5,
                y: vel.y,
                z: moveDir.z * 5
            }, true);

            // Rotation
            const targetAngle = Math.atan2(moveDir.x, moveDir.z);
            const currentRotation = this.mesh.quaternion;
            const targetRotation = new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(0, 1, 0), targetAngle);
            currentRotation.slerp(targetRotation, this.rotationSpeed);
        } else {
            const vel = this.rigidBody.linvel();
            this.rigidBody.setLinvel({ x: 0, y: vel.y, z: 0 }, true);
        }

        // Sync mesh with physics
        const t = this.rigidBody.translation();
        this.mesh.position.set(t.x, t.y, t.z);

        // Camera follow
        const camTarget = new THREE.Vector3(t.x, t.y + 3, t.z + 5);
        this.camera.position.lerp(camTarget, 0.1);
        this.camera.lookAt(t.x, t.y + 1, t.z);
    }
}
