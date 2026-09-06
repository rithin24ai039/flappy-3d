import * as THREE from "https://unpkg.com/three@0.160.0/build/three.module.js";

/**
 * Stylized low-poly bird built from primitives.
 * Keeping the model procedural avoids external asset loading.
 */
export function createBird(scene) {
  const bird = new THREE.Group();
  bird.name = "FlappyBird";

  const yellow = new THREE.MeshStandardMaterial({ color: 0xffd23f, roughness: 0.72 });
  const orange = new THREE.MeshStandardMaterial({ color: 0xff8a1f, roughness: 0.65 });
  const white = new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.55 });
  const black = new THREE.MeshStandardMaterial({ color: 0x111111, roughness: 0.35 });

  // Rounded body.
  const body = new THREE.Mesh(new THREE.SphereGeometry(0.56, 24, 18), yellow);
  body.scale.set(1.15, 0.92, 0.9);
  bird.add(body);

  // Cream belly for more depth.
  const belly = new THREE.Mesh(new THREE.SphereGeometry(0.38, 20, 14), white);
  belly.position.set(0.08, -0.16, 0.43);
  belly.scale.set(0.95, 0.72, 0.28);
  bird.add(belly);

  // Beak points toward the direction of travel.
  const beak = new THREE.Mesh(new THREE.ConeGeometry(0.19, 0.48, 4), orange);
  beak.rotation.z = -Math.PI / 2;
  beak.position.set(0.67, 0.02, 0);
  bird.add(beak);

  // Eyes.
  [-0.23, 0.23].forEach(z => {
    const eyeWhite = new THREE.Mesh(new THREE.SphereGeometry(0.15, 16, 12), white);
    eyeWhite.position.set(0.28, 0.27, z);
    bird.add(eyeWhite);

    const pupil = new THREE.Mesh(new THREE.SphereGeometry(0.065, 12, 10), black);
    pupil.position.set(0.39, 0.27, z);
    bird.add(pupil);
  });

  // Wings.
  function wing(z, direction) {
    const group = new THREE.Group();
    const feather = new THREE.Mesh(new THREE.SphereGeometry(0.34, 16, 12), orange);
    feather.scale.set(1.15, 0.22, 0.72);
    feather.position.z = z;
    feather.rotation.x = direction * 0.25;
    group.add(feather);
    bird.add(group);
    return group;
  }

  const leftWing = wing(0.46, 1);
  const rightWing = wing(-0.46, -1);

  // Tail feathers.
  [-0.14, 0.14].forEach(z => {
    const tail = new THREE.Mesh(new THREE.ConeGeometry(0.18, 0.55, 4), orange);
    tail.rotation.z = Math.PI / 2;
    tail.position.set(-0.62, -0.03, z);
    bird.add(tail);
  });

  bird.position.set(0, 0, 0);
  scene.add(bird);

  let flapTime = 0;
  function animate(delta = 0.016, velocity = 0) {
    flapTime += delta * 16;
    const wingAngle = Math.sin(flapTime) * 0.42;
    leftWing.rotation.x = wingAngle;
    rightWing.rotation.x = -wingAngle;
    bird.rotation.z = THREE.MathUtils.clamp(-velocity * 3.2, -0.55, 0.65);
  }

  return { mesh: bird, animate };
}