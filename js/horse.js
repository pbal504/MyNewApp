// Draws a stylised carousel "jumper" horse.
(function (M) {
  "use strict";

  M.horseColors = [
    { body: "#ffffff", mane: "#ff2e93", saddle: "#8a3ffc", trim: "#ffd23f" },
    { body: "#ffd23f", mane: "#8a3ffc", saddle: "#ff2e93", trim: "#00e0c6" },
    { body: "#3ec5ff", mane: "#ffffff", saddle: "#ff8c42", trim: "#ffd23f" },
    { body: "#ff8c42", mane: "#1d0848", saddle: "#00e0c6", trim: "#ffffff" },
    { body: "#ffb3e0", mane: "#8a3ffc", saddle: "#3ec5ff", trim: "#ffd23f" },
    { body: "#9cff57", mane: "#ff2e93", saddle: "#8a3ffc", trim: "#ffffff" },
    { body: "#c9a4ff", mane: "#ffd23f", saddle: "#ff2e93", trim: "#00e0c6" },
    { body: "#00e0c6", mane: "#ffffff", saddle: "#ff8c42", trim: "#ffd23f" },
  ];

  // (x, y): body centre. s: scale. dir: +1 faces right, -1 faces left.
  // fore: horizontal foreshortening (1 = full side view).
  M.drawHorse = function (ctx, x, y, s, dir, fore, c, highlight) {
    ctx.save();
    ctx.translate(x, y);
    ctx.scale(dir * Math.max(fore, 0.22) * s, s);
    ctx.lineJoin = "round";
    ctx.lineCap = "round";
    const outline = "rgba(29, 8, 72, 0.9)";

    if (highlight) {
      ctx.shadowColor = M.palette.yellow;
      ctx.shadowBlur = 24;
    }

    // Tail
    ctx.fillStyle = c.mane;
    ctx.beginPath();
    ctx.moveTo(-30, -6);
    ctx.quadraticCurveTo(-52, -4, -50, 24);
    ctx.quadraticCurveTo(-42, 8, -30, 4);
    ctx.closePath();
    ctx.fill();

    // Legs (classic jumper pose: hind legs back, front legs tucked)
    ctx.strokeStyle = c.body;
    ctx.lineWidth = 7;
    const legs = [
      [[-20, 6], [-32, 18], [-46, 24]],
      [[-14, 9], [-22, 24], [-30, 34]],
      [[20, 6], [32, 14], [27, 25]],
      [[14, 9], [25, 20], [19, 31]],
    ];
    legs.forEach(function (l) {
      ctx.beginPath();
      ctx.moveTo(l[0][0], l[0][1]);
      ctx.lineTo(l[1][0], l[1][1]);
      ctx.lineTo(l[2][0], l[2][1]);
      ctx.stroke();
    });
    ctx.fillStyle = c.trim;
    legs.forEach(function (l) {
      ctx.beginPath();
      ctx.arc(l[2][0], l[2][1], 3.6, 0, M.TAU);
      ctx.fill();
    });

    // Body
    ctx.fillStyle = c.body;
    ctx.strokeStyle = outline;
    ctx.lineWidth = 1.6;
    ctx.beginPath();
    ctx.ellipse(0, 0, 31, 15, 0, 0, M.TAU);
    ctx.fill();
    ctx.stroke();

    // Neck
    ctx.beginPath();
    ctx.moveTo(16, -9);
    ctx.quadraticCurveTo(24, -30, 34, -36);
    ctx.lineTo(44, -28);
    ctx.quadraticCurveTo(34, -14, 30, 4);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    // Head
    ctx.beginPath();
    ctx.ellipse(46, -30, 13, 7.5, 0.55, 0, M.TAU);
    ctx.fill();
    ctx.stroke();
    // Ear
    ctx.beginPath();
    ctx.moveTo(36, -38);
    ctx.lineTo(37, -47);
    ctx.lineTo(42, -39);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    ctx.shadowBlur = 0;

    // Mane
    ctx.fillStyle = c.mane;
    ctx.beginPath();
    ctx.moveTo(34, -40);
    ctx.quadraticCurveTo(22, -34, 14, -12);
    ctx.quadraticCurveTo(22, -20, 22, -14);
    ctx.quadraticCurveTo(26, -26, 30, -24);
    ctx.quadraticCurveTo(32, -32, 38, -34);
    ctx.closePath();
    ctx.fill();

    // Eye & bridle
    ctx.fillStyle = M.palette.ink;
    ctx.beginPath();
    ctx.arc(45, -33, 1.8, 0, M.TAU);
    ctx.fill();
    ctx.strokeStyle = c.trim;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(40, -24);
    ctx.lineTo(50, -38);
    ctx.stroke();

    // Saddle blanket + saddle
    ctx.fillStyle = c.saddle;
    M.roundRect(ctx, -14, -13, 24, 20, 5);
    ctx.fill();
    ctx.fillStyle = c.trim;
    ctx.fillRect(-14, 4, 24, 3);
    ctx.fillStyle = c.saddle;
    ctx.beginPath();
    ctx.ellipse(-2, -14, 13, 5, 0, 0, M.TAU);
    ctx.fill();
    ctx.strokeStyle = outline;
    ctx.lineWidth = 1.2;
    ctx.stroke();

    ctx.restore();
  };
})(window.MGR);
