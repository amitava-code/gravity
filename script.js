(function () {
  var stage = document.getElementById("stage");
  var W = window.innerWidth,
    H = window.innerHeight;

  var Engine = Matter.Engine,
    World = Matter.World,
    Bodies = Matter.Bodies,
    Body = Matter.Body,
    Vertices = Matter.Vertices,
    Mouse = Matter.Mouse,
    MouseConstraint = Matter.MouseConstraint,
    Events = Matter.Events,
    Runner = Matter.Runner;

  var engine = Engine.create();
  engine.gravity.y = 0.9;
  var world = engine.world;

  var wallThickness = 100;
  var BOTTOM_PADDING = 60;
  function buildWalls() {
    var floorTop = H - BOTTOM_PADDING;
    var floor = Bodies.rectangle(
      W / 2,
      floorTop + wallThickness / 2,
      W * 4,
      wallThickness,
      { isStatic: true },
    );
    var leftWall = Bodies.rectangle(
      -wallThickness / 2,
      H / 2,
      wallThickness,
      H * 4,
      { isStatic: true },
    );
    var rightWall = Bodies.rectangle(
      W + wallThickness / 2,
      H / 2,
      wallThickness,
      H * 4,
      { isStatic: true },
    );
    World.add(world, [floor, leftWall, rightWall]);
  }
  buildWalls();

  var LETTER_COLOR = "#f5f4ef";
  var FONT_URL =
    "https://cdn.jsdelivr.net/gh/google/fonts@main/ofl/archivoblack/ArchivoBlack-Regular.ttf";
  var FONT_SIZE = 200;
  var WORD = "AMITAVA COHORT 3".split("");
  var FULL_POOL = "AMITAVA COHORT 3".split("");
  var UNIQUE = Array.from(new Set(FULL_POOL));

  var bodies = [],
    recs = [];
  var cache = {};

  function flattenPath(commands) {
    var pts = [];
    var cur = { x: 0, y: 0 };
    var start = { x: 0, y: 0 };
    function quad(p0, p1, p2, n) {
      for (var i = 1; i <= n; i++) {
        var t = i / n,
          mt = 1 - t;
        pts.push({
          x: mt * mt * p0.x + 2 * mt * t * p1.x + t * t * p2.x,
          y: mt * mt * p0.y + 2 * mt * t * p1.y + t * t * p2.y,
        });
      }
    }
    function cubic(p0, p1, p2, p3, n) {
      for (var i = 1; i <= n; i++) {
        var t = i / n,
          mt = 1 - t;
        pts.push({
          x:
            mt * mt * mt * p0.x +
            3 * mt * mt * t * p1.x +
            3 * mt * t * t * p2.x +
            t * t * t * p3.x,
          y:
            mt * mt * mt * p0.y +
            3 * mt * mt * t * p1.y +
            3 * mt * t * t * p2.y +
            t * t * t * p3.y,
        });
      }
    }
    commands.forEach(function (c) {
      if (c.type === "M") {
        cur = { x: c.x, y: c.y };
        start = { x: c.x, y: c.y };
        pts.push({ x: cur.x, y: cur.y });
      } else if (c.type === "L") {
        cur = { x: c.x, y: c.y };
        pts.push({ x: cur.x, y: cur.y });
      } else if (c.type === "Q") {
        quad(cur, { x: c.x1, y: c.y1 }, { x: c.x, y: c.y }, 6);
        cur = { x: c.x, y: c.y };
      } else if (c.type === "C") {
        cubic(
          cur,
          { x: c.x1, y: c.y1 },
          { x: c.x2, y: c.y2 },
          { x: c.x, y: c.y },
          8,
        );
        cur = { x: c.x, y: c.y };
      } else if (c.type === "Z") {
        cur = { x: start.x, y: start.y };
      }
    });
    return pts;
  }

  function buildCache(font) {
    UNIQUE.forEach(function (ch) {
      var path = font.charToGlyph(ch).getPath(0, 0, FONT_SIZE);
      var bbox = path.getBoundingBox();
      var w = bbox.x2 - bbox.x1,
        h = bbox.y2 - bbox.y1;
      var pts = flattenPath(path.commands);
      var hull = Vertices.hull(pts);
      var center = Vertices.centre(hull);
      cache[ch] = {
        d: path.toPathData(2),
        bbox: bbox,
        w: w,
        h: h,
        hull: hull,
        centerX: center.x,
        centerY: center.y,
        originX: center.x - bbox.x1,
        originY: center.y - bbox.y1,
      };
    });
  }
  function createLetter(ch, x, y, angle, isStatic) {
    var data = cache[ch];
    if (!data) return null;

    var body = Bodies.fromVertices(x, y, [data.hull], {
      restitution: 0.5,
      friction: 0.55,
      frictionAir: 0.001,
      isStatic: !!isStatic,
    });
    Body.setAngle(body, angle || 0);

    var wrap = document.createElement("div");
    wrap.className = "letter-wrap";
    wrap.style.width = data.w + "px";
    wrap.style.height = data.h + "px";
    wrap.style.transformOrigin = data.originX + "px " + data.originY + "px";
    wrap.innerHTML =
      '<svg width="' +
      data.w +
      '" height="' +
      data.h +
      '" viewBox="' +
      data.bbox.x1 +
      " " +
      data.bbox.y1 +
      " " +
      data.w +
      " " +
      data.h +
      '" style="display:block;overflow:visible;"><path d="' +
      data.d +
      '" fill="' +
      LETTER_COLOR +
      '" fill-rule="evenodd"/></svg>';
    stage.appendChild(wrap);

    World.add(world, body);
    bodies.push(body);
    recs.push(wrap);
    return body;
  }
  function dropRandom() {
    var ch = FULL_POOL[Math.floor(Math.random() * FULL_POOL.length)];
    var margin = (cache[ch] ? cache[ch].w / 2 : 60) + 20;
    var x = margin + Math.random() * (W - margin * 2);
    var y = -150;
    var angle = (Math.random() - 0.5) * 1.2;
    var body = createLetter(ch, x, y, angle, false);
    if (body) Body.setAngularVelocity(body, (Math.random() - 0.5) * 0.2);
  }

  opentype.load(FONT_URL, function (err, font) {
    if (err) {
      console.error("font load failed", err);
      return;
    }

    function layoutWord() {
      var cursor = 0;
      var prevWasLetter = false;
      var positions = [];
      WORD.forEach(function (ch) {
        if (ch === " ") {
          cursor += FONT_SIZE * 0.34;
          positions.push(null);
          prevWasLetter = false;
          return;
        }
        if (prevWasLetter) cursor += FONT_SIZE * 0.09;
        positions.push(cursor);
        cursor += cache[ch].w;
        prevWasLetter = true;
      });
      return { positions: positions, total: cursor };
    }
    var REF = 100;
    FONT_SIZE = REF;
    buildCache(font);
    var refLayout = layoutWord();
    FONT_SIZE = Math.max(
      50,
      Math.min(220, ((W * 0.86) / refLayout.total) * REF),
    );

    buildCache(font);
    var layout = layoutWord();

    var wordBodies = [];
    var startX = (W - layout.total) / 2;
    var baselineY = Math.min(H * 0.32, H * 0.5 - 40);
    WORD.forEach(function (ch, i) {
      var pos = layout.positions[i];
      if (pos === null) return;
      var data = cache[ch];
      var bx = startX + pos + data.originX;
      var by = baselineY + data.centerY;
      var body = createLetter(ch, bx, by, 0, true);
      if (body) wordBodies.push(body);
    });

    function dropWordFromSky() {
      WORD.forEach(function (ch, i) {
        var pos = layout.positions[i];
        if (pos === null) return;
        var data = cache[ch];
        var bx = startX + pos + data.originX;
        var by = -200 - Math.random() * 260;
        var angle = (Math.random() - 0.5) * 0.9;
        var body = createLetter(ch, bx, by, angle, false);
        if (body) Body.setAngularVelocity(body, (Math.random() - 0.5) * 0.2);
      });
    }
  });
})();