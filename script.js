// Daftar lengkap 29 huruf hijaiyyah
const allLetters = ['ا','ب','ت','ث','ج','ح','خ','د','ذ','ر','ز','س','ش','ص','ض','ط','ظ','ع','غ','ف','ق','ك','ل','م','ن','ه','و','ء','ي'];

const translations = {
    id: {
        level: "Level", score: "Skor", instruction: "Ketuk kepingan yang pas untuk lubang ini!",
        winTitle: "Masyaallah, Selesai!", finalScore: "Skor Akhir Kamu",
        restartBtn: "Main Lagi", correctFeedback: "Pas!", wrongFeedback: "Belum pas, coba lagi!"
    },
    jp: {
        level: "レベル", score: "スコア", instruction: "この穴に合うピースをタップして！",
        winTitle: "マシャアッラー、完了！", finalScore: "あなたの最終スコア",
        restartBtn: "もう一度プレイ", correctFeedback: "ぴったり！", wrongFeedback: "合わないよ、もう一度！"
    }
};

let currentLang = 'id';
let score = 0;
let currentLevel = 1;
let maxLevel = 29;
let targetPool = []; 
let currentTarget = ''; 
let isAnimating = false; // Penjaga agar tidak bisa klik saat animasi berjalan

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
    isAnimating = false; // Buka kunci klik
    targetSlot.className = 'slot empty';
    feedbackMessage.innerText = '';
    feedbackMessage.className = 'feedback hidden';
    // Pastikan grid pilihan bisa diklik lagi
    optionsContainer.style.pointerEvents = 'auto'; 

    currentTarget = targetPool.pop();
    // Tampilkan bayangan samar di lubang target
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
        // PENTING: Kita kirim juga elemen HTML-nya (e.currentTarget) agar bisa dianimasikan
        block.onclick = (e) => checkAnswer(letter, e.currentTarget);
        optionsContainer.appendChild(block);
    });
}

// --- FUNGSI INTI BARU: CEK JAWABAN & ANIMASI TERBANG ---
function checkAnswer(selectedLetter, blockElement) {
    // Cegah klik ganda jika sedang ada animasi
    if (isAnimating) return;

    if (selectedLetter === currentTarget) {
        // --- JAWABAN BENAR: Mulai Animasi Terbang ---
        isAnimating = true;
        feedbackMessage.classList.add('hidden');
        
        // 1. Kunci area pilihan agar tidak bisa klik balok lain
        optionsContainer.style.pointerEvents = 'none';

        // 2. Hitung Posisi Awal (Balok yang diklik) dan Akhir (Slot Target)
        const blockRect = blockElement.getBoundingClientRect();
        const targetRect = targetSlot.getBoundingClientRect();

        // Hitung selisih jarak (Delta X dan Y) untuk terbang ke tengah target
        // Ditambah penyesuaian sedikit agar pas di tengah karena ukuran mungkin beda tipis
        const deltaX = targetRect.left - blockRect.left + (targetRect.width - blockRect.width) / 2;
        const deltaY = targetRect.top - blockRect.top + (targetRect.height - blockRect.height) / 2;

        // 3. Tambahkan kelas 'flying' untuk efek visual melayang
        blockElement.classList.add('flying');
        // 4. Terapkan perintah terbang (transform translate)
        blockElement.style.transform = `translate(${deltaX}px, ${deltaY}px)`;

        // 5. Tunggu sampai animasi selesai (sesuai durasi di CSS transition: 0.6s)
        setTimeout(() => {
            // --- SETELAH MENDARAT ---
            
            // Sembunyikan balok yang terbang tadi (karena sudah "masuk")
            blockElement.style.opacity = '0';
            
            // Ubah lubang target menjadi terisi penuh
            targetSlot.className = 'slot filled';
            
            // Update Skor dan Pesan
            score += 10;
            feedbackMessage.innerText = translations[currentLang].correctFeedback;
            feedbackMessage.className = 'feedback correct';
            updateScoreBoard();

            // Jeda sebentar sebelum lanjut level berikutnya
            setTimeout(() => {
                currentLevel++;
                if (currentLevel > maxLevel) {
                    showWinScreen();
                } else {
                    loadLevel();
                }
            }, 1000); 

        }, 600); // Waktu tunggu 600ms (harus sama dengan durasi transisi CSS)

    } else {
        // --- JAWABAN SALAH ---
        score = Math.max(0, score - 5); 
        feedbackMessage.innerText = translations[currentLang].wrongFeedback;
        feedbackMessage.className = 'feedback wrong';
        updateScoreBoard();
        
        // Efek getar sederhana (opsional, bisa ditambahkan nanti)
        blockElement.style.transform = 'translateX(5px)';
        setTimeout(() => { blockElement.style.transform = 'translateX(-5px)'; }, 100);
        setTimeout(() => { blockElement.style.transform = 'none'; }, 200);

        setTimeout(() => {
            feedbackMessage.classList.add('hidden');
        }, 1500);
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
