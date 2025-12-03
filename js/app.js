// js/app.js
import * as THREE from 'https://unpkg.com/three@0.165.0/build/three.module.js';
import { GLTFLoader } from 'https://unpkg.com/three@0.165.0/examples/jsm/loaders/GLTFLoader.js';
import { ARButton } from 'https://unpkg.com/three@0.165.0/examples/jsm/webxr/ARButton.js';

// ====== ESCENA BÁSICA ======
const container = document.getElementById('ar-container');

const scene = new THREE.Scene();

// Cámara
const camera = new THREE.PerspectiveCamera(
  70,
  window.innerWidth / window.innerHeight,
  0.01,
  20
);

// Renderer
const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
renderer.setPixelRatio(window.devicePixelRatio);
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.xr.enabled = true;
container.appendChild(renderer.domElement);

// Luz suave
const light = new THREE.HemisphereLight(0xffffff, 0xbbbbff, 1);
scene.add(light);

// ====== VARIABLES GLOBALES ======
let model = null;
let mixer = null;
let clips = [];
let buttonsGroup = new THREE.Group();
const clock = new THREE.Clock();

// ====== AR BUTTON ======
const arButton = ARButton.createButton(renderer, {
  requiredFeatures: ['hit-test'], // si en tu cel falla, prueba quitando esta línea
});
arButton.classList.add('webxr-ar-button');
document.body.appendChild(arButton);

// ====== CARGAR MODELO GLB ======
const loader = new GLTFLoader();

loader.load(
  'modelo/mixamo_multi.glb', // asegúrate que este archivo exista
  (gltf) => {
    model = gltf.scene;
    model.scale.set(0.01, 0.01, 0.01);
    model.position.set(0, 0, -1.5);
    scene.add(model);

    mixer = new THREE.AnimationMixer(model);
    clips = gltf.animations;

    console.log('Animaciones disponibles:', clips.map(c => c.name));

    if (clips.length > 0) {
      playAnimationByName(clips[0].name); // primera animación
    }

    createImmersiveButtons();
  },
  undefined,
  (error) => {
    console.error('Error al cargar el modelo GLB:', error);
  }
);

// ====== REPRODUCIR ANIMACIÓN ======
function playAnimationByName(name) {
  if (!mixer || clips.length === 0) return;

  const clip = clips.find(c => c.name === name);
  if (!clip) {
    console.warn('No se encontró la animación:', name);
    return;
  }

  mixer.stopAllAction();
  const action = mixer.clipAction(clip);
  action.reset();
  action.play();
  console.log('Reproduciendo animación:', name);
}

// ====== BOTONES 3D INMERSIVOS ======
function createImmersiveButtons() {
  buttonsGroup = new THREE.Group();
  buttonsGroup.visible = false;

  const desiredAnimations = [];

  if (clips.length > 0) {
    for (let i = 0; i < Math.min(4, clips.length); i++) {
      desiredAnimations.push(clips[i].name);
    }
  } else {
    desiredAnimations.push('Idle', 'Walk', 'Dance', 'Wave');
  }

  const buttonDistance = 0.4;
  const startX = -((desiredAnimations.length - 1) * buttonDistance) / 2;

  desiredAnimations.forEach((animName, index) => {
    const button = createButtonMesh(animName);
    button.position.set(startX + index * buttonDistance, 0.5, -1);
    button.userData.animationName = animName;
    buttonsGroup.add(button);
  });

  scene.add(buttonsGroup);
}

function createButtonMesh(label) {
  const width = 256;
  const height = 64;
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;

  const ctx = canvas.getContext('2d');
  ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
  ctx.fillRect(0, 0, width, height);
  ctx.fillStyle = '#ffffff';
  ctx.font = '24px sans-serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(label, width / 2, height / 2);

  const texture = new THREE.CanvasTexture(canvas);

  const geometry = new THREE.PlaneGeometry(0.3, 0.08);
  const material = new THREE.MeshBasicMaterial({
    map: texture,
    transparent: true,
  });

  return new THREE.Mesh(geometry, material);
}

// Mostrar / ocultar botones en AR
renderer.xr.addEventListener('sessionstart', () => {
  buttonsGroup.visible = true;
});

renderer.xr.addEventListener('sessionend', () => {
  buttonsGroup.visible = false;
});

// ====== RAYCAST PARA TOQUES ======
const raycaster = new THREE.Raycaster();
const tapPosition = new THREE.Vector2();

function onTap(event) {
  let x, y;
  if (event.touches && event.touches.length > 0) {
    x = event.touches[0].clientX;
    y = event.touches[0].clientY;
  } else {
    x = event.clientX;
    y = event.clientY;
  }

  tapPosition.x = (x / window.innerWidth) * 2 - 1;
  tapPosition.y = -(y / window.innerHeight) * 2 + 1;

  raycaster.setFromCamera(tapPosition, camera);
  const intersects = raycaster.intersectObjects(buttonsGroup.children, true);

  if (intersects.length > 0) {
    const object = intersects[0].object;
    const animName = object.userData.animationName;
    if (animName) playAnimationByName(animName);
  }
}

window.addEventListener('click', onTap);
window.addEventListener('touchstart', onTap);

// ====== LOOP ======
renderer.setAnimationLoop(() => {
  const delta = clock.getDelta();
  if (mixer) mixer.update(delta);
  renderer.render(scene, camera);
});

// ====== RESPONSIVE ======
window.addEventListener('resize', () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});
