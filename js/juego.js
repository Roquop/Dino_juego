let fullscreenButton = document.getElementById("fullscreenButton");
let comandos = document.getElementsByClassName("comando");
document.addEventListener("DOMContentLoaded", function () {

    fullscreenButton.addEventListener("click", function () {
        var elem = document.documentElement;

        if (!document.fullscreenElement && !document.mozFullScreenElement &&
            !document.webkitFullscreenElement && !document.msFullscreenElement) {
            if (elem.requestFullscreen) {
                elem.requestFullscreen();
            } else if (elem.msRequestFullscreen) {
                elem.msRequestFullscreen();
            } else if (elem.mozRequestFullScreen) {
                elem.mozRequestFullScreen();
            } else if (elem.webkitRequestFullscreen) {
                elem.webkitRequestFullscreen(Element.ALLOW_KEYBOARD_INPUT);
            }
        }
        fullscreenButton.classList.add("hidden")
    });


});
let minim;
let forestMusic, desertMusic, snowMusic, lavaPitMusic, heavenMusic, spaceMusic, blackHoleMusic, startMusic, gameOverMusic;
let jumpEffect, liveEffect, crashEffect, eggEffect, clickEffect, speedEffect, shieldEffect;
let currentMusic;
let forestImg, desertImg, snowImg, lavaPitImg, heavenImg, spaceImg, blackHoleImg, fondo_inicio, game_over;
let platformImage, forestPlatform, desertPlatform, snowPlatform, lavaPlatform, heavenPlatform, spacePlatform, blackHolePlatform;
let dinosaurImg1, dinosaurImg2, dinosaurJumpImg;
let collectibleImg, obstacleImg;
let vidasImg, eggImg;
let shieldImg;
let puntos;
let vida_escudo;
let pixelFont;
let bgX = 0;
let useFirstImage = true;
let animationTimer = 0;
let animationInterval = 10;
let dinosaur;
let environment;
let platforms = [];
let obstacles = [];
let collectibles = [];
let score = 0;
let maxPlatforms = 4;
let eggsCollected = 0;
let highScore = 0;
let lives;
let oldScore = 0;
let shieldUse = 3;
let platformDistance = 100;
let speed = 5;
let platformCorrection = 0;
let activatedTeleport = false;
let gameStarted = false;
let gameOver = false;
let instrucciones = false;

function preload() {
    // Load images
    forestImg = loadImage("./assets/forestImg.jpeg");
    desertImg = loadImage("./assets/desertImg.jpeg");
    snowImg = loadImage("./assets/snowImg.jpeg");
    lavaPitImg = loadImage("./assets/lavaPitImg.jpeg");
    heavenImg = loadImage("./assets/heavenImg.jpeg");
    spaceImg = loadImage("./assets/spaceImg.jpeg");
    blackHoleImg = loadImage("./assets/blackHoleImg.jpeg");
    fondo_inicio = loadImage("./assets/fondo_inicio.png");
    game_over = loadImage("./assets/game_over.png");
    forestPlatform = loadImage("./assets/forestPlatform.png");
    desertPlatform = loadImage("./assets/desertPlatform.png");
    snowPlatform = loadImage("./assets/snowPlatform.png");
    lavaPlatform = loadImage("./assets/lavaPlatform.png");
    heavenPlatform = loadImage("./assets/heavenPlatform.png");
    spacePlatform = loadImage("./assets/spacePlatform.png");
    dinosaurImg1 = loadImage("./assets/dinosaurImage1.png");
    dinosaurImg2 = loadImage("./assets/dinosaurImage2.png");
    dinosaurJumpImg = loadImage("./assets/dinosaurJump.png");
    obstacleImg = loadImage("./assets/meteor.png");
    collectibleImg = loadImage("./assets/egg.png");
    puntos = loadImage("./assets/puntos.png");
    vida_escudo = loadImage("./assets/vida_escudo.png");
    vidasImg = loadImage("./assets/vidas.png");
    eggImg = loadImage("./assets/egg.png");
    shieldImg = loadImage("./assets/shieldPixelArt.png");

    // Load font
    pixelFont = loadFont("./assets/arcadeclassic.regular.ttf");

    // Load sounds
    soundFormats('mp3');
    forestMusic = loadSound("./assets/forest.mp3");
    desertMusic = loadSound("./assets/desert.mp3");
    snowMusic = loadSound("./assets/snow.mp3");
    lavaPitMusic = loadSound("./assets/lava_pit.mp3");
    heavenMusic = loadSound("./assets/heaven.mp3");
    spaceMusic = loadSound("./assets/space.mp3");
    blackHoleMusic = loadSound("./assets/black_hole.mp3");
    startMusic = loadSound("./assets/inicio.mp3");
    gameOverMusic = loadSound("./assets/game_over.mp3");
    liveEffect = loadSound("./assets/one_live.mp3");
    jumpEffect = loadSound("./assets/jump.mp3");
    crashEffect = loadSound("./assets/crash.mp3");
    eggEffect = loadSound("./assets/egg_sound.mp3");
    clickEffect = loadSound("./assets/click.mp3");
    speedEffect = loadSound("./assets/speed.mp3");
    shieldEffect = loadSound("./assets/shield.mp3");
}

function setup() {
    createCanvas(800, 600);
    if (window.innerWidth < 1200) {
        let canvas = document.getElementById("defaultCanvas0");
        canvas.classList.add("canvas_movil")
    };
    dinosaur = new Dinosaur();
    environment = new Environment();
    initializeGame();
    currentMusic = startMusic;
    currentMusic.loop();
    platforms.push(new Platform(0, height - 100, width - 100));
    dinosaur.y = platforms[0].y - 50;
    textFont(pixelFont);

}

function draw() {
    if (gameOver) {
        gameOverScreen();
    } else if (gameStarted) {
        Game();
    } else if (!gameStarted && !gameOver) {
        if (instrucciones) {
            verInstrucciones();
        } else {
            Start();
        }
    }
} class Collectible {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.size = 50;
        this.isCollected = false;
    }

    update() {
        this.x -= speed;
        if (!this.isCollected) {
            image(collectibleImg, this.x, this.y - 10, this.size, this.size);
        }
    }

    checkCollision(dinosaurX, dinosaurY, dinosaurSize) {
        if (!this.isCollected && dist(this.x, this.y, dinosaurX + dinosaurSize / 2, dinosaurY + dinosaurSize / 2) < dinosaurSize / 2) {
            this.isCollected = true;
            eggEffect.play();
            score += 100;
            if (eggsCollected > 0) {
                if (eggsCollected % 10 == 0) {
                    lives++;
                    liveEffect.play();
                }
                if (eggsCollected % 50 == 0) {
                    shieldUse += 2;
                }
            }
            return true;
        }
        return false;
    }
}

class Dinosaur {
    constructor() {
        this.x = 100;
        this.y = height / 2;
        this.ySpeed = 0;
        this.isJumping = false;
        this.canDoubleJump = true;
        this.shieldActive = false;
        this.shieldTimer = 0;
        this.oldSpeed = 0;
    }

    update() {
        this.ySpeed += 0.5;
        this.y += this.ySpeed;
        let landed = false;

        for (let p of platforms) {
            if (this.x + 80 > p.x && this.x < p.x + p.width && this.y + 50 >= p.y && this.y + 50 <= p.y + 20 && this.ySpeed > 0) {
                this.y = p.y - 50;
                this.isJumping = false;
                this.ySpeed = 0;
                this.canDoubleJump = true;
                landed = true;
            }
        }

        if (!landed) {
            if (this.y > height) {
                this.y = 200;
                this.ySpeed = -10;
                lives--;
                crashEffect.play();
            }
        }

        if (this.shieldActive) {
            push();
            fill(0);
            textAlign(CENTER);
            textSize(25);
            rectMode(CENTER);
            rect(width / 2, 190, 270, 30);
            fill(255);
            text("El escudo se acaba en " + parseInt(this.shieldTimer / 60), width / 2, 200);
            pop();
            this.shieldTimer--;
            if (this.shieldTimer <= 0) {
                shieldEffect.play();
                this.shieldActive = false;
            }
        }

        if (activatedTeleport) {
            this.teleport();
        }

        animationTimer++;
        if (animationTimer > animationInterval) {
            animationTimer = 0;
            useFirstImage = !useFirstImage;
        }

        let currentImg;
        if (this.isJumping) {
            currentImg = dinosaurJumpImg;
        } else {
            currentImg = useFirstImage ? dinosaurImg1 : dinosaurImg2;
        }
        image(currentImg, this.x, this.y - 50, 100, 100);
        this.displayShield();
    }

    displayShield() {
        if (this.shieldActive) {
            image(shieldImg, this.x - 48, this.y - 110, 200, 200);
        }
    }

    jump() {
        if (!this.isJumping) {
            this.isJumping = true;
            this.ySpeed = -10;
        } else if (this.canDoubleJump) {
            this.ySpeed = -12;
            this.canDoubleJump = false;
        }
    }

    teleport() {
        if (oldScore == 0) {
            oldScore = score;
        }
        if ((score - oldScore) < 10) {
            speed = 50;
        } else {
            activatedTeleport = false;
            oldScore = 0;
        }
    }

    activateShield() {
        if (shieldUse > 0) {
            this.shieldActive = true;
            this.shieldTimer += 180;
            shieldUse--;
            shieldEffect.play();
        }
    }
}
class Environment {
    constructor() {
        this.type = "forest";
        this.initialScore = 3500;
        this.incrementScore = 4000;
        this.currentBg = null;
    }

    update() {
        if (score < this.initialScore) {
            this.type = "forest";
            updateMusic(forestMusic);
            platformImage = forestPlatform;
            platformCorrection = 1.1;
            this.currentBg = forestImg;
            speed = 5;
        } else if (score >= this.initialScore && score < this.initialScore + this.incrementScore) {
            this.type = "desert";
            updateMusic(desertMusic);
            platformImage = desertPlatform;
            platformCorrection = 1.03;
            this.currentBg = desertImg;
            platformDistance = 200;
            speed = 7;
        } else if (score >= this.initialScore + this.incrementScore && score < this.initialScore + this.incrementScore * 2) {
            this.type = "snow";
            updateMusic(snowMusic);
            platformImage = snowPlatform;
            platformCorrection = 1.03;
            this.currentBg = snowImg;
            platformDistance = 300;
            speed = 9;
        } else if (score >= this.initialScore + this.incrementScore * 2 && score < this.initialScore + this.incrementScore * 3) {
            this.type = "lava_pit";
            updateMusic(lavaPitMusic);
            platformImage = lavaPlatform;
            platformCorrection = 1.13;
            this.currentBg = lavaPitImg;
            platformDistance = 350;
            speed = 11;
        } else if (score >= this.initialScore + this.incrementScore * 3 && score < this.initialScore + this.incrementScore * 4) {
            this.type = "heaven";
            updateMusic(heavenMusic);
            platformImage = heavenPlatform;
            platformCorrection = 1.1;
            this.currentBg = heavenImg;
            platformDistance = 450;
            speed = 13;
        } else if (score >= this.initialScore + this.incrementScore * 4 && score < this.initialScore + this.incrementScore * 5) {
            this.type = "space";
            updateMusic(spaceMusic);
            platformImage = spacePlatform;
            platformCorrection = 1.02;
            this.currentBg = spaceImg;
            platformDistance = 500;
            speed = 15;
        } else if (score >= this.initialScore + this.incrementScore * 6) {
            this.type = "black_hole";
            updateMusic(blackHoleMusic);
            platformImage = spacePlatform;
            platformCorrection = 1.02;
            this.currentBg = blackHoleImg;
            platformDistance = 600;
            speed = 17;
        }

        for (let p of platforms) {
            p.platformImg = platformImage;
        }

        if (this.currentBg != null) {
            bgX -= 2;
            if (bgX <= -width) {
                bgX = 0;
            }
            image(this.currentBg, bgX, 0, width, height);
            image(this.currentBg, bgX + width, 0, width, height);
        }
        fill(255, 255, 255, 100);
        rect(0, 0, width, height);
    }
}

function Game() {
    if (gameStarted) {
        if (window.innerWidth < 1200) {
            comandos[0].classList.add("flex");
            comandos[1].classList.add("flex");
            comandos[2].classList.add("flex");
        }
    }
    background(0);
    environment.update();
    dinosaur.update();
    visuals_game();

    for (let i = collectibles.length - 1; i >= 0; i--) {
        let c = collectibles[i];
        c.update();
        if (c.x + c.size < 0 || c.isCollected) {
            collectibles.splice(i, 1);
        }
        if (c.checkCollision(dinosaur.x, dinosaur.y, 50)) {
            eggsCollected++;
        }
    }

    if (random(1) < 0.01 && collectibles.length < 3) {
        let randomPlatform = platforms[floor(random(platforms.length))];
        let collectibleX = random(randomPlatform.x, randomPlatform.x + randomPlatform.width);
        let collectibleY = randomPlatform.y - 40;
        collectibles.push(new Collectible(collectibleX, collectibleY));
    }

    for (let i = platforms.length - 1; i >= 0; i--) {
        let p = platforms[i];
        p.update();
        if (p.x + p.width < 0) {
            platforms.splice(i, 1);
        }
    }

    if (platforms.length < maxPlatforms) {
        let lastX = platforms[platforms.length - 1].x;
        let newX = lastX + platformDistance;
        let newY = random(height - 300, height - 100);
        let newWidth = random(width / 3, 2 * width / 3);
        while (newX <= lastX + platforms[platforms.length - 1].width) {
            newX += platformDistance;
        }
        let newPlatform = new Platform(newX, newY, newWidth);
        platforms.push(newPlatform);
        if (random(1) < 0.2) {
            let obstacleX = newPlatform.x + random(20, newPlatform.width - 50);
            let obstacleY = newPlatform.y - 30;
            newPlatform.addObstacle(obstacleX, obstacleY);
        }
    }

    if (lives <= 0) {
        gameStarted = false;
        gameOver = true;
        updateMusic(gameOverMusic);
    }

    score++;

    for (let p of platforms) {
        for (let o of p.obstacles) {
            if (collisionWithObstacle(dinosaur.x, dinosaur.y, o.x, o.y, o.size) && o.isActive && !dinosaur.shieldActive) {
                o.isActive = false;
                dinosaur.y = 200;
                dinosaur.ySpeed = -10;
                lives--;
                crashEffect.play();
            }
        }
    }
}
function collisionWithObstacle(dinosaurX, dinosaurY, obstacleX, obstacleY, obstacleSize) {
    return (dinosaurX + 50 > obstacleX && dinosaurX < obstacleX + obstacleSize &&
        dinosaurY + 50 > obstacleY && dinosaurY < obstacleY + obstacleSize);
}

function Start() {
    updateMusic(startMusic);
    push();
    image(fondo_inicio, 0, 0, 800, 600);
    textAlign(CENTER);
    textSize(120);
    fill(0, 100);
    textLeading(75);
    let texto = "El ultimo \nDinosaurio";
    let x = width / 2;
    let y = height / 4 - 10;
    fill(255, 180);
    text(texto, x + 3, y + 3);
    fill(0);
    text(texto, x, y);
    textSize(20);
    rectMode(CENTER);
    noStroke();
    fill(50, 200, 50, 210);
    rect(width / 2, height / 2, 200, 80);
    fill(255);
    textSize(28);
    text("Iniciar Juego", width / 2, height / 2 + 10);
    fill(50, 200, 50, 210);
    rect(width / 2, height / 2 + 85, 200, 80);
    textSize(28);
    fill(255);
    text("Instrucciones", width / 2, height / 2 + 95);
    fill(0);
    textSize(20);
    text("Puntuacion Maxima  " + highScore, width / 2, height - 150);
    fill(255);
    text("Puntuacion Maxima  " + highScore, width / 2 - 1, height - 151);
    pop();
}

function initializeGame() {
    dinosaur = new Dinosaur();
    environment = new Environment();
    platforms = [];
    obstacles = [];
    activatedTeleport = false;
    lives = 3;
    speed = 5;
    shieldUse = 3;
    oldScore = 0;
    score = 0;
    eggsCollected = 0;
    platforms.push(new Platform(0, height - 100, width - 100));
    dinosaur.y = platforms[0].y - 50;
}

function verInstrucciones() {
    background(0);
    fill(255);
    push();
    textSize(24);
    textAlign(LEFT, TOP);
    text("En este juego deberas conseguir aguantar vivo el mayor numero de tiempo sin caerte y sin tropezar con los obstaculos \n\n  · Pulsa espacio para saltar \n  · Pulsa q para dar un aceleron todas las veces que quieras!\n  · Pulsa w para un escudo que te protegera de los obstaculos durante 3 segundos \n\nCada vez que consigas 10 huevos ganaras una vida!", 40, 50, width - 40, 400);
    textAlign(CENTER);
    textSize(32);
    rectMode(CENTER);
    fill(50, 200, 50);
    rect(width / 2, height / 2 + 85, 200, 80);
    fill(255);
    textSize(32);
    text("Atras", width / 2, height / 2 + 95);
    pop();
}

class Obstacle {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.size = 75;
        this.isActive = true;
        this.oscillationAmplitude = 2;
        this.oscillationSpeed = 0.1;
    }

    update(platformSpeed) {
        this.x -= platformSpeed;
        this.oscillate();
        image(obstacleImg, this.x, this.y - 30, this.size, this.size);
    }

    oscillate() {
        this.y = this.y + this.oscillationAmplitude * sin(this.oscillationSpeed * frameCount);
    }
}

class Platform {
    constructor(x, y, width) {
        this.x = x;
        this.y = y;
        this.width = width;
        this.obstacles = [];
        this.platformImg = null;
    }

    update() {
        this.x -= speed;
        image(this.platformImg, this.x, this.y / platformCorrection, this.width, 100);
        for (let o of this.obstacles) {
            o.update(speed);
        }
    }

    addObstacle(obstacleX, obstacleY) {
        this.obstacles.push(new Obstacle(obstacleX, obstacleY));
    }
} function gameOverScreen() {
    if (highScore < score) {
        highScore = score;
    }
    if (!gameStarted) {
        comandos[0].classList.remove("flex");
        comandos[1].classList.remove("flex");
        comandos[2].classList.remove("flex");
    }
    push();
    image(game_over, 0, 0);
    textAlign(CENTER);
    textSize(50);
    fill(0);
    text("Se Acabo!", width / 2 + 2, height / 3 + 2);
    fill(255);
    text("Se Acabo!", width / 2, height / 3);
    rectMode(CENTER);
    noStroke();
    fill(50, 200, 50);
    rect(width / 2, height / 2, 200, 80);
    fill(255);
    textSize(27);
    text("Volver a Inicio", width / 2, height / 2 + 10);
    textSize(30);
    fill(0);
    text("Tu puntuacion   es de " + score, width / 2 - 2, height - 202);
    text("Has recogido " + eggsCollected + " huevos", width / 2 - 2, height - 182);
    text("Tu puntuacion   es de " + score, width / 2 + 2, height - 198);
    text("Has recogido " + eggsCollected + " huevos", width / 2 + 2, height - 178);
    fill(255);
    text("Tu puntuacion   es de " + score, width / 2, height - 200);
    text("Has recogido " + eggsCollected + " huevos", width / 2, height - 180);
    pop();
}

function keyPressed() {
    if (key == ' ') {
        dinosaur.jump();
        jumpEffect.play();
    } else if (key == 'q') {
        activatedTeleport = true;
        speedEffect.play();
    } else if (key == 'w') {
        dinosaur.activateShield();
    }
}

function mousePressed() {
    if (window.innerWidth < 1200) {
        if (!gameStarted && mouseX > 176.25 && mouseX < 302 &&
            mouseY > 156 && mouseY < 206 && !instrucciones) {
            clickEffect.play();
            if (!gameOver) {
                gameStarted = true;
            }
            gameOver = false;
            initializeGame();
        }
        if (!gameStarted && mouseX > 176.25 && mouseX < 302 &&
            mouseY > 210 && mouseY < 256) {
            clickEffect.play();
            instrucciones = !instrucciones;
        }
    }
    else {
        if (!gameStarted && mouseX > width / 2 - 100 && mouseX < width / 2 + 100 &&
            mouseY > height / 2 - 40 && mouseY < height / 2 + 40 && !instrucciones) {
            clickEffect.play();
            if (!gameOver) {
                gameStarted = true;
            }
            gameOver = false;
            initializeGame();
        }
        if (!gameStarted && mouseX > width / 2 - 100 && mouseX < width / 2 + 100 &&
            mouseY > height / 2 + 50 && mouseY < height / 2 + 130) {
            clickEffect.play();
            instrucciones = !instrucciones;
        }
    }

}

function mouseClicked() {
    console.log(mouseX, mouseY);
    if (gameStarted) {
        if (mouseX > width / 2 && mouseX < width - 150) {
            dinosaur.jump();
            jumpEffect.play();
        } else if (mouseX < 0 && mouseX > -150) {
            activatedTeleport = true;
            teleportEffect.play();
        } else if (mouseX > 133 && mouseX < 335 && mouseY > 313 && mouseY < 360) {
            dinosaur.activateShield();
        }
    }
}

function updateMusic(music) {
    if (currentMusic != music) {
        currentMusic.stop();
        currentMusic = music;
        currentMusic.loop();
    }
}

function visuals_game() {
    push();
    image(vida_escudo, width - 300, 20, 300, 150);
    image(vida_escudo, 0, 20, 300, 150);
    image(puntos, 300, 20, 200, 120);
    image(eggImg, 80, 55, 70, 70);
    fill(255);
    textSize(100);
    text(eggsCollected, 150, 120);
    image(vidasImg, width - 255, 65, 50, 50);
    fill(255);
    textSize(70);
    text(lives, width - 200, 108);
    image(shieldImg, width - 135, 50, 70, 70);
    textSize(70);
    fill(255);
    text(shieldUse, width - 76, 108);
    textSize(20);
    text("Puntos", width / 2 - 32, 50);
    text("Jugador", width - 186, 148);
    text("Huevos", 117, 148);
    textSize(32);
    textAlign(CENTER);
    text(score, width / 2, 100);
    pop();
}
