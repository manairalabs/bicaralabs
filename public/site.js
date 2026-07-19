(function () {
  var btns = document.querySelectorAll('.tab-btn');
  var panels = document.querySelectorAll('.tab-panel');
  btns.forEach(function (btn) {
    btn.addEventListener('click', function () {
      btns.forEach(function (b) { b.classList.remove('active'); });
      panels.forEach(function (p) { p.classList.remove('active'); });
      btn.classList.add('active');
      document.querySelector('.tab-panel[data-panel="' + btn.dataset.tab + '"]').classList.add('active');
    });
  });

  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var canvas = document.getElementById('signal');
  if (!canvas) return; // hero uses static blueprint art now; tab logic above still runs
  var ctx = canvas.getContext('2d');
  var dpr = Math.min(window.devicePixelRatio || 1, 2);
  var w, h, t = 0;

  function getColor(varName, fallback) {
    var v = getComputedStyle(document.documentElement).getPropertyValue(varName).trim();
    return v || fallback;
  }

  function hexToRgb(hex) {
    hex = hex.replace('#', '');
    return {
      r: parseInt(hex.substring(0, 2), 16),
      g: parseInt(hex.substring(2, 4), 16),
      b: parseInt(hex.substring(4, 6), 16)
    };
  }

  function resize() {
    var rect = canvas.parentElement.getBoundingClientRect();
    w = rect.width; h = rect.height;
    canvas.width = w * dpr; canvas.height = h * dpr;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }
  window.addEventListener('resize', resize);
  resize();

  var heroContentEl = document.querySelector('.hero-content');
  var heroTitleEl = document.querySelector('.hero-title');
  var heroSubEl = document.querySelector('.hero-sub');
  var debugEl = document.getElementById('debug-readout');
  var debugFrame = 0;

  var wrapEl = document.querySelector('.hero .wrap');

  function getTextBoundary() {
    var heroRect = canvas.parentElement.getBoundingClientRect();
    var wrapRect = wrapEl.getBoundingClientRect();
    var contentRect = heroContentEl.getBoundingClientRect();
    var titleRect = heroTitleEl.getBoundingClientRect();
    var subRect = heroSubEl.getBoundingClientRect();
    // true right edge = the widest of the container and the text elements actually
    // inside it (catches the text overflowing its own container's box, not just
    // trusting the container's declared width)
    var rightmost = Math.max(contentRect.right, titleRect.right, subRect.right);
    var measured = (rightmost - heroRect.left) + 56;
    var clamped = Math.min(Math.max(measured, w * 0.30), w * 0.74);

    debugFrame++;
    if (debugEl) {
      debugEl.textContent =
        'w=' + Math.round(w) + ' h=' + Math.round(h) + ' dpr=' + dpr + '\n' +
        'wrap.left=' + Math.round(wrapRect.left) + ' wrap.right=' + Math.round(wrapRect.right) + ' wrap.width=' + Math.round(wrapRect.width) + '\n' +
        'hero-content.left=' + Math.round(contentRect.left) + '\n' +
        'hero-content.right=' + Math.round(contentRect.right) + '\n' +
        'hero-title.right=' + Math.round(titleRect.right) + '\n' +
        'hero-sub.right=' + Math.round(subRect.right) + '\n' +
        'rightmost=' + Math.round(rightmost) + '\n' +
        'measured(+56)=' + Math.round(measured) + '\n' +
        'clipX(clamped)=' + Math.round(clamped);
    }

    return clamped;
  }

  // ---- isometric building-block scene: a skyline of assembling blocks ----
  var GRID = 10;
  var cells = [];

  function rand(a, b) { return a + Math.random() * (b - a); }

  function pickTarget(distFromCenter) {
    // taller near the middle, shorter toward the edges - reads as a deliberate structure, not noise
    var base = Math.max(0, 5.5 - distFromCenter * 0.85);
    return Math.round(rand(1, base + 1.5));
  }

  function initGrid() {
    cells = [];
    for (var i = 0; i < GRID; i++) {
      for (var j = 0; j < GRID; j++) {
        var distFromCenter = Math.hypot(i - GRID / 2, j - GRID / 2);
        var accent = Math.random() < 0.09;
        var startTarget = pickTarget(distFromCenter);
        cells.push({
          i: i, j: j,
          current: 0, // rise into place on load - a real "assembling" moment,
          target: startTarget, // not a static pop-in
          nextChangeAt: rand(120, 420),
          accent: accent,
          settle: rand(0.030, 0.055)
        });
      }
    }
  }
  initGrid();

  function isoProject(i, j, heightPx, originX, originY, tileW, tileH) {
    var x = originX + (i - j) * (tileW / 2);
    var y = originY + (i + j) * (tileH / 2) - heightPx;
    return { x: x, y: y };
  }

  function shade(rgb, factor) {
    return 'rgb(' + Math.round(rgb.r * factor) + ',' + Math.round(rgb.g * factor) + ',' + Math.round(rgb.b * factor) + ')';
  }

  function drawColumn(originX, originY, tileW, tileH, i, j, heightUnits, blockUnit, topRgb, leftRgb, rightRgb, lineRgba) {
    if (heightUnits <= 0.01) return;
    var base = isoProject(i, j, 0, originX, originY, tileW, tileH);
    var H = heightUnits * blockUnit;
    var hw = tileW / 2, hh = tileH / 2;
    var bx = base.x, by = base.y;

    // top face
    ctx.beginPath();
    ctx.moveTo(bx, by - H - hh);
    ctx.lineTo(bx + hw, by - H);
    ctx.lineTo(bx, by - H + hh);
    ctx.lineTo(bx - hw, by - H);
    ctx.closePath();
    ctx.fillStyle = shade(topRgb, 1);
    ctx.fill();
    ctx.strokeStyle = lineRgba;
    ctx.lineWidth = 1;
    ctx.stroke();

    // left face
    ctx.beginPath();
    ctx.moveTo(bx - hw, by - H);
    ctx.lineTo(bx, by - H + hh);
    ctx.lineTo(bx, by + hh);
    ctx.lineTo(bx - hw, by);
    ctx.closePath();
    ctx.fillStyle = shade(leftRgb, 1);
    ctx.fill();
    ctx.stroke();

    // right face
    ctx.beginPath();
    ctx.moveTo(bx, by - H + hh);
    ctx.lineTo(bx + hw, by - H);
    ctx.lineTo(bx + hw, by);
    ctx.lineTo(bx, by + hh);
    ctx.closePath();
    ctx.fillStyle = shade(rightRgb, 1);
    ctx.fill();
    ctx.stroke();
  }

  function drawFrame() {
    var signalHex = getColor('--signal', '#187CB1');
    var lineHex = getColor('--line', '#D3D7C8');
    var surfaceHex = getColor('--surface', '#FFFFFF');
    var signalRgb = hexToRgb(signalHex.startsWith('#') ? signalHex : '#187CB1');
    var neutralRgb = hexToRgb(surfaceHex.startsWith('#') ? surfaceHex : '#FFFFFF');
    var lineRgb = hexToRgb(lineHex.startsWith('#') ? lineHex : '#D3D7C8');
    var lineRgba = 'rgba(' + lineRgb.r + ',' + lineRgb.g + ',' + lineRgb.b + ',0.9)';

    ctx.clearRect(0, 0, w, h);

    // No hard vertical clip: the structure is intentionally wider than the
    // right-hand band, so a hard cut at the text column always clipped its left
    // tip. Instead the blocks render full-width and bleed UNDER the text; the
    // .hero-scrim gradient (ground -> transparent) fades them out behind the
    // headline, so the text sits on a transparent-feeling backdrop, not a seam.
    getTextBoundary(); // keep debug readout live
    ctx.save();
    ctx.beginPath();
    ctx.rect(0, 0, w, h);
    ctx.clip();

    var tileW = Math.max(44, Math.min(w, h) * 0.10);
    var tileH = tileW * 0.52;
    var blockUnit = tileH * 0.62;
    var originX = w * 0.62;
    var originY = h * 0.28;

    // gentle global bob so the whole structure feels alive, not static
    var bob = Math.sin(t * 0.012) * 3;

    var order = cells.slice().sort(function (a, b) { return (a.i + a.j) - (b.i + b.j); });

    for (var k = 0; k < order.length; k++) {
      var c = order[k];
      if (t >= c.nextChangeAt) {
        var distFromCenter = Math.hypot(c.i - GRID / 2, c.j - GRID / 2);
        c.target = pickTarget(distFromCenter);
        c.nextChangeAt = t + rand(160, 420);
      }
      c.current += (c.target - c.current) * c.settle;

      var topRgb, leftRgb, rightRgb;
      if (c.accent) {
        topRgb = { r: signalRgb.r, g: signalRgb.g, b: signalRgb.b };
        leftRgb = { r: signalRgb.r * 0.78, g: signalRgb.g * 0.78, b: signalRgb.b * 0.78 };
        rightRgb = { r: signalRgb.r * 0.6, g: signalRgb.g * 0.6, b: signalRgb.b * 0.6 };
      } else {
        var lift = 0.90;
        topRgb = { r: neutralRgb.r * lift, g: neutralRgb.g * lift, b: neutralRgb.b * lift };
        leftRgb = { r: neutralRgb.r * 0.80, g: neutralRgb.g * 0.80, b: neutralRgb.b * 0.80 };
        rightRgb = { r: neutralRgb.r * 0.66, g: neutralRgb.g * 0.66, b: neutralRgb.b * 0.66 };
      }

      drawColumn(originX, originY + bob, tileW, tileH, c.i, c.j, c.current, blockUnit, topRgb, leftRgb, rightRgb, lineRgba);
    }

    ctx.restore();
  }

  if (reduceMotion) {
    // still settle into place once (a bounded, non-looping animation is
    // generally fine under reduced-motion; it's continuous/parallax motion
    // that's the concern) - then stop for good, no infinite loop.
    var settleFrames = 0;
    function settleOnce() {
      t += 1;
      drawFrame();
      settleFrames += 1;
      if (settleFrames < 150) requestAnimationFrame(settleOnce);
    }
    requestAnimationFrame(settleOnce);
  } else {
    function loop() {
      t += 1;
      drawFrame();
      requestAnimationFrame(loop);
    }
    requestAnimationFrame(loop);
  }
})();