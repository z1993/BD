// UI管理类
class UI {
    constructor() {
        this.modals = document.querySelectorAll('.modal');
        this.pages = document.querySelectorAll('.page');
        this.navButtons = document.querySelectorAll('.nav-btn');
        this.setupEventListeners();
    }

    // 设置事件监听器
    setupEventListeners() {
        // 监听新对局按钮点击
        document.getElementById('add-game-btn')?.addEventListener('click', () => {
            this.showModal('add-game-modal');
        });

        // 监听第一局按钮点击
        document.getElementById('first-game-btn')?.addEventListener('click', () => {
            this.showModal('add-game-modal');
        });

        // 监听显示添加新游戏模态框按钮
        document.getElementById('show-add-game-modal-btn')?.addEventListener('click', () => {
            this.hideAllModals();
            this.showModal('add-new-game-modal');
        });

        // 监听添加新游戏表单提交
        document.getElementById('add-new-game-form')?.addEventListener('submit', (e) => {
            e.preventDefault();
            const gameName = document.getElementById('new-game-name').value.trim();
            if (gameName) {
                this.addNewGame(gameName);
                this.hideAllModals();
                this.showModal('add-game-modal');
            }
        });

        // 监听胜者选择按钮
        document.querySelectorAll('.winner-selection .player-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                // 移除其他按钮的选中状态
                document.querySelectorAll('.winner-selection .player-btn').forEach(b => {
                    b.classList.remove('selected');
                });
                // 添加当前按钮的选中状态
                e.currentTarget.classList.add('selected');
                // 设置隐藏输入框的值
                document.getElementById('winner-input').value = e.currentTarget.dataset.winner;
            });
        });

        // 监听设置页面的游戏添加按钮
        document.getElementById('add-game-to-list')?.addEventListener('click', () => {
            const input = document.getElementById('new-game-name');
            const gameName = input.value.trim();
            if (gameName) {
                this.addNewGame(gameName);
                input.value = '';
            }
        });

        // 监听模态框关闭按钮
        document.querySelectorAll('.close-btn, .cancel-btn').forEach(btn => {
            btn.addEventListener('click', () => this.hideAllModals());
        });

        // 监听导航按钮
        this.navButtons.forEach(btn => {
            btn.addEventListener('click', (e) => {
                this.showPage(e.currentTarget.dataset.page);
            });
        });
    }

    // 添加新游戏
    addNewGame(gameName) {
        // 获取当前设置
        const settings = JSON.parse(localStorage.getItem('boardgame-tracker-settings') || '{"games":[]}');
        
        // 检查游戏是否已存在
        if (!settings.games.includes(gameName)) {
            // 添加新游戏到设置中
            settings.games.push(gameName);
            localStorage.setItem('boardgame-tracker-settings', JSON.stringify(settings));
            
            // 更新游戏列表显示
            const gamesList = document.getElementById('games-list-settings');
            if (gamesList) {
                const gameItem = document.createElement('div');
                gameItem.className = 'game-setting-item';
                gameItem.innerHTML = `
                    <span>${gameName}</span>
                    <button class="icon-btn remove-game" data-game="${gameName}">
                        <i class="bi bi-x"></i>
                    </button>
                `;
                gamesList.appendChild(gameItem);
                
                // 添加删除按钮事件监听
                const removeBtn = gameItem.querySelector('.remove-game');
                removeBtn.addEventListener('click', (e) => {
                    const game = e.currentTarget.dataset.game;
                    const updatedGames = settings.games.filter(g => g !== game);
                    settings.games = updatedGames;
                    localStorage.setItem('boardgame-tracker-settings', JSON.stringify(settings));
                    gameItem.remove();
                    this.updateGameSelect();
                });
            }
            
            // 更新选择列表
            this.updateGameSelect();
            
            // 如果是从新游戏模态框添加的，自动选中新添加的游戏
            const gameSelect = document.getElementById('game-select');
            if (gameSelect) {
                gameSelect.value = gameName;
            }
        }
    }

    // 更新游戏选择列表
    updateGameSelect() {
        const settings = JSON.parse(localStorage.getItem('boardgame-tracker-settings') || '{"games":[]}');
        const gameSelect = document.getElementById('game-select');
        const gameBetSelect = document.getElementById('game-for-bet');
        
        if (gameSelect) {
            gameSelect.innerHTML = '<option value="">请选择游戏</option>';
            settings.games.forEach(game => {
                const option = document.createElement('option');
                option.value = game;
                option.textContent = game;
                gameSelect.appendChild(option);
            });
        }

        if (gameBetSelect) {
            gameBetSelect.innerHTML = '<option value="">选择游戏 (可选)</option>';
            settings.games.forEach(game => {
                const option = document.createElement('option');
                option.value = game;
                option.textContent = game;
                gameBetSelect.appendChild(option);
            });
        }
    }

    // 初始化UI
    initializeUI() {
        // 设置默认日期时间
        const now = new Date();
        const dateTimeLocal = now.toISOString().slice(0, 16);
        document.getElementById('game-date').value = dateTimeLocal;

        // 更新游戏选择列表
        this.updateGameSelect();
    }

    // 显示指定页面
    showPage(pageId) {
        // 更新导航按钮状态
        this.navButtons.forEach(btn => {
            btn.classList.toggle('active', btn.dataset.page === pageId);
        });

        // 更新页面显示
        this.pages.forEach(page => {
            page.classList.toggle('active', page.id === `${pageId}-page`);
        });
    }

    // 显示模态框
    showModal(modalId) {
        const modal = document.getElementById(modalId);
        if (modal) {
            modal.classList.add('active');
        }
    }

    // 隐藏所有模态框
    hideAllModals() {
        this.modals.forEach(modal => {
            modal.classList.remove('active');
        });
    }

    // 切换赌注条件显示
    toggleBetConditions(betType) {
        const conditions = ['single-bet-condition', 'series-bet-condition', 'score-bet-condition'];
        conditions.forEach(condition => {
            const element = document.getElementById(condition);
            element.style.display = condition.startsWith(betType) ? 'block' : 'none';
        });
    }

    // 渲染游戏列表
    renderGamesList(games) {
        const container = document.getElementById('games-list');
        if (games.length === 0) {
            container.innerHTML = `
                <div class="empty-state">
                    <i class="bi bi-controller"></i>
                    <p>还没有对局记录</p>
                    <button class="primary-btn" id="first-game-btn">记录第一局</button>
                </div>
            `;
            return;
        }

        const gamesList = games.map(game => this.createGameItem(game)).join('');
        container.innerHTML = gamesList;
    }

    // 创建游戏项目HTML
    createGameItem(game) {
        const date = new Date(game.date).toLocaleString('zh-CN');
        const names = this.getPlayerNames();
        const winnerName = game.winner === 'player1' ? names.player1 : names.player2;
        
        return `
            <div class="game-item" data-id="${game.id}">
                <div class="game-info">
                    <h3>${game.gameName}</h3>
                    <p>胜者: ${winnerName}</p>
                    <p class="game-date">${date}</p>
                    ${game.notes ? `<p class="game-notes">${game.notes}</p>` : ''}
                </div>
                <div class="game-actions">
                    <button class="icon-btn delete-game" title="删除">
                        <i class="bi bi-trash"></i>
                    </button>
                </div>
            </div>
        `;
    }

    // 渲染赌注列表
    renderBetsList(bets) {
        const container = document.getElementById('bets-list');
        if (bets.length === 0) {
            container.innerHTML = `
                <div class="empty-state">
                    <i class="bi bi-trophy"></i>
                    <p>还没有赌注记录</p>
                    <button class="primary-btn" id="first-bet-btn">创建第一个赌注</button>
                </div>
            `;
            return;
        }

        const betsList = bets.map(bet => this.createBetItem(bet)).join('');
        container.innerHTML = betsList;
    }

    // 创建赌注项目HTML
    createBetItem(bet) {
        const statusClass = bet.status === 'completed' ? 'completed' : 'active';
        const progressText = this.getBetProgressText(bet);
        
        return `
            <div class="bet-item ${statusClass}" data-id="${bet.id}">
                <div class="bet-info">
                    <h3>${bet.content}</h3>
                    <p class="bet-type">${this.getBetTypeText(bet.type)}</p>
                    <p class="bet-progress">${progressText}</p>
                </div>
                <div class="bet-actions">
                    ${bet.status === 'active' ? `
                        <button class="icon-btn complete-bet" title="完成">
                            <i class="bi bi-check-circle"></i>
                        </button>
                    ` : ''}
                    <button class="icon-btn delete-bet" title="删除">
                        <i class="bi bi-trash"></i>
                    </button>
                </div>
            </div>
        `;
    }

    // 获取赌注类型文本
    getBetTypeText(type) {
        const types = {
            single: '单局赌注',
            series: '连续赌注',
            score: '计分赌注'
        };
        return types[type] || type;
    }

    // 获取赌注进度文本
    getBetProgressText(bet) {
        switch (bet.type) {
            case 'single':
                return bet.status === 'completed' ? '已完成' : '进行中';
            case 'series':
                return `${bet.conditions.currentWins}/${bet.conditions.targetWins}局`;
            case 'score':
                const deadline = new Date(bet.conditions.deadline).toLocaleDateString('zh-CN');
                return `截止日期: ${deadline}`;
            default:
                return '';
        }
    }

    // 渲染统计数据
    renderStats(stats) {
        // 渲染胜率统计
        this.renderWinRateStats(stats.winRates);
        
        // 渲染游戏分布
        this.renderGamesDistribution(stats.gamesDistribution);
        
        // 渲染赌注成功率
        this.renderBetSuccessRate(stats.betStats);
    }

    // 渲染胜率统计
    renderWinRateStats(winRates) {
        const container = document.getElementById('win-rate-stats');
        const names = this.getPlayerNames();
        
        container.innerHTML = `
            <div class="player-stat">
                <h4>${names.player1}</h4>
                <div class="progress-bar">
                    <div class="progress" style="width: ${winRates.player1}%"></div>
                </div>
                <span>${winRates.player1}%</span>
            </div>
            <div class="player-stat">
                <h4>${names.player2}</h4>
                <div class="progress-bar">
                    <div class="progress" style="width: ${winRates.player2}%"></div>
                </div>
                <span>${winRates.player2}%</span>
            </div>
        `;
    }

    // 渲染游戏分布
    renderGamesDistribution(distribution) {
        const container = document.getElementById('games-distribution');
        const items = Object.entries(distribution)
            .map(([game, count]) => `
                <div class="distribution-item">
                    <span class="game-name">${game}</span>
                    <div class="progress-bar">
                        <div class="progress" style="width: ${count.percentage}%"></div>
                    </div>
                    <span class="game-count">${count.total}局</span>
                </div>
            `)
            .join('');
        
        container.innerHTML = items;
    }

    // 渲染赌注成功率
    renderBetSuccessRate(betStats) {
        const container = document.getElementById('bet-success-rate');
        const names = this.getPlayerNames();
        
        container.innerHTML = `
            <div class="player-stat">
                <h4>${names.player1}</h4>
                <div class="progress-bar">
                    <div class="progress" style="width: ${betStats.player1}%"></div>
                </div>
                <span>${betStats.player1}%</span>
            </div>
            <div class="player-stat">
                <h4>${names.player2}</h4>
                <div class="progress-bar">
                    <div class="progress" style="width: ${betStats.player2}%"></div>
                </div>
                <span>${betStats.player2}%</span>
            </div>
        `;
    }

    // 渲染设置
    renderSettings(settings) {
        // 渲染游戏列表
        const gamesList = document.getElementById('games-list-settings');
        if (settings.games && settings.games.length > 0) {
            const gamesHtml = settings.games
                .map(game => `
                    <div class="game-setting-item">
                        <span>${game}</span>
                        <button class="icon-btn remove-game" data-game="${game}">
                            <i class="bi bi-x"></i>
                        </button>
                    </div>
                `)
                .join('');
            gamesList.innerHTML = gamesHtml;

            // 添加删除游戏的事件监听
            document.querySelectorAll('.remove-game').forEach(btn => {
                btn.addEventListener('click', (e) => {
                    const game = e.currentTarget.dataset.game;
                    const gameItem = e.currentTarget.parentElement;
                    gameItem.remove();
                    // 更新设置
                    const updatedGames = settings.games.filter(g => g !== game);
                    settings.games = updatedGames;
                    localStorage.setItem('boardgame-tracker-settings', JSON.stringify(settings));
                    // 更新选择列表
                    this.updateGameSelect();
                });
            });
        } else {
            gamesList.innerHTML = '<p>还没有添加常用游戏</p>';
        }
    }

    // 获取玩家名称
    getPlayerNames() {
        return {
            player1: document.getElementById('player1-name').value || '玩家1',
            player2: document.getElementById('player2-name').value || '玩家2'
        };
    }
}

function renderStatistics() {
    const stats = calculateStats();
    const statsContainer = document.querySelector('.stats-container');
    
    statsContainer.innerHTML = `
        <div class="stats-card">
            <h3><i class="fas fa-trophy"></i> 总体战绩</h3>
            <div class="player-stat">
                <h4>玩家胜率</h4>
                <div class="progress-bar">
                    <div class="progress" style="width: ${stats.winRate}%"></div>
                </div>
                <p>
                    <span class="result-icon win-icon">🏆</span> 胜利: ${stats.wins} 场
                    <span class="result-icon lose-icon">💔</span> 失败: ${stats.losses} 场
                </p>
            </div>
        </div>
        
        <div class="stats-card">
            <h3><i class="fas fa-gamepad"></i> 游戏分布</h3>
            ${renderGameDistribution(stats.gameDistribution)}
        </div>
        
        <div class="stats-card">
            <h3><i class="fas fa-shield-alt"></i> 数据安全</h3>
            <div class="security-info">
                <p><i class="fas fa-lock"></i> 所有数据仅存储在您的设备上</p>
                <p><i class="fas fa-user-shield"></i> 其他用户无法访问您的数据</p>
                <p><i class="fas fa-download"></i> 建议定期导出备份您的数据</p>
            </div>
        </div>
    `;
}

function renderGameDistribution(distribution) {
    if (!distribution || Object.keys(distribution).length === 0) {
        return '<p class="text-center">暂无游戏记录</p>';
    }
    
    return Object.entries(distribution)
        .sort(([, a], [, b]) => b - a)
        .map(([game, count]) => `
            <div class="distribution-item">
                <span class="game-name">🎲 ${game}</span>
                <span class="game-count">${count} 场对局</span>
            </div>
        `).join('');
}

function calculateStats() {
    const games = JSON.parse(localStorage.getItem('games') || '[]');
    const stats = {
        wins: 0,
        losses: 0,
        winRate: 0,
        gameDistribution: {}
    };
    
    games.forEach(game => {
        if (game.winner === '玩家') {
            stats.wins++;
        } else {
            stats.losses++;
        }
        
        stats.gameDistribution[game.gameName] = (stats.gameDistribution[game.gameName] || 0) + 1;
    });
    
    const totalGames = stats.wins + stats.losses;
    stats.winRate = totalGames > 0 ? Math.round((stats.wins / totalGames) * 100) : 0;
    
    return stats;
} 