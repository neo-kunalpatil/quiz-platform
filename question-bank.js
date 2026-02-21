// Question Bank Manager - advanced question management and analytics
(function(){
  const bankSelector = document.getElementById('bankSelector');
  const searchBox = document.getElementById('searchBox');
  const refreshBtn = document.getElementById('refreshBtn');
  const questionTable = document.getElementById('questionTable');
  const totalCount = document.getElementById('totalCount');
  const withExplan = document.getElementById('withExplan');
  const exportBankBtn = document.getElementById('exportBankBtn');
  const duplicateBtn = document.getElementById('duplicateBtn');
  const backBtn = document.getElementById('backBtn');

  const BANKS_STORAGE_KEY = 'quiz-banks-data-v1';

  let currentBank = null;
  let allQuestions = [];

  // Load all banks
  function loadBanks() {
    const banks = JSON.parse(localStorage.getItem(BANKS_STORAGE_KEY) || '{}');
    return banks;
  }

  // Populate bank selector
  function populateBankSelector() {
    const banks = loadBanks();
    bankSelector.innerHTML = '<option value="">-- Select a bank --</option>';
    
    Object.entries(banks).forEach(([id, bank]) => {
      const option = document.createElement('option');
      option.value = id;
      option.textContent = `${bank.name} (${bank.questions.length} Q)`;
      bankSelector.appendChild(option);
    });
  }

  // Load and display bank questions
  function loadBank(bankId) {
    if (!bankId) {
      allQuestions = [];
      renderQuestions([]);
      return;
    }

    const banks = loadBanks();
    const bank = banks[bankId];
    if (bank) {
      currentBank = { id: bankId, ...bank };
      allQuestions = bank.questions || [];
      renderQuestions(allQuestions);
      updateStats();
    }
  }

  // Update statistics
  function updateStats() {
    totalCount.textContent = allQuestions.length;
    withExplan.textContent = allQuestions.filter(q => q.explanation && q.explanation.trim()).length;
  }

  // Render questions
  function renderQuestions(questions) {
    if (questions.length === 0) {
      questionTable.innerHTML = '<li style="padding:20px;text-align:center;color:#999;">No questions in this bank</li>';
      return;
    }

    questionTable.innerHTML = questions.map((q, idx) => `
      <li style="padding:12px;margin:8px 0;background:rgba(255,255,255,0.01);border-radius:4px;border-left:4px solid #2196f3;">
        <div style="display:flex;justify-content:space-between;align-items:start;">
          <div style="flex:1;">
            <strong>Q${idx + 1}:</strong> ${q.text}<br>
            <div style="margin-top:6px;font-size:0.9em;color:#aaa;">
              A) ${q.options[0]} ${q.correct === 0 ? '<span style="color:#4caf50;">✓</span>' : ''}<br>
              B) ${q.options[1]} ${q.correct === 1 ? '<span style="color:#4caf50;">✓</span>' : ''}<br>
              ${q.options[2] ? `C) ${q.options[2]} ${q.correct === 2 ? '<span style="color:#4caf50;">✓</span>' : ''}<br>` : ''}
              ${q.options[3] ? `D) ${q.options[3]} ${q.correct === 3 ? '<span style="color:#4caf50;">✓</span>' : ''}<br>` : ''}
            </div>
            ${q.explanation ? `<div style="margin-top:8px;padding:8px;background:rgba(33,150,243,0.1);border-radius:3px;font-size:0.9em;"><strong>Explanation:</strong> ${q.explanation}</div>` : ''}
          </div>
        </div>
      </li>
    `).join('');
  }

  // Search functionality
  function performSearch() {
    const searchTerm = searchBox.value.toLowerCase();
    if (!searchTerm) {
      renderQuestions(allQuestions);
      return;
    }
    
    const filtered = allQuestions.filter(q => 
      q.text.toLowerCase().includes(searchTerm) ||
      q.options.some(opt => opt.toLowerCase().includes(searchTerm))
    );
    renderQuestions(filtered);
  }

  // Export bank
  function exportBank() {
    if (!currentBank) {
      alert('Please select a bank first');
      return;
    }

    const exportData = {
      bankName: currentBank.name,
      exportDate: new Date().toISOString(),
      questions: currentBank.questions
    };

    const dataStr = JSON.stringify(exportData, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${currentBank.name}-export-${new Date().getTime()}.json`;
    link.click();
    URL.revokeObjectURL(url);
  }

  // Duplicate bank
  function duplicateBank() {
    if (!currentBank) {
      alert('Please select a bank first');
      return;
    }

    const newBankName = prompt(`New name for duplicate:`, `${currentBank.name} (Copy)`);
    if (!newBankName) return;

    const banks = loadBanks();
    const newId = 'bank-' + Date.now();
    banks[newId] = {
      name: newBankName,
      questions: JSON.parse(JSON.stringify(currentBank.questions))
    };

    localStorage.setItem(BANKS_STORAGE_KEY, JSON.stringify(banks));
    populateBankSelector();
    alert('Bank duplicated successfully!');
  }

  // Event listeners
  bankSelector.addEventListener('change', (e) => {
    loadBank(e.target.value);
  });

  searchBox.addEventListener('input', performSearch);

  refreshBtn.addEventListener('click', () => {
    populateBankSelector();
    if (currentBank) {
      loadBank(currentBank.id);
    }
  });

  exportBankBtn.addEventListener('click', exportBank);
  duplicateBtn.addEventListener('click', duplicateBank);

  backBtn.addEventListener('click', () => {
    window.location.href = 'index.html';
  });

  // Initialize
  populateBankSelector();
})();
