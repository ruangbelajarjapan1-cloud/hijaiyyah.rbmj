const allLetters = ['ا','ب','ت','ث','ج','ح','خ','د','ذ','ر','ز','س','ش','ص','ض','ط','ظ','ع','غ','ف','ق','ك','ل','م','ن','ه','و','ء','ي'];

// Unicode untuk Harakat
const HARAKAT = {
    FATHAH: '\u064E', // Bunyi A
    KASRAH: '\u0650', // Bunyi I
    DAMMAH: '\u064F'  // Bunyi U
};

const translations = {
    id: {
        level: "Level", score: "Skor", instruction: "Ketuk kepingan yang pas!",
        winTitle: "Masyaallah, Selesai!", finalScore: "Skor Akhir Kamu", restartBtn: "Main Lagi",
        correctFeedback: "Pas!", wrongFeedback: "Belum pas, coba lagi!",
        stage1: "Tahap 1: Pengenalan Huruf",
        stage2: "Tahap 2: Fathah (A)",
        stage3: "Tahap 3: Kasrah (I)",
        stage4: "Tahap 4: Dammah (U)"
    },
    jp: {
        level: "レベル", score: "スコア", instruction: "ぴったりなピースをタップ！",
        winTitle: "完了！素晴らしい！", finalScore: "最終スコア", restartBtn: "もう一度",
        correctFeedback: "ぴったり！", wrongFeedback: "ちがうよ、もう一度！",
        stage1: "ステージ1：文字の紹介",
        stage2: "ステージ2：ファトハ (A)",
        stage3: "ステージ3：カスラ (I)",
        stage4: "ステージ4：ダンマ (U)"
    }
};

let currentLang = 'id';
let score = 0;
let currentLevel = 1;
let maxLevel = 40; // Total 40 Level (10 per tahap)
let targetPool = []; 
let currentTarget = ''; 
let currentHarakat = ''; // Menyimpan harakat yang sedang aktif
let isAnimating = false;

const levelDisplay = document.getElementById('level-display');
const scoreDisplay = document.getElementById('score-display');
const optionsContainer = document.getElementById('options-container');
const targetSlot = document.getElementById('target-slot');
const feedbackMessage = document.getElementById('feedback-message');
const mainGame = document.querySelector('main');
const winScreen = document.getElementById('win-screen');
const finalScore = document.getElementById('final-score');
const stageBadge = document.getElementById('stage-badge');

function toggleLanguage() {
    currentLang = currentLang === 'id' ? 'jp' : 'id';
    updateUIText();
    updateStageBadge(); // Update bahasa untuk badge juga
}

function updateUIText() {
    const elements = document.querySelectorAll('[data-i18n]');
    elements.forEach(el => {
        const key = el.getAttribute('data-i18n');
        el.innerText = translations[currentLang][key];
    });
}

function shuffleArray(array) {
    let arr = [...array];
    for (let i = arr.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
}

// Fungsi untuk menentukan tahap berdasarkan level
function checkStageAndHarakat() {
    if (currentLevel <= 10) {
        currentHarakat = '';
        return 'stage1';
    } else if (currentLevel <= 20) {
        currentHarakat = HARAKAT.FATHAH;
        document.body.style.backgroundColor = '#EAE8E3'; // Ubah warna latar sedikit
        return 'stage2';
    } else if (currentLevel <= 30) {
        currentHarakat = HARAKAT.KASRAH;
        document.body.style.backgroundColor = '#E3EAE5';
        return 'stage3';
    } else {
        currentHarakat = HARAKAT.DAMMAH;
        document.body.style.backgroundColor = '#EAE5E3';
        return 'stage4';
    }
}

function updateStageBadge() {
    const stageKey = checkStageAndHarakat();
    stageBadge.innerText = translations[currentLang][stageKey];
}

function initGame() {
    score = 0; currentLevel = 1; document.body.style.backgroundColor = 'var(--bg-color)';
    targetPool = shuffleArray(allLetters); 
    mainGame.classList.remove('hidden'); winScreen.classList.add('hidden');
    updateScoreBoard(); updateUIText(); updateStageBadge(); loadLevel();
}

function loadLevel() {
    isAnimating = false;
    targetSlot.className = 'slot empty';
    feedbackMessage.innerText = ''; feedbackMessage.className = 'feedback hidden';
    optionsContainer.style.pointerEvents = 'auto'; 

    updateStageBadge();

    // Jika targetPool habis (setelah 29 huruf), acak ulang dari awal
    if (targetPool.length === 0) {
        targetPool = shuffleArray(allLetters);
    }

    // Ambil huruf dasar, lalu TAMBAHKAN HARAKAT
    let baseLetter = targetPool.pop();
    currentTarget = baseLetter + currentHarakat;

    // Tampilkan di target slot
    targetSlot.innerText = currentTarget;

    // Atur kesulitan opsi (berdasarkan level dalam tahap)
    let numOptions = 3;
    let levelInStage = ((currentLevel - 1) % 10) + 1; // 1 sampai 10 di setiap tahap
    if (levelInStage >= 5) numOptions = 4;
    if (levelInStage >= 8) numOptions = 6;

    let options = [currentTarget];
    let remainingLetters = allLetters.filter(l => l !== baseLetter);
    remainingLetters = shuffleArray(remainingLetters);
    
    // Pengecoh juga harus memiliki harakat yang sama agar adil
    for (let i = 0; i < numOptions - 1; i++) {
        options.push(remainingLetters[i] + currentHarakat);
    }

    options = shuffleArray(options);
    renderOptions(options);
}

function renderOptions(optionsArray) {
    optionsContainer.innerHTML = ''; 
    optionsArray.forEach(letterWithHarakat => {
        const block = document.createElement('div');
        block.className = 'block';
        block.innerText = letterWithHarakat;
        block.onclick = (e) => checkAnswer(letterWithHarakat, e.currentTarget);
        optionsContainer.appendChild(block);
    });
}

function checkAnswer(selectedLetter, blockElement) {
    if (isAnimating) return;

    if (selectedLetter === currentTarget) {
        isAnimating = true;
        feedbackMessage.classList.add('hidden');
        optionsContainer.style.pointerEvents = 'none';

        const blockRect = blockElement.getBoundingClientRect();
        const targetRect = targetSlot.getBoundingClientRect();

        const deltaX = targetRect.left - blockRect.left + (targetRect.width - blockRect.width) / 2;
        const deltaY = targetRect.top - blockRect.top + (targetRect.height - blockRect.height) / 2;

        blockElement.classList.add('flying');
        blockElement.style.transform = `translate(${deltaX}px, ${deltaY}px)`;

        setTimeout(() => {
            blockElement.style.opacity = '0';
            targetSlot.className = 'slot filled';
            
            score += 10;
            feedbackMessage.innerText = translations[currentLang].correctFeedback;
            feedbackMessage.className = 'feedback correct';
            updateScoreBoard();

            setTimeout(() => {
                currentLevel++;
                if (currentLevel > maxLevel) {
                    showWinScreen();
                } else {
                    loadLevel();
                }
            }, 1000); 
        }, 600); 

    } else {
        score = Math.max(0, score - 5); 
        feedbackMessage.innerText = translations[currentLang].wrongFeedback;
        feedbackMessage.className = 'feedback wrong';
        updateScoreBoard();
        
        blockElement.style.transform = 'translateX(5px)';
        setTimeout(() => { blockElement.style.transform = 'translateX(-5px)'; }, 100);
        setTimeout(() => { blockElement.style.transform = 'none'; }, 200);
        setTimeout(() => { feedbackMessage.classList.add('hidden'); }, 1500);
    }
}

function updateScoreBoard() {
    levelDisplay.innerText = currentLevel;
    scoreDisplay.innerText = score;
}

function showWinScreen() {
    mainGame.classList.add('hidden');
    winScreen.classList.remove('hidden');
    finalScore.innerText = score;
}

initGame();
