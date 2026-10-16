/* Maxwell Robbins — personal site. Vanilla JS, no dependencies. */
(function () {
  "use strict";

  /* ================= 1. Boot / typing animation ================= */
  var bootLines = [
    "$ whoami",
    "maxwell_robbins · CS @ University of Cincinnati '31",
    "// co-founder, Prism Robotics · seeking Summer 2027 co-op"
  ];
  var boot = document.getElementById("boot");
  if (boot) {
    var reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduceMotion) {
      boot.textContent = bootLines.join("\n");
    } else {
      var li = 0, ci = 0;
      (function typeBoot() {
        if (li >= bootLines.length) return;
        var line = bootLines[li];
        if (ci <= line.length) {
          boot.textContent =
            bootLines.slice(0, li).join("\n") + (li ? "\n" : "") + line.slice(0, ci);
          ci++;
          setTimeout(typeBoot, li === 0 ? 40 : 14);
        } else {
          li++; ci = 0;
          setTimeout(typeBoot, 170);
        }
      })();
    }
  }

  /* ================= 2. Working mini terminal ================= */
  var out = document.getElementById("term-out");
  var input = document.getElementById("term-input");
  var replies = {
    help:
      "commands: about · projects · skills · contact · socials · resume · clear",
    about:
      "CS freshman at the University of Cincinnati (co-op program, class of 2031).\n" +
      "Co-founder of Prism Robotics, a 501(c)(3) VEX U team. I build robot software\n" +
      "and the team website, and lead fundraising toward Worlds in April 2027.\n" +
      "Also: certified VEX Event Partner + Head Referee; mentor to 35+ middle\n" +
      "schoolers (350+ hours).",
    projects:
      "path-planner: hermite spline routing for VEX U (Python)\n" +
      "prism-robotics: React site for our 501(c)(3) VEX U team\n" +
      "league-bot: Discord bot, scaled a community to 1,500+ members\n" +
      "plant-monitor: desktop app + firmware sensor project\n" +
      "scroll to ~/projects, or try the demo at ~/path-planner",
    skills:
      "Java · Python · C++ · JavaScript · React · HTML/CSS · MongoDB · SQL · Git",
    contact:
      "email:    hello@maxwellrobbins.com\n" +
      "github:   github.com/maxsr0\n" +
      "linkedin: linkedin.com/in/maxwell-robbins",
    socials:
      "github:   github.com/maxsr0\n" +
      "linkedin: linkedin.com/in/maxwell-robbins\n" +
    resume:
      "resume.pdf is linked down in ~/contact. The short version is in 'projects'\n" +
      "and 'about' right here."
  };

  function runCommand() {
    if (!input || !out) return;
    var raw = input.value.trim();
    if (!raw) return;
    var v = raw.toLowerCase();
    if (v === "clear") {
      out.textContent = "";
    } else {
      var echo = document.createElement("div");
      echo.className = "echo";
      echo.textContent = "> " + raw;
      var resp = document.createElement("div");
      resp.textContent = replies[v] || "command not found: '" + v + "'. try 'help'";
      out.appendChild(echo);
      out.appendChild(resp);
    }
    input.value = "";
    input.focus();
  }
  if (input) {
    input.addEventListener("keydown", function (e) {
      if (e.key === "Enter") runCommand();
    });
  }

  /* ================= 3. Path planner demo ================= */
  var cv = document.getElementById("field");
  if (cv && cv.getContext) {
    var ctx = cv.getContext("2d");
    var W = cv.width, H = cv.height;
    var pts = [
      { x: 110, y: 330 }, { x: 300, y: 140 },
      { x: 560, y: 300 }, { x: 770, y: 120 }
    ];
    var samples = [], anim = null;

    function catmullRom(p) {
      var result = [];
      if (p.length < 2) return p.slice();
      var ext = [p[0]].concat(p, [p[p.length - 1]]);
      for (var i = 0; i < ext.length - 2; i++) {
        var p0 = ext[i], p1 = ext[i + 1], p2 = ext[i + 2], p3 = ext[i + 3] || p2;
        for (var t = 0; t < 1; t += 0.03) {
          var t2 = t * t, t3 = t2 * t;
          result.push({
            x: 0.5 * ((2 * p1.x) + (-p0.x + p2.x) * t +
                 (2 * p0.x - 5 * p1.x + 4 * p2.x - p3.x) * t2 +
                 (-p0.x + 3 * p1.x - 3 * p2.x + p3.x) * t3),
            y: 0.5 * ((2 * p1.y) + (-p0.y + p2.y) * t +
                 (2 * p0.y - 5 * p1.y + 4 * p2.y - p3.y) * t2 +
                 (-p0.y + 3 * p1.y - 3 * p2.y + p3.y) * t3)
          });
        }
      }
      result.push(p[p.length - 1]);
      return result;
    }

    function draw(dot, next) {
      ctx.clearRect(0, 0, W, H);
      // field grid
      ctx.strokeStyle = "#21262d";
      ctx.lineWidth = 1;
      var g;
      for (g = 0; g <= W; g += 55) { ctx.beginPath(); ctx.moveTo(g, 0); ctx.lineTo(g, H); ctx.stroke(); }
      for (g = 0; g <= H; g += 52) { ctx.beginPath(); ctx.moveTo(0, g); ctx.lineTo(W, g); ctx.stroke(); }
      // spline
      samples = catmullRom(pts);
      if (samples.length > 1) {
        ctx.strokeStyle = "#58a6ff";
        ctx.lineWidth = 2.5;
        ctx.beginPath();
        ctx.moveTo(samples[0].x, samples[0].y);
        for (var i = 1; i < samples.length; i++) ctx.lineTo(samples[i].x, samples[i].y);
        ctx.stroke();
        ctx.lineWidth = 1;
      }
      // waypoints
      pts.forEach(function (p) {
        ctx.fillStyle = "#f778ba";
        ctx.beginPath(); ctx.arc(p.x, p.y, 6, 0, 7); ctx.fill();
        ctx.strokeStyle = "#0d1117"; ctx.stroke();
      });
      // robot: a little square, rotated to face its heading
      if (dot) {
        var ang = next ? Math.atan2(next.y - dot.y, next.x - dot.x) : 0;
        ctx.save();
        ctx.translate(dot.x, dot.y);
        ctx.rotate(ang);
        ctx.fillStyle = "#7ee787";
        ctx.fillRect(-9, -9, 18, 18);
        ctx.strokeStyle = "#0d1117"; ctx.lineWidth = 2;
        ctx.strokeRect(-9, -9, 18, 18);
        ctx.fillStyle = "#0d1117";
        ctx.fillRect(3, -3, 5, 6);
        ctx.restore();
        ctx.lineWidth = 1;
      }
      var counter = document.getElementById("pt-count");
      if (counter) counter.textContent = pts.length + " waypoints · catmull-rom spline (demo)";
    }

    draw(null);

    // points are click-and-draggable; clicking empty field adds a new one
    var dragIdx = -1;
    function evtPos(e) {
      var r = cv.getBoundingClientRect();
      return {
        x: (e.clientX - r.left) * (W / r.width),
        y: (e.clientY - r.top) * (H / r.height)
      };
    }
    cv.addEventListener("pointerdown", function (e) {
      var p = evtPos(e);
      dragIdx = -1;
      for (var i = 0; i < pts.length; i++) {
        var dx = pts[i].x - p.x, dy = pts[i].y - p.y;
        if (dx * dx + dy * dy < 24 * 24) { dragIdx = i; break; }
      }
      if (dragIdx === -1) {
        pts.push(p);
        dragIdx = pts.length - 1;
      }
      if (cv.setPointerCapture) cv.setPointerCapture(e.pointerId);
      draw(null);
    });
    cv.addEventListener("pointermove", function (e) {
      if (dragIdx >= 0) {
        pts[dragIdx] = evtPos(e);
        draw(null);
      }
    });
    ["pointerup", "pointercancel"].forEach(function (ev) {
      cv.addEventListener(ev, function () { dragIdx = -1; });
    });

    var clearBtn = document.getElementById("clear-btn");
    if (clearBtn) clearBtn.addEventListener("click", function () {
      pts = [];
      if (anim) cancelAnimationFrame(anim);
      draw(null);
    });

    var runBtn = document.getElementById("run-btn");
    if (runBtn) runBtn.addEventListener("click", function () {
      if (samples.length < 2) return;
      if (anim) cancelAnimationFrame(anim);
      var i = 0;
      (function step() {
        var idx = Math.min(Math.floor(i), samples.length - 1);
        draw(samples[idx], samples[Math.min(idx + 1, samples.length - 1)]);
        i += 0.85;
        if (i < samples.length) anim = requestAnimationFrame(step);
      })();
    });
  }

  /* ================= 4. Clickable skills ================= */
  var skillData = {
    java:       { label: "Java", items: [], note: "Mostly coursework so far. Projects land here as I add them." },
    python:     { label: "Python", items: [
      { name: "path-planner", url: "https://github.com/maxsr0/path-planner", blurb: "Hermite spline routing for VEX U robots" }
    ] },
    cpp:        { label: "C++", items: [], note: "What our VEX robots run on (PROS). The code is in the team's private repos." },
    javascript: { label: "JavaScript", items: [
      { name: "league-bot", blurb: "Discord bot for a 1,500+ member Rocket League community" },
      { name: "prism-robotics site", url: "https://prismrobotics.org", blurb: "Team website and sponsorship pages" }
    ] },
    react:      { label: "React", items: [
      { name: "prism-robotics site", url: "https://prismrobotics.org", blurb: "Team info, technical portfolio, sponsor outreach" }
    ] },
    htmlcss:    { label: "HTML/CSS", items: [
      { name: "prism-robotics site", url: "https://prismrobotics.org", blurb: "Team info, technical portfolio, sponsor outreach" },
      { name: "this site", blurb: "Plain HTML and CSS, no framework" }
    ] },
    mongodb:    { label: "MongoDB", items: [
      { name: "league-bot", blurb: "Backend for brackets, stats, and members" }
    ] },
    sql:        { label: "SQL", items: [], note: "Coursework and small projects so far." },
    git:        { label: "Git", items: [], note: "Every project on this page lives in Git." }
  };
  var detail = document.getElementById("skill-detail");
  var chips = document.querySelectorAll(".skill-chip");
  chips.forEach(function (chip) {
    chip.addEventListener("click", function () {
      chips.forEach(function (c) { c.classList.remove("active"); });
      chip.classList.add("active");
      var d = skillData[chip.getAttribute("data-skill")];
      if (!d || !detail) return;
      detail.innerHTML = "";
      var h = document.createElement("h3");
      h.textContent = d.label;
      detail.appendChild(h);
      if (d.items.length) {
        var ul = document.createElement("ul");
        d.items.forEach(function (it) {
          var li = document.createElement("li");
          if (it.url) {
            var a = document.createElement("a");
            a.href = it.url;
            a.target = "_blank";
            a.rel = "noopener";
            a.textContent = it.name;
            li.appendChild(a);
            li.appendChild(document.createTextNode(": " + it.blurb));
          } else {
            li.textContent = it.name + ": " + it.blurb;
          }
          ul.appendChild(li);
        });
        detail.appendChild(ul);
      } else {
        var p = document.createElement("p");
        p.textContent = d.note || "";
        detail.appendChild(p);
      }
    });
  });
})();
