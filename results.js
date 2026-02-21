// Results page handler - displays quiz results and statistics
(function(){
  const scoreValue = document.getElementById('scoreValue');
  const totalQuestions = document.getElementById('totalQuestions');
  const correctAnswers = document.getElementById('correctAnswers');
  const percentage = document.getElementById('percentage');
  const timeTaken = document.getElementById('timeTaken');
  const answerList = document.getElementById('answerList');
  const retryBtn = document.getElementById('retryBtn');
  const backBtn = document.getElementById('backBtn');
  const downloadBtn = document.getElementById('downloadBtn');

  // Retrieve results from sessionStorage
  function loadResults() {
    const results = JSON.parse(sessionStorage.getItem('quizResults') || '{}');
    
    if (!results.score) {
      scoreValue.textContent = 'No results available';
      return;
    }

    const total = results.total || 0;
    const correct = results.score || 0;
    const percent = total > 0 ? Math.round((correct / total) * 100) : 0;

    scoreValue.textContent = `${correct} / ${total}`;
    totalQuestions.textContent = total;
    correctAnswers.textContent = correct;
    percentage.textContent = percent;
    timeTaken.textContent = results.timeSpent || 0;

    // Display answer breakdown
    if (results.answers && results.answers.length > 0) {
      answerList.innerHTML = results.answers.map((ans, idx) => `
        <li style="padding: 10px; margin: 5px 0; border-radius: 4px; ${ans.isCorrect ? 'background-color: rgba(76, 175, 80, 0.1); border-left: 4px solid #4caf50;' : 'background-color: rgba(244, 67, 54, 0.1); border-left: 4px solid #f44336;'}">
          <strong>Q${idx + 1}:</strong> ${ans.question}<br>
          <small>Your answer: <strong>${ans.userAnswer}</strong></small><br>
          ${!ans.isCorrect ? `<small style="color: #4caf50;">Correct answer: <strong>${ans.correctAnswer}</strong></small>` : '<small style="color: #4caf50;">✓ Correct</small>'}
          ${ans.explanation ? `<br><small style="font-style: italic; color: #666;">${ans.explanation}</small>` : ''}
        </li>
      `).join('');
    }
  }

  // Event listeners
  retryBtn.addEventListener('click', () => {
    sessionStorage.removeItem('quizResults');
    window.location.href = 'index.html';
  });

  backBtn.addEventListener('click', () => {
    sessionStorage.removeItem('quizResults');
    window.location.href = 'index.html';
  });

  downloadBtn.addEventListener('click', () => {
    const results = JSON.parse(sessionStorage.getItem('quizResults') || '{}');
    const dataStr = JSON.stringify(results, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `quiz-results-${new Date().getTime()}.json`;
    link.click();
    URL.revokeObjectURL(url);
  });

  // Load results on page load
  loadResults();
})();
