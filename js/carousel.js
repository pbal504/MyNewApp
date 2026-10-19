// The step-by-step cutaway animation of the merry-go-round.
(function (M) {
  "use strict";

  const P = M.palette;
  const TAU = M.TAU;

  // ----- Scene geometry (logical canvas units) -----
  const W = 960, H = 620, CX = 480;
  const TILT = 0.18;               // how "flat" circles look (view from slightly above)
  const PLAT_Y = 385, PLAT_R = 300, PLAT_T = 16;
  const CANOPY_Y = 95, CANOPY_R = 325, SKIRT = 24, PEAK_Y = 22;
  const CRANK_Y = 107;
  const BAY = { x: 130, y: 470, w: 700, h: 134 };
  const RING = { x: CX, y: 522, r: 120 };
  const PINION = { x: CX + 132 * Math.cos(0.42), y: RING.y + 132 * TILT * Math.sin(0.42) };
  const GEARBOX = { x: 568, y: 548, w: 76, h: 44 };
  const GB_PULLEY = { x: 670, y: 570, r: 17 };
  const MOTOR_PULLEY = { x: 736, y: 562, r: 8 };
  const MOTOR = { x: 746, y: 536, w: 72, h: 54 };
  const BRAKE = { x: CX - RING.r - 26, y: RING.y };

  const OUTER_R = 262, INNER_R = 170;
  const LINES = 8;
  const CRANK_RATIO = 3;           // crank turns per platform revolution
  const THROW = 13;                // crank throw radius = half the horse's travel
  const CRUISE = 0.6;              // platform angular speed in rad/s (≈5.7 RPM)
  const MOTOR_VIS = 22;            // motor pulley spin used for drawing
  const REAL_OUTER_M = 7.5, REAL_INNER_M = 5; // pretend real-world radii

  const horses = [];
  for (let i = 0; i < LINES; i++) {
    const base = (i * TAU) / LINES;
    const phase = (i * 3 * Math.PI) / 4;
    horses.push({ line: i, base: base, R: OUTER_R, phase: phase, s: 1, c: M.horseColors[i % 8] });
    horses.push({ line: i, base: base, R: INNER_R, phase: phase + Math.PI, s: 0.82, c: M.horseColors[(i + 3) % 8] });
  }
  const TRACKED = horses[0];

  // ----- Steps -----
  const STEPS = [
    {
      title: "Meet the machine",
      motor: false, engaged: false, brake: false, xray: false,
      focus: ["motor", "gearbox", "ringGear", "platform", "centerPole", "crownGear", "cranks", "horses", "canopy"],
      text:
        "<p>A merry-go-round (or <strong>carousel</strong>) is a chain of simple machines. Each part hands motion to the next one.</p>" +
        "<p>The bottom of this picture is a <strong>cutaway</strong>: we've removed the floor so you can see the drive machinery hidden under the platform.</p>" +
        "<p>Press <strong>Next</strong> or <strong>Auto-tour</strong> to start it up.</p>",
      formula: "Energy path: <b>electricity → motor → belt → gearbox → ring gear → platform → cranks → horses</b>",
    },
    {
      title: "Power up the electric motor",
      motor: true, engaged: false, brake: false, xray: false,
      focus: ["motor"],
      text:
        "<p>The <strong>electric motor</strong> turns electrical energy into spinning motion. It spins its shaft very fast, around <strong>1,750 RPM</strong>, but with only a little twisting force (<strong>torque</strong>).</p>" +
        "<p>The clutch is still open, so the motor can get up to speed without jerking the heavy platform, a bit like revving a car in neutral.</p>",
      formula: "<b>Power = Torque × Angular speed</b> (P = τ · ω). The motor gives lots of speed but not much torque.",
    },
    {
      title: "Belt & gearbox trade speed for torque",
      motor: true, engaged: true, brake: false, xray: false,
      focus: ["belt", "gearbox"],
      text:
        "<p>The clutch engages. A <strong>belt</strong> carries the motion from the motor's <em>small</em> pulley to the gearbox's <em>big</em> pulley, so the big one turns slower but with more force.</p>" +
        "<p>Inside the <strong>gearbox</strong>, more gears keep slowing things down. Each time the speed drops, the torque goes up by the same factor (minus a little friction). Now there's enough force to move several tonnes of platform, horses and riders.</p>",
      formula: "Pulley ratio = big ÷ small. A 20 cm pulley driven by a 9 cm pulley turns <b>≈ 2.2× slower</b> with <b>≈ 2.2× more torque</b>.",
    },
    {
      title: "The pinion drives the ring gear",
      motor: true, engaged: true, brake: false, xray: false,
      focus: ["pinion", "ringGear"],
      text:
        "<p>The gearbox's output shaft points straight up and carries a small gear called the <strong>pinion</strong>. Its teeth mesh with a huge <strong>ring gear</strong> fixed to the underside of the platform.</p>" +
        "<p>Because the ring gear has many more teeth, the pinion must spin many times to turn the platform once. That's the final, biggest speed reduction.</p>",
      formula: "Gear ratio = <b>ring teeth ÷ pinion teeth</b>. 120 ÷ 12 = <b>10 pinion turns for 1 platform turn</b>.",
    },
    {
      title: "The platform turns around a fixed center pole",
      motor: true, engaged: true, brake: false, xray: false,
      focus: ["platform", "bearing", "centerPole"],
      text:
        "<p>The <strong>center pole</strong> never moves. It's the axle everything rotates around. A large <strong>bearing</strong> (rings of steel balls or rollers) lets the platform glide around it with very little friction.</p>" +
        "<p>Watch the speed readout: the platform speeds up <em>gradually</em>. All that mass has a big <strong>moment of inertia</strong>, so it resists changes in rotation. A gentle start is also safer for riders.</p>",
      formula: "Rotational Newton's 2nd law: <b>τ = I · α</b>. Big inertia <b>I</b> → small angular acceleration <b>α</b>.",
    },
    {
      title: "The stationary crown gear turns the cranks",
      motor: true, engaged: true, brake: false, xray: true,
      focus: ["crownGear", "cranks"],
      text:
        "<p>X-ray view on! Hidden in the canopy, a <strong>crown gear</strong> is bolted to the top of the center pole, so it <em>never turns</em>.</p>" +
        "<p>Long <strong>crankshafts</strong> run outward like spokes and are carried around with the ride. Each has a small gear on its inner end that meshes with the still crown gear. As it's carried around, the small gear is forced to <strong>roll</strong> around the crown gear, spinning its crankshaft.</p>",
      formula: "Crank turns per lap = <b>crown teeth ÷ pinion teeth</b>. In this model, <b>3 gallops per lap</b>.",
    },
    {
      title: "Cranks make the horses gallop",
      motor: true, engaged: true, brake: false, xray: true, graph: true,
      focus: ["horses", "cranks"],
      text:
        "<p>Each crankshaft has offset bends called <strong>throws</strong>. A horse's pole hangs from a throw, so when the crank turns, the pole is lifted and lowered. Rotation becomes <strong>up-and-down motion</strong>, the same trick a bike pedal or car engine uses, in reverse.</p>" +
        "<p>The graph tracks the ⭐ horse: its height follows a smooth <strong>sine wave</strong>. Inner and outer horses on the same crank are offset by half a turn, so one rises while the other falls.</p>",
      formula: "Height <b>h ≈ A · sin(θ)</b>, where A is the throw radius and θ is the crank angle.",
    },
    {
      title: "Feel the physics: speed & force",
      motor: true, engaged: true, brake: false, xray: false, arrows: true,
      focus: ["horses"],
      text:
        "<p>Every horse completes a lap in the same time: they share one <strong>angular speed ω</strong>. But outer horses travel a bigger circle, so their <strong>linear speed</strong> is higher. Compare the teal arrows and the readouts below.</p>" +
        "<p>To keep moving in a circle you need a force pointing to the <strong>center</strong> (pink arrows), the <strong>centripetal force</strong>. Your grip on the pole provides it. The “push outward” you feel is just your body's <strong>inertia</strong> trying to go straight.</p>",
      formula: "<b>v = ω · r</b> and <b>F = m · ω² · r</b>. Double the radius → double the speed and double the force needed.",
    },
    {
      title: "Brake & stop",
      motor: false, engaged: false, brake: true, xray: false,
      focus: ["brake"],
      text:
        "<p>Ride over! The motor switches off and a <strong>brake</strong> squeezes against the drive (see the glowing pads). <strong>Friction</strong> turns the platform's kinetic energy into heat.</p>" +
        "<p>Like the start, the stop is gradual. Stopping a huge spinning mass suddenly would throw riders forward (inertia again!).</p>",
      formula: "Kinetic energy <b>KE = ½ · I · ω²</b> → heat in the brake pads.",
    },
  ];

  // ----- State -----
  const S = {
    step: 0,
    phi: 0,           // platform rotation angle
    omega: 0,         // platform angular speed
    motorAngle: 0,
    motorOmega: 0,
    gbAngle: 0,       // gearbox input pulley angle
    brakeGlow: 0,
    time: 0,
    playing: true,
    speed: 1,
    labels: true,
    xray: false,
    history: [],
    tour: false,
    tourT: 0,
  };
  const TOUR_STEP_SECONDS = 11;

  // ----- Projection helpers -----
  function proj(r, a, y0) {
    return { x: CX + r * Math.cos(a), y: y0 + r * Math.sin(a) * TILT, z: Math.sin(a) };
  }
  function horseAngle(h) { return h.base - S.phi; }
  function crankAngle() { return S.phi * CRANK_RATIO; }
  function bob(h) { return THROW * Math.sin(crankAngle() + h.phase); }

  function focusOn(id) { return STEPS[S.step].focus.indexOf(id) !== -1; }

  // ----- Update -----
  function update(dt) {
    const st = STEPS[S.step];
    S.time += dt;
    S.motorOmega = M.approach(S.motorOmega, st.motor ? MOTOR_VIS : 0, (st.motor ? 9 : 14) * dt);
    const target = st.engaged ? CRUISE : 0;
    const accel = st.brake ? 0.16 : st.engaged ? 0.08 : 0.03;
    S.omega = M.approach(S.omega, target, accel * dt);
    S.phi += S.omega * dt;
    S.motorAngle += S.motorOmega * dt;
    // The clutch sits inside the gearbox; the gearbox pulley follows the belt.
    S.gbAngle += S.motorOmega * dt * (MOTOR_PULLEY.r / GB_PULLEY.r);
    S.brakeGlow = M.approach(S.brakeGlow, st.brake && S.omega > 0.001 ? 1 : 0, dt * 3);

    S.history.push({ t: S.time, y: bob(TRACKED) });
    while (S.history.length && S.time - S.history[0].t > 5) S.history.shift();

    if (S.tour) {
      S.tourT += dt;
      if (S.tourT >= TOUR_STEP_SECONDS) {
        S.tourT = 0;
        goTo((S.step + 1) % STEPS.length);
      }
    }
  }

  // ----- Drawing: background -----
  function drawBackground(ctx) {
    const sky = ctx.createLinearGradient(0, 0, 0, H);
    sky.addColorStop(0, "#2a0b5e");
    sky.addColorStop(0.45, "#6a1fb8");
    sky.addColorStop(0.72, "#d6338f");
    sky.addColorStop(1, "#ff8c42");
    ctx.fillStyle = sky;
    ctx.fillRect(0, 0, W, H);

    // Twinkling stars
    for (let i = 0; i < 40; i++) {
      const x = (i * 157.3) % W;
      const y = (i * 61.7) % 260;
      const tw = 0.4 + 0.6 * Math.abs(Math.sin(S.time * 1.5 + i));
      ctx.fillStyle = "rgba(255,255,255," + (0.25 + 0.5 * tw) + ")";
      ctx.beginPath();
      ctx.arc(x, y, 1 + (i % 3) * 0.5, 0, TAU);
      ctx.fill();
    }

    // Floor
    const floor = ctx.createLinearGradient(0, 430, 0, H);
    floor.addColorStop(0, "#3b1170");
    floor.addColorStop(1, "#1d0848");
    ctx.fillStyle = floor;
    ctx.fillRect(0, 440, W, H - 440);
    ctx.strokeStyle = "rgba(255,255,255,0.06)";
    ctx.lineWidth = 1;
    for (let i = -10; i <= 10; i++) {
      ctx.beginPath();
      ctx.moveTo(CX + i * 40, 440);
      ctx.lineTo(CX + i * 120, H);
      ctx.stroke();
    }

    // Shadow under the platform
    ctx.fillStyle = "rgba(10,0,30,0.45)";
    ctx.beginPath();
    ctx.ellipse(CX, PLAT_Y + PLAT_T + 30, PLAT_R * 1.02, PLAT_R * TILT * 0.9, 0, 0, TAU);
    ctx.fill();
  }

  // ----- Drawing: cutaway machinery bay -----
  function gearTeethEllipse(ctx, cx, cy, r, teeth, rot, half, color) {
    // Draws teeth on the front (half = 1) or back (half = -1) of a flat gear.
    ctx.fillStyle = color;
    for (let k = 0; k < teeth; k++) {
      const a = rot + (k * TAU) / teeth;
      const sa = Math.sin(a);
      if (sa * half < 0) continue;
      const x = cx + r * Math.cos(a);
      const y = cy + r * sa * TILT;
      const w = Math.max(1.2, 4 * Math.abs(sa));
      ctx.fillRect(x - w / 2, y - 3, w, 7);
    }
  }

  function drawBay(ctx) {
    // Cutaway window
    ctx.save();
    M.roundRect(ctx, BAY.x, BAY.y, BAY.w, BAY.h, 16);
    ctx.fillStyle = "rgba(14, 4, 40, 0.82)";
    ctx.fill();
    ctx.setLineDash([8, 6]);
    ctx.strokeStyle = "rgba(255,210,63,0.6)";
    ctx.lineWidth = 2;
    ctx.stroke();
    ctx.setLineDash([]);
    ctx.font = "700 12px Fredoka, sans-serif";
    ctx.fillStyle = "rgba(255,210,63,0.8)";
    ctx.textAlign = "left";
    ctx.fillText("CUTAWAY · hidden drive machinery", BAY.x + 14, BAY.y + 18);
    ctx.clip();

    // Struts from ring gear up to platform underside
    ctx.strokeStyle = "rgba(200,180,255,0.35)";
    ctx.lineWidth = 3;
    for (let k = 0; k < 6; k++) {
      const a = -S.phi + (k * TAU) / 6;
      if (Math.sin(a) < -0.2) continue;
      const p = proj(RING.r * 0.8, a, RING.y);
      ctx.beginPath();
      ctx.moveTo(p.x, p.y);
      ctx.lineTo(p.x, BAY.y);
      ctx.stroke();
    }

    const rot = -S.phi;
    // Ring gear: back teeth, disc, centre pole section, front teeth
    gearTeethEllipse(ctx, RING.x, RING.y, RING.r + 3, 60, rot, -1, "#b88a1a");
    ctx.fillStyle = focusOn("ringGear") ? "#ffd23f" : "#d9a520";
    ctx.beginPath();
    ctx.ellipse(RING.x, RING.y, RING.r, RING.r * TILT, 0, 0, TAU);
    ctx.fill();
    ctx.fillStyle = "#8a6a10";
    ctx.beginPath();
    ctx.ellipse(RING.x, RING.y + 4, RING.r - 18, (RING.r - 18) * TILT, 0, 0, TAU);
    ctx.fill();
    ctx.fillStyle = "rgba(14,4,40,0.75)";
    ctx.beginPath();
    ctx.ellipse(RING.x, RING.y + 4, RING.r - 30, (RING.r - 30) * TILT, 0, 0, TAU);
    ctx.fill();
    // Spokes on the ring gear rotate with the platform
    ctx.strokeStyle = "#d9a520";
    ctx.lineWidth = 4;
    for (let k = 0; k < 6; k++) {
      const a = rot + (k * TAU) / 6;
      const p = proj(RING.r - 24, a, RING.y + 4);
      ctx.beginPath();
      ctx.moveTo(RING.x, RING.y + 4);
      ctx.lineTo(p.x, p.y);
      ctx.stroke();
    }

    // Centre pole through the bay
    drawPoleSegment(ctx, BAY.y, BAY.y + BAY.h);

    // Bearing
    ctx.fillStyle = focusOn("bearing") ? "#3ec5ff" : "#7b8bb5";
    ctx.beginPath();
    ctx.ellipse(RING.x, RING.y + 2, 26, 8, 0, 0, TAU);
    ctx.fill();
    ctx.fillStyle = "#fff";
    for (let k = 0; k < 10; k++) {
      const a = rot * 0.5 + (k * TAU) / 10;
      const sa = Math.sin(a);
      if (sa < 0) continue;
      ctx.beginPath();
      ctx.arc(RING.x + 20 * Math.cos(a), RING.y + 2 + 6 * sa, 2.2, 0, TAU);
      ctx.fill();
    }

    gearTeethEllipse(ctx, RING.x, RING.y, RING.r + 3, 60, rot, 1, "#ffe27a");

    // Brake caliper on the left of the ring gear
    const squeeze = S.brakeGlow * 6;
    ctx.save();
    if (S.brakeGlow > 0.05) {
      ctx.shadowColor = P.pink;
      ctx.shadowBlur = 25 * S.brakeGlow;
    }
    ctx.fillStyle = S.brakeGlow > 0.05 ? "#ff2e93" : "#c23b6b";
    M.roundRect(ctx, BRAKE.x - 18 + squeeze, BRAKE.y - 16, 16, 32, 4);
    ctx.fill();
    ctx.restore();
    ctx.fillStyle = "#6b6f8f";
    ctx.fillRect(BRAKE.x - 40, BRAKE.y - 6, 24 + squeeze, 12);
    ctx.fillRect(BRAKE.x - 48, BRAKE.y - 20, 10, 60);

    // Pinion and its vertical shaft
    ctx.fillStyle = "#9aa3c7";
    ctx.fillRect(PINION.x - 3, PINION.y, 6, GEARBOX.y - PINION.y);
    ctx.save();
    if (focusOn("pinion")) {
      ctx.shadowColor = P.yellow;
      ctx.shadowBlur = 16;
    }
    ctx.fillStyle = "#c0c8ea";
    ctx.fillRect(PINION.x - 14, PINION.y - 6, 28, 12);
    ctx.beginPath();
    ctx.ellipse(PINION.x, PINION.y - 6, 14, 4, 0, 0, TAU);
    ctx.fill();
    ctx.restore();
    const pinRot = S.phi * 10;
    ctx.fillStyle = "#58608a";
    for (let k = 0; k < 12; k++) {
      const a = pinRot + (k * TAU) / 12;
      const sa = Math.sin(a);
      if (sa < 0) continue;
      ctx.fillRect(PINION.x + 14 * Math.cos(a) - 1.5, PINION.y - 6, 3, 12);
    }

    // Gearbox
    ctx.save();
    if (focusOn("gearbox")) {
      ctx.shadowColor = P.teal;
      ctx.shadowBlur = 18;
    }
    const gb = ctx.createLinearGradient(GEARBOX.x, 0, GEARBOX.x + GEARBOX.w, 0);
    gb.addColorStop(0, "#00b3a0");
    gb.addColorStop(1, "#00e0c6");
    ctx.fillStyle = gb;
    M.roundRect(ctx, GEARBOX.x, GEARBOX.y, GEARBOX.w, GEARBOX.h, 8);
    ctx.fill();
    ctx.restore();
    ctx.fillStyle = "rgba(29,8,72,0.75)";
    ctx.font = "700 11px Fredoka, sans-serif";
    ctx.textAlign = "center";
    ctx.fillText("GEARBOX", GEARBOX.x + GEARBOX.w / 2, GEARBOX.y + 26);

    // Belt between pulleys (moves with the motor pulley)
    ctx.save();
    ctx.strokeStyle = focusOn("belt") ? P.yellow : "#2b2b3d";
    ctx.lineWidth = 4;
    ctx.setLineDash([7, 5]);
    ctx.lineDashOffset = -S.motorAngle * MOTOR_PULLEY.r;
    ctx.beginPath();
    ctx.moveTo(GB_PULLEY.x, GB_PULLEY.y - GB_PULLEY.r);
    ctx.lineTo(MOTOR_PULLEY.x, MOTOR_PULLEY.y - MOTOR_PULLEY.r);
    ctx.arc(MOTOR_PULLEY.x, MOTOR_PULLEY.y, MOTOR_PULLEY.r, -Math.PI / 2, Math.PI / 2);
    ctx.lineTo(GB_PULLEY.x, GB_PULLEY.y + GB_PULLEY.r);
    ctx.arc(GB_PULLEY.x, GB_PULLEY.y, GB_PULLEY.r, Math.PI / 2, (3 * Math.PI) / 2);
    ctx.stroke();
    ctx.restore();

    drawPulley(ctx, GB_PULLEY, S.gbAngle, "#ff8c42");
    drawPulley(ctx, MOTOR_PULLEY, S.motorAngle, "#ff2e93");

    // Motor
    ctx.save();
    if (focusOn("motor")) {
      ctx.shadowColor = P.pink;
      ctx.shadowBlur = 20;
    }
    const mg = ctx.createLinearGradient(0, MOTOR.y, 0, MOTOR.y + MOTOR.h);
    mg.addColorStop(0, "#ff5aa9");
    mg.addColorStop(1, "#c4126a");
    ctx.fillStyle = mg;
    M.roundRect(ctx, MOTOR.x, MOTOR.y, MOTOR.w, MOTOR.h, 10);
    ctx.fill();
    ctx.restore();
    ctx.strokeStyle = "rgba(255,255,255,0.35)";
    ctx.lineWidth = 2;
    for (let k = 1; k < 6; k++) {
      ctx.beginPath();
      ctx.moveTo(MOTOR.x + k * 12, MOTOR.y + 6);
      ctx.lineTo(MOTOR.x + k * 12, MOTOR.y + MOTOR.h - 6);
      ctx.stroke();
    }
    // Lightning bolt when powered
    if (S.motorOmega > 0.5) {
      ctx.fillStyle = P.yellow;
      ctx.globalAlpha = 0.6 + 0.4 * Math.sin(S.time * 20);
      ctx.beginPath();
      const bx = MOTOR.x + MOTOR.w / 2, by = MOTOR.y + 12;
      ctx.moveTo(bx + 4, by);
      ctx.lineTo(bx - 8, by + 17);
      ctx.lineTo(bx, by + 17);
      ctx.lineTo(bx - 4, by + 32);
      ctx.lineTo(bx + 9, by + 12);
      ctx.lineTo(bx + 1, by + 12);
      ctx.closePath();
      ctx.fill();
      ctx.globalAlpha = 1;
    }
    ctx.restore();
  }

  function drawPulley(ctx, p, ang, color) {
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.arc(p.x, p.y, p.r, 0, TAU);
    ctx.fill();
    ctx.strokeStyle = "rgba(29,8,72,0.8)";
    ctx.lineWidth = 2;
    ctx.beginPath();
    for (let k = 0; k < 3; k++) {
      const a = ang + (k * TAU) / 3;
      ctx.moveTo(p.x, p.y);
      ctx.lineTo(p.x + Math.cos(a) * p.r * 0.85, p.y + Math.sin(a) * p.r * 0.85);
    }
    ctx.stroke();
    ctx.fillStyle = "#fff";
    ctx.beginPath();
    ctx.arc(p.x, p.y, 2.5, 0, TAU);
    ctx.fill();
  }

  function drawPoleSegment(ctx, y1, y2) {
    const g = ctx.createLinearGradient(CX - 10, 0, CX + 10, 0);
    const hi = focusOn("centerPole");
    g.addColorStop(0, hi ? "#ffb703" : "#b8860b");
    g.addColorStop(0.5, hi ? "#fff3b0" : "#ffe08a");
    g.addColorStop(1, hi ? "#ffb703" : "#b8860b");
    ctx.fillStyle = g;
    ctx.fillRect(CX - 10, y1, 20, y2 - y1);
  }

  // ----- Drawing: platform -----
  const WEDGES = 16;
  const PLAT_COLORS = ["#ff2e93", "#ffd23f"];
  function wedgeIndex(t) {
    const rel = (((t + S.phi) % TAU) + TAU) % TAU;
    return Math.floor(rel / (TAU / WEDGES));
  }

  function drawPlatform(ctx) {
    const hi = focusOn("platform");
    // Side band (front half only), coloured to show rotation
    const steps = 72;
    for (let i = 0; i < steps; i++) {
      const t0 = (i / steps) * Math.PI, t1 = ((i + 1) / steps) * Math.PI;
      const idx = wedgeIndex((t0 + t1) / 2);
      ctx.fillStyle = idx % 2 ? "#8a3ffc" : "#00e0c6";
      const a = proj(PLAT_R, t0, PLAT_Y), b = proj(PLAT_R, t1, PLAT_Y);
      ctx.beginPath();
      ctx.moveTo(a.x, a.y);
      ctx.lineTo(b.x, b.y);
      ctx.lineTo(b.x, b.y + PLAT_T);
      ctx.lineTo(a.x, a.y + PLAT_T);
      ctx.closePath();
      ctx.fill();
    }
    // Lights along the side band
    for (let k = 0; k < 32; k++) {
      const a = -S.phi + (k * TAU) / 32;
      if (Math.sin(a) < 0.05) continue;
      const p = proj(PLAT_R, a, PLAT_Y);
      const on = (k + Math.floor(S.time * 4)) % 3 !== 0;
      ctx.fillStyle = on ? "#fff6a8" : "#c99a2e";
      ctx.beginPath();
      ctx.arc(p.x, p.y + PLAT_T / 2, 2.6, 0, TAU);
      ctx.fill();
    }

    // Top surface wedges
    for (let k = 0; k < WEDGES; k++) {
      const a0 = -S.phi + (k * TAU) / WEDGES;
      ctx.beginPath();
      ctx.moveTo(CX, PLAT_Y);
      ctx.ellipse(CX, PLAT_Y, PLAT_R, PLAT_R * TILT, 0, a0, a0 + TAU / WEDGES);
      ctx.closePath();
      ctx.fillStyle = PLAT_COLORS[k % 2];
      ctx.fill();
    }
    // Inner decorative ring
    ctx.fillStyle = "rgba(255,255,255,0.18)";
    ctx.beginPath();
    ctx.ellipse(CX, PLAT_Y, PLAT_R * 0.4, PLAT_R * 0.4 * TILT, 0, 0, TAU);
    ctx.fill();
    ctx.lineWidth = hi ? 4 : 2;
    ctx.strokeStyle = hi ? "#ffffff" : "rgba(29,8,72,0.5)";
    ctx.beginPath();
    ctx.ellipse(CX, PLAT_Y, PLAT_R, PLAT_R * TILT, 0, 0, TAU);
    ctx.stroke();
  }

  // ----- Drawing: horses, poles, cranks -----
  function horseGeom(h) {
    const a = horseAngle(h);
    const b = bob(h);
    const plat = proj(h.R, a, PLAT_Y);
    const crank = proj(h.R, a, CRANK_Y);
    const scale = h.s * (1 + 0.1 * Math.sin(a));
    return {
      a: a,
      z: Math.sin(a) * h.R,
      x: plat.x,
      platY: plat.y,
      crankY: crank.y,
      pinY: crank.y - b,
      horseY: plat.y - 80 * scale - b,
      scale: scale,
    };
  }

  function drawBrassPole(ctx, x, y1, y2, w) {
    const g = ctx.createLinearGradient(x - w, 0, x + w, 0);
    g.addColorStop(0, "#b8860b");
    g.addColorStop(0.5, "#fff1a8");
    g.addColorStop(1, "#b8860b");
    ctx.fillStyle = g;
    ctx.fillRect(x - w / 2, y1, w, y2 - y1);
    // Twisted stripe
    ctx.strokeStyle = "rgba(255,46,147,0.55)";
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    for (let y = y1; y < y2; y += 9) {
      ctx.moveTo(x - w / 2, y);
      ctx.lineTo(x + w / 2, y + 4);
    }
    ctx.stroke();
  }

  function drawHorseItem(ctx, h, g) {
    const w = 4.5 * g.scale;
    drawBrassPole(ctx, g.x, g.pinY, g.platY, w);
    // Pole foot on the platform
    ctx.fillStyle = "rgba(29,8,72,0.4)";
    ctx.beginPath();
    ctx.ellipse(g.x, g.platY, 8 * g.scale, 2.5 * g.scale, 0, 0, TAU);
    ctx.fill();

    const dir = Math.sin(g.a) >= 0 ? 1 : -1;
    const fore = Math.abs(Math.sin(g.a));
    const highlight = focusOn("horses") && (STEPS[S.step].graph ? h === TRACKED : true);
    M.drawHorse(ctx, g.x, g.horseY, g.scale, dir, fore, h.c, highlight);

    if (h === TRACKED && STEPS[S.step].graph) {
      drawStar(ctx, g.x, g.horseY - 52 * g.scale, 9);
    }

    if (STEPS[S.step].arrows && g.z > 60) {
      const v = S.omega * h.R;
      const k = 0.48;
      const vx = Math.sin(g.a) * v * k;
      const vy = -Math.cos(g.a) * TILT * v * k;
      M.arrow(ctx, g.x, g.horseY, g.x + vx, g.horseY + vy, P.teal, 5);
      const ac = S.omega * S.omega * h.R * 0.45;
      const cx = -Math.cos(g.a) * ac;
      const cy = -Math.sin(g.a) * TILT * ac;
      M.arrow(ctx, g.x, g.horseY + 8, g.x + cx, g.horseY + 8 + cy, P.pink, 4);
    }
  }

  function drawStar(ctx, x, y, r) {
    ctx.save();
    ctx.fillStyle = P.yellow;
    ctx.shadowColor = P.yellow;
    ctx.shadowBlur = 12;
    ctx.beginPath();
    for (let i = 0; i < 10; i++) {
      const a = -Math.PI / 2 + (i * Math.PI) / 5;
      const rr = i % 2 ? r * 0.45 : r;
      ctx.lineTo(x + Math.cos(a) * rr, y + Math.sin(a) * rr);
    }
    ctx.closePath();
    ctx.fill();
    ctx.restore();
  }

  function drawCrankLine(ctx, line) {
    const a = (line * TAU) / LINES - S.phi;
    const hi = focusOn("cranks");
    const inner = proj(34, a, CRANK_Y);
    const outer = proj(OUTER_R + 18, a, CRANK_Y);
    ctx.strokeStyle = hi ? "#e8ecff" : "#aab2d8";
    ctx.lineWidth = hi ? 4 : 3;
    ctx.beginPath();
    ctx.moveTo(inner.x, inner.y);
    ctx.lineTo(outer.x, outer.y);
    ctx.stroke();

    // Small pinion gear meshing with the crown gear
    const pin = proj(40, a, CRANK_Y);
    const fore = Math.abs(Math.sin(a));
    ctx.fillStyle = "#ff8c42";
    ctx.beginPath();
    ctx.ellipse(pin.x, pin.y, Math.max(1.5, 7 * fore), 7, 0, 0, TAU);
    ctx.fill();
    const c = crankAngle();
    ctx.strokeStyle = P.ink;
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(pin.x, pin.y);
    ctx.lineTo(pin.x - Math.sin(a) * Math.cos(c) * 7, pin.y - Math.sin(c) * 7);
    ctx.stroke();

    // Throws for the two horses on this line
    horses.forEach(function (h) {
      if (h.line !== line) return;
      const g = horseGeom(h);
      const th = c + h.phase;
      const tx = -Math.sin(g.a), ty = Math.cos(g.a) * TILT;
      const px = g.x + THROW * Math.cos(th) * tx;
      const py = g.crankY + THROW * Math.cos(th) * ty - THROW * Math.sin(th);
      ctx.strokeStyle = hi ? P.yellow : "#d0b45a";
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.ellipse(g.x, g.crankY, Math.max(1, THROW * fore), THROW, 0, 0, TAU);
      ctx.stroke();
      ctx.strokeStyle = "#e8ecff";
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(g.x, g.crankY);
      ctx.lineTo(px, py);
      ctx.stroke();
      ctx.fillStyle = P.pink;
      ctx.beginPath();
      ctx.arc(px, py, 3.5, 0, TAU);
      ctx.fill();
      // Pole top hanging from the throw
      drawBrassPole(ctx, g.x, g.pinY, g.horseY - 14 * g.scale, 4.5 * g.scale);
    });
  }

  function drawCrownGear(ctx) {
    const hi = focusOn("crownGear");
    ctx.save();
    if (hi) {
      ctx.shadowColor = P.yellow;
      ctx.shadowBlur = 22;
    }
    ctx.fillStyle = hi ? "#ffd23f" : "#d9a520";
    ctx.beginPath();
    ctx.ellipse(CX, CRANK_Y, 32, 32 * TILT + 3, 0, 0, TAU);
    ctx.fill();
    ctx.restore();
    ctx.fillStyle = "#8a6a10";
    for (let k = 0; k < 24; k++) {
      const a = (k * TAU) / 24; // stationary: no S.phi
      const sa = Math.sin(a);
      if (sa < 0) continue;
      ctx.fillRect(CX + 32 * Math.cos(a) - 1.5, CRANK_Y + 32 * TILT * sa, 3, 5);
    }
  }

  // ----- Drawing: canopy -----
  const CANOPY_COLORS = ["#ff2e93", "#fff7fb", "#8a3ffc", "#fff7fb"];
  function drawCanopy(ctx, alpha) {
    ctx.save();
    ctx.globalAlpha = alpha;
    const steps = 96;
    // Roof: back half first, then front
    for (let pass = 0; pass < 2; pass++) {
      for (let i = 0; i < steps / 2; i++) {
        const t0 = (pass === 0 ? Math.PI : 0) + (i / (steps / 2)) * Math.PI;
        const t1 = t0 + Math.PI / (steps / 2);
        const idx = wedgeIndex((t0 + t1) / 2) % 4;
        const a = proj(CANOPY_R, t0, CANOPY_Y), b = proj(CANOPY_R, t1, CANOPY_Y);
        ctx.fillStyle = CANOPY_COLORS[idx];
        ctx.beginPath();
        ctx.moveTo(CX, PEAK_Y);
        ctx.lineTo(a.x, a.y);
        ctx.lineTo(b.x, b.y);
        ctx.closePath();
        ctx.fill();
      }
    }
    // Skirt (rounding boards) with scalloped edge
    for (let i = 0; i < steps / 2; i++) {
      const t0 = (i / (steps / 2)) * Math.PI;
      const t1 = t0 + Math.PI / (steps / 2);
      const idx = wedgeIndex((t0 + t1) / 2);
      const a = proj(CANOPY_R, t0, CANOPY_Y), b = proj(CANOPY_R, t1, CANOPY_Y);
      const sc0 = 5 * Math.abs(Math.sin((t0 + S.phi) * 12));
      const sc1 = 5 * Math.abs(Math.sin((t1 + S.phi) * 12));
      ctx.fillStyle = idx % 2 ? "#ffd23f" : "#00e0c6";
      ctx.beginPath();
      ctx.moveTo(a.x, a.y);
      ctx.lineTo(b.x, b.y);
      ctx.lineTo(b.x, b.y + SKIRT + sc1);
      ctx.lineTo(a.x, a.y + SKIRT + sc0);
      ctx.closePath();
      ctx.fill();
    }
    // Bulbs on the skirt
    for (let k = 0; k < 28; k++) {
      const t = -S.phi + (k * TAU) / 28;
      if (Math.sin(t) < 0.05) continue;
      const p = proj(CANOPY_R, t, CANOPY_Y);
      const on = (k + Math.floor(S.time * 3)) % 2 === 0;
      ctx.save();
      ctx.fillStyle = on ? "#fffbd1" : "#ff8c42";
      if (on) {
        ctx.shadowColor = "#fff3a0";
        ctx.shadowBlur = 10;
      }
      ctx.beginPath();
      ctx.arc(p.x, p.y + SKIRT / 2, 3.4, 0, TAU);
      ctx.fill();
      ctx.restore();
    }
    // Rim outline
    ctx.strokeStyle = focusOn("canopy") ? "#ffffff" : "rgba(29,8,72,0.4)";
    ctx.lineWidth = focusOn("canopy") ? 3 : 1.5;
    ctx.beginPath();
    ctx.ellipse(CX, CANOPY_Y, CANOPY_R, CANOPY_R * TILT, 0, 0, Math.PI);
    ctx.stroke();
    ctx.restore();

    // Finial and flag (always opaque)
    ctx.fillStyle = "#ffd23f";
    ctx.fillRect(CX - 2, PEAK_Y - 18, 4, 18);
    ctx.beginPath();
    ctx.arc(CX, PEAK_Y - 18, 5, 0, TAU);
    ctx.fill();
    ctx.fillStyle = P.pink;
    ctx.beginPath();
    ctx.moveTo(CX + 2, PEAK_Y - 16);
    const wave = Math.sin(S.time * 6) * 3;
    ctx.quadraticCurveTo(CX + 14, PEAK_Y - 18 + wave, CX + 26, PEAK_Y - 10);
    ctx.quadraticCurveTo(CX + 14, PEAK_Y - 6 - wave, CX + 2, PEAK_Y - 6);
    ctx.closePath();
    ctx.fill();
  }

  // ----- Drawing: labels & graph -----
  function crankAnchor() {
    let best = null, bestScore = -Infinity;
    for (let i = 0; i < LINES; i++) {
      const a = (i * TAU) / LINES - S.phi;
      const score = Math.sin(a) * 0.6 + Math.cos(a);
      if (score > bestScore) { bestScore = score; best = a; }
    }
    const p = proj(OUTER_R * 0.62, best, CRANK_Y);
    return [p.x, p.y];
  }
  function horseAnchor() {
    let best = horses[0], bestZ = -Infinity;
    horses.forEach(function (h) {
      if (h.R !== OUTER_R) return;
      const a = horseAngle(h);
      const score = Math.sin(a) - Math.cos(a) * 0.5;
      if (score > bestZ) { bestZ = score; best = h; }
    });
    const h = STEPS[S.step].graph ? TRACKED : best;
    const g = horseGeom(h);
    return [g.x, g.horseY];
  }

  const LABELS = [
    { id: "canopy", text: "Canopy", at: [110, 40], anchor: function () { return [CX - 250, 80]; } },
    { id: "crownGear", text: "Crown gear (fixed)", at: [680, 30], anchor: function () { return [CX + 20, CRANK_Y]; }, needsXray: true },
    { id: "cranks", text: "Crankshafts", at: [850, 120], anchor: crankAnchor, needsXray: true },
    { id: "horses", text: "Horses on poles", at: [80, 260], anchor: horseAnchor },
    { id: "centerPole", text: "Center pole (fixed)", at: [CX + 150, 230], anchor: function () { return [CX + 6, 230]; } },
    { id: "platform", text: "Rotating platform", at: [80, 420], anchor: function () { return [CX - 230, PLAT_Y + 30]; } },
    { id: "ringGear", text: "Ring gear", at: [250, 590], anchor: function () { return [CX - 80, RING.y + 16]; } },
    { id: "bearing", text: "Bearing", at: [CX - 10, 586], anchor: function () { return [CX, RING.y + 6]; } },
    { id: "pinion", text: "Pinion", at: [560, 494], anchor: function () { return [PINION.x - 8, PINION.y - 4]; } },
    { id: "gearbox", text: "Gearbox", at: [610, 610], anchor: function () { return [GEARBOX.x + 20, GEARBOX.y + GEARBOX.h]; } },
    { id: "belt", text: "Belt & pulleys", at: [700, 500], anchor: function () { return [703, GB_PULLEY.y - GB_PULLEY.r + 3]; } },
    { id: "motor", text: "Electric motor", at: [880, 510], anchor: function () { return [MOTOR.x + MOTOR.w - 10, MOTOR.y + 10]; } },
    { id: "brake", text: "Brake", at: [200, 500], anchor: function () { return [BRAKE.x - 6, BRAKE.y - 12]; } },
  ];

  function drawLabels(ctx) {
    const st = STEPS[S.step];
    const pulse = 0.5 + 0.5 * Math.sin(S.time * 5);
    LABELS.forEach(function (L) {
      const focused = st.focus.indexOf(L.id) !== -1;
      if (!S.labels && !focused) return;
      if (L.needsXray && !S.xray) return;
      const alpha = focused ? 1 : 0.55;
      const an = L.anchor();
      ctx.save();
      ctx.globalAlpha = alpha;
      ctx.strokeStyle = focused ? P.yellow : "rgba(255,255,255,0.7)";
      ctx.lineWidth = focused ? 2.5 : 1.5;
      ctx.beginPath();
      ctx.moveTo(L.at[0], L.at[1]);
      ctx.lineTo(an[0], an[1]);
      ctx.stroke();
      ctx.fillStyle = focused ? P.yellow : "#fff";
      ctx.beginPath();
      ctx.arc(an[0], an[1], focused ? 5 : 3.5, 0, TAU);
      ctx.fill();
      if (focused && S.step !== 0) {
        ctx.strokeStyle = "rgba(255,210,63," + (0.9 - pulse * 0.7) + ")";
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.arc(an[0], an[1], 10 + pulse * 12, 0, TAU);
        ctx.stroke();
      }
      ctx.restore();
      M.pill(ctx, L.text, L.at[0], L.at[1], {
        size: focused ? 15 : 13,
        bg: focused ? P.pink : "rgba(29,8,72,0.85)",
        border: focused ? P.yellow : "rgba(255,255,255,0.3)",
        alpha: alpha,
        maxX: W,
      });
    });
  }

  function drawGraph(ctx) {
    const gx = 772, gy = 186, gw = 176, gh = 112;
    ctx.save();
    M.roundRect(ctx, gx, gy, gw, gh, 12);
    ctx.fillStyle = "rgba(29,8,72,0.85)";
    ctx.fill();
    ctx.strokeStyle = P.yellow;
    ctx.lineWidth = 2;
    ctx.stroke();
    ctx.font = "700 12px Fredoka, sans-serif";
    ctx.fillStyle = P.yellow;
    ctx.textAlign = "left";
    ctx.fillText("⭐ horse height vs time", gx + 10, gy + 18);
    const midY = gy + 66, amp = 30;
    ctx.strokeStyle = "rgba(255,255,255,0.2)";
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(gx + 10, midY);
    ctx.lineTo(gx + gw - 10, midY);
    ctx.stroke();
    ctx.strokeStyle = P.teal;
    ctx.lineWidth = 3;
    ctx.beginPath();
    S.history.forEach(function (p, i) {
      const x = gx + gw - 12 - (S.time - p.t) * ((gw - 24) / 5);
      const y = midY - (p.y / THROW) * amp;
      if (i === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    });
    ctx.stroke();
    if (S.history.length) {
      const last = S.history[S.history.length - 1];
      ctx.fillStyle = P.pink;
      ctx.beginPath();
      ctx.arc(gx + gw - 12, midY - (last.y / THROW) * amp, 4.5, 0, TAU);
      ctx.fill();
    }
    ctx.fillStyle = "rgba(255,255,255,0.6)";
    ctx.font = "600 10px Nunito, sans-serif";
    ctx.fillText("up", gx + 10, midY - amp + 2);
    ctx.fillText("down", gx + 10, midY + amp + 6);
    ctx.restore();
  }

  function drawArrowLegend(ctx) {
    ctx.save();
    M.roundRect(ctx, 772, 186, 176, 74, 12);
    ctx.fillStyle = "rgba(29,8,72,0.85)";
    ctx.fill();
    M.arrow(ctx, 786, 210, 830, 210, P.teal, 5);
    M.arrow(ctx, 786, 240, 830, 240, P.pink, 4);
    ctx.font = "700 13px Fredoka, sans-serif";
    ctx.fillStyle = "#fff";
    ctx.fillText("velocity v = ωr", 840, 214);
    ctx.fillText("centripetal F", 840, 244);
    ctx.restore();
  }

  function drawPausedBadge(ctx) {
    if (S.playing) return;
    M.pill(ctx, "Paused", W - 60, 24, { size: 14, bg: P.purple, border: P.yellow });
  }

  // ----- Frame -----
  function render(ctx) {
    drawBackground(ctx);
    drawBay(ctx);
    drawPlatform(ctx);

    const items = horses.map(function (h) { return { h: h, g: horseGeom(h) }; });
    items.sort(function (a, b) { return a.g.z - b.g.z; });

    items.forEach(function (it) { if (it.g.z < 0) drawHorseItem(ctx, it.h, it.g); });
    drawPoleSegment(ctx, PEAK_Y, PLAT_Y);
    // Bearing collar where the pole meets the platform
    ctx.fillStyle = focusOn("bearing") ? "#3ec5ff" : "#7b8bb5";
    ctx.beginPath();
    ctx.ellipse(CX, PLAT_Y, 22, 6, 0, 0, TAU);
    ctx.fill();
    items.forEach(function (it) { if (it.g.z >= 0) drawHorseItem(ctx, it.h, it.g); });

    if (S.xray) {
      drawCanopy(ctx, 0.28);
      // Sweeps (support beams) under the canopy
      ctx.strokeStyle = "rgba(255,210,63,0.45)";
      ctx.lineWidth = 2;
      for (let i = 0; i < LINES; i++) {
        const a = (i * TAU) / LINES - S.phi + TAU / 16;
        const p = proj(CANOPY_R, a, CANOPY_Y);
        ctx.beginPath();
        ctx.moveTo(CX, CANOPY_Y - 30);
        ctx.lineTo(p.x, p.y);
        ctx.stroke();
      }
      const order = [];
      for (let i = 0; i < LINES; i++) order.push(i);
      order.sort(function (a, b) {
        return Math.sin((a * TAU) / LINES - S.phi) - Math.sin((b * TAU) / LINES - S.phi);
      });
      order.forEach(function (i) { if (Math.sin((i * TAU) / LINES - S.phi) < 0) drawCrankLine(ctx, i); });
      drawPoleSegment(ctx, PEAK_Y, CRANK_Y);
      drawCrownGear(ctx);
      order.forEach(function (i) { if (Math.sin((i * TAU) / LINES - S.phi) >= 0) drawCrankLine(ctx, i); });
    } else {
      drawCanopy(ctx, 1);
    }

    if (STEPS[S.step].graph) drawGraph(ctx);
    if (STEPS[S.step].arrows) drawArrowLegend(ctx);
    drawLabels(ctx);
    drawPausedBadge(ctx);
  }

  // ----- DOM wiring -----
  let els = {};
  function updateReadouts() {
    const rpm = (S.omega * 60) / TAU;
    els.motor.textContent = Math.round((S.motorOmega / MOTOR_VIS) * 1750).toLocaleString();
    els.platform.textContent = rpm.toFixed(1);
    els.outer.textContent = (S.omega * REAL_OUTER_M * 3.6).toFixed(1);
    els.inner.textContent = (S.omega * REAL_INNER_M * 3.6).toFixed(1);
    els.bobs.textContent = Math.round(rpm * CRANK_RATIO);
  }

  function renderStepPanel() {
    const st = STEPS[S.step];
    els.count.textContent = "Step " + (S.step + 1) + " of " + STEPS.length;
    els.title.textContent = st.title;
    els.text.innerHTML = st.text;
    els.formula.innerHTML = st.formula || "";
    const body = els.title.parentElement;
    body.classList.remove("step-enter");
    void body.offsetWidth;
    body.classList.add("step-enter");
    Array.prototype.forEach.call(els.dots.querySelectorAll("button"), function (b, i) {
      b.classList.toggle("active", i === S.step);
      b.classList.toggle("done", i < S.step);
      b.setAttribute("aria-current", i === S.step ? "step" : "false");
    });
    els.xray.checked = S.xray;
  }

  function goTo(i) {
    S.step = (i + STEPS.length) % STEPS.length;
    S.xray = !!STEPS[S.step].xray;
    S.tourT = 0;
    renderStepPanel();
  }

  const ICON_PAUSE = '<svg viewBox="0 0 24 24" width="22" height="22" aria-hidden="true"><rect x="5" y="4" width="5" height="16" rx="1.5" fill="currentColor"/><rect x="14" y="4" width="5" height="16" rx="1.5" fill="currentColor"/></svg>';
  const ICON_PLAY = '<svg viewBox="0 0 24 24" width="22" height="22" aria-hidden="true"><path d="M7 4.5v15a1 1 0 0 0 1.5.86l12-7.5a1 1 0 0 0 0-1.72l-12-7.5A1 1 0 0 0 7 4.5z" fill="currentColor"/></svg>';

  function setPlaying(p) {
    S.playing = p;
    els.play.innerHTML = p ? ICON_PAUSE : ICON_PLAY;
    els.play.setAttribute("aria-label", p ? "Pause animation" : "Play animation");
  }

  function setTour(on) {
    S.tour = on;
    S.tourT = 0;
    els.tour.setAttribute("aria-pressed", on ? "true" : "false");
    if (on) setPlaying(true);
  }

  function init() {
    const canvas = document.getElementById("carousel-canvas");
    if (!canvas) return;
    const ctx = M.setupCanvas(canvas, W, H);
    els = {
      motor: document.getElementById("ro-motor"),
      platform: document.getElementById("ro-platform"),
      outer: document.getElementById("ro-outer"),
      inner: document.getElementById("ro-inner"),
      bobs: document.getElementById("ro-bobs"),
      count: document.getElementById("step-count"),
      title: document.getElementById("step-title"),
      text: document.getElementById("step-text"),
      formula: document.getElementById("step-formula"),
      dots: document.getElementById("step-dots"),
      play: document.getElementById("btn-play"),
      tour: document.getElementById("btn-tour"),
      xray: document.getElementById("toggle-xray"),
      tourBar: document.getElementById("tour-bar"),
    };

    STEPS.forEach(function (st, i) {
      const li = document.createElement("li");
      const b = document.createElement("button");
      b.type = "button";
      b.textContent = String(i + 1);
      b.title = st.title;
      b.setAttribute("aria-label", "Step " + (i + 1) + ": " + st.title);
      b.addEventListener("click", function () { setTour(false); goTo(i); });
      li.appendChild(b);
      els.dots.appendChild(li);
    });

    document.getElementById("btn-prev").addEventListener("click", function () { setTour(false); goTo(S.step - 1); });
    document.getElementById("btn-next").addEventListener("click", function () { setTour(false); goTo(S.step + 1); });
    els.play.addEventListener("click", function () { setPlaying(!S.playing); });
    els.tour.addEventListener("click", function () {
      setTour(!S.tour);
      if (S.tour && S.step === STEPS.length - 1) goTo(0);
    });
    const speed = document.getElementById("speed");
    const speedOut = document.getElementById("speed-out");
    speed.addEventListener("input", function () {
      S.speed = parseFloat(speed.value);
      speedOut.textContent = S.speed + "×";
    });
    document.getElementById("toggle-labels").addEventListener("change", function (e) { S.labels = e.target.checked; });
    els.xray.addEventListener("change", function (e) { S.xray = e.target.checked; });

    document.addEventListener("keydown", function (e) {
      const tag = (e.target && e.target.tagName) || "";
      if (tag === "INPUT" || tag === "TEXTAREA" || tag === "SELECT") return;
      const sec = document.getElementById("animation").getBoundingClientRect();
      if (sec.bottom < 0 || sec.top > window.innerHeight) return;
      if (e.key === "ArrowRight") { setTour(false); goTo(S.step + 1); }
      else if (e.key === "ArrowLeft") { setTour(false); goTo(S.step - 1); }
    });

    goTo(0);
    let readoutTimer = 0;
    M.animate(canvas, function (dt) {
      if (S.playing) update(dt * S.speed);
      render(ctx);
      els.tourBar.style.width = S.tour ? (S.tourT / TOUR_STEP_SECONDS) * 100 + "%" : "0";
      readoutTimer += dt;
      if (readoutTimer > 0.1) { readoutTimer = 0; updateReadouts(); }
    });
  }

  M.carousel = { init: init, goTo: function (i) { setTour(false); goTo(i); setPlaying(true); } };
})(window.MGR);
