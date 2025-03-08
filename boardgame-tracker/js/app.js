// 应用程序主类
class BoardGameTracker {
    constructor() {
        this.ui = new UI();
        this.data = new DataManager();
        this.currentPage = 'games';
        this.initializeApp();
    }

    // 初始化应用程序
    initializeApp() {
        // 加载保存的数据
        this.data.loadData();
        
        // 初始化UI
        this.ui.initializeUI();
        
        // 设置事件监听器
        this.setupEventListeners();
        
        // 加载玩家名称
        this.loadPlayerNames();
        
        // 注册 Service Worker
        this.registerServiceWorker();
    }

    // 设置事件监听器
    setupEventListeners() {
        // 导航事件
        document.querySelectorAll('.nav-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const page = e.currentTarget.dataset.page;
                this.changePage(page);
            });
        });

        // 添加游戏按钮事件
        document.getElementById('add-game-btn').addEventListener('click', () => {
            this.ui.showModal('add-game-modal');
        });

        // 添加赌注按钮事件
        document.getElementById('add-bet-btn').addEventListener('click', () => {
            this.ui.showModal('add-bet-modal');
        });

        // 添加游戏表单提交事件
        document.getElementById('add-game-form').addEventListener('submit', (e) => {
            e.preventDefault();
            this.handleGameSubmit();
        });

        // 添加赌注表单提交事件
        document.getElementById('add-bet-form').addEventListener('submit', (e) => {
            e.preventDefault();
            this.handleBetSubmit();
        });

        // 设置表单提交事件
        document.getElementById('player1-name').addEventListener('change', () => this.savePlayerNames());
        document.getElementById('player2-name').addEventListener('change', () => this.savePlayerNames());

        // 数据管理按钮事件
        document.getElementById('export-data').addEventListener('click', () => this.data.exportData());
        document.getElementById('import-data').addEventListener('click', () => this.data.importData());
        document.getElementById('clear-data').addEventListener('click', () => {
            if (confirm('确定要清除所有数据吗？此操作不可恢复。')) {
                this.data.clearData();
                location.reload();
            }
        });

        // 赌注类型切换事件
        document.getElementById('bet-type').addEventListener('change', (e) => {
            this.ui.toggleBetConditions(e.target.value);
        });

        // 关闭模态框按钮事件
        document.querySelectorAll('.close-btn, .cancel-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                this.ui.hideAllModals();
            });
        });
    }

    // 切换页面
    changePage(page) {
        this.currentPage = page;
        this.ui.showPage(page);
        
        // 更新页面内容
        switch (page) {
            case 'games':
                this.ui.renderGamesList(this.data.getGames());
                break;
            case 'bets':
                this.ui.renderBetsList(this.data.getBets());
                break;
            case 'stats':
                this.updateStats();
                break;
            case 'settings':
                this.loadSettings();
                break;
        }
    }

    // 处理游戏提交
    handleGameSubmit() {
        const form = document.getElementById('add-game-form');
        const gameData = {
            id: Date.now(),
            gameName: form.querySelector('#game-select').value || form.querySelector('#new-game-input').value,
            winner: form.querySelector('#winner-input').value,
            date: form.querySelector('#game-date').value,
            notes: form.querySelector('#game-notes').value,
            betId: form.querySelector('#bet-select').value || null
        };

        // 保存游戏数据
        this.data.addGame(gameData);
        
        // 更新相关赌注
        if (gameData.betId) {
            this.data.updateBetProgress(gameData.betId, gameData);
        }

        // 更新UI
        this.ui.renderGamesList(this.data.getGames());
        this.ui.hideAllModals();
        form.reset();
    }

    // 处理赌注提交
    handleBetSubmit() {
        const form = document.getElementById('add-bet-form');
        const betData = {
            id: Date.now(),
            type: form.querySelector('#bet-type').value,
            content: form.querySelector('#bet-content').value,
            status: 'active',
            progress: 0,
            conditions: {}
        };

        // 根据赌注类型设置条件
        switch (betData.type) {
            case 'single':
                betData.conditions.gameId = form.querySelector('#game-for-bet').value || null;
                break;
            case 'series':
                betData.conditions.targetWins = parseInt(form.querySelector('#series-count').value);
                betData.conditions.currentWins = 0;
                break;
            case 'score':
                betData.conditions.deadline = form.querySelector('#score-deadline').value;
                break;
        }

        // 保存赌注数据
        this.data.addBet(betData);
        
        // 更新UI
        this.ui.renderBetsList(this.data.getBets());
        this.ui.hideAllModals();
        form.reset();
    }

    // 更新统计数据
    updateStats() {
        const stats = this.data.calculateStats();
        this.ui.renderStats(stats);
    }

    // 加载设置
    loadSettings() {
        const settings = this.data.getSettings();
        this.ui.renderSettings(settings);
    }

    // 加载玩家名称
    loadPlayerNames() {
        const names = this.data.getPlayerNames();
        document.getElementById('player1-name').value = names.player1 || '';
        document.getElementById('player2-name').value = names.player2 || '';
        this.updatePlayerNamesDisplay(names);
    }

    // 保存玩家名称
    savePlayerNames() {
        const names = {
            player1: document.getElementById('player1-name').value,
            player2: document.getElementById('player2-name').value
        };
        this.data.savePlayerNames(names);
        this.updatePlayerNamesDisplay(names);
    }

    // 更新玩家名称显示
    updatePlayerNamesDisplay(names) {
        const displayText = `玩家: ${names.player1 || '玩家1'} & ${names.player2 || '玩家2'}`;
        document.getElementById('player-names').textContent = displayText;
    }

    // 注册 Service Worker
    async registerServiceWorker() {
        if ('serviceWorker' in navigator) {
            try {
                const registration = await navigator.serviceWorker.register('/BD/boardgame-tracker/service-worker.js');
                console.log('Service Worker 注册成功:', registration);
            } catch (error) {
                console.log('Service Worker 注册失败:', error);
            }
        }
    }
}

// 当文档加载完成时初始化应用
document.addEventListener('DOMContentLoaded', () => {
    window.app = new BoardGameTracker();
}); 