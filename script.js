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
})();