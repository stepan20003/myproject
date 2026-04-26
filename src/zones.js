import * as THREE from 'three';
import { zonesData, showPanel } from './ui.js';

export class Zones {
    constructor(scene) {
        this.scene = scene;
        this.markers = [];
        this.floatingTags = [];
        this.activeZone = null;
        this.phoneBoothLight = null;

        this.initMarkers();
        this.initProps();
    }

    initMarkers() {
        zonesData.forEach(zone => {
            const geo = new THREE.TorusGeometry(1.5, 0.05, 16, 32);
            const mat = new THREE.MeshStandardMaterial({
                color: zone.color,
                emissive: zone.color,
                emissiveIntensity: 2
            });
            const marker = new THREE.Mesh(geo, mat);
            marker.rotation.x = Math.PI / 2;
            marker.position.set(zone.pos.x, zone.pos.y + 0.05, zone.pos.z);
            this.scene.add(marker);
            this.markers.push({ mesh: marker, id: zone.id, pos: zone.pos });
        });
    }

    initProps() {
        // Zone 1 Prop: Terminal
        const termGeo = new THREE.BoxGeometry(0.1, 2, 1);
        const termMat = new THREE.MeshStandardMaterial({ color: 0x000000, emissive: 0x00ff00, emissiveIntensity: 0.5 });
        const terminal = new THREE.Mesh(termGeo, termMat);
        terminal.position.set(0.5, 1, -5);
        this.scene.add(terminal);

        // Zone 2 Prop: Billboard
        const billGeo = new THREE.BoxGeometry(0.2, 4, 6);
        const billMat = new THREE.MeshStandardMaterial({ color: 0x111111 });
        const billboard = new THREE.Mesh(billGeo, billMat);
        billboard.position.set(-10, 2, -15);
        this.scene.add(billboard);
        // Pink edge trim
        const trimGeo = new THREE.BoxGeometry(0.25, 4.2, 6.2);
        const trimMat = new THREE.MeshStandardMaterial({ color: 0xff00c8, emissive: 0xff00c8, emissiveIntensity: 2, wireframe: true });
        const trim = new THREE.Mesh(trimGeo, trimMat);
        billboard.add(trim);

        // Zone 3 Prop: Floating Tags
        const skills = ["C", "Python", "Bash", "Shell", "Linux", "SQL", "Assembler", "OOP", "Data Structures", "Git", "Algorithms"];
        skills.forEach((skill, i) => {
            const canvas = document.createElement('canvas');
            canvas.width = 256;
            canvas.height = 64;
            const ctx = canvas.getContext('2d');
            ctx.fillStyle = '#000';
            ctx.fillRect(0, 0, 256, 64);
            ctx.fillStyle = '#9d00ff';
            ctx.font = '32px Monospace';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText(skill, 128, 32);

            const tex = new THREE.CanvasTexture(canvas);
            const tagGeo = new THREE.PlaneGeometry(1, 0.25);
            const tagMat = new THREE.MeshStandardMaterial({ map: tex, emissive: 0x9d00ff, emissiveIntensity: 2, side: THREE.DoubleSide, transparent: true });
            const tag = new THREE.Mesh(tagGeo, tagMat);

            const angle = (i / skills.length) * Math.PI * 2;
            tag.position.set(8 + Math.cos(angle) * 2, 1 + Math.random() * 2, -20 + Math.sin(angle) * 2);
            this.scene.add(tag);
            this.floatingTags.push({ mesh: tag, offset: Math.random() * Math.PI * 2 });
        });

        // Zone 4 Prop: Phone Booth
        const boothGroup = new THREE.Group();
        boothGroup.position.set(5, 0, -8);

        const wallMat = new THREE.MeshStandardMaterial({ color: 0x333333, transparent: true, opacity: 0.5 });
        const sideGeo = new THREE.BoxGeometry(0.1, 2.5, 1);
        const backGeo = new THREE.BoxGeometry(1, 2.5, 0.1);
        const roofGeo = new THREE.BoxGeometry(1, 0.1, 1);

        const left = new THREE.Mesh(sideGeo, wallMat); left.position.set(-0.5, 1.25, 0); boothGroup.add(left);
        const right = new THREE.Mesh(sideGeo, wallMat); right.position.set(0.5, 1.25, 0); boothGroup.add(right);
        const back = new THREE.Mesh(backGeo, wallMat); back.position.set(0, 1.25, -0.5); boothGroup.add(back);
        const roof = new THREE.Mesh(roofGeo, wallMat); roof.position.set(0, 2.5, 0); boothGroup.add(roof);

        this.phoneBoothLight = new THREE.PointLight(0xffaa00, 2, 5);
        this.phoneBoothLight.position.set(0, 2, 0);
        boothGroup.add(this.phoneBoothLight);

        this.scene.add(boothGroup);

        // Zone 5 Prop: Holographic Table
        const tableGeo = new THREE.BoxGeometry(1.5, 0.1, 1);
        const tableMat = new THREE.MeshStandardMaterial({ color: 0x00f5ff, emissive: 0x00f5ff, emissiveIntensity: 5, transparent: true, opacity: 0.8 });
        const table = new THREE.Mesh(tableGeo, tableMat);
        table.position.set(12, 5.8, -12);
        this.scene.add(table);
    }

    update(playerPos, time) {
        let nearestZone = null;
        let minDist = 3.5;

        this.markers.forEach(marker => {
            marker.mesh.rotation.z += 0.02;
            const dist = playerPos.distanceTo(marker.mesh.position);
            if (dist < minDist) {
                minDist = dist;
                nearestZone = marker.id;
            }
        });

        if (nearestZone !== this.activeZone) {
            this.activeZone = nearestZone;
            showPanel(this.activeZone);
        }

        this.floatingTags.forEach(tag => {
            tag.mesh.position.y += Math.sin(time * 2 + tag.offset) * 0.005;
            tag.mesh.lookAt(playerPos.x, tag.mesh.position.y, playerPos.z);
        });

        if (this.phoneBoothLight) {
            this.phoneBoothLight.intensity = 1.5 + Math.random() * 1.5;
        }
    }
}
