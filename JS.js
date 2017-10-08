var player;
var currentMap = [];
var keys = {37: 1, 38: 1, 39: 1, 40: 1, 32: 1};
var keysClick = {32 : 1};
var lastMove = "down";
var counter = 0;
var stopMovement = false;
var loadInterval;
var writeInterval;
var centreCoordX = window.innerWidth/2;
var centreCoordY = window.innerHeight/2;
var previousX = window.innerWidth;
var previousY = window.innerHeight;

var mapBounds = new Map();

var town = [];
var house1 = [];
var messages = [];

var currentPage = 1;

var showChat;


function startGame() {
	disableScroll();
	document.body.style.overflow = 'hidden';

	createMap();
	currentMap = house1;
	
	myGameArea.start();
}

function loadingScreen(){
	stopMovement = true;
	loadInterval = setInterval(fadeOut, 10);
}

function fadeOut(){
	myGameArea.context.globalAlpha -= 0.05;
	
	if (myGameArea.context.globalAlpha < 0.05){
		clearInterval(loadInterval);
		
		loadInterval = setInterval(fadeIn)
	}
}

function fadeIn(){
	myGameArea.context.globalAlpha += 0.05;
	
	if (myGameArea.context.globalAlpha > 0.95){
		clearInterval(loadInterval);
		
		stopMovement = false;
	}
}

var myGameArea = {
    canvas : document.createElement("canvas"),
    start : function() {
		
        this.canvas.width = window.innerWidth;
        this.canvas.height = window.innerHeight;
		
        this.context = this.canvas.getContext("2d");
		
        document.body.insertBefore(this.canvas, document.body.childNodes[0]);
		this.interval = setInterval(updateGameArea, 20);
		
		window.addEventListener('keypress', function(e){
			if (e.keyCode == 101){
				interact();
			}
		})
		window.addEventListener('keydown', function(e){
			myGameArea.keys = (myGameArea.keys || []);
			myGameArea.keys[e.keyCode] = true;
		})
		window.addEventListener('keyup', function(e){
			counter = 0;
			
			switch(lastMove){
			case "up":
			player.change(67,48)
			break;
			
			case "down":
			player.change(67,0)
			break;
			
			case "left":
			player.change(67,16)
			break;
			
			case "right":
			player.change(67,32)
			break;
			
			}
			
			try{
				myGameArea.keys[e.keyCode] = false;
			}
			catch (err){
				
			}
		})
		
    },
	clear : function(){ 
		this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);
	}
}


function createMap(){
	
	player = new playerType("res/characters.png",67,0,10,16,
	window.innerWidth/2,window.innerHeight/2,
	20,32);
	
	minX = -10;
	maxX = 10;
	minY = -10;
	maxY = 10;
	
	// create floor
	for (x = minX; x < maxX; x++){
		for (y = minY; y < maxY; y++){
			if (x == minX || x == maxX -1 || y == maxY - 1 || y == minY){
				town.push(new obstacle("res/border.png",0,0,31,31,
				centreCoordX + x*31, centreCoordY + y*31,
				31, 31));
			}
			else{
				town.push(new ground("res/ground.png",0,0,31,31,centreCoordX +
				x*31, centreCoordY + y*31,31, 31));	
			}
		}
	}
	
	mapBounds.set("town",[centreCoordX + (-10*32), centreCoordX + (20*32), centreCoordY + (-10*32), centreCoordY + (10*32)]);
	
	//house
	town.push(new obstacle("res/statics.png",160,84,96,60,centreCoordX - 130,centreCoordY - 130,192,120));
	
	//portal
	town.push(new portalType("res/ground.png",272,48,16,16,centreCoordX - 10,centreCoordY - 10,48,20, house1));
	
	//npc
	town.push(new npcType("Jane","res/characters.png",115,16,10,16,
	centreCoordX + 100, centreCoordY,
	20,32));
	
	town.push(new npcType("Josh","res/characters.png",163,33,10,16,
	centreCoordX - 100 , centreCoordY,
	20,32));
	
	// create for inhouse
	
	//create floor
	
	minX = -5;
	maxX = 5;
	minY = -5;
	maxY = 5;
	
	for (x = minX; x < maxX; x++){
		for (y = minY; y < maxY; y++){
			if (y == minY && x != minX && x != maxX - 1){
				house1.push(new obstacle("res/interior.png",82,1121,42,28,
				centreCoordX + x*30, centreCoordY + y*30,
				30, 60));
			}
			
			if (x == minX || x == maxX - 1 || y == maxY - 1){
				house1.push(new obstacle("res/border.png",0,0,30,30,
				centreCoordX + x*30, centreCoordY + y*30,
				30, 30));
			}
			else if (y > minX + 1){
				house1.push(new ground("res/interior.png",113,929,13,13,
				centreCoordX + x*30, centreCoordY + y*30,
				30, 30));
			}
		}
	}
	
	mapBounds.set("house1",[centreCoordX + (-5*30), centreCoordX + (5*30), centreCoordY + (5*30), centreCoordY + (5*30)]);
	
	//create portal
	house1.push(new portalType("res/interior.png",91,801,26,14,centreCoordX ,centreCoordY+90 ,60,30, town));
	
	//create pc
	house1.push(new npcType("PC","res/statics.png", 257, 198, 30, 25, centreCoordX-115, centreCoordY-120, 60, 50));
	
	//create chair
	house1.push(new ground("res/statics.png", 306, 34, 13, 13, centreCoordX-105, centreCoordY-70, 20, 20));
	
	//create bed
	house1.push(new obstacle("res/statics.png", 305, 0, 15, 31, centreCoordX-20, centreCoordY - 110, 40, 62));
	
	}

var component = function component(img, startX, startY, startWidth, startHeight, x, y, width, height, isObstacle){
	this.image = new Image();
	this.image.src = img;
	
	this.speedX = 0;
	this.speedY = 0;
	
	this.startX = startX;
	this.startY = startY;
	
	this.width = width;
	this.height = height;
	
	this.x = x;
	this.y = y;
	
	this.isObstacle = isObstacle;

	this.change = function (x, y){
		this.startX = x;
		this.startY = y;
	}
	this.update = function(){
		ctx = myGameArea.context;
		ctx.drawImage(this.image, this.startX, this.startY, startWidth, startHeight, this.x, this.y, this.width, this.height);
	}
	this.newPos = function(){
		this.x += this.speedX;
		this.y += this.speedY;
	}
	this.crashWith = function(other){
		var crashArea = "none";
		
		if (other.isObstacle){
			var myleft = this.x;
			var myright = this.x + this.width;
			var mytop = this.y + 15;
			var mybottom = this.y + this.height;
			var otherleft = other.x;
			var otherright = other.x + other.width;
			var othertop = other.y;
			var otherbottom = other.y + other.height;
			var crash = true;
			
			if ((mybottom < othertop) ||
			(mytop > otherbottom) ||
			(myright < otherleft) ||
			(myleft > otherright)){
				crash = false;
			}
			
			if (crash){
				if ((Math.abs(mybottom - othertop)) < 5){
					crashArea = "down";
				}
				else if ((Math.abs(mytop - otherbottom)) < 5){
					crashArea = "up";
				}
				else if ((Math.abs(myleft - otherright)) < 5){
					crashArea = "left";
				}
				else if ((Math.abs(myright - otherleft)) < 5){
					crashArea = "right";
				}
			}
			else{
				
			}
		}
		
		
		return crashArea;
	}
}

var ground = function(img, startX, startY, startWidth, startHeight, x, y, width, height){
	component.call(this, img, startX, startY, startWidth, startHeight, x, y, width, height, false);
}

var obstacle = function(img, startX, startY, startWidth, startHeight, x, y, width, height){
	component.call(this, img, startX, startY, startWidth, startHeight, x, y, width, height, true);
}

var playerType = function(img, startX, startY, startWidth, startHeight, x, y, width, height){
	component.call(this, img, startX, startY, startWidth, startHeight, x, y, width, height, false);
}

var portalType = function(img, startX, startY, startWidth, startHeight, x, y, width, height, destination){
	component.call(this, img, startX, startY, startWidth, startHeight, x, y, width, height, true);
	
	this.teleport = function(){
		stopMovement = true;
		
		dim = setInterval(function(){
			myGameArea.context.globalAlpha -= 0.05;
			
			if (myGameArea.context.globalAlpha < 0.05){
				currentMap = destination;
				
				brighten = setInterval(function(){
					myGameArea.context.globalAlpha += 0.05;
					
					if (myGameArea.context.globalAlpha > 0.95){
						stopMovement = false;
						clearInterval(brighten);
					}
				}, 10)
				
				clearInterval(dim);
			}
			
		}, 10);
	}
}

var npcType = function(name, img, startX, startY, startWidth, startHeight, x, y, width, height){
	component.call(this, img, startX, startY, startWidth, startHeight, x, y, width, height, true);
	
	this.name = name;
	
	this.getMessage = function(page){
		switch (name){
			case "Jane":
			
			switch (page){
				case 1:
				return name + ":\n\nI love skyrim!'";
				
				case 2:
				return name + ":\n\nSkyrim belongs to the Nords!";
				
				default:
				return "/end";
				
			}
			
			case "Josh":
			
			switch (page){
				case 1:
				return name + ":\n\nIm a skeleton lol!";
				
				default:
				return "/end";
			}
			
			default:
			return "/end";
			
			case "PC":
			
			switch (page){
				case 1:
				return "You:\n\nThis PC is turned off...";
				
				default:
				return "/end";
			}
			
		}
	}
}

function updateGameArea(){
		
		if (previousX != window.innerWidth || previousY != window.innerHeight){
			myGameArea.canvas.width = window.innerWidth;
			myGameArea.canvas.height = window.innerHeight;
			
			previousX = window.innerWidth;
			previousY = window.innerHeight;
		}
		
		myGameArea.clear();
		stopMove();
			
		if (!stopMovement){
			if (myGameArea.keys && myGameArea.keys[38]) {moveup();}
			else if (myGameArea.keys && myGameArea.keys[40]) {movedown();}
			else if (myGameArea.keys && myGameArea.keys[37]) {moveleft();}
			else if (myGameArea.keys && myGameArea.keys[39]) {moveright();}
		}
		
		for (i = 0; i < currentMap.length; i++){
			currentMap[i].newPos();
			currentMap[i].update();
		}
			
		player.update();
		
		if (showChat){
			// draw the chat box
			myGameArea.context.fillStyle = '#7381F1';
			myGameArea.context.strokeStyle = '#274755';
			var fillRect = true;
			myGameArea.context.rect(10, window.innerHeight-(window.innerHeight/4) - 10, window.innerWidth - 20, window.innerHeight/4);
			if (fillRect) {
			  myGameArea.context.fill();
			}
			myGameArea.context.stroke();
			
			// write the words
			
			var lineHeight = 50;
			var lineNum = 0;
			var fontSize = 20;
			myGameArea.context.font = fontSize + "px Lucida Console";
			console.log(myGameArea.context.font);
			myGameArea.context.fillStyle = 'black';
			
			wrapText(myGameArea.context, messages.join(""), 20, window.innerHeight-(window.innerHeight/4) + 20, window.innerWidth - fontSize, fontSize + 10);
			
		}
}

function wrapText(context, text, x, y, maxWidth, lineHeight) {
	var cars = text.split("\n");

	for (var ii = 0; ii < cars.length; ii++) {

		var line = "";
		var words = cars[ii].split(" ");

		for (var n = 0; n < words.length; n++) {
			var testLine = line + words[n] + " ";
			var metrics = context.measureText(testLine);
			var testWidth = metrics.width;

			if (testWidth > maxWidth) {
				context.fillText(line, x, y);
				line = words[n] + " ";
				y += lineHeight;
			}
			else {
				line = testLine;
			}
		}

		context.fillText(line, x, y);
		y += lineHeight;
	}
 }

function interact(){
	crash = false;
	end = false;
	messages = [];
	
	for (i = 0; i < currentMap.length; i++){
		if (currentMap[i] instanceof npcType && player.crashWith(currentMap[i]) != "none"){
			crash = true;
			this.message = currentMap[i].getMessage(currentPage).split(" ");
			
			if (currentMap[i].getMessage(currentPage) == "/end"){
				end = true;
				currentPage = 1;
			}
			else{
				currentPage++;
			}
		}
	}
	
	if (!end){
		if (crash){
			showChat = true;
			stopMovement = true;
			lineNum = 0;
			
			interval = setInterval(function(){
				if (0 < this.message.length){
					messages.push(this.message.shift());
					messages.push(" ");
					
					if (myGameArea.context.measureText(messages) > window.innerWidth/1.5){
						messages.push("\n");
					}
				}
				else{
					clearInterval(interval);
				}
			},10);
		}
	}
	else{
		showChat = false;
		stopMovement = false;
		
		try{
			clearInterval(interval);
		}
		catch (err){
			console.log("not interactable yet");
		}
		
	}
}

function writeMessage(){
	if (num < message.length){
		myGameArea.context.font = "30px Arial";
		myGameArea.context.fillText(message[num++],10+(num*30),50);
	}
}

function movedown() {
	counter++;
	if (counter % 5 == 0 || counter == 1){
		if (player.startX == 51){
			player.startX = 83;
			player.startY = 0;
		}
		else if (player.startX == 83) {
			player.startX = 51;
			player.startY = 0;
		}
		else{
			player.startX = 51;
			player.startY = 0;
		}
	}
	
	lastMove = "down";
	var crash = false;
	
	for (i = 0; i < currentMap.length; i++){
		if (player.crashWith(currentMap[i]) == "down"){
			crash = true;
			
			if (currentMap[i] instanceof portalType){
				currentMap[i].teleport();
			}
		}
	}
	
	if (!crash){
		for (i = 0; i < currentMap.length; i++){
			currentMap[i].speedY -= 5; 
		}
	}
}

function moveup() {
	counter++;
	if (counter % 5 == 0 || counter == 1){
		if (player.startX == 51){
			player.startX = 83;
			player.startY = 48;
		}
		else if (player.startX == 83) {
			player.startX = 51;
			player.startY = 48;
		}
		else{
			player.startX = 51;
			player.startY = 48;
		}
	}
	
	lastMove = "up";
	var crash = false;
	
	for (i = 0; i < currentMap.length; i++){
		if (player.crashWith(currentMap[i]) == "up"){
			crash = true;
			
			if (currentMap[i] instanceof portalType){
				currentMap[i].teleport();
			}
		}
	}
	
	if (!crash){
		for (i = 0; i < currentMap.length; i++){
			currentMap[i].speedY += 5; 
		}
	}
}

function moveright() {
	counter++;
	if (counter % 5 == 0 || counter == 1){
		if (player.startX == 51){
			player.startX = 83;
			player.startY = 32;
		}
		else if (player.startX == 83) {
			player.startX = 51;
			player.startY = 32;
		}
		else{
			player.startX = 51;
			player.startY = 32;
		}
	}
	
	lastMove = "right";
	var crash = false;
	
	for (i = 0; i < currentMap.length; i++){
		if (player.crashWith(currentMap[i]) == "right"){
			crash = true;
			
			if (currentMap[i] instanceof portalType){
				currentMap[i].teleport();
			}
		}
	}
	
	if (!crash){
		for (i = 0; i < currentMap.length; i++){
			currentMap[i].speedX -= 5; 
		}
	}
}

function moveleft() {
	counter++;
	if (counter % 5 == 0 || counter == 1){
		if (player.startX == 51){
			player.startX = 83;
			player.startY = 16;
		}
		else if (player.startX == 83) {
			player.startX = 51;
			player.startY = 16;
		}
		else{
			player.startX = 51;
			player.startY = 16;
		}
	}
	
	lastMove = "left";
	var crash = false;
	
	for (i = 0; i < currentMap.length; i++){
		if (player.crashWith(currentMap[i]) == "left"){
			crash = true;
			
			if (currentMap[i] instanceof portalType){
				currentMap[i].teleport();
			}
		}
	}
	
	if (!crash){
		for (i = 0; i < currentMap.length; i++){
			currentMap[i].speedX += 5;  
		}
	}
}

function stopMove() {
	for (i = 0; i < currentMap.length; i++){
		currentMap[i].speedX = 0;
		currentMap[i].speedY = 0; 
	}
}

function preventDefault(e) {
  e = e || window.event;
  if (e.preventDefault)
      e.preventDefault();
  e.returnValue = false;  
}

function preventDefaultForScrollKeys(e) {
    if (keys[e.keyCode]) {
        preventDefault(e);
        return false;
    }
}

function disableScroll() {
  if (window.addEventListener) // older FF
      window.addEventListener('DOMMouseScroll', preventDefault, false);
  window.onwheel = preventDefault; // modern standard
  window.onmousewheel = document.onmousewheel = preventDefault; // older browsers, IE
  window.ontouchmove  = preventDefault; // mobile
  document.onkeydown  = preventDefaultForScrollKeys;
}
