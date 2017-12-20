class Boundry extends GameBody {
    constructor(engineWorld,x,y,width,height) {
      //config
      let maxSides = 10;
      let colorBlue = 150;
      let colorGreen = 150;
      let colorRed = 150;
      var options = {
        label: 'Wall',
        isStatic: true,
        friction: 1,
        restitution: 0
  
      };
      let newBody = Matter.Bodies.rectangle(x,y,width,height,options);
  
      super(engineWorld, newBody);
      this.colorBlue = colorBlue;
      this.colorRed = colorRed;
      this.colorGreen = colorGreen;
    }
  }
  
  
  
  