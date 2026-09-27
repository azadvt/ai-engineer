// ======================================
// APP STATE
// ======================================

let state = {
  mode: 'flashcard',       // flashcard | quiz | notes | random
  currentTopic: null,      // topic id
  currentCard: 0,
  flipped: false,
  ratings: {}              // { "3-1_0": "got-it", "3-1_1": "needs-review", ... }
};

// Load saved state
function loadState() {
  try {
    const saved = localStorage.getItem('ai-engineer-study');
    if (saved) {
      const parsed = JSON.parse(saved);
      state.ratings = parsed.ratings || {};
    }
  } catch(e) {}
}

function saveState() {
  localStorage.setItem('ai-engineer-study', JSON.stringify({ ratings: state.ratings }));
}

// ======================================
// RENDER SIDEBAR
// ======================================

function renderSidebar() {
  const nav = document.getElementById('sidebarNav');
  let currentPhase = 0;

  nav.innerHTML = MODULES.map(mod => {
    let phaseHeader = '';
    if (mod.phase !== currentPhase) {
      currentPhase = mod.phase;
      const phaseName = PHASE_NAMES[mod.phase] || '';
      phaseHeader = `<div class="phase-header">Phase ${mod.phase}: ${phaseName}</div>`;
    }

    const topicBtns = mod.topics.map(topic => {
      const topicStatus = getTopicStatus(topic);
      return `<button class="topic-btn ${state.currentTopic === topic.id ? 'active' : ''}"
                onclick="selectTopic('${topic.id}')"
                title="${topic.title}">
        <span class="status ${topicStatus}"></span>
        <span class="label">${topic.title}</span>
      </button>`;
    }).join('');

    return `${phaseHeader}<div class="module-group">
      <div class="module-title" onclick="toggleModule(this)">
        <span>M${mod.id}: ${mod.title}</span>
        <span class="arrow">&#9660;</span>
      </div>
      <div class="module-topics" style="max-height: 500px">
        ${topicBtns}
      </div>
    </div>`;
  }).join('');

  updateGlobalProgress();
}

function toggleModule(el) {
  el.classList.toggle('collapsed');
  const topics = el.nextElementSibling;
  topics.classList.toggle('collapsed');
}

function getTopicStatus(topic) {
  if (topic.cards.length === 0 || (topic.cards.length === 1 && topic.cards[0].q === 'Placeholder')) return 'not-started';
  let rated = 0;
  let allGot = true;
  topic.cards.forEach((_, i) => {
    const key = `${topic.id}_${i}`;
    if (state.ratings[key]) {
      rated++;
      if (state.ratings[key] !== 'got-it') allGot = false;
    } else {
      allGot = false;
    }
  });
  if (rated === 0) return 'not-started';
  if (rated === topic.cards.length && allGot) return 'done';
  return 'in-progress';
}

function updateGlobalProgress() {
  let total = 0, done = 0;
  MODULES.forEach(mod => {
    mod.topics.forEach(topic => {
      topic.cards.forEach((_, i) => {
        if (topic.cards[0].q === 'Placeholder') return;
        total++;
        if (state.ratings[`${topic.id}_${i}`] === 'got-it') done++;
      });
    });
  });
  const pct = total > 0 ? (done / total * 100) : 0;
  document.getElementById('globalProgress').style.width = pct + '%';
}

// ======================================
// TOPIC SELECTION
// ======================================

function findTopic(topicId) {
  for (const mod of MODULES) {
    for (const topic of mod.topics) {
      if (topic.id === topicId) return topic;
    }
  }
  return null;
}

function selectTopic(topicId) {
  const topic = findTopic(topicId);
  // Allow notes mode even for placeholder topics if notes exist
  if (state.mode === 'notes') {
    if (!NOTES[topicId]) return;
  } else {
    if (!topic || (topic.cards.length === 1 && topic.cards[0].q === 'Placeholder')) return;
  }

  state.currentTopic = topicId;
  state.currentCard = 0;
  state.flipped = false;

  const welcome = document.getElementById('welcomeScreen');
  if (welcome) welcome.style.display = 'none';
  document.getElementById('mainHeader').style.display = 'flex';

  if (state.mode === 'notes') {
    renderNotes();
  } else if (state.mode === 'random') {
    document.getElementById('statsBar').style.display = 'flex';
    document.getElementById('cardNav').style.display = 'flex';
    document.getElementById('keyboardHint').style.display = 'block';
    startRandom();
  } else {
    document.getElementById('statsBar').style.display = 'flex';
    document.getElementById('cardNav').style.display = 'flex';
    document.getElementById('keyboardHint').style.display = 'block';
    renderCard();
  }
  renderSidebar();
  updateStats();
}

// ======================================
// FLASHCARD RENDERING
// ======================================

function renderCard() {
  const topic = findTopic(state.currentTopic);
  if (!topic) return;

  const card = topic.cards[state.currentCard];
  const total = topic.cards.length;

  document.getElementById('topicTitle').textContent = topic.title;
  document.getElementById('cardCounter').textContent = `${state.currentCard + 1} / ${total}`;

  const ratingKey = `${state.currentTopic}_${state.currentCard}`;
  const rating = state.ratings[ratingKey];

  const mainBody = document.getElementById('mainBody');

  const ratingLabel = rating ? ` <span style="color: ${rating === 'got-it' ? 'var(--green)' : rating === 'needs-review' ? 'var(--yellow)' : 'var(--red)'}">(${rating.replace('-', ' ')})</span>` : '';

  if (!state.flipped) {
    mainBody.innerHTML = `
      <div class="flashcard-container">
        <div class="flashcard" onclick="flipCard()">
          <div class="flashcard-face flashcard-front">
            <div class="tag">Question ${state.currentCard + 1} of ${total}${ratingLabel}</div>
            <div class="question">${card.q}</div>
            <div class="hint">Click or press Space to reveal answer</div>
          </div>
        </div>
      </div>`;
  } else {
    mainBody.innerHTML = `
      <div class="flashcard-container">
        <div class="flashcard" onclick="flipCard()">
          <div class="flashcard-face flashcard-back">
            <div class="tag">Answer — Question ${state.currentCard + 1} of ${total}</div>
            <div class="answer">${card.a}</div>
          </div>
        </div>
      </div>`;
  }

  // Scroll to top on card change
  mainBody.scrollTop = 0;

  // Show/hide rating buttons
  const ratingBtns = document.getElementById('ratingBtns');
  ratingBtns.className = state.flipped ? 'rating-btns' : 'rating-btns hidden';

  // Update flip button text
  document.getElementById('flipBtn').textContent = state.flipped ? 'Show Question' : 'Show Answer';

  // Navigation buttons
  document.getElementById('prevBtn').disabled = state.currentCard === 0;
  document.getElementById('nextBtn').disabled = state.currentCard === total - 1;

  updateStats();
}

// ======================================
// NOTES RENDERING
// ======================================

function renderNotes() {
  const topic = findTopic(state.currentTopic);
  const noteContent = NOTES[state.currentTopic];

  if (!noteContent) {
    document.getElementById('mainBody').innerHTML = `
      <div class="welcome">
        <h2>Notes coming soon</h2>
        <p>Detailed notes for this topic haven't been added yet. Switch to Cards mode to study with flashcards.</p>
      </div>`;
    return;
  }

  document.getElementById('topicTitle').textContent = topic ? topic.title : '';
  document.getElementById('cardCounter').textContent = 'Study Notes';

  // Hide card-specific UI
  document.getElementById('statsBar').style.display = 'none';
  document.getElementById('cardNav').style.display = 'none';
  document.getElementById('keyboardHint').style.display = 'none';
  document.getElementById('ratingBtns').className = 'rating-btns hidden';

  const mainBody = document.getElementById('mainBody');
  mainBody.innerHTML = `
    <div class="notes-container">
      <div class="notes-content">
        ${noteContent}
      </div>
    </div>`;

  mainBody.scrollTop = 0;
}

function flipCard() {
  state.flipped = !state.flipped;
  renderCard();
}

function nextCard() {
  if (state.mode === 'random') {
    randomQueue.shift();
    showRandomCard();
  } else {
    const topic = findTopic(state.currentTopic);
    if (!topic || state.currentCard >= topic.cards.length - 1) return;
    state.currentCard++;
    state.flipped = false;
    renderCard();
  }
}

function prevCard() {
  if (state.currentCard <= 0) return;
  state.currentCard--;
  state.flipped = false;
  renderCard();
}

function rateCard(rating) {
  const key = `${state.currentTopic}_${state.currentCard}`;
  state.ratings[key] = rating;
  saveState();

  // Auto-advance to next card
  const topic = findTopic(state.currentTopic);
  if (topic && state.currentCard < topic.cards.length - 1) {
    nextCard();
  } else {
    renderCard();
    renderSidebar();
  }
  updateStats();
}

// ======================================
// RANDOM MODE
// ======================================

let randomQueue = [];

function startRandom() {
  // Build queue from ALL available cards (or prioritize weak ones)
  randomQueue = [];
  MODULES.forEach(mod => {
    mod.topics.forEach(topic => {
      if (topic.cards[0].q === 'Placeholder') return;
      topic.cards.forEach((card, i) => {
        const key = `${topic.id}_${i}`;
        const rating = state.ratings[key];
        // Prioritize: no-idea (3x), needs-review (2x), unseen (1x), got-it (skip)
        let weight = 1;
        if (rating === 'no-idea') weight = 3;
        else if (rating === 'needs-review') weight = 2;
        else if (rating === 'got-it') weight = 0;
        for (let w = 0; w < weight; w++) {
          randomQueue.push({ card, topicId: topic.id, cardIndex: i, topicTitle: topic.title });
        }
      });
    });
  });
  shuffleArray(randomQueue);
  if (randomQueue.length === 0) return;
  showRandomCard();
}

function shuffleArray(arr) {
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
}

function showRandomCard() {
  if (randomQueue.length === 0) {
    startRandom(); // reshuffle
    if (randomQueue.length === 0) return;
  }
  const item = randomQueue[0];
  state.currentTopic = item.topicId;
  state.currentCard = item.cardIndex;
  state.flipped = false;

  document.getElementById('topicTitle').textContent = 'Random — ' + item.topicTitle;
  document.getElementById('cardCounter').textContent = `${randomQueue.length} cards remaining`;
  renderCard();
}

// ======================================
// STATS
// ======================================

function updateStats() {
  let got = 0, review = 0, noIdea = 0, unseen = 0;
  const topic = findTopic(state.currentTopic);
  if (!topic) return;

  topic.cards.forEach((_, i) => {
    if (topic.cards[0].q === 'Placeholder') return;
    const key = `${state.currentTopic}_${i}`;
    const r = state.ratings[key];
    if (r === 'got-it') got++;
    else if (r === 'needs-review') review++;
    else if (r === 'no-idea') noIdea++;
    else unseen++;
  });

  document.getElementById('statGot').textContent = got;
  document.getElementById('statReview').textContent = review;
  document.getElementById('statNoIdea').textContent = noIdea;
  document.getElementById('statUnseen').textContent = unseen;
}

// ======================================
// MODE SWITCHER
// ======================================

function setMode(mode) {
  state.mode = mode;
  document.querySelectorAll('.mode-btn').forEach(btn => {
    btn.classList.toggle('active', btn.dataset.mode === mode);
  });
  if (state.currentTopic) {
    if (mode === 'notes') {
      renderNotes();
    } else if (mode === 'random') {
      document.getElementById('statsBar').style.display = 'flex';
      document.getElementById('cardNav').style.display = 'flex';
      document.getElementById('keyboardHint').style.display = 'block';
      startRandom();
    } else {
      document.getElementById('statsBar').style.display = 'flex';
      document.getElementById('cardNav').style.display = 'flex';
      document.getElementById('keyboardHint').style.display = 'block';
      state.currentCard = 0;
      state.flipped = false;
      renderCard();
    }
  }
}

// ======================================
// KEYBOARD SHORTCUTS
// ======================================

document.addEventListener('keydown', (e) => {
  if (e.target.tagName === 'TEXTAREA' || e.target.tagName === 'INPUT') return;

  switch(e.code) {
    case 'Space':
      e.preventDefault();
      flipCard();
      break;
    case 'ArrowRight':
      e.preventDefault();
      nextCard();
      break;
    case 'ArrowLeft':
      e.preventDefault();
      prevCard();
      break;
    case 'Digit1':
    case 'Numpad1':
      if (state.flipped) rateCard('no-idea');
      break;
    case 'Digit2':
    case 'Numpad2':
      if (state.flipped) rateCard('needs-review');
      break;
    case 'Digit3':
    case 'Numpad3':
      if (state.flipped) rateCard('got-it');
      break;
  }
});

// ======================================
// INIT
// ======================================

loadState();
renderSidebar();
