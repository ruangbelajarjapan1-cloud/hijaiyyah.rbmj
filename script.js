// Data Lengkap Huruf dan Nama (Untuk Text-to-Speech)
const lettersData = [
    { char: 'ا', name: 'Alif' }, { char: 'ب', name: 'Ba' }, { char: 'ت', name: 'Ta' },
    { char: 'ث', name: 'Tsa' }, { char: 'ج', name: 'Jim' }, { char: 'ح', name: 'Ha' },
    { char: 'خ', name: 'Kho' }, { char: 'د', name: 'Dal' }, { char: 'ذ', name: 'Dzal' },
    { char: 'ر', name: 'Ro' }, { char: 'ز', name: 'Zai' }, { char: 'س', name: 'Sin' },
    { char: 'ش', name: 'Syin' }, { char: 'ص', name: 'Shod' }, { char: 'ض', name: 'Dhod' },
    { char: 'ط', name: 'Tho' }, { char: 'ظ', name: 'Zho' }, { char: 'ع', name: 'Ain' },
    { char: 'غ', name: 'Ghoin' }, { char: 'ف', name: 'Fa' }, { char: 'ق', name: 'Qof' },
    { char: 'ك', name: 'Kaf' }, { char: 'ل', name: 'Lam' }, { char: 'م', name: 'Mim' },
    { char: 'ن', name: 'Nun' }, { char: 'ه', name: 'Ha' }, { char: 'و', name: 'Wawu' },
    { char: 'ء', name: 'Hamzah' }, { char: 'ي', name: 'Ya' }
];

const HARAKAT = { FATHAH: '\u064E', KASRAH: '\u0650', DAMMAH: '\u064F' };

const translations = {
    id: {
        level: "Level", score: "Skor", instruction: "Pasangkan huruf yang tepat!",
        winTitle: "Masyaallah, Luar Biasa!", finalScore: "Skor Akhir Kamu", restartBtn: "Main Lagi ▶",
        correctFeedback: "Hebat! ⭐", wrongFeedback: "Bukan yang itu!",
        stage1: "Tahap 1: Pengenalan Huruf", stage2: "Tahap 2: Fathah (A)",
        stage3: "Tahap 3: Kasrah (I)", stage4: "Tahap 4: Dammah (U)",
        voiceCmd: "Pasangkan huruf "
    },
    jp: {
        level: "レベル", score: "スコア", instruction: "正しい文字をはめよう！",
        winTitle: "素晴らしい！", finalScore: "最終スコア", restartBtn: "もう一度 ▶",
        correctFeedback: "すごい！ ⭐", wrongFeedback: "ちがうよ！",
        stage1: "ステージ1：文字の紹介", stage2: "ステージ2：ファトハ (A)",
        stage3: "ステージ3：カスラ (I)", stage4: "ステージ4：ダンマ (U)",
        voiceCmd: " をはめてね"
    }
};

let currentLang = 'id'; let score = 0; let currentLevel = 1; let maxLevel = 40;
let targetPool = []; let currentTargetData = null; let currentHarakat = ''; let isAnimating = false;

const levelDisplay = document.getElementById('level-display');
const scoreDisplay = document.getElementById('score-display');
const optionsContainer = document.getElementById('options-container');
const targetSlot = document.getElementById('target-slot');
const targetText = document.getElementById('target-text');
const feedbackMessage = document.getElementById('feedback-message');
const mainGame = document.querySelector('main');
const winScreen = document.getElementById('win-screen');
const stageBadge = document.getElementById('stage-badge');

// Fitur Suara (Text-to-Speech)
function speak(letterName) {
    window.speechSynthesis.cancel();
    const t = translations[currentLang];
    let msg = currentLang === 'jp' ? letterName + t.voiceCmd : t.voiceCmd + letterName;
    const utterance = new SpeechSynthesisUtterance(msg);
    utterance.lang = currentLang === 'jp' ? 'ja-JP' : 'id-ID';
    utterance.rate = 0.9; // Diperlambat sedikit untuk anak-anak
    window.speechSynthesis.speak(utterance);
}

function toggleLanguage() {
    currentLang = currentLang === 'id' ? 'jp' : 'id';
    updateUIText(); updateStageBadge();
}

function updateUIText() {
    document.querySelectorAll('[data-i18n]').forEach(el => {
        el.innerText = translations[currentLang][el.getAttribute('data-i18n')];
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

function checkStageAndHarakat() {
    if (currentLevel <= 10) { currentHarakat = ''; document.body.style.backgroundColor = '#caf0f8'; return 'stage1'; }
    else if (currentLevel <= 20) { currentHarakat = HARAKAT.FATHAH; document.body.style.backgroundColor = '#d8f3dc'; return 'stage2'; }
    else if (currentLevel <= 30) { currentHarakat = HARAKAT.KASRAH; document.body.style.backgroundColor = '#fcf6bd'; return 'stage3'; }
    else { currentHarakat = HARAKAT.DAMMAH; document.body.style.backgroundColor = '#ffe5d9'; return 'stage4'; }
}

function updateStageBadge() {
    stageBadge.innerText = translations[currentLang][checkStageAndHarakat()];
}

function initGame() {
    score = 0; currentLevel = 1;
    targetPool = shuffleArray(lettersData);
    mainGame.classList.remove('hidden'); winScreen.classList.add('hidden');
    updateScoreBoard(); updateUIText(); updateStageBadge(); loadLevel();
}

function loadLevel() {
    isAnimating = false;
    targetSlot.className = 'slot empty'; targetText.style.display = 'block';
    feedbackMessage.innerText = ''; feedbackMessage.className = 'feedback hidden';
    optionsContainer.style.pointerEvents = 'auto';

    updateStageBadge();
    if (targetPool.length === 0) targetPool = shuffleArray(lettersData);

    currentTargetData = targetPool.pop();
    let displayTarget = currentTargetData.char + currentHarakat;
    targetText.innerText = displayTarget;

    // Suarakan nama huruf saat level dimulai
    speak(currentTargetData.name);

    let numOptions = ((currentLevel - 1) % 10) + 1 >= 5 ? 4 : 3;
    let options = [currentTargetData];
    let remaining = shuffleArray(lettersData.filter(l => l.char !== currentTargetData.char));
    
    for (let i = 0; i < numOptions - 1; i++) options.push(remaining[i]);
    
    renderOptions(shuffleArray(options));
}

function renderOptions(optionsArray) {
    optionsContainer.innerHTML = '';
    optionsArray.forEach(data => {
        const block = document.createElement('div');
        block.className = 'block';
        block.innerText = data.char + currentHarakat;
        block.onclick = (e) => checkAnswer(data, e.currentTarget);
        optionsContainer.appendChild(block);
    });
}

// Efek Partikel Bintang
function createParticleBurst(x, y) {
    for (let i = 0; i < 8; i++) {
        let particle = document.createElement('div');
        particle.className = 'star-particle';
        particle.style.left = x + 'px'; particle.style.top = y + 'px';
        // Hitung arah ledakan acak
        let angle = Math.random() * Math.PI * 2;
        let distance = Math.random() * 80 + 40;
        particle.style.setProperty('--dx', `${Math.cos(angle) * distance}px`);
        particle.style.setProperty('--dy', `${Math.sin(angle) * distance}px`);
        document.body.appendChild(particle);
        setTimeout(() => particle.remove(), 800);
    }
}

function checkAnswer(selectedData, blockElement) {
    if (isAnimating) return;

    if (selectedData.char === currentTargetData.char) {
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
            targetText.innerText = selectedData.char + currentHarakat;
            
            // Panggil ledakan bintang di tengah slot
            createParticleBurst(targetRect.left + targetRect.width/2, targetRect.top + targetRect.height/2);
            
            score += 10;
            feedbackMessage.innerText = translations[currentLang].correctFeedback;
            feedbackMessage.className = 'feedback correct';
            updateScoreBoard();

            setTimeout(() => {
                currentLevel++;
                if (currentLevel > maxLevel) {
                    mainGame.classList.add('hidden'); winScreen.classList.remove('hidden');
                    document.getElementById('final-score').innerText = score;
                } else { loadLevel(); }
            }, 1200); 
        }, 500); // Kecepatan terbang

    } else {
        score = Math.max(0, score - 5); 
        feedbackMessage.innerText = translations[currentLang].wrongFeedback;
        feedbackMessage.className = 'feedback wrong';
        updateScoreBoard();
        
        blockElement.style.transform = 'translateX(8px)';
        setTimeout(() => blockElement.style.transform = 'translateX(-8px)', 100);
        setTimeout(() => blockElement.style.transform = 'none', 200);
        setTimeout(() => feedbackMessage.classList.add('hidden'), 1500);
    }
}

function updateScoreBoard() {
    levelDisplay.innerText = currentLevel;
    scoreDisplay.innerText = score;
}

// Interaksi pertama user untuk mengaktifkan Suara (Kebijakan Browser)
document.body.addEventListener('click', function unlockAudio() {
    const silent = new SpeechSynthesisUtterance('');
    window.speechSynthesis.speak(silent);
    document.body.removeEventListener('click', unlockAudio);
}, { once: true });

initGame();
