/* =========================================================
   CoreLink — fixed full-viewport 3D background
   The drone / FPGA-chip scene never scrolls. It is pinned
   behind the page and driven by overall scroll progress,
   while content panels scroll up over it.
   ========================================================= */

(function () {
  "use strict";

  var sceneBg = document.getElementById("sceneBg");
  var canvas = document.getElementById("drone-canvas");
  if (!sceneBg || !canvas || typeof THREE === "undefined") return;

  var scrollHint = document.getElementById("sceneScrollhint");
  var hudStatus = document.getElementById("hudStatus");
  var hudLatency = document.getElementById("hudLatency");
  var hudModule = document.getElementById("hudModule");

  /* ---------- renderer / scene / camera ---------- */
  var renderer;
  try {
    renderer = new THREE.WebGLRenderer({
      canvas: canvas,
      antialias: true,
      alpha: true
    });
  } catch (e) {
    sceneBg.classList.add("no-webgl");
    return;
  }
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.shadowMap.enabled = true;

  var scene = new THREE.Scene();

  var camera = new THREE.PerspectiveCamera(42, 1, 0.1, 100);
  camera.position.set(0, 1.1, 10);
  camera.lookAt(0, 0, 0);

  /* ---------- lights ---------- */
  var hemi = new THREE.HemisphereLight(0xdfe8ff, 0x0a1842, 0.8);
  scene.add(hemi);

  var key = new THREE.DirectionalLight(0xffffff, 0.95);
  key.position.set(4, 8, 6);
  scene.add(key);

  var rim = new THREE.DirectionalLight(0x9fc0ff, 0.9);
  rim.position.set(-6, 2, -5);
  scene.add(rim);

  var blueFill = new THREE.DirectionalLight(0x1a3bb0, 0.45);
  blueFill.position.set(-5, -2, -4);
  scene.add(blueFill);

  var orange = new THREE.PointLight(0xff7a1a, 1.6, 16);
  orange.position.set(0, 0.5, 3);
  scene.add(orange);

  /* ---------- shared materials ---------- */
  var matBody = new THREE.MeshPhongMaterial({ color: 0x1a3bb0, specular: 0x9fc0ff, shininess: 60 });
  var matBodyDark = new THREE.MeshPhongMaterial({ color: 0x142f8f, specular: 0x7aa0ff, shininess: 50 });
  var matAccent = new THREE.MeshPhongMaterial({ color: 0xff7a1a, emissive: 0x7a2c00, specular: 0xffc08a, shininess: 80 });
  var matDark = new THREE.MeshPhongMaterial({ color: 0x0d1a4d, specular: 0x4456a0, shininess: 40 });
  var matRotor = new THREE.MeshPhongMaterial({
    color: 0x7d93d8, transparent: true, opacity: 0.6, specular: 0xffffff, shininess: 90, side: THREE.DoubleSide
  });
  var matGlass = new THREE.MeshPhongMaterial({
    color: 0x8fa4e0, specular: 0xffffff, shininess: 120, transparent: true, opacity: 0.85
  });
  var matGold = new THREE.MeshPhongMaterial({ color: 0xffcf6e, specular: 0xffffff, shininess: 110 });
  var matBoard = new THREE.MeshPhongMaterial({ color: 0x0f3b2e, specular: 0x66ffcc, shininess: 40 });
  var matDie = new THREE.MeshPhongMaterial({ color: 0x16224a, emissive: 0x1a3bb0, emissiveIntensity: 0.5, specular: 0xffffff, shininess: 100 });
  var matGlow = new THREE.MeshPhongMaterial({ color: 0xff8a3d, emissive: 0xff5a00, emissiveIntensity: 1.1, specular: 0xffffff, shininess: 140 });

  /* =========================================================
     DRONE — assembled around world origin
     ========================================================= */
  var drone = new THREE.Group();
  scene.add(drone);

  function addPart(mesh, name, kind) {
    mesh.userData.name = name;
    mesh.userData.kind = kind || "body";
    mesh.userData.basePos = mesh.position.clone();
    mesh.userData.baseQuat = mesh.quaternion.clone();
    drone.add(mesh);
    return mesh;
  }

  var body = addPart(new THREE.Mesh(new THREE.BoxGeometry(1.5, 0.34, 1.5), matBody), "body", "body");
  var topPlate = addPart(new THREE.Mesh(new THREE.BoxGeometry(0.82, 0.1, 0.82), matBodyDark), "topPlate", "top");
  topPlate.position.y = 0.22;
  var belly = addPart(new THREE.Mesh(new THREE.BoxGeometry(0.9, 0.12, 0.9), matDark), "belly", "belly");
  belly.position.y = -0.22;

  var sensor = addPart(new THREE.Mesh(new THREE.SphereGeometry(0.16, 24, 24), matAccent), "sensor", "sensor");
  sensor.position.y = 0.36;

  var camHousing = addPart(new THREE.Mesh(new THREE.SphereGeometry(0.22, 20, 20), matGlass), "camHousing", "cam");
  camHousing.position.set(0, -0.34, 0.55);
  camHousing.scale.set(1, 0.6, 0.8);
  var camLens = addPart(new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.1, 0.06, 16), matAccent), "camLens", "cam");
  camLens.rotation.x = Math.PI / 2;
  camLens.position.set(0, -0.34, 0.42);

  var armDefs = [
    { ang: Math.PI * 0.25, len: 1.35 },
    { ang: Math.PI * 0.75, len: 1.35 },
    { ang: Math.PI * 1.25, len: 1.35 },
    { ang: Math.PI * 1.75, len: 1.35 }
  ];

  var arms = [];
  armDefs.forEach(function (def) {
    var g = new THREE.Group();

    var arm = new THREE.Mesh(new THREE.BoxGeometry(1.35, 0.09, 0.16), matBodyDark);
    arm.position.x = 0.55;
    g.add(arm);

    var motor = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.13, 0.14, 18), matDark);
    motor.position.x = 1.22;
    g.add(motor);

    var rotorHub = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.04, 0.06, 12), matAccent);
    rotorHub.position.x = 1.22;
    rotorHub.position.y = 0.1;
    g.add(rotorHub);

    var rotor = new THREE.Mesh(new THREE.CylinderGeometry(0.42, 0.42, 0.012, 24), matRotor);
    rotor.position.x = 1.22;
    rotor.position.y = 0.13;
    g.add(rotor);

    g.rotation.y = def.ang;
    g.position.set(0, 0.04, 0);
    var mesh = addPart(g, "arm", "arm");
    mesh.userData.armAngle = def.ang;
    mesh.userData.rotor = rotor;
    mesh.userData.motor = motor;
    arms.push(mesh);
  });

  var skidA = addPart(new THREE.Mesh(new THREE.BoxGeometry(1.3, 0.07, 0.1), matDark), "skidA", "skid");
  skidA.position.set(0, -0.46, 0.42);
  var skidB = skidA.clone();
  skidB.userData.name = "skidB";
  skidB.userData.kind = "skid";
  skidB.position.set(0, -0.46, -0.42);
  drone.add(skidB);

  drone.children.forEach(function (p) {
    p.userData.basePos = p.position.clone();
    p.userData.baseQuat = p.quaternion.clone();
  });

  /* =========================================================
     CHIP — hidden, scattered; assembles in phase C
     ========================================================= */
  var chip = new THREE.Group();
  scene.add(chip);

  var chipParts = [];

  function scatter(mesh, spread) {
    mesh.userData.basePos = mesh.position.clone();
    mesh.userData.baseQuat = mesh.quaternion.clone();
    mesh.userData.scatterPos = mesh.position.clone().add(new THREE.Vector3(
      (Math.random() - 0.5) * spread,
      (Math.random() - 0.5) * spread + 2.2,
      (Math.random() - 0.5) * spread
    ));
    mesh.userData.scatterQuat = new THREE.Quaternion().setFromEuler(new THREE.Euler(
      (Math.random() - 0.5) * Math.PI,
      (Math.random() - 0.5) * Math.PI,
      (Math.random() - 0.5) * Math.PI
    ));
    chip.add(mesh);
    chipParts.push(mesh);
    return mesh;
  }

  var board = scatter(new THREE.Mesh(new THREE.BoxGeometry(2.6, 0.14, 1.8), matBoard), 8);
  var boardEdge = scatter(new THREE.Mesh(new THREE.BoxGeometry(2.66, 0.04, 1.86), matGold), 9);
  boardEdge.position.y = -0.09;
  var die = scatter(new THREE.Mesh(new THREE.BoxGeometry(0.9, 0.16, 0.9), matDie), 7);
  die.position.y = 0.14;
  var dieGlow = scatter(new THREE.Mesh(new THREE.BoxGeometry(1.0, 0.03, 1.0), matGlow), 7);
  dieGlow.position.y = 0.24;

  var pinPositions = [];
  for (var i = 0; i < 6; i++) {
    pinPositions.push(new THREE.Vector3(-0.55, 0.06, -0.6 + i * 0.24));
    pinPositions.push(new THREE.Vector3(0.55, 0.06, -0.6 + i * 0.24));
    pinPositions.push(new THREE.Vector3(-0.6 + i * 0.24, 0.06, -0.55));
    pinPositions.push(new THREE.Vector3(-0.6 + i * 0.24, 0.06, 0.55));
  }
  pinPositions.forEach(function (pos) {
    var pin = scatter(new THREE.Mesh(new THREE.BoxGeometry(0.05, 0.12, 0.05), matGold), 8);
    pin.position.copy(pos);
    pin.userData.basePos = pin.position.clone();
  });

  var core = scatter(new THREE.Mesh(new THREE.SphereGeometry(0.16, 20, 20), matGlow), 6);
  core.position.y = 0.34;
  core.userData.isCore = true;

  var chipSpot = new THREE.PointLight(0xff7a1a, 0, 8);
  chipSpot.position.set(0, 1.2, 1.6);
  scene.add(chipSpot);

  var droneRing = new THREE.Mesh(
    new THREE.RingGeometry(2.0, 2.12, 48),
    new THREE.MeshBasicMaterial({ color: 0xff7a1a, transparent: true, opacity: 0.28, side: THREE.DoubleSide })
  );
  droneRing.rotation.x = -Math.PI / 2;
  droneRing.position.y = -0.55;
  scene.add(droneRing);

  var ring = new THREE.Mesh(
    new THREE.RingGeometry(1.7, 1.86, 48),
    new THREE.MeshBasicMaterial({ color: 0xff7a1a, transparent: true, opacity: 0.18, side: THREE.DoubleSide })
  );
  ring.rotation.x = -Math.PI / 2;
  ring.position.y = -0.1;
  ring.visible = false;
  scene.add(ring);

  var driftParticles = new THREE.Group();
  scene.add(driftParticles);
  var sparks = [];
  for (var s = 0; s < 40; s++) {
    var sp = new THREE.Mesh(
      new THREE.SphereGeometry(0.02, 6, 6),
      new THREE.MeshBasicMaterial({ color: s % 3 ? 0xffa14d : 0x9fc0ff, transparent: true, opacity: 0.8 })
    );
    sp.userData.speed = 0.3 + Math.random() * 0.7;
    sp.userData.radius = 1.6 + Math.random() * 3.2;
    sp.userData.phase = Math.random() * Math.PI * 2;
    sp.userData.lift = 0.2 + Math.random() * 2.4;
    driftParticles.add(sp);
    sparks.push(sp);
  }

  /* =========================================================
     Scroll scrub — whole-page progress
     ========================================================= */
  var progress = 0;      // eased
  var target = 0;
  var clock = new THREE.Clock();
  var rafId = null;
  var running = true;

  function clamp01(v) { return Math.max(0, Math.min(1, v)); }

  function ease(t) { return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2; }

  function key(start, end, p) {
    if (p <= start) return 0;
    if (p >= end) return 1;
    return ease((p - start) / (end - start));
  }

  function lerp(a, b, t) {
    return a + (b - a) * t;
  }

  function getProgress() {
    var doc = document.documentElement;
    var max = doc.scrollHeight - window.innerHeight;
    if (max <= 0) return 0;
    return clamp01(window.scrollY / max);
  }

  /* UI HUD stages */
  function updateHud(p) {
    var stage = p < 0.12 ? 0 : (p < 0.42 ? 1 : 2);
    if (p < 0.04) {
      scrollHint.classList.remove("hidden");
    } else {
      scrollHint.classList.add("hidden");
    }

    if (stage === 0) {
      hudStatus.textContent = "LINK ACQUIRED";
      hudLatency.textContent = "LIVE · —";
      hudModule.textContent = "GENX320";
    } else if (stage === 1) {
      hudStatus.textContent = "DISASSEMBLING";
      hudLatency.textContent = "X-RAY";
      hudModule.textContent = "GENX320";
    } else {
      hudStatus.textContent = "CORE EXPOSED";
      hudLatency.textContent = "<1 MS";
      hudModule.textContent = "ZYNQ US+";
    }
  }

  function update(dt) {
    progress += (target - progress) * Math.min(1, dt * 3.2);
    var p = progress;
    var t = clock.getElapsedTime();

    /* --- DRONE state --- */
    var decompose = key(0.10, 0.38, p);   // parts fly apart
    var vanish = key(0.30, 0.50, p);      // drone fades out
    drone.visible = p < 0.56;
    if (drone.visible) {
      drone.traverse(function (o) {
        if (o.isMesh && o.material.transparent) o.material.opacity = 0.55 * (1 - vanish);
      });
    }

    var rotY = p * Math.PI * 1.6;
    var bob = Math.sin(t * 1.6) * 0.09;
    var wholeQuat = new THREE.Quaternion().setFromEuler(new THREE.Euler(0, rotY * 0.5, 0));

    var decStrength = decompose;
    var parts = drone.children;
    parts.forEach(function (part) {
      var bq = part.userData.baseQuat;
      var bp = part.userData.basePos;
      var q = bq.clone();
      var pos = bp.clone();
      var kind = part.userData.kind;

      if (kind === "arm") {
        var ang = part.userData.armAngle;
        pos.x += Math.cos(ang) * decStrength * 2.6;
        pos.z += Math.sin(ang) * decStrength * 2.6;
        pos.y += decStrength * 0.7;
        q.multiply(new THREE.Quaternion().setFromEuler(new THREE.Euler(
          decStrength * 0.5, 0, decStrength * 0.9
        )));
        var rotor = part.userData.rotor;
        if (rotor) {
          rotor.rotation.y = t * 40 + decStrength * 6;
          rotor.position.y = 0.13 + decStrength * 0.9;
        }
      } else if (kind === "sensor") {
        pos.y += decStrength * 2.0;
        q.multiply(new THREE.Quaternion().setFromEuler(new THREE.Euler(decStrength * 0.4, 0, 0)));
      } else if (kind === "top") {
        pos.y += decStrength * 1.2;
        q.multiply(new THREE.Quaternion().setFromEuler(new THREE.Euler(decStrength * 0.6, 0, 0)));
      } else if (kind === "belly") {
        pos.y -= decStrength * 0.5;
      } else if (kind === "cam") {
        pos.y -= decStrength * 1.6;
        q.multiply(new THREE.Quaternion().setFromEuler(new THREE.Euler(0, 0, decStrength * 0.6)));
      } else if (kind === "skid") {
        pos.y -= decStrength * 2.0;
      } else {
        pos.y -= decStrength * 0.4;
        q.multiply(new THREE.Quaternion().setFromEuler(new THREE.Euler(0, 0, decStrength * 0.5)));
      }

      part.position.copy(pos);
      part.quaternion.copy(q);
    });

    drone.position.y = bob * (1 - decompose);
    drone.quaternion.copy(wholeQuat);

    /* --- CHIP state --- */
    var assemble = key(0.44, 0.74, p);
    var glowPulse = 0.5 + 0.5 * Math.sin(t * 3.4);

    chip.visible = assemble > 0.001;
    if (chip.visible) {
      chip.quaternion.copy(new THREE.Quaternion().setFromEuler(new THREE.Euler(
        Math.sin(t * 0.5) * 0.12,
        p * Math.PI * 2.2,
        Math.cos(t * 0.4) * 0.08
      )));
      chip.position.y = Math.sin(t * 1.1) * 0.06 * assemble;

      chipParts.forEach(function (part) {
        var bq = part.userData.baseQuat;
        var bp = part.userData.basePos;
        var sp = part.userData.scatterPos;
        var sq = part.userData.scatterQuat;
        part.position.copy(bp.clone().lerp(sp, 1 - ease(assemble)));
        part.quaternion.copy(bq.clone().slerp(sq, 1 - ease(assemble)));
        if (part.userData.isCore) {
          part.material.emissiveIntensity = 1.1 + glowPulse;
          part.scale.setScalar(1 + glowPulse * 0.12);
        }
      });

      chipSpot.intensity = assemble * (1.4 + glowPulse);
      ring.visible = assemble > 0.5;
      if (ring.visible) ring.material.opacity = 0.1 + glowPulse * 0.16 * assemble;
    } else {
      chipSpot.intensity = 0;
    }

    /* sparks */
    var sparkOn = assemble;
    sparks.forEach(function (sp) {
      var st = t * sp.userData.speed + sp.userData.phase;
      var r = sp.userData.radius;
      sp.position.set(
        Math.cos(st) * r,
        sp.userData.lift + Math.sin(st * 1.7) * 0.5,
        Math.sin(st) * r
      );
      sp.material.opacity = sparkOn * 0.8 * (0.5 + 0.5 * Math.sin(st * 3));
      sp.visible = sparkOn > 0.05;
    });

    /* camera sway */
    camera.position.x = Math.sin(p * Math.PI * 2) * 0.7;
    camera.position.y = 1.1 + Math.sin(p * Math.PI * 1.4) * 0.35;
    camera.lookAt(0, 0, 0);

    renderer.render(scene, camera);
  }

  function loop() {
    if (!running) return;
    var dt = Math.min(clock.getDelta(), 0.05);
    update(dt);
    rafId = requestAnimationFrame(loop);
  }

  function onScroll() {
    target = getProgress();
    updateHud(target);
  }

  function onResize() {
    var w = canvas.clientWidth;
    var h = canvas.clientHeight;
    renderer.setSize(w, h, false);
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
  }

  window.addEventListener("scroll", onScroll, { passive: true });
  window.addEventListener("resize", onResize);

  onResize();
  onScroll();
  loop();
})();
