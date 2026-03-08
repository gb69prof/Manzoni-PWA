
const SITE_TITLE = "Manzoni e la Provvidenza";
document.addEventListener('DOMContentLoaded', () => {
  const modal = document.getElementById('img-modal');
  if (modal) {
    const modalImg = modal.querySelector('img');
    document.querySelectorAll('[data-full]').forEach(btn => {
      btn.addEventListener('click', () => {
        modalImg.src = btn.dataset.full;
        modalImg.alt = btn.dataset.alt || '';
        modal.classList.add('open');
      });
    });
    modal.addEventListener('click', (e) => {
      if (e.target === modal || e.target.classList.contains('modal-close')) {
        modal.classList.remove('open');
        modalImg.src = '';
      }
    });
  }

  const quizForm = document.getElementById('quiz-form');
  if (quizForm) {
    const correctAnswers = [1, 2, 1, 1, 0, 2, 1, 2];
    const resultBox = document.getElementById('score-box');
    document.getElementById('check-quiz').addEventListener('click', () => {
      let score = 0;
      correctAnswers.forEach((ans, idx) => {
        const chosen = quizForm.querySelector(`input[name="q${idx}"]:checked`);
        const block = document.getElementById(`qq-${idx}`);
        block.querySelectorAll('label').forEach(l => l.style.background = '');
        if (!chosen) return;
        const value = Number(chosen.value);
        const chosenLabel = chosen.closest('label');
        if (value === ans) {
          score++;
          chosenLabel.style.background = '#d8f0da';
        } else {
          chosenLabel.style.background = '#f6d2d2';
          const correct = block.querySelector(`input[value="${ans}"]`)?.closest('label');
          if (correct) correct.style.background = '#d8f0da';
        }
      });
      resultBox.style.display = 'block';
      const percent = Math.round((score / correctAnswers.length) * 100);
      resultBox.innerHTML = `<strong>Punteggio:</strong> ${score} / ${correctAnswers.length} (${percent}%)`;
      resultBox.scrollIntoView({behavior:'smooth', block:'nearest'});
    });
    document.getElementById('reset-quiz').addEventListener('click', () => {
      quizForm.reset();
      quizForm.querySelectorAll('label').forEach(l => l.style.background = '');
      resultBox.style.display = 'none';
    });
  }

  const year = document.getElementById('year');
  if (year) year.textContent = new Date().getFullYear();
});
