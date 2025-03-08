// 数据管理类
class DataManager {
    constructor() {
        this.games = [];
        this.bets = [];
        this.settings = {
            games: [],
            playerNames: {
                player1: '',
                player2: ''
            }
        };
    }

    // 加载保存的数据
    loadData() {
        try {
            const savedGames = localStorage.getItem('boardgame-tracker-games');
            const savedBets = localStorage.getItem('boardgame-tracker-bets');
            const savedSettings = localStorage.getItem('boardgame-tracker-settings');

            if (savedGames) this.games = JSON.parse(savedGames);
            if (savedBets) this.bets = JSON.parse(savedBets);
            if (savedSettings) this.settings = JSON.parse(savedSettings);
        } catch (error) {
            console.error('加载数据时出错:', error);
        }
    }

    // 保存数据到本地存储
    saveData() {
        try {
            localStorage.setItem('boardgame-tracker-games', JSON.stringify(this.games));
            localStorage.setItem('boardgame-tracker-bets', JSON.stringify(this.bets));
            localStorage.setItem('boardgame-tracker-settings', JSON.stringify(this.settings));
        } catch (error) {
            console.error('保存数据时出错:', error);
        }
    }

    // 获取所有游戏
    getGames() {
        return this.games.sort((a, b) => new Date(b.date) - new Date(a.date));
    }

    // 添加游戏
    addGame(gameData) {
        // 验证必要字段
        if (!gameData.gameName || !gameData.winner) {
            throw new Error('游戏名称和胜者是必填项');
        }

        this.games.push(gameData);
        
        // 如果是新游戏，添加到常用游戏列表
        if (!this.settings.games.includes(gameData.gameName)) {
            this.settings.games.push(gameData.gameName);
        }
        
        this.saveData();
        return gameData;
    }

    // 删除游戏
    deleteGame(gameId) {
        this.games = this.games.filter(game => game.id !== gameId);
        this.saveData();
    }

    // 获取所有赌注
    getBets() {
        return this.bets.sort((a, b) => {
            if (a.status === 'active' && b.status !== 'active') return -1;
            if (a.status !== 'active' && b.status === 'active') return 1;
            return 0;
        });
    }

    // 添加赌注
    addBet(betData) {
        this.bets.push(betData);
        this.saveData();
    }

    // 更新赌注进度
    updateBetProgress(betId, gameData) {
        const bet = this.bets.find(b => b.id === betId);
        if (!bet) return;

        switch (bet.type) {
            case 'single':
                bet.status = 'completed';
                break;
            case 'series':
                bet.conditions.currentWins++;
                if (bet.conditions.currentWins >= bet.conditions.targetWins) {
                    bet.status = 'completed';
                }
                break;
            case 'score':
                const deadline = new Date(bet.conditions.deadline);
                if (new Date() > deadline) {
                    bet.status = 'completed';
                }
                break;
        }

        this.saveData();
    }

    // 删除赌注
    deleteBet(betId) {
        this.bets = this.bets.filter(bet => bet.id !== betId);
        this.saveData();
    }

    // 计算统计数据
    calculateStats() {
        const stats = {
            winRates: this.calculateWinRates(),
            gamesDistribution: this.calculateGamesDistribution(),
            betStats: this.calculateBetStats()
        };
        return stats;
    }

    // 计算胜率
    calculateWinRates() {
        const totalGames = this.games.length;
        if (totalGames === 0) {
            return { player1: 0, player2: 0 };
        }

        const player1Wins = this.games.filter(game => game.winner === 'player1').length;
        const player2Wins = totalGames - player1Wins;

        return {
            player1: Math.round((player1Wins / totalGames) * 100),
            player2: Math.round((player2Wins / totalGames) * 100)
        };
    }

    // 计算游戏分布
    calculateGamesDistribution() {
        const distribution = {};
        const totalGames = this.games.length;

        this.games.forEach(game => {
            if (!distribution[game.gameName]) {
                distribution[game.gameName] = { total: 0, percentage: 0 };
            }
            distribution[game.gameName].total++;
        });

        // 计算百分比
        Object.values(distribution).forEach(stats => {
            stats.percentage = Math.round((stats.total / totalGames) * 100);
        });

        return distribution;
    }

    // 计算赌注统计
    calculateBetStats() {
        const completedBets = this.bets.filter(bet => bet.status === 'completed');
        if (completedBets.length === 0) {
            return { player1: 0, player2: 0 };
        }

        const player1Wins = completedBets.filter(bet => {
            const lastGame = this.games.find(game => game.betId === bet.id);
            return lastGame && lastGame.winner === 'player1';
        }).length;

        const totalBets = completedBets.length;
        const player2Wins = totalBets - player1Wins;

        return {
            player1: Math.round((player1Wins / totalBets) * 100),
            player2: Math.round((player2Wins / totalBets) * 100)
        };
    }

    // 获取设置
    getSettings() {
        return this.settings;
    }

    // 获取玩家名称
    getPlayerNames() {
        return this.settings.playerNames;
    }

    // 保存玩家名称
    savePlayerNames(names) {
        this.settings.playerNames = names;
        this.saveData();
    }

    // 导出数据
    exportData() {
        const data = {
            games: this.games,
            bets: this.bets,
            settings: this.settings,
            exportDate: new Date().toISOString()
        };

        // 创建格式化的JSON字符串
        const jsonString = JSON.stringify(data, null, 2);
        
        // 创建Blob
        const blob = new Blob([jsonString], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        
        // 创建下载链接
        const a = document.createElement('a');
        const date = new Date().toISOString().slice(0, 10);
        a.href = url;
        a.download = `boardgame-tracker-backup-${date}.json`;
        
        // 添加到页面并触发下载
        document.body.appendChild(a);
        a.click();
        
        // 清理
        document.body.removeChild(a);
        URL.revokeObjectURL(url);

        // 显示提示
        alert('数据导出成功！文件名：' + a.download);
    }

    // 导入数据
    importData() {
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = '.json';
        
        input.onchange = (e) => {
            const file = e.target.files[0];
            if (!file) return;

            const reader = new FileReader();
            reader.onload = (event) => {
                try {
                    const data = JSON.parse(event.target.result);
                    
                    // 验证数据格式
                    if (!data.games || !data.bets || !data.settings) {
                        throw new Error('无效的数据格式');
                    }

                    // 备份当前数据
                    const backup = {
                        games: this.games,
                        bets: this.bets,
                        settings: this.settings,
                        backupDate: new Date().toISOString()
                    };
                    localStorage.setItem('boardgame-tracker-backup', JSON.stringify(backup));

                    // 导入新数据
                    this.games = data.games || [];
                    this.bets = data.bets || [];
                    this.settings = data.settings || {
                        games: [],
                        playerNames: { player1: '', player2: '' }
                    };
                    this.saveData();

                    alert('数据导入成功！如果出现问题，可以使用之前的备份恢复。');
                    location.reload();
                } catch (error) {
                    console.error('导入数据时出错:', error);
                    alert('导入失败，请确保文件格式正确');
                }
            };
            reader.readAsText(file);
        };

        input.click();
    }

    // 清除所有数据
    clearData() {
        this.games = [];
        this.bets = [];
        this.settings = {
            games: [],
            playerNames: {
                player1: '',
                player2: ''
            }
        };
        this.saveData();
    }
} 