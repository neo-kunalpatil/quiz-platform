// Enhanced client-side quiz maker with persistence, import/export, edit/delete, shuffle, timer, feedback
(function(){
  const qForm = document.getElementById('qForm');
  const questionText = document.getElementById('questionText');
  const optA = document.getElementById('optA');
  const optB = document.getElementById('optB');
  const optC = document.getElementById('optC');
  const optD = document.getElementById('optD');
  const explanationEl = document.getElementById('explanation');
  const correct = document.getElementById('correct');
  const questionsList = document.getElementById('questionsList');
  const startBtn = document.getElementById('startBtn');
  const clearBtn = document.getElementById('clearBtn');
  const saveBtn = document.getElementById('saveBtn');
  const loadBtn = document.getElementById('loadBtn');
  const exportBtn = document.getElementById('exportBtn');
  const importBtn = document.getElementById('importBtn');
  const importFile = document.getElementById('importFile');
  const shuffleQuestionsEl = document.getElementById('shuffleQuestions');
  const shuffleOptionsEl = document.getElementById('shuffleOptions');
  const timerSecEl = document.getElementById('timerSec');

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
  const timerEl = document.getElementById('timer');
  const timerVal = document.getElementById('timerVal');
  const feedbackEl = document.getElementById('feedback');

  let questions = [];
  let editingIndex = null;
  let playing = null; // deep copy used when playing (may be shuffled)
  let state = { current:0, score:0, answered:false };
  let intervalId = null;

  const STORAGE_KEY = 'quiz-maker-data-v1';

  // utilities
  function swap(arr,a,b){ const t=arr[a]; arr[a]=arr[b]; arr[b]=t; }
  function shuffle(arr){ for(let i=arr.length-1;i>0;i--){ const j=Math.floor(Math.random()*(i+1)); swap(arr,i,j); } }
  function deepCopy(obj){ return JSON.parse(JSON.stringify(obj)); }

  function renderList(){
    questionsList.innerHTML = '';
    questions.forEach((q,i)=>{
      const li = document.createElement('li');
      const title = document.createElement('div');
      title.textContent = `${i+1}. ${q.text}`;
      li.appendChild(title);
      const meta = document.createElement('div');
      meta.style.marginTop = '6px';
      meta.innerHTML = `<small>${q.options.map((o,idx)=>`<strong>${['A','B','C','D'][idx]}</strong>: ${o || ''}`).join(' | ')}</small>`;
      li.appendChild(meta);
      const row = document.createElement('div');
      row.className = 'row';
      const edit = document.createElement('button'); edit.textContent='Edit'; edit.className='secondary';
      const del = document.createElement('button'); del.textContent='Delete'; del.className='secondary';
      edit.addEventListener('click', ()=>startEdit(i));
      del.addEventListener('click', ()=>{ if(!confirm('Delete this question?')) return; questions.splice(i,1); renderList(); });
      row.appendChild(edit); row.appendChild(del);
      li.appendChild(row);
      questionsList.appendChild(li);
    });
  }

  function startEdit(i){
    const q = questions[i];
    editingIndex = i;
    questionText.value = q.text;
    optA.value = q.options[0]||'';
    optB.value = q.options[1]||'';
    optC.value = q.options[2]||'';
    optD.value = q.options[3]||'';
    correct.value = q.correct!=null?String(q.correct):'0';
    explanationEl.value = q.explanation||'';
    document.getElementById('addBtn').textContent = 'Save Edit';
    questionText.focus();
  }

  function clearForm(){ qForm.reset(); explanationEl.value=''; editingIndex = null; document.getElementById('addBtn').textContent='Add Question'; }

  qForm.addEventListener('submit', e=>{
    e.preventDefault();
    const q = {
      text: questionText.value.trim(),
      options: [optA.value.trim(), optB.value.trim(), optC.value.trim(), optD.value.trim()],
      correct: parseInt(correct.value,10),
      explanation: explanationEl.value.trim()
    };
    if(!q.text || !q.options[0] || !q.options[1]) return alert('Enter question and at least two options');
    if(editingIndex!=null){ questions[editingIndex]=q; } else { questions.push(q); }
    renderList();
    clearForm();
  });

  clearBtn.addEventListener('click', ()=>{
    if(!confirm('Clear all questions?')) return;
    questions = [];
    renderList();
  });

  // persistence
  saveBtn.addEventListener('click', ()=>{
    localStorage.setItem(STORAGE_KEY, JSON.stringify(questions));
    alert('Saved to browser storage');
  });
  loadBtn.addEventListener('click', ()=>{
    const raw = localStorage.getItem(STORAGE_KEY);
    if(!raw) return alert('No saved quiz found');
    try{ questions = JSON.parse(raw); renderList(); alert('Loaded from browser storage'); }catch(err){ alert('Invalid saved data'); }
  });
  exportBtn.addEventListener('click', ()=>{
    const blob = new Blob([JSON.stringify(questions, null, 2)], {type:'application/json'});
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a'); a.href=url; a.download='quiz.json'; document.body.appendChild(a); a.click(); a.remove(); URL.revokeObjectURL(url);
  });
  importBtn.addEventListener('click', ()=>importFile.click());
  importFile.addEventListener('change', ()=>{
    const f = importFile.files[0]; if(!f) return; const r = new FileReader(); r.onload = ()=>{
      try{ const parsed = JSON.parse(r.result); if(!Array.isArray(parsed)) throw new Error('not array'); questions = parsed; renderList(); alert('Imported quiz'); }catch(err){ alert('Failed to import: '+err.message); }
    }; r.readAsText(f);
  });

  startBtn.addEventListener('click', ()=>{
    if(questions.length===0) return alert('Add at least one question');
    // prepare playing copy
    playing = deepCopy(questions);
    if(shuffleQuestionsEl.checked) shuffle(playing);
    if(shuffleOptionsEl.checked){
      playing.forEach(q=>{
        const order = q.options.map((_,i)=>i);
        shuffle(order);
        const newOpts = order.map(i=>q.options[i]);
        const newCorrect = order.indexOf(q.correct);
        q.options = newOpts; q.correct = newCorrect;
      });
    }
    builder.classList.add('hidden');
    quiz.classList.remove('hidden');
    result.classList.add('hidden');
    state.current = 0; state.score = 0; state.answered=false;
    showQuestion();
  });

  function showQuestion(){
    clearInterval(intervalId); intervalId = null; feedbackEl.style.display='none';
    const q = playing[state.current];
    qIndexEl.textContent = `Question ${state.current+1} / ${playing.length}`;
    qArea.textContent = q.text;
    answersEl.innerHTML = '';
    state.answered = false;
    q.options.forEach((opt, idx)=>{
      if(!opt) return;
      const li = document.createElement('li');
      const btn = document.createElement('button');
      btn.textContent = opt;
      btn.dataset.idx = idx;
      btn.addEventListener('click', ()=>answerQuestion(idx));
      li.appendChild(btn);
      answersEl.appendChild(li);
    });
    // timer
    const t = parseInt(timerSecEl.value,10) || 0;
    if(t>0){ timerEl.style.display='block'; timerVal.textContent = t; let rem=t; intervalId = setInterval(()=>{ rem--; timerVal.textContent=rem; if(rem<=0){ clearInterval(intervalId); intervalId=null; onTimerExpired(); } },1000); }
    else { timerEl.style.display='none'; }
  }

  function answerQuestion(idx){
    if(state.answered) return; state.answered = true; clearInterval(intervalId); intervalId=null;
    const q = playing[state.current];
    const correctIdx = q.correct;
    // highlight choices
    Array.from(answersEl.querySelectorAll('button')).forEach(b=>b.classList.remove('chosen'));
    const btn = answersEl.querySelector(`button[data-idx="${idx}"]`);
    if(btn) btn.classList.add('chosen');
    // scoring
    const wasCorrect = idx === correctIdx;
    if(wasCorrect) state.score++;
    // show feedback
    feedbackEl.style.display = 'block';
    feedbackEl.innerHTML = `<strong>${wasCorrect? 'Correct' : 'Incorrect'}</strong><div style="margin-top:6px"><em>Answer:</em> ${q.options[correctIdx] || ''}</div>` + (q.explanation? `<div style="margin-top:6px"><em>Explanation:</em> ${q.explanation}</div>`:'');
  }

  function onTimerExpired(){
    // auto-mark incorrect and show explanation, then move to next after short delay
    state.answered = true;
    const q = playing[state.current];
    feedbackEl.style.display = 'block';
    feedbackEl.innerHTML = `<strong>Time's up</strong><div style="margin-top:6px"><em>Answer:</em> ${q.options[q.correct]||''}</div>` + (q.explanation? `<div style="margin-top:6px"><em>Explanation:</em> ${q.explanation}</div>`:'');
    // auto next after 2s
    setTimeout(()=>{ if(state.current < playing.length-1){ state.current++; showQuestion(); } else { showResult(); } }, 1500);
  }

  nextBtn.addEventListener('click', ()=>{
    if(!state.answered) return alert('Choose an answer or wait for the timer');
    if(state.current >= playing.length-1){ showResult(); return; }
    state.current++; showQuestion();
  });

  prevBtn.addEventListener('click', ()=>{
    if(state.current>0){ state.current--; showQuestion(); }
  });

  function showResult(){
    clearInterval(intervalId); intervalId=null;
    quiz.classList.add('hidden'); result.classList.remove('hidden');
    scoreEl.textContent = `You scored ${state.score} of ${playing.length} (${Math.round((state.score/playing.length)*100)}%)`;
  }

  retryBtn.addEventListener('click', ()=>{
    builder.classList.remove('hidden'); quiz.classList.add('hidden'); result.classList.add('hidden');
  });

  // initial render
  renderList();

})();
