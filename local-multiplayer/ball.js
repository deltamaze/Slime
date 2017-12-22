class Ball extends GameBody {
    constructor(engineWorld,x,y,radius) {
      //config
      let maxSides = 100;
      let colorBlue = 255;
      let colorGreen = 255;
      let colorRed = 255;
      var options = {
        label: 'ball',
        isStatic: false,
        friction: 0,
        frictionAir:.01,
        restitution: .9,
        circleRadius: radius,
        density : .003

  
      };
      let newBody = Matter.Bodies.circle(x,y,radius,options);
      
      super(engineWorld, newBody);
      this.colorBlue = colorBlue;
      this.colorRed = colorRed;
      this.colorGreen = colorGreen;
    }
  }
  
  
  
  