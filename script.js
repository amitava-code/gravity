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
})();