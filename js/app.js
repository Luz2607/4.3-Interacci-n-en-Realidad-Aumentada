// ===== BARRA DE PROGRESO PARA TODOS LOS MODEL-VIEWER =====
const onProgress = (event) => {
  const progressBar = event.target.querySelector('.progress-bar');
  const updatingBar = event.target.querySelector('.update-bar');

  if (!progressBar || !updatingBar || !event.detail) return;

  updatingBar.style.width = `${event.detail.totalProgress * 100}%`;

  if (event.detail.totalProgress === 1) {
    progressBar.classList.add('hide');
    event.target.removeEventListener('progress', onProgress);
  } else {
    progressBar.classList.remove('hide');
  }
};

const viewers = document.querySelectorAll('.mv');
viewers.forEach(v => v.addEventListener('progress', onProgress));

// ===== CAMBIO DE MODEL-VIEWER ACTIVO (SIN PARPADEO) =====
let activeId = 'mv-inicial';

function showModel(id) {
  if (id === activeId) return;

  const current = document.getElementById(activeId);
  const next = document.getElementById(id);

  if (!next) {
    console.warn('No se encontró el modelo:', id);
    return;
  }

  current.classList.remove('active');
  next.classList.add('active');
  activeId = id;

  console.log('Modelo activo:', activeId);
}

// Botones de la barra
const buttons = document.querySelectorAll('#ui-buttons button');
buttons.forEach((btn) => {
  btn.addEventListener('click', (event) => {
    const targetId = event.currentTarget.dataset.target;
    if (!targetId) return;
    showModel(targetId);
  });
});
