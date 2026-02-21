// Leaderboard feature - tracks and displays top quiz scores
(function(){
  const bankFilter = document.getElementById('bankFilter');
  const leaderboardTable = document.getElementById('leaderboardTable');
  const clearLeaderBtn = document.getElementById('clearLeaderBtn');
  const backBtn = document.getElementById('backBtn');

  const LEADERBOARD_KEY = 'quiz-leaderboard-v1';

  // Load all leaderboard scores
  function loadLeaderboard() {
    const scores = JSON.parse(localStorage.getItem(LEADERBOARD_KEY) || '[]');
    return scores.sort((a, b) => b.percentage - a.percentage || b.score - a.score).slice(0, 50);
  }

  // Render leaderboard table
  function renderLeaderboard(filter = '') {
    const scores = loadLeaderboard();
    const filtered = filter ? scores.filter(s => s.bankName === filter) : scores;

    if (filtered.length === 0) {
      leaderboardTable.innerHTML = '<tr><td colspan="5" style="text-align:center;padding:20px;color:#999;">No scores found</td></tr>';
      return;
    }

    leaderboardTable.innerHTML = filtered.map((score, idx) => `
      <tr style="border-bottom:1px solid rgba(255,255,255,0.05);">
        <td style="padding:10px;font-weight:bold;color:#4caf50;">${idx + 1}</td>
        <td style="padding:10px;">${score.bankName}</td>
        <td style="padding:10px;text-align:center;"><strong>${score.score}/${score.total}</strong></td>
        <td style="padding:10px;text-align:center;"><strong style="color:#4caf50;">${score.percentage}%</strong></td>
        <td style="padding:10px;color:#999;">${new Date(score.dateTaken).toLocaleDateString()}</td>
      </tr>
    `).join('');
  }

  // Load banks into filter dropdown
  function loadBankFilter() {
    const scores = loadLeaderboard();
    const uniqueBanks = [...new Set(scores.map(s => s.bankName))];
    
    uniqueBanks.forEach(bank => {
      const option = document.createElement('option');
      option.value = bank;
      option.textContent = bank;
      bankFilter.appendChild(option);
    });
  }

  // Event listeners
  bankFilter.addEventListener('change', (e) => {
    renderLeaderboard(e.target.value);
  });

  clearLeaderBtn.addEventListener('click', () => {
    if (confirm('Are you sure you want to clear all leaderboard scores?')) {
      localStorage.removeItem(LEADERBOARD_KEY);
      leaderboardTable.innerHTML = '<tr><td colspan="5" style="text-align:center;padding:20px;color:#999;">No scores yet</td></tr>';
      bankFilter.innerHTML = '<option value="">-- All Banks --</option>';
    }
  });

  backBtn.addEventListener('click', () => {
    window.location.href = 'index.html';
  });

  // Public API for adding scores
  window.addToLeaderboard = function(bankName, score, total, timeSpent) {
    const scores = JSON.parse(localStorage.getItem(LEADERBOARD_KEY) || '[]');
    const percentage = Math.round((score / total) * 100);
    
    scores.push({
      bankName,
      score,
      total,
      percentage,
      timeSpent,
      dateTaken: new Date().toISOString()
    });
    
    localStorage.setItem(LEADERBOARD_KEY, JSON.stringify(scores));
  };

  // Initialize
  loadBankFilter();
  renderLeaderboard();
})();
