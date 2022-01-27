import './style.css'

// colors;
const white = '#ffffff';

const app = document.querySelector('#app');
const scoreEl = document.querySelector('#scoreEl');
const resultEl = document.querySelector('#resultEl');

// game state
const game = { over: false, active: true };
const canvas = document.querySelector('canvas');
// 16:9 acpect ratio
canvas.width = 1024;
canvas.height = 576;
const { left, top } = canvas.getBoundingClientRect();
const ctx = canvas.getContext('2d');
const stepWidthFactor = 100;
let score = 0;

ctx.globalCompositeOperation = "source-over";
ctx.fillStyle = "rgba(0, 0, 0, 0.3)";
ctx.fillRect(0, 0, canvas.width, canvas.height);
ctx.globalCompositeOperation = "lighter";

function getRandomColor() {
  var r = Math.random() * 255 >> 0;
  var g = Math.random() * 255 >> 0;
  var b = Math.random() * 255 >> 0;
  return "rgba(" + r + ", " + g + ", " + b + ", 0.5)";
}

// player
class Player {
  constructor() {
    this.color = "red"
    this.radius = 50
    this.position = {
      x: canvas.width / 2,
      y: canvas.height / 2
    }
    this.projectiles = []
    this.opacity = 1
  }
  draw() {
    ctx.save()
    ctx.globalAlpha = this.opacity
    ctx.beginPath();
    const gradient = ctx.createRadialGradient(this.position.x, this.position.y, 0, this.position.x, this.position.y, this.radius);
    gradient.addColorStop(0, white);
    gradient.addColorStop(0.4, white);
    gradient.addColorStop(0.4, this.color);
    gradient.addColorStop(1, "black");
    ctx.fillStyle = gradient;
    ctx.arc(this.position.x, this.position.y, this.radius, 0, Math.PI * 2);
    ctx.fill()
    ctx.closePath()
    ctx.restore()
  }
  shoot({ x, y }) {
    this.projectiles.push(new Projectile({
      position: this.position,
      target: {
        x, y
      }
    }))
  }
  hide(particles) {
    this.opacity = 0
    for (let i = 0; i < 100; i++) {
      particles.push(new Particle({
        color: white,
        position: {
          x: this.position.x,
          y: this.position.y
        }
      }))
    }
  }
}

// projectile
class Projectile {
  constructor({ position, target, color, radius }) {
    this.radius = radius || 12;
    this.color = color || white;
    this.position = {
      x: position.x,
      y: position.y
    }
    this.target = {
      x: target.x,
      y: target.y
    }
    this.velocity = {
      x: (this.position.x - this.target.x) / stepWidthFactor * -1,
      y: (this.position.y - this.target.y) / stepWidthFactor * -1
    }
    this.opacity = 1
  }
  draw() {
    ctx.save()
    ctx.globalAlpha = this.opacity
    ctx.fillStyle = this.color;
    ctx.beginPath();
    ctx.arc(this.position.x, this.position.y, this.radius, 0, Math.PI * 2, false);
    ctx.fill()
    ctx.closePath()
    ctx.restore()
  }
  update() {
    this.draw()
    const shouldMove = Math.abs(this.position.x - this.target.x) > 1 || Math.abs(this.position.y - this.target.y) > 1;
    if (shouldMove) {
      this.position.x += this.velocity.x;
      this.position.y += this.velocity.y;
    } else {
      this.velocity.x = 0;
      this.velocity.y = 0;
      this.opacity = 0
    }
  }
}

class Enemy {
  constructor({ position, velocity, color, radius }) {
    this.position = {
      x: position.x,
      y: position.y
    }
    this.velocity = {
      x: velocity.x,
      y: velocity.y
    }
    this.radius = radius
    this.color = color
    this.projectiles = []
  }
  draw() {
    ctx.save()
    ctx.globalAlpha = this.opacity
    const gradient = ctx.createRadialGradient(this.position.x, this.position.y, 0, this.position.x, this.position.y, this.radius);
    gradient.addColorStop(0, white);
    gradient.addColorStop(0.4, white);
    gradient.addColorStop(0.4, this.color);
    gradient.addColorStop(1, "black");
    ctx.fillStyle = gradient;
    ctx.beginPath();
    ctx.arc(this.position.x, this.position.y, this.radius, 0, Math.PI * 2, false);
    ctx.fill()
    ctx.closePath()
    ctx.restore()
  }
  update() {
    this.draw()
    this.position.x += this.velocity.x;
    this.position.y += this.velocity.y;
  }
  shoot() {
    this.projectiles.push(new Projectile({
      position: this.position,
      color: "yellow",
      target: {
        x: player.position.x,
        y: player.position.y
      }
    }))
  }
  hide(particles) {
    this.opacity = 0;
    for (let i = 0; i < 100; i++) {
      particles.push(new Particle({
        color: this.color,
        position: {
          x: this.position.x,
          y: this.position.y
        }
      }))
    }
  }
}

class Particle {
  constructor({ position, color }) {
    this.position = {
      x: position.x,
      y: position.y
    }
    this.velocity = {
      x: Math.floor([-1, 1][Math.random() * 2 | 0] * (Math.random() * 10)),
      y: Math.floor([-1, 1][Math.random() * 2 | 0] * (Math.random() * 10))
    }
    this.color = color
    this.radius = Math.random() * 5
    this.opacity = 1
  }
  draw() {
    ctx.save()
    ctx.globalAlpha = this.opacity
    ctx.fillStyle = this.color;
    ctx.beginPath();
    ctx.arc(this.position.x, this.position.y, this.radius, 0, Math.PI * 2, false);
    ctx.fill()
    ctx.closePath()
    ctx.restore()
  }
  update() {
    this.draw()
    this.position.x += this.velocity.x;
    this.position.y += this.velocity.y;
    if (this.opacity > 0) {
      this.opacity -= 0.05
    } else {
      this.opacity = 0;
    }
  }
}

// entities
const player = new Player();
const enemies = [];
const particles = [];
let frames = 0;
let enemySpawnGap = 1;

function animate() {
  if (!game.active) return;
  requestAnimationFrame(animate);
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  player.draw();

  // update enemy position and remove if it is out of canvas already
  enemies.forEach((enemy, enemyIndex) => {
    if (enemy.position.x + enemy.radius >= canvas.width || enemy.position.x - enemy.radius <= 0 ||
      enemy.position.y + enemy.radius >= canvas.height || enemy.position.y - enemy.radius <= 0) {
      setTimeout(() => {
        enemies.splice(enemyIndex, 1)
      }, 0)
    } else {
      enemy.update()

      // update enemy projectiles position and remove if it faded already
      enemy.projectiles.forEach((eProjectile, eProjectileIndex) => {
        if (eProjectile.position.x + eProjectile.radius <= player.position.x + player.radius &&
          eProjectile.position.x - eProjectile.radius >= player.position.x - player.radius &&
          eProjectile.position.y + eProjectile.radius <= player.position.y + player.radius &&
          eProjectile.position.y - eProjectile.radius >= player.position.y - player.radius) {
          showResult('you lose')
          game.over = true
          player.hide(particles);
          setTimeout(() => {
            game.active = false;
          }, 3000)
        } else if (eProjectile.opacity === 0) {
          setTimeout(() => {
            enemy.projectiles.splice(eProjectileIndex, 1)
          }, 0)
        } else {
          eProjectile.update();
        }
      })

      // detect collision with player projectile on enemy
      player.projectiles.forEach((playerProjectile, playerProjectileIndex) => {
        if (enemy.position.x + enemy.radius >= playerProjectile.position.x + playerProjectile.radius &&
          enemy.position.x - enemy.radius <= playerProjectile.position.x - playerProjectile.radius &&
          enemy.position.y + enemy.radius >= playerProjectile.position.y + playerProjectile.radius &&
          enemy.position.y - enemy.radius <= playerProjectile.position.y - playerProjectile.radius) {
          enemy.hide(particles);
          updateScore();
          setTimeout(() => {
            const playerProjectileFound = player.projectiles.find(i => i === playerProjectile);
            if (playerProjectileFound) player.projectiles.splice(playerProjectileIndex, 1)
            const enemyFound = enemies.find(j => j === enemy);
            if (enemyFound) enemies.splice(enemyIndex, 1)
          }, 0);
        } else if (playerProjectile.opacity === 0) {
          // remove if it faded already
          setTimeout(() => {
            player.projectiles.splice(playerProjectileIndex, 1)
          }, 0)
        } else {
          // update player projectiles position
          playerProjectile.update();
        }
      })

    }
  })

  // update particle position and remove if it faded already
  particles.forEach((particle, particleIndex) => {
    if (particle.opacity === 0) {
      setTimeout(() => {
        particles.splice(particleIndex, 1)
      }, 0)
    } else {
      particle.update();
    }
  })

  // generate enemy 
  if (frames % 10 === 0) {
    enemies.push(new Enemy({
      position: {
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height
      },
      color: getRandomColor(),
      radius: (Math.random() * 10) + 20,
      velocity: {
        x: Math.round((Math.random() * -10) + 5),
        y: Math.round((Math.random() * -10) + 5)
      }
    }))
  }

  // spawn projectiles from random enemy
  if (enemySpawnGap % 1000 === 0) {
    enemies[Math.floor(Math.random() * enemies.length)].shoot();
    enemySpawnGap = 1;
  }

  if (score >= 1000) {
    game.over = true
    enemies.forEach(enemy => enemy.hide(particles))
    setTimeout(() => {
      game.active = false;
    }, 1000)
    showResult('you win')
  }

  frames++
  enemySpawnGap++
}

animate();

function mouseDownFn({ clientX, clientY, preventDefault }) {
  if (game.over) return
  player.shoot({ x: clientX - left, y: clientY - top })
}

function updateScore(increment = 100) {
  score += increment;
  scoreEl.innerHTML = score.toString();
}

function showResult(text) {
  resultEl.innerHTML = text
  resultEl.classList.remove('hide')
}

addEventListener('mousedown', mouseDownFn);