// 游戏配置
const GRID_SIZE = 20;
const CANVAS_SIZE = 360;
let gameSpeed = 150; // 默认速度

// 游戏变量
let canvas = null;
let ctx = null;
let snake = [];
let food = {};
let direction = 'right';
let nextDirection = 'right';
let score = 0;
let gameInterval = null;
let isPaused = false;
let isGameOver = false;

// 新增：视觉效果变量
let particles = [];
let currentSkin = 'rainbow';
let glowIntensity = 0;

// 新增：食物类型配置
const FOOD_TYPES = {
    apple: { emoji: '🍎', points: 10, color: '#e74c3c', probability: 0.6, effect: 'normal' },
    grape: { emoji: '🍇', points: 20, color: '#9b59b6', probability: 0.2, effect: 'grow2' },
    lightning: { emoji: '⚡', points: 15, color: '#f1c40f', probability: 0.1, effect: 'speed' },
    mushroom: { emoji: '🍄', points: 5, color: '#e67e22', probability: 0.08, effect: 'shrink' },
    diamond: { emoji: '💎', points: 50, color: '#3498db', probability: 0.02, effect: 'bonus' }
};

// 新增：特效状态
let speedBoostTime = 0;
let originalSpeed = 150;

// 新增：皮肤配置
const SKINS = {
    rainbow: { name: '彩虹蛇', colors: ['#ff0000', '#ff7f00', '#ffff00', '#00ff00', '#0000ff', '#4b0082', '#9400d3'] },
    neon: { name: '霓虹蛇', colors: ['#00ffff', '#ff00ff', '#ffff00', '#00ff00'] },
    fire: { name: '火焰蛇', colors: ['#ff4500', '#ff6347', '#ffa500', '#ffff00'] },
    ocean: { name: '海洋蛇', colors: ['#000080', '#0000ff', '#4169e1', '#87ceeb'] },
    classic: { name: '经典蛇', colors: ['#27ae60', '#2ecc71'] }
};

// 新增：音效系统
const SOUNDS = {
    eat: null,
    gameOver: null,
    powerUp: null,
    background: null
};

// 初始化游戏
function initGame() {
    // 再次检查canvas元素（作为备用方案）
    if (!canvas) {
        canvas = document.getElementById('gameCanvas');
        if (!canvas) {
            console.error('找不到canvas元素！');
            return;
        }
    }
    
    ctx = canvas.getContext('2d');
    
    // 初始化蛇
    snake = [
        {x: 10, y: 10},
        {x: 9, y: 10},
        {x: 8, y: 10}
    ];
    
    // 生成食物
    generateFood();
    
    // 重置游戏状态
    direction = 'right';
    nextDirection = 'right';
    score = 0;
    isPaused = false;
    isGameOver = false;
    
    // 更新分数显示
    updateScore();
    
    // 隐藏游戏结束界面
    document.getElementById('gameOver').style.display = 'none';
    
    // 绘制初始状态
    draw();
}

// 粒子类
class Particle {
    constructor(x, y, color) {
        this.x = x;
        this.y = y;
        this.vx = (Math.random() - 0.5) * 8;
        this.vy = (Math.random() - 0.5) * 8;
        this.life = 1.0;
        this.decay = Math.random() * 0.02 + 0.01;
        this.size = Math.random() * 4 + 2;
        this.color = color;
    }
    
    update() {
        this.x += this.vx;
        this.y += this.vy;
        this.vx *= 0.98;
        this.vy *= 0.98;
        this.life -= this.decay;
        this.size *= 0.99;
    }
    
    draw(ctx) {
        ctx.save();
        ctx.globalAlpha = this.life;
        ctx.fillStyle = this.color;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
    }
}

// 创建粒子效果
function createParticles(x, y, color, count = 15) {
    for (let i = 0; i < count; i++) {
        particles.push(new Particle(x, y, color));
    }
}

// 更新粒子
function updateParticles() {
    for (let i = particles.length - 1; i >= 0; i--) {
        particles[i].update();
        if (particles[i].life <= 0) {
            particles.splice(i, 1);
        }
    }
}

// 绘制粒子
function drawParticles() {
    particles.forEach(particle => particle.draw(ctx));
}

// 生成食物（更新版本）
function generateFood() {
    let newFood;
    let isOnSnake;
    
    do {
        isOnSnake = false;
        newFood = {
            x: Math.floor(Math.random() * (CANVAS_SIZE / GRID_SIZE)),
            y: Math.floor(Math.random() * (CANVAS_SIZE / GRID_SIZE))
        };
        
        // 检查食物是否在蛇身上
        for (let segment of snake) {
            if (segment.x === newFood.x && segment.y === newFood.y) {
                isOnSnake = true;
                break;
            }
        }
    } while (isOnSnake);
    
    // 随机选择食物类型
    const rand = Math.random();
    let cumulativeProbability = 0;
    
    for (const [type, config] of Object.entries(FOOD_TYPES)) {
        cumulativeProbability += config.probability;
        if (rand <= cumulativeProbability) {
            newFood.type = type;
            newFood.config = config;
            break;
        }
    }
    
    // 如果没有选中任何类型，默认为苹果
    if (!newFood.type) {
        newFood.type = 'apple';
        newFood.config = FOOD_TYPES.apple;
    }
    
    food = newFood;
}

// 开始游戏
function startGame() {
    if (gameInterval) return;
    
    initGame();
    
    // 保存原始速度
    originalSpeed = gameSpeed;
    
    // 禁用开始按钮，启用暂停按钮
    document.getElementById('startBtn').disabled = true;
    document.getElementById('pauseBtn').disabled = false;
    
    // 开始游戏循环
    updateGameSpeed();
}

// 音效系统
function initSounds() {
    // 创建音效上下文
    try {
        const audioContext = new (window.AudioContext || window.webkitAudioContext)();
        
        // 简单的音效生成函数
        SOUNDS.eat = () => playTone(audioContext, 800, 0.1, 'sine');
        SOUNDS.powerUp = () => playTone(audioContext, 1200, 0.2, 'square');
        SOUNDS.gameOver = () => playTone(audioContext, 200, 0.5, 'sawtooth');
    } catch (e) {
        console.log('音效初始化失败:', e);
    }
}

// 播放音调
function playTone(audioContext, frequency, duration, type = 'sine') {
    try {
        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();
        
        oscillator.connect(gainNode);
        gainNode.connect(audioContext.destination);
        
        oscillator.frequency.setValueAtTime(frequency, audioContext.currentTime);
        oscillator.type = type;
        
        gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + duration);
        
        oscillator.start(audioContext.currentTime);
        oscillator.stop(audioContext.currentTime + duration);
    } catch (e) {
        console.log('音效播放失败:', e);
    }
}

// 播放音效
function playSound(soundName) {
    if (SOUNDS[soundName]) {
        SOUNDS[soundName]();
    }
}

// 游戏主循环
function gameLoop() {
    if (isPaused || isGameOver) return;
    
    // 更新方向
    direction = nextDirection;
    
    // 更新特效状态
    updateEffects();
    
    // 移动蛇
    moveSnake();
    
    // 检查碰撞
    if (checkCollision()) {
        gameOver();
        return;
    }
    
    // 检查是否吃到食物
    checkFood();
    
    // 更新粒子
    updateParticles();
    
    // 绘制游戏
    draw();
}

// 更新特效状态
function updateEffects() {
    // 更新速度提升效果
    if (speedBoostTime > 0) {
        speedBoostTime--;
        if (speedBoostTime <= 0) {
            gameSpeed = originalSpeed;
            updateGameSpeed();
        }
    }
}

// 移动蛇
function moveSnake() {
    // 获取蛇头
    const head = {...snake[0]};
    
    // 根据方向移动蛇头
    switch (direction) {
        case 'up':
            head.y -= 1;
            break;
        case 'down':
            head.y += 1;
            break;
        case 'left':
            head.x -= 1;
            break;
        case 'right':
            head.x += 1;
            break;
    }
    
    // 将新头部添加到蛇数组前面
    snake.unshift(head);
    
    // 如果没有吃到食物，移除尾部
    if (head.x !== food.x || head.y !== food.y) {
        snake.pop();
    }
}

// 检查碰撞
function checkCollision() {
    const head = snake[0];
    
    // 检查墙壁碰撞
    if (head.x < 0 || head.x >= CANVAS_SIZE / GRID_SIZE ||
        head.y < 0 || head.y >= CANVAS_SIZE / GRID_SIZE) {
        return true;
    }
    
    // 检查自身碰撞（从第二个段开始检查）
    for (let i = 1; i < snake.length; i++) {
        if (head.x === snake[i].x && head.y === snake[i].y) {
            return true;
        }
    }
    
    return false;
}

// 检查食物
function checkFood() {
    const head = snake[0];
    
    if (head.x === food.x && head.y === food.y) {
        // 创建粒子效果
        const centerX = food.x * GRID_SIZE + GRID_SIZE / 2;
        const centerY = food.y * GRID_SIZE + GRID_SIZE / 2;
        createParticles(centerX, centerY, food.config.color, 20);
        
        // 增加分数
        score += food.config.points;
        updateScore();
        
        // 应用食物效果
        applyFoodEffect(food.config.effect);
        
        // 播放音效
        playSound('eat');
        
        // 生成新食物
        generateFood();
    }
}

// 应用食物效果
function applyFoodEffect(effect) {
    switch (effect) {
        case 'normal':
            // 普通效果，蛇身已经在moveSnake中自动增长
            break;
        case 'grow2':
            // 额外增长一节
            snake.push({...snake[snake.length - 1]});
            break;
        case 'speed':
            // 临时加速
            speedBoostTime = 300; // 5秒加速
            gameSpeed = Math.max(50, gameSpeed * 0.7);
            updateGameSpeed();
            playSound('powerUp');
            break;
        case 'shrink':
            // 缩短蛇身
            if (snake.length > 3) {
                snake.pop();
                snake.pop();
            }
            break;
        case 'bonus':
            // 钻石奖励效果
            createParticles(
                food.x * GRID_SIZE + GRID_SIZE / 2,
                food.y * GRID_SIZE + GRID_SIZE / 2,
                '#ffd700',
                30
            );
            playSound('powerUp');
            break;
    }
}

// 获取蛇身颜色
function getSnakeColor(index, totalLength) {
    const skin = SKINS[currentSkin];
    const colors = skin.colors;
    
    if (currentSkin === 'rainbow') {
        // 彩虹效果：根据时间和位置计算颜色
        const time = Date.now() * 0.005;
        const colorIndex = (index + time) % colors.length;
        const color1 = colors[Math.floor(colorIndex)];
        const color2 = colors[Math.ceil(colorIndex) % colors.length];
        const t = colorIndex - Math.floor(colorIndex);
        
        return interpolateColor(color1, color2, t);
    } else {
        // 其他皮肤：根据位置选择颜色
        const colorIndex = Math.floor((index / totalLength) * colors.length);
        return colors[Math.min(colorIndex, colors.length - 1)];
    }
}

// 颜色插值函数
function interpolateColor(color1, color2, t) {
    const r1 = parseInt(color1.slice(1, 3), 16);
    const g1 = parseInt(color1.slice(3, 5), 16);
    const b1 = parseInt(color1.slice(5, 7), 16);
    
    const r2 = parseInt(color2.slice(1, 3), 16);
    const g2 = parseInt(color2.slice(3, 5), 16);
    const b2 = parseInt(color2.slice(5, 7), 16);
    
    const r = Math.round(r1 + (r2 - r1) * t);
    const g = Math.round(g1 + (g2 - g1) * t);
    const b = Math.round(b1 + (b2 - b1) * t);
    
    return `rgb(${r}, ${g}, ${b})`;
}

// 绘制发光效果
function drawGlow(x, y, width, height, color, intensity = 1) {
    ctx.save();
    ctx.shadowColor = color;
    ctx.shadowBlur = 15 * intensity;
    ctx.fillStyle = color;
    ctx.fillRect(x, y, width, height);
    ctx.restore();
}

// 绘制游戏
function draw() {
    // 清空画布
    ctx.fillStyle = '#1a1a2e';
    ctx.fillRect(0, 0, CANVAS_SIZE, CANVAS_SIZE);
    
    // 更新发光强度
    glowIntensity = 0.5 + 0.5 * Math.sin(Date.now() * 0.003);
    
    // 绘制蛇
    snake.forEach((segment, index) => {
        const color = getSnakeColor(index, snake.length);
        const x = segment.x * GRID_SIZE;
        const y = segment.y * GRID_SIZE;
        
        // 绘制发光效果
        drawGlow(x + 1, y + 1, GRID_SIZE - 2, GRID_SIZE - 2, color, glowIntensity);
        
        // 绘制蛇身
        ctx.fillStyle = color;
        ctx.fillRect(x + 1, y + 1, GRID_SIZE - 2, GRID_SIZE - 2);
        
        // 为蛇头添加眼睛
        if (index === 0) {
            ctx.fillStyle = 'white';
            
            // 根据方向绘制眼睛
            const eyeSize = GRID_SIZE / 5;
            const offset = GRID_SIZE / 4;
            
            if (direction === 'right' || direction === 'left') {
                const eyeY = y + offset;
                const eyeX1 = x + (direction === 'right' ? GRID_SIZE - offset - eyeSize : offset);
                const eyeX2 = x + (direction === 'right' ? GRID_SIZE - offset - eyeSize : offset);
                
                ctx.fillRect(eyeX1, eyeY, eyeSize, eyeSize);
                ctx.fillRect(eyeX2, eyeY + GRID_SIZE / 2, eyeSize, eyeSize);
            } else {
                const eyeX = x + offset;
                const eyeY1 = y + (direction === 'down' ? GRID_SIZE - offset - eyeSize : offset);
                const eyeY2 = y + (direction === 'down' ? GRID_SIZE - offset - eyeSize : offset);
                
                ctx.fillRect(eyeX, eyeY1, eyeSize, eyeSize);
                ctx.fillRect(eyeX + GRID_SIZE / 2, eyeY2, eyeSize, eyeSize);
            }
        }
    });
    
    // 绘制食物
    const foodX = food.x * GRID_SIZE + GRID_SIZE / 2;
    const foodY = food.y * GRID_SIZE + GRID_SIZE / 2;
    const foodRadius = GRID_SIZE / 2 - 1;
    
    // 食物发光效果
    ctx.save();
    ctx.shadowColor = food.config.color;
    ctx.shadowBlur = 20 * glowIntensity;
    ctx.fillStyle = food.config.color;
    ctx.beginPath();
    ctx.arc(foodX, foodY, foodRadius, 0, 2 * Math.PI);
    ctx.fill();
    ctx.restore();
    
    // 绘制食物emoji（如果支持）
    ctx.font = `${GRID_SIZE * 0.8}px Arial`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillStyle = 'white';
    ctx.fillText(food.config.emoji, foodX, foodY);
    
    // 绘制粒子效果
    drawParticles();
    
    // 绘制速度提升效果
    if (speedBoostTime > 0) {
        ctx.fillStyle = 'rgba(241, 196, 15, 0.3)';
        ctx.fillRect(0, 0, CANVAS_SIZE, CANVAS_SIZE);
        
        ctx.fillStyle = '#f1c40f';
        ctx.font = '16px Arial';
        ctx.textAlign = 'center';
        ctx.fillText('⚡ 加速中!', CANVAS_SIZE / 2, 30);
    }
}

// 更新分数
function updateScore() {
    document.getElementById('score').textContent = score;
}

// 游戏结束
function gameOver() {
    isGameOver = true;
    clearInterval(gameInterval);
    gameInterval = null;
    
    // 播放游戏结束音效
    playSound('gameOver');
    
    // 创建爆炸粒子效果
    const head = snake[0];
    createParticles(
        head.x * GRID_SIZE + GRID_SIZE / 2,
        head.y * GRID_SIZE + GRID_SIZE / 2,
        '#e74c3c',
        50
    );
    
    // 显示游戏结束界面
    const gameOverElement = document.getElementById('gameOver');
    document.getElementById('finalScore').textContent = score;
    
    // 确保弹窗显示
    gameOverElement.style.display = 'block';
    gameOverElement.style.visibility = 'visible';
    gameOverElement.style.opacity = '1';
    
    // 调试信息
    console.log('游戏结束弹窗应该显示了', gameOverElement);
    
    // 启用开始按钮，禁用暂停按钮
    document.getElementById('startBtn').disabled = false;
    document.getElementById('pauseBtn').disabled = true;
}

// 更新游戏速度
function updateGameSpeed() {
    clearInterval(gameInterval);
    gameInterval = setInterval(gameLoop, gameSpeed);
}

// 重新开始游戏
function restartGame() {
    clearInterval(gameInterval);
    gameInterval = null;
    startGame();
}

// 切换暂停状态
function togglePause() {
    isPaused = !isPaused;
    document.getElementById('pauseBtn').textContent = isPaused ? '继续' : '暂停';
}

// 键盘控制
document.addEventListener('keydown', (event) => {
    if (isGameOver) return;
    
    switch (event.key) {
        case 'ArrowUp':
            if (direction !== 'down') nextDirection = 'up';
            break;
        case 'ArrowDown':
            if (direction !== 'up') nextDirection = 'down';
            break;
        case 'ArrowLeft':
            if (direction !== 'right') nextDirection = 'left';
            break;
        case 'ArrowRight':
            if (direction !== 'left') nextDirection = 'right';
            break;
        case ' ':
            togglePause();
            break;
    }
});





// 切换皮肤
function changeSkin(skinName) {
    if (SKINS[skinName]) {
        currentSkin = skinName;
        // 如果游戏正在进行，立即重绘
        if (!isGameOver) {
            draw();
        }
    }
}

// 页面加载完成后初始化游戏
document.addEventListener('DOMContentLoaded', function() {
    // 初始化canvas
    canvas = document.getElementById('gameCanvas');
    
    // 确保canvas元素存在
    if (!canvas) {
        console.error('找不到canvas元素！');
        return;
    }
    
    // 初始化音效系统
    initSounds();
    
    initGame();
    
    // 触摸控制（移动设备支持）
    let touchStartX = 0;
    let touchStartY = 0;
    

    
    canvas.addEventListener('touchstart', (event) => {
        touchStartX = event.touches[0].clientX;
        touchStartY = event.touches[0].clientY;
        event.preventDefault();
    });
    
    canvas.addEventListener('touchmove', (event) => {
        event.preventDefault();
    });
    
    canvas.addEventListener('touchend', (event) => {
        if (isGameOver) return;
        
        const touchEndX = event.changedTouches[0].clientX;
        const touchEndY = event.changedTouches[0].clientY;
        
        const diffX = touchEndX - touchStartX;
        const diffY = touchEndY - touchStartY;
        
        if (Math.abs(diffX) > Math.abs(diffY)) {
            // 水平滑动
            if (diffX > 0 && direction !== 'left') {
                nextDirection = 'right';
            } else if (diffX < 0 && direction !== 'right') {
                nextDirection = 'left';
            }
        } else {
            // 垂直滑动
            if (diffY > 0 && direction !== 'up') {
                nextDirection = 'down';
            } else if (diffY < 0 && direction !== 'down') {
                nextDirection = 'up';
            }
        }
        
        event.preventDefault();
    });
    
    // 速度滑块事件监听
    document.getElementById('speedSlider').addEventListener('input', function(e) {
        gameSpeed = 350 - e.target.value; // 反转值：滑块值越大，速度越快
        
        // 更新速度显示文本
        const speedValue = document.getElementById('speedValue');
        if (gameSpeed <= 100) {
            speedValue.textContent = '极快';
        } else if (gameSpeed <= 150) {
            speedValue.textContent = '快速';
        } else if (gameSpeed <= 200) {
            speedValue.textContent = '中速';
        } else if (gameSpeed <= 250) {
            speedValue.textContent = '慢速';
        } else {
            speedValue.textContent = '极慢';
        }
        
        // 如果游戏正在进行，立即应用新速度
        if (gameInterval && !isPaused && !isGameOver) {
            updateGameSpeed();
        }
    });
});