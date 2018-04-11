/* global GameBody Matter */

class Player extends GameBody { // eslint-disable-line no-unused-vars
  constructor(engineWorld, radius, x, y, playerId) {
    // config
    let maxSides = 100; // smooth out circle edge
    let colorBlue = 255; // eslint-disable-line prefer-const
    let colorGreen = 100; // eslint-disable-line prefer-const
    let colorRed = 0; // eslint-disable-line prefer-const
    // let ticksOfUpwardThrust = 0; // eslint-disable-line
    const options = {
      label: `player${playerId.toString()}`,
      circleRadius: radius,
      isStatic: false,
      friction: 0,
      frictionAir: 1,
      restitution: -10,
      inertia: Infinity,
      density: 0.001,
    };

    // create object


    maxSides = maxSides || 25;
    let sides = Math.ceil(Math.max(10, Math.min(maxSides, radius)));

    // optimisation: always use even number of sides (half the number of unique axes)
    if (sides % 2 === 1) {
      sides += 1;
    }

    const theta = (2 * Math.PI) / sides;
    let path = '';
    const offset = theta * 0.5;
    // half cirlce, skip the bottom half of the circle, set i to sides/2
    for (let i = sides / 2; i < sides; i += 1) {
      const angle = offset + (i * theta);
      const xx = Math.cos(angle) * radius;
      const yy = Math.sin(angle) * radius;

      // path += 'L ' + xx.toFixed(3) + ' ' + yy.toFixed(3) + ' ';
      path += `L ${xx.toFixed(3)}  ${yy.toFixed(3)} `;
    }
    options.position = { x, y };
    options.vertices = Matter.Vertices.fromPath(path);

    const newBody = Matter.Body.create(options);


    super(engineWorld, newBody);
    this.colorBlue = colorBlue;
    this.colorRed = colorRed;
    this.colorGreen = colorGreen;
    this.ticksOfUpwardThrust = 0;
    this.hitCount = 0;
    this.lastHit = 0;
    this.score = 0;
    this.username = '';
    this.userHash = '';
  }
}
