import * as THREE from 'three';

export class Rain {
    constructor(scene) {
        this.count = 3000;
        this.geom = new THREE.BufferGeometry();
        this.positions = new Float32Array(this.count * 3);

        for (let i = 0; i < this.count * 3; i += 3) {
            this.positions[i] = (Math.random() - 0.5) * 60;
            this.positions[i + 1] = Math.random() * 30;
            this.positions[i + 2] = (Math.random() - 0.5) * 60 - 20;
        }

        this.geom.setAttribute('position', new THREE.BufferAttribute(this.positions, 3));

        this.material = new THREE.PointsMaterial({
            color: 0xccddff,
            size: 0.04,
            transparent: true,
            opacity: 0.4
        });

        this.points = new THREE.Points(this.geom, this.material);
        scene.add(this.points);
    }

    update() {
        const positions = this.geom.attributes.position.array;
        for (let i = 1; i < positions.length; i += 3) {
            positions[i] -= 0.3;
            if (positions[i] < 0) {
                positions[i] = 30;
            }
        }
        this.geom.attributes.position.needsUpdate = true;
    }
}
