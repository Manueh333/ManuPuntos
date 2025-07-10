// ManuPuntos - Point Tracker Application
class ManuPuntos {
    constructor() {
        this.users = { 'Manu': { entries: [], currentScore: 0 } };
        this.currentUser = 'Manu';
        this.chart = null;
        this.cloudSyncEnabled = false;
        this.firebase = null;
        this.database = null;
        this.clearHistoryPassword = 'ManuPuntos2025'; // Change this to your preferred password
        this.initializeElements();
        this.initializeFirebase();
        this.loadData();
        this.setupEventListeners();
        this.switchUser('Manu');
        this.initializeChart();
    }

    initializeElements() {
        this.scoreElement = document.getElementById('currentScore');
        this.reasonInput = document.getElementById('reason');
        this.positiveBtn = document.getElementById('positiveBtn');
        this.neutralBtn = document.getElementById('neutralBtn');
        this.negativeBtn = document.getElementById('negativeBtn');
        this.bulkQuantityInput = document.getElementById('bulkQuantity');
        this.bulkTypeSelect = document.getElementById('bulkType');
        this.bulkAddBtn = document.getElementById('bulkAddBtn');
        this.clearHistoryBtn = document.getElementById('clearHistoryBtn');
        this.historyList = document.getElementById('historyList');
        this.chartCanvas = document.getElementById('progressChart');
        this.userSelector = document.getElementById('currentUser');
        this.addUserBtn = document.getElementById('addUserBtn');
        this.allUsersStats = document.getElementById('allUsersStats');
        this.syncStatus = document.getElementById('syncStatus');
    }

    setupEventListeners() {
        this.positiveBtn.addEventListener('click', () => this.addPoints(1, 'positive'));
        this.neutralBtn.addEventListener('click', () => this.addPoints(0, 'neutral'));
        this.negativeBtn.addEventListener('click', () => this.addPoints(-1, 'negative'));
        this.bulkAddBtn.addEventListener('click', () => this.addBulkPoints());
        this.clearHistoryBtn.addEventListener('click', () => this.clearHistory());
        this.userSelector.addEventListener('change', (e) => this.switchUser(e.target.value));
        this.addUserBtn.addEventListener('click', () => this.addNewUser());
        
        // Clear reason input after adding points
        [this.positiveBtn, this.neutralBtn, this.negativeBtn].forEach(btn => {
            btn.addEventListener('click', () => {
                setTimeout(() => {
                    this.reasonInput.value = '';
                }, 100);
            });
        });
    }

    addPoints(pointValue, type) {
        const reason = this.reasonInput.value.trim();
        
        if (!reason) {
            alert('Please enter a reason for this point.');
            this.reasonInput.focus();
            return;
        }

        const entry = {
            id: Date.now(),
            points: pointValue,
            type: type,
            reason: reason,
            timestamp: new Date().toISOString(),
            runningTotal: this.users[this.currentUser].currentScore + pointValue,
            user: this.currentUser
        };

        this.users[this.currentUser].entries.push(entry);
        this.users[this.currentUser].currentScore += pointValue;
        this.saveData();
        this.updateDisplay();
        this.updateChart();
        this.updateHistory();
        this.animateScore();
    }

    addBulkPoints() {
        const quantity = parseInt(this.bulkQuantityInput.value);
        const type = this.bulkTypeSelect.value;
        const reason = this.reasonInput.value.trim();

        if (!quantity || quantity <= 0) {
            alert('Please enter a valid quantity.');
            this.bulkQuantityInput.focus();
            return;
        }

        if (!reason) {
            alert('Please enter a reason for these points.');
            this.reasonInput.focus();
            return;
        }

        let pointValue = 0;
        switch (type) {
            case 'positive':
                pointValue = 1;
                break;
            case 'negative':
                pointValue = -1;
                break;
            case 'neutral':
                pointValue = 0;
                break;
        }

        const totalPoints = pointValue * quantity;
        const entry = {
            id: Date.now(),
            points: totalPoints,
            type: type,
            reason: `${reason} (${quantity} ${type} points)`,
            timestamp: new Date().toISOString(),
            runningTotal: this.users[this.currentUser].currentScore + totalPoints,
            isBulk: true,
            bulkQuantity: quantity,
            user: this.currentUser
        };

        this.users[this.currentUser].entries.push(entry);
        this.users[this.currentUser].currentScore += totalPoints;
        this.saveData();
        this.updateDisplay();
        this.updateChart();
        this.updateHistory();
        this.animateScore();

        // Clear bulk inputs
        this.bulkQuantityInput.value = '';
        this.reasonInput.value = '';
    }

    updateDisplay() {
        const currentScore = this.users[this.currentUser].currentScore;
        this.scoreElement.textContent = currentScore;
        this.scoreElement.classList.remove('negative');
        
        if (currentScore < 0) {
            this.scoreElement.classList.add('negative');
        }
        
        this.updateAllUsersStats();
    }

    animateScore() {
        this.scoreElement.classList.remove('animate');
        setTimeout(() => {
            this.scoreElement.classList.add('animate');
        }, 10);
    }

    initializeChart() {
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
                    tension: 0.4,
                    pointBackgroundColor: '#4CAF50',
                    pointBorderColor: '#fff',
                    pointBorderWidth: 2,
                    pointRadius: 6,
                    pointHoverRadius: 8
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                aspectRatio: 2,
                interaction: {
                    intersect: false,
                    mode: 'index'
                },
                plugins: {
                    title: {
                        display: true,
                        text: 'Score Progress Over Time',
                        font: {
                            size: 16,
                            weight: 'bold'
                        }
                    },
                    legend: {
                        display: false
                    },
                    tooltip: {
                        callbacks: {
                            title: function(context) {
                                return context[0].label;
                            },
                            label: (context) => {
                                const dataIndex = context.dataIndex;
                                const entries = this.users[this.currentUser].entries;
                                // Adjust for the "Start" point at index 0
                                const entryIndex = dataIndex === 0 ? -1 : dataIndex - 1;
                                const entry = entryIndex >= 0 ? entries[entryIndex] : null;
                                
                                if (dataIndex === 0) {
                                    return `Starting Score: ${context.parsed.y}`;
                                }
                                
                                return [
                                    `Score: ${context.parsed.y}`,
                                    `Reason: ${entry ? entry.reason : 'N/A'}`
                                ];
                            }
                        },
                        backgroundColor: 'rgba(0, 0, 0, 0.8)',
                        titleColor: '#fff',
                        bodyColor: '#fff',
                        borderColor: '#4CAF50',
                        borderWidth: 1
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        grid: {
                            color: 'rgba(0, 0, 0, 0.1)'
                        },
                        ticks: {
                            font: {
                                size: 12
                            }
                        }
                    },
                    x: {
                        grid: {
                            color: 'rgba(0, 0, 0, 0.1)'
                        },
                        ticks: {
                            font: {
                                size: 12
                            },
                            maxRotation: 45
                        }
                    }
                }
            }
        });

        this.updateChart();
    }

    updateChart() {
        if (!this.chart) return;

        const entries = this.users[this.currentUser].entries;
        const labels = [];
        const data = [];
        let runningTotal = 0;

        // Add initial point if we have entries
        if (entries.length > 0) {
            labels.push('Start');
            data.push(0);
        }

        entries.forEach(entry => {
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
        const entries = this.users[this.currentUser].entries;
        if (entries.length === 0) {
            this.historyList.innerHTML = '<div class="empty-history">No entries yet. Add some points to get started!</div>';
            return;
        }

        const recentEntries = entries.slice(-10).reverse();
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
        const entries = this.users[this.currentUser].entries;
        if (entries.length === 0) {
            alert('No history to clear.');
            return;
        }

        const password = prompt(`Enter password to clear history for ${this.currentUser}:`);
        if (password !== this.clearHistoryPassword) {
            alert('Incorrect password. History not cleared.');
            return;
        }

        if (confirm(`Are you sure you want to clear all history for ${this.currentUser}? This action cannot be undone.`)) {
            this.users[this.currentUser].entries = [];
            this.users[this.currentUser].currentScore = 0;
            this.saveData();
            this.syncToCloud();
            this.updateDisplay();
            this.updateChart();
            this.updateHistory();
            alert('History cleared successfully!');
        }
    }

    saveData() {
        const now = new Date().toISOString();
        const data = {
            users: this.users,
            currentUser: this.currentUser,
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
                this.users = data.users || { 'Manu': { entries: [], currentScore: 0 } };
                this.currentUser = data.currentUser || 'Manu';
                
                // Ensure all users have proper structure
                Object.keys(this.users).forEach(userName => {
                    if (!this.users[userName].entries) this.users[userName].entries = [];
                    if (typeof this.users[userName].currentScore !== 'number') this.users[userName].currentScore = 0;
                });
                
                // Update user selector with loaded users
                this.updateUserSelector();
                
            } catch (error) {
                console.error('Error loading saved data:', error);
                this.users = { 'Manu': { entries: [], currentScore: 0 } };
                this.currentUser = 'Manu';
            }
        }
    }


    // Firebase initialization and cloud sync functionality
    initializeFirebase() {
        // Firebase configuration for ManuPuntos
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
                // Initialize Firebase
                firebase.initializeApp(firebaseConfig);
                this.database = firebase.database();
                
                // Auto-enable sync for everyone (no sync keys needed)
                this.cloudSyncEnabled = true;
                this.setupCloudSync();
                this.loadFromCloud();
                
                this.updateSyncStatus('🌐 Connected - Data synced across all devices');
                console.log('Firebase initialized successfully');
            } else {
                console.warn('Firebase not loaded, using local storage only');
                this.updateSyncStatus('💾 Local storage only - No sync');
            }
        } catch (error) {
            console.error('Firebase initialization failed:', error);
            this.updateSyncStatus('❌ Firebase failed - Using local storage');
        }
    }

    updateSyncStatus(message) {
        if (this.syncStatus) {
            this.syncStatus.textContent = message;
            this.syncStatus.className = 'sync-status ' + 
                (message.includes('✅') ? 'success' : 
                 message.includes('❌') ? 'error' : 
                 message.includes('⚠️') ? 'warning' : 'info');
        }
    }

    async syncToCloud() {
        if (!this.cloudSyncEnabled || !this.database) {
            return;
        }
        
        try {
            this.updateSyncStatus('📤 Syncing...');
            
            const data = {
                users: this.users,
                currentUser: this.currentUser,
                lastUpdated: new Date().toISOString()
            };
            
            await this.database.ref('manupuntos').set(data);
            this.updateSyncStatus('✅ Synced successfully');
            
            // Clear status after 3 seconds
            setTimeout(() => {
                this.updateSyncStatus('🌐 Cloud sync enabled');
            }, 3000);
            
        } catch (error) {
            console.error('Cloud sync failed:', error);
            this.updateSyncStatus('❌ Sync failed: ' + error.message);
        }
    }

    async loadFromCloud() {
        if (!this.cloudSyncEnabled || !this.database) {
            return;
        }
        
        try {
            this.updateSyncStatus('📥 Loading from cloud...');
            
            const snapshot = await this.database.ref('manupuntos').once('value');
            const cloudData = snapshot.val();
            
            if (cloudData && cloudData.users) {
                // Merge cloud data with local data
                const localLastUpdated = new Date(localStorage.getItem('manuPuntosLastUpdated') || '1970-01-01');
                const cloudLastUpdated = new Date(cloudData.lastUpdated || '1970-01-01');
                
                if (cloudLastUpdated > localLastUpdated) {
                    this.users = cloudData.users;
                    this.currentUser = cloudData.currentUser || 'Manu';
                    this.updateUserSelector();
                    this.switchUser(this.currentUser);
                    this.updateSyncStatus('✅ Data loaded from cloud');
                } else {
                    this.updateSyncStatus('ℹ️ Local data is newer');
                }
            } else {
                this.updateSyncStatus('ℹ️ No cloud data found');
            }
            
        } catch (error) {
            console.error('Failed to load from cloud:', error);
            this.updateSyncStatus('❌ Failed to load from cloud');
        }
    }

    setupCloudSync() {
        if (!this.database) return;
        
        // Listen for real-time changes from all devices
        this.database.ref('manupuntos').on('value', (snapshot) => {
            const cloudData = snapshot.val();
            if (cloudData && cloudData.users) {
                const cloudLastUpdated = new Date(cloudData.lastUpdated || '1970-01-01');
                const localLastUpdated = new Date(localStorage.getItem('manuPuntosLastUpdated') || '1970-01-01');
                
                // Only update if cloud data is newer and we didn't just update it
                if (cloudLastUpdated > localLastUpdated && 
                    Math.abs(cloudLastUpdated - new Date()) > 2000) { // 2 second buffer
                    
                    this.users = cloudData.users;
                    this.currentUser = cloudData.currentUser || this.currentUser;
                    this.updateUserSelector();
                    this.switchUser(this.currentUser);
                    this.updateSyncStatus('🔄 Synced from another device');
                    
                    // Clear status after 3 seconds
                    setTimeout(() => {
                        this.updateSyncStatus('🌐 Cloud sync enabled');
                    }, 3000);
                }
            }
        });
    }


    // User management methods
    addNewUser() {
        const userName = prompt('Enter name for new user:');
        if (!userName || userName.trim() === '') {
            alert('Please enter a valid name.');
            return;
        }
        
        const cleanName = userName.trim();
        if (this.users[cleanName]) {
            alert('User already exists!');
            return;
        }
        
        this.users[cleanName] = { entries: [], currentScore: 0 };
        this.updateUserSelector();
        this.saveData();
        this.switchUser(cleanName);
        alert(`User "${cleanName}" added successfully!`);
    }

    switchUser(userName) {
        this.currentUser = userName;
        this.userSelector.value = userName;
        this.updateDisplay();
        this.updateChart();
        this.updateHistory();
    }

    updateUserSelector() {
        this.userSelector.innerHTML = '';
        Object.keys(this.users).forEach(userName => {
            const option = document.createElement('option');
            option.value = userName;
            option.textContent = userName;
            this.userSelector.appendChild(option);
        });
    }

    updateAllUsersStats() {
        const statsHTML = Object.keys(this.users).map(userName => {
            const user = this.users[userName];
            const totalEntries = user.entries.length;
            const positiveEntries = user.entries.filter(e => e.points > 0).length;
            const negativeEntries = user.entries.filter(e => e.points < 0).length;
            const neutralEntries = user.entries.filter(e => e.points === 0).length;
            
            const lastEntry = user.entries.length > 0 ? 
                new Date(user.entries[user.entries.length - 1].timestamp).toLocaleDateString() : 
                'No entries';
            
            return `
                <div class="user-stats-card ${userName === this.currentUser ? 'current-user' : ''}">
                    <div class="user-stats-header">
                        <h4>${userName}</h4>
                        <div class="user-score ${user.currentScore < 0 ? 'negative' : 'positive'}">
                            ${user.currentScore}
                        </div>
                    </div>
                    <div class="user-stats-details">
                        <div class="stat-item">
                            <span class="stat-label">Total Entries:</span>
                            <span class="stat-value">${totalEntries}</span>
                        </div>
                        <div class="stat-item">
                            <span class="stat-label">Positive:</span>
                            <span class="stat-value positive">${positiveEntries}</span>
                        </div>
                        <div class="stat-item">
                            <span class="stat-label">Negative:</span>
                            <span class="stat-value negative">${negativeEntries}</span>
                        </div>
                        <div class="stat-item">
                            <span class="stat-label">Neutral:</span>
                            <span class="stat-value neutral">${neutralEntries}</span>
                        </div>
                        <div class="stat-item">
                            <span class="stat-label">Last Entry:</span>
                            <span class="stat-value">${lastEntry}</span>
                        </div>
                    </div>
                </div>
            `;
        }).join('');
        
        this.allUsersStats.innerHTML = statsHTML;
    }
}

// Initialize the application when the page loads
document.addEventListener('DOMContentLoaded', () => {
    new ManuPuntos();
});

