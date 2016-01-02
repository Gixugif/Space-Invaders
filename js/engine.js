/**
 * Engine.js
 * This file provides the game loop functionality (update entities and render),
 * draws the initial game board on the screen, and then calls the update and
 * render methods on your player and enemy objects (defined in your app.js).
 */
/**
 * Predefine the variables we'll be using within this scope,
 * create the canvas element, grab the 2D context for that canvas
 * set the canvas elements height/width and add it to the DOM.
 */
var Engine = (function(global) {

    var doc = global.document,
        win = global.window,
        canvas = doc.createElement('canvas'),
        ctx = canvas.getContext('2d'),
        lastTime;


    canvas.width = 1200;
    canvas.height = 900;
    doc.body.appendChild(canvas);
    ctx.rect(0, 0, canvas.width, canvas.height);


    /* This function serves as the kickoff point for the game loop itself
     * and handles properly calling the update and render methods.
     */
    function main() {
        /* Get our time delta information which is required if your game
         * requires smooth animation. Because everyone's computer processes
         * instructions at different speeds we need a constant value that
         * would be the same for everyone (regardless of how fast their
         * computer is) - hurray time!
         */
        var now = Date.now(),
            dt = (now - lastTime) / 1000.0;

        /* Call our update/render functions, pass along the time delta to
         * our update function since it may be used for smooth animation.
         */
        player.handleInput(null);

        /** Don't start until the player moves */
        if (Start === 1) {
            update(dt);
            var state = collisions();
        }

        render();

        /**
         * Set our lastTime variable which is used to determine the time delta
         * for the next time this function is called.
         */
        lastTime = now;

        //** reset if in reset state */
        if (state > 0) init(state);

        /**
         * Use the browser's requestAnimationFrame function to call this
         * function again as soon as the browser is able to draw another frame.
         */
        win.requestAnimationFrame(main);

    }

    /**
     * This function does some initial setup that should only occur once,
     * particularly setting the lastTime variable that is required for the
     * game loop.
     */
    function init(state) {
        reset(state);
        lastTime = Date.now();
        main();
    }

    /**
     * This function is called by main (our game loop) and itself calls all
     * of the functions which may need to update entity's data. Based on how
     * you implement your collision detection (when two entities occupy the
     * same space, for instance when your character should die), you may find
     * the need to add an additional function call here. For now, we've left
     * it commented out - you may or may not want to implement this
     * functionality this way (you could just implement collision detection
     * on the entities themselves within your app.js file).
     */
    function update(dt) {
        updateEntities(dt);
    }

    /**
     * This is called by the update function  and loops through all of the
     * objects within your allEnemies array as defined in app.js and calls
     * their update() methods. It will then call the update function for your
     * player object. These update methods should focus purely on updating
     * the data/properties related to  the object. Do your drawing in your
     * render methods.
     */
    function updateEntities(dt) {

        player.update(dt);

        allEnemies.forEach(function(enemy) {
            enemy.move();
            enemy.update(dt);
            enemy.shoot();
        });

        bullets.forEach(function(bullet) {
            bullet.move();
            bullet.update(dt);
        });

        barriers.forEach(function(barrier) {
            barrier.update(dt);
        });

    }

    /**
     * This function initially draws the "game level", it will then call
     * the renderEntities function. Remember, this function is called every
     * game tick (or loop of the game engine) because that's how games work -
     * they are flipbooks creating the illusion of animation but in reality
     * they are just drawing the entire screen over and over.
     */
    function render() {
        /* This array holds the relative URL to the image used
         * for that particular row of the game level.
         */
        ctx.fillStyle = 'black';
        ctx.fill();
        renderEntities();

    }

    /**
     * This function is called by the render function and is called on each game
     * tick. It's purpose is to then call the render functions you have defined
     * on your enemy and player entities within app.js
     */
    function renderEntities() {
        /**
         * Loop through all of the objects within the allEnemies array and call
         * the render function you have defined.
         */
        allEnemies.forEach(function(enemy) {
            enemy.render();
        });

        bullets.forEach(function(bullet) {
            bullet.render();
        });

        player.render();

        barriers.forEach(function(barrier) {
            barrier.render();
        });

        hud.render(ctx);
    }

    function collisions() {

        var delBullets = [];
        var collisionResults = [];
        var resetState = 0;

        allEnemies.every(function(enemy, index, array) {
            collisionResults = enemy.testCollision(enemy);

            if (collisionResults[0] !== -1) delBullets.push(collisionResults[0]);

            if (collisionResults[1] !== 0) resetState = collisionResults[1];

            /**
             * We don't want to lose lives for every enemy past the bottom of the screen
             * so we need to break ouf of the loop once we've found one.
             */
            return (resetState !== 0) ? false : true;

        });

        bullets.forEach(function(bullet) {
            collisionResults = bullet.testCollision(bullet);

            if (collisionResults[0] !== -1) delBullets.push(collisionResults[0]);

            if (collisionResults[1] !== 0) resetState = collisionResults[1];
        });

        deleteBullets(delBullets);
        return resetState;

    }


    /**
     * Resets the state of the game to different degrees depending on the
     * cause of the reset.
     *
     * State 1: Game Over - When the player loses all of its lives the game
     * will reset to its original state.
     *
     * State 2: Lost Life - If the player loses a life the remaining enemies
     * and player will move to their original position and all bullets will
     * be erased.
     *
     * State 3: Round Won - If all of the enemies are defeated the game will
     * reset to its original state except the current score and lives will
     * remain the same.
     *
     * @param {int} state - The state to reset the game to.
     */
    function reset(state) {
        bullets = [];

        if (state === 1) {
            /** Game Over */

            /** Init globals */
            enemyDX = 0.3;
            allEnemies = [];
            barriers = [];
            Enemy_Pop = 40;

            player = new Player();

            hud = new HUD(0, 3);

            createEnemies();
            createBarriers();

            Start = 0;
        } else if (state === 2) {
            /** Lost Life */
            var x = 0;

            /** Move player back to original position */
            player.x = (500) + (77 / 2);
            player.y = 820;
            player.shot = false;

            /** Move enemies back to original positions */
            allEnemies.forEach(function(enemy) {
                enemy.x = (91 + 135 * (x % 8));
                enemy.y = calcHeight(x);
                x++;
            });

            Start = 0;
        } else if (state === 3) {
            /** Round Won */

            /** Init globals */
            enemyDX = 0.3;
            allEnemies = [];
            barriers = [];
            Enemy_Pop = 40;

            /** Move player back to original position */
            player.x = (500) + (77 / 2);
            player.y = 820;
            player.shot = false;

            createEnemies();
            createBarriers();

            Start = 0;
        }

    }

    /**
     * Go ahead and load all of the images we know we're going to need to
     * draw our game level. Then set init as the callback method, so that when
     * all of these images are properly loaded our game will start.
     */
    Resources.load([
        'images/enemy1.png',
        'images/player.png',
        'images/barrier_full.png',
        'images/barrier_slight.png',
        'images/barrier_more.png',
        'images/barrier_serious.png',
        'images/barrier_most.png',
        'images/bullet.png'
    ]);
    Resources.onReady(init);

    /**
     * Assign the canvas' context object to the global variable (the window
     * object when run in a browser) so that developer's can use it more easily
     * from within their app.js files.
     */
    global.ctx = ctx;
})(this);