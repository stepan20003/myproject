import * as THREE from 'three';
import RAPIER from '@dimforge/rapier3d-compat';
import { world as physicsWorld } from './physics.js';

export class CharacterController {
    constructor(scene, camera) {
        this.scene = scene;
        this.camera = camera;

        // Humanoid Mesh
        this.mesh = new THREE.Group();
        const mat = new THREE.MeshStandardMaterial({
            color: 0x1a1a2e,
            emissive: 0x00f5ff,
            emissiveIntensity: 0.2
        });

        // Torso
        this.torso = new THREE.Mesh(new THREE.BoxGeometry(0.5, 0.7, 0.3), mat);
        this.torso.position.y = 0.65; // Raised to align with collider
        this.mesh.add(this.torso);

        // Head
        this.head = new THREE.Mesh(new THREE.BoxGeometry(0.25, 0.25, 0.25), mat);
        this.head.position.y = 0.5;
        this.torso.add(this.head);

        // Arms
        this.armL = new THREE.Mesh(new THREE.BoxGeometry(0.15, 0.6, 0.15), mat);
        this.armL.position.set(-0.35, 0, 0);
        this.torso.add(this.armL);
        this.armR = new THREE.Mesh(new THREE.BoxGeometry(0.15, 0.6, 0.15), mat);
        this.armR.position.set(0.35, 0, 0);
        this.torso.add(this.armR);

        // Legs
        this.legL = new THREE.Mesh(new THREE.BoxGeometry(0.2, 0.7, 0.2), mat);
        this.legL.position.set(-0.15, 0.35, 0);
        this.mesh.add(this.legL);
        this.legR = new THREE.Mesh(new THREE.BoxGeometry(0.2, 0.7, 0.2), mat);
        this.legR.position.set(0.15, 0.35, 0);
        this.mesh.add(this.legR);
        this.scene.add(this.mesh);

        // Physics
        const bodyDesc = RAPIER.RigidBodyDesc.dynamic()
            .setTranslation(0, 5, 0)
            .lockRotations()
            .setCanSleep(false);
        this.rigidBody = physicsWorld.createRigidBody(bodyDesc);

        // Capsule height 1.0 (0.6 * 2 + 0.4*2 ?) No, halfHeight=0.5, radius=0.4
        const colliderDesc = RAPIER.ColliderDesc.capsule(0.5, 0.4);
        physicsWorld.createCollider(colliderDesc, this.rigidBody);

        // Controls
        this.keys = {};
        window.addEventListener('keydown', (e) => this.keys[e.code] = true);
        window.addEventListener('keyup', (e) => this.keys[e.code] = false);

        this.speed = 0.15; // Adjusted from 0.08 units per frame to something more standard for rapier steps
        this.rotationSpeed = 0.1;
    }

    update(time) {
        if (this.isSitting) {
            this.updateSitting(time);
            return;
        }

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

            // Simple walk animation
            this.legL.rotation.x = Math.sin(time * 10) * 0.5;
            this.legR.rotation.x = Math.sin(time * 10 + Math.PI) * 0.5;
            this.armL.rotation.x = Math.sin(time * 10 + Math.PI) * 0.5;
            this.armR.rotation.x = Math.sin(time * 10) * 0.5;
        } else {
            const vel = this.rigidBody.linvel();
            this.rigidBody.setLinvel({ x: 0, y: vel.y, z: 0 }, true);
            this.legL.rotation.x = 0;
            this.legR.rotation.x = 0;
            this.armL.rotation.x = 0;
            this.armR.rotation.x = 0;
        }

        // Sync mesh with physics
        const t = this.rigidBody.translation();
        this.mesh.position.set(t.x, t.y, t.z);

        // Camera follow
        const camTarget = new THREE.Vector3(t.x, t.y + 3, t.z + 5);
        this.camera.position.lerp(camTarget, 0.1);
        this.camera.lookAt(t.x, t.y + 1, t.z);
    }

    sit(pos, rotation) {
        this.isSitting = true;
        this.rigidBody.setTranslation(pos, true);
        this.rigidBody.setLinvel({ x: 0, y: 0, z: 0 }, true);
        this.mesh.quaternion.setFromAxisAngle(new THREE.Vector3(0, 1, 0), rotation);

        // Seated pose
        this.torso.position.y = 0.2;
        this.legL.position.set(-0.15, 0, 0.2);
        this.legL.rotation.x = -Math.PI / 2;
        this.legR.position.set(0.15, 0, 0.2);
        this.legR.rotation.x = -Math.PI / 2;
        this.armL.rotation.x = -0.5;
        this.armR.rotation.x = -0.5;
    }

    stand() {
        this.isSitting = false;
        this.torso.position.y = 0.65;
        this.legL.position.set(-0.15, 0.35, 0);
        this.legL.rotation.x = 0;
        this.legR.position.set(0.15, 0.35, 0);
        this.legR.rotation.x = 0;
        this.armL.rotation.x = 0;
        this.armR.rotation.x = 0;
    }

    updateSitting(time) {
        const t = this.rigidBody.translation();
        this.mesh.position.set(t.x, t.y, t.z);

        // Camera focus on TV
        const camTarget = new THREE.Vector3(t.x, t.y + 2, t.z - 4);
        this.camera.position.lerp(camTarget, 0.05);
        this.camera.lookAt(t.x, t.y + 1, t.z - 10);
    }
}
