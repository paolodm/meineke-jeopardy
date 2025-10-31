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

// --- NEW: Question Modal Elements ---
const questionModal = document.getElementById('question-modal');
const questionModalCategory = document.getElementById('question-modal-category');
const questionModalValue = document.getElementById('question-modal-value');
const questionModalText = document.getElementById('question-modal-text');
const questionModalAnswer = document.getElementById('question-modal-answer');
const questionModalAnswerText = document.getElementById('question-modal-answer-text');
const questionModalTeams = document.getElementById('question-modal-teams');
const closeQuestionModalBtn = document.getElementById('close-question-modal');
const revealAnswerBtn = document.getElementById('reveal-answer-btn');
const questionTimerDisplay = document.getElementById('question-timer-display'); // Get timer display element

// --- Game State ---
let teams = 3;
let scores = [];
let teamNames = [];
let boardData = []; 
let boardState = []; 
let questionAttemptState = []; // Tracks teams who missed specific questions
let audioMuted = true;
let finalJeopardyData = { 
    question: "What is the most important part of customer service?",
    answer: "The customer!",
    wagers: [],
    outcomes: [] 
};
let currentModalQuestion = { // To store context for the active question modal
    catIndex: null, qIndex: null, value: 0, answer: '', tileElement: null
};

// --- Timer State ---
let questionTimerId = null;
let questionTimerIntervalId = null;
let questionCloseTimerId = null; // Timer for the 5-second delay before closing

// --- New Questions Data Structure --- 
const newQuestionsData = {
  "Meineke Services": [
    [
      "This is the routine service Meineke offers to keep your engine lubricated and running smoothly.",
      "What is an oil change?"
    ],
    [
      "If your car squeals when stopping, Meineke can inspect and replace these essential safety components.",
      "What are brake pads?"
    ],
    [
      "Meineke provides this service to ensure your wheels are properly angled for even tire wear and straight driving.",
      "What is a wheel alignment?"
    ],
    [
      "Meineke technicians can diagnose and repair this system that keeps you cool in summer and defrosts your windows in winter.",
      "What is the air conditioning (A/C) system?"
    ],
    [
      "Meineke’s signature service package combines inspections and maintenance across multiple systems, including fluids, filters, and tire pressure, to keep your vehicle running efficiently.",
      "What is the Meineke Total Car Care Inspection?"
    ]
  ],
  "Car Care Know-How": [
    [
      "This dashboard light, shaped like a little oil can, means it’s time to check this crucial fluid level.",
      "What is the engine oil?"
    ],
    [
      "You should rotate these every 5,000 to 7,500 miles to promote even wear and extend their life.",
      "What are tires?"
    ],
    [
      "To prevent your car from overheating, regularly check this liquid that circulates through the radiator.",
      "What is coolant (or antifreeze)?"
    ],
    [
      "When your steering wheel vibrates at high speeds, it might be time to have these balanced.",
      "What are the tires (or wheels)?"
    ],
    [
      "This system uses belts, pulleys, and tensioners to synchronize the crankshaft and camshaft—if it fails, major engine damage can occur.",
      "What is the timing belt (or timing chain) system?"
    ]
  ],
  "Auto Parts & Tariffs": [
    [
      "This part, found under the hood, starts your car’s engine with a spark of electrical energy.",
      "What is the battery?"
    ],
    [
      "These components, filled with air and rubber, are often imported and can be affected by trade tariffs on foreign-made products.",
      "What are tires?"
    ],
    [
      "The metal duties known as tariffs are placed on imported goods — like brake rotors or exhaust systems — to protect this type of domestic industry.",
      "What is the automotive manufacturing industry?"
    ],
    [
      "A trade tariff raising prices on imported catalytic converters might increase repair costs for this part of your vehicle, which controls emissions.",
      "What is the exhaust system?"
    ],
    [
      "When tariffs increase the cost of imported steel and aluminum, it directly impacts the price of this large, protective car component that forms the vehicle’s outer structure.",
      "What is the car body (or chassis)?"
    ]
  ],
  "Auto Industry Economics": [
    [
      "When carmakers produce more vehicles than people want to buy, this basic economic condition occurs.",
      "What is a surplus?"
    ],
    [
      "This American automaker, founded by Henry Ford, revolutionized car production with the moving assembly line.",
      "What is Ford Motor Company?"
    ],
    [
      "When demand for electric vehicles rises, the price of this critical battery metal—also used in phones—often increases.",
      "What is lithium?"
    ],
    [
      "The term for when a single company dominates the car market and controls prices—something modern antitrust laws aim to prevent.",
      "What is a monopoly?"
    ],
    [
      "This economic theory explains how automakers achieve lower per-unit costs as they produce more vehicles through efficiency and specialization.",
      "What are economies of scale?"
    ]
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
        value: (index + 1) * 200 // Assign value based on index (200, 400, ...)
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
  if (!boardData.length) {
    board.style.removeProperty('grid-template-columns');
    return;
  }

  board.style.gridTemplateColumns = `repeat(${boardData.length}, 1fr)`;

  boardState = boardData.map(category => category.questions.map(() => false));
  questionAttemptState = boardData.map(category =>
    category.questions.map(() => new Set())
  );

  for (let c = 0; c < boardData.length; c++) {
    const catTile = document.createElement('div');
    catTile.className = 'tile category';
    catTile.textContent = boardData[c]?.category || `Category ${c+1}`;
    board.appendChild(catTile);
  }

  for (let r = 0; r < 5; r++) {
    for (let c = 0; c < boardData.length; c++) {
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
      tile.setAttribute('data-cat', c); // Add data-cat attribute
      tile.setAttribute('data-q', r); // Add data-q attribute

      board.appendChild(tile);
    }
  }
  finalDrawer.classList.remove('drawer-open');

  // Add event listeners AFTER board HTML is set
  board.querySelectorAll('.tile').forEach(tile => {
    if (tile.classList.contains('category')) {
      return;
    }
    tile.addEventListener('click', handleTileClick);
    // Add keydown listener for accessibility if needed
    // tile.addEventListener('keydown', handleTileKeydown);
  });
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
  const tile = event.currentTarget;
  if (tile.classList.contains('answered') || tile.classList.contains('category-header')) return;

  const catIndex = parseInt(tile.dataset.cat);
  const qIndex = parseInt(tile.dataset.q);

  // Check if indices are valid *before* accessing deeply
  if (catIndex === undefined || qIndex === undefined || isNaN(catIndex) || isNaN(qIndex) || catIndex < 0 || catIndex >= boardData.length || !boardData[catIndex]) {
      console.error("Invalid indices or boardData structure in handleTileClick:", { catIndex, qIndex, boardData }); // Keep error log
      // Optionally check qIndex bounds if catIndex is valid:
      // if (boardData[catIndex] && (qIndex < 0 || qIndex >= boardData[catIndex].questions.length)) {
      //    console.error("Invalid qIndex:", { catIndex, qIndex, categoryQuestions: boardData[catIndex].questions });
      // }
      return; // Stop execution if indices are bad
  }

  const questionData = boardData[catIndex].questions[qIndex];

  // Instead of revealing on tile, open the modal
  openQuestionModal(catIndex, qIndex, questionData, tile);
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

// --- NEW: Question Modal Logic ---
function clearTimers() {
  if (questionTimerId) {
    clearTimeout(questionTimerId);
    questionTimerId = null;
  }
  if (questionTimerIntervalId) {
    clearInterval(questionTimerIntervalId);
    questionTimerIntervalId = null;
  }
  if (questionCloseTimerId) {
    clearTimeout(questionCloseTimerId);
    questionCloseTimerId = null;
  }
  questionTimerDisplay.textContent = ''; // Clear display
  questionTimerDisplay.style.display = 'none'; // Hide display
}

function startCloseTimer() {
  clearTimers(); // Clear any existing timers first
  questionCloseTimerId = setTimeout(() => {
    closeQuestionModal();
  }, 5000); // 5 seconds delay
}

function openQuestionModal(catIndex, qIndex, questionData, tileElement) {
  console.log(`Opening modal for [${catIndex}, ${qIndex}]`); // Keep console log
  clearTimers(); // Ensure no previous timers are running

  currentModalQuestion = { // Store context
    catIndex,
    qIndex,
    value: questionData.value,
    answer: questionData.a,
    tileElement
  };

  // --- Initialize Question Attempt State for this question if needed ---
  if (!questionAttemptState[catIndex]) {
    questionAttemptState[catIndex] = [];
  }
  if (!questionAttemptState[catIndex][qIndex]) {
    // Use a Set to store team indices that answered incorrectly
    questionAttemptState[catIndex][qIndex] = new Set(); 
    console.log(`Initialized attempt state for [${catIndex}, ${qIndex}]`);
  }
  // --- End Initialization ---

  // Populate modal
  questionModalCategory.textContent = boardData[catIndex].category;
  questionModalValue.textContent = `$${questionData.value}`;
  // FIX: Use correct property for question text
  questionModalText.textContent = questionData.q || questionData.question;
  questionModalAnswer.style.display = 'none'; // Ensure answer is hidden initially
  revealAnswerBtn.style.display = 'inline-flex'; // Show the reveal button
  questionModalTeams.style.display = 'flex'; // Ensure team buttons container is visible
  questionModalTeams.innerHTML = ''; // Clear previous team buttons

  // Create buttons for teams that HAVEN'T answered this question incorrectly yet
  const missedTeams = questionAttemptState[catIndex][qIndex] || new Set();
  console.log(`Teams that missed [${catIndex}, ${qIndex}]:`, missedTeams);
  for (let i = 0; i < teams; i++) {
    const teamDiv = document.createElement('div');
    teamDiv.classList.add('team-answer-controls');
    const isLockedOut = missedTeams.has(i);
    const disabledAttr = isLockedOut ? 'disabled' : ''; // Add disabled attribute if team missed

    teamDiv.innerHTML = `
      <span>${teamNames[i] || `Team ${i + 1}`}</span>
      <button class="correct-btn" data-team="${i}" data-outcome="correct" ${disabledAttr}>✅ Correct</button>
      <button class="incorrect-btn" data-team="${i}" data-outcome="incorrect" ${disabledAttr}>❌ Incorrect</button>
    `;

    if (isLockedOut) {
      teamDiv.classList.add('locked-out');
    }

    // Add event listeners only to non-disabled buttons
    if (!isLockedOut) {
        teamDiv.querySelector('.correct-btn').addEventListener('click', handleQuestionOutcome);
        teamDiv.querySelector('.incorrect-btn').addEventListener('click', handleQuestionOutcome);
    }

    questionModalTeams.appendChild(teamDiv);
  }

  // Set answer text *after* team buttons are potentially manipulated
  console.log('openQuestionModal questionData:', questionData); // DEBUG: Log question data
  console.log(`Setting answer text in openQuestionModal: '${questionData.a}'`); // Log answer data here
  questionModalAnswerText.textContent = questionData.a;

  questionModal.style.display = 'flex'; // Show the modal

  // Start the 30-second timer
  let timeLeft = 30;
  questionTimerDisplay.textContent = `Time Left: ${timeLeft}s`;
  questionTimerDisplay.style.display = 'block'; // Show timer

  questionTimerIntervalId = setInterval(() => {
    timeLeft--;
    questionTimerDisplay.textContent = `Time Left: ${timeLeft}s`;
    if (timeLeft <= 0) {
       clearInterval(questionTimerIntervalId);
       // Timer already handled by setTimeout below
    }
  }, 1000);

  questionTimerId = setTimeout(() => {
    console.log(`Timer ran out for [${catIndex}, ${qIndex}]`);
    handleTimerEnd();
  }, 30000); // 30 seconds
}

function closeQuestionModal() {
  console.log("Closing question modal");
  clearTimers(); // Crucial: Clear ALL timers when modal is closed
  questionModal.style.display = 'none';
  // Reset modal content if needed, or leave it for debugging
  questionModalText.textContent = '';
  questionModalTeams.innerHTML = ''; 
  currentModalQuestion = { catIndex: null, qIndex: null, value: 0, answer: '', tileElement: null }; // Clear context
}

function revealModalAnswer() {
  console.log('Reveal button clicked'); // DEBUG: Reveal button was clicked
  console.log("Revealing modal answer");
  // --- Add logging ---
  const answerP = document.getElementById('question-modal-answer');
  const answerSpan = document.getElementById('question-modal-answer-text');
  console.log("Answer <p> current display:", window.getComputedStyle(answerP).display);
  console.log("Answer <span> current textContent:", answerSpan.textContent);
  // --- End logging ---
  questionModalAnswer.style.display = 'flex'; // Show the answer section (the <p> tag)
  revealAnswerBtn.style.display = 'none'; // Hide the reveal button itself
  questionModalTeams.style.display = 'none'; // Hide team buttons when answer is shown
}

function handleTimerEnd() {
    clearTimers(); // Stop the countdown interval
    console.log("Timer ended. Revealing answer and closing soon.");
    questionTimerDisplay.textContent = "Time's Up!";
    revealModalAnswer();
    // Mark tile as unanswered/timed out (using existing 'incorrect' logic for now)
    // Check if tileElement exists before marking
    if (currentModalQuestion.tileElement) {
        markTileAnswered(currentModalQuestion.tileElement, false); // Mark as incorrect visually
    }
    // Set 5-second timer to close the modal
    startCloseTimer();
}

// Event handler for Correct/Incorrect buttons in the modal
function handleQuestionOutcome(event) {
  clearTimers(); // Stop the main timer and interval as soon as an answer is given

  const button = event.target;
  const teamIndex = parseInt(button.dataset.team, 10);
  const outcome = button.dataset.outcome;
  const value = currentModalQuestion.value;
  const { catIndex, qIndex, tileElement } = currentModalQuestion; // Get context

  console.log(`Handling outcome for Team ${teamIndex}: ${outcome}`); // Keep log

  let delta = 0;
  if (outcome === 'correct') {
    delta = value;
    revealModalAnswer(); // Reveal answer immediately
    markTileAnswered(tileElement, true); // Mark tile as answered correctly

    // Optional: Clear attempt state for this now-answered question
    if (questionAttemptState[catIndex]?.[qIndex]) {
      questionAttemptState[catIndex][qIndex].clear(); // No more attempts needed
    }
    updateScore(teamIndex, delta, tileElement, true); // Update score
    startCloseTimer(); // Start 5-second timer to close modal

  } else { // Incorrect outcome
    delta = -value;
    // Record that this team missed this specific question
    if (questionAttemptState[catIndex]?.[qIndex]) {
      questionAttemptState[catIndex][qIndex].add(teamIndex);
      console.log(`Team ${teamIndex} missed [${catIndex}, ${qIndex}]. Current misses:`, questionAttemptState[catIndex][qIndex]);

      // Update score immediately for the incorrect answer
      updateScore(teamIndex, delta, tileElement, false);

      // Check if ALL teams have now missed this question
      if (questionAttemptState[catIndex][qIndex].size === teams) {
        console.log(`All teams missed [${catIndex}, ${qIndex}]. Revealing answer, closing soon.`);
        revealModalAnswer(); // Reveal answer as all teams missed
        markTileAnswered(tileElement, false); // Mark tile as incorrect (all missed)
        startCloseTimer(); // Start 5-second timer to close modal
      } else {
        // Not all teams have missed yet. Disable buttons instead of hiding parent.
        const correctButton = button.parentElement.querySelector('.correct-btn');
        const incorrectButton = button.parentElement.querySelector('.incorrect-btn');
        if (correctButton) correctButton.disabled = true;
        if (incorrectButton) incorrectButton.disabled = true;
        button.parentElement.classList.add('locked-out');
        console.log(`Team ${teamIndex} missed, buttons disabled. Others can still answer.`);
        // DO NOT close modal here, let timer run or other teams answer.
      }
    } else {
      console.error(`Could not record incorrect attempt for [${catIndex}, ${qIndex}] team ${teamIndex}`); // Keep error log
      // Still update score even if state recording failed
      updateScore(teamIndex, delta, tileElement, false);
      // Don't close modal here either, likely an edge case
    }
  }
}

// --- Utility Functions ---
function markTileAnswered(tileElement, gotCorrect) {
  if (!tileElement || tileElement.classList.contains('answered')) return; // Prevent double marking

  tileElement.classList.add('answered');
  // Ensure currentModalQuestion has valid indices before updating state
  if (currentModalQuestion.catIndex !== null && currentModalQuestion.qIndex !== null) {
    // Check if boardState[catIndex] exists before trying to access index qIndex
    if (boardState[currentModalQuestion.catIndex]) {
      boardState[currentModalQuestion.catIndex][currentModalQuestion.qIndex] = true; // Update state
    } else {
      console.error(`Attempted to mark tile in invalid category index: ${currentModalQuestion.catIndex}`);
    }
  }

  if (gotCorrect) {
    tileElement.innerHTML = '✅'; // Simpler feedback
    tileElement.classList.add('answered-correctly-tile'); // Add specific class for correct
  } else {
    tileElement.innerHTML = '❌'; // Simpler feedback
    tileElement.classList.add('answered-incorrectly-tile'); // Add specific class for incorrect
  }
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

  closeQuestionModalBtn.addEventListener('click', closeQuestionModal); // Listener for new modal's close button
  revealAnswerBtn.addEventListener('click', () => {
      console.log("Manual reveal clicked");
      clearTimers(); // Stop countdown
      revealModalAnswer();
      startCloseTimer(); // Start 5s close timer on manual reveal too
  }); 
};
