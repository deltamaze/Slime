/* global GameBody Matter */

class Ball extends GameBody { // eslint-disable-line no-unused-vars
  constructor(engineWorld, x, y, radius) {
    // config
    const colorBlue = 255;
    const colorGreen = 255;
    const colorRed = 255;
    const options = {
      label: 'ball',
      friction: 0,
      frictionAir: 0.01,
      restitution: 0.9,
      circleRadius: radius,
      density: 0.003,
    };
    const newBody = Matter.Bodies.circle(x, y, radius, options);

    super(engineWorld, newBody);
    this.colorBlue = colorBlue;
    this.colorRed = colorRed;
    this.colorGreen = colorGreen;
  }
}
