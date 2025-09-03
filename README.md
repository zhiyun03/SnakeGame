# 🐍 贪吃蛇游戏 (Snake Game)

一个现代化的贪吃蛇游戏网页版，具有精美的界面和丰富的功能特性。

![游戏截图](https://img.shields.io/badge/状态-运行中-success) ![GitHub](https://img.shields.io/badge/GitHub-仓库-blue) ![HTML5](https://img.shields.io/badge/HTML5-E34F26?logo=html5&logoColor=white) ![CSS3](https://img.shields.io/badge/CSS3-1572B6?logo=css3&logoColor=white) ![JavaScript](https://img.shields.io/badge/JavaScript-F7DF1E?logo=javascript&logoColor=black)

## ✨ 功能特性

### 🎮 游戏功能
- **经典贪吃蛇玩法**：控制蛇吃食物，避免碰撞
- **实时分数系统**：吃到食物得分，实时显示
- **碰撞检测**：墙壁碰撞和自身碰撞检测
- **游戏状态管理**：开始、暂停、重新开始

### 🎨 界面设计
- **现代化UI**：渐变背景和毛玻璃效果
- **响应式布局**：支持桌面和移动设备
- **美观动画**：平滑的过渡和交互效果
- **视觉反馈**：蛇头和身体不同颜色，食物光泽效果

### ⚡ 高级功能
- **速度控制**：可调节游戏速度（极慢到极快）
- **键盘控制**：方向键控制移动
- **触摸支持**：移动设备滑动控制
- **暂停功能**：空格键暂停/继续游戏

## 🚀 快速开始

### 本地运行
1. 克隆仓库：
   ```bash
   git clone git@github.com:zhiyun03/SnakeGame.git
   cd SnakeGame
   ```

2. 启动本地服务器：
   ```bash
   # 使用 Python
   python3 -m http.server 8000
   
   # 或使用 Node.js
   npx serve .
   ```

3. 打开浏览器访问：`http://localhost:8000`

### 在线体验
游戏已部署到GitHub Pages：
🔗 [点击这里在线体验](https://zhiyun03.github.io/SnakeGame/)

## 🎯 游戏操作

### 键盘控制
- **↑↓←→** 方向键：控制蛇的移动方向
- **空格键**：暂停/继续游戏
- **重新开始按钮**：游戏结束后重新开始

### 触摸控制（移动设备）
- **上下左右滑动**：控制蛇的移动方向

### 速度调节
- 使用速度滑块调整游戏难度
- 向左滑动：速度加快
- 向右滑动：速度减慢
- 实时显示速度级别（极慢、慢速、中速、快速、极快）

## 📁 项目结构

```
SnakeGame/
├── index.html          # 主页面
├── style.css           # 样式文件
├── script.js           # 游戏逻辑
├── README.md           # 项目说明
└── .gitignore          # Git忽略文件
```

## 🛠️ 技术栈

- **HTML5**：页面结构和Canvas游戏画布
- **CSS3**：现代化样式和动画效果
- **JavaScript**：游戏逻辑和交互功能
- **Git**：版本控制和部署

## 🌐 浏览器支持

| 浏览器 | 支持状态 | 备注 |
|--------|----------|------|
| Chrome | ✅ 完全支持 | 推荐使用 |
| Firefox | ✅ 完全支持 |  |
| Safari | ✅ 完全支持 |  |
| Edge | ✅ 完全支持 |  |
| iOS Safari | ✅ 完全支持 | 触摸控制优化 |
| Android Chrome | ✅ 完全支持 | 触摸控制优化 |

## 📊 游戏规则

1. 使用方向键控制蛇的移动方向
2. 吃到食物（红色圆点）得分+10
3. 撞到墙壁或自身游戏结束
4. 游戏可以暂停和重新开始
5. 可以通过滑块调整游戏速度

## 🎮 游戏截图

（游戏运行截图）

## 🔧 开发说明

### 自定义修改
- 修改 `style.css` 调整界面样式
- 修改 `script.js` 中的游戏参数：
  - `GRID_SIZE`: 网格大小
  - 初始速度值
  - 蛇的初始长度和位置

### 扩展功能
可以轻松添加以下功能：
- 游戏音效
- 最高分记录
- 多关卡设计
- 不同的食物类型
- 游戏主题切换

## 🤝 贡献指南

欢迎提交Issue和Pull Request来改进这个项目！

1. Fork 本项目
2. 创建特性分支：`git checkout -b feature/AmazingFeature`
3. 提交更改：`git commit -m 'Add some AmazingFeature'`
4. 推送到分支：`git push origin feature/AmazingFeature`
5. 打开Pull Request

## 📄 许可证

本项目采用 MIT 许可证 - 查看 [LICENSE](LICENSE) 文件了解详情。

## 👥 作者

- **zhiyun03** - [GitHub](https://github.com/zhiyun03)

## 🙏 致谢

感谢以下资源提供的灵感和帮助：
- 经典贪吃蛇游戏设计
- MDN Web文档
- GitHub Pages部署服务

---

⭐ 如果这个项目对你有帮助，请给它一个Star！

🐛 发现问题？请提交Issue帮助我们改进！