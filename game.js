// Meineke Jeopardy Game Logic

// --- DOM Elements ---
const scoreboard = document.getElementById('scoreboard');
const board = document.getElementById('board');
const teamModal = document.getElementById('team-modal');
const teamInput = document.getElementById('team-count');
const startBtn = document.getElementById('start-game');
const resetBtn = document.getElementById('reset-btn');
const audioToggle = document.getElementById('audio-toggle');
const themeAudio = document.getElementById('theme-audio');
const finalBtn = document.getElementById('final-btn');
const finalSection = document.getElementById('final-jeopardy'); 
const finalDrawer = document.getElementById('final-jeopardy-drawer'); 
const closeFinalBtn = document.getElementById('close-final-btn'); 

// --- Game State ---
let teams = 3;
let scores = [];
let teamNames = [];
let boardData = []; 
let boardState = []; 
let audioMuted = true;
let finalJeopardyData = { 
    question: "What is the most important part of customer service?",
    answer: "The customer!",
    wagers: [],
    outcomes: [] 
};

// --- New Questions Data Structure --- 
const newQuestionsData = {
  "Meineke Services": [
    ["This service keeps your brakes functioning safely.", "What is a brake service?"],
    ["Recommended every 3,000–5,000 miles for engine health.", "What is an oil change?"],
    ["We inspect tread depth and rotate these for safety.", "What are tires?"],
    ["This service uses diagnostic tools to identify issues.", "What is a diagnostic check?"],
    ["This keeps your car's A/C system running cool.", "What is AC repair?"]
  ],
  "Car Care Know-How": [
    ["You should change this fluid more often than most others.", "What is engine oil?"],
    ["This light means your engine needs attention.", "What is the check engine light?"],
    ["Worn out brake pads can cause this grinding part to wear.", "What is the rotor?"],
    ["This belt is critical for engine timing.", "What is the timing belt?"],
    ["Rotating your tires helps extend this.", "What is tire life?"]
  ],
  "Auto Parts & Tariffs": [
    ["This term refers to a tax placed on imported goods like car parts.", "What is a tariff?"],
    ["Because of inventory shortages, this European automaker has paused new car sales in the U.S.", "What is Land Rover (or Audi/Volkswagen)?"],
    ["This Japanese automaker has held steady on prices while others raise theirs.", "What is Toyota?"],
    ["This is the current length of the pause on new auto tariffs in the U.S.", "What is 30 days?"],
    ["Tariffs and shipping issues have made it harder to get parts from this continent.", "What is Europe?"]
  ],
  "AC-tion Time!": [
    ["A must-have gas for a functioning car A/C.", "What is refrigerant (like R-134a)?"],
    ["A broken compressor means your A/C won’t do this.", "What is cool the air?"],
    ["This filter can affect your A/C airflow.", "What is the cabin air filter?"],
    ["A leak in this part often causes weak cooling.", "What is the condenser?"],
    ["This tool checks A/C pressure and refrigerant levels.", "What is a manifold gauge set?"]
  ],
  "Behind the Shop Doors": [
    ["This shop is located in Sterling, VA.", "What is Meineke #2701?"],
    ["This scanner helps diagnose engine and emissions issues.", "What is an OBD-II scanner?"],
    ["Customers appreciate this quality most in our team.", "What is honesty or customer service?"],
    ["We recommend this before long road trips.", "What is a maintenance check?"],
    ["This is the most common issue we fix during summer.", "What is A/C not blowing cold air?"]
  ]
};

// --- Initialization & Setup ---

function loadQuestions() {
  boardData = []; // Reset board data before transformation
  // Transform the new question structure
  for (const category in newQuestionsData) {
    const categoryQuestions = [];
    newQuestionsData[category].forEach((pair, index) => {
      categoryQuestions.push({
        q: pair[0],
        a: pair[1],
        value: (index + 1) * 100 // Assign value based on index (100, 200, ...)
      });
    });
    boardData.push({ category: category, questions: categoryQuestions });
  }
}

function showTeamModal() {
  teamModal.style.display = 'flex';
}

function hideTeamModal() {
  teamModal.style.display = 'none';
}

function setupTeams(numTeams) {
  teams = numTeams;
  scores = Array(teams).fill(0);
  teamNames = Array(teams).fill(0).map((_, i) => `Team ${i+1}`);
  finalJeopardyData.wagers = Array(teams).fill(0);
  finalJeopardyData.outcomes = Array(teams).fill('pending'); 
  renderScoreboard();
}

function renderScoreboard() {
  scoreboard.innerHTML = '';
  for (let i = 0; i < teams; i++) {
    const div = document.createElement('div');
    div.className = 'team-score';

    const nameSpan = document.createElement('span');
    nameSpan.className = 'team-name';
    nameSpan.textContent = teamNames[i];
    nameSpan.contentEditable = true;
    nameSpan.spellcheck = false;
    nameSpan.setAttribute('data-team-index', i);
    nameSpan.setAttribute('aria-label', `Edit name for ${teamNames[i]}`);
    nameSpan.addEventListener('blur', handleNameEdit);
    nameSpan.addEventListener('keydown', handleNameEditKey);

    const scoreSpan = document.createElement('span');
    scoreSpan.id = `score-${i}`;
    scoreSpan.textContent = scores[i];

    div.appendChild(nameSpan);
    div.appendChild(document.createTextNode(': ')); 
    div.appendChild(scoreSpan);

    scoreboard.appendChild(div);
  }
}

function setupBoard() {
  board.innerHTML = '';
  loadQuestions(); 
  boardState = Array(5).fill().map(() => Array(5).fill('hidden'));

  for (let c = 0; c < 5; c++) {
    const catTile = document.createElement('div');
    catTile.className = 'tile category';
    catTile.textContent = boardData[c]?.category || `Category ${c+1}`;
    board.appendChild(catTile);
  }

  for (let r = 0; r < 5; r++) {
    for (let c = 0; c < 5; c++) {
      const questionData = boardData[c]?.questions[r];
      if (!questionData) continue; 

      const tile = document.createElement('div');
      tile.className = 'tile';
      tile.id = `tile-${r}-${c}`;
      tile.textContent = `$${questionData.value}`;
      tile.tabIndex = 0; 
      tile.setAttribute('aria-label', `${boardData[c].category} for $${questionData.value}`);
      tile.setAttribute('data-row', r);
      tile.setAttribute('data-col', c);

      tile.addEventListener('click', handleTileClick);
      tile.addEventListener('keydown', handleTileKeydown);
      board.appendChild(tile);
    }
  }
  finalDrawer.classList.remove('drawer-open'); 
}

// --- Event Handlers ---

function handleNameEdit(event) {
  const nameSpan = event.target;
  const teamIndex = parseInt(nameSpan.getAttribute('data-team-index'), 10);
  const newName = nameSpan.textContent.trim();
  teamNames[teamIndex] = newName || `Team ${teamIndex + 1}`; 
  nameSpan.textContent = teamNames[teamIndex]; 
}

function handleNameEditKey(event) {
  if (event.key === 'Enter') {
    event.preventDefault(); 
    event.target.blur(); 
  }
}

function handleTileClick(event) {
  const tile = event.target;
  const r = parseInt(tile.getAttribute('data-row'), 10);
  const c = parseInt(tile.getAttribute('data-col'), 10);
  flipTile(r, c, tile);
}

function handleTileKeydown(event) {
  if (event.key === 'Enter' || event.key === ' ') {
    event.preventDefault();
    const tile = event.target;
    const r = parseInt(tile.getAttribute('data-row'), 10);
    const c = parseInt(tile.getAttribute('data-col'), 10);
    flipTile(r, c, tile);
  }
}

// --- Core Game Logic ---

function flipTile(r, c, tileElement) {
  if (boardState[r][c] !== 'hidden' && boardState[r][c] !== 'question') return; 

  const tile = tileElement || document.getElementById(`tile-${r}-${c}`); 
  const questionData = boardData[c].questions[r];

  if (boardState[r][c] === 'hidden') {
    tile.textContent = questionData.q;
    tile.classList.add('revealed');
    tile.setAttribute('aria-label', `Question: ${questionData.q}`);
    boardState[r][c] = 'question';
    playSfx('reveal');
  } else if (boardState[r][c] === 'question') {
    tile.innerHTML = ''; 
    tile.classList.remove('revealed');
    tile.classList.add('locked');
    boardState[r][c] = 'locked';
    tile.setAttribute('aria-label', `Answer: ${questionData.a}. Awaiting scoring.`);
    tile.tabIndex = -1; 

    const answerDiv = document.createElement('div');
    answerDiv.className = 'answer';
    answerDiv.textContent = questionData.a;
    tile.appendChild(answerDiv);

    for (let t = 0; t < teams; t++) {
      const btnWrap = document.createElement('div');
      btnWrap.className = 'team-answer-btns';

      const correctBtn = document.createElement('button');
      correctBtn.textContent = `✔ ${teamNames[t]}`;
      correctBtn.setAttribute('aria-label', `Mark correct for ${teamNames[t]}`);
      correctBtn.onclick = (e) => {
        e.stopPropagation(); 
        updateScore(t, questionData.value, tile, true);
      };

      const wrongBtn = document.createElement('button');
      wrongBtn.textContent = `✖ ${teamNames[t]}`;
      wrongBtn.setAttribute('aria-label', `Mark wrong for ${teamNames[t]}`);
      wrongBtn.onclick = (e) => {
        e.stopPropagation();
        updateScore(t, -questionData.value, tile, false);
      };

      btnWrap.appendChild(correctBtn);
      btnWrap.appendChild(wrongBtn);
      tile.appendChild(btnWrap);
    }
    playSfx('answer');
  }
}

function updateScore(teamIndex, delta, tileElement, isCorrect) {
  scores[teamIndex] += delta;
  document.getElementById(`score-${teamIndex}`).textContent = scores[teamIndex];

  const buttonWrappers = tileElement.querySelectorAll('.team-answer-btns');
  buttonWrappers.forEach(wrapper => wrapper.remove());

  const answerText = boardData[parseInt(tileElement.dataset.col)].questions[parseInt(tileElement.dataset.row)].a;
  tileElement.innerHTML = isCorrect ? '✅ Correct!' : '❌ Incorrect!';
  tileElement.setAttribute('aria-label', `Scored ${isCorrect ? 'correct' : 'incorrect'} for ${teamNames[teamIndex]}. Final answer was ${answerText}`);

  playSfx(isCorrect ? 'correct' : 'wrong');
}

function resetGame() {
  scores = Array(teams).fill(0);
  finalJeopardyData.wagers = Array(teams).fill(0);
  renderScoreboard(); 
  setupBoard(); 
  resetFinalJeopardy();
  console.log('Game reset!');
}

// --- Audio Logic ---

function toggleAudio() {
  audioMuted = !audioMuted;
  themeAudio.muted = audioMuted;
  audioToggle.textContent = audioMuted ? '🔇' : '🔊';
  if (!audioMuted) {
    themeAudio.play().catch(e => console.error("Audio play failed:", e));
  }
}

function playSfx(type) {
  if (audioMuted) return;
  console.log(`Playing SFX: ${type}`);
}

// --- Final Jeopardy Logic ---

function setupFinalWagers() {
  let wagerInputsHTML = '';
  for (let i = 0; i < teams; i++) {
    const maxWager = Math.max(0, scores[i]);
    wagerInputsHTML += `
      <div class="wager-input-group">
        <label for="wager-${i}">${teamNames[i]}: $ </label>
        <input type="number" id="wager-${i}" 
               min="0" 
               max="${maxWager}" 
               data-max-wager="${maxWager}" 
               data-team-index="${i}"
               oninput="validateWagerInput(this)">
        <span class="max-wager-info">(Max: $${maxWager})</span>
        <span id="wager-error-${i}" class="wager-error-message"></span>
      </div>`;
  }

  finalSection.innerHTML = `
    <h2>Final Jeopardy Wagers</h2>
    <form id="wager-form">
      ${wagerInputsHTML}
      <button type="submit">Lock In Wagers</button>
    </form>`;

  document.getElementById('wager-form').addEventListener('submit', handleWagerSubmit);
}

function validateWagerInput(inputElement) {
  const teamIndex = inputElement.dataset.teamIndex;
  const maxWager = parseInt(inputElement.dataset.maxWager, 10);
  const currentValue = parseInt(inputElement.value, 10);
  const errorSpan = document.getElementById(`wager-error-${teamIndex}`);

  if (isNaN(currentValue) || currentValue < 0) {
    errorSpan.textContent = 'Invalid wager.';
    inputElement.classList.add('invalid-wager');
  } else if (currentValue > maxWager) {
    errorSpan.textContent = `Cannot exceed $${maxWager}.`;
    inputElement.classList.add('invalid-wager');
  } else {
    errorSpan.textContent = ''; // Clear error
    inputElement.classList.remove('invalid-wager');
  }

  // Check all inputs and disable submit button if any are invalid
  const form = inputElement.closest('form');
  const submitButton = form.querySelector('button[type="submit"]');
  const allInputs = form.querySelectorAll('input[type="number"]');
  let formIsValid = true;
  allInputs.forEach(input => {
    if (input.classList.contains('invalid-wager') || input.value === '') { // Also check if empty
        formIsValid = false;
    }
  });
  submitButton.disabled = !formIsValid;
}

function handleWagerSubmit(event) {
  event.preventDefault();

  // Double-check validity on submit (though button should be disabled)
  const form = event.target;
  const invalidInputs = form.querySelectorAll('.invalid-wager');
  if (invalidInputs.length > 0) {
    console.warn("Submit blocked due to invalid wagers.");
    return; // Stop submission
  }

  console.log("Final Jeopardy: Locking in wagers."); 
  for (let i = 0; i < teams; i++) {
    const input = document.getElementById(`wager-${i}`);
    finalJeopardyData.wagers[i] = parseInt(input.value, 10) || 0;
    console.log(`  Team ${i} wager: ${finalJeopardyData.wagers[i]}`); 
    input.disabled = true; 
  }
  revealFinalQuestion();
}

function revealFinalQuestion() {
  finalSection.innerHTML = `
    <h2>Final Jeopardy Category: Service</h2> 
    <div id="final-question" style="margin: 1em 0; font-size: 1.2em;">${finalJeopardyData.question}</div>
    <button id="reveal-answer-btn">Reveal Answer</button>`;
  document.getElementById('reveal-answer-btn').onclick = revealFinalAnswer;
}

function revealFinalAnswer() {
  let scoringButtonsHTML = '';
  finalJeopardyData.outcomes = Array(teams).fill('pending'); 

  for (let i = 0; i < teams; i++) {
    scoringButtonsHTML += `
      <div style="margin-top: 0.5em;" class="final-score-team" data-team-index="${i}">
        ${teamNames[i]} (Wager: $${finalJeopardyData.wagers[i]}):
        <button class="fj-outcome-btn correct" onclick="registerFinalOutcome(${i}, 'correct', this)">Correct</button>
        <button class="fj-outcome-btn wrong" onclick="registerFinalOutcome(${i}, 'wrong', this)">Wrong</button>
      </div>`;
  }

  finalSection.innerHTML = `
    <h2>Final Jeopardy</h2>
    <div id="final-question">${finalJeopardyData.question}</div>
    <div id="final-answer" style="margin: 1em 0; font-size: 1.3em; font-weight: bold;">Answer: ${finalJeopardyData.answer}</div>
    <div id="final-scoring">
      ${scoringButtonsHTML}
    </div>
    <button id="submit-final-scores-btn" style="margin-top: 1.5em;">Submit Final Scores</button>`; 

  document.getElementById('submit-final-scores-btn').onclick = submitFinalScores; 
}

window.registerFinalOutcome = function(teamIndex, outcome, clickedButton) {
  finalJeopardyData.outcomes[teamIndex] = outcome;
  console.log(`Registered outcome for team ${teamIndex}: ${outcome}`); 

  const teamDiv = clickedButton.closest('.final-score-team');
  const buttons = teamDiv.querySelectorAll('.fj-outcome-btn');
  buttons.forEach(btn => btn.classList.remove('selected')); 
  clickedButton.classList.add('selected'); 

  playSfx(outcome === 'correct' ? 'correct' : 'wrong'); 
}

function submitFinalScores() {
  console.log("Submitting final scores...");
  let anyUpdates = false;

  // --- FIX: Re-add the loop to calculate score changes --- 
  for (let i = 0; i < teams; i++) {
    const outcome = finalJeopardyData.outcomes[i];
    const wager = finalJeopardyData.wagers[i];
    let delta = 0;

    if (outcome === 'correct') {
      delta = wager;
    } else if (outcome === 'wrong') {
      delta = -wager;
    }

    if (delta !== 0) {
      scores[i] += delta;
      console.log(`  Updating score for team ${i} (${teamNames[i]}): ${scores[i] - delta} + ${delta} = ${scores[i]}`);
      document.getElementById(`score-${i}`).textContent = scores[i];
      anyUpdates = true;
    }
  }
  // --- End Fix ---

  // Find winner(s) and build HTML
  let maxScore = -Infinity;
  let winners = [];
  if (anyUpdates) {
     scores.forEach(score => { // Find max score *after* updates
       if (score > maxScore) {
         maxScore = score;
       }
     });
  }

  // Only declare winners if max score is positive
  if (maxScore > 0) {
      scores.forEach((score, index) => {
          if (score === maxScore) {
              winners.push(teamNames[index]);
          }
      });
  }

  // Determine the heading text
  let resultsHeading = '<h3>Final Results</h3>';
  if (winners.length === 1) {
      resultsHeading = `<h3>Congratulations ${winners[0]}!</h3>`;
  } else if (winners.length > 1) {
      resultsHeading = `<h3>Congratulations to the Winners!</h3>`;
  }

  let finalScoresHTML = resultsHeading + '<ul>'; // Start building HTML with dynamic heading

  for (let i = 0; i < teams; i++) {
      const isWinner = winners.includes(teamNames[i]); // Check if current team is in the winners array
      const winnerClass = isWinner ? ' class="winner"' : '';
      finalScoresHTML += `<li${winnerClass}>${teamNames[i]}: $${scores[i]}</li>`;
  }
  finalScoresHTML += '</ul>'; // Close the list

  if (anyUpdates) {
      console.log("Final scores submitted.");
      // Disable all final jeopardy buttons and the submit button
      const finalButtons = finalSection.querySelectorAll('button');
      finalButtons.forEach(btn => btn.disabled = true);
      // Explicitly disable submit button too, though it should be caught above
      document.getElementById('submit-final-scores-btn').disabled = true;

      // Display final scores
      const resultsDiv = document.createElement('div');
      resultsDiv.id = 'final-results-display';
      resultsDiv.innerHTML = finalScoresHTML;
      finalSection.appendChild(resultsDiv);

      // Trigger Confetti!
      if (typeof confetti === 'function') {
          // School Pride effect!
          const end = Date.now() + (2 * 1000); // Run for 2 seconds
          const colors = ['#FFC107', '#ffffff', '#ff0000', '#000000']; // Meineke-ish colors

          (function frame() {
              confetti({
                  particleCount: 4, // Fewer particles per blast, but frequent
                  angle: 60,
                  spread: 55,
                  origin: { x: 0 },
                  colors: colors
              });
              confetti({
                  particleCount: 4,
                  angle: 120,
                  spread: 55,
                  origin: { x: 1 },
                  colors: colors
              });

              if (Date.now() < end) {
                  requestAnimationFrame(frame);
              }
          }());
      }

  } else {
      console.log("No outcomes selected to submit.");
      // Optionally provide feedback if no selections were made
      // alert("Please select 'Correct' or 'Wrong' for at least one team.");
  }
}

function resetFinalJeopardy() {
  finalSection.innerHTML = ''; 
  finalDrawer.classList.remove('drawer-open'); 
  finalJeopardyData.wagers = Array(teams).fill(0);
  finalJeopardyData.outcomes = Array(teams).fill('pending');
  console.log("Final Jeopardy section reset.");
}

// --- Initial Load ---
window.onload = () => {
  const urlParams = new URLSearchParams(window.location.search);
  const teamCountParam = parseInt(urlParams.get('teams'), 10);
  if (teamCountParam >= 1 && teamCountParam <= 7) {
    teamInput.value = teamCountParam;
  }

  showTeamModal();
  themeAudio.muted = audioMuted; 

  startBtn.addEventListener('click', () => {
    const numTeams = parseInt(teamInput.value, 10);
    if (numTeams >= 1 && numTeams <= 7) {
      hideTeamModal();
      setupTeams(numTeams);
      setupBoard();
      if (!audioMuted) { 
          themeAudio.play().catch(e => console.warn("Audio autoplay might be blocked."));
      }
    } else {
      alert('Please enter a number between 1 and 7.');
    }
  });

  resetBtn.addEventListener('click', resetGame);
  audioToggle.addEventListener('click', toggleAudio);

  finalBtn.addEventListener('click', () => {
    console.log("Toggle Final Jeopardy Drawer clicked.");
    const isOpen = finalDrawer.classList.toggle('drawer-open');
    if (isOpen && !finalSection.hasChildNodes()) { 
        console.log("Drawer opened, setting up Final Jeopardy wager inputs.");
        setupFinalWagers();
    }
  });

  closeFinalBtn.addEventListener('click', () => {
    console.log("Close Final Jeopardy Drawer clicked.");
    finalDrawer.classList.remove('drawer-open');
  });
};
