// game.js — Function Machine Game Logic

// ─── Configuration ──────────────────────────────────────
const CONFIG = {
  TOTAL_QUESTIONS : 10,
  TIME_PER_GAME   : 60,   // seconds
  POINTS_CORRECT  : 10,
  STORAGE_KEY     : 'functionMachineHighScore',
};

// ─── Function Definitions ────────────────────────────────
// Each entry: { label, fn }
// label = display string, fn = function applied to input
const FUNCTIONS = [
  { label: '2x + 3',    fn: x => 2 * x + 3 },
  { label: 'x² - 1',   fn: x => x * x - 1 },
  { label: '3x - 5',   fn: x => 3 * x - 5 },
  { label: 'x + 10',   fn: x => x + 10 },
  { label: '4x',       fn: x => 4 * x },
  { label: 'x² + x',  fn: x => x * x + x },
  { label: '5x - 2',   fn: x => 5 * x - 2 },
  { label: '2x² + 1',  fn: x => 2 * x * x + 1 },
  { label: 'x + x²',  fn: x => x + x * x },
  { label: '10 - x',   fn: x => 10 - x },
  { label: 'x/2 + 4',  fn: x => x / 2 + 4 },
  { label: '3x + 3x',  fn: x => 6 * x },
];

// ─── State ───────────────────────────────────────────────
let state = {
  score       : 0,
  timeLeft    : CONFIG.TIME_PER_GAME,
  qNum        : 0,
  currentFunc : null,
  currentInput: null,
  correctAnswer: null,
  timerInterval: null,
  isRunning   : false,
};

// ─── DOM refs ────────────────────────────────────────────
const scoreDisplay   = document.getElementById('scoreDisplay');
const timerDisplay   = document.getElementById('timerDisplay');
const timerChip      = document.querySelector('.timer-chip');
const funcRuleEl     = document.getElementById('funcRule');
const inputValueEl   = document.getElementById('inputValueLabel');
const outputValueEl  = document.getElementById('outputValueLabel');
const answerInput    = document.getElementById('answerInput');
const feedbackMsg    = document.getElementById('feedbackMsg');
const qNumEl         = document.getElementById('qNum');
const qTotalEl       = document.getElementById('qTotal');
const machineBody    = document.getElementById('machineBody');
const gameOverlay    = document.getElementById('gameOverlay');
const overlayScore   = document.getElementById('overlayScore');
const overlayHsLabel = document.getElementById('overlayHsLabel');
const overlayTitle   = document.getElementById('overlayTitle');
const machineCard    = document.getElementById('machineCard');

// ─── Initialise ──────────────────────────────────────────
window.addEventListener('DOMContentLoaded', () => {
  qTotalEl.textContent = CONFIG.TOTAL_QUESTIONS;
  fadeIn();
  newQuestion();
  startTimer();
});

function fadeIn() {
  document.body.style.opacity = '0';
  document.body.style.transition = 'opacity 0.4s ease';
  requestAnimationFrame(() => {
    requestAnimationFrame(() => {
      document.body.style.opacity = '1';
    });
  });
}

// ─── Timer ───────────────────────────────────────────────
function startTimer() {
  state.isRunning = true;
  state.timerInterval = setInterval(() => {
    state.timeLeft--;
    timerDisplay.textContent = state.timeLeft;

    if (state.timeLeft <= 10) {
      timerChip.classList.add('urgent');
    }

    if (state.timeLeft <= 0) {
      endGame();
    }
  }, 1000);
}

function stopTimer() {
  clearInterval(state.timerInterval);
  state.isRunning = false;
}

// ─── Question Logic ───────────────────────────────────────
function newQuestion() {
  // Pick a random function
  state.currentFunc  = FUNCTIONS[Math.floor(Math.random() * FUNCTIONS.length)];
  // Pick a random input between -10 and 10
  state.currentInput = Math.floor(Math.random() * 21) - 10;
  state.correctAnswer = state.currentFunc.fn(state.currentInput);

  // Update UI
  funcRuleEl.textContent       = state.currentFunc.label;
  inputValueEl.textContent     = state.currentInput;
  outputValueEl.textContent    = '?';
  answerInput.value            = '';
  answerInput.className        = 'answer-input';
  feedbackMsg.textContent      = '';
  feedbackMsg.className        = 'feedback-msg';

  // Animate machine in
  machineCard.classList.remove('machine-enter', 'machine-exit');
  void machineCard.offsetWidth; // force reflow
  machineCard.classList.add('machine-enter');

  // Increment counter display
  state.qNum++;
  if (state.qNum <= CONFIG.TOTAL_QUESTIONS) {
    qNumEl.textContent = state.qNum;
  }

  answerInput.focus();
}

// ─── Submit ──────────────────────────────────────────────
function submitAnswer() {
  if (!state.isRunning) return;

  const raw = answerInput.value.trim();
  if (raw === '') return;

  const userAnswer = parseFloat(raw);
  const correct    = Math.abs(userAnswer - state.correctAnswer) < 0.001;

  if (correct) {
    handleCorrect();
  } else {
    handleWrong();
  }
}

function handleCorrect() {
  state.score += CONFIG.POINTS_CORRECT;
  scoreDisplay.textContent = state.score;
  scoreDisplay.classList.add('pop');
  setTimeout(() => scoreDisplay.classList.remove('pop'), 300);

  answerInput.classList.add('correct');
  feedbackMsg.textContent = '✓ Correct! +' + CONFIG.POINTS_CORRECT + ' pts';
  feedbackMsg.className   = 'feedback-msg correct';
  outputValueEl.textContent = state.correctAnswer;

  setTimeout(() => {
    if (state.isRunning) nextOrEnd();
  }, 700);
}

function handleWrong() {
  answerInput.classList.add('wrong');
  answerInput.classList.add('shake');
  feedbackMsg.textContent = '✗ Wrong! Try another question.';
  feedbackMsg.className   = 'feedback-msg wrong';
  outputValueEl.textContent = '?';

  setTimeout(() => {
    answerInput.classList.remove('shake');
  }, 400);

  // Wrong answers don't score — auto move after short delay
  setTimeout(() => {
    if (state.isRunning) nextOrEnd();
  }, 900);
}

function nextOrEnd() {
  if (state.qNum >= CONFIG.TOTAL_QUESTIONS) {
    endGame();
  } else {
    newQuestion();
  }
}

// ─── End Game ────────────────────────────────────────────
function endGame() {
  stopTimer();
  state.isRunning = false;

  // Save highscore
  const prevHS = parseInt(localStorage.getItem(CONFIG.STORAGE_KEY)) || 0;
  const isNew  = state.score > prevHS;
  if (isNew) {
    localStorage.setItem(CONFIG.STORAGE_KEY, state.score);
  }

  const hs = Math.max(state.score, prevHS);

  // Populate overlay
  overlayScore.textContent   = state.score;
  overlayHsLabel.textContent = 'High Score: ' + hs;
  overlayTitle.textContent   = isNew ? '🎉 New Record!' : "Time's Up!";

  // Show overlay
  gameOverlay.classList.add('active');
}

// ─── Restart ─────────────────────────────────────────────
function restartGame() {
  gameOverlay.classList.remove('active');
  state.score    = 0;
  state.timeLeft = CONFIG.TIME_PER_GAME;
  state.qNum     = 0;

  scoreDisplay.textContent = 0;
  timerDisplay.textContent = CONFIG.TIME_PER_GAME;
  timerChip.classList.remove('urgent');

  newQuestion();
  startTimer();
}

// ─── Back to Menu ────────────────────────────────────────
function goBack() {
  document.body.style.transition = 'opacity 0.3s ease';
  document.body.style.opacity    = '0';
  setTimeout(() => {
    window.location.href = '../index.html';
  }, 300);
}

// ─── Keyboard: Enter to submit ───────────────────────────
document.addEventListener('keydown', (e) => {
  if (e.key === 'Enter' && state.isRunning) {
    submitAnswer();
  }
});