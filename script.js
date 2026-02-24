// Data Huruf
const lettersData = [
    { char: 'ا', id: 'alif' }, { char: 'ب', id: 'ba' }, { char: 'ت', id: 'ta' },
    { char: 'ث', id: 'tsa' }, { char: 'ج', id: 'jim' }, { char: 'ح', id: 'ha' },
    { char: 'خ', id: 'kho' }, { char: 'د', id: 'dal' }, { char: 'ذ', id: 'dzal' },
    { char: 'ر', id: 'ro' }, { char: 'ز', id: 'zai' }, { char: 'س', id: 'sin' },
    { char: 'ش', id: 'syin' }, { char: 'ص', id: 'shod' }, { char: 'ض', id: 'dhod' },
    { char: 'ط', id: 'tho' }, { char: 'ظ', id: 'zho' }, { char: 'ع', id: 'ain' },
    { char: 'غ', id: 'ghoin' }, { char: 'ف', id: 'fa' }, { char: 'ق', id: 'qof' },
    { char: 'ك', id: 'kaf' }, { char: 'ل', id: 'lam' }, { char: 'م', id: 'mim' },
    { char: 'ن', id: 'nun' }, { char: 'ه', id: 'ha_besar' }, { char: 'و', id: 'wawu' },
    { char: 'ء', id: 'hamzah' }, { char: 'ي', id: 'ya' }
];

// Data Kata untuk Level Akhir (Merangkai Kata Dasar)
const wordsData = [
    { word: ['أ', 'ب'], meaningId: 'Ayah', meaningJp: 'お父さん (Otousan)', audioId: 'abun' },
    { word: ['أ', 'م'], meaningId: 'Ibu', meaningJp: 'お母さん (Okaasan)', audioId: 'ummun' },
    { word: ['أ', 'خ'], meaningId: 'Saudara', meaningJp: '兄弟 (Kyoudai)', audioId: 'akhun' },
    { word: ['ب', 'ا', 'ب'], meaningId: 'Pintu', meaningJp: 'ドア (Doa)', audioId: 'baabun' },
    { word: ['م', 'ا', 'ء'], meaningId: 'Air', meaningJp: '水 (Mizu)', audioId: 'maaun' }
];

const HARAKAT = { FATHAH: '\u064E', KASRAH: '\u0650', DAMMAH: '\u064F' };

const translations = {
    id: {
        level: "Level", score: "Skor", instruction: "Pasangkan huruf yang tepat!",
        winTitle: "Masyaallah, Tamat!", finalScore: "Skor Akhir Kamu", restartBtn: "Main Lagi Dari Awal ▶",
        correctFeedback: "Hebat! ⭐", wrongFeedback: "Bukan yang itu!",
        stage1: "Tahap 1: Pengenalan Huruf", stage2: "Tahap 2: Fathah (A)",
        stage3: "Tahap 3: Kasrah (I)", stage4: "Tahap 4: Dammah (U)", stage5: "Tahap 5: Merangkai Kata"
    },
    jp: {
        level: "レベル", score: "スコア", instruction: "正しい文字をはめよう！",
        winTitle: "素晴らしい、完了！", finalScore: "最終スコア", restartBtn: "最初からプレイ ▶",
        correctFeedback: "すごい！ ⭐", wrongFeedback: "ちがうよ！",
        stage1: "ステージ1：文字の紹介", stage2: "ステージ2：ファトハ (A)",
        stage3: "ステージ3：カスラ (I)", stage4: "ステージ4：ダンマ (U)", stage5: "ステージ5：単語作り"
    }
};

let currentLang = 'id'; let score = 0; let currentLevel = 1; let maxLevel = 45;
let targetPool = []; let isAnimating = false;
let currentHarakat = '';
// Variabel untuk mode kata
let isWordMode = false;
let currentWordTarget = []; 
let currentWordIndex = 0; // Menandakan huruf ke berapa yang sedang dikerjakan

const levelDisplay = document.getElementById('level-display'); const scoreDisplay = document.getElementById('score-display');
const optionsContainer = document.getElementById('options-container'); const slotsWrapper = document.getElementById('slots-wrapper');
const feedbackMessage = document.getElementById('feedback-message'); const wordMeaning = document.getElementById('word-meaning');
const stageBadge = document.getElementById('stage-badge');

// --- FUNGSI PEMUTAR AUDIO ASLI (MP3) ---
function playNativeAudio(fileName) {
    // Game akan mencoba mencari file di folder "audio/namafile.mp3"
    // Pastikan Anda menaruh rekaman Syaikh/Qari di folder tersebut.
    try {
        let audio = new Audio(`audio/${fileName}.mp3`);
        audio.play().catch(e => console.log("File MP3 tidak ditemukan atau di-blokir browser:", e));
    } catch (error) {
        console.log("Audio tidak tersedia.");
    }
}

function toggleLanguage() {
    currentLang = currentLang === 'id' ? 'jp' : 'id';
    updateUIText(); updateStageBadge();
    if (isWordMode && wordMeaning.innerText !== "") {
        // Update terjemahan kata jika sedang di mode kata
        let activeWord = wordsData[(currentLevel - 41)];
        wordMeaning.innerText = "Artinya: " + (currentLang === 'id' ? activeWord.meaningId : activeWord.meaningJp);
    }
}

function updateUIText() {
    document.querySelectorAll('[data-i18n]').forEach(el => el.innerText = translations[currentLang][el.getAttribute('data-i18n')]);
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
    if (currentLevel <= 10) { currentHarakat = ''; isWordMode = false; document.body.style.backgroundColor = '#caf0f8'; return 'stage1'; }
    else if (currentLevel <= 20) { currentHarakat = HARAKAT.FATHAH; isWordMode = false; document.body.style.backgroundColor = '#d8f3dc'; return 'stage2'; }
    else if (currentLevel <= 30) { currentHarakat = HARAKAT.KASRAH; isWordMode = false; document.body.style.backgroundColor = '#fcf6bd'; return 'stage3'; }
    else if (currentLevel <= 40) { currentHarakat = HARAKAT.DAMMAH; isWordMode = false; document.body.style.backgroundColor = '#ffe5d9'; return 'stage4'; }
    else { currentHarakat = ''; isWordMode = true; document.body.style.backgroundColor = '#e0aaff'; return 'stage5'; } // Mode Kata
}

function updateStageBadge() { stageBadge.innerText = translations[currentLang][checkStageAndHarakat()]; }

function initGame() {
    score = 0; currentLevel = 1; targetPool = shuffleArray(lettersData);
    document.getElementById('win-screen').classList.add('hidden');
    document.querySelector('main').classList.remove('hidden');
    updateScoreBoard(); updateUIText(); updateStageBadge(); loadLevel();
}

function loadLevel() {
    isAnimating = false; feedbackMessage.classList.add('hidden'); wordMeaning.innerText = '';
    optionsContainer.style.pointerEvents = 'auto'; slotsWrapper.innerHTML = '';
    updateStageBadge();

    if (!isWordMode) {
        // --- MODE 1: SATU HURUF (Level 1-40) ---
        if (targetPool.length === 0) targetPool = shuffleArray(lettersData);
        let targetData = targetPool.pop();
        
        currentWordTarget = [targetData.char + currentHarakat];
        currentWordIndex = 0;
        
        // Buat 1 kotak (slot)
        createSlot(currentWordTarget[0], 0, true);
        
        // Putar suara huruf
        playNativeAudio(targetData.id);

        generateOptions([currentWordTarget[0]]);
    } else {
        // --- MODE 2: MERANGKAI KATA (Level 41-45) ---
        let wordDataIndex = currentLevel - 41;
        let activeWord = wordsData[wordDataIndex];
        
        currentWordTarget = activeWord.word;
        currentWordIndex = 0;
        
        wordMeaning.innerText = "Artinya: " + (currentLang === 'id' ? activeWord.meaningId : activeWord.meaningJp);
        
        // Buat kotak sebanyak jumlah huruf dalam kata
        activeWord.word.forEach((char, index) => {
            createSlot(char, index, index === 0); // Kotak index 0 langsung aktif
        });

        // Putar suara kata penuh
        playNativeAudio(activeWord.audioId);

        generateOptions(activeWord.word);
    }
}

function createSlot(char, index, isActive) {
    let slot = document.createElement('div');
    slot.className = `slot ${isActive ? 'active-slot' : ''}`;
    slot.id = `slot-${index}`;
    slot.innerText = char; // Tampilkan bayangan
    slotsWrapper.appendChild(slot);
}

function generateOptions(correctCharsArray) {
    let options = [...correctCharsArray];
    let numOptions = isWordMode ? 6 : (((currentLevel - 1) % 10) + 1 >= 5 ? 4 : 3);
    
    // Cari huruf acak sebagai pengecoh
    let allChars = lettersData.map(l => l.char + currentHarakat);
    let remaining = shuffleArray(allChars.filter(c => !correctCharsArray.includes(c)));
    
    while(options.length < numOptions) {
        options.push(remaining.pop());
    }
    
    options = shuffleArray(options);
    optionsContainer.innerHTML = '';
    options.forEach(char => {
        const block = document.createElement('div');
        block.className = 'block'; block.innerText = char;
        block.onclick = (e) => checkAnswer(char, e.currentTarget);
        optionsContainer.appendChild(block);
    });
}

function checkAnswer(selectedChar, blockElement) {
    if (isAnimating) return;

    let targetChar = currentWordTarget[currentWordIndex];
    let activeSlot = document.getElementById(`slot-${currentWordIndex}`);

    if (selectedChar === targetChar) {
        // BENAR!
        isAnimating = true; optionsContainer.style.pointerEvents = 'none';
        
        const blockRect = blockElement.getBoundingClientRect();
        const targetRect = activeSlot.getBoundingClientRect();
        const deltaX = targetRect.left - blockRect.left + (targetRect.width - blockRect.width) / 2;
        const deltaY = targetRect.top - blockRect.top + (targetRect.height - blockRect.height) / 2;

        blockElement.classList.add('flying');
        blockElement.style.transform = `translate(${deltaX}px, ${deltaY}px)`;

        setTimeout(() => {
            blockElement.style.opacity = '0'; // Sembunyikan balok yang terbang
            activeSlot.className = 'slot filled';
            activeSlot.innerText = selectedChar;
            
            score += 10; updateScoreBoard();
            
            currentWordIndex++; // Pindah ke huruf berikutnya
            
            if (currentWordIndex < currentWordTarget.length) {
                // Masih ada huruf yang harus diisi di kata ini
                document.getElementById(`slot-${currentWordIndex}`).classList.add('active-slot');
                isAnimating = false; // Buka kunci animasi
                optionsContainer.style.pointerEvents = 'auto';
            } else {
                // KATA SELESAI ATAU LEVEL 1 HURUF SELESAI
                feedbackMessage.innerText = translations[currentLang].correctFeedback;
                feedbackMessage.className = 'feedback correct';
                
                setTimeout(() => {
                    currentLevel++;
                    if (currentLevel > maxLevel) {
                        document.querySelector('main').classList.add('hidden');
                        document.getElementById('win-screen').classList.remove('hidden');
                        document.getElementById('final-score').innerText = score;
                    } else { loadLevel(); }
                }, 1200);
            }
        }, 400); 

    } else {
        // SALAH!
        score = Math.max(0, score - 5); updateScoreBoard();
        feedbackMessage.innerText = translations[currentLang].wrongFeedback;
        feedbackMessage.className = 'feedback wrong';
        
        blockElement.style.transform = 'translateX(8px)';
        setTimeout(() => blockElement.style.transform = 'translateX(-8px)', 100);
        setTimeout(() => blockElement.style.transform = 'none', 200);
    }
}

function updateScoreBoard() { levelDisplay.innerText = currentLevel; scoreDisplay.innerText = score; }

initGame();
