import './style.css';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import * as dat from 'dat.gui';
import vertexShader from './shaders/vertex.glsl';
import fragmentShader from './shaders/fragment.glsl';
import gsap from 'gsap';
import * as OIMO from 'oimo';

// console.log(OIMO);
/**
 * Base
 */
// Debug
let params = {
    createBody: function () {
        createBody();
    }
};
let mouse = new THREE.Vector2();
let point = new THREE.Vector3(0, 0, 0);
const gui = new dat.GUI();

gui.add(params, 'createBody');
// Canvas
const canvas = document.querySelector('canvas.webgl');

// Scene
const scene = new THREE.Scene();
let raycaster = new THREE.Raycaster();

let testPlane = new THREE.Mesh(new THREE.PlaneGeometry(100, 100), new THREE.MeshBasicMaterial({ color: 0x0000ff }));

window.addEventListener('mousemove', e => {
    mouse.x = (e.clientX / window.innerWidth) * 2 - 1;
    mouse.y = -(e.clientY / window.innerHeight) * 2 + 1;

    raycaster.setFromCamera(mouse, camera);
    let intersects = raycaster.intersectObjects([testPlane]);
    if (intersects.length > 0) {
        // console.log(intersects[0].point);
        point.copy(intersects[0].point);

    }
});

let world = new OIMO.World({
    timestep: 1 / 60,
    broadphase: 2,
    iterations: 8,
    worldscale: 1,
    random: true,
    info: false,
    gravity: [0, 0, 0],
});

let body = world.add({
    type: 'sphere',
    size: [1, 1, 1],
    pos: [0, 0, 0],
    rot: [0, 0, 90],
    move: true,
    density: 1,
    friction: 0.5,
    restitution: 0.5,
    belongsTo: 1,
    noSleep: true,
    collidesWith: 0xffffffff,
});

let bodies = [];

function createBody() {

    let o = {};

    let body = world.add({
        type: 'box',
        size: [1, 1, 1],
        pos: [0, 0, 0],
        rot: [0, 0, 90],
        move: true,
        density: 1,
        friction: 0.5,
        restitution: 0.5,
        belongsTo: 1,
        collidesWith: 0xffffffff,
    });

    o.body = body;
    o.mesh = new THREE.Mesh(new THREE.BoxBufferGeometry(1, 1, 1),
        new THREE.MeshBasicMaterial({ color: 0x0000ff, wireframe: true }));
    bodies.push(o);
    scene.add(o.mesh);
}
// ground

let ground = world.add({ size: [40, 1, 40], pos: [0, -4, 0], world: world });
let ground1 = world.add({ size: [40, 1, 40], pos: [0, 4, 0], world: world });

let left = world.add({ size: [1, 40, 40], pos: [-6, 0, 0], world: world });
let right = world.add({ size: [1, 40, 40], pos: [6, 0, 0], world: world });

let z = world.add({ size: [40, 40, 1], pos: [0, 0, -3], world: world });
let z1 = world.add({ size: [40, 40, 1], pos: [0, 0, 3], world: world });

/**
 * Test mesh
 */
// Geometry
const geometry = new THREE.TetrahedronBufferGeometry(1);

let pos = geometry.attributes.position.array;
let count = pos.length / 3;

let bary = [];

for (let i = 0; i < count; i++) {
    bary.push(0, 0, 1, 0, 1, 0, 1, 0, 0);
}

bary = new Float32Array(bary);
geometry.setAttribute('barycentric', new THREE.BufferAttribute(bary, 3));

// Material
const material = new THREE.ShaderMaterial({
    uniforms: {
        uTime: { value: 0 },
    },
    vertexShader: vertexShader,
    fragmentShader: fragmentShader,
    side: THREE.DoubleSide
});

// Mesh
const mesh = new THREE.Mesh(geometry, material);
scene.add(mesh);

/**
 * Sizes
 */
const sizes = {
    width: window.innerWidth,
    height: window.innerHeight
};

window.addEventListener('resize', () => {
    // Update sizes
    sizes.width = window.innerWidth;
    sizes.height = window.innerHeight;

    // Update camera
    camera.aspect = sizes.width / sizes.height;
    camera.updateProjectionMatrix();

    // Update renderer
    renderer.setSize(sizes.width, sizes.height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
});

/**
 * Camera
 */
// Orthographic camera
// const camera = new THREE.OrthographicCamera(-1/2, 1/2, 1/2, -1/2, 0.1, 100)

// Base camera
const camera = new THREE.PerspectiveCamera(75, sizes.width / sizes.height, 0.1, 100);
camera.position.set(0, 0, 6);
scene.add(camera);

// Controls
const controls = new OrbitControls(camera, canvas);
controls.enableDamping = true;

/**
 * Renderer
 */
const renderer = new THREE.WebGLRenderer({
    canvas: canvas
});
renderer.setSize(sizes.width, sizes.height);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
// antialias
renderer.antialias = true;
/**
 * Animate
 */
const clock = new THREE.Clock();

const tick = () => {
    // Update controls
    world.step();
    body.awake();
    body.setPosition(point);
    mesh.position.set(body.position.x, body.position.y, body.position.z);
    mesh.quaternion.set(body.quaternion.x, body.quaternion.y, body.quaternion.z, body.quaternion.w);

    bodies.forEach(o => {
        o.mesh.position.set(o.body.position.x, o.body.position.y, o.body.position.z);
        o.mesh.quaternion.set(o.body.quaternion.x, o.body.quaternion.y, o.body.quaternion.z, o.body.quaternion.w);
    }
    );
    controls.update();

    // Get elapsedtime
    const elapsedTime = clock.getElapsedTime();

    // Update uniforms
    material.uniforms.uTime.value = elapsedTime;

    // Render
    renderer.render(scene, camera);

    // Call tick again on the next frame
    window.requestAnimationFrame(tick);
};

tick();