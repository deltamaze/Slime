var app = require('express')();
var http = require('http').Server(app);
let gameObjects = [];//all the game objects which all threads will access





app.use(function (req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    next();
});
console.log("Server Started");
app.get('/JoinSlimeGame/:roomName', function (req, res) {

    gameService = new GameService();
    gameService.playerJoinGame(req.params.roomName);
    res.send('<h1>' + req.params.roomName + '</h1>');
});

const PORT = process.env.PORT || 8080;
http.listen(PORT, function () {
});



const io = require('socket.io')(http);

io.on('connection', function (socket) {


    console.log('a user connected');
    
    //joinGame
    socket.on('joinGame', function (joinGameInfo) {
        console.log('a user joined game:');
        let targetGame = gameObjects[joinGameInfo.gameName];
        console.log(gameObjects[joinGameInfo.gameName]);
        
        let newPlayer = {
            playerName:joinGameInfo.playerName,
            playerHash:hash(joinGameInfo.playerGuid),
            ts : new Date().getTime(),
            score: 0
        }

        if (gameObjects[joinGameInfo.gameName] == [] || gameObjects[joinGameInfo.gameName] == null) {//no game exist for recieved gameroom, so create.
            gameObjects[joinGameInfo.gameName] = {
                players: [],
                inProgress: false,
                ts : new Date().getTime()
            }
            console.log('1');
            gameObjects[joinGameInfo.gameName].players.push(newPlayer);
            
        }
        
        else if (gameObjects[joinGameInfo.gameName].players.length < 2) { //game exist and room for player to add game
            //player 1 hash cannot = player 2 hash
            console.log('2');
            if(!(gameObjects[joinGameInfo.gameName].players.length ===1 && 
                newPlayer.playerHash === gameObjects[joinGameInfo.gameName].players[0].playerHash))
                {
                    gameObjects[joinGameInfo.gameName].players.push(newPlayer);
                    console.log('3');
                    
                }
                else{
                    console.log("same player joined 2 times");
                    console.log(gameObjects);
                    console.log('4');
                }
            
        }
        
        if(gameObjects[joinGameInfo.gameName].players.length === 2)//start game
        {   
            gameObjects[joinGameInfo.gameName].inProgress = true;//start game
            console.log('GameStart');
            console.log(gameObjects);
            console.log(gameObjects[joinGameInfo.gameName].players);
        }
        //this.myTimer = setInterval(this.gameEngine.bind(this), this.gameUpdateTime);
        console.log('5');
        console.log(gameObjects[joinGameInfo.gameName].players.length);
    });
    socket.on('chat message', function (msg) {
        console.log('message: ' + msg);
        io.emit('chat message', test);
    });
    socket.on('disconnect', function () {
        console.log('user disconnected');
    });
    emitPlayerRefresh= function (players)
    {
        io.emit('playerRefresh', players);
    }


    addPlayerToGame = function () {
        

    }

    gameEngine = function () {
        this.frameCounter++;
        this.checkGameOver();//check to see if players lost
        //also end game if gametime exceeds 10 minutes incase player afk

        console.log();
        if (this.frameCounter > 3000)//if both players dead, or game time past 10 minutes, end timer
        {
            clearInterval(this.myTimer);
        }
    }
    hash = function(guid) {
        var hash = 0, i, chr;
        if (guid.length === 0) return hash;
        for (i = 0; i < guid.length; i++) {
            chr = guid.charCodeAt(i);
            hash = ((hash << 5) - hash) + chr;
            hash |= 0; // Convert to 32bit integer
        }
        return hash;
    }
    checkGameOver = function () {
        //if score hits score limit, end game, return true
    }
    resetPosition = function (playerNum) {
        //move players back to spawn, and tell clients ball angular velocity so that it's synced up on both clients
    }
});
//socket methods
//relay a gameItemObject, with player pos, ball pos/velocity, round num, scores
//on client if roundnum != the server roundnum, then update round num, and ball pos, otherwise, update ball pos if ball is not on their side of the court





