// 游戏配置
const GRID_SIZE = 20;
const CANVAS_SIZE = 400;
let gameSpeed = 150; // 默认速度

// 游戏变量
let canvas, ctx;
let snake = [];
let food = {};
let direction = 'right';
let nextDirection = 'right';
let score = 0;
let gameInterval = null;
let isPaused = false;
let isGameOver = false;

// 初始化游戏
function initGame() {
    canvas = document.getElementById('gameCanvas');
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

// 生成食物
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
    
    food = newFood;
}

// 开始游戏
function startGame() {
    if (gameInterval) return;
    
    initGame();
    
    // 禁用开始按钮，启用暂停按钮
    document.getElementById('startBtn').disabled = true;
    document.getElementById('pauseBtn').disabled = false;
    
    // 开始游戏循环
    updateGameSpeed();
}

// 游戏主循环
function gameLoop() {
    if (isPaused || isGameOver) return;
    
    // 更新方向
    direction = nextDirection;
    
    // 移动蛇
    moveSnake();
    
    // 检查碰撞
    if (checkCollision()) {
        gameOver();
        return;
    }
    
    // 检查是否吃到食物
    checkFood();
    
    // 绘制游戏
    draw();
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
        // 吃到食物，增加分数并生成新食物
        score += 10;
        updateScore();
        generateFood();
    }
}

// 绘制游戏
function draw() {
    // 清空画布
    ctx.fillStyle = '#ecf0f1';
    ctx.fillRect(0, 0, CANVAS_SIZE, CANVAS_SIZE);
    
    // 绘制蛇
    snake.forEach((segment, index) => {
        ctx.fillStyle = index === 0 ? '#27ae60' : '#2ecc71'; // 蛇头和身体不同颜色
        ctx.fillRect(
            segment.x * GRID_SIZE,
            segment.y * GRID_SIZE,
            GRID_SIZE - 1,
            GRID_SIZE - 1
        );
        
        // 为蛇头添加眼睛
        if (index === 0) {
            ctx.fillStyle = 'white';
            
            // 根据方向绘制眼睛
            const eyeSize = GRID_SIZE / 5;
            const offset = GRID_SIZE / 4;
            
            if (direction === 'right' || direction === 'left') {
                const eyeY = segment.y * GRID_SIZE + offset;
                const eyeX1 = segment.x * GRID_SIZE + (direction === 'right' ? GRID_SIZE - offset - eyeSize : offset);
                const eyeX2 = segment.x * GRID_SIZE + (direction === 'right' ? GRID_SIZE - offset - eyeSize : offset);
                
                ctx.fillRect(eyeX1, eyeY, eyeSize, eyeSize);
                ctx.fillRect(eyeX2, eyeY + GRID_SIZE / 2, eyeSize, eyeSize);
            } else {
                const eyeX = segment.x * GRID_SIZE + offset;
                const eyeY1 = segment.y * GRID_SIZE + (direction === 'down' ? GRID_SIZE - offset - eyeSize : offset);
                const eyeY2 = segment.y * GRID_SIZE + (direction === 'down' ? GRID_SIZE - offset - eyeSize : offset);
                
                ctx.fillRect(eyeX, eyeY1, eyeSize, eyeSize);
                ctx.fillRect(eyeX + GRID_SIZE / 2, eyeY2, eyeSize, eyeSize);
            }
        }
    });
    
    // 绘制食物
    ctx.fillStyle = '#e74c3c';
    ctx.beginPath();
    ctx.arc(
        food.x * GRID_SIZE + GRID_SIZE / 2,
        food.y * GRID_SIZE + GRID_SIZE / 2,
        GRID_SIZE / 2 - 1,
        0,
        2 * Math.PI
    );
    ctx.fill();
    
    // 添加食物光泽效果
    ctx.fillStyle = 'white';
    ctx.beginPath();
    ctx.arc(
        food.x * GRID_SIZE + GRID_SIZE / 3,
        food.y * GRID_SIZE + GRID_SIZE / 3,
        GRID_SIZE / 6,
        0,
        2 * Math.PI
    );
    ctx.fill();
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
    
    // 显示游戏结束界面
    const gameOverElement = document.getElementById('gameOver');
    document.getElementById('finalScore').textContent = score;
    gameOverElement.style.display = 'block';
    
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

// 页面加载完成后初始化游戏
document.addEventListener('DOMContentLoaded', function() {
    initGame();
});