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
let prevPos = 'left';


function getRandomColor() {
  var r = Math.random() * 255 >> 0;
  var g = Math.random() * 255 >> 0;
  var b = Math.random() * 255 >> 0;
  return "rgba(" + r + ", " + g + ", " + b + ", 0.5)";
}

// player
class Player {
  constructor() {
    this.color = white
    this.radius = 10
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
    ctx.fillStyle = this.color;
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
    this.radius = radius || 6;
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
  constructor({ position, color, radius }) {
    this.radius = radius;
    this.color = color || white;
    this.position = {
      x: position.x,
      y: position.y
    }
    this.target = {
      x: player.position.x,
      y: player.position.y
    }
    this.velocity = {
      x: (this.position.x - this.target.x) / 500 * -1,
      y: (this.position.y - this.target.y) / 500 * -1
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

const friction = 0.99
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
    this.velocity.x *= friction
    this.velocity.y *= friction
    this.position.x += this.velocity.x;
    this.position.y += this.velocity.y;
    this.opacity -= 0.01
  }
}

// entities
const player = new Player();
const enemies = [];
const particles = [];
let frames = 0;

function animate() {
  if (!game.active) return;
  requestAnimationFrame(animate);
  ctx.fillStyle = 'rgba(0, 0, 0, 0.1)'
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  player.draw();

  // update enemy position and remove if it is out of canvas already
  enemies.forEach((enemy, enemyIndex) => {

    // update enemy projectiles position and remove if it faded already
    if (enemy.position.x + enemy.radius >= player.position.x + player.radius &&
      enemy.position.x - enemy.radius <= player.position.x - player.radius &&
      enemy.position.y + enemy.radius >= player.position.y + player.radius &&
      enemy.position.y - enemy.radius <= player.position.y - player.radius) {
      showResult('you lose')
      game.over = true
      if (player.opacity > 0) player.hide(particles);
      setTimeout(() => {
        game.active = false;
      }, 3000)
    } else {
      enemy.update();
    }

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


  })

  // update particle position and remove if it faded already
  particles.forEach((particle, particleIndex) => {
    if (particle.opacity <= 0) {
      setTimeout(() => {
        particles.splice(particleIndex, 1)
      }, 0)
    } else {
      particle.update();
    }
  })

  // generate enemy 
  if (frames % 30 === 0) {
    spwanEnimies()
  }

  if (score >= 1000) {
    game.over = true
    enemies.forEach((enemy, index) => {
      enemy.hide(particles)
      enemies.splice(index, 1)
    })
    setTimeout(() => {
      game.active = false;
    }, 1000)
    showResult('you win')
  }

  frames++
}

animate();

function getRandomPos(radius) {
  let random = Math.random(), posX, posY, pos;
  if (random <= 0.25) {
    posX = 0 - radius
    posY = Math.random() * canvas.height - radius
    pos = "top"
  } else if (random >= 0.26 && random <= 0.5) {
    posX = Math.random() * canvas.width - radius
    posY = 0 - radius
    pos = "left"
  } else if (random >= 0.51 && random <= 0.75) {
    posX = canvas.width + radius
    posY = Math.random() * canvas.height - radius
    pos = "right"
  } else {
    posX = Math.random() * canvas.width - radius
    posY = canvas.height + radius
    pos = "bottom"
  }
  if (prevPos === pos) {
    return getRandomPos(radius)
  }
  prevPos = pos
  return { x: posX, y: posY }
}


function spwanEnimies() {
  let radius = Math.floor(Math.random() * 30) + 10
  const { x, y } = getRandomPos(radius)
  enemies.push(new Enemy({
    position: {
      x, y
    },
    color: getRandomColor(),
    radius: radius
  }))
}

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