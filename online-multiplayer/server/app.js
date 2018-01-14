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
//socket methods
//relay a gameItemObject, with player pos, ball pos/velocity, round num, scores
//on client if roundnum != the server roundnum, then update round num, and ball pos, otherwise, update ball pos if ball is not on their side of the court


//RESTful methods


function GameService() {

    this.gameUpdateTime = 100;
    this.canvasHeight = 400;
    this.canvasWidth = 800;
    this.room = 'Main';

    this.frameCounter = 0;
    this.myTimer;
    this.gameEngine;


    this.startGame = function (roomName) {

        this.room = roomName
        console.log("start game called:"+ roomName.toString());
        this.myTimer = setInterval(this.gameEngine.bind(this), this.gameUpdateTime);


    }


    this.gameEngine = function () {
        this.frameCounter++;
        
  
        this.checkGameOver();//check to see if players lost
        //also end game if gametime exceeds 10 minutes incase player afk
       
        console.log();
        if (this.frameCounter > 3000)//if both players dead, or game time past 10 minutes, end timer
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

        //move players back to spawn, and tell clients ball angular velocity so that it's synced up on both clients
    }
}












