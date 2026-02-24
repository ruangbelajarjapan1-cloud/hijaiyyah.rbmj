// --- 1. DATA MASTER ---
// Daftar lengkap 28 huruf hijaiyyah
const allLetters = ['ا','ب','ت','ث','ج','ح','خ','د','ذ','ر','ز','س','ش','ص','ض','ط','ظ','ع','غ','ف','ق','ك','ل','م','ن','ه','و','ء','ي'];
// Kamus terjemahan (Bahasa Indonesia & Bahasa Jepang)
const translations = {
    id: {
        level: "Level",
        score: "Skor",
        instruction: "Pilih huruf yang benar!",
        winTitle: "Masyaallah, Luar Biasa!",
        finalScore: "Skor Akhir Kamu",
        restartBtn: "Main Lagi",
        correctFeedback: "Mumtaz! (Hebat)",
        wrongFeedback: "Coba lagi ya!"
    },
    jp: {
        level: "レベル",
        score: "スコア",
        instruction: "正しい文字を選んでください！",
        winTitle: "マシャアッラー、素晴らしい！",
        finalScore: "あなたの最終スコア",
        restartBtn: "もう一度プレイ",
        correctFeedback: "ムムタズ！（すごい）",
        wrongFeedback: "もう一度試してね！"
    }
};

// --- 2. VARIABEL STATE GAME ---
let currentLang = 'id';
let score = 0;
let currentLevel = 1;
let maxLevel = 29;
let targetPool = []; // Menyimpan sisa huruf yang belum ditebak
let currentTarget = ''; 

// Referensi Elemen HTML
const levelDisplay = document.getElementById('level-display');
const scoreDisplay = document.getElementById('score-display');
const optionsContainer = document.getElementById('options-container');
const targetSlot = document.getElementById('target-slot');
const feedbackMessage = document.getElementById('feedback-message');
const mainGame = document.querySelector('main');
const winScreen = document.getElementById('win-screen');
const finalScore = document.getElementById('final-score');

// --- 3. LOGIKA BAHASA ---
function toggleLanguage() {
    currentLang = currentLang === 'id' ? 'jp' : 'id';
    updateUIText();
}

function updateUIText() {
    // Mencari semua elemen yang punya atribut data-i18n
    const elements = document.querySelectorAll('[data-i18n]');
    elements.forEach(el => {
        const key = el.getAttribute('data-i18n');
        el.innerText = translations[currentLang][key];
    });
}

// --- 4. FUNGSI UTAMA GAME ---
// Mengacak array (Fisher-Yates Shuffle)
function shuffleArray(array) {
    let arr = [...array];
    for (let i = arr.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
}

// Inisialisasi Game (Dijalankan saat pertama kali buka atau 'Main Lagi')
function initGame() {
    score = 0;
    currentLevel = 1;
    targetPool = shuffleArray(allLetters); // Acak 28 huruf untuk jadi target level
    
    mainGame.classList.remove('hidden');
    winScreen.classList.add('hidden');
    
    updateScoreBoard();
    updateUIText();
    loadLevel();
}

// Memuat level baru
function loadLevel() {
    // Reset area target
    targetSlot.innerText = '?';
    targetSlot.className = 'slot empty';
    feedbackMessage.innerText = '';
    feedbackMessage.className = 'feedback hidden';

    // Ambil 1 huruf dari pool sebagai jawaban benar
    currentTarget = targetPool.pop();

    // Menentukan jumlah blok pilihan berdasarkan level (Tingkat Kesulitan)
    let numOptions = 3; // Default level awal
    if (currentLevel >= 10) numOptions = 4; // Level menengah
    if (currentLevel >= 20) numOptions = 6; // Level lanjut

    // Membuat array pilihan (1 benar + sisanya pengecoh)
    let options = [currentTarget];
    let remainingLetters = allLetters.filter(l => l !== currentTarget);
    remainingLetters = shuffleArray(remainingLetters);
    
    // Tambahkan pengecoh ke array pilihan
    for (let i = 0; i < numOptions - 1; i++) {
        options.push(remainingLetters[i]);
    }

    // Acak posisi pilihan sebelum ditampilkan di layar
    options = shuffleArray(options);
    renderOptions(options);
}

// Menampilkan blok huruf ke layar
function renderOptions(optionsArray) {
    optionsContainer.innerHTML = ''; // Bersihkan blok sebelumnya
    optionsArray.forEach(letter => {
        const block = document.createElement('div');
        block.className = 'block';
        block.innerText = letter;
        // Tambahkan event ketika blok ditekan anak
        block.onclick = () => checkAnswer(letter);
        optionsContainer.appendChild(block);
    });
}

// Memeriksa jawaban anak
function checkAnswer(selectedLetter) {
    if (selectedLetter === currentTarget) {
        // Jika BENAR
        score += 10;
        targetSlot.innerText = currentTarget;
        targetSlot.className = 'slot filled';
        
        feedbackMessage.innerText = translations[currentLang].correctFeedback;
        feedbackMessage.className = 'feedback correct';
        
        updateScoreBoard();
        
        // Jeda sebentar sebelum lanjut level
        setTimeout(() => {
            currentLevel++;
            if (currentLevel > maxLevel) {
                showWinScreen();
            } else {
                loadLevel();
                updateScoreBoard();
            }
        }, 1200); // Jeda 1.2 detik

    } else {
        // Jika SALAH
        score = Math.max(0, score - 5); // Skor tidak bisa minus
        feedbackMessage.innerText = translations[currentLang].wrongFeedback;
        feedbackMessage.className = 'feedback wrong';
        updateScoreBoard();
        
        // Hilangkan pesan error setelah beberapa saat
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

// Mulai game saat halaman selesai dimuat
initGame();
