var app = require('express')();
var http = require('http').Server(app);






app.use(function (req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    next();
});
console.log("Server Started");
app.get('/startSlimeGame/:roomName', function (req, res) {

    gameService = new GameService();
    gameService.startGame(req.params.roomName);
    res.send('<h1>' + req.params.roomName + '</h1>');
});

const PORT = process.env.PORT || 8080;
http.listen(PORT, function () {
});



const io = require('socket.io')(http);
function onConnection(socket){
  socket.on('drawing', (data) => socket.broadcast.emit('drawing', data));
}
io.on('connection', onConnection);



function GameService() {

    this.gameUpdateTime = 100;
    this.canvasHeight = 400;
    this.canvasWidth = 800;
    this.room = 'Main';

    this.timeCounter = 0;
    this.myTimer;
    this.gameEngine;


    this.startGame = function (roomName) {

        this.room = roomName
        console.log("start game called:"+ roomName.toString());
        this.myTimer = setInterval(this.gameEngine.bind(this), this.gameUpdateTime);


    }


    this.gameEngine = function () {
        this.timeCounter++;
        console.log(this.timeCounter);
        
  
        this.checkGameOver();//check to see if players lost
        //also end game if gametime exceeds 10 minutes incase player afk
       
        console.log();
        if (this.timeCounter > 3000)//if both players dead, or game time past 10 minutes, end timer
        {
            clearInterval(this.myTimer);
            
        }
    }


    this.checkGameOver = function () {
        //if score hits score limit, end game, return true

    }
    this.updateSnake = function () {

    }
    this.resetPosition = function (playerNum) {

        //move players back to spawn, and also ball
    }
}












