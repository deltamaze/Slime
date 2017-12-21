class Player extends GameBody {
  constructor(engineWorld,radius,x,y) {
    
    //config
    let maxSides = 100;//smooth out circle edge
    let colorBlue = 255;
    let colorGreen = 100;
    let colorRed = 0;
    let ticksOfUpwardThrust = 0
    var options = {
      label: 'player',
      circleRadius: radius,
      isStatic: false,
      friction: 0,
      frictionAir:1,
      restitution: -10,
      inertia :Infinity ,
      density : .001
    };

    //create object

    
    maxSides = maxSides || 25;
    var sides = Math.ceil(Math.max(10, Math.min(maxSides, radius)));

    // optimisation: always use even number of sides (half the number of unique axes)
    if (sides % 2 === 1) {
      sides += 1;
    }

    var theta = 2 * Math.PI / sides,
      path = '',
      offset = theta * 0.5;
    //half cirlce, skip the bottom half of the circle, set i to sides/2
    for (var i = sides/2; i < sides; i += 1) {
      var angle = offset + (i * theta),
        xx = Math.cos(angle) * radius,
        yy = Math.sin(angle) * radius;

      path += 'L ' + xx.toFixed(3) + ' ' + yy.toFixed(3) + ' ';
    }
    options.position = { x: x, y: y };
    options.vertices = Matter.Vertices.fromPath(path)

    if (options.chamfer) {
      var chamfer = options.chamfer;
      polygon.vertices =  Matter.Vertices.chamfer(polygon.vertices, chamfer.radius,
        chamfer.quality, chamfer.qualityMin, chamfer.qualityMax);
      delete options.chamfer;
    }

    let newBody = Matter.Body.create(options);


    super(engineWorld, newBody);
    this.colorBlue = colorBlue;
    this.colorRed = colorRed;
    this.colorGreen = colorGreen;
  }
}



