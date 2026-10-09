import * as THREE from "https://unpkg.com/three@0.160.0/build/three.module.js";

export function createEnvironment(scene) {
  const skyDay = new THREE.Color(0x78c9f4);
  const skySunset = new THREE.Color(0xff9a72);
  const skyNight = new THREE.Color(0x07152f);
  scene.background = skyDay.clone();
  scene.fog = new THREE.Fog(0x78c9f4, 24, 65);

  const ambient = new THREE.HemisphereLight(0xc9edff, 0x5a617b, 1.65);
  scene.add(ambient);
  const sunLight = new THREE.DirectionalLight(0xffe3b0, 2.2);
  sunLight.position.set(-5, 8, 4);
  scene.add(sunLight);

  const sun = new THREE.Mesh(
    new THREE.SphereGeometry(1.05, 24, 16),
    new THREE.MeshBasicMaterial({ color: 0xfff0bc })
  );
  sun.position.set(-7, 5.2, -18);
  scene.add(sun);

  const cloudMaterial = new THREE.MeshLambertMaterial({ color: 0xffffff });
  const clouds = [];
  for (let i = 0; i < 12; i++) {
    const cloud = new THREE.Group();
    const x = (i % 6) * 7 - 18 + Math.random() * 2;
    const y = 2.4 + Math.random() * 4.3;
    const z = -10 - Math.random() * 8;
    for (let j = 0; j < 5; j++) {
      const puff = new THREE.Mesh(
        new THREE.SphereGeometry(0.45 + Math.random() * 0.42, 10, 8),
        cloudMaterial
      );
      puff.position.set((j - 2) * 0.48, Math.sin(j * 1.4) * 0.2, Math.random() * 0.25);
      cloud.add(puff);
    }
    cloud.position.set(x, y, z);
    cloud.scale.setScalar(0.75 + Math.random() * 0.65);
    scene.add(cloud);
    clouds.push(cloud);
  }

  const mountains = [];
  const mountainColors = [0x526f91, 0x6687a1, 0x829caf, 0x405b7b];
  for (let i = 0; i < 13; i++) {
    const group = new THREE.Group();
    const height = 3.2 + Math.random() * 4.2;
    const mountain = new THREE.Mesh(
      new THREE.ConeGeometry(2.1 + Math.random() * 1.8, height, 5),
      new THREE.MeshLambertMaterial({ color: mountainColors[i % mountainColors.length], flatShading: true })
    );
    mountain.position.y = height / 2 - 1.5;
    group.add(mountain);
    group.position.set(i * 4.8 - 25, -2.5, -13 - (i % 3) * 1.2);
    scene.add(group);
    mountains.push(group);
  }

  const islands = [];
  for (let i = 0; i < 7; i++) {
    const island = new THREE.Group();
    const base = new THREE.Mesh(
      new THREE.CylinderGeometry(1.1, 0.45, 0.75, 7),
      new THREE.MeshLambertMaterial({ color: 0x5e8860, flatShading: true })
    );
    base.position.y = -1.7;
    island.add(base);
    const top = new THREE.Mesh(
      new THREE.SphereGeometry(1.12, 12, 8, 0, Math.PI * 2, 0, Math.PI * 0.48),
      new THREE.MeshLambertMaterial({ color: 0x78ad72, flatShading: true })
    );
    top.position.y = -1.28;
    top.scale.y = 0.5;
    island.add(top);
    for (let t = 0; t < 3; t++) {
      const tree = new THREE.Mesh(
        new THREE.ConeGeometry(0.2, 0.75, 5),
        new THREE.MeshLambertMaterial({ color: 0x285b4b })
      );
      tree.position.set((t - 1) * 0.48, -0.72 + Math.random() * 0.12, 0.05);
      island.add(tree);
    }
    island.position.set(i * 7.2 - 20, -1.2 + Math.random() * 0.5, -7.5);
    island.scale.setScalar(0.65 + Math.random() * 0.4);
    scene.add(island);
    islands.push(island);
  }

  const oceanGeometry = new THREE.PlaneGeometry(160, 80, 80, 24);
  oceanGeometry.rotateX(-Math.PI / 2);
  const positions = oceanGeometry.attributes.position;
  const originalY = [];
  for (let i = 0; i < positions.count; i++) originalY.push(positions.getY(i));
  const ocean = new THREE.Mesh(
    oceanGeometry,
    new THREE.MeshPhongMaterial({
      color: 0x238db8,
      emissive: 0x07334d,
      shininess: 85,
      specular: 0x7fdcff,
      flatShading: false
    })
  );
  ocean.position.set(0, -5.15, -5);
  scene.add(ocean);

  let elapsed = 0;
  let dayPhase = 0;
  let currentMood = "day";
  function update(delta, running) {
    elapsed += Math.min(delta, 0.05);
    const speed = running ? 3.4 : 0.65;
    clouds.forEach((cloud, i) => {
      cloud.position.x -= delta * speed * (0.18 + (i % 3) * 0.08);
      if (cloud.position.x < -24) cloud.position.x = 24 + Math.random() * 8;
      cloud.position.y += Math.sin(elapsed * 0.7 + i) * delta * 0.12;
    });
    mountains.forEach((mountain, i) => {
      mountain.position.x -= delta * speed * 0.22;
      if (mountain.position.x < -30) mountain.position.x += 62.4;
    });
    islands.forEach((island, i) => {
      island.position.x -= delta * speed * 0.48;
      if (island.position.x < -23) island.position.x += 50.4;
      island.position.y += Math.sin(elapsed * 1.2 + i) * delta * 0.08;
    });

    const p = (Math.sin(elapsed * 0.055) + 1) / 2;
    dayPhase = p;
    const sunsetWeight = Math.max(0, 1 - Math.abs(p - 0.5) * 3.4);
    const nightWeight = p < 0.18 ? (0.18 - p) / 0.18 : p > 0.88 ? (p - 0.88) / 0.12 : 0;
    const sky = skyDay.clone().lerp(skySunset, sunsetWeight * 0.88).lerp(skyNight, nightWeight * 0.94);
    scene.background.copy(sky);
    if (scene.fog) scene.fog.color.copy(sky);
    ambient.intensity = 0.65 + (1 - nightWeight) * 0.9;
    sunLight.intensity = 0.25 + (1 - nightWeight) * 1.9;
    sun.material.color.set(nightWeight > 0.65 ? 0xc9d9ff : sunsetWeight > 0.45 ? 0xff8b62 : 0xfff0bc);
    sun.visible = nightWeight < 0.85;
    ocean.material.color.set(nightWeight > 0.6 ? 0x102d58 : sunsetWeight > 0.45 ? 0x9a6c85 : 0x238db8);
    ocean.material.emissive.set(nightWeight > 0.6 ? 0x020817 : 0x07334d);

    for (let i = 0; i < positions.count; i++) {
      const x = positions.getX(i);
      const z = positions.getZ(i);
      positions.setY(i, originalY[i] + Math.sin(x * 0.12 + elapsed * 1.4) * 0.075 + Math.cos(z * 0.18 + elapsed) * 0.045);
    }
    positions.needsUpdate = true;
    oceanGeometry.computeVertexNormals();
  }

  return { update };
}
