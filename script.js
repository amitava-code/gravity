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
})();