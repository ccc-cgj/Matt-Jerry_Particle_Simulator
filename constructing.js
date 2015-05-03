window.requestAnimFrame =
    window.requestAnimationFrame ||
    window.webkitRequestAnimationFrame ||
    window.mozRequestAnimationFrame ||
    window.oRequestAnimationFrame ||
    window.msRequestAnimationFrame ||
    function(callback) {
        window.setTimeout(callback, 1000 / 60);
};

var settings = {
    'basic': {
        'emission_rate': 100,
        'min_life': 0,
        'life_range': 0.2,
        'min_angle': 0,
        'angle_range': 360,
        'min_speed': 20,
        'speed_range': 90,
        'min_size': 2,
        'size_range': 2,
        'colour': '#82c4f5'
    }
};

var Particle = function(x, y, angle, speed, life, size) {

    /* the particle's position */
    this.pos = {
        x: x || 0,
        y: y || 0
    };

    /* set specified or default values */
    this.speed = speed || 5;
    this.life = life || 1;
    this.size = size || 2;
    this.lived = 0;

    /* the particle's velocity */
    var radians = angle * Math.PI / 180;
    this.vel = {
        x: Math.cos(radians) * speed,
        y: -Math.sin(radians) * speed
    };
};

var Emitter = function(x, y, settings) {

    /* the emitter's position */
    this.pos = {
        x: x,
        y: y
    };

    /* set specified values */
    this.settings = settings;

    /* How often the emitter needs to create a particle in milliseconds */
    this.emission_delay = 1000 / settings.emission_rate;

    /* we'll get to these later */
    this.last_update = 0;
    this.last_emission = 0;

    /* the emitter's particle objects */
    this.particles = [];

    this.bedragged = false;
};

Emitter.prototype.update = function() {

    /* set the last_update variable to now if it's the first update */
    if (!this.last_update) {
        this.last_update = Date.now();
        return;
    }

    /* get the current time */
    var time = Date.now();

    /* work out the milliseconds since the last update */
    var dt = time - this.last_update;

    /* add them to the milliseconds since the last particle emission */
    this.last_emission += dt;

    /* set last_update to now */
    this.last_update = time;

    /* check if we need to emit a new particle */
    if (this.last_emission > this.emission_delay) {

        /* find out how many particles we need to emit */
        var i = Math.floor(this.last_emission / this.emission_delay);

        /* subtract the appropriate amount of milliseconds from last_emission */
        this.last_emission -= i * this.emission_delay;
        while (i--) {
            /* calculate the particle's properties based on the emitter's settings */
            this.particles.push(
                new Particle(
                    0,
                    0,
                    this.settings.min_angle + Math.random() * this.settings.angle_range,
                    this.settings.min_speed + Math.random() * this.settings.speed_range,
                    this.settings.min_life + Math.random() * this.settings.life_range,
                    this.settings.min_size + Math.random() * this.settings.size_range
                )
            );
        }
    }

    /* convert dt to seconds */
    dt /= 1000;

    /* loop through the existing particles */
    var i = this.particles.length;
    while (i--) {
        var particle = this.particles[i];
        /* skip if the particle is dead */
        if (particle.dead) {
            
            /* remove the particle from the array */
            this.particles.splice(i, 1);
            continue;   
        }

        /* add the seconds passed to the particle's life */
        particle.lived += dt;

        /* check if the particle should be dead */
        if (particle.lived >= particle.life) {
            particle.dead = true;
            continue;
        }

        /* calculate the particle's new position based on the seconds passed */
        particle.pos.x += particle.vel.x * dt;
        particle.pos.y += particle.vel.y * dt;

        /* draw the particle */
        ctx.fillStyle = this.settings.colour;
        var x = this.pos.x + particle.pos.x;
        var y = this.pos.y + particle.pos.y;
        ctx.beginPath();
        ctx.arc(x, y, particle.size, 0, Math.PI * 2);
        ctx.fill();
    }
};

var canvas = document.getElementById('c');
var ctx = canvas.getContext('2d');
canvas.width = window.innerWidth;
canvas.height = window.innerHeight-90;
canvas.addEventListener('click', function() {
	var skip_turn = false;
	for(var x=0; x<emitterArray.length; x++){
		if (emitterArray[x].bedragged == true)
		{
			emitterArray[x].bedragged=false; 
			skip_turn = true;
		}
		if (!skip_turn && (Math.abs(emitterArray[x].pos["x"]-tpos.x) + Math.abs(emitterArray[x].pos["y"]-tpos.y))<20)
		{
			emitterArray[x].bedragged = true;
		}
	};
}, false);
var tpos = { x: 0, y: 0 };
var emitterArray = [];
var emitter = new Emitter(100, canvas.height / 2, settings.basic);
emitterArray.push(emitter);
function loop() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    for(var x=0; x<emitterArray.length; x++){
    	if(emitterArray[x].bedragged == true){
    		emitterArray[x].pos={x:tpos.x, y:tpos.y};
    	}
    	else{
    		emitterArray[x].pos=emitterArray[x].pos;
    	}
    	emitterArray[x].update();
    };
    $("#debugger").text("mouseX="+tpos.x+", mouseY="+tpos.y);
    requestAnimFrame(loop);
}
function upq(){
    emitterArray[emitterArray.length]=new Emitter(canvas.width / 2, canvas.height / 2-200, settings.basic);
}
function downq(){
    emitterArray[emitterArray.length]=new Emitter(canvas.width/2, canvas.height / 2+100, settings.basic);
}

$("#c").mousemove(function(e){
    $("html").css("background-color","white");
    tpos.x=e.pageX;
    tpos.y=e.pageY;
});

loop();