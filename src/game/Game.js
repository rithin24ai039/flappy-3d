import * as THREE from "https://unpkg.com/three@0.160.0/build/three.module.js";
import { createBird } from "./Bird.js";
import { createPipes } from "./Pipes.js";
import { PHYSICS } from "./constants.js";

export function createGame({onScore,onState}) {
 const scene=new THREE.Scene(), camera=new THREE.PerspectiveCamera(60,innerWidth/innerHeight,.1,100);
 camera.position.set(0,0,12); const renderer=new THREE.WebGLRenderer({antialias:true}); renderer.setSize(innerWidth,innerHeight); document.body.appendChild(renderer.domElement);
 scene.add(new THREE.HemisphereLight(0xffffff,0x444444,2)); const bird=createBird(scene), pipes=createPipes(scene);
 let velocity=0,running=false,score=0;
 function reset(){velocity=0;running=false;score=0;bird.mesh.position.set(0,0,0);pipes.reset();onScore(0);onState("Click or press SPACE to start");}
 function flap(){if(!running){running=true;onState("");} velocity=PHYSICS.FLAP;}
 function end(){running=false;onState("Game Over — click or press SPACE to restart");}
 function update(){if(running){velocity-=PHYSICS.GRAVITY;bird.mesh.position.y+=velocity;bird.mesh.rotation.z=-velocity*3;if(Math.abs(bird.mesh.position.y)>5)end();const result=pipes.update(bird.mesh.position);if(result.hit)end();if(result.scored){score++;onScore(score);}}renderer.render(scene,camera);requestAnimationFrame(update);}
 addEventListener("resize",()=>{camera.aspect=innerWidth/innerHeight;camera.updateProjectionMatrix();renderer.setSize(innerWidth,innerHeight)});reset();update();return {flap};
}