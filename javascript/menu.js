// menu.js — Main Menu Logic

document.addEventListener('DOMContentLoaded', () => {
  loadHighScore();
});

function loadHighScore() {
  const hs = localStorage.getItem('functionMachineHighScore') || 0;
  const display = document.getElementById('highscoreDisplay');
  if (display) {
    display.textContent = hs;
    if (parseInt(hs) > 0) {
      display.classList.add('pop');
    }
  }
}

function startGame() {
  // Animate the play button before transitioning
  const btn = document.getElementById('playBtn');
  btn.classList.add('pop');
  btn.disabled = true;

  // Fade out, then navigate
  document.body.style.transition = 'opacity 0.35s ease';
  document.body.style.opacity = '0';

  setTimeout(() => {
    window.location.href = 'game/game.html';
  }, 350);
}