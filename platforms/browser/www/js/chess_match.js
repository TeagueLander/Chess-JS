
var board;
var kingW;
var kingB;
var moveCounter = 0;
var moveList = []; //moveList holds list of type [int,int,gamePiece,int,int,gamePiece]
nextPlayer = "W";

function initGame() {
    
    setupBoard();
	var moveCounter = 0;
	var moveList = [];
    var nextPlayer = "W";
	var castleAllowedB = true;
	var castleAllowedW = true;
    printBoard();
    
}

function resetGame() {
	initGame();
	initChess();
}

//Used for the 'Enter move' box
function parseCommand() {
	var command = document.getElementById("moveTextBox").value;
	document.getElementById("moveTextBox").value = "";
	command = /^[a-h][1-8]-[a-h][1-8]$/.exec(command);
	var s0 = /^[a-h][1-8]/.exec(command);
	var s1 = /[a-h][1-8]$/.exec(command);
	if (s0 && s1) {
		var mc = moveCounter + 1;
		document.getElementById('moveList').innerHTML += 
			"<p>" + mc + ". " + s0 + '-' + s1 + "<p>";
		var f0 = /[a-h]/.exec(s0)[0].charCodeAt(0) - 97;
		var r0 = /[1-8]/.exec(s0)-1;
		var f1 = /[a-h]/.exec(s1)[0].charCodeAt(0) - 97;
		var r1 = /[1-8]/.exec(s1)-1;
		movePiece(r0,f0,r1,f1);
	}else {
		document.getElementById('moveList').innerHTML += "<p> Invalid command </p>";
	}
}

//Returns true for standard moves, "passant", "castle", "promotion" otherwise
function checkMoveLegality(r0,f0,r1,f1) {
	if (r0 > 7 || f0 > 7 || r1 > 7 || f1 > 7 || r0 < 0 || f0 < 0 || r1 < 0 || f1 < 0) {
		console.log("Outside bounds");
		return false;
	}else if (r0 == r1 && f0 == f1) {
		console.log("No move");
		return false;
	}else {
		//Check legal moves of each piece
		var curP = board[r0][f0]
		//Check turn
		if (nextPlayer != curP.color) {
			return false;
		}
		//Pawn
		if (curP.pieceType == "P") {
			var legal = checkPawmMoveLegality(r0,f0,r1,f1);
			if (legal == false) {
				return false;
			}else if (typeof legal === 'string') {
				return legal;
			}else if (r1 == 0 || r1 == 7) {
				return "promotion";
			}
		}
		else if (curP.pieceType == "R") {
			if (!rookReachable(r0,f0,r1,f1)) {
				return false;
			}
				
		}
		else if (curP.pieceType == "B") {
			if (!bishopReachable(r0,f0,r1,f1)) {
				return false;
			}
		}
		else if (curP.pieceType == "Q") {
			if (!bishopReachable(r0,f0,r1,f1) && !rookReachable(r0,f0,r1,f1)) {
				return false;
			}
		}
		else if (curP.pieceType == "N") {
			if (!knightReachable(r0,f0,r1,f1)) {
				return false;
			}
		}
		else if (curP.pieceType == "K") {
			if (!kingReachable(r0,f0,r1,f1)) {
				if (checkCastleLegality(r0,f0,r1,f1)) {
					console.log("legal");
					return "castle";
				}
				return false;
			}
		}
	}
	//Check if there is a piece there.
	if (board[r1][f1]) {
		if (board[r0][f0].color == board[r1][f1].color) {
			console.log("Can't capture your own piece!");
			return false;
		}
	}
	return true;
}

function movePiece(r0,f0,r1,f1) {
	var moveType = checkMoveLegality(r0,f0,r1,f1);
	console.log("Legality check: " + moveType);
	//console.log(r0 + "" + f0 + "" + r1 + "" + f1);
	//console.log(moveType);
	if (moveType) {
		moveList.push([r0,f0,board[r0][f0],r1,f1,board[r1][f1]]);
		board[r0][f0].moves += 1; //Increase move counter (helps for castling)
		moveCounter += 1;
		board[r1][f1] = board[r0][f0];
		board[r1][f1].squareX = f1;
		board[r1][f1].squareY = r1;
		board[r0][f0] = null;
		
		if (moveType == "passant") {
			moveList.push("passant");
			if (board[r1][f1].color == "W") {
				board[r1-1][f1] = null;
				deleteCanvasPiece(r1-1,f1);
			}else if (board[r1][f1].color == "B") {
				board[r1+1][f1] = null;
				deleteCanvasPiece(r1+1,f1);
			}
		}
		if (moveType == "castle") {
			moveList.push("castle");
			if (f1 == 2) {
				board[r0][3] = board[r0][0]
				board[r0][3].squareX = 3;
				board[r0][3].squareY = r0;
				board[r0][0] = null;
				moveCanvasPiece(boardOfObjects[r0][0],3,r0);
			}else if (f1 == 6) {
				board[r0][5] = board[r0][7]
				board[r0][5].squareX = 5;
				board[r0][5].squareY = r0;
				board[r0][7] = null;
				moveCanvasPiece(boardOfObjects[r0][7],5,r0);
			}
		}
		
		if (moveType == "promotion") {
			//moveList.push("passant"); PUSH this later.  Makes undo easier.
			promotionBox(nextPlayer);
			nextPlayer = "P" + nextPlayer; //No one's turn, we are waiting for promotion selection
		}
		
		var kingInCheck = isKingInCheck();
		if (nextPlayer == "W") {
			nextPlayer = "B";
		}else if (nextPlayer == "B"){
			nextPlayer = "W";
		}
		if (kingInCheck == true) {
			//Illegal move undo it
			undoMove();
			return false;
		}
		
		printBoard();
		//if (isKingInCheck()) document.getElementById('board').innerHTML = "<p>CHECK<p>";
		return true;
	}
	return false;
}

function execPromotion(pieceType) {
	if (nextPlayer.charAt(0) == "P") {
		var lm = moveList.pop();
		moveList.push(lm);
		moveList.push("promotion");
		
		lm[2].pieceType = pieceType;
		
		if (nextPlayer.charAt(1) == "W") {
			nextPlayer = "B";
		}else {
			nextPlayer = "W";
		}
		printBoard();
		clearCanvas();
		setupCanvasBoardPieces();
	}
}

function undoMove() {
	if (moveCounter > 0) {
		moveCounter -= 1;
		var lm = moveList.pop(); //lastmove list of type [int,int,gamePiece,int,int,gamePiece]
		
		if (lm == "passant") { //En passant
			lm = moveList.pop();
			if (lm[2].color == "W") {
				board[4][lm[4]] = new gamePiece("P","B",4,lm[4])
			}else {
				board[3][lm[4]] = new gamePiece("P","W",3,lm[4])
			}
		}
		if (lm == "castle") {
			lm = moveList.pop();
			if (lm[4] == 2) {
				board[lm[0]][0] = board[lm[0]][3];
				board[lm[0]][0].squareX = 0;
				board[lm[0]][3] = null;
			}else if (lm[4] == 6) {
				board[lm[0]][7] = board[lm[0]][5];
				board[lm[0]][7].squareX = 7;
				board[lm[0]][5] = null;
			}
		}
		if (lm == "promotion") {
			lm = moveList.pop();
			board[lm[3]][lm[4]].pieceType = "P";
		}
		lm[2].moves -= 1; //decrease move counter
		lm[2].squareX = lm[1];
		lm[2].squareY = lm[0];
		if (lm[5] != null) {
			lm[5].squareX = lm[3];
			lm[5].squareY = lm[4];
		}
		board[lm[0]][lm[1]] = lm[2];
		board[lm[3]][lm[4]] = lm[5];

		if (nextPlayer == "W") {
			nextPlayer = "B";
		}else if (nextPlayer == "B"){
			nextPlayer = "W";
		}
		if (nextPlayer == "PW") {
			nextPlayer = "W";
			destroyPromotionBox();
		}else if (nextPlayer == "PB"){
			nextPlayer = "B";
			destroyPromotionBox();
		}
		
		printBoard();
		clearCanvas();
		setupCanvasBoardPieces();
	}else {
		console.log("Nothing to undo!");
	}
	
}

//Game Piece Data Structure
function gamePiece(pieceType,color,sy,sx) {
    this.color = color;
    this.pieceType = pieceType;
	this.squareX = sx;
	this.squareY = sy;
	this.moves = 0; //How many times has this piece moved
}

function setupBoard() {
    //Setup the game board in a 2D array
    board = new Array(8);
    for (var i = 0; i < board.length; i++) {
        board[i] = new Array(8);
        for (var j = 0; j < board[i].length; j++) {
            board[i][j] = null;
        }
    }
    
    //Setup the pieces in the 2d array
    board[0][0] = new gamePiece("R","W",0,0);
    board[0][1] = new gamePiece("N","W",0,1);
    board[0][2] = new gamePiece("B","W",0,2);
    board[0][3] = new gamePiece("Q","W",0,3);
    board[0][4] = new gamePiece("K","W",0,4); kingW = board[0][4];
    board[0][5] = new gamePiece("B","W",0,5);
    board[0][6] = new gamePiece("N","W",0,6);
    board[0][7] = new gamePiece("R","W",0,7);
    for (var i = 0; i < 8; i++) {
        board[1][i] = new gamePiece("P","W",1,i);
    }
    for (var i = 0; i < 8; i++) {
        board[6][i] = new gamePiece("P","B",6,i);
    }
    board[7][0] = new gamePiece("R","B",7,0);
    board[7][1] = new gamePiece("N","B",7,1);
    board[7][2] = new gamePiece("B","B",7,2);
    board[7][3] = new gamePiece("Q","B",7,3);
    board[7][4] = new gamePiece("K","B",7,4); kingB = board[7][4];
    board[7][5] = new gamePiece("B","B",7,5);
    board[7][6] = new gamePiece("N","B",7,6);
    board[7][7] = new gamePiece("R","B",7,7);
}

function printBoard() { //TEST FUNCTION
    document.getElementById('board').innerHTML = "";
	document.getElementById('board').innerHTML += "<p>Turn:" + nextPlayer +"<p>";
    for (var i = board.length-1; i >= 0; i--) {
        var rankText = "";
        for (var j = 0; j < board[i].length; j++) {
            if (board[i][j]) {
                var piece = board[i][j];
                rankText += '[' + piece.color + piece.pieceType + ']';
            }else {
                rankText += '[--]';
            }
        }
        document.getElementById('board').innerHTML += "<p class='rank'>" + (i+1) + ' ' + rankText + "<p>";
    }
	var rankText = "<p class='rank'>&nbsp;&nbsp;&nbsp;";
	for (var i = 0; i < board[0].length; i++) {	
			 rankText += String.fromCharCode(97+i) + "&nbsp;&nbsp;&nbsp;"
	}
	//document.getElementByID('board').innerHTML += "<p>hello</p>";
	document.getElementById('board').innerHTML += rankText + "</p>";
}

function checkPawmMoveLegality(r0,f0,r1,f1) {
	var curP = board[r0][f0]
	if (curP.color == "W") {
		if (f0 == f1) { //Forward move
			if ((r1-r0) == 1) { //Move one space
				if (board[r1][f1]) { //Is there something there?
					return false;
				}
			}else if (r0 == 1 && r1 == 3) { //Move two spaces, first move
				if (board[r1][f1] || board[2][f1]) { //Is there something there or between?
					return false;
				}
			}else {
				return false;
			}
		}else if (Math.abs(f0-f1) == 1 && r1-r0 == 1) { //If diagonal attack
			if (!board[r1][f1]) {//Is there a piece there?
				var lm = moveList.pop(); moveList.push(lm);
				//Check for En passant 
				if (!lm)
					return false;
				else
				if (board[4][f1] == board[lm[3]][lm[4]] && Math.abs(lm[0]-lm[3]) == 2 && r0 == 4){
					if (board[4][f1].pieceType == "P") return "passant";
				}else {
					return false;
				}
			}
		}else {
			return false;
		}
	}
	if (curP.color == "B") {
		if (f0 == f1) { //Forward move
			if ((r1-r0) == -1) { //Move one space
				if (board[r1][f1]) { //Is there something there?
					return false;
				}
			}else if (r0 == 6 && r1 == 4) { //Move two spaces, first move
				if (board[r1][f1] || board[5][f1]) { //Is there something there or between?
					return false;
				}
			}else {
				return false;
			}
		}else if (Math.abs(f0-f1) == 1 && r1-r0 == -1) { //If diagonal attack
			if (!board[r1][f1]) {//Is there a piece there?
				var lm = moveList.pop(); moveList.push(lm);
				//Check for En passant 
				if (!lm)
					return false;
				else
				if (board[3][f1] == board[lm[3]][lm[4]] && 
					Math.abs(lm[0]-lm[3]) == 2 && 
					r0 == 3){
					if (board[3][f1].pieceType == "P") return "passant";
				}else {
					return false;
				}
			}
		}else {
			return false;
		}
	}
}

function checkCastleLegality(r0,f0,r1,f1) {
	var curK = board[r0][f0];
	if (r0 == r1 && Math.abs(f0-f1) == 2 && curK.moves == 0) {
		if (f1 == 2) {
			if (board[r0][0] && !board[r0][1] && !board[r0][2] && !board[r0][3]) {
				if (board[r0][0].moves == 0) {
					if (!isKingInCheck()) {
						curK.squareX -= 1;
						if (!isKingInCheck()) {
							curK.squareX += 1;
							return true;
						}
						curK.squareX += 1;
					}
				}
			}
		}
		if (f1 == 6) {
			if (board[r0][7] && !board[r0][5] && !board[r0][6]) {
				if (board[r0][7].moves == 0) {
					if (!isKingInCheck()) {
						curK.squareX += 1;
						if (!isKingInCheck()) {
							curK.squareX -= 1;
							return true;
						}
						curK.squareX -= 1;
					}
				}
			}
		}
	}
	return false;
}

//Returns true if the move would put the King in Check.
function isKingInCheck() {
	var curK;
	if (nextPlayer == "W") {
		curK = kingW;
	}else {
		curK = kingB;
	}
	
	for(var i = 0; i < board.length; i++) {
		for (var j = 0; j < board[i].length; j++) {
			var curP = board[i][j];
			if (curP)
			if (curK.color != curP.color) {
				if (curP.pieceType == "P") if (pawnCheckCheck(i,j,curK.squareY,curK.squareX))
					return true;
				if (curP.pieceType == "R") if (rookReachable(i,j,curK.squareY,curK.squareX))
					return true;
				if (curP.pieceType == "B") if (bishopReachable(i,j,curK.squareY,curK.squareX))
					return true;
				if (curP.pieceType == "Q") if (queenReachable(i,j,curK.squareY,curK.squareX))
					return true;
				if (curP.pieceType == "K") if (kingReachable(i,j,curK.squareY,curK.squareX))
					return true;
				if (curP.pieceType == "N") if (knightReachable(i,j,curK.squareY,curK.squareX))
					return true;
			}
		}
	}
	return false;
}

//Returns true if pawn would check King
function pawnCheckCheck(r0,f0,r1,f1) {
	var curP = board[r0][f0];
	var list = []; //List of reachable squares
	if (curP.color == "W") {
		list.push([r0+1,f0+1]);
		list.push([r0+1,f0-1]);
	}else {
		list.push([r0-1,f0+1]);
		list.push([r0-1,f0-1]);
	}
	for (var i = 0; i < list.length; i++) {
		if (list[i][0] == r1 && list[i][1] == f1) {
			return true;
		}
	}
	return false;
}

function rookReachable(r0,f0,r1,f1) {
	var curP = board[r0][f0]
	var list = [];
	//Left
	for (var i = 1; i < board.length; i++) {
		if (f0-i >= 0 && f0-i <= 7) {
			if (board[r0][f0-i]) {
				if (board[r0][f0-i].color != curP.color) {
					list.push([r0,f0-i]);
				}
				break;
			}else {
				list.push([r0,f0-i]);
			}
		}
	}
	//Right
	for (var i = 1; i < board.length; i++) {
		if (f0+i >= 0 && f0+i <= 7) {
			if (board[r0][f0+i]) {
				if (board[r0][f0+i].color != curP.color) {
					list.push([r0,f0+i]);
				}
				break;
			}else {
				list.push([r0,f0+i]);
			}
		}
	}
	//Up
	for (var i = 1; i < board.length; i++) {
		if (r0+i >= 0 && r0+i <= 7) {
			if (board[r0+i][f0]) {
				if (board[r0+i][f0].color != curP.color) {
					list.push([r0+i,f0]);
				}
				break;
			}else {
				list.push([r0+i,f0]);
			}
		}
	}
	//Down
	for (var i = 1; i < board.length; i++) {
		if (r0-i >= 0 && r0-i <= 7) {
			if (board[r0-i][f0]) {
				if (board[r0-i][f0].color != curP.color) {
					list.push([r0-i,f0]);
				}
				break;
			}else {
				list.push([r0-i,f0]);
			}
		}
	}
	
	for (var i = 0; i < list.length; i++) {
		if (list[i][0] == r1 && list[i][1] == f1) {
			return true;
		}
	}
	return false;
}

function bishopReachable(r0,f0,r1,f1) {
	var curP = board[r0][f0];
	var list = [];
	//UpLeft
	for (var i = 1; i < board.length; i++) {
		if (f0-i >= 0 && f0-i <= 7 && r0+i >= 0 && r0+i <= 7) {
			if (board[r0+i][f0-i]) {
				if (board[r0+i][f0-i].color != curP.color) {
					list.push([r0+i,f0-i]);
				}
				break;
			}else {
				list.push([r0+i,f0-i]);
			}
		}
	}
	//UpRight
	for (var i = 1; i < board.length; i++) {
		if (f0+i >= 0 && f0+i <= 7 && r0+i >= 0 && r0+i <= 7) {
			if (board[r0+i][f0+i]) {
				if (board[r0+i][f0+i].color != curP.color) {
					list.push([r0+i,f0+i]);
				}
				break;
			}else {
				list.push([r0+i,f0+i]);
			}
		}
	}
	//DownRight
	for (var i = 1; i < board.length; i++) {
		if (f0+i >= 0 && f0+i <= 7 && r0-i >= 0 && r0-i <= 7) {
			if (board[r0-i][f0+i]) {
				if (board[r0-i][f0+i].color != curP.color) {
					list.push([r0-i,f0+i]);
				}
				break;
			}else {
				list.push([r0-i,f0+i]);
			}
		}
	}
	//DownLeft
	for (var i = 1; i < board.length; i++) {
		if (f0-i >= 0 && f0-i <= 7 && r0-i >= 0 && r0-i <= 7) {
			if (board[r0-i][f0-i]) {
				if (board[r0-i][f0-i].color != curP.color) {
					list.push([r0-i,f0-i]);
				}
				break;
			}else {
				list.push([r0-i,f0-i]);
			}
		}
	}
	
	for (var i = 0; i < list.length; i++) {
		if (list[i][0] == r1 && list[i][1] == f1) {
			return true;
		}
	}
	return false;
}

function kingReachable(r0,f0,r1,f1) {
	var curP = board[r0][f0];
	var list = [];
	
	for (var i = -1; i <= 1; i++) {
		for (var j = -1; j <= 1; j++) {
			if (f0+i >= 0 && f0+i <= 7 && r0+i >= 0 && r0+i <= 7) {
				list.push([r0+i,f0+j]);
			}
		}
	}
	
	for (var i = 0; i < list.length; i++) {
		if (list[i][0] == r1 && list[i][1] == f1) {
			return true;
		}
	}
	return false;
}

function knightReachable(r0,f0,r1,f1) {
	if ((Math.abs(r0-r1) == 2 && Math.abs(f0-f1) == 1) || (Math.abs(r0-r1) == 1 && Math.abs(f0-f1) == 2)) {
		return true;
	}
	return false;
}

function queenReachable(r0,f0,r1,f1) {
	if (bishopReachable(r0,f0,r1,f1) || rookReachable(r0,f0,r1,f1)) {
		return true;
	}else {
		return false;
	}
}
