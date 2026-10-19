// Multiple-choice quiz with explanations.
(function (M) {
  "use strict";

  const QUESTIONS = [
    {
      q: "Two friends ride the same merry-go-round, one on an outer horse and one on an inner horse. Who is moving faster?",
      options: ["The inner rider", "The outer rider", "They move at the same speed"],
      answer: 1,
      explain: "They share the same angular speed (same time per lap), but the outer rider travels a bigger circle. Linear speed is v = ω·r, so a bigger r means a bigger speed.",
    },
    {
      q: "What makes the horses move up and down?",
      options: [
        "Springs under each horse",
        "A separate motor inside every pole",
        "Crankshafts turned by gears rolling around a stationary crown gear",
      ],
      answer: 2,
      explain: "Each crankshaft's small gear meshes with the fixed crown gear at the top of the center pole. As the ride turns, the gear rolls around it, spinning the crank, whose throws lift and lower the poles.",
    },
    {
      q: "Why is there a gearbox between the motor and the platform?",
      options: [
        "To make the platform spin faster than the motor",
        "To slow the rotation down and multiply the torque",
        "To change electricity into motion",
      ],
      answer: 1,
      explain: "The motor spins fast with little torque. Gears and pulleys trade that speed for force: slower rotation, more torque, enough to turn a heavy platform.",
    },
    {
      q: "Which way does the force that keeps you moving in a circle point?",
      options: ["Outward, away from the center", "Toward the center", "Forward, in the direction you move"],
      answer: 1,
      explain: "It is the centripetal (“center-seeking”) force, supplied by your grip on the pole. The outward “push” you feel is your body's inertia trying to keep going straight.",
    },
    {
      q: "If a rider could suddenly let go with nothing holding them, which path would they follow (seen from above)?",
      options: [
        "A straight line, along the direction they were moving",
        "Straight outward, away from the center",
        "A spiral that curves outward",
      ],
      answer: 0,
      explain: "With no inward force, Newton's first law says they keep moving in a straight line, tangent to the circle. Try “Let go of the pole!” in the Physics Lab.",
    },
    {
      q: "A crown gear has 60 teeth and each crank pinion has 20 teeth. How many times does a horse go up and down per lap?",
      options: ["2", "3", "20"],
      answer: 1,
      explain: "Crank turns per lap = crown teeth ÷ pinion teeth = 60 ÷ 20 = 3. Each crank turn is one full up-and-down cycle.",
    },
    {
      q: "Why does a carousel speed up and slow down gradually?",
      options: [
        "Its huge moment of inertia resists sudden changes, and gentle changes are safer for riders",
        "The motor is too weak to ever go faster",
        "The music controls the speed",
      ],
      answer: 0,
      explain: "τ = I·α: a big moment of inertia (I) means a given torque produces only a small angular acceleration. A slow, smooth start and stop also keeps riders from being jolted.",
    },
  ];

  function init() {
    const root = document.getElementById("quiz-root");
    if (!root) return;
    let answered = 0, correct = 0;
    root.innerHTML = "";

    QUESTIONS.forEach(function (item, qi) {
      const card = document.createElement("div");
      card.className = "quiz-q";
      const h = document.createElement("h3");
      h.innerHTML = "<span>Q" + (qi + 1) + ".</span>";
      h.appendChild(document.createTextNode(item.q));
      card.appendChild(h);

      const opts = document.createElement("div");
      opts.className = "quiz-options";
      const buttons = item.options.map(function (text, oi) {
        const b = document.createElement("button");
        b.type = "button";
        b.className = "quiz-option";
        b.textContent = text;
        b.addEventListener("click", function () {
          buttons.forEach(function (x) { x.disabled = true; });
          buttons[item.answer].classList.add("correct");
          const ok = oi === item.answer;
          if (!ok) b.classList.add("wrong");
          answered++;
          if (ok) correct++;
          const ex = document.createElement("p");
          ex.className = "quiz-explain";
          ex.innerHTML = (ok ? "✅ <strong>Correct!</strong> " : "❌ <strong>Not quite.</strong> ") + item.explain;
          card.appendChild(ex);
          if (answered === QUESTIONS.length) showScore();
        });
        opts.appendChild(b);
        return b;
      });
      card.appendChild(opts);
      root.appendChild(card);
    });

    function showScore() {
      const box = document.createElement("div");
      box.className = "quiz-score";
      const pct = correct / QUESTIONS.length;
      const msg = pct === 1 ? "🏆 Perfect! You're a carousel engineer." : pct >= 0.6 ? "🎉 Great job! Nearly there." : "🎠 Take another spin through the animation and try again!";
      box.innerHTML = "<strong>" + correct + " / " + QUESTIONS.length + "</strong>" + msg + "<br />";
      const again = document.createElement("button");
      again.className = "btn";
      again.type = "button";
      again.textContent = "↺ Try again";
      again.addEventListener("click", function () {
        init();
        root.scrollIntoView({ behavior: "smooth", block: "start" });
      });
      box.appendChild(again);
      root.appendChild(box);
    }
  }

  M.quiz = { init: init };
})(window.MGR);
