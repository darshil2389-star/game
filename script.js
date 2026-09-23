/* =====================================================
   NEXORA 3D BATTLE ARENA
   Complete Game JavaScript
===================================================== */


/* =====================================================
   GAME VARIABLES
===================================================== */

let scene;
let camera;
let renderer;

let player;

let enemies = [];
let bullets = [];

let score = 0;
let health = 100;
let wave = 1;

let gameRunning = false;
let gameOver = false;

let waveSpawning = false;

let keys = {};

let yaw = 0;
let pitch = 0;

let lastTime = 0;


/* =====================================================
   UI ELEMENTS
===================================================== */

const scoreUI = document.getElementById("score");
const waveUI = document.getElementById("wave");
const enemyUI = document.getElementById("enemyCount");

const healthUI = document.getElementById("health");
const healthText = document.getElementById("healthText");

const startScreen =
  document.getElementById("startScreen");

const gameOverScreen =
  document.getElementById("gameOver");

const startButton =
  document.getElementById("startButton");

const restartButton =
  document.getElementById("restartButton");

const finalScore =
  document.getElementById("finalScore");


/* =====================================================
   THREE.JS SCENE
===================================================== */

scene = new THREE.Scene();

scene.background =
  new THREE.Color(0x050509);

scene.fog =
  new THREE.Fog(
    0x050509,
    25,
    110
  );


/* =====================================================
   CAMERA
===================================================== */

camera =
  new THREE.PerspectiveCamera(
    70,
    window.innerWidth /
      window.innerHeight,
    0.1,
    200
  );

camera.position.set(
  0,
  4,
  8
);


/* =====================================================
   RENDERER
===================================================== */

renderer =
  new THREE.WebGLRenderer({
    antialias: true
  });

renderer.setSize(
  window.innerWidth,
  window.innerHeight
);

renderer.setPixelRatio(
  Math.min(
    window.devicePixelRatio,
    2
  )
);

renderer.shadowMap.enabled = true;

renderer.shadowMap.type =
  THREE.PCFSoftShadowMap;

renderer.outputColorSpace =
  THREE.SRGBColorSpace;

document
  .getElementById("game")
  .appendChild(renderer.domElement);


/* =====================================================
   LIGHTING
===================================================== */

const ambientLight =
  new THREE.HemisphereLight(
    0xaaaaff,
    0x111111,
    1.5
  );

scene.add(ambientLight);


const sunLight =
  new THREE.DirectionalLight(
    0xffffff,
    2
  );

sunLight.position.set(
  20,
  35,
  15
);

sunLight.castShadow = true;

sunLight.shadow.mapSize.width = 2048;
sunLight.shadow.mapSize.height = 2048;

scene.add(sunLight);


/* Purple arena light */

const purpleLight =
  new THREE.PointLight(
    0x7c3aed,
    35,
    50
  );

purpleLight.position.set(
  -20,
  8,
  -20
);

scene.add(purpleLight);


/* Blue arena light */

const blueLight =
  new THREE.PointLight(
    0x06b6d4,
    30,
    50
  );

blueLight.position.set(
  20,
  8,
  20
);

scene.add(blueLight);


/* =====================================================
   FLOOR
===================================================== */

const floorGeometry =
  new THREE.PlaneGeometry(
    100,
    100
  );

const floorMaterial =
  new THREE.MeshStandardMaterial({
    color: 0x0a0910,
    roughness: 0.85,
    metalness: 0.15
  });

const floor =
  new THREE.Mesh(
    floorGeometry,
    floorMaterial
  );

floor.rotation.x =
  -Math.PI / 2;

floor.receiveShadow = true;

scene.add(floor);


/* =====================================================
   GRID
===================================================== */

const grid =
  new THREE.GridHelper(
    100,
    50,
    0x7c3aed,
    0x171221
  );

grid.position.y = 0.02;

scene.add(grid);


/* =====================================================
   ARENA WALLS
===================================================== */

function createWall(
  x,
  z,
  width,
  depth
) {

  const geometry =
    new THREE.BoxGeometry(
      width,
      5,
      depth
    );

  const material =
    new THREE.MeshStandardMaterial({
      color: 0x100d18,
      metalness: 0.55,
      roughness: 0.5
    });

  const wall =
    new THREE.Mesh(
      geometry,
      material
    );

  wall.position.set(
    x,
    2.5,
    z
  );

  wall.castShadow = true;
  wall.receiveShadow = true;

  scene.add(wall);
}


createWall(
  0,
  -50,
  100,
  2
);

createWall(
  0,
  50,
  100,
  2
);

createWall(
  -50,
  0,
  2,
  100
);

createWall(
  50,
  0,
  2,
  100
);


/* =====================================================
   ARENA PILLARS
===================================================== */

function createPillar(
  x,
  z
) {

  const geometry =
    new THREE.CylinderGeometry(
      1.2,
      1.2,
      8,
      8
    );

  const material =
    new THREE.MeshStandardMaterial({
      color: 0x21132f,
      emissive: 0x16072c,
      emissiveIntensity: 0.6
    });

  const pillar =
    new THREE.Mesh(
      geometry,
      material
    );

  pillar.position.set(
    x,
    4,
    z
  );

  pillar.castShadow = true;
  pillar.receiveShadow = true;

  scene.add(pillar);
}


const pillarPositions = [
  [-25, -25],
  [0, -25],
  [25, -25],

  [-25, 0],
  [25, 0],

  [-25, 25],
  [0, 25],
  [25, 25]
];


pillarPositions.forEach(
  position => {

    createPillar(
      position[0],
      position[1]
    );

  }
);


/* =====================================================
   PLAYER
===================================================== */

function createPlayer() {

  const group =
    new THREE.Group();


  /* BODY */

  const bodyGeometry =
    new THREE.BoxGeometry(
      1.1,
      1.5,
      0.8
    );

  const bodyMaterial =
    new THREE.MeshStandardMaterial({
      color: 0x7c3aed,
      emissive: 0x25084d,
      emissiveIntensity: 0.65,
      metalness: 0.4,
      roughness: 0.35
    });

  const body =
    new THREE.Mesh(
      bodyGeometry,
      bodyMaterial
    );

  body.position.y = 1.2;

  body.castShadow = true;

  group.add(body);


  /* HEAD */

  const head =
    new THREE.Mesh(
      new THREE.SphereGeometry(
        0.42,
        20,
        20
      ),
      new THREE.MeshStandardMaterial({
        color: 0xded8ff,
        roughness: 0.4
      })
    );

  head.position.y = 2.25;

  head.castShadow = true;

  group.add(head);


  /* HEAD VISOR */

  const visor =
    new THREE.Mesh(
      new THREE.BoxGeometry(
        0.55,
        0.16,
        0.08
      ),
      new THREE.MeshBasicMaterial({
        color: 0x06b6d4
      })
    );

  visor.position.set(
    0,
    2.28,
    -0.39
  );

  group.add(visor);


  /* GUN */

  const gun =
    new THREE.Mesh(
      new THREE.BoxGeometry(
        0.22,
        0.22,
        1.3
      ),
      new THREE.MeshStandardMaterial({
        color: 0x151515,
        metalness: 0.9,
        roughness: 0.2
      })
    );

  gun.position.set(
    0.55,
    1.3,
    -0.75
  );

  gun.castShadow = true;

  group.add(gun);


  /* GUN GLOW */

  const gunLight =
    new THREE.PointLight(
      0x8b5cf6,
      2,
      4
    );

  gunLight.position.set(
    0,
    0,
    -0.8
  );

  gun.add(gunLight);


  group.position.set(
    0,
    0,
    10
  );

  scene.add(group);

  return group;
}


player =
  createPlayer();


/* =====================================================
   ENEMY CREATION
===================================================== */

function createEnemy() {

  const enemy =
    new THREE.Group();


  /* BODY */

  const body =
    new THREE.Mesh(
      new THREE.BoxGeometry(
        1.2,
        1.7,
        1
      ),
      new THREE.MeshStandardMaterial({
        color: 0xef4444,
        emissive: 0x350000,
        emissiveIntensity: 0.7,
        metalness: 0.3,
        roughness: 0.45
      })
    );

  body.position.y = 1.2;

  body.castShadow = true;

  enemy.add(body);


  /* HEAD */

  const head =
    new THREE.Mesh(
      new THREE.SphereGeometry(
        0.45,
        18,
        18
      ),
      new THREE.MeshStandardMaterial({
        color: 0xff7777
      })
    );

  head.position.y = 2.35;

  head.castShadow = true;

  enemy.add(head);


  /* EYE */

  const eye =
    new THREE.Mesh(
      new THREE.BoxGeometry(
        0.5,
        0.12,
        0.08
      ),
      new THREE.MeshBasicMaterial({
        color: 0xffcc00
      })
    );

  eye.position.set(
    0,
    2.35,
    -0.4
  );

  enemy.add(eye);


  /* RANDOM SPAWN */

  const angle =
    Math.random() *
    Math.PI *
    2;

  const distance =
    28 +
    Math.random() * 15;


  enemy.position.set(
    player.position.x +
      Math.cos(angle) *
      distance,

    0,

    player.position.z +
      Math.sin(angle) *
      distance
  );


  /* ENEMY DATA */

  enemy.userData = {

    health: 3,

    maxHealth: 3,

    speed:
      0.025 +
      Math.random() *
      0.02,

    attackCooldown: 0

  };


  scene.add(enemy);

  enemies.push(enemy);

  updateEnemyUI();
}


/* =====================================================
   SPAWN WAVE
===================================================== */

function spawnWave() {

  if (
    waveSpawning ||
    !gameRunning ||
    gameOver
  ) {
    return;
  }


  waveSpawning = true;


  waveUI.textContent =
    wave;


  const amount =
    Math.min(
      4 + wave * 2,
      20
    );


  let spawned = 0;


  const spawnTimer =
    setInterval(
      () => {

        if (
          !gameRunning ||
          gameOver
        ) {

          clearInterval(
            spawnTimer
          );

          waveSpawning = false;

          return;
        }


        createEnemy();

        spawned++;


        if (
          spawned >= amount
        ) {

          clearInterval(
            spawnTimer
          );

          waveSpawning = false;

        }

      },
      220
    );
}


/* =====================================================
   SHOOT
===================================================== */

function shoot() {

  if (
    !gameRunning ||
    gameOver
  ) {
    return;
  }


  const direction =
    new THREE.Vector3();


  camera.getWorldDirection(
    direction
  );


  const bullet =
    new THREE.Mesh(
      new THREE.SphereGeometry(
        0.13,
        10,
        10
      ),
      new THREE.MeshBasicMaterial({
        color: 0xa78bfa
      })
    );


  bullet.position.copy(
    camera.position
  );


  bullet.userData = {

    velocity:
      direction.multiplyScalar(
        0.9
      ),

    life: 100

  };


  scene.add(bullet);

  bullets.push(bullet);
}


/* =====================================================
   BULLET UPDATE
===================================================== */

function updateBullets() {

  for (
    let i = bullets.length - 1;
    i >= 0;
    i--
  ) {

    const bullet =
      bullets[i];


    bullet.position.add(
      bullet.userData.velocity
    );


    bullet.userData.life--;


    let hit = false;


    for (
      let j = enemies.length - 1;
      j >= 0;
      j--
    ) {

      const enemy =
        enemies[j];


      const target =
        enemy.position.clone();


      target.y += 1;


      const distance =
        bullet.position.distanceTo(
          target
        );


      if (
        distance < 1.25
      ) {

        enemy.userData.health--;

        hit = true;


        if (
          enemy.userData.health <= 0
        ) {

          removeEnemy(
            j
          );

          score += 100;

          scoreUI.textContent =
            score;

        }

        break;
      }

    }


    if (
      hit ||
      bullet.userData.life <= 0
    ) {

      scene.remove(
        bullet
      );

      bullets.splice(
        i,
        1
      );

    }

  }


  updateEnemyUI();
}


/* =====================================================
   REMOVE ENEMY
===================================================== */

function removeEnemy(index) {

  const enemy =
    enemies[index];


  if (!enemy)
    return;


  scene.remove(
    enemy
  );


  enemies.splice(
    index,
    1
  );
}


/* =====================================================
   ENEMY AI
===================================================== */

function updateEnemies(delta) {

  for (
    let i = enemies.length - 1;
    i >= 0;
    i--
  ) {

    const enemy =
      enemies[i];


    const dx =
      player.position.x -
      enemy.position.x;


    const dz =
      player.position.z -
      enemy.position.z;


    const distance =
      Math.sqrt(
        dx * dx +
        dz * dz
      );


    /* MOVE */

    if (
      distance > 2.4
    ) {

      enemy.position.x +=
        (dx / distance) *
        enemy.userData.speed *
        delta *
        60;


      enemy.position.z +=
        (dz / distance) *
        enemy.userData.speed *
        delta *
        60;

    }


    /* LOOK AT PLAYER */

    enemy.lookAt(
      player.position.x,
      1,
      player.position.z
    );


    /* ATTACK */

    if (
      distance <= 2.4
    ) {

      enemy.userData.attackCooldown -=
        delta;


      if (
        enemy.userData.attackCooldown <= 0
      ) {

        damagePlayer(8);

        enemy.userData.attackCooldown =
          0.8;

      }

    }

  }

}


/* =====================================================
   DAMAGE PLAYER
===================================================== */

function damagePlayer(amount) {

  if (
    gameOver
  ) {
    return;
  }


  health -= amount;


  health =
    Math.max(
      0,
      health
    );


  updateHealth();


  if (
    health <= 0
  ) {

    endGame();

  }

}


/* =====================================================
   PLAYER MOVEMENT
===================================================== */

function updatePlayer(delta) {

  if (!player)
    return;


  const speed =
    8 * delta;


  let forward = 0;
  let side = 0;


  if (
    keys["w"] ||
    keys["arrowup"]
  ) {
    forward++;
  }


  if (
    keys["s"] ||
    keys["arrowdown"]
  ) {
    forward--;
  }


  if (
    keys["a"] ||
    keys["arrowleft"]
  ) {
    side--;
  }


  if (
    keys["d"] ||
    keys["arrowright"]
  ) {
    side++;
  }


  const forwardVector =
    new THREE.Vector3(
      -Math.sin(yaw),
      0,
      -Math.cos(yaw)
    );


  const sideVector =
    new THREE.Vector3(
      Math.cos(yaw),
      0,
      -Math.sin(yaw)
    );


  player.position.add(
    forwardVector.multiplyScalar(
      forward * speed
    )
  );


  player.position.add(
    sideVector.multiplyScalar(
      side * speed
    )
  );


  /* ARENA LIMIT */

  player.position.x =
    THREE.MathUtils.clamp(
      player.position.x,
      -46,
      46
    );


  player.position.z =
    THREE.MathUtils.clamp(
      player.position.z,
      -46,
      46
    );


  /* PLAYER ROTATION */

  player.rotation.y =
    yaw;
}


/* =====================================================
   CAMERA
===================================================== */

function updateCamera() {

  const distance = 7;


  camera.position.x =
    player.position.x +
    Math.sin(yaw) *
    distance;


  camera.position.z =
    player.position.z +
    Math.cos(yaw) *
    distance;


  camera.position.y =
    4.5 +
    pitch * 2;


  camera.lookAt(
    player.position.x,
    1.5,
    player.position.z
  );
}


/* =====================================================
   HEALTH UI
===================================================== */

function updateHealth() {

  if (healthUI) {

    healthUI.style.width =
      health + "%";

  }


  if (healthText) {

    healthText.textContent =
      Math.ceil(
        health
      );

  }

}


/* =====================================================
   ENEMY UI
===================================================== */

function updateEnemyUI() {

  if (enemyUI) {

    enemyUI.textContent =
      enemies.length;

  }

}


/* =====================================================
   START GAME
===================================================== */

function startGame() {

  if (gameRunning)
    return;


  gameRunning = true;

  gameOver = false;

  score = 0;

  health = 100;

  wave = 1;


  scoreUI.textContent =
    score;

  waveUI.textContent =
    wave;


  updateHealth();

  updateEnemyUI();


  if (startScreen) {

    startScreen.style.display =
      "none";

  }


  if (
    renderer &&
    renderer.domElement
  ) {

    renderer.domElement.requestPointerLock();

  }


  spawnWave();
}


/* =====================================================
   END GAME
===================================================== */

function endGame() {

  if (gameOver)
    return;


  gameOver = true;

  gameRunning = false;


  if (
    document.pointerLockElement
  ) {

    document.exitPointerLock();

  }


  if (finalScore) {

    finalScore.textContent =
      score;

  }


  if (gameOverScreen) {

    gameOverScreen.style.display =
      "flex";

  }

}


/* =====================================================
   RESTART
===================================================== */

function restartGame() {

  location.reload();

}


/* =====================================================
   KEYBOARD DOWN
===================================================== */

window.addEventListener(
  "keydown",
  function(event) {

    keys[
      event.key.toLowerCase()
    ] = true;


    /* Prevent page scrolling */

    if (
      [
        "w",
        "a",
        "s",
        "d",
        "arrowup",
        "arrowdown",
        "arrowleft",
        "arrowright",
        " "
      ].includes(
        event.key.toLowerCase()
      )
    ) {

      event.preventDefault();

    }

  }
);


/* =====================================================
   KEYBOARD UP
===================================================== */

window.addEventListener(
  "keyup",
  function(event) {

    keys[
      event.key.toLowerCase()
    ] = false;

  }
);


/* =====================================================
   MOUSE AIM
===================================================== */

document.addEventListener(
  "mousemove",
  function(event) {

    if (
      document.pointerLockElement !==
      renderer.domElement
    ) {

      return;

    }


    yaw -=
      event.movementX *
      0.002;


    pitch -=
      event.movementY *
      0.001;


    pitch =
      THREE.MathUtils.clamp(
        pitch,
        -0.8,
        0.8
      );

  }
);


/* =====================================================
   MOUSE CLICK / SHOOT
===================================================== */

renderer.domElement.addEventListener(
  "mousedown",
  function(event) {

    if (
      event.button !== 0
    ) {

      return;

    }


    if (
      document.pointerLockElement !==
      renderer.domElement
    ) {

      renderer.domElement.requestPointerLock();

      return;

    }


    shoot();

  }
);


/* =====================================================
   START BUTTON
===================================================== */

if (startButton) {

  startButton.addEventListener(
    "click",
    startGame
  );

}


/* =====================================================
   RESTART BUTTON
===================================================== */

if (restartButton) {

  restartButton.addEventListener(
    "click",
    restartGame
  );

}


/* =====================================================
   WINDOW RESIZE
===================================================== */

window.addEventListener(
  "resize",
  function() {

    camera.aspect =
      window.innerWidth /
      window.innerHeight;


    camera.updateProjectionMatrix();


    renderer.setSize(
      window.innerWidth,
      window.innerHeight
    );

  }
);


/* =====================================================
   GAME LOOP
===================================================== */

function animate(currentTime) {

  requestAnimationFrame(
    animate
  );


  const delta =
    Math.min(
      (currentTime - lastTime) /
        1000,
      0.05
    );


  lastTime =
    currentTime;


  if (
    gameRunning &&
    !gameOver
  ) {

    updatePlayer(
      delta
    );


    updateCamera();


    updateEnemies(
      delta
    );


    updateBullets();


    /* =================================================
       NEXT WAVE
    ================================================= */

    if (
      enemies.length === 0 &&
      !waveSpawning
    ) {

      wave++;

      waveUI.textContent =
        wave;


      setTimeout(
        function() {

          if (
            gameRunning &&
            !gameOver
          ) {

            spawnWave();

          }

        },
        1200
      );

    }

  }


  renderer.render(
    scene,
    camera
  );

}


/* =====================================================
   INITIAL UI
===================================================== */

updateHealth();

updateEnemyUI();


/* =====================================================
   START RENDER LOOP
===================================================== */

animate(0);
