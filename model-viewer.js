// model-viewer.js
// Three.js implementation with GLB model loading
let scene, camera, renderer, controls, model;
let currentModel = 0;
let modelLoading = false;

// Define models with their paths and metadata
const models = [
  {
    title: "Combat knife",
    description:
      "This futuristic dagger model features intricate details and glowing energy elements. Created in Blender with high-poly modeling techniques, the model was then optimized for real-time web rendering.",
    path: "models/knife.glb",
  },
  {
    title: "Kitchen Knife",
    description:
      "A detailed astronaut helmet with realistic materials and reflective surfaces. Designed for sci-fi environments and optimized for real-time rendering.",
    path: "models/helmet.glb",
  },
  {
    title: "Handcuffs",
    description:
      "Magical weapon with intricate details and textures. Features glowing runes along the blade and ornate handle designs.",
    path: "models/sword.glb",
  },
];

function init3DViewer() {
  // Only initialize once
  if (scene) return;

  // Get canvas element
  const canvas = document.getElementById("modelCanvas");
  const loadingOverlay = document.getElementById("loadingOverlay");

  // Create scene
  scene = new THREE.Scene();
  scene.background = new THREE.Color(0x0a0a1a);

  // Create camera
  camera = new THREE.PerspectiveCamera(
    75,
    canvas.clientWidth / canvas.clientHeight,
    0.1,
    1000
  );
  camera.position.z = 5;

  // Create renderer
  renderer = new THREE.WebGLRenderer({
    canvas: canvas,
    antialias: true,
    alpha: true,
  });
  renderer.setSize(canvas.clientWidth, canvas.clientHeight);
  renderer.setPixelRatio(window.devicePixelRatio);

  // Add lights
  const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
  scene.add(ambientLight);

  const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
  directionalLight.position.set(5, 5, 5);
  scene.add(directionalLight);

  // Add hemisphere light for more natural lighting
  const hemiLight = new THREE.HemisphereLight(0x4facfe, 0x16213e, 0.5);
  scene.add(hemiLight);

  // Add grid helper
  const gridHelper = new THREE.GridHelper(20, 20, 0x444444, 0x222222);
  scene.add(gridHelper);

  // Add OrbitControls
  controls = new THREE.OrbitControls(camera, renderer.domElement);
  controls.enableDamping = true;
  controls.dampingFactor = 0.05;

  // Handle window resize
  window.addEventListener("resize", () => {
    camera.aspect = canvas.clientWidth / canvas.clientHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(canvas.clientWidth, canvas.clientHeight);
  });

  // Set up model navigation buttons
  document
    .getElementById("prevModelBtn")
    .addEventListener("click", () => changeModel(-1));
  document
    .getElementById("nextModelBtn")
    .addEventListener("click", () => changeModel(1));

  // Load initial model
  loadModel(currentModel);

  // Start animation loop
  animate();
}

function loadModel(index) {
  if (modelLoading) return;

  const modelData = models[index];
  const loadingOverlay = document.getElementById("loadingOverlay");

  // Show loading overlay
  loadingOverlay.style.display = "flex";
  modelLoading = true;

  // Clear previous model
  if (model) {
    scene.remove(model);
    model = null;
  }

  // Update model info
  document.getElementById("model-title").textContent = modelData.title;
  document.getElementById("model-description").textContent =
    modelData.description;

  // Create GLTF loader
  const loader = new THREE.GLTFLoader();

  // Load the model
  loader.load(
    modelData.path,
    (gltf) => {
      model = gltf.scene;

      // Set up model
      model.scale.set(1.5, 1.5, 1.5);

      // Calculate bounding box to center the model
      const box = new THREE.Box3().setFromObject(model);
      const center = box.getCenter(new THREE.Vector3());
      model.position.sub(center);

      // Add model to scene
      scene.add(model);

      // Position camera based on model size
      const size = box.getSize(new THREE.Vector3()).length();
      camera.position.z = size * 1.5;
      controls.update();

      // Hide loading overlay
      loadingOverlay.style.display = "none";
      modelLoading = false;
    },
    (xhr) => {
      // Loading progress
      const percentLoaded = Math.round((xhr.loaded / xhr.total) * 100);
      loadingOverlay.querySelector(
        "p"
      ).textContent = `Loading model: ${percentLoaded}%`;
    },
    (error) => {
      console.error("Error loading model:", error);
      loadingOverlay.innerHTML = `<p class="error">Error loading model: ${error.message}</p>`;
      modelLoading = false;

      // Create placeholder object
      const geometry = new THREE.BoxGeometry(1, 1, 1);
      const material = new THREE.MeshBasicMaterial({
        color: 0xff0000,
        wireframe: true,
      });
      model = new THREE.Mesh(geometry, material);
      scene.add(model);
    }
  );
}

function changeModel(direction) {
  if (modelLoading) return;

  currentModel += direction;

  // Wrap around model index
  if (currentModel < 0) {
    currentModel = models.length - 1;
  } else if (currentModel >= models.length) {
    currentModel = 0;
  }

  // Load the new model
  loadModel(currentModel);
}

function animate() {
  requestAnimationFrame(animate);

  // Rotate model slowly
  if (model) {
    model.rotation.y += 0.005;
  }

  if (controls) controls.update();
  if (renderer && scene && camera) renderer.render(scene, camera);
}
