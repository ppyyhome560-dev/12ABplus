let currentMode = 'single'; // 'single' 或 'ai'
let targetAnswer = '';
let playerSecret = '';
let aiCandidates = [];
let gameOver = false;

// 頁面載入後初始化
window.onload = () => {
    initGame();
};

function switchMode(mode) {
    currentMode = mode;
    document.getElementById('single-mode-btn').classList.toggle('active', mode === 'single');
    document.getElementById('ai-mode-btn').classList.toggle('active', mode === 'ai');
    
    if (mode === 'ai') {
        document.getElementById('ai-setup').classList.remove('hidden');
        document.getElementById('ai-card').classList.remove('hidden');
    } else {
        document.getElementById('ai-setup').classList.add('hidden');
        document.getElementById('ai-card').classList.add('hidden');
    }
    initGame();
}

function initGame() {
    gameOver = false;
    targetAnswer = generateRandomNumber();
    document.getElementById('player-history').innerHTML = '';
    document.getElementById('ai-history').innerHTML = '';
    document.getElementById('player-input').value = '';
    document.getElementById('secret-input').value = '';
    document.getElementById('secret-status').innerText = '';
    
    if (currentMode === 'single') {
        enablePlayerInput(true);
    } else {
        enablePlayerInput(false);
        playerSecret = '';
        document.getElementById('ai-status').innerText = '請先在上方設定秘鑰';
        aiCandidates = generateAllCandidates();
    }
}

// 產生 4 位不重複隨機數
function generateRandomNumber() {
    let numbers = ['0','1','2','3','4','5','6','7','8','9'];
    numbers.sort(() => Math.random() - 0.5);
    return numbers.slice(0, 4).join('');
}

// 驗證輸入合法性
function isValidInput(str) {
    if (str.length !== 4 || isNaN(str)) return false;
    return new Set(str).size === 4;
}

function enablePlayerInput(enable) {
    document.getElementById('player-input').disabled = !enable;
    document.getElementById('guess-btn').disabled = !enable;
}

// 計算 A 與 B
function checkAB(guess, target) {
    let a = 0, b = 0;
    for (let i = 0; i < 4; i++) {
        if (guess[i] === target[i]) {
            a++;
        } else if (target.includes(guess[i])) {
            b++;
        }
    }
    return `${a}A${b}B`;
}

// 設定玩家秘鑰 (AI 模式)
function confirmSecret() {
    let val = document.getElementById('secret-input').value;
    if (!isValidInput(val)) {
        alert('請輸入 4 個不重複的數字！');
        return;
    }
    playerSecret = val;
    document.getElementById('secret-status').innerText = '秘鑰設定成功！可以開始猜數字了。';
    document.getElementById('ai-status').innerText = '回合進行中...';
    enablePlayerInput(true);
}

// 玩家回合
function playerGuess() {
    if (gameOver) return;
    let input = document.getElementById('player-input');
    let guess = input.value;

    if (!isValidInput(guess)) {
        alert('請輸入 4 個不重複的數字！');
        return;
    }

    let result = checkAB(guess, targetAnswer);
    addHistory('player-history', guess, result);
    input.value = '';

    if (result === '4A0B') {
        alert('🎉 恭喜你猜中了！獲勝！');
        gameOver = true;
        enablePlayerInput(false);
        return;
    }

    // AI 模式下，玩家猜完輪到 AI 猜
    if (currentMode === 'ai' && !gameOver) {
        setTimeout(aiTurn, 600);
    }
}

// AI 猜題演算法
function generateAllCandidates() {
    let list = [];
    for (let i = 123; i <= 9876; i++) {
        let str = i.toString().padStart(4, '0');
        if (isValidInput(str)) list.push(str);
    }
    return list;
}

function aiTurn() {
    if (aiCandidates.length === 0) return;
    
    // AI 隨機從剩餘可能性選一個答案
    let choiceIndex = Math.floor(Math.random() * aiCandidates.length);
    let aiGuess = aiCandidates[choiceIndex];
    
    let result = checkAB(aiGuess, playerSecret);
    addHistory('ai-history', aiGuess, result);

    if (result === '4A0B') {
        alert(`🤖 AI 猜中了你的秘鑰 (${playerSecret})！AI 獲勝！`);
        gameOver = true;
        enablePlayerInput(false);
        return;
    }

    // 根據提示過濾不可能的候選答案
    aiCandidates = aiCandidates.filter(num => checkAB(aiGuess, num) === result);
}

function addHistory(elementId, guess, result) {
    let ul = document.getElementById(elementId);
    let li = document.createElement('li');
    li.innerHTML = `<span>猜測：<strong>${guess}</strong></span> <span>結果：<b style="color:#38bdf8">${result}</b></span>`;
    ul.prepend(li);
}
