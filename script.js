document,
  addEventListener("load", function () {
    const canvas = document.getElementById("canvas1");
    const ctx = canvas.getContext("2d");
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    const collisionCanvas = document.getElementById("collisionCanvas");
    const collisionCtx = collisionCanvas.getContext("2d");
    collisionCanvas.width = window.innerWidth;
    collisionCanvas.height = window.innerHeight;
    let highScore = localStorage.getItem("highScore")
      ? parseInt(localStorage.getItem("highScore"))
      : 0;

    let score = 0;
    let gameOver = false;

    let backgroundMusic = new Audio();
    backgroundMusic.src = "dark chamber piano.mp3";
    backgroundMusic.loop = true;
    backgroundMusic.volume = 1; // Adjust the volume (0 to 1)
    backgroundMusic.play();

    let backgroundImage = new Image();
    backgroundImage.src =
      "Repo__2d_dark_hunted_forest_asset_concept_art_inspired_by_tim_b_f9a0c67a-3c54-4c0e-bec3-4a79820953f6.png";
    ctx.font = "50px Impact";

    let timeToNextRaven = 0;
    let ravenInterval = 500;
    let lastTime = 0;

    let ravens = [];
    class Raven {
      constructor() {
        this.spriteWidth = 271;
        this.spriteHeight = 194;
        this.sizeModifier = Math.random() * 0.6 + 0.4;
        this.width = this.spriteWidth * this.sizeModifier;
        this.height = this.spriteHeight * this.sizeModifier;
        this.x = canvas.width;
        this.y = Math.random() * (canvas.height - this.height);
        this.directionX = Math.random() * 5 + 3;
        this.directionY = Math.random() * 5 - 2.5;
        this.markedForDeletion = false;
        this.image = new Image();
        this.image.src = "raven.png";
        this.frame = 0;
        this.maxFrame = 4;
        this.timeSinceFlap = 0;
        this.flapInterval = Math.random() * 50 + 50;
        this.randomColors = [
          Math.floor(Math.random() * 255),
          Math.floor(Math.random() * 255),
          Math.floor(Math.random() * 255),
        ];
        this.color =
          "rgb(" +
          this.randomColors[0] +
          "," +
          this.randomColors[1] +
          "," +
          this.randomColors[2] +
          ")";
        this.hasTrail = Math.random() > 0.5;
      }
      update(deltaTime) {
        if (this.y < 0 || this.y > canvas.height - this.height) {
          this.directionY = this.directionY * -1;
        }
        this.x -= this.directionX;
        this.y += this.directionY;
        if (this.x < 0 - this.width) this.markedForDeletion = true;
        this.timeSinceFlap += deltaTime;
        if (this.timeSinceFlap > this.flapInterval) {
          if (this.frame > this.maxFrame) this.frame = 0;
          else this.frame++;
          this.timeSinceFlap = 0;
          if (this.hasTrail) {
            for (let i = 0; i < 5; i++) {
              particles.push(
                new Particle(this.x, this.y, this.width, this.color)
              );
            }
          }
        }
        if (this.x < 0 - this.width) gameOver = true;
      }
      draw() {
        collisionCtx.fillStyle = this.color;
        collisionCtx.fillRect(this.x, this.y, this.width, this.height);
        ctx.drawImage(
          this.image,
          this.frame * this.spriteWidth,
          0,
          this.spriteWidth,
          this.spriteHeight,
          this.x,
          this.y,
          this.width,
          this.height
        );
      }
    }

    let explosion = [];

    class Explosion {
      constructor(x, y, size) {
        this.image = new Image();
        this.image.src = "boom.png";
        this.spriteWidth = 200;
        this.spriteHeight = 179;
        this.size = size;
        this.x = x;
        this.y = y;
        this.frame = 0;
        this.sound = new Audio();
        this.sound.src = "Fire impact 1.wav";
        this.timeSinceLastFrame = 0;
        this.frameInterval = 200;
        this.markedForDeletion = false;
      }
      update(deltaTime) {
        if (this.frame === 0) this.sound.play();
        this.timeSinceLastFrame += deltaTime;
        if (this.timeSinceLastFrame > this.frameInterval) {
          this.frame++;
          this.timeSinceLastFrame = 0;
          if (this.frame > 5) this.markedForDeletion = true;
        }
      }
      draw() {
        ctx.drawImage(
          this.image,
          this.frame * this.spriteWidth,
          0,
          this.spriteWidth,
          this.spriteHeight,
          this.x,
          this.y - this.size / 4,
          this.size,
          this.size
        );
      }
    }

    let particles = [];
    class Particle {
      constructor(x, y, size, color) {
        this.size = size;
        this.x = x + this.size / 2 + Math.random() * 50 - 25;
        this.y = y + this.size / 3 + Math.random() * 50 - 25;
        this.radius = (Math.random() * this.size) / 10;
        this.maxRadius = Math.random() * 20 + 35;
        this.markedForDeletion = false;
        this.speedX = Math.random() * 1 + 0.5;
        this.color = color;
      }
      update() {
        this.x += this.speedX;
        this.radius += 0.3;
        if (this.radius > this.maxRadius - 5) this.markedForDeletion = true;
      }
      draw() {
        ctx.save();
        ctx.globalAlpha = 1 - this.radius / this.maxRadius;
        ctx.beginPath();
        ctx.fillStyle = this.color;
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      }
    }

    function drawScore() {
      ctx.fillStyle = "black";
      ctx.fillText("Score:" + score, 50, 75);
      ctx.fillStyle = "white";

      ctx.fillText("Score:" + score, 55, 80);
    }

    function updateHighScore() {
      if (score > highScore) {
        highScore = score;
        localStorage.setItem("highScore", highScore);
      }
    }

    function drawHighScore() {
      ctx.fillStyle = "black";
      ctx.fillText("High Score:" + highScore, 50, 125);
      ctx.fillStyle = "white";
      ctx.fillText("High Score:" + highScore, 55, 130);
    }

    function drawGameOver() {
      ctx.textAlign = "center";
      ctx.fillStyle = "black";
      ctx.fillText(
        `GAME OVER, Your score is ${score}`,
        canvas.width / 2,
        canvas.height / 2
      );
      ctx.textAlign = "center";
      ctx.fillStyle = "white";
      ctx.fillText(
        `GAME OVER, Your score is ${score}`,
        canvas.width / 2,
        canvas.height / 2 + 5
      );
      ctx.fillStyle = "white";
      ctx.fillRect(canvas.width / 2 - 100, canvas.height / 2 + 50, 200, 50);
      ctx.fillStyle = "black";
      ctx.fillText("RESTART", canvas.width / 2, canvas.height / 2 + 85);
    }

    let musicStarted = false;

    window.addEventListener("click", function (e) {
      if (!musicStarted) {
        backgroundMusic.play();
        musicStarted = true;
      }
      const detectPixelColor = collisionCtx.getImageData(e.x, e.y, 1, 1);
      console.log(detectPixelColor);
      const pc = detectPixelColor.data;

      let ravenClicked = false; // Add a flag to check if a raven was clicked

      ravens.forEach((object) => {
        if (
          object.randomColors[0] === pc[0] &&
          object.randomColors[1] === pc[1] &&
          object.randomColors[2] === pc[2]
        ) {
          // Collision detection
          object.markedForDeletion = true;
          score++;
          explosion.push(new Explosion(object.x, object.y, object.width));
          console.log(explosion);
          ravenClicked = true; // Set the flag to true if a raven was clicked
        }
      });

      // If the click was not on a raven, set gameOver to true
      if (!ravenClicked) {
        gameOver = true;
      }
      if (!ravenClicked) {
        gameOver = true;
        updateHighScore(); // Update the high score when the game is over
      }
    });
    canvas.addEventListener("click", function (e) {
      if (gameOver) {
        const rect = canvas.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;

        if (
          x >= canvas.width / 2 - 100 &&
          x <= canvas.width / 2 + 100 &&
          y >= canvas.height / 2 + 50 &&
          y <= canvas.height / 2 + 100
        ) {
          resetGame();
        }
      }
    });

    function restart() {
      score = 0;
      gameOver = false;
      lastTime = 0;
      timeToNextRaven = 0;
      ravens = [];
      explosion = [];
      particles = [];
      animate(0);
    }
    function animate(timestamp) {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      collisionCtx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(
        backgroundImage,
        0,
        0,
        2400,
        910,
        0,
        0,
        canvas.width,
        canvas.height
      );

      let deltaTime = timestamp - lastTime;
      lastTime = timestamp;
      timeToNextRaven += deltaTime;
      if (timeToNextRaven > ravenInterval) {
        ravens.push(new Raven());
        timeToNextRaven = 0;
        ravens.sort(function (a, b) {
          return a.width - b.width;
        });
      }
      drawScore();
      drawHighScore();

      drawScore();
      [...particles, ...ravens, ...explosion].forEach((object) =>
        object.update(deltaTime)
      );
      [...particles, ...ravens, ...explosion].forEach((object) =>
        object.draw()
      );
      ravens = ravens.filter((object) => !object.markedForDeletion);
      explosion = explosion.filter((object) => !object.markedForDeletion);
      particles = particles.filter((object) => !object.markedForDeletion);
      if (!gameOver) requestAnimationFrame(animate);
      else drawGameOver();
    }

    animate(0);
  });
