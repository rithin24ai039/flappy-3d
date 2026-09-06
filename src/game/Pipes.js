import * as THREE from "https://unpkg.com/three@0.160.0/build/three.module.js";

const BASE_SPEED = 0.028;
const GAP = 3.15;
const PIPE_HEIGHT = 8;
const PIPE_SPACING = 7;
const FIRST_PIPE_X = 7;
const RECYCLE_X = -4;

export function createPipes(scene) {
  const pairs = [];
  const material = new THREE.MeshStandardMaterial({ color: 0x32b85c, roughness: 0.65 });

  for (let i = 0; i < 4; i++) {
    const pair = createPair(FIRST_PIPE_X + i * PIPE_SPACING);
    pairs.push(pair);
  }

  function randomGapY() {
    return THREE.MathUtils.randFloat(-1.9, 1.9);
  }

  function createPipe() {
    return new THREE.Mesh(
      new THREE.BoxGeometry(1.5, PIPE_HEIGHT, 2),
      material
    );
  }

  function createPair(x) {
    const top = createPipe();
    const bottom = createPipe();
    scene.add(top, bottom);

    const pair = { top, bottom, gapY: randomGapY(), scored: false };
    positionPair(pair, x);
    return pair;
  }

  function positionPair(pair, x) {
    pair.gapY = pair.gapY ?? randomGapY();
    pair.top.position.set(x, pair.gapY + GAP / 2 + PIPE_HEIGHT / 2, 0);
    pair.bottom.position.set(x, pair.gapY - GAP / 2 - PIPE_HEIGHT / 2, 0);
  }

  function recycle(pair, newX) {
    pair.gapY = randomGapY();
    pair.scored = false;
    positionPair(pair, newX);
  }

  function update(birdPosition, difficulty = 0) {
    let hit = false;
    let scored = false;
    const speed = BASE_SPEED + Math.min(difficulty * 0.0007, 0.015);

    let rightmostX = Math.max(...pairs.map(p => p.top.position.x));

    for (const pair of pairs) {
      pair.top.position.x -= speed;
      pair.bottom.position.x -= speed;

      const x = pair.top.position.x;

      // Collision only when the bird overlaps the gate horizontally.
      if (Math.abs(x - birdPosition.x) < 1.05) {
        if (
          birdPosition.y > pair.gapY + GAP / 2 - 0.35 ||
          birdPosition.y < pair.gapY - GAP / 2 + 0.35
        ) {
          hit = true;
        }
      }

      // Award exactly one point per complete gate.
      if (!pair.scored && x < birdPosition.x) {
        pair.scored = true;
        scored = true;
      }

      // Endless runner: move passed gates to the front.
      if (x < RECYCLE_X) {
        rightmostX = Math.max(
          rightmostX,
          ...pairs.map(p => p.top.position.x)
        );
        recycle(pair, rightmostX + PIPE_SPACING);
        rightmostX = pair.top.position.x;
      }
    }

    return { hit, scored };
  }

  function reset() {
    pairs.forEach((pair, index) => {
      pair.gapY = randomGapY();
      pair.scored = false;
      positionPair(pair, FIRST_PIPE_X + index * PIPE_SPACING);
    });
  }

  return { update, reset };
}