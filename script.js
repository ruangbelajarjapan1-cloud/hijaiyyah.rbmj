// Daftar lengkap 29 huruf hijaiyyah (termasuk Hamzah)
const allLetters = ['ا','ب','ت','ث','ج','ح','خ','د','ذ','ر','ز','س','ش','ص','ض','ط','ظ','ع','غ','ف','ق','ك','ل','م','ن','ه','و','ء','ي'];

const translations = {
    id: {
        level: "Level", score: "Skor", instruction: "Pasangkan balok yang bentuknya sama!",
        winTitle: "Masyaallah, Luar Biasa!", finalScore: "Skor Akhir Kamu",
        restartBtn: "Main Lagi", correctFeedback: "Pas!", wrongFeedback: "Bukan yang itu!"
    },
    jp: {
        level: "レベル", score: "スコア", instruction: "同じ形のブロックをはめよう！",
        winTitle: "マシャアッラー、素晴らしい！", finalScore: "あなたの最終スコア",
        restartBtn: "もう一度プレイ", correctFeedback: "ぴったり！", wrongFeedback: "ちがうよ！"
    }
};

let currentLang = 'id';
let score = 0;
let currentLevel = 1;
let maxLevel = 29; // Maksimal level 29
let targetPool = []; 
let currentTarget = ''; 

const levelDisplay = document.getElementById('level-display');
const scoreDisplay = document.getElementById('score-display');
const optionsContainer = document.getElementById('options-container');
const targetSlot = document.getElementById('target-slot');
const feedbackMessage = document.getElementById('feedback-message');
const mainGame = document.querySelector('main');
const winScreen = document.getElementById('win-screen');
const finalScore = document.getElementById('final-score');

function toggleLanguage() {
    currentLang = currentLang === 'id' ? 'jp' : 'id';
    updateUIText();
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

function initGame() {
    score = 0;
    currentLevel = 1;
    targetPool = shuffleArray(allLetters); 
    
    mainGame.classList.remove('hidden');
    winScreen.classList.add('hidden');
    
    updateScoreBoard();
    updateUIText();
    loadLevel();
}

function loadLevel() {
    targetSlot.className = 'slot empty';
    feedbackMessage.innerText = '';
    feedbackMessage.className = 'feedback hidden';

    // Ambil 1 huruf sebagai jawaban
    currentTarget = targetPool.pop();

    // INILAH KUNCI PERUBAHANNYA: Menampilkan huruf sebagai bayangan cetakan, bukan '?' lagi
    targetSlot.innerText = currentTarget;

    let numOptions = 3;
    if (currentLevel >= 10) numOptions = 4;
    if (currentLevel >= 20) numOptions = 6;

    let options = [currentTarget];
    let remainingLetters = allLetters.filter(l => l !== currentTarget);
    remainingLetters = shuffleArray(remainingLetters);
    
    for (let i = 0; i < numOptions - 1; i++) {
        options.push(remainingLetters[i]);
    }

    options = shuffleArray(options);
    renderOptions(options);
}

function renderOptions(optionsArray) {
    optionsContainer.innerHTML = ''; 
    optionsArray.forEach(letter => {
        const block = document.createElement('div');
        block.className = 'block';
        block.innerText = letter;
        block.onclick = () => checkAnswer(letter);
        optionsContainer.appendChild(block);
    });
}

function checkAnswer(selectedLetter) {
    if (selectedLetter === currentTarget) {
        score += 10;
        // Saat benar, ubah cetakan jadi balok utuh
        targetSlot.className = 'slot filled';
        
        feedbackMessage.innerText = translations[currentLang].correctFeedback;
        feedbackMessage.className = 'feedback correct';
        
        updateScoreBoard();
        
        setTimeout(() => {
            currentLevel++;
            if (currentLevel > maxLevel) {
                showWinScreen();
            } else {
                loadLevel();
                updateScoreBoard();
            }
        }, 1200); 

    } else {
        score = Math.max(0, score - 5); 
        feedbackMessage.innerText = translations[currentLang].wrongFeedback;
        feedbackMessage.className = 'feedback wrong';
        updateScoreBoard();
        
        setTimeout(() => {
            feedbackMessage.classList.add('hidden');
        }, 1000);
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
