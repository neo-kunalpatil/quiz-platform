// Simple client-side quiz maker
(function(){
  const qForm = document.getElementById('qForm');
  const questionText = document.getElementById('questionText');
  const optA = document.getElementById('optA');
  const optB = document.getElementById('optB');
  const optC = document.getElementById('optC');
  const optD = document.getElementById('optD');
  const correct = document.getElementById('correct');
  const questionsList = document.getElementById('questionsList');
  const startBtn = document.getElementById('startBtn');
  const clearBtn = document.getElementById('clearBtn');

  const builder = document.getElementById('builder');
  const quiz = document.getElementById('quiz');
  const result = document.getElementById('result');
  const qArea = document.getElementById('qArea');
  const answersEl = document.getElementById('answers');
  const qIndexEl = document.getElementById('qIndex');
  const nextBtn = document.getElementById('nextBtn');
  const prevBtn = document.getElementById('prevBtn');
  const retryBtn = document.getElementById('retryBtn');
  const scoreEl = document.getElementById('score');

  let questions = [];
  let state = { current:0, selected: null, score:0 };

  function renderList(){
    questionsList.innerHTML = '';
    questions.forEach((q,i)=>{
      const li = document.createElement('li');
      li.textContent = `${i+1}. ${q.text}`;
      const meta = document.createElement('div');
      meta.style.marginTop = '6px';
      meta.innerHTML = `<small>${q.options.map((o,idx)=>`<strong>${['A','B','C','D'][idx]}</strong>: ${o}`).join(' | ')}</small>`;
      li.appendChild(meta);
      questionsList.appendChild(li);
    });
  }

  function addQuestion(q){
    questions.push(q);
    renderList();
  }

  qForm.addEventListener('submit', e=>{
    e.preventDefault();
    const q = {
      text: questionText.value.trim(),
      options: [optA.value.trim(), optB.value.trim(), optC.value.trim(), optD.value.trim()],
      correct: parseInt(correct.value,10)
    };
    if(!q.text || !q.options[0] || !q.options[1]) return alert('Enter question and at least two options');
    addQuestion(q);
    qForm.reset();
    questionText.focus();
  });

  clearBtn.addEventListener('click', ()=>{
    if(!confirm('Clear all questions?')) return;
    questions = [];
    renderList();
  });

  startBtn.addEventListener('click', ()=>{
    if(questions.length===0) return alert('Add at least one question');
    builder.classList.add('hidden');
    quiz.classList.remove('hidden');
    result.classList.add('hidden');
    state.current = 0; state.score = 0; state.selected = null;
    showQuestion();
  });

  function showQuestion(){
    const q = questions[state.current];
    qIndexEl.textContent = `Question ${state.current+1} / ${questions.length}`;
    qArea.textContent = q.text;
    answersEl.innerHTML = '';
    q.options.forEach((opt, idx)=>{
      if(!opt) return;
      const li = document.createElement('li');
      const btn = document.createElement('button');
      btn.textContent = opt;
      btn.dataset.idx = idx;
      btn.addEventListener('click', ()=>{
        // mark selection
        Array.from(answersEl.querySelectorAll('button')).forEach(b=>b.classList.remove('chosen'));
        btn.classList.add('chosen');
        state.selected = idx;
      });
      li.appendChild(btn);
      answersEl.appendChild(li);
    });
  }

  nextBtn.addEventListener('click', ()=>{
    const q = questions[state.current];
    if(state.selected==null) return alert('Choose an answer');
    if(state.selected === q.correct) state.score++;
    state.selected = null;
    state.current++;
    if(state.current >= questions.length){
      // finished
      showResult();
    } else {
      showQuestion();
    }
  });

  prevBtn.addEventListener('click', ()=>{
    if(state.current>0){ state.current--; state.selected=null; showQuestion(); }
  });

  function showResult(){
    quiz.classList.add('hidden');
    result.classList.remove('hidden');
    scoreEl.textContent = `You scored ${state.score} of ${questions.length} (${Math.round((state.score/questions.length)*100)}%)`;
  }

  retryBtn.addEventListener('click', ()=>{
    builder.classList.remove('hidden');
    quiz.classList.add('hidden');
    result.classList.add('hidden');
  });

})();
