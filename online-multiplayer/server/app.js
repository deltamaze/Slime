var app = require('express')();
var http = require('http').Server(app);
var firebase = require('firebase-admin');
var serviceAccount = require("./snakearcade-45688-firebase-adminsdk-d15fy-521e0e3393.json");

firebase.initializeApp({
    credential: firebase.credential.cert(serviceAccount),
    databaseURL: "https://snakearcade-45688.firebaseio.com"
});


app.use(function (req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    next();
});
app.get('/startgame/:roomName', function (req, res) {

    gameService = new GameService();
    gameService.startGame(req.params.roomName);
    res.send('<h1>' + req.params.roomName + '</h1>');
});

const PORT = process.env.PORT || 8080;
http.listen(PORT, function () {
});



function Snake() {
    this.vect = new Vector();
    this.tail = []
    this.playerNum = 0;
    this.total = 0;
    this.gameOver = false;
}
function Vector() {
    this.x = 0;
    this.y = 0;
}

function GameService() {
    this.snakes = [new Snake(), new Snake()]
    this.gameUpdateTime = 100;
    this.canvasHeight = 300;
    this.canvasWidth = 300;
    this.gameScale = 10;//how large game pixel is
    this.cols = Math.floor(this.canvasHeight / this.gameScale);
    this.rows = Math.floor(this.canvasWidth / this.gameScale);
    this.food = new Vector();
    this.room = 'Main';
    this.p1Ref;
    this.p2Ref;
    this.foodRef;
    this.snakeRef;
    this.p1;
    this.p2;

    this.timeCounter = 0;
    this.myTimer;
    this.gameEngine;
    this.refSet = false;



    this.startGame = function (roomName) {

        this.room = roomName
        this.p1Ref = firebase.database().ref('players/' + this.room + '/1');
        this.p2Ref = firebase.database().ref('players/' + this.room + '/2');
        this.foodRef = firebase.database().ref('food/' + this.room);
        this.snakeRef = firebase.database().ref('snakes/' + this.room);
        this.snakeRef.once('value').then(function (snapshot) {
            if (!snapshot.val()) {
                this.resetPlayerPosition(-1);
                this.saveSnakeLocation();
                this.setPlayers();
                this.spawnFood();
                this.myTimer = setInterval(this.gameEngine.bind(this), this.gameUpdateTime);
            }
        }.bind(this));


    }
    this.setPlayers = function () {

        this.snakes[0].playerNum = 1 //set up p1
        this.snakes[1].playerNum = 2 //set up p2
        this.p1Ref.on("value", function (snapshot) {
            this.p1 = snapshot.val();
            this.refSet = true;
        }.bind(this));
        this.p2Ref.on("value", function (snapshot) {
            this.p2 = snapshot.val();
            this.refSet = true;
        }.bind(this));
    }

    this.gameEngine = function () {
        this.timeCounter++;
        if (this.eatFood()) {
            this.spawnFood();
        }
        this.checkGameOver();//check to see if players lost
        this.updateSnake();
        this.saveSnakeLocation();

        //if player 1 and player 2 is dead end game
        //also end game if gametime exceeds 10 minutes incase player afk
        if ((this.p1 == null && this.p2 == null && this.refSet === true) || this.timeCounter > 3000)//if both players dead, or game time past 10 minutes, end timer
        {
            clearInterval(this.myTimer);
            this.p1Ref.set(null);//clean up
            this.p2Ref.set(null);//clean up
            this.snakeRef.set(null);
        }
    }

    this.spawnFood = function () {

        this.food.x = (Math.floor(Math.random() * (this.cols - 0 + 1)) + 0) * this.gameScale;
        this.food.y = (Math.floor(Math.random() * (this.rows - 0 + 1)) + 0) * this.gameScale;
        this.food = this.limitPosition(this.food);
        this.foodRef.set(this.food);
    }

    this.eatFood = function () {
        consumed = false;
        for (var j = 0; j < this.snakes.length; j++) {
            var d = this.calcDist(this.snakes[j].vect.x, this.snakes[j].vect.y, this.food.x, this.food.y);
            if (d < 1) {
                this.snakes[j].total++;
                consumed = true;
            }
        }
        return consumed;
    }

    this.checkGameOver = function () {
        for (var i = 0; i < this.snakes.length; i++)//See if Snake[i]'s head is overlapping with any tail position of any other snake.
        {
            for (var j = 0; j < this.snakes.length; j++)//grab all snakes(j) to see if the head of snake i is ontop of the body of snake j
            {
                for (var k = 1; k < this.snakes[j].tail.length; k++)//test all possible tail positions for snake J
                {
                    var pos = this.snakes[j].tail[k];

                    var d = this.calcDist(this.snakes[i].vect.x, this.snakes[i].vect.y, pos.x, pos.y);
                    if (d < 1) {
                        this.resetPlayerPosition(this.snakes[i].playerNum);

                        if (this.snakes[i].playerNum === 1) {
                            this.p1Ref.set(null);
                        }
                        if (this.snakes[i].playerNum === 2) {
                            this.p2Ref.set(null);
                        }
                    }
                }
            }
        }
    }
    this.updateSnake = function () {

        for (var j = 0; j < this.snakes.length; j++) {
            if (this.snakes[j].gameOver === true) {
                continue;
            }
            if (this.snakes[j].total > this.snakes[j].tail.length - 1) //snake as eaten something, so we must grow the tail 
            {
                this.snakes[j].tail[this.snakes[j].tail.length] = new Vector();
            }

            if (this.snakes[j].total >= 1)//if the snake has a tail, then update all tail units
            {

                for (var i = this.snakes[j].total; i >= 1; i--) {
                    this.snakes[j].tail[i].x = this.snakes[j].tail[i - 1].x;
                    this.snakes[j].tail[i].y = this.snakes[j].tail[i - 1].y;
                }
            }

            //update snake head position
            if (this.p1 != null && this.snakes[j].playerNum == 1) {

                this.snakes[j].vect.x = this.snakes[j].vect.x + this.p1.xSpeed * this.gameScale;
                this.snakes[j].vect.y = this.snakes[j].vect.y + this.p1.ySpeed * this.gameScale;
            }
            if (this.p2 != null && this.snakes[j].playerNum == 2) {
                this.snakes[j].vect.x = this.snakes[j].vect.x + this.p2.xSpeed * this.gameScale;
                this.snakes[j].vect.y = this.snakes[j].vect.y + this.p2.ySpeed * this.gameScale;
            }
            this.snakes[j].vect = this.limitPosition(this.snakes[j].vect);
            this.snakes[j].tail[0].x = this.snakes[j].vect.x;
            this.snakes[j].tail[0].y = this.snakes[j].vect.y;

        }
    }
    this.calcDist = function (x1, y1, x2, y2) {
        var a = x1 - x2
        var b = y1 - y2

        var c = Math.sqrt(a * a + b * b);
        return c;
    }
    this.resetPlayerPosition = function (playerNum) {

        if (playerNum === 1 || playerNum === -1) {
            this.snakes[0].vect.x = 0
            this.snakes[0].vect.y = 0
            this.snakes[0].total = 0
            this.snakes[0].tail = [];
            this.snakes[0].tail[0] = this.snakes[0].vect
        }
        if (playerNum === 2 || playerNum === -1) {
            this.snakes[1].vect.x = this.canvasWidth - this.gameScale;//player 1 default spot is set to 0,0 p2 is on the opposite side
            this.snakes[1].vect.y = 0
            this.snakes[1].total = 0
            this.snakes[1].tail = [];
            this.snakes[1].tail[0] = this.snakes[1].vect
        }
    }
    this.saveSnakeLocation = function (snakes) {
        this.snakeRef.set(this.snakes);
    }
    this.limitPosition = function (vect) {

        returnVect = new Vector();
        if (vect.x > (this.canvasWidth - this.gameScale)) {
            vect.x = (this.canvasWidth - this.gameScale);//limit x to canvas width
        }
        if (vect.y > (this.canvasHeight - this.gameScale)) {
            vect.y = (this.canvasHeight - this.gameScale);//limit y to canvas height
        }
        if (vect.x < (0)) {
            vect.x = 0;//limit x to canvas width
        }
        if (vect.y < (0)) {
            vect.y = (0);//limit y to canvas height
        }
        returnVect = vect;
        return returnVect;
    }
}