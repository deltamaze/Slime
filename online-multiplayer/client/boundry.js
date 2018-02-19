/* global GameBody Matter */
class Boundry extends GameBody { // eslint-disable-line no-unused-vars
  constructor(engineWorld, x, y, width, height, polygonSideCount = 0, name = 'Wall') {
    // config
    const colorBlue = 150;
    const colorGreen = 150;
    const colorRed = 150;
    const options = {
      label: name,
      isStatic: true,
      friction: 0,
      restitution: 0.9,
      density: 1,

    };

    let newBody;
    if (polygonSideCount > 0) {
      newBody = Matter.Bodies.polygon(x, y, polygonSideCount, height, options);
      Matter.Body.rotate(newBody, Math.PI / 2);
    } else {
      newBody = Matter.Bodies.rectangle(x, y, width, height, options);
    }
    super(engineWorld, newBody);
    this.colorBlue = colorBlue;
    this.colorRed = colorRed;
    this.colorGreen = colorGreen;
  }
}

