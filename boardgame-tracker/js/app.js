// 主应用程序类
class App {
    constructor() {
        this.ui = new UI();
        this.setupEventListeners();
        this.initializeApp();
    }

    // 初始化应用
    initializeApp() {
        // 初始化UI
        this.ui.initializeUI();
        
        // 加载设置
        const settings = JSON.parse(localStorage.getItem('boardgame-tracker-settings') || '{"games":[]}');
        this.ui.renderSettings(settings);
        
        // 加载游戏列表
        const games = JSON.parse(localStorage.getItem('games') || '[]');
        this.ui.renderGamesList(games);
        
        // 加载赌注列表
        const bets = JSON.parse(localStorage.getItem('bets') || '[]');
        this.ui.renderBetsList(bets);
        
        // 更新统计数据
        this.updateStats();
    }

    // 设置事件监听器
    setupEventListeners() {
        // 监听添加游戏表单提交
        document.getElementById('add-game-form')?.addEventListener('submit', (e) => {
            e.preventDefault();
            this.handleAddGame();
        });

        // 监听添加赌注表单提交
        document.getElementById('add-bet-form')?.addEventListener('submit', (e) => {
            e.preventDefault();
            this.handleAddBet();
        });

        // 监听赌注类型变化
        document.getElementById('bet-type')?.addEventListener('change', (e) => {
            this.ui.toggleBetConditions(e.target.value);
        });

        // 监听游戏删除
        document.getElementById('games-list')?.addEventListener('click', (e) => {
            if (e.target.closest('.delete-game')) {
                const gameItem = e.target.closest('.game-item');
                if (gameItem) {
                    this.handleDeleteGame(gameItem.dataset.id);
                }
            }
        });

        // 监听赌注删除和完成
        document.getElementById('bets-list')?.addEventListener('click', (e) => {
            const betItem = e.target.closest('.bet-item');
            if (!betItem) return;

            if (e.target.closest('.delete-bet')) {
                this.handleDeleteBet(betItem.dataset.id);
            } else if (e.target.closest('.complete-bet')) {
                this.handleCompleteBet(betItem.dataset.id);
            }
        });

        // 监听玩家名称变化
        document.getElementById('player1-name')?.addEventListener('change', () => this.handlePlayerNameChange());
        document.getElementById('player2-name')?.addEventListener('change', () => this.handlePlayerNameChange());

        // 监听数据管理按钮
        document.getElementById('export-data')?.addEventListener('click', () => this.handleExportData());
        document.getElementById('import-data')?.addEventListener('click', () => this.handleImportData());
        document.getElementById('clear-data')?.addEventListener('click', () => this.handleClearData());
    }

    // 处理添加游戏
    handleAddGame() {
        const gameSelect = document.getElementById('game-select');
        const winnerInput = document.getElementById('winner-input');
        const dateInput = document.getElementById('game-date');
        const notesInput = document.getElementById('game-notes');
        const betSelect = document.getElementById('bet-select');

        if (!gameSelect.value || !winnerInput.value || !dateInput.value) {
            alert('请填写必要信息');
            return;
        }

        const newGame = {
            id: Date.now().toString(),
            gameName: gameSelect.value,
            winner: winnerInput.value,
            date: dateInput.value,
            notes: notesInput.value,
            betId: betSelect.value
        };

        // 保存游戏记录
        const games = JSON.parse(localStorage.getItem('games') || '[]');
        games.push(newGame);
        localStorage.setItem('games', JSON.stringify(games));

        // 更新UI
        this.ui.renderGamesList(games);
        this.updateStats();
        this.ui.hideAllModals();

        // 重置表单
        document.getElementById('add-game-form').reset();
    }

    // 处理玩家名称变化
    handlePlayerNameChange() {
        const player1Name = document.getElementById('player1-name').value || '我';
        const player2Name = document.getElementById('player2-name').value || '她';
        document.getElementById('player-names').textContent = `玩家: ${player1Name} & ${player2Name}`;
        
        // 更新胜者选择按钮的显示名称
        const playerBtns = document.querySelectorAll('.winner-selection .player-btn');
        playerBtns[0].querySelector('.player-name').textContent = player1Name;
        playerBtns[1].querySelector('.player-name').textContent = player2Name;
    }

    // 更新统计数据
    updateStats() {
        const stats = calculateStats();
        this.ui.renderStats(stats);
    }

    // 处理导出数据
    handleExportData() {
        const data = {
            games: JSON.parse(localStorage.getItem('games') || '[]'),
            bets: JSON.parse(localStorage.getItem('bets') || '[]'),
            settings: JSON.parse(localStorage.getItem('boardgame-tracker-settings') || '{"games":[]}')
        };

        const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `boardgame-tracker-backup-${new Date().toISOString().slice(0, 10)}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    }

    // 处理导入数据
    handleImportData() {
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = '.json';
        input.onchange = (e) => {
            const file = e.target.files[0];
            if (file) {
                const reader = new FileReader();
                reader.onload = (e) => {
                    try {
                        const data = JSON.parse(e.target.result);
                        localStorage.setItem('games', JSON.stringify(data.games || []));
                        localStorage.setItem('bets', JSON.stringify(data.bets || []));
                        localStorage.setItem('boardgame-tracker-settings', JSON.stringify(data.settings || {"games":[]}));
                        this.initializeApp();
                        alert('数据导入成功！');
                    } catch (error) {
                        alert('导入失败：无效的数据格式');
                    }
                };
                reader.readAsText(file);
            }
        };
        input.click();
    }

    // 处理清除数据
    handleClearData() {
        if (confirm('确定要清除所有数据吗？此操作不可恢复！')) {
            localStorage.removeItem('games');
            localStorage.removeItem('bets');
            localStorage.removeItem('boardgame-tracker-settings');
            this.initializeApp();
            alert('所有数据已清除！');
        }
    }
}

// 启动应用
document.addEventListener('DOMContentLoaded', () => {
    window.app = new App();
}); 