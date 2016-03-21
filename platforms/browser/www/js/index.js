//CONSTANTS
var GAME_SCALE = 1;

var chessStage = new createjs.Stage("chessCanvas");
var preloadChess;
var manifestChess;

//Resource namespace



var app = {
    // Application Constructor
    initialize: function() {
        this.bindEvents();
    },
    // Bind Event Listeners
    //
    // Bind any events that are required on startup. Common events are:
    // 'load', 'deviceready', 'offline', and 'online'.
    bindEvents: function() {
        document.addEventListener('deviceready', this.onDeviceReady, false);
    },
    // deviceready Event Handler
    //
    // The scope of 'this' is the event. In order to call the 'receivedEvent'
    // function, we must explicitly call 'app.receivedEvent(...);'
    onDeviceReady: function() {
        app.receivedEvent('deviceready');
    },
    // Update DOM on a Received Event
    receivedEvent: function(id) {
        var parentElement = document.getElementById(id);
        var listeningElement = parentElement.querySelector('.listening');
        var receivedElement = parentElement.querySelector('.received');

        listeningElement.setAttribute('style', 'display:none;');
        receivedElement.setAttribute('style', 'display:block;');

        console.log('Received Event: ' + id);
    }
};

app.initialize();

function init() {
		
	var stage = new createjs.Stage("demoCanvas");
	var circle = new createjs.Shape();
	circle.graphics.beginFill("red").drawCircle(0,0,50);
	circle.x = 100;
	circle.y = 100;
	stage.addChild(circle);
		
	//stage.update();
	
	createjs.Tween.get(circle)
		.to({x:400}, 2000, createjs.Ease.getPowInOut(4))
		.to({alpha:0, y:75}, 500, createjs.Ease.getPowInOut(2))
		.to({alpha: 0, y:125}, 100)
		.to({alpha: 1, y:100}, 500, createjs.Ease.getPowInOut(2))
		.to({x:100}, 800, createjs.Ease.getPowInOut(2))
		;
			
	createjs.Ticker.setFPS(60);
	createjs.Ticker.addEventListener("tick",stage);
			
}

function initChess() {
	var chessStage = new createjs.Stage("chessCanvas");
	initGame();
	setupCanvasBoardPieces();
	//loadResources();
}

function setupCanvasBoardPieces() {
	var boardDrawing = new createjs.Bitmap("./img/board_8x8.svg");//(imgBoard);
	boardDrawing.ScaleX = boardDrawing.ScaleY = GAME_SCALE;
	chessStage.addChild(boardDrawing);
	
	squareHeight = document.getElementById('chessCanvas').width / 8;
	for (var i = 0; i < board.length; i--) {
		for (var j = 0; j < board[i].length; j++) {
			if (board[i][j]) {
				var piece = new createjs.Bitmap("./img/pieces_svg/" + lookupPieceResource(board[i][j]));
				piece.x = 1+j*60; piece.scaleX = 1.30*GAME_SCALE;
				piece.y = 1+(7-i)*60; piece.scaleY = 1.30*GAME_SCALE;
				chessStage.addChild(piece);
			}
		}
	}
	
	createjs.Ticker.setFPS(20);
	createjs.Ticker.addEventListener("tick",chessStage);
	
}

var soundID = "groove";
function playSound() {
	var media = new Media("../assets/groove.mp3");
	media.play();
}

function lookupPieceResource(piece) {
	var color;
	if (piece.color == 'B') { color = "black"; }
	else { color = "white"; }
	
	if (piece.pieceType == 'P') { return color + "_pawn.svg"; }
	else if (piece.pieceType == 'R') { return color + "_rook.svg"; }
	else if (piece.pieceType == 'N') { return color + "_knight.svg"; }
	else if (piece.pieceType == 'B') { return color + "_bishop.svg"; }
	else if (piece.pieceType == 'Q') { return color + "_queen.svg"; }
	else { return color + "_king.svg"; }
}

/*function loadResources() {
	var piecesDir = "./img/pieces_svg/";
	manifestChess = [
		{src: "./img/board_8x8.svg", id: "board"},
		{src: piecesDir+"black_pawn.svg", id:"blackpawn"}
	];
	preloadChess = new createjs.LoadQueue(true);
	preloadChess.on("complete",handleLoadComplete);
	preloadChess.loadManifest(manifestChess);
}

function handleLoadComplete(event) {
	console.log("files loaded!");
	imgBoard = preloadChess.getResult("board");
	imgBlackPawn = preloadChess.getResult("blackpawn");
	//document.body.innerHTML += "<img src=" + imgBoard + ">";
	setupCanvasBoardPieces();
}*/