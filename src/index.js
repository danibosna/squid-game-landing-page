import "./styles/style.css";
import stones from "./assets/models/stones/scene.gltf";

const mouse = {
  x: 0,
  y: 0,
};

let spheres = [];
let stoneDisplacements = [];
let light;
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(
  75,
  window.innerWidth / window.innerHeight,
  6.1,
  1000
);

const renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

//orbit controls
const controls = new THREE.OrbitControls(camera, renderer.domElement);
controls.enablePan = true;
controls.enableZoom = true;
controls.enableRotate = true;
controls.update();

camera.position.set(0, 0, 32);

// on resize
window.addEventListener("resize", onWindowResize, false);

function onWindowResize() {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();

  renderer.setSize(window.innerWidth, window.innerHeight);
}

const color = 0x229794;
const intensity = 2;
light = new THREE.PointLight(color, intensity, 60);
light.position.set(0, 0, 0.1);
light.scale.set(1, 1, 1);

scene.add(light);

const loader = new THREE.GLTFLoader();
loader.load(
  stones,
  function (gltf) {
    for (let i = 0; i < 500; i++) {
      let currentMesh = gltf.scene.clone();

      let scale = Math.random() / 200;

      let xposition = Math.random() * 50 - 5;
      let yposition = Math.random() * 50 - 5;

      currentMesh.position.x = xposition;
      currentMesh.position.y = yposition;

      currentMesh.scale.set(scale, scale, scale);

      let displacement = { x: Math.random() * 1.5, y: Math.random() * 1.5 };
      stoneDisplacements.push(displacement);

      scene.add(currentMesh);

      spheres.push(currentMesh);
    }
  },
  function (xhr) {
    console.log((xhr.loaded / xhr.total) * 100 + "% loaded");
  },
  function (error) {
    console.log(error);
  }
);

const planeSize = 1000;
const planeGeometry = new THREE.PlaneGeometry(planeSize, planeSize);
const planeMaterial = new THREE.MeshPhongMaterial({
  color: 0xffffff,
  side: THREE.DoubleSide,
});
const plane = new THREE.Mesh(planeGeometry, planeMaterial);
scene.add(plane);

document.addEventListener("mousemove", onMouseMove);

function onMouseMove(e) {
  e.preventDefault();

  mouse.x = (e.clientX / window.innerWidth) * 2 - 1;
  mouse.y = -(e.clientY / window.innerHeight) * 2 + 1;

  let vector = new THREE.Vector3(mouse.x, mouse.y, 0.1);
  vector.unproject(camera);

  let dir = vector.sub(camera.position).normalize();
  let distance = -camera.position.z / dir.z;
  let pos = camera.position.clone().add(dir.multiplyScalar(distance));

  light.position.copy(new THREE.Vector3(pos.x, pos.y, pos.z + 0.5));
}

const animate = () => {
  const timer = 0.001 * Date.now();
  camera.lookAt(scene.position);

  for (let i = 0; i < spheres.length; i++) {
    let sphere = spheres[i];
    let displacement = stoneDisplacements[i];

    let lerpSpeed = 0.003 / displacement.x;

    let targetXPosition =
      light.position.x + Math.cos(timer + i * 5) * displacement.x * 30;
    let targetYPosition =
      light.position.y + Math.sin(timer + i * 5) * displacement.y * 35;
    let rotationSpeed = new THREE.Vector3(10, 10, 10);

    sphere.position.x = new THREE.Vector3().lerpVectors(
      sphere.position,
      new THREE.Vector3(targetXPosition, 0, 0),
      lerpSpeed
    ).x;
    sphere.position.y = new THREE.Vector3().lerpVectors(
      sphere.position,
      new THREE.Vector3(0, targetYPosition, 0),
      lerpSpeed
    ).y;

    sphere.rotation.x += (Math.PI * displacement.x) / (rotationSpeed.x * 20);
    sphere.rotation.y += (Math.PI * displacement.y) / (rotationSpeed.y * 20);
    sphere.rotation.z += (Math.PI * displacement.z) / (rotationSpeed.z * 20);
  }
  renderer.render(scene, camera);

  requestAnimationFrame(animate);
};

animate();

console.log("desde index three");
