var canvas = document.getElementById('touch-canvas');
var ctx = canvas.getContext('2d');
var wrapper = document.getElementById('wrapper');
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

//removing default scrolling and scaling
document.addEventListener('touchstart', function(e) {e.preventDefault()}, false);
document.addEventListener('touchmove', function(e) {e.preventDefault()}, false);
canvas.addEventListener('gesturestart', function (e) {
    e.preventDefault();
});

//move to inputer objects
var callibrationTimer;

var particles = [];
var colors = ['#FFC300', '#FF5733', '#C70039', '#900C3F', '#900C3F'];
var inputers = [];

function createInputer(touch){
	return {
		type: "twist",
		position: {
			x: touch.clientX,
			y: touch.clientY + 45
		},
		latestTouch: {
			x: touch.clientX,
			y: touch.clientY
		},
		value: 0,
        angle: 0,
        angleValue: 0,
        callibrated: false
	};
}

function createLabel(inputer) {
    var dialLabel = document.createElement("div");
    dialLabel.setAttribute("class", "dial-label");
    dialLabel.innerHTML = "<p class='position'>position: " + String(inputer.position.x) + ", " + String(inputer.position.y) + "</p>"
    + "<p class='value'>value: " + String(inputer.value) + "</p>"
    + "<p class='angle'>angle: " + String(inputer.angle) + "</p>";
    wrapper.appendChild(dialLabel);  
    dialLabel.style.left = String(inputer.position.x + 130)+"px";
    dialLabel.style.top = String(inputer.position.y - 50)+"px";
    return dialLabel;
}

function updatePositionLabel(inputer) {
    var label = inputer.label;
    var positionLabel = label.getElementsByClassName('position');
    positionLabel.innerHTML = "position: "+ String(inputer.position.x) + ", " + String(inputer.position.y);
}

function updateValueAndAngleLabel(inputer) {
    var label = inputer.label;
    var valueLabel = label.getElementsByClassName('value');
    valueLabel[0].innerHTML = "value: " + String(Math.floor(inputer.value));
    var angleLabel = label.getElementsByClassName('angle');
    angleLabel[0].innerHTML = "angle: " + String(Math.floor(inputer.angle));
}

function getDistance (x1, y1, x2, y2){
	var dx = x2 - x1;
	var dy = y2 - y1;
	return Math.sqrt(dx * dx + dy * dy);
}

//find closest inputer or make a new one
function whichInputer(touch){
	//determine which inputer touch is from
	for(var i = 0; i < inputers.length; i++){
		var inputer = inputers[i];
		var dist = getDistance(touch.clientX, touch.clientY, inputer.position.x, inputer.position.y);
		if(dist < 120){
			return inputers[i];
		}
	}
    //not near an existing inputer. add a new one
    var newInputer = createInputer(touch)
    inputers.push(newInputer);
    newInputer.label = createLabel(newInputer);
	return newInputer;
}

//remove. just for testing with click.
canvas.addEventListener('click', function(event) {
	var inputer = {};
    var touch = event;
    //find closest inputer or make a new one
    inputer = whichInputer(touch);
    if(!inputer.callibrated){
        callibrationTimer = window.setTimeout(function (){
            inputer.callibrated = true;
        }, 2000);
    }else{
        inputer.latestTouch.x = touch.clientX;
        inputer.latestTouch.y = touch.clientY;
    }
}, false);

canvas.addEventListener('touchmove', function(event) {
	var inputer = {};
	for (var i = 0; i < event.touches.length; i++) {
		var touch = event.touches[i];
		//find closest inputer or make a new one
		inputer = whichInputer(touch);
		if(!inputer.callibrated){
			callibrationTimer = window.setTimeout(function (){
				inputer.callibrated = true;
			}, 2000);
	  	}else{
	  		inputer.latestTouch.x = touch.clientX;
            inputer.latestTouch.y = touch.clientY;
            var angle = Math.atan2(inputer.latestTouch.x - inputer.position.x, inputer.latestTouch.y - inputer.position.y);
            var angleValue = 100 - (((angle / Math.PI)*50) + 50);
            var increment = angleValue - inputer.angleValue;
            if(increment < -98){
                increment = 0;
            }
            if(increment > 98){
                increment = 0;
            }
            inputer.angle = 180 - ((angle / Math.PI)*180);
            inputer.value += increment;
            inputer.angleValue = angleValue;
            updateValueAndAngleLabel(inputer);
	  	}
	}
}, false);

function createParticle (inputer) {
	particle = {
		x: inputer.latestTouch.x,
		y: inputer.latestTouch.y,
		dx: Math.cos(Math.atan2(inputer.latestTouch.y - inputer.position.y, inputer.latestTouch.x - inputer.position.x) + Math.random()*1 - 0.5),
		dy: Math.sin(Math.atan2(inputer.latestTouch.y - inputer.position.y, inputer.latestTouch.x - inputer.position.x) + Math.random()*1 - 0.5),
		radius: Math.floor(Math.random()*20),
		color: colors[Math.floor(Math.random() * colors.length)]
	}
	particles.push(particle);
}

function drawCircle(x, y, r, color){
	ctx.beginPath();
	ctx.fillStyle = color;
	ctx.arc(x,y,r,0,2*Math.PI);
	ctx.fill();
}

function updateParticles(){
	for(var i = 0; i < particles.length; i++){
		var particle = particles[i];		
		drawCircle(particle.x, particle.y, particle.radius, particle.color);
		particle.x += particle.dx;
		particle.y += particle.dy;
		particle.radius -= 0.1;
		if(particle.radius < 0.1){
			particles.splice(i, 1);
		}
	}
}

function loop () {
	ctx.clearRect(0, 0, window.innerWidth, window.innerHeight);
	for(var i = 0; i < inputers.length; i++){
		var inputer = inputers[i];
		if(!inputer.callibrated){
		    ctx.beginPath();
		    ctx.arc(inputer.position.x, inputer.position.y, 100, 0, 2*Math.PI, true);
		    ctx.stroke();
	  	}else{
	  		//draw line to show input direction
	  		ctx.beginPath();
			ctx.moveTo(inputer.position.x, inputer.position.y);
			var angle = Math.atan2(inputer.latestTouch.y - inputer.position.y, inputer.latestTouch.x - inputer.position.x);
			var pointX = Math.cos(angle) * 150 + inputer.position.x;
			var pointY = Math.sin(angle) * 150 + inputer.position.y;
			ctx.lineTo(pointX, pointY);
            ctx.stroke();
			for(var j = 0; j < 10; j++){
				if(Math.random() < 0.2){
				  	createParticle(inputer);
			  	}
		  	}
	  	}
	}
  	updateParticles();
	window.requestAnimationFrame(loop);	
}
window.requestAnimationFrame(loop);