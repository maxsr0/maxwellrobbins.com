/* Maxwell Robbins — personal site. Vanilla JS, no dependencies. */
(function () {
  "use strict";

  /* ================= 1. Boot / typing animation ================= */
  var bootLines = [
    "$ whoami",
    "maxwell_robbins — CS @ University of Cincinnati '31",
    "// co-founder, Prism Robotics · seeking Summer 2027 co-op",
    "// type 'help' below — the terminal actually works"
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
      "commands: about · projects · skills · contact · socials · resume · clear\n" +
      "(psst — the path planner demo further down is clickable)",
    about:
      "CS freshman at the University of Cincinnati (co-op program, class of 2031).\n" +
      "Co-founder of Prism Robotics, a 501(c)(3) VEX U team. I build robot software\n" +
      "and the team website, and lead fundraising toward Worlds in April 2027.\n" +
      "Also: certified VEX Event Partner + Head Referee; mentor to 35+ middle\n" +
      "schoolers (350+ hours).",
    projects:
      "path-planner  — hermite spline routing for VEX U (Python)\n" +
      "prism-robotics — React site for our 501(c)(3) VEX U team\n" +
      "league-bot    — Discord bot, scaled a community to 1,500+ members\n" +
      "plant-monitor — desktop app + firmware sensor project\n" +
      "scroll to ~/projects, or try the live demo at ~/path-planner",
    skills:
      "Java · Python · C++ · JavaScript · React · HTML/CSS · MongoDB · SQL · Git",
    contact:
      "email:    hello@maxwellrobbins.com\n" +
      "github:   github.com/maxsr0\n" +
      "linkedin: linkedin.com/in/maxwell-robbins",
    socials:
      "github:   github.com/maxsr0\n" +
      "linkedin: linkedin.com/in/maxwell-robbins\n" +
      "chess:    chess.com — bestplayerduck (~1550, climbing)",
    resume:
      "resume.pdf lands here at launch. Until then, linkedin.com/in/maxwell-robbins\n" +
      "has the whole story, and the terminal command 'projects' has the fun parts."
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
      resp.textContent = replies[v] || "command not found: '" + v + "' — try 'help'";
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

    function draw(dot) {
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
      // robot dot
      if (dot) {
        ctx.fillStyle = "#7ee787";
        ctx.beginPath(); ctx.arc(dot.x, dot.y, 10, 0, 7); ctx.fill();
        ctx.strokeStyle = "#0d1117"; ctx.lineWidth = 2; ctx.stroke(); ctx.lineWidth = 1;
      }
      var counter = document.getElementById("pt-count");
      if (counter) counter.textContent = pts.length + " waypoints · catmull-rom spline (demo)";
    }

    draw(null);

    cv.addEventListener("click", function (e) {
      var r = cv.getBoundingClientRect();
      pts.push({
        x: (e.clientX - r.left) * (W / r.width),
        y: (e.clientY - r.top) * (H / r.height)
      });
      draw(null);
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
        draw(samples[Math.min(Math.floor(i), samples.length - 1)]);
        i += 1.8;
        if (i < samples.length) anim = requestAnimationFrame(step);
      })();
    });
  }

  /* ================= 4. Live GitHub strip ================= */
  var strip = document.getElementById("gh-strip");
  if (strip && window.fetch) {
    fetch("https://api.github.com/users/maxsr0/repos?sort=pushed&per_page=6")
      .then(function (r) {
        if (!r.ok) throw new Error("GitHub API " + r.status);
        return r.json();
      })
      .then(function (repos) {
        if (!repos || !repos.length) throw new Error("no repos");
        strip.innerHTML = "";
        repos.slice(0, 3).forEach(function (repo) {
          var card = document.createElement("article");
          card.className = "gh-card";
          var h = document.createElement("h3");
          var a = document.createElement("a");
          a.href = repo.html_url;
          a.target = "_blank";
          a.rel = "noopener";
          a.textContent = repo.name;
          h.appendChild(a);
          var p = document.createElement("p");
          p.textContent = repo.description || "No description — the code speaks for itself.";
          var meta = document.createElement("div");
          meta.className = "gh-meta";
          var pushed = new Date(repo.pushed_at);
          meta.textContent = (repo.language || "code") + " · pushed " +
            pushed.toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" });
          card.appendChild(h);
          card.appendChild(p);
          card.appendChild(meta);
          strip.appendChild(card);
        });
      })
      .catch(function () {
        strip.innerHTML =
          '<p class="gh-fallback">Couldn\'t reach the GitHub API just now — ' +
          'my latest work is at <a href="https://github.com/maxsr0" target="_blank" rel="noopener">' +
          "github.com/maxsr0</a>.</p>";
      });
  }

  /* ================= 5. Worlds countdown ================= */
  var status = document.getElementById("worlds-status");
  if (status) {
    var worlds = new Date(2027, 3, 24); // April 24, 2027 (displayed as "April 2027")
    var now = new Date();
    var days = Math.ceil((worlds - now) / (1000 * 60 * 60 * 24));
    if (days > 0) {
      status.textContent =
        "// status: worlds — April 2027 · T-minus " + days + " days · prism fundraising: open";
    } else {
      status.textContent = "// status: worlds season — April 2027 · it's go time";
    }
  }
})();
