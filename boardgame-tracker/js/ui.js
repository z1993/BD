// UI管理类
class UI {
    constructor() {
        this.modals = document.querySelectorAll('.modal');
        this.pages = document.querySelectorAll('.page');
        this.navButtons = document.querySelectorAll('.nav-btn');
    }

    // 初始化UI
    initializeUI() {
        // 设置默认日期时间
        const now = new Date();
        const dateTimeLocal = now.toISOString().slice(0, 16);
        document.getElementById('game-date').value = dateTimeLocal;
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