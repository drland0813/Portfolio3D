import * as THREE from 'three'
import { LoadGLTFByPath } from './Helpers/ModelHelper.js'
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { CSS3DRenderer, CSS3DObject } from 'three/addons/renderers/CSS3DRenderer.js';
import GUI from 'three/addons/libs/lil-gui.module.min.js';
let renderer = new THREE.WebGLRenderer({

  //Defines the canvas component in the DOM that will be used
  canvas: document.querySelector('#background'),
  antialias: true,
});

renderer.setSize(window.innerWidth, window.innerHeight);

//set up the renderer with the default settings for threejs.org/editor - revision r153
renderer.shadows = true;
renderer.shadowType = 1;
renderer.shadowMap.enabled = true;
renderer.setPixelRatio(window.devicePixelRatio);
renderer.useLegacyLights = false;
renderer.toneMapping = THREE.NoToneMapping;
renderer.toneMappingExposure = 1.0;
renderer.setClearColor(0xffffff, 0);
//make sure three/build/three.module.js is over r152 or this feature is not available. 
renderer.outputColorSpace = THREE.SRGBColorSpace

let cssRenderer = new CSS3DRenderer();
cssRenderer.setSize(window.innerWidth, window.innerHeight);
cssRenderer.domElement.style.position = 'absolute';
cssRenderer.domElement.style.top = '0px';
cssRenderer.domElement.style.pointerEvents = 'none';
document.body.appendChild(cssRenderer.domElement);

const scene = new THREE.Scene();

const hemiLight = new THREE.HemisphereLight(0xffffff, 0x444444, 2);
hemiLight.position.set(0, 20, 0);
scene.add(hemiLight);

const directionalLight = new THREE.DirectionalLight(0xffffff, 1.5);
directionalLight.position.set(5, 10, 5);
scene.add(directionalLight);

const islandGroup = new THREE.Group();
scene.add(islandGroup);

let cameraList = [];

let camera;

let isZoomedIn = false;
let isTransitioning = false;

const panoramaPosition = new THREE.Vector3(-37.29, 65.24, -120.28);
const panoramaTarget = new THREE.Vector3(-3.18, -6.93, -5.07);

const monitorPosition = new THREE.Vector3(0.70, 7.36, -2.49);
const monitorTarget = new THREE.Vector3(1.73, 7.12, 2.95);

camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 1000);
camera.position.copy(panoramaPosition);

const controls = new OrbitControls(camera, renderer.domElement);
controls.target.copy(panoramaTarget);
controls.update();

const iframe = document.createElement('iframe');
iframe.src = 'about:blank';
let isIframeLoaded = false;

iframe.style.width = '1024px';
iframe.style.height = '768px';
iframe.style.border = 'none';
iframe.style.borderRadius = '5px';
iframe.style.transition = 'opacity 0.3s ease-in-out';
iframe.style.opacity = '0';
iframe.style.pointerEvents = 'none';

const cssObject = new CSS3DObject(iframe);
cssObject.position.set(1.73, 7.03, 2.9);
cssObject.rotation.set(0, -2.96, 0);
cssObject.scale.set(0.0055, 0.0056, 0.0055);
islandGroup.add(cssObject);
const gui = new GUI();
gui.title('Chỉnh Iframe (Tạm thời)');
const folderPos = gui.addFolder('Position');
folderPos.add(cssObject.position, 'x', -10, 10, 0.01);
folderPos.add(cssObject.position, 'y', -10, 10, 0.01);
folderPos.add(cssObject.position, 'z', -10, 10, 0.01);

const folderRot = gui.addFolder('Rotation');
folderRot.add(cssObject.rotation, 'x', -Math.PI, Math.PI, 0.01);
folderRot.add(cssObject.rotation, 'y', -Math.PI, Math.PI, 0.01);
folderRot.add(cssObject.rotation, 'z', -Math.PI, Math.PI, 0.01);

const folderScale = gui.addFolder('Scale');
folderScale.add(cssObject.scale, 'x', 0.0001, 0.02, 0.0001).name('Scale X');
folderScale.add(cssObject.scale, 'y', 0.0001, 0.02, 0.0001).name('Scale Y');

const styleSettings = {
  borderRadius: 5,
  loadDelay: 100,
  showDelay: 100,
  zoomSpeed: 0.07,
  bobSpeed: 0.8,
  bobHeight: 1,
  wiggleSpeed: 0.1,
  wiggleAngle: 0.3
};
const folderStyle = gui.addFolder('Style & Timing');
folderStyle.add(styleSettings, 'borderRadius', 0, 100, 1).name('Border Radius').onChange((val) => {
  iframe.style.borderRadius = val + 'px';
});
folderStyle.add(styleSettings, 'loadDelay', 0, 5, 0.1).name('Load Delay (s)');
folderStyle.add(styleSettings, 'showDelay', 0, 5, 0.1).name('Show Delay (s)');
folderStyle.add(styleSettings, 'zoomSpeed', 0.01, 0.2, 0.01).name('Zoom Speed');

const folderHover = gui.addFolder('Hover Effect');
folderHover.add(styleSettings, 'bobSpeed', 0, 5, 0.1).name('Bob Speed');
folderHover.add(styleSettings, 'bobHeight', 0, 5, 0.1).name('Bob Height');
folderHover.add(styleSettings, 'wiggleSpeed', 0, 5, 0.1).name('Rotate Speed');
folderHover.add(styleSettings, 'wiggleAngle', 0, 1, 0.01).name('Rotate Angle');

const bgSettings = {
  color1: '#fad000',
  color2: '#0354aa'
};
const updateGradient = () => {
  renderer.domElement.style.background = `linear-gradient(135deg, ${bgSettings.color1} 0%, ${bgSettings.color2} 100%)`;
};
updateGradient();

const folderBg = gui.addFolder('Background Gradient');
folderBg.addColor(bgSettings, 'color1').name('Color 1').onChange(updateGradient);
folderBg.addColor(bgSettings, 'color2').name('Color 2').onChange(updateGradient);

// --- AUDIO SETUP ---
const bgMusic = new Audio('./public/sounds/clavier-music-calm-space-music-312291.mp3');
bgMusic.loop = true;
bgMusic.volume = 0.3;

const audioState = {
  bgVolume: 0.3,
  webVolume: 1.0
};

const folderAudio = gui.addFolder('Audio Settings');
folderAudio.add(audioState, 'bgVolume', 0, 1, 0.01).name('Background Volume').onChange((val) => {
  bgMusic.volume = val;
});
folderAudio.add(audioState, 'webVolume', 0, 1, 0.01).name('Web Page Volume').onChange((val) => {
  if (iframe.contentWindow) {
    iframe.contentWindow.postMessage({ type: 'setVolume', volume: val }, '*');
  }
});

// --- EFFECTS: WIND & LEAVES ---
const effectsSettings = {
  windEnabled: true,
  leavesEnabled: true,
  windSpeed: 0.8
};

const effectsFolder = gui.addFolder('Particle Effects');
effectsFolder.add(effectsSettings, 'windEnabled').name('Wind Streaks').onChange(val => windGroup.visible = val);
effectsFolder.add(effectsSettings, 'leavesEnabled').name('Falling Leaves').onChange(val => leafGroup.visible = val);
effectsFolder.add(effectsSettings, 'windSpeed', 0.1, 2, 0.1).name('Wind Speed');

const windGroup = new THREE.Group();
scene.add(windGroup);
const windMaterial = new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.15 });
const windGeometry = new THREE.BoxGeometry(4, 0.03, 0.03);
const windStreaks = [];

for (let i = 0; i < 100; i++) {
  const streak = new THREE.Mesh(windGeometry, windMaterial);
  streak.position.set(
    (Math.random() - 0.5) * 200,
    Math.random() * 80 - 20,
    (Math.random() - 0.5) * 150
  );
  streak.userData.speed = Math.random() * 0.5 + 0.2;
  windGroup.add(streak);
  windStreaks.push(streak);
}

const leafGroup = new THREE.Group();
scene.add(leafGroup);
const leafMaterial = new THREE.MeshBasicMaterial({ color: 0x81c784, transparent: true, opacity: 0.8, side: THREE.DoubleSide });
const leafGeometry = new THREE.PlaneGeometry(0.4, 0.4);
const leaves = [];

for (let i = 0; i < 80; i++) {
  const leaf = new THREE.Mesh(leafGeometry, leafMaterial);
  leaf.position.set(
    (Math.random() - 0.5) * 150,
    Math.random() * 80 - 20,
    (Math.random() - 0.5) * 150
  );
  leaf.rotation.set(Math.random() * Math.PI, Math.random() * Math.PI, Math.random() * Math.PI);
  leaf.userData = {
    speedY: Math.random() * 0.05 + 0.02,
    speedX: Math.random() * 0.05 - 0.025,
    speedZ: Math.random() * 0.05 - 0.025,
    rotX: Math.random() * 0.05,
    rotY: Math.random() * 0.05
  };
  leafGroup.add(leaf);
  leaves.push(leaf);
}

gui.hide();

const instructionEl = document.createElement('div');
instructionEl.style.position = 'absolute';
instructionEl.style.top = '30px';
instructionEl.style.left = '30px';
instructionEl.style.color = '#ffffff';
instructionEl.style.fontFamily = 'Arial, sans-serif';
instructionEl.style.fontSize = '24px';
instructionEl.style.fontWeight = 'bold';
instructionEl.style.textShadow = '0px 0px 10px rgba(0,0,0,0.8)';
instructionEl.style.pointerEvents = 'none';
instructionEl.style.zIndex = '10';
instructionEl.style.display = 'none';
instructionEl.style.animation = 'blink 1.5s infinite';
document.body.appendChild(instructionEl);

const style = document.createElement('style');
style.innerHTML = `
@keyframes blink {
  0% { opacity: 1; }
  50% { opacity: 0.2; }
  100% { opacity: 1; }
}
`;
document.head.appendChild(style);

const backBtn = document.createElement('button');
backBtn.innerHTML = '&#8592; Back';
backBtn.style.position = 'absolute';
backBtn.style.top = '30px';
backBtn.style.left = '30px';
backBtn.style.padding = '10px 20px';
backBtn.style.backgroundColor = '#000000';
backBtn.style.color = '#ffffff';
backBtn.style.border = '2px solid #ffffff';
backBtn.style.borderRadius = '5px';
backBtn.style.fontFamily = "'Courier New', Courier, monospace";
backBtn.style.fontSize = '20px';
backBtn.style.fontWeight = 'bold';
backBtn.style.cursor = 'pointer';
backBtn.style.zIndex = '100';
backBtn.style.display = 'none';
document.body.appendChild(backBtn);

const quoteEl = document.createElement('div');
quoteEl.style.position = 'absolute';
quoteEl.style.top = '30px';
quoteEl.style.right = '30px';
quoteEl.style.backgroundColor = 'rgba(0, 0, 0, 0.5)';
quoteEl.style.padding = '15px 20px';
quoteEl.style.borderRadius = '10px';
quoteEl.style.color = '#ffffff';
quoteEl.style.fontFamily = "'Courier New', Courier, monospace";
quoteEl.style.fontSize = '18px';
quoteEl.style.fontStyle = 'italic';
quoteEl.style.textAlign = 'center';
quoteEl.style.maxWidth = '350px';
quoteEl.style.pointerEvents = 'auto';
quoteEl.style.zIndex = '10';
quoteEl.style.display = 'none';
document.body.appendChild(quoteEl);

const quoteTextEl = document.createElement('div');
const copyBtn = document.createElement('button');
copyBtn.style.position = 'absolute';
copyBtn.style.bottom = '8px';
copyBtn.style.left = '8px';
copyBtn.style.background = 'transparent';
copyBtn.style.border = 'none';
copyBtn.style.color = '#aaaaaa';
copyBtn.style.cursor = 'pointer';
copyBtn.title = 'Copy to clipboard';
copyBtn.innerHTML = '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path></svg>';

quoteEl.appendChild(quoteTextEl);
quoteEl.appendChild(copyBtn);

let currentQuote = "";
let currentAuthor = "";

fetch('https://dummyjson.com/quotes/random')
  .then(res => res.json())
  .then(data => {
    let text = data.quote.charAt(0).toUpperCase() + data.quote.slice(1).toLowerCase();
    text = text.replace(/\bi\b/g, 'I').replace(/\bi'/g, "I'");
    currentQuote = text;
    currentAuthor = data.author;
    quoteTextEl.innerHTML = `"${text}"<br><br>- ${data.author} -`;
  })
  .catch(err => {
    currentQuote = "Every moment is a fresh beginning.";
    currentAuthor = "T.S. Eliot";
    quoteTextEl.innerHTML = `"${currentQuote}"<br><br>- ${currentAuthor} -`;
  });

copyBtn.addEventListener('click', (e) => {
  e.stopPropagation();
  const textToCopy = `"${currentQuote}" - ${currentAuthor}`;
  navigator.clipboard.writeText(textToCopy).then(() => {
    copyBtn.innerHTML = '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#4ade80" stroke-width="2"><polyline points="20 6 9 17 4 12"></polyline></svg>';
    setTimeout(() => {
      copyBtn.innerHTML = '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path></svg>';
    }, 2000);
  });
});

backBtn.addEventListener('mousedown', (e) => e.stopPropagation());
backBtn.addEventListener('click', (e) => {
  e.stopPropagation();
  zoomOut();
});

function zoomOut() {
  if (!isZoomedIn) return;
  isZoomedIn = false;
  isTransitioning = true;
  controls.enabled = !gui._hidden;
  iframe.style.pointerEvents = 'none';
  iframe.style.transition = 'none';
  iframe.style.opacity = '0';
  updateInstruction();
}

function updateInstruction() {
  const infoOverlay = document.getElementById('info-overlay');
  if (isZoomedIn) {
    instructionEl.innerText = '';
    backBtn.style.display = 'block';
    if (infoOverlay) infoOverlay.style.display = 'none';
    quoteEl.style.display = 'none';
  } else {
    instructionEl.innerText = 'Click anywhere to begin';
    instructionEl.style.top = 'auto';
    instructionEl.style.bottom = '15%';
    instructionEl.style.left = '50%';
    instructionEl.style.transform = 'translateX(-50%)';
    backBtn.style.display = 'none';
    if (infoOverlay) infoOverlay.style.display = 'flex';
    quoteEl.style.display = 'block';
  }
}
updateInstruction();

let isDragging = false;
renderer.domElement.addEventListener('mousedown', () => { isDragging = false; });
renderer.domElement.addEventListener('mousemove', () => { isDragging = true; });
renderer.domElement.addEventListener('mouseup', () => {
  if (!isDragging && !isZoomedIn) {
    isZoomedIn = true;
    isTransitioning = true;
    controls.enabled = false;
    iframe.style.pointerEvents = 'auto';
    updateInstruction();
  }
});
const playMusicOnInteract = () => {
  if (bgMusic.paused) {
    bgMusic.play().catch(e => console.log('Autoplay blocked:', e));
  }
  document.removeEventListener('click', playMusicOnInteract);
};
document.addEventListener('click', playMusicOnInteract);

// --- CLOCK & INFO OVERLAY LOGIC ---
const nameText = "Pham Van Dien";
const roleText = "Unity Developer";
const nameEl = document.getElementById('type-name');
nameEl.style.backgroundColor = 'rgba(0, 0, 0, 0.5)';
nameEl.style.borderRadius = '10px';
const roleEl = document.getElementById('type-role');
roleEl.style.backgroundColor = 'rgba(0, 0, 0, 0.5)';
roleEl.style.borderRadius = '10px';
const cursorNameEl = document.getElementById('cursor-name');
cursorNameEl.style.backgroundColor = 'rgba(0, 0, 0, 0.5)';
cursorNameEl.style.borderRadius = '10px';
const cursorRoleEl = document.getElementById('cursor-role');
cursorRoleEl.style.backgroundColor = 'rgba(0, 0, 0, 0.5)';
cursorRoleEl.style.borderRadius = '10px';
let nameIdx = 0;
let roleIdx = 0;

function typeWriter() {
  if (nameIdx < nameText.length) {
    nameEl.innerHTML += nameText.charAt(nameIdx);
    nameIdx++;
    setTimeout(typeWriter, 100);
  } else if (nameIdx === nameText.length && roleIdx === 0) {
    cursorNameEl.style.display = 'none';
    cursorRoleEl.style.display = 'inline';
    roleIdx++;
    setTimeout(typeWriter, 100);
  } else if (roleIdx <= roleText.length) {
    roleEl.innerHTML += roleText.charAt(roleIdx - 1);
    roleIdx++;
    setTimeout(typeWriter, 100);
  }
}
setTimeout(typeWriter, 500);

function updateClock() {
  const now = new Date();
  const h = String(now.getHours()).padStart(2, '0');
  const m = String(now.getMinutes()).padStart(2, '0');
  const s = String(now.getSeconds()).padStart(2, '0');
  document.getElementById('clock').innerText = `${h}:${m}:${s}`;
}
setInterval(updateClock, 1000);
updateClock();

const soundToggleBtn = document.getElementById('sound-toggle');
let isBgMuted = false;
soundToggleBtn.addEventListener('click', (e) => {
  e.stopPropagation();
  isBgMuted = !isBgMuted;
  bgMusic.muted = isBgMuted;

  if (isBgMuted) {
    soundToggleBtn.innerHTML = `
      <svg width="20" height="20" viewBox="0 0 24 24" fill="white" xmlns="http://www.w3.org/2000/svg">
        <path d="M11 5L6 9H2V15H6L11 19V5Z" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
        <line x1="23" y1="1" x2="1" y2="23" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
      </svg>
    `;
  } else {
    soundToggleBtn.innerHTML = `
      <svg width="20" height="20" viewBox="0 0 24 24" fill="white" xmlns="http://www.w3.org/2000/svg">
        <path d="M11 5L6 9H2V15H6L11 19V5Z" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
        <path id="sound-wave-1" d="M15.54 8.46C16.4774 9.39764 17.004 10.6692 17.004 11.995C17.004 13.3208 16.4774 14.5924 15.54 15.53" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
        <path id="sound-wave-2" d="M19.07 4.93005C20.9447 6.80527 21.9979 9.34835 21.9979 12.0001C21.9979 14.6518 20.9447 17.1948 19.07 19.0701" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
      </svg>
    `;
    if (bgMusic.paused) {
      bgMusic.play().catch(e => console.log('Autoplay blocked:', e));
    }
  }
});

const loadingScreen = document.getElementById('loading-screen');
const loadingText = document.getElementById('loading-text');

LoadGLTFByPath(islandGroup, (loaded, total) => {
    if (total > 0) {
      const percent = Math.round((loaded / total) * 100);
      if (loadingText) loadingText.innerText = `Loading Model... ${percent}%`;
    } else {
      const mb = (loaded / (1024 * 1024)).toFixed(2);
      if (loadingText) loadingText.innerText = `Loading Model... ${mb}MB`;
    }
  })
  .then(() => {
    if (loadingScreen) {
      loadingScreen.style.opacity = '0';
      setTimeout(() => loadingScreen.style.display = 'none', 500);
    }
    animate();
    instructionEl.style.display = 'block';
  })
  .catch((error) => {
    console.error('Error loading JSON scene:', error);
    if (loadingText) loadingText.innerText = 'Error loading model!';
  });

window.addEventListener('resize', onWindowResize, false);
function onWindowResize() {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
  cssRenderer.setSize(window.innerWidth, window.innerHeight);
}

const keysPressed = new Set();
window.addEventListener('keyup', (e) => {
  keysPressed.delete(e.key.toLowerCase());
});
window.addEventListener('keydown', (e) => {
  keysPressed.add(e.key.toLowerCase());

  if (e.altKey && e.key.toLowerCase() === 'h') {
    if (gui._hidden) {
      gui.show();
    } else {
      gui.hide();
    }
    e.preventDefault();
  }

  if (e.key.toLowerCase() === 'c') {
    console.log("Camera Position:", camera.position);
    console.log("Controls Target:", controls.target);
    alert(`Bạn hãy copy tọa độ này:\n\nPosition: ${camera.position.x.toFixed(2)}, ${camera.position.y.toFixed(2)}, ${camera.position.z.toFixed(2)}\nTarget: ${controls.target.x.toFixed(2)}, ${controls.target.y.toFixed(2)}, ${controls.target.z.toFixed(2)}`);
  }
  if (e.key === 'Escape') {
    zoomOut();
  }
});

let time = 0;
function animate() {
  requestAnimationFrame(animate);

  if (!isZoomedIn) {
    time += 0.01;
    islandGroup.position.y = Math.sin(time * styleSettings.bobSpeed) * styleSettings.bobHeight;
    islandGroup.rotation.y = Math.sin(time * styleSettings.wiggleSpeed) * styleSettings.wiggleAngle;

    if (!isTransitioning) {
      controls.enabled = !gui._hidden;
    }
  } else {
    islandGroup.position.y = THREE.MathUtils.lerp(islandGroup.position.y, 0, 0.05);
    islandGroup.rotation.y = THREE.MathUtils.lerp(islandGroup.rotation.y, 0, 0.05);
  }

  if (isTransitioning) {
    const targetPos = isZoomedIn ? monitorPosition : panoramaPosition;
    const targetLook = isZoomedIn ? monitorTarget : panoramaTarget;

    camera.position.lerp(targetPos, styleSettings.zoomSpeed);
    controls.target.lerp(targetLook, styleSettings.zoomSpeed);

    if (camera.position.distanceTo(targetPos) < 0.005) {
      isTransitioning = false;
      camera.position.copy(targetPos);
      controls.target.copy(targetLook);
      if (isZoomedIn) {
        if (!isIframeLoaded) {
          isIframeLoaded = true;
          iframe.src = 'https://drland0813.github.io/Portfolio_WindowXP_OS_Site/';
          iframe.style.opacity = '1';

        }
        else {
          iframe.style.transition = 'opacity 0.2s ease-in-out';
          iframe.style.opacity = '1';
        }
      }
    }
  }

  if (effectsSettings.windEnabled) {
    windStreaks.forEach(streak => {
      streak.position.x -= streak.userData.speed * effectsSettings.windSpeed;
      if (streak.position.x < -100) {
        streak.position.x = 100;
        streak.position.y = Math.random() * 80 - 20;
        streak.position.z = (Math.random() - 0.5) * 150;
      }
    });
  }

  if (effectsSettings.leavesEnabled) {
    leaves.forEach(leaf => {
      leaf.position.y -= leaf.userData.speedY;
      leaf.position.x -= leaf.userData.speedX * effectsSettings.windSpeed;
      leaf.position.z += leaf.userData.speedZ;
      leaf.rotation.x += leaf.userData.rotX;
      leaf.rotation.y += leaf.userData.rotY;

      if (leaf.position.y < -30 || leaf.position.x < -100) {
        leaf.position.y = 60 + Math.random() * 20;
        leaf.position.x = (Math.random() - 0.5) * 150;
        leaf.position.z = (Math.random() - 0.5) * 150;
      }
    });
  }

  controls.update();
  renderer.render(scene, camera);
  cssRenderer.render(scene, camera);
};




