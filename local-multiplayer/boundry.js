class Boundry extends GameBody {
  constructor(engineWorld, x, y, width, height, polygonSideCount =0) {
    //config
    let colorBlue = 150;
    let colorGreen = 150;
    let colorRed = 150;
    var options = {
      label: 'Wall',
      isStatic: true,
      friction: 0,
      restitution: .9,
      density: 1

    };

    let newBody
    if (polygonSideCount > 0) { 
      newBody = Matter.Bodies.polygon(x, y, polygonSideCount, height,options) 
      console.log(newBody);
      //newBody.body.angle = 90;
      Matter.Body.rotate(newBody, Math.PI /2 )
    }
    else{ newBody = Matter.Bodies.rectangle(x, y, width, height, options); }


    super(engineWorld, newBody);
    this.colorBlue = colorBlue;
    this.colorRed = colorRed;
    this.colorGreen = colorGreen;
  }
}



