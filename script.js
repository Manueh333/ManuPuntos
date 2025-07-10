// ManuPuntos - Simplified Point Tracker Application
class ManuPuntos {
    constructor() {
        this.entries = [];
        this.currentScore = 0;
        this.chart = null;
        this.missions = [];
        this.firebase = null;
        this.database = null;
        
        // Initialize when DOM is loaded
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => this.init());
        } else {
            this.init();
        }
    }

    init() {
        console.log('Initializing ManuPuntos...');
        this.initializeElements();
        this.setupEventListeners();
        this.initializeFirebase();
        this.loadData();
        this.initializeChart();
        this.initializeTheme();
        this.updateDisplay();
        this.updateHistory();
        this.updateMissions();
        console.log('ManuPuntos initialized successfully');
    }

    initializeElements() {
        // Core elements
        this.scoreElement = document.getElementById('currentScore');
        this.reasonInput = document.getElementById('reason');
        this.historyList = document.getElementById('historyList');
        this.chartCanvas = document.getElementById('progressChart');
        this.themeToggle = document.getElementById('themeToggle');
        this.missionsList = document.getElementById('missionsList');
        
        // Buttons
        this.positiveBtn = document.getElementById('positiveBtn');
        this.neutralBtn = document.getElementById('neutralBtn');
        this.negativeBtn = document.getElementById('negativeBtn');
        this.bulkAddBtn = document.getElementById('bulkAddBtn');
        this.clearHistoryBtn = document.getElementById('clearHistoryBtn');
        this.addMissionBtn = document.getElementById('addMissionBtn');
        
        // Bulk inputs
        this.bulkQuantityInput = document.getElementById('bulkQuantity');
        this.bulkTypeSelect = document.getElementById('bulkType');
        
        console.log('Elements initialized:', {
            scoreElement: !!this.scoreElement,
            positiveBtn: !!this.positiveBtn,
            themeToggle: !!this.themeToggle
        });
    }

    setupEventListeners() {
        console.log('Setting up event listeners...');
        
        // Point buttons
        if (this.positiveBtn) {
            this.positiveBtn.addEventListener('click', () => this.addPoints(1, 'positive'));
        }
        if (this.neutralBtn) {
            this.neutralBtn.addEventListener('click', () => this.addPoints(0, 'neutral'));
        }
        if (this.negativeBtn) {
            this.negativeBtn.addEventListener('click', () => this.addPoints(-1, 'negative'));
        }
        
        // Bulk operations
        if (this.bulkAddBtn) {
            this.bulkAddBtn.addEventListener('click', () => this.addBulkPoints());
        }
        
        // Other buttons
        if (this.clearHistoryBtn) {
            this.clearHistoryBtn.addEventListener('click', () => this.clearHistory());
        }
        if (this.themeToggle) {
            this.themeToggle.addEventListener('click', () => this.toggleTheme());
        }
        if (this.addMissionBtn) {
            this.addMissionBtn.addEventListener('click', () => this.addMission());
        }
        
        console.log('Event listeners setup complete');
    }

    addPoints(pointValue, type) {
        const reason = this.reasonInput ? this.reasonInput.value.trim() : '';
        
        if (!reason) {
            alert('Please enter a reason for this point.');
            if (this.reasonInput) this.reasonInput.focus();
            return;
        }

        console.log(`Adding ${pointValue} points of type ${type}`);

        const entry = {
            id: Date.now(),
            points: pointValue,
            type: type,
            reason: reason,
            timestamp: new Date().toISOString(),
            runningTotal: this.currentScore + pointValue
        };

        this.entries.push(entry);
        this.currentScore += pointValue;
        
        // Check missions
        this.checkMissionProgress(entry);
        
        this.saveData();
        this.updateDisplay();
        this.updateChart();
        this.updateHistory();
        this.updateMissions();
        this.animateScore();
        
        // Clear input
        if (this.reasonInput) {
            this.reasonInput.value = '';
        }
        
        console.log('Points added successfully. New score:', this.currentScore);
    }

    addBulkPoints() {
        const quantity = parseInt(this.bulkQuantityInput?.value);
        const type = this.bulkTypeSelect?.value;
        const reason = this.reasonInput ? this.reasonInput.value.trim() : '';

        if (!quantity || quantity <= 0) {
            alert('Please enter a valid quantity.');
            if (this.bulkQuantityInput) this.bulkQuantityInput.focus();
            return;
        }

        if (!reason) {
            alert('Please enter a reason for these points.');
            if (this.reasonInput) this.reasonInput.focus();
            return;
        }

        let pointValue = 0;
        switch (type) {
            case 'positive': pointValue = 1; break;
            case 'negative': pointValue = -1; break;
            case 'neutral': pointValue = 0; break;
        }

        const totalPoints = pointValue * quantity;
        const entry = {
            id: Date.now(),
            points: totalPoints,
            type: type,
            reason: `${reason} (${quantity} ${type} points)`,
            timestamp: new Date().toISOString(),
            runningTotal: this.currentScore + totalPoints,
            isBulk: true,
            bulkQuantity: quantity
        };

        this.entries.push(entry);
        this.currentScore += totalPoints;
        
        this.checkMissionProgress(entry);
        
        this.saveData();
        this.updateDisplay();
        this.updateChart();
        this.updateHistory();
        this.updateMissions();
        this.animateScore();

        // Clear inputs
        if (this.bulkQuantityInput) this.bulkQuantityInput.value = '';
        if (this.reasonInput) this.reasonInput.value = '';
    }

    updateDisplay() {
        if (this.scoreElement) {
            this.scoreElement.textContent = this.currentScore;
            this.scoreElement.classList.remove('negative');
            
            if (this.currentScore < 0) {
                this.scoreElement.classList.add('negative');
            }
        }
    }

    animateScore() {
        if (this.scoreElement) {
            this.scoreElement.classList.remove('animate');
            setTimeout(() => {
                this.scoreElement.classList.add('animate');
            }, 10);
        }
    }

    initializeChart() {
        if (!this.chartCanvas) {
            console.error('Chart canvas not found');
            return;
        }
        
        const ctx = this.chartCanvas.getContext('2d');
        
        this.chart = new Chart(ctx, {
            type: 'line',
            data: {
                labels: [],
                datasets: [{
                    label: 'Score Over Time',
                    data: [],
                    borderColor: '#4CAF50',
                    backgroundColor: 'rgba(76, 175, 80, 0.1)',
                    borderWidth: 3,
                    fill: true,
                    tension: 0.4
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    title: {
                        display: true,
                        text: 'Score Progress Over Time'
                    },
                    legend: {
                        display: false
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true
                    }
                }
            }
        });

        this.updateChart();
    }

    updateChart() {
        if (!this.chart) return;

        const labels = [];
        const data = [];
        let runningTotal = 0;

        if (this.entries.length > 0) {
            labels.push('Start');
            data.push(0);
        }

        this.entries.forEach(entry => {
            runningTotal += entry.points;
            const date = new Date(entry.timestamp);
            const label = date.toLocaleString('en-US', {
                month: 'short',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
            });
            labels.push(label);
            data.push(runningTotal);
        });

        this.chart.data.labels = labels;
        this.chart.data.datasets[0].data = data;
        this.chart.update('none');
    }

    updateHistory() {
        if (!this.historyList) return;
        
        if (this.entries.length === 0) {
            this.historyList.innerHTML = '<div class="empty-history">No entries yet. Add some points to get started!</div>';
            return;
        }

        const recentEntries = this.entries.slice(-10).reverse();
        const historyHTML = recentEntries.map(entry => {
            const date = new Date(entry.timestamp);
            const formattedDate = date.toLocaleString('en-US', {
                weekday: 'short',
                year: 'numeric',
                month: 'short',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
            });

            let pointsText = '';
            let pointsClass = '';
            
            if (entry.isBulk) {
                switch (entry.type) {
                    case 'positive':
                        pointsText = `+${entry.points}`;
                        pointsClass = 'positive';
                        break;
                    case 'negative':
                        pointsText = `${entry.points}`;
                        pointsClass = 'negative';
                        break;
                    case 'neutral':
                        pointsText = `${entry.points}`;
                        pointsClass = 'neutral';
                        break;
                }
            } else {
                switch (entry.type) {
                    case 'positive':
                        pointsText = '+1';
                        pointsClass = 'positive';
                        break;
                    case 'negative':
                        pointsText = '-1';
                        pointsClass = 'negative';
                        break;
                    case 'neutral':
                        pointsText = '0';
                        pointsClass = 'neutral';
                        break;
                }
            }

            return `
                <div class="history-item ${entry.type}">
                    <div class="history-item-header">
                        <span class="history-item-points ${pointsClass}">${pointsText}</span>
                        <span class="history-item-date">${formattedDate}</span>
                    </div>
                    <div class="history-item-reason">${entry.reason}</div>
                </div>
            `;
        }).join('');

        this.historyList.innerHTML = historyHTML;
    }

    clearHistory() {
        if (this.entries.length === 0) {
            alert('No history to clear.');
            return;
        }

        const password = prompt('Enter password to clear history:');
        if (password !== 'ManuPuntos2025') {
            alert('Incorrect password. History not cleared.');
            return;
        }

        if (confirm('Are you sure you want to clear all history? This action cannot be undone.')) {
            this.entries = [];
            this.currentScore = 0;
            this.saveData();
            this.updateDisplay();
            this.updateChart();
            this.updateHistory();
            this.updateMissions();
            alert('History cleared successfully!');
        }
    }

    // Missions System
    addMission() {
        const title = prompt('Enter mission title:');
        if (!title || !title.trim()) return;
        
        const description = prompt('Enter mission description:');
        if (!description || !description.trim()) return;
        
        const targetStr = prompt('Enter target number (e.g., 10 for "do something 10 times"):');
        const target = parseInt(targetStr);
        if (isNaN(target) || target <= 0) {
            alert('Please enter a valid target number.');
            return;
        }
        
        const rewardStr = prompt('Enter reward points:');
        const reward = parseInt(rewardStr);
        if (isNaN(reward) || reward <= 0) {
            alert('Please enter a valid reward amount.');
            return;
        }
        
        const conditionOptions = [
            'total_score - Based on reaching total score',
            'total_entries - Based on total number of entries',
            'positive_points - Based on positive points added',
            'detailed_reasons - Based on detailed reasons (20+ chars)'
        ];
        
        const conditionChoice = prompt('Choose condition type:\n\n' + conditionOptions.join('\n') + '\n\nEnter the condition name (e.g., "total_score"):');
        
        const validConditions = ['total_score', 'total_entries', 'positive_points', 'detailed_reasons'];
        if (!validConditions.includes(conditionChoice)) {
            alert('Invalid condition. Please choose from: ' + validConditions.join(', '));
            return;
        }
        
        const mission = {
            id: Date.now(),
            title: title.trim(),
            description: description.trim(),
            target: target,
            progress: 0,
            condition: conditionChoice,
            reward: reward,
            completed: false
        };
        
        this.missions.push(mission);
        this.saveData();
        this.updateMissions();
        alert('Mission added successfully!');
    }

    checkMissionProgress(entry) {
        this.missions.forEach(mission => {
            if (mission.completed) return;
            
            switch (mission.condition) {
                case 'total_score':
                    mission.progress = Math.max(mission.progress, this.currentScore);
                    break;
                    
                case 'total_entries':
                    mission.progress = this.entries.length;
                    break;
                    
                case 'positive_points':
                    if (entry.type === 'positive') {
                        mission.progress = Math.min(mission.progress + (entry.isBulk ? entry.bulkQuantity : 1), mission.target);
                    }
                    break;
                    
                case 'detailed_reasons':
                    if (entry.reason.length >= 20) {
                        mission.progress = Math.min(mission.progress + 1, mission.target);
                    }
                    break;
            }
            
            // Check if mission is completed
            if (mission.progress >= mission.target && !mission.completed) {
                mission.completed = true;
                this.currentScore += mission.reward;
                this.showMissionCompletedNotification(mission);
            }
        });
    }

    updateMissions() {
        if (!this.missionsList) return;
        
        if (this.missions.length === 0) {
            this.missionsList.innerHTML = '<p style="text-align: center; color: var(--text-muted); padding: 20px;">No missions created yet. Add some missions to track your progress!</p>';
            return;
        }
        
        const missionsHTML = this.missions.map(mission => {
            const progressPercentage = (mission.progress / mission.target) * 100;
            const isCompleted = mission.completed;
            
            return `
                <div class="mission-card ${isCompleted ? 'completed' : ''}">
                    <button class="delete-mission-btn" onclick="app.deleteMission(${mission.id})">×</button>
                    <div class="mission-header">
                        <h4 class="mission-title">${mission.title}</h4>
                        <div class="mission-reward">+${mission.reward} pts</div>
                    </div>
                    <p class="mission-description">${mission.description}</p>
                    <div class="mission-progress">
                        <div class="mission-progress-bar">
                            <div class="mission-progress-fill" style="width: ${progressPercentage}%"></div>
                        </div>
                        <span class="mission-progress-text">${mission.progress}/${mission.target}</span>
                    </div>
                    <div class="mission-status">
                        ${isCompleted ? '✅ Completed!' : '🎯 In Progress'}
                    </div>
                </div>
            `;
        }).join('');
        
        this.missionsList.innerHTML = missionsHTML;
    }

    deleteMission(missionId) {
        const missionIndex = this.missions.findIndex(m => m.id === missionId);
        if (missionIndex > -1) {
            const mission = this.missions[missionIndex];
            if (confirm(`Delete mission "${mission.title}"?`)) {
                this.missions.splice(missionIndex, 1);
                this.saveData();
                this.updateMissions();
            }
        }
    }

    showMissionCompletedNotification(mission) {
        const popup = document.createElement('div');
        popup.style.cssText = `
            position: fixed;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            background: linear-gradient(135deg, var(--accent-primary), var(--success));
            color: white;
            padding: 30px;
            border-radius: 20px;
            box-shadow: var(--shadow-heavy);
            z-index: 10000;
            text-align: center;
            animation: missionPopup 0.5s ease-out;
        `;
        
        popup.innerHTML = `
            <div style="font-size: 3rem; margin-bottom: 15px;">🎯</div>
            <h2 style="margin: 0 0 10px 0;">Mission Completed!</h2>
            <p style="margin: 0 0 10px 0; font-size: 1.2rem;">${mission.title}</p>
            <p style="margin: 0; font-weight: 600;">+${mission.reward} points earned!</p>
        `;
        
        document.body.appendChild(popup);
        setTimeout(() => {
            popup.remove();
        }, 3000);
        
        // Add CSS animation if not exists
        if (!document.getElementById('mission-style')) {
            const style = document.createElement('style');
            style.id = 'mission-style';
            style.textContent = `
                @keyframes missionPopup {
                    0% { transform: translate(-50%, -50%) scale(0); opacity: 0; }
                    50% { transform: translate(-50%, -50%) scale(1.1); }
                    100% { transform: translate(-50%, -50%) scale(1); opacity: 1; }
                }
            `;
            document.head.appendChild(style);
        }
    }

    // Theme management
    initializeTheme() {
        const savedTheme = localStorage.getItem('manuPuntosTheme') || 'light';
        console.log('Initializing theme. Saved theme:', savedTheme);
        this.setTheme(savedTheme);
    }

    toggleTheme() {
        console.log('Toggling theme...');
        const currentTheme = document.documentElement.getAttribute('data-theme') || 'light';
        const newTheme = currentTheme === 'light' ? 'dark' : 'light';
        this.setTheme(newTheme);
    }

    setTheme(theme) {
        console.log('Setting theme to:', theme);
        document.documentElement.setAttribute('data-theme', theme);
        localStorage.setItem('manuPuntosTheme', theme);
        
        // Update theme icon
        if (this.themeToggle) {
            const themeIcon = this.themeToggle.querySelector('.theme-icon');
            if (themeIcon) {
                themeIcon.textContent = theme === 'light' ? '🌙' : '☀️';
            }
        }
        
        // Update chart colors if chart exists
        if (this.chart) {
            this.updateChartTheme(theme);
        }
    }

    updateChartTheme(theme) {
        const isDark = theme === 'dark';
        const textColor = isDark ? '#f7fafc' : '#2d3748';
        const gridColor = isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)';
        
        if (this.chart && this.chart.options) {
            this.chart.options.plugins.title.color = textColor;
            this.chart.options.scales.x.ticks.color = textColor;
            this.chart.options.scales.y.ticks.color = textColor;
            this.chart.options.scales.x.grid.color = gridColor;
            this.chart.options.scales.y.grid.color = gridColor;
            
            this.chart.update();
        }
    }

    // Firebase initialization and cloud sync
    initializeFirebase() {
        const firebaseConfig = {
            apiKey: "AIzaSyDbVa7lWGhClZD4mumRGtu7Rl_wUWABriY",
            authDomain: "manupuntos-web.firebaseapp.com",
            databaseURL: "https://manupuntos-web-default-rtdb.europe-west1.firebasedatabase.app/",
            projectId: "manupuntos-web",
            storageBucket: "manupuntos-web.firebasestorage.app",
            messagingSenderId: "610732590615",
            appId: "1:610732590615:web:ceb4539533dfa83e9a3e52"
        };

        try {
            if (typeof firebase !== 'undefined') {
                firebase.initializeApp(firebaseConfig);
                this.database = firebase.database();
                
                // Enable auto-sync
                this.setupCloudSync();
                this.loadFromCloud();
                
                // Sync every 5 seconds
                setInterval(() => {
                    this.syncToCloud();
                }, 5000);
                
                console.log('Firebase initialized successfully');
            } else {
                console.warn('Firebase not loaded, using local storage only');
            }
        } catch (error) {
            console.error('Firebase initialization failed:', error);
        }
    }

    async syncToCloud() {
        if (!this.database) return;
        
        try {
            const data = {
                entries: this.entries,
                currentScore: this.currentScore,
                missions: this.missions,
                lastUpdated: new Date().toISOString()
            };
            
            await this.database.ref('manupuntos').set(data);
        } catch (error) {
            console.error('Cloud sync failed:', error);
        }
    }

    async loadFromCloud() {
        if (!this.database) return;
        
        try {
            const snapshot = await this.database.ref('manupuntos').once('value');
            const cloudData = snapshot.val();
            
            if (cloudData && cloudData.entries) {
                const localLastUpdated = new Date(localStorage.getItem('manuPuntosLastUpdated') || '1970-01-01');
                const cloudLastUpdated = new Date(cloudData.lastUpdated || '1970-01-01');
                
                if (cloudLastUpdated > localLastUpdated) {
                    this.entries = cloudData.entries || [];
                    this.currentScore = cloudData.currentScore || 0;
                    this.missions = cloudData.missions || [];
                    this.updateDisplay();
                    this.updateChart();
                    this.updateHistory();
                    this.updateMissions();
                }
            }
        } catch (error) {
            console.error('Failed to load from cloud:', error);
        }
    }

    setupCloudSync() {
        if (!this.database) return;
        
        this.database.ref('manupuntos').on('value', (snapshot) => {
            const cloudData = snapshot.val();
            if (cloudData && cloudData.entries) {
                const cloudLastUpdated = new Date(cloudData.lastUpdated || '1970-01-01');
                const localLastUpdated = new Date(localStorage.getItem('manuPuntosLastUpdated') || '1970-01-01');
                
                if (cloudLastUpdated > localLastUpdated && 
                    Math.abs(cloudLastUpdated - new Date()) > 3000) {
                    
                    this.entries = cloudData.entries || [];
                    this.currentScore = cloudData.currentScore || 0;
                    this.missions = cloudData.missions || [];
                    this.updateDisplay();
                    this.updateChart();
                    this.updateHistory();
                    this.updateMissions();
                }
            }
        });
    }

    // Data persistence
    saveData() {
        const now = new Date().toISOString();
        const data = {
            entries: this.entries,
            currentScore: this.currentScore,
            missions: this.missions,
            lastUpdated: now
        };
        localStorage.setItem('manuPuntosData', JSON.stringify(data));
        localStorage.setItem('manuPuntosLastUpdated', now);
        this.syncToCloud();
    }

    loadData() {
        const savedData = localStorage.getItem('manuPuntosData');
        if (savedData) {
            try {
                const data = JSON.parse(savedData);
                this.entries = data.entries || [];
                this.currentScore = data.currentScore || 0;
                this.missions = data.missions || [];
            } catch (error) {
                console.error('Error loading saved data:', error);
                this.entries = [];
                this.currentScore = 0;
                this.missions = [];
            }
        }
    }
}

// Initialize the application
window.app = new ManuPuntos();

