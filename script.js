// DOM elements
const csvFileInput = document.getElementById('csvFile');
const xlsxFileInput = document.getElementById('xlsxFile');
const csvFileName = document.getElementById('csvFileName');
const xlsxFileName = document.getElementById('xlsxFileName');
const calculateBtn = document.getElementById('calculateBtn');
const refreshBtn = document.getElementById('refreshBtn');
const resultsSection = document.getElementById('resultsSection');
const errorSection = document.getElementById('errorSection');
const errorMessage = document.getElementById('errorMessage');
const loadingIndicator = document.getElementById('loadingIndicator');

// Global variables to store uploaded files
let csvFile = null;
let xlsxFile = null;
let csvData = null;
let xlsxData = null;

// Initialize event listeners
document.addEventListener('DOMContentLoaded', function() {
    setupEventListeners();
    updateCurrentDate();
    showLightningWelcome();
});

function setupEventListeners() {
    // File upload handlers
    csvFileInput.addEventListener('change', handleCsvUpload);
    xlsxFileInput.addEventListener('change', handleXlsxUpload);
    
    // Calculate button handler
    calculateBtn.addEventListener('click', calculateDailyGoals);
    
    // Refresh button handler
    if (refreshBtn) {
        refreshBtn.addEventListener('click', refreshData);
    }
    
    // Export button handlers
    const exportPdfBtn = document.getElementById('exportPdfBtn');
    const exportCsvBtn = document.getElementById('exportCsvBtn');
    if (exportPdfBtn) exportPdfBtn.addEventListener('click', exportToPDF);
    if (exportCsvBtn) exportCsvBtn.addEventListener('click', exportToCSV);
}

function showLightningWelcome() {
    // Show welcome loading indicator briefly
    loadingIndicator.style.display = 'block';
    setTimeout(() => {
        loadingIndicator.style.display = 'none';
    }, 2000);
}

function refreshData() {
    // Show refresh loading state
    const originalText = refreshBtn.innerHTML;
    refreshBtn.innerHTML = '⚡ Refreshing... ⚡';
    refreshBtn.disabled = true;
    
    // Simulate refresh with lightning effect
    setTimeout(() => {
        if (csvData && xlsxData) {
            calculateDailyGoals();
        } else {
            showLightningMessage('⚡ Upload your files to see the lightning magic! ⚡');
        }
        refreshBtn.innerHTML = originalText;
        refreshBtn.disabled = false;
    }, 1500);
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
        if (document.body.contains(messageDiv)) {
            document.body.removeChild(messageDiv);
        }
    }, 3000);
}

async function handleCsvUpload(event) {
    const file = event.target.files[0];
    if (file) {
        try {
            csvFile = file;
            csvFileName.textContent = `⚡ ${file.name}`;
            csvFileName.style.color = '#00cc66';
            
            // Read CSV file using SheetJS
            const data = await file.arrayBuffer();
            const workbook = XLSX.read(data);
            const worksheet = workbook.Sheets[workbook.SheetNames[0]];
            
            // Convert to JSON for processing
            csvData = XLSX.utils.sheet_to_json(worksheet);
            
            checkFilesReady();
            showLightningMessage('⚡ CSV file loaded successfully! ⚡');
        } catch (error) {
            showError('⚡ Error reading CSV file: ' + error.message + ' ⚡');
        }
    }
}

async function handleXlsxUpload(event) {
    const file = event.target.files[0];
    if (file) {
        try {
            xlsxFile = file;
            xlsxFileName.textContent = `⚡ ${file.name}`;
            xlsxFileName.style.color = '#00cc66';
            
            // Read XLSX file using SheetJS
            const data = await file.arrayBuffer();
            const workbook = XLSX.read(data);
            const worksheet = workbook.Sheets[workbook.SheetNames[0]];
            
            // Convert to array of arrays for processing
            const rawData = XLSX.utils.sheet_to_aoa(worksheet);
            
            // Process XLSX data (similar to Python backend logic)
            xlsxData = processXlsxData(rawData);
            
            checkFilesReady();
            showLightningMessage('⚡ XLSX file powered up! ⚡');
        } catch (error) {
            showError('⚡ Error reading XLSX file: ' + error.message + ' ⚡');
        }
    }
}

function processXlsxData(rawData) {
    const agents = [];
    
    // Find header row with "Collector"
    let dataStartRow = 0;
    for (let i = 0; i < rawData.length; i++) {
        if (rawData[i][0] && rawData[i][0].toString().toLowerCase().includes('collector')) {
            dataStartRow = i + 1;
            break;
        }
    }
    
    // Process data rows
    for (let i = dataStartRow; i < rawData.length; i++) {
        const row = rawData[i];
        if (!row[0] || row[0] === '') continue; // Skip empty rows
        
        const agent = row[0].toString().toUpperCase().trim();
        const greenMoney = parseCurrency(row[10] || 0); // Column K
        const totalWithPdp = parseCurrency(row[11] || 0); // Column L
        
        agents.push({
            agent: agent,
            green_money: greenMoney,
            total_with_pdp: totalWithPdp
        });
    }
    
    return agents;
}

function parseCurrency(value) {
    if (!value || value === '') return 0.0;
    
    if (typeof value === 'string') {
        const cleaned = value.replace(/[$,\s]/g, '');
        return parseFloat(cleaned) || 0.0;
    }
    
    return parseFloat(value) || 0.0;
}

function checkFilesReady() {
    if (csvData && xlsxData) {
        calculateBtn.disabled = false;
        calculateBtn.style.background = 'linear-gradient(45deg, #00cc66, #00ff80, #00cc66)';
        showLightningMessage('⚡ Ready to calculate lightning goals! ⚡');
    }
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

function calculateRemainingWorkDays() {
    const now = new Date();
    const year = now.getFullYear();
    const month = now.getMonth();
    const lastDay = new Date(year, month + 1, 0).getDate();
    
    let workDays = 0;
    for (let day = now.getDate(); day <= lastDay; day++) {
        const date = new Date(year, month, day);
        const dayOfWeek = date.getDay();
        // Monday = 1, Sunday = 0, Saturday = 6
        if (dayOfWeek >= 1 && dayOfWeek <= 5) {
            workDays++;
        }
    }
    
    return Math.max(1, workDays);
}

async function calculateDailyGoals() {
    if (!csvData || !xlsxData) {
        showError('⚡ Please upload both CSV and XLSX files to power up! ⚡');
        return;
    }

    // Show lightning loading state
    const originalText = calculateBtn.innerHTML;
    calculateBtn.innerHTML = '<span class="loading"></span>⚡ Calculating Lightning Goals... ⚡';
    calculateBtn.disabled = true;
    loadingIndicator.style.display = 'block';
    loadingIndicator.textContent = '⚡ Processing your data with lightning speed... ⚡';

    try {
        // Calculate remaining work days
        const remainingDays = calculateRemainingWorkDays();
        
        // Process and merge data
        const results = [];
        
        csvData.forEach(csvRow => {
            const agent = csvRow.Agent?.toString().toUpperCase().trim();
            const team = csvRow.Team?.toString().trim() || '';
            const monthlyGoal1 = parseCurrency(csvRow['Monthly Goal 1'] || 0);
            const monthlyGoal2 = parseCurrency(csvRow['Monthly Goal 2'] || 0);
            
            if (!agent) return; // Skip invalid rows
            
            // Find matching agent in XLSX data
            const xlsxMatch = xlsxData.find(x => x.agent === agent);
            const totalWithPdp = xlsxMatch ? xlsxMatch.total_with_pdp : 0;
            
            // Smart goal progression logic
            let currentGoal = monthlyGoal1;
            let goalLevel = 1;
            let progressPercent = 0;
            let trophies = 0;
            
            if (totalWithPdp >= monthlyGoal1) {
                // Goal 1 completed, working on Goal 2
                goalLevel = 2;
                currentGoal = monthlyGoal2;
                trophies = 1;
                progressPercent = Math.min(100, (totalWithPdp / monthlyGoal2) * 100);
                
                if (totalWithPdp >= monthlyGoal2) {
                    // Goal 2 also completed
                    trophies = 2;
                    progressPercent = 100;
                }
            } else {
                // Still working on Goal 1
                progressPercent = Math.min(100, (totalWithPdp / monthlyGoal1) * 100);
            }
            
            // Calculate remaining amount needed for current goal
            const remaining = Math.max(0, currentGoal - totalWithPdp);
            
            // Calculate daily goal
            const dailyGoal = remaining > 0 ? remaining / remainingDays : 0;
            
            results.push({
                agent: agent,
                team: team,
                monthly_goal_1: monthlyGoal1,
                monthly_goal_2: monthlyGoal2,
                current_goal: currentGoal,
                goal_level: goalLevel,
                total_with_pdp: totalWithPdp,
                remaining: remaining,
                daily_goal: dailyGoal,
                progress_percent: progressPercent,
                trophies: trophies
            });
        });
        
        const calculationResults = {
            agents: results,
            remaining_days: remainingDays,
            current_date: new Date().toLocaleDateString('en-US', { 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric',
                weekday: 'long'
            })
        };
        
        displayResults(calculationResults);
        hideError();
        showLightningMessage('⚡ Lightning calculations complete! Check your results! ⚡');
        
    } catch (error) {
        console.error('Calculation error:', error);
        showError('⚡ Lightning calculation error: ' + error.message + ' ⚡');
    } finally {
        // Reset button state
        calculateBtn.innerHTML = originalText;
        calculateBtn.disabled = false;
        loadingIndicator.style.display = 'none';
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
    
    // Add CSS for row animation if not already added
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

function showError(message) {
    errorMessage.textContent = message;
    errorSection.style.display = 'block';
    errorSection.scrollIntoView({ behavior: 'smooth' });
}

function hideError() {
    errorSection.style.display = 'none';
}

async function exportToPDF() {
    showLightningMessage('⚡ PDF export requires full backend version! Check GitHub for local setup! ⚡');
}

async function exportToCSV() {
    try {
        if (!csvData || !xlsxData) {
            showError('⚡ Please calculate results first! ⚡');
            return;
        }
        
        // Create CSV content from current results
        const results = document.querySelectorAll('#resultsTable tbody tr');
        let csvContent = 'Agent,Team,Current Goal,Total w/PDP,Progress %,Remaining,Daily Goal,Status\n';
        
        results.forEach(row => {
            const cells = row.querySelectorAll('td');
            const rowData = [
                cells[0].textContent.trim(),
                cells[1].textContent.trim(),
                cells[2].textContent.trim(),
                cells[3].textContent.trim(),
                cells[4].querySelector('.progress-text').textContent.trim(),
                cells[5].textContent.trim(),
                cells[6].textContent.trim(),
                cells[7].querySelector('.status-badge').textContent.trim()
            ];
            csvContent += rowData.map(cell => `"${cell}"`).join(',') + '\n';
        });
        
        // Download CSV
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        const url = URL.createObjectURL(blob);
        link.setAttribute('href', url);
        link.setAttribute('download', 'lightning-goals-data.csv');
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        
        showLightningMessage('⚡ CSV data downloaded! ⚡');
    } catch (error) {
        showError('⚡ Error generating CSV export: ' + error.message + ' ⚡');
    }
} 