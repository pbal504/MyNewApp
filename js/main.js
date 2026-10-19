// Page wiring: parts gallery, navigation, and lab start-up.
(function (M) {
  "use strict";

  const PARTS = [
    { icon: "⚡", name: "Electric motor", color: "#ff2e93", step: 1,
      text: "Turns electrical energy into fast rotation. Lots of speed, not much torque." },
    { icon: "🔁", name: "Belt & pulleys", color: "#ff8c42", step: 2,
      text: "A small pulley drives a big one, slowing the rotation and boosting the torque." },
    { icon: "⚙️", name: "Gearbox", color: "#00e0c6", step: 2,
      text: "A set of gears that keeps reducing speed. It often turns the motion through 90° to point straight up." },
    { icon: "🛞", name: "Pinion & ring gear", color: "#ffd23f", step: 3,
      text: "A small pinion meshes with a huge ring gear under the platform: the final, biggest reduction." },
    { icon: "🎠", name: "Platform", color: "#8a3ffc", step: 4,
      text: "The rotating floor that carries horses, chariots and riders. It's very heavy, so it starts and stops slowly." },
    { icon: "🗼", name: "Center pole", color: "#ffd23f", step: 4,
      text: "The fixed axle at the heart of the ride. Everything else turns around it." },
    { icon: "🔩", name: "Bearing", color: "#3ec5ff", step: 4,
      text: "Rings of steel balls or rollers that let the platform turn smoothly with very little friction." },
    { icon: "👑", name: "Crown gear", color: "#ff8c42", step: 5,
      text: "A gear fixed to the top of the center pole. It never turns, and that's exactly why the cranks do." },
    { icon: "🔧", name: "Crankshafts", color: "#00e0c6", step: 5,
      text: "Spoke-like shafts with offset “throws.” Rolling around the crown gear makes them spin." },
    { icon: "🐴", name: "Horse poles", color: "#ff2e93", step: 6,
      text: "Each pole hangs from a crank throw. As the crank turns, the pole and horse rise and fall." },
    { icon: "💡", name: "Canopy & lights", color: "#9cff57", step: 0,
      text: "The decorated roof hides the cranks and sweeps (support beams), and carries hundreds of lights." },
    { icon: "🛑", name: "Brake", color: "#ff2e93", step: 8,
      text: "Uses friction to turn the platform's kinetic energy into heat, bringing the ride to a gentle stop." },
  ];

  function renderParts() {
    const grid = document.getElementById("part-grid");
    if (!grid) return;
    PARTS.forEach(function (p) {
      const card = document.createElement("article");
      card.className = "part";
      card.style.setProperty("--c", p.color);
      card.innerHTML =
        '<div class="part-icon" aria-hidden="true">' + p.icon + "</div>" +
        "<h3>" + p.name + "</h3>" +
        "<p>" + p.text + "</p>";
      const b = document.createElement("button");
      b.type = "button";
      b.textContent = "See it move →";
      b.setAttribute("aria-label", "See the " + p.name + " in the animation");
      b.addEventListener("click", function () {
        M.carousel.goTo(p.step);
        document.getElementById("animation").scrollIntoView({ behavior: "smooth", block: "start" });
      });
      card.appendChild(b);
      grid.appendChild(card);
    });
  }

  function setupNav() {
    const toggle = document.querySelector(".nav-toggle");
    const nav = document.getElementById("site-nav");
    if (!toggle || !nav) return;
    toggle.addEventListener("click", function () {
      const open = nav.classList.toggle("open");
      toggle.setAttribute("aria-expanded", open ? "true" : "false");
    });
    nav.addEventListener("click", function (e) {
      if (e.target.tagName === "A") {
        nav.classList.remove("open");
        toggle.setAttribute("aria-expanded", "false");
      }
    });
  }

  function start() {
    setupNav();
    renderParts();
    M.carousel.init();
    M.physicsLab.init();
    M.gearLab.init();
    M.quiz.init();
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", start);
  else start();
})(window.MGR);
