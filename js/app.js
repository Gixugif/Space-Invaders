var ENEMY_DX = 1;
var ENEMY_DY = 20;

Object.prototype.isEmpty = function() {
    for (var prop in this) if (this.hasOwnProperty(prop)) return false;
    return true;
};

// Enemy Class
var Enemy = function(posX, posY, num) {
    this.x = posX;
    this.y = posY;
    this.dy = 0;
    this.dx = 1;
    this.num = num;
    this.population = 56;
    this.width = 65;
    this.height = 70;
    this.display = true;
    this.sprite = 'images/enemy1.png';
};

// Update the enemy's position, required method for game
// Parameter: dt, a time delta between ticks
Enemy.prototype.update = function(dt) {
    var movement = (ENEMY_DX * this.population) * dt;
    this.x += movement;
    this.y += this.dy * dt;

    if (this.x >= 1200 - 91 || this.x <= 0) {
        ENEMY_DX = -ENEMY_DX;
        allEnemies.forEach(function(allEnemy) {
        allEnemy.y += ENEMY_DY;
        allEnemy.x += ENEMY_DX;
        });
    }

	// Enemies will come out of alignment due to position not updating
	// at exacty the same time. This will keep them aligned
    if (this.num > 7) {
        this.x = allEnemies[this.num - 8].x;
    }

    if (this.num % 8 > 0) {
        this.x = allEnemies[this.num - 1].x + 135
    }

	// Balance enemy shooting by having each enemy only have a small
	// chance of firing
    var rand = Math.floor((Math.random() * 2500) + 1);
	if (rand === this.num) {
        this.shoot();
	}
};

// Draw the enemy on the screen, required method for game
Enemy.prototype.render = function() {
    if (this.display === true) {
        ctx.drawImage(Resources.get(this.sprite), this.x, this.y);
    }
};

Enemy.prototype.move = function() {

};

Enemy.prototype.shoot = function() {
     bullets.push(new Bullet(this.x,this.y,"enemy",bullets.length));
};

var calcHeight = function (count) {
   if (count <= 8) {
    return 50;
   } else if (count <= 16) {
    return 70 + 81;
   } else if (count <= 24) {
    return 90 + (2 * 81);
   } else if (count <= 32) {
    return 110 + (3 * 81);
   } else if (count <= 40) {
    return 130 + (4 * 81);
   } else if (count <= 48) {
    return 150 + (5 * 81);
   }
}


// Player Class
var Player = function() {
    this.sprite = 'images/player.png';
    this.x = 600;
    this.y = 800;
    this.dx = 0;
    this.dy = 0;
    this.width = 77;
    this.height = 52;
    this.lives = 3;
    this.score = 0;
};

Player.prototype.update = function(dt) {
    this.x += this.dx * dt;
    if (this.x < 20) {
        this.x = 20;
    } else if (this.x > 1060) {
        this.x = 1060;
    }
};

Player.prototype.render = function() {
    ctx.drawImage(Resources.get(this.sprite), this.x, this.y,131,92);
};

Player.prototype.handleInput = function(input) {
    if (keyboard['\%']) {
        this.dx = -100;
    } else if (keyboard["'"]) {
        this.dx = 100;
    } else if (keyboard.isEmpty) {
        this.dx = 0;
    }

    if (input === 'ctrl') {
        this.shoot();
    }
};

Player.prototype.shoot = function() {
    bullets.push(new Bullet(this.x,this.y,"player", bullets.length));
};

// Bullet class
var Bullet = function(posX,posY,type, num) {
    this.x = posX;
    this.y = posY;
    this.dx = 0;
    this.dy = 0;
    this.width = 5;
    this.height = 66;
    this.type = type;
    this.num = num;
    this.sprite = 'images/bullet.png';
};

Bullet.prototype.update = function(dt) {
    this.y += this.dy * dt;
};

Bullet.prototype.render = function() {
    ctx.drawImage(Resources.get(this.sprite),this.x, this.y);
};

Bullet.prototype.move = function() {
    if (this.type === "player") {
        this.dy = -200;
    } else if (this.type === "enemy") {
        this.dy = 200;
    }
}


// Barrier class
var Barrier = function(posX, posY) {
    this.x = posX
    this.y = posY;
    this.width = 92;
    this.height = 69;
    this.heath = 10;
    this.sprite = 'images/barrier_full.png';

};

Barrier.prototype.update = function() {

};

Barrier.prototype.render= function() {
    ctx.drawImage(Resources.get(this.sprite),this.x, this.y);
};


// HUD class
var HUD = function() {
    this.score = score;
    this.lives = lives;

};

HUD.prototype.update = function() {

};

HUD.prototype.render = function() {

};


// Now instantiate your objects.
// Place all enemy objects in an array called allEnemies
// Place the player object in a variable called player
var allEnemies = [];
var barriers = [];
var bullets = []

var player = new Player();
//var hud = new HUD();

for (var x = 0; x < 49; x++) { allEnemies[x] = new Enemy(91 + 135 * (allEnemies.length % 8), calcHeight(x), x); }
for (var x = 0; x < 3; x++) {barriers[x] = new Barrier(230 + (x * 300),725)}

// This listens for key presses and sends the keys to your
// Player.handleInput() method. You don't need to modify this.
document.addEventListener('keydown', function(e) {
    var allowedKeys = {
        17: 'ctrl',
        37: 'left',
        39: 'right'

    };

    player.handleInput(allowedKeys[e.keyCode]);
});


// keyboard_module by RobKohr
// Properly handles when a key is held down and then released
function keyboard_module(onUpdate){
    var kb = {};
    var unicode_mapping = {};
    document.onkeydown = function(e){
        var unicode=e.charCode? e.charCode : e.keyCode
        var key = getKey(unicode);
        kb[key] = true;
        if(onUpdate){
            onUpdate(kb);
        }
    }

    document.onkeyup = function(e){
        var unicode=e.charCode? e.charCode : e.keyCode
        var key = getKey(unicode);
        delete kb[key];
        if(onUpdate){
            onUpdate(kb);
        }
    }

    function getKey(unicode){
        if(unicode_mapping[unicode]){
            var key = unicode_mapping[unicode];
        }else{
            var key= unicode_mapping[unicode] = String.fromCharCode(unicode);
        }
        return key;
    }
    return kb;
}

function testing(kb){
    //console.log('These are the down keys', kb);
}

function collisionTest(obj1,obj2) {

    if (obj1.x < obj2.x + obj2.width &&
       obj1.x + obj1.width > obj2.x &&
       obj1.y < obj2.y + obj2.height &&
       obj1.height + obj1.y > obj2.y) {
        console.log("collision!");
        return true;
    }
}

var keyboard = keyboard_module();

