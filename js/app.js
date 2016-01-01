var ENEMY_DX = 0.3;
var ENEMY_DY = 20;
var Start = 0;
var Enemy_Pop = 40;

/**
 * Represents an enemy.
 * @constructor
 * @param {int} posX - the X position of the enemy.
 * @param {int} posY - the Y position of the enemy.
 */
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

/**
 * Update the enemy's position.
 * @param {int} dt - a time delta between ticks.
 */
Enemy.prototype.update = function(dt) {
    var movement = (ENEMY_DX * this.population) * dt;
    this.x += movement;
    this.y += this.dy * dt;

    /**
     * Keep the enemy from going off the edge of the screen.
     * If it does go reach the the edge, reverse direction.
     */
    if ((this.x >= 1200 - 91 || this.x <= 0) && this.display === true) {
        ENEMY_DX = -ENEMY_DX;
        allEnemies.forEach(function(allEnemy) {
            allEnemy.y += ENEMY_DY;
            allEnemy.x += ENEMY_DX;
        });
    }

    /**
     * Enemies will come out of alignment due to position
     * not updating at exacty the same time. This will keep
     * them aligned.
     */
    if (this.num > 7) {
        this.x = allEnemies[this.num - 8].x;
    }

    if (this.num % 8 > 0) {
        this.x = allEnemies[this.num - 1].x + 135
    }

    /**
     * Balance enemy shooting by having each enemy only have a small
     * chance of firing.
     */
    var rand = Math.floor((Math.random() * 2500) + 1);
    if (rand === this.num && this.display === true) {
        this.shoot();
    }
};

/** Draw the enemy on the screen */
Enemy.prototype.render = function() {
    if (this.display === true) {
        ctx.drawImage(Resources.get(this.sprite), this.x, this.y);
    }
};

Enemy.prototype.move = function() {

};

/** Add a bullet to the game when an enemy shoots */
Enemy.prototype.shoot = function() {
    bullets.push(new Bullet(this.x, this.y, "enemy", bullets.length));
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

    var collisionNum = -1
    var state = 0;

    bullets.forEach(function(bullet) {

        if (bullet.type === "player" && enemy.display === true) {

            if (collisionTest(enemy, bullet)) {
                player.shot = false;
                enemy.display = false;
                collisionNum = bullet.num;
                hud.score += 100;
                ENEMY_DX = ENEMY_DX * 1.07;
                Enemy_Pop -= 1;
            }
        }


        if (enemy.y > (725 - enemy.height) && enemy.display === true) {
            barriers.forEach(function(barrier) {

                if (collisionTest(enemy, barrier) && barrier.display === true) {
                    enemy.display = false;
                    barrier.health -= 1;
                    ENEMY_DX = ENEMY_DX * 1.07;
                    Enemy_Pop -= 1;
                }
            });
        }

    });

    if (collisionTest(enemy, player) && enemy.display === true) {
        enemy.display = false;
        player.lives -= 1;
        hud.lives -= 1;
        ENEMY_DX = ENEMY_DX * 1.07;
        Enemy_Pop -= 1;

        if (player.lives > 0) {
            state = 2;
        } else {
            state = 1;
        }
    }

    if ((enemy.y + 70) > 900 && enemy.display === true) {
        player.lives -= 1;
        hud.lives -= 1;
        if (player.lives > 0) {
            state = 2;
        } else {
            state = 1;
        }
    }

    if (Enemy_Pop === 0) {
        state = 3;
    }

    return [collisionNum, state];
}

/**
 * Helper function for finding the vertical placing
 * for enemies.
 */
var calcHeight = function(count) {
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


/**
 * Represents the player
 * @constructor
 */
var Player = function() {
    this.sprite = 'images/player.png';
    this.x = (500) + (77 / 2);
    this.y = 820;
    this.dx = 0;
    this.dy = 0;
    this.width = 77;
    this.height = 52;
    this.lives = 3;
    this.score = 0;
    this.shot = false;
};

/**
 * Update the player's position.
 * @param {int} dt - a time delta between ticks.
 */
Player.prototype.update = function(dt) {
    this.x += this.dx * dt;
    if (this.x < 20) {
        this.x = 20;
    } else if (this.x > 1060) {
        this.x = 1060;
    }
};

/** Draw the player to the screen. */
Player.prototype.render = function() {
    ctx.drawImage(Resources.get(this.sprite), this.x, this.y);
};

/**
 * See what button is being pressed and take
 * the appropriate action.
 * @param {[str]} input - array of keys being pressed.
 */
Player.prototype.handleInput = function(input) {

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
    if (this.shot === false) {
        bullets.push(new Bullet(this.x + this.width / 2, this.y - this.height + 30, "player", bullets.length));
        this.shot = true;
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
    this.y += this.dy * dt;
};

/** Draws the player to the screen. */
Bullet.prototype.render = function() {
    ctx.drawImage(Resources.get(this.sprite), this.x, this.y);
};

/**
 * Sets the bullets movement rate based on
 * type.
 */
Bullet.prototype.move = function() {
    if (this.type === "player") {
        this.dy = -200;
    } else if (this.type === "enemy") {
        this.dy = 200;
    }
}

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

    var collisionNum = -1;
    var state = 0;

    if (bullet.y > 900 || bullet.y < 0) {
        collisionNum = bullet.num;

        if (bullet.type === "player") {
            player.shot = false;
        }
    }

    if (bullet.type === 'enemy' && bullet.y > 700) {

        if (collisionTest(player, bullet)) {
            player.lives -= 1;
            hud.lives -= 1;
            collisionNum = bullet.num;

            if (player.lives > 0) {
                state = 2;
            } else {
                state = 1;
            }
        }
    }

    if (bullet.y > 650) {

        barriers.forEach(function(barrier) {

            if (collisionTest(bullet, barrier) && barrier.display === true) {
                barrier.health -= 1;
                collisionNum = bullet.num;

                if (bullet.type === "player") {
                    player.shot = false;
                }
            }
        });
    }

    return [collisionNum, state];
}


/**
 * Represents a barrier.
 * @constructor
 *
 * @param {int} posX - The barrier's position on the X axis.
 * @param {int} posY - The barrier's position on the Y axis.
 */
var Barrier = function(posX, posY) {
    this.x = posX
    this.y = posY;
    this.width = 92;
    this.height = 69;
    this.health = 10;
    this.display = true;
    this.sprite = 'images/barrier_full.png';

};

/** Update the barrier's sprite. */
Barrier.prototype.update = function() {
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
    if (this.display === true) {
        // we take the difference between the current and original dimensions in order
        // to stop them from shifting around
        ctx.drawImage(Resources.get(this.sprite), this.x + (92 - this.width), this.y + (69 - this.height));
    }
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
    this.score = score;
    this.lives = lives;
};

/** Draw the HUD to the screen */
HUD.prototype.render = function(ctx) {
    ctx.font = "20px Arial";
    ctx.fillStyle = "white";

    var scoreText = "SCORE: " + this.score;
    var livesText = "LIVES: " + this.lives;

    ctx.fillText(scoreText, 10, 30);
    ctx.fillText(livesText, 1100, 30);
};


var allEnemies = [];
var barriers = [];
var bullets = []

var player = new Player();
var hud = new HUD(0, player.lives);

for (var x = 0; x < 41; x++) {
    allEnemies[x] = new Enemy(91 + 135 * (allEnemies.length % 8), calcHeight(x), x);
}
for (var x = 0; x < 3; x++) {
    barriers[x] = new Barrier(230 + (x * 300), 725)
}

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
    var kb = {};
    var unicode_mapping = {};
    document.onkeydown = function(e) {
        var unicode = e.charCode ? e.charCode : e.keyCode
        var key = getKey(unicode);
        kb[key] = true;
        if (onUpdate) {
            onUpdate(kb);
        }
    }

    document.onkeyup = function(e) {
        var unicode = e.charCode ? e.charCode : e.keyCode
        var key = getKey(unicode);
        delete kb[key];
        if (onUpdate) {
            onUpdate(kb);
        }
    }

    function getKey(unicode) {
        if (unicode_mapping[unicode]) {
            var key = unicode_mapping[unicode];
        } else {
            var key = unicode_mapping[unicode] = String.fromCharCode(unicode);
        }
        return key;
    }
    return kb;
}

function testing(kb) {
    //console.log('These are the down keys', kb);
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
    nums.forEach(function(num) {
        bullets.splice(num, 1);
    });

    for (var i = 0; i < bullets.length; i++) {
        bullets[i].num = i;
    }
}

var keyboard = keyboard_module();