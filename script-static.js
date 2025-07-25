a// DOM elements
const loadDemoDataBtn = document.getElementById('loadDemoData');
const resultsSection = document.getElementById('resultsSection');
const loadingIndicator = document.getElementById('loadingIndicator');

// Demo data
const demoData = {
    agents: [
        {
            agent: "ALEX",
            team: "MX",
            monthly_goal_1: 15000,
            monthly_goal_2: 25000,
            current_goal: 25000,
            goal_level: 2,
            total_with_pdp: 22500,
            remaining: 2500,
            daily_goal: 208.33,
            progress_percent: 90,
            trophies: 1
        },
        {
            agent: "SARAH",
            team: "PH",
            monthly_goal_1: 12000,
            monthly_goal_2: 20000,
            current_goal: 20000,
            goal_level: 2,
            total_with_pdp: 18500,
            remaining: 1500,
            daily_goal: 125.00,
            progress_percent: 92.5,
            trophies: 1
        },
        {
            agent: "MIKE",
            team: "EG",
            monthly_goal_1: 10000,
            monthly_goal_2: 18000,
            current_goal: 10000,
            goal_level: 1,
            total_with_pdp: 8500,
            remaining: 1500,
            daily_goal: 125.00,
            progress_percent: 85,
            trophies: 0
        },
        {
            agent: "MARIA",
            team: "MX",
            monthly_goal_1: 14000,
            monthly_goal_2: 22000,
            current_goal: 22000,
            goal_level: 2,
            total_with_pdp: 25000,
            remaining: -3000,
            daily_goal: 0,
            progress_percent: 113.6,
            trophies: 2
        },
        {
            agent: "JOHN",
            team: "PH",
            monthly_goal_1: 11000,
            monthly_goal_2: 19000,
            current_goal: 11000,
            goal_level: 1,
            total_with_pdp: 7500,
            remaining: 3500,
            daily_goal: 291.67,
            progress_percent: 68.2,
            trophies: 0
        }
    ],
    remaining_days: 12,
    current_date: new Date().toLocaleDateString('en-US', { 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric',
        weekday: 'long'
    })
};

// Initialize event listeners
document.addEventListener('DOMContentLoaded', function() {
    setupEventListeners();
    updateCurrentDate();
    showLightningWelcome();
});

function setupEventListeners() {
    // Demo data button handler
    loadDemoDataBtn.addEventListener('click', loadDemoData);
}

function showLightningWelcome() {
    // Show welcome loading indicator briefly
    loadingIndicator.style.display = 'block';
    setTimeout(() => {
        loadingIndicator.style.display = 'none';
    }, 2000);
}

function loadDemoData() {
    // Show loading state
    const originalText = loadDemoDataBtn.innerHTML;
    loadDemoDataBtn.innerHTML = '<span class="loading"></span>⚡ Loading Demo Data... ⚡';
    loadDemoDataBtn.disabled = true;
    loadingIndicator.style.display = 'block';
    loadingIndicator.textContent = '⚡ Loading lightning demo data... ⚡';

    setTimeout(() => {
        displayResults(demoData);
        loadDemoDataBtn.innerHTML = originalText;
        loadDemoDataBtn.disabled = false;
        loadingIndicator.style.display = 'none';
        showLightningMessage('⚡ Demo data loaded successfully! ⚡');
    }, 2000);
}

function showLightningMessage(message) {
    // Create a temporary lightning message
    const messageDiv = document.createElement('div');
    messageDiv.style.cssText = `
        position: fixed;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        background: linear-gradient(45deg, #ffcc00, #ff9900);
        color: #0066cc;
        padding: 20px 40px;
        border-radius: 15px;
        font-weight: 700;
        font-size: 1.2rem;
        box-shadow: 0 10px 30px rgba(255,204,0,0.5);
        z-index: 1000;
        animation: lightning-popup 0.5s ease-out;
    `;
    messageDiv.textContent = message;
    document.body.appendChild(messageDiv);
    
    setTimeout(() => {
        document.body.removeChild(messageDiv);
    }, 3000);
}

function updateCurrentDate() {
    const now = new Date();
    const options = { 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric',
        weekday: 'long'
    };
    const dateElement = document.getElementById('currentDate');
    if (dateElement) {
        dateElement.textContent = now.toLocaleDateString('en-US', options);
    }
}

function displayResults(data) {
    const { agents, remaining_days, current_date } = data;
    
    // Update info section
    const remainingDaysElement = document.getElementById('remainingDays');
    if (remainingDaysElement) {
        remainingDaysElement.textContent = remaining_days;
    }
    
    // Clear previous results
    const tbody = document.getElementById('resultsBody');
    tbody.innerHTML = '';
    
    // Sort agents by progress percentage (highest first)
    const sortedAgents = agents.sort((a, b) => b.progress_percent - a.progress_percent);
    
    // Populate table with lightning effects
    sortedAgents.forEach((agent, index) => {
        const row = tbody.insertRow();
        
        // Get country flag and name
        const countryInfo = getCountryInfo(agent.team);
        
        // Determine status with lightning theme
        let statusClass = 'status-on-track';
        let statusText = '⚡ On Track';
        
        if (agent.remaining <= 0) {
            statusClass = 'status-ahead';
            statusText = '🏆 Goal Met! ⚡';
        } else if (agent.daily_goal > agent.current_goal * 0.1) {
            statusClass = 'status-behind';
            statusText = '⚡ Behind';
        }
        
        // Create trophy icons with lightning
        const trophyIcons = '🏆'.repeat(agent.trophies) + (agent.trophies > 0 ? '⚡' : '');
        
        // Create progress bar
        const progressBar = createProgressBar(agent.progress_percent, agent.goal_level);
        
        // Create goal display with level indicator
        const goalDisplay = createGoalDisplay(agent);
        
        // Add rank indicator for top performers
        const rankIndicator = index === 0 ? '👑 ' : index === 1 ? '🥈 ' : index === 2 ? '🥉 ' : '';
        
        row.innerHTML = `
            <td><strong>${rankIndicator}${agent.agent}</strong></td>
            <td>
                <span class="country-flag">${countryInfo.flag}</span>
                <span class="team-name">${countryInfo.name}</span>
            </td>
            <td>${goalDisplay}</td>
            <td>${formatCurrency(agent.total_with_pdp)}</td>
            <td>
                <div class="progress-container">
                    ${progressBar}
                    <span class="progress-text">${Math.round(agent.progress_percent)}%</span>
                </div>
            </td>
            <td>${formatCurrency(agent.remaining)}</td>
            <td><strong>⚡ ${formatCurrency(agent.daily_goal)}</strong></td>
            <td>
                <span class="status-badge ${statusClass}">${statusText}</span>
                <span class="trophy-icons">${trophyIcons}</span>
            </td>
        `;
        
        // Add lightning animation to row
        row.style.animation = `lightning-row-appear 0.5s ease-out ${index * 0.1}s both`;
    });
    
    // Add CSS for row animation
    if (!document.getElementById('lightning-animation-style')) {
        const style = document.createElement('style');
        style.id = 'lightning-animation-style';
        style.textContent = `
            @keyframes lightning-row-appear {
                0% { 
                    opacity: 0; 
                    transform: translateX(-50px); 
                    box-shadow: -10px 0 20px rgba(255,204,0,0.5);
                }
                100% { 
                    opacity: 1; 
                    transform: translateX(0); 
                    box-shadow: none;
                }
            }
            @keyframes lightning-popup {
                0% { transform: translate(-50%, -50%) scale(0.5); opacity: 0; }
                100% { transform: translate(-50%, -50%) scale(1); opacity: 1; }
            }
            .loading {
                display: inline-block;
                width: 20px;
                height: 20px;
                border: 3px solid rgba(255,255,255,.3);
                border-radius: 50%;
                border-top-color: #ffcc00;
                animation: spin 1s ease-in-out infinite;
                margin-right: 8px;
            }
            @keyframes spin {
                to { transform: rotate(360deg); }
            }
        `;
        document.head.appendChild(style);
    }
    
    // Show results section with lightning effect
    resultsSection.style.display = 'block';
    resultsSection.scrollIntoView({ behavior: 'smooth' });
}

function getCountryInfo(teamCode) {
    const countryMap = {
        'EG': { flag: '🇪🇬', name: 'Egypt ⚡' },
        'PH': { flag: '🇵🇭', name: 'Philippines ⚡' },
        'MX': { flag: '🇲🇽', name: 'Mexico ⚡' },
        'ADM': { flag: '🇲🇽', name: 'Mexico ⚡' }
    };
    return countryMap[teamCode] || { flag: '🌍', name: `${teamCode} ⚡` };
}

function createProgressBar(percent, level) {
    const barClass = level === 2 ? 'progress-bar-gold' : 'progress-bar-green';
    return `
        <div class="progress-bar-bg">
            <div class="${barClass}" style="width: ${percent}%"></div>
        </div>
    `;
}

function createGoalDisplay(agent) {
    const levelText = agent.goal_level === 2 ? '⚡ Lvl 2' : '⚡ Lvl 1';
    const levelClass = agent.goal_level === 2 ? 'level-gold' : 'level-blue';
    
    return `
        <div class="goal-display">
            <span class="goal-amount">${formatCurrency(agent.current_goal)}</span>
            <span class="level-indicator ${levelClass}">${levelText}</span>
        </div>
    `;
}

function formatCurrency(amount) {
    if (amount < 0) {
        return `-$${Math.abs(amount).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
    }
    return `$${amount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
} 
