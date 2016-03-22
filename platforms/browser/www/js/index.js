//CONSTANTS
var GAME_SCALE = 1;
var PIECE_SCALE = 1.3;
var STAND_SIZE = 480;
var OFF_X = 1;
var OFF_Y = 1;

var chessStage = new createjs.Stage("chessCanvas");
var preloadChess;
var manifestChess;
var pieceLocationIndex = [];
var boardOfObjects = [];

//Resource namespace

function initChess() {
	setupViewSize();
	var chessStage = new createjs.Stage("chessCanvas");
	initGame();
	setupCanvasBoardPieces();
	//loadResources();
}

function setupCanvasBoardPieces() {
	var boardDrawing = new createjs.Bitmap("./img/board_8x8.svg");//(imgBoard);
	chessStage.addChild(boardDrawing);
	
	//Tracks the display objects
	boardOfObjects = new Array(8);
	for (var i = 0; i < boardOfObjects.length; i++) {
        boardOfObjects[i] = new Array(8);
        for (var j = 0; j < boardOfObjects[i].length; j++) {
            boardOfObjects[i][j] = null;
        }
    }
	
	squareHeight = document.getElementById('chessCanvas').width / 8;
	for (var i = 0; i < board.length; i++) {
		for (var j = 0; j < board[i].length; j++) {
			if (board[i][j]) {
				var piece = new createjs.Bitmap("./img/pieces_svg/" + lookupPieceResource(board[i][j]));
				pieceLocationIndex[piece.id] = board[i][j];
				piece.on("pressmove", piecePressed);
				piece.on("pressup", pieceReleased);
				piece.x = OFF_X+j*60; piece.scaleX = PIECE_SCALE;
				piece.y = OFF_Y+(7-i)*60; piece.scaleY = PIECE_SCALE;
				chessStage.addChild(piece);
				boardOfObjects[i][j] = piece;
			}
		}
	}
	
	createjs.Ticker.setFPS(30);
	createjs.Ticker.addEventListener("tick",chessStage);
}

function piecePressed(evt) {
	chessStage.setChildIndex( evt.target, chessStage.getNumChildren()-1);
	evt.target.x = evt.stageX/GAME_SCALE-evt.target.getBounds().width/2;
	evt.target.y = evt.stageY/GAME_SCALE-evt.target.getBounds().height/2;
}

function pieceReleased(evt) {
	board_piece = pieceLocationIndex[evt.target.id];
	var j = Math.floor((evt.stageX/GAME_SCALE)/60);
	var i = 7-Math.floor((evt.stageY/GAME_SCALE)/60);
	var orgX = board_piece.squareX;
	var orgY = board_piece.squareY;
	if (checkMoveLegality(orgY,orgX,i,j)) {
		movePiece(orgY,orgX,i,j);
		if (boardOfObjects[i][j]) { //Removes the piece below
			chessStage.removeChild(boardOfObjects[i][j]);
		}
		boardOfObjects[i][j] = evt.target;
		boardOfObjects[orgY][orgX] = null;
	}
	evt.target.x = OFF_X+board_piece.squareX*60; //snap X
	evt.target.y = OFF_Y+(7-board_piece.squareY)*60; //snap Y
	//evt.target.x = OFF_X+j*60;
	//evt.target.y = OFF_Y+(7-i)*60;
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

function setupViewSize() {
	var canvas = document.getElementById("chessCanvas");
	var maxWindowSize = Math.min(window.innerWidth,window.innerHeight);
	canvas.width = maxWindowSize;
	canvas.height = maxWindowSize;
	GAME_SCALE = maxWindowSize/480;
	chessStage.scaleX = GAME_SCALE;
	chessStage.scaleY = GAME_SCALE;
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