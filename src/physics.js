import RAPIER from '@dimforge/rapier3d-compat';

export let world;
export let physicsLoaded = false;

export async function initPhysics() {
    await RAPIER.init();
    const gravity = { x: 0.0, y: -9.81, z: 0.0 };
    world = new RAPIER.World(gravity);
    physicsLoaded = true;
    return RAPIER;
}
