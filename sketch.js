let player;
let walls;
let candys;
let score = 0;
let level = 1;
let lastWallChange = 0;
let playerAnimations = {};
let lastDir = "Down";
let wallImages = [];
let enemyAnimations = {};
let enemy;
let gracePeriod = 900;

function preload() {
  playerAnimations.idleDown = loadAnimation(loadSpriteSheet("assets/IdleDown.png", 18, 29, 3));
  playerAnimations.idleUp = loadAnimation(loadSpriteSheet("assets/IdleUp.png", 18, 29, 3));
  playerAnimations.idleLeft = loadAnimation(loadSpriteSheet("assets/IdleLeft.png", 18, 29, 3));
  playerAnimations.idleRight = loadAnimation(loadSpriteSheet("assets/IdleRight.png", 18, 29, 3));

  playerAnimations.idleDown.frameDelay = 14;
  playerAnimations.idleUp.frameDelay = 14;
  playerAnimations.idleLeft.frameDelay = 14;
  playerAnimations.idleRight.frameDelay = 14;

  playerAnimations.runDown = loadAnimation(loadSpriteSheet("assets/RunDown.png", 18, 29, 4));
  playerAnimations.runUp = loadAnimation(loadSpriteSheet("assets/RunUp.png", 18, 29, 4));
  playerAnimations.runLeft = loadAnimation(loadSpriteSheet("assets/RunLeft.png", 18, 29, 4));
  playerAnimations.runRight = loadAnimation(loadSpriteSheet("assets/RunRight.png", 18, 29, 4));

  playerAnimations.runDown.frameDelay = 11;
  playerAnimations.runUp.frameDelay = 11;
  playerAnimations.runLeft.frameDelay = 11;
  playerAnimations.runRight.frameDelay = 11;

  candyAnimation = loadAnimation(loadSpriteSheet("assets/Candy.png", 16, 17, 2));
  candyAnimation.frameDelay = 18;

  wallImages.push(loadImage("assets/Carrot.png"));
  wallImages.push(loadImage("assets/Tomato.png"));
  wallImages.push(loadImage("assets/Broccoli.png"));

  enemyAnimations.runRight = loadAnimation(loadSpriteSheet("assets/EnemyRunRight.png", 18, 30, 4));
  enemyAnimations.runLeft = loadAnimation(loadSpriteSheet("assets/EnemyRunLeft.png", 18, 30, 4));
  
  enemyAnimations.runRight.frameDelay = 12;
  enemyAnimations.runLeft.frameDelay = 12;

  biteSound = loadSound("assets/bite.wav");
  biteSound.setVolume(0.3);

  grandmaSound = loadSound("assets/getoverhere.wav");
  grandmaSound.setVolume(0.2);

  bgMusic = loadSound("assets/backmusic.mp3");
  bgMusic.setVolume(0.3);
}

function setup() {
  let cnv = createCanvas(850, 650);
  cnv.parent('canvas-container');
  noSmooth();

  bgMusic.loop();

  player = createSprite(50, height / 2, 18, 29);
  player.scale = 2.4
  player.setCollider("rectangle", 0, 0, 10, 19);

  player.addAnimation("idleDown", playerAnimations.idleDown);
  player.addAnimation("idleUp", playerAnimations.idleUp);
  player.addAnimation("idleLeft", playerAnimations.idleLeft);
  player.addAnimation("idleRight", playerAnimations.idleRight);

  player.addAnimation("runDown", playerAnimations.runDown);
  player.addAnimation("runUp", playerAnimations.runUp);
  player.addAnimation("runLeft", playerAnimations.runLeft);
  player.addAnimation("runRight", playerAnimations.runRight);
  
  // enemy
  enemy = createSprite(width - 50, height / 2, 20, 20); 
  enemy.shapeColor = "red";
  enemy.scale = 2.6;

  enemy.addAnimation("runRight", enemyAnimations.runRight);
  enemy.addAnimation("runLeft", enemyAnimations.runLeft);

  walls = new Group();
  candys = new Group();

  generateWalls();
  generateCandy();

  textSize(20);
  textAlign(LEFT);
}

function draw() {
  background(75);
  let moving = false;

  fill(255);
  text("Candy: " + score, 20, 32);
  text("Level: " + level, 750, 32);

  let enemySpeed = (level / 4);
  let playerSpeed = enemySpeed + 1.5; 

  // player movement and animations
  if (keyIsDown(LEFT_ARROW)) {
    player.position.x -= playerSpeed;
    player.changeAnimation("runLeft");
    lastDir = "Left";
    moving = true;
  }
  if (keyIsDown(RIGHT_ARROW)) {
    player.position.x += playerSpeed;
    player.changeAnimation("runRight");
    lastDir = "Right";
    moving = true;
  }
  if (keyIsDown(UP_ARROW)) {
    player.position.y -= playerSpeed;
    player.changeAnimation("runUp");
    lastDir = "Up";
    moving = true;
  }
  if (keyIsDown(DOWN_ARROW)) {
    player.position.y += playerSpeed;
    player.changeAnimation("runDown");
    lastDir = "Down";
    moving = true;
  }

  // idle
  if (!moving) {
    player.changeAnimation("idle" + lastDir);
  }

  // keepa player inside canvas
  player.position.x = constrain(player.position.x, 0, width);
  player.position.y = constrain(player.position.y, 0, height);

  // enemy movement
  if (enemy.position.x < player.position.x) {
    enemy.position.x = enemy.position.x + enemySpeed;
    enemy.changeAnimation("runRight");
  }
  if (enemy.position.x > player.position.x) {
    enemy.position.x = enemy.position.x - enemySpeed;
    enemy.changeAnimation("runLeft");
  }
  if (enemy.position.y < player.position.y) {
    enemy.position.y = enemy.position.y + enemySpeed;
  }
  if (enemy.position.y > player.position.y) {
    enemy.position.y = enemy.position.y - enemySpeed;
  }


  // game over after grace period
  if (millis() - lastWallChange > gracePeriod) {
    if (player.overlap(walls) || player.overlap(enemy)) {
      fill("red");
      textSize(40);
      text("GAME OVER", width / 2 - 120, height / 2);
      bgMusic.stop();
      noLoop();
    }
  }  

  // candy collection
  player.overlap(candys, (p, c) => {
    score++;
    biteSound.play();
    c.remove();
  });

  // all candy collected -> next level
  if (candys.length === 0) {
    generateCandy();
    grandmaSound.play();
    level++;
  }

  // randomize walls every 2 seconds
  if (millis() - lastWallChange > 2000) {
    walls.removeSprites();
    generateWalls();
    lastWallChange = millis();
  }

  drawSprites();
}

function generateWalls() {
  walls.removeSprites();

  let numWalls = 6 + level;

  while (walls.length < numWalls) {
    let x = random(100, width - 100);
    let y = random(50, height - 50);

    // random vegetable
    let img = random(wallImages);

    let tempWall = createSprite(x, y);
    tempWall.addImage(img);

    if (img === wallImages[0]) { 
      // carrot
      tempWall.scale = 3.5;
    } else if (img === wallImages[1]) {
      // tomato
      tempWall.scale = 2.1;
    } else if (img === wallImages[2]) {
      // broccoli
      tempWall.scale = 2.4; 
    }

    // scales all veggies
    // tempWall.scale = 2;

    // check overlap with existing walls
    let overlapping = false;
    for (let i = 0; i < walls.length; i++) {
      if (tempWall.overlap(walls[i])) {
        overlapping = true;
        break;
      }
    }

    if (overlapping) {
      tempWall.remove();
    } else {
      walls.add(tempWall);
    }
  }
}

function generateCandy() {
  for (let i = 0; i < 5; i++) {
    let x = random(100, width - 100);
    let y = random(50, height - 50);

    let candy = createSprite(x, y);
    candy.addAnimation("spin", candyAnimation);
    candy.changeAnimation("spin");
    candy.scale = 2.4;
    candys.add(candy);
  }
}

// if bgmusic does not play at startup
function mousePressed() {
  if (key === 'k' || key ==='K') {
    if (!bgMusic.isPlaying()) {
      bgMusic.loop();
    }
  }
}