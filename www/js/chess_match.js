
var board
var moveCounter = 0;

function initGame() {
    
    setupBoard();
    var nextPlayer = 'W';
    
    printBoard();
    
}

function parseCommand() {
	var command = document.getElementById("moveTextBox").value;
	document.getElementById("moveTextBox").value = "";
	command = /^[a-h][1-8]-[a-h][1-8]$/.exec(command);
	var s0 = /^[a-h][1-8]/.exec(command);
	var s1 = /[a-h][1-8]$/.exec(command);
	if (s0 && s1) {
		moveCounter += 1;
		document.getElementById('moveList').innerHTML += 
			"<p>" + moveCounter + ". " + s0 + '-' + s1 + "<p>";
		var f0 = /[a-h]/.exec(s0)[0].charCodeAt(0) - 97;
		var r0 = /[1-8]/.exec(s0)-1;
		var f1 = /[a-h]/.exec(s1)[0].charCodeAt(0) - 97;
		var r1 = /[1-8]/.exec(s1)-1;
		movePiece(r0,f0,r1,f1);
	}else {
		document.getElementById('moveList').innerHTML += "<p> Invalid command </p>";
	}
}

function checkMoveLegality(r0,f0,r1,f1) {
	console.log("Legality check:");
	if (r0 > 7 || f0 > 7 || r1 > 7 || f1 > 7 || r0 < 0 || f0 < 0 || r1 < 0 || f1 < 0) {
		console.log("Outside bounds");
		return false;
	}else if (r0 == r1 && f0 == f1) {
		console.log("No move");
		return false;
	}else if (board[r1][f1]) {
		if (board[r0][f0].color == board[r1][f1].color) {
			console.log("Can't capture your own piece!");
			return false;
		}
	}
	return true;
}

function movePiece(r0,f0,r1,f1) {
	//if (checkLegality(r0,f0,r1,f1)) {
		board[r1][f1] = board[r0][f0];
		board[r1][f1].squareX = f1;
		board[r1][f1].squareY = r1;
		board[r0][f0] = null;
		printBoard();
	//}
}

function gamePiece(pieceType,color,sy,sx) {
    this.color = color;
    this.pieceType = pieceType;
	this.squareX = sx;
	this.squareY = sy;
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
    board[0][4] = new gamePiece("K","W",0,4);
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
    board[7][4] = new gamePiece("K","B",7,4);
    board[7][5] = new gamePiece("B","B",7,5);
    board[7][6] = new gamePiece("N","B",7,6);
    board[7][7] = new gamePiece("R","B",7,7);
}

function printBoard() { //TEST FUNCTION
    document.getElementById('board').innerHTML = "";
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