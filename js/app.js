/**************************************************
** Title: app.js                                 **
** Date: May 2016                                **
** Author: Jeffrey Zic                           **
** Description: Contains all the objects and     **
** methods needed for running the game Space     **
** Invaders.                                     **
**************************************************/

/**
 * Represents a generic ship.
 * @constructor
 * @param {int} posX - The X position of the ship.
 * @param {int} posY - The Y position of the ship.
 * @param {int} startdy - The change in y pos each frame.
 * @param {int} startdx - The change in x pos each frame.
 * @param {int} shipW - The width of the ship's sprite.
 * @param {int} shipH - The height of the ship's sprite.
 * @param {String} shipSpirte - the URL of the ship's sprite.
 */
var Ship = function(posX,posY,startdy,startdx,shipW,shipH,shipSprite) {
    'use strict';

    this.x = posX;
    this.y = posY;
    this.dy = startdy;
    this.dx = startdx;
    this.width = shipW;
    this.height = shipH;
    this.sprite = shipSprite;
};

/**
 * Represents an enemy.
 * @constructor
 * @param {int} posX - the X position of the enemy.
 * @param {int} posY - the Y position of the enemy.
 */
var Enemy = function(posX,posY,num,startdy,startdx,shipW,shipH,shipSprite) {
    'use strict';

    Ship.call(this,posX,posY,startdy,startdx,shipW,shipH,shipSprite);

    this.num = num;
    this.population = 56;
    this.display = true;
};

/**
 * Update the enemy's position.
 * @param {int} dt - a time delta between ticks.
 */
Enemy.prototype.update = function(dt) {
    'use strict';

    this.x += this.dx * dt;

    /**
     * Keep the enemy from going off the edge of the screen.
     * If it does go reach the the edge, reverse direction.
     */
    if ((this.x >= 1200 - 91 || this.x <= 0) && this.display === true) {
        console.log(enemyDX);
        enemyDX = -enemyDX;

        /**
         * We move everyone vertically all at once for
         * simplicity, and move them away from the edge
         * so they only move down once.
         */
        allEnemies.forEach(function(enemy) {
            enemy.y += enemy.dy;
            enemy.x += enemyDX * enemy.population * dt;
        });
    }

    /**
     * Enemies will come out of alignment due to position
     * not updating at exacty the same time. This will keep
     * them aligned.
     */
    if (this.num > 7) this.x = allEnemies[this.num - 8].x;

    if (this.num % 8 > 0) this.x = allEnemies[this.num - 1].x + 135;
};

/** Draw the enemy on the screen */
Enemy.prototype.render = function() {
    'use strict';

    if (this.display === true) {
        ctx.drawImage(Resources.get(this.sprite), this.x, this.y);
    }
};

/** Calculates the enemy's movement */
Enemy.prototype.move = function() {
    'use strict';

    this.dx = (enemyDX * this.population);

};

/** Add a bullet to the game when an enemy shoots */
Enemy.prototype.shoot = function() {
    'use strict';

    /**
     * Balance enemy shooting by having each enemy only have a small
     * chance of firing.
     */
    var rand = Math.floor(Math.random() * 2500 + 1);

    if (rand === this.num && this.display === true) {
        bullets.push(new Bullet(this.x, this.y, 'enemy', bullets.length));
    }
};

/** Removes an enemy from the game */
Enemy.prototype.destroy = function() {
    'use strict';

    this.display = false;
    hud.score += 100;

    /** Slowly speed up as enemies are defeated */
    enemyDX = enemyDX * 1.07;

    Enemy_Pop -= 1;
};

/**
 * Test to see if the enemy is in contact with any other
 * entity
 *
 * @param {Enemy} enemy - the Enemy object being tested
 * @returns {[int,int]} An array with the first index being the index of
 * the bullet the enemy has collided with and the second index being the
 * current state of the game.
 */
Enemy.prototype.testCollision = function(enemy) {
    'use strict';

    var collisionNum = -1;
    var state = 0;

    bullets.forEach(function(bullet) {

        if (bullet.type === 'player' && enemy.display === true) {

            if (collisionTest(enemy, bullet)) {
                enemy.destroy();
                player.shot = false;
                collisionNum = bullet.num;

            }
        }


        if (enemy.y > (725 - enemy.height) && enemy.display === true) {
            barriers.forEach(function(barrier) {

                if (collisionTest(enemy, barrier) && barrier.display === true) {
                    enemy.destroy();
                    barrier.damage();
                }
            });
        }

    });

    if (collisionTest(enemy, player) && enemy.display === true) {
        enemy.destroy();
        state = player.destroy();
    }

    if ((enemy.y + 70) > 900 && enemy.display === true) {
        state = player.destroy();
    }

    if (Enemy_Pop === 0) {
        state = 3;
    }

    return [collisionNum, state];
};


/**
 * Helper function for finding the vertical placing
 * for enemies.
 */
var calcHeight = function(count) {
    'use strict';

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
};


/**
 * Represents the player
 * @constructor
 */
var Player = function(posX, posY, startdy, startdx, shipW, shipH, shipSprite) {
    'use strict';

    Ship.call(this,posX,posY,startdy,startdx,shipW,shipH,shipSprite);

    this.lives = 3;
    this.score = 0;
    this.shot = false;
};

/**
 * Update the player's position.
 * @param {int} dt - a time delta between ticks.
 */
Player.prototype.update = function(dt) {
    'use strict';

    this.x += this.dx * dt;
    if (this.x < 20) {
        this.x = 20;
    } else if (this.x > 1060) {
        this.x = 1060;
    }
};

Player.prototype.move = function() {

};

/** Draw the player to the screen. */
Player.prototype.render = function() {
    'use strict';

    ctx.drawImage(Resources.get(this.sprite), this.x, this.y);
};

/**
 * See what button is being pressed and take
 * the appropriate action.
 * @param {[str]} input - array of keys being pressed.
 */
Player.prototype.handleInput = function(input) {
    'use strict';

    if (keyboard['\%']) {
        this.dx = -100;
        Start = 1;
    } else if (keyboard["'"]) {
        this.dx = 100;
        Start = 1;
    } else {
        this.dx = 0;
    }

    if (input === 'ctrl') {
        this.shoot();
        Start = 1;
    }

};

/**
 * Add a bullet if the player shoots and stop
 * it from shooting until the bullet is gone.
 */
Player.prototype.shoot = function() {
    'use strict';

    if (this.shot === false) {
        bullets.push(new Bullet(this.x + this.width / 2, this.y - this.height + 30, 'player', bullets.length));
        this.shot = true;
    }
};

/* Destroys the player */
Player.prototype.destroy = function() {
    'use strict';

    this.lives -= 1;
    hud.lives -= 1;

    /** determine if game over or just normal reset */
    if (this.lives > 0) {
        return 2;
    } else {
        return 1;
    }
};


/**
 * Represents a bullet.
 * @constructor
 *
 * @param {int} posX - The X position of the bullet.
 * @param {int} posY - The Y position of the bullet.
 * @param {str} type - Shows whether the bullet is from
 * the player or an enemy.
 * @param {int} num - The index where the bullet is located.
 * Makes it easy to delete it when necessary.
 */
var Bullet = function(posX, posY, type, num) {
    'use strict';

    this.x = posX;
    this.y = posY;
    this.dx = 0;
    this.dy = 0;
    this.width = 5;
    this.height = 25;
    this.type = type;
    this.num = num;
    this.sprite = 'images/bullet.png';
};

/**
 * Updates the bullet's position
 *
 * @param {int} dt - a time delta between ticks.
 */
Bullet.prototype.update = function(dt) {
    'use strict';

    this.y += this.dy * dt;
};

/** Draws the player to the screen. */
Bullet.prototype.render = function() {
    'use strict';

    ctx.drawImage(Resources.get(this.sprite), this.x, this.y);
};

/**
 * Sets the bullets movement rate based on
 * type.
 */
Bullet.prototype.move = function() {
    'use strict';

    if (this.type === 'player') {
        this.dy = -200;
    } else if (this.type === 'enemy') {
        this.dy = 200;
    }
};

/**
 * Tests whether the bullet is in contact with any
 * other entities.
 *
 * @param {[bullet]} bullet - The array of bullets
 * @returns {[int,int]} An array with the first index being the index of
 * the bullet the enemy has collided with and the second index being the
 * current state of the game.
 */
Bullet.prototype.testCollision = function(bullet) {
    'use strict';

    var collisionNum = -1;
    var state = 0;

    if (bullet.y > 900 || bullet.y < 0) {
        collisionNum = bullet.num;

        if (bullet.type === 'player') {
            player.shot = false;
        }
    }

    if (bullet.type === 'enemy' && bullet.y > 700) {

        if (collisionTest(player, bullet)) {
            state = player.destroy();
            collisionNum = bullet.num;
        }
    }

    if (bullet.y > 650) {

        barriers.forEach(function(barrier) {

            if (collisionTest(bullet, barrier) && barrier.display === true) {
                barrier.damage();
                collisionNum = bullet.num;

                if (bullet.type === 'player') {
                    player.shot = false;
                }
            }
        });
    }

    return [collisionNum, state];
};


/**
 * Represents a barrier.
 * @constructor
 *
 * @param {int} posX - The barrier's position on the X axis.
 * @param {int} posY - The barrier's position on the Y axis.
 */
var Barrier = function(posX, posY) {
    'use strict';

    this.x = posX;
    this.y = posY;
    this.width = 92;
    this.height = 69;
    this.health = 10;
    this.display = true;
    this.sprite = 'images/barrier_full.png';

};

/** Update the barrier's sprite. */
Barrier.prototype.update = function() {
    'use strict';

    if (this.health === 0) {
        this.display = false;
    } else if (this.health <= 2) {
        this.sprite = 'images/barrier_most.png';
        this.width = 90;
        this.height = 52;
    } else if (this.health <= 4) {
        this.sprite = 'images/barrier_serious.png';
        this.width = 90;
        this.height = 57;
    } else if (this.health <= 6) {
        this.sprite = 'images/barrier_more.png';
    } else if (this.health <= 8) {
        this.sprite = 'images/barrier_slight.png';
    }
};

/** Draw the barrier to the screen. */
Barrier.prototype.render = function() {
    'use strict';

    if (this.display === true) {
        // we take the difference between the current and original dimensions in order
        // to stop them from shifting around
        ctx.drawImage(Resources.get(this.sprite), this.x + (92 - this.width), this.y + (69 - this.height));
    }
};

/** Damages a barrier */
Barrier.prototype.damage = function() {
    'use strict';

    this.health -= 1;
};


/**
 * Represents the HUD.
 * @constructor
 *
 * @param {int} score - the score of the player to display.
 * @param {int} lives - the amount of lives the player has
 * to display.
 */
var HUD = function(score, lives) {
    'use strict';

    this.score = score;
    this.lives = lives;
};

/** Draw the HUD to the screen */
HUD.prototype.render = function(ctx) {
    'use strict';

    ctx.font = '20px Arial';
    ctx.fillStyle = 'white';

    var scoreText = 'SCORE: ' + this.score;
    var livesText = 'LIVES: ' + this.lives;

    ctx.fillText(scoreText, 10, 30);
    ctx.fillText(livesText, 1100, 30);
};


var createEnemies = function() {
    'use strict';

    allEnemies = [];
    for (var x = 0; x < 41; x++) allEnemies[x] = new Enemy(91 + 135 * (allEnemies.length % 8), calcHeight(x), x, 20, 1, 65, 70, 'images/enemy1.png');
};

var createBarriers = function() {
    'use strict';

    barriers = [];
    for (var x = 0; x < 3; x++) barriers[x] = new Barrier(230 + (x * 300), 725);
};

/** Set up global values */
var enemyDX = 0.3;
var Start = 0;
var Enemy_Pop = 41;

var allEnemies;
var barriers;
var bullets = [];

var player = new Player((500) + (77 / 2), 820, 0, 0, 77, 52, 'images/player.png');
var hud = new HUD(0, player.lives);

createEnemies();
createBarriers();


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


/**
 * Properly handles when a key is held down and then released.
 * Credit to: RobKohr
 *
 * @param {Function} onUpdate - An optional parameter. A function
 * that executes when a key is pressed or released.
 * @returns {Object} They keys currently pressed down.
 */
function keyboard_module(onUpdate) {
    'use strict';

    var kb = {};
    var unicode_mapping = {};
    var key;

    document.onkeydown = function(e) {
        var unicode = e.charCode ? e.charCode : e.keyCode;
        key = getKey(unicode);
        kb[key] = true;

        if (onUpdate) {
            onUpdate(kb);
        }
    };

    document.onkeyup = function(e) {
        var unicode = e.charCode ? e.charCode : e.keyCode;
        key = getKey(unicode);

        delete kb[key];

        if (onUpdate) {
            onUpdate(kb);
        }
    };

    function getKey(unicode) {
        if (unicode_mapping[unicode]) {
            key = unicode_mapping[unicode];
        } else {
            key = unicode_mapping[unicode] = String.fromCharCode(unicode);
        }
        return key;
    }
    return kb;
}

/**
 * Test if the boundboxes of two entities are intersecting
 *
 * @param {Enemy|Player|Bullet|Barrier} obj1 - The first
 * object being tested.
 * @param {Enemy|Player|Bullet|Barrier} obj2 - The second
 * object being tested.
 * @returns {boolean} Returns whether the two objects are
 * intersecting or not.
 */
function collisionTest(obj1, obj2) {
    'use strict';

    if (obj1.x < obj2.x + obj2.width &&
        obj1.x + obj1.width > obj2.x &&
        obj1.y < obj2.y + obj2.height &&
        obj1.height + obj1.y > obj2.y) {

        return true;
    }
}

/**
 * Removes bullets from the bullet array when
 * an in-game event destroys them.
 *
 * @param {[int]} nums - array of indexes of the bullets
 * to delete.
 */
function deleteBullets(nums) {
    'use strict';

    nums.forEach(function(num) {
        bullets.splice(num, 1);
    });

    for (var i = 0; i < bullets.length; i++) {
        bullets[i].num = i;
    }
}

var keyboard = keyboard_module();
