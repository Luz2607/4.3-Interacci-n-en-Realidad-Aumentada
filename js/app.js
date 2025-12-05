// ===== BARRA DE PROGRESO =====
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

const modelViewer = document.querySelector('#avatar');
modelViewer.addEventListener('progress', onProgress);

// Cuando termina de cargar algún modelo
modelViewer.addEventListener('load', () => {
  console.log('Modelo cargado:', modelViewer.src);
  modelViewer.play();
});

// ===== CAMBIAR MODELO CON HOTSPOTS INMERSIVOS =====
const hotspots = document.querySelectorAll('.hotspot');

hotspots.forEach((btn) => {
  btn.addEventListener('click', (event) => {
    const newSrc = event.currentTarget.dataset.src;
    if (!newSrc) return;

    // Si ya está ese modelo, no hacemos nada
    if (modelViewer.src.endsWith(newSrc)) {
      console.log('Ya está mostrando:', newSrc);
      return;
    }

    console.log('Cambiando a:', newSrc);

    modelViewer.pause();
    modelViewer.src = newSrc;

    const onLoaded = () => {
      modelViewer.play();
      modelViewer.removeEventListener('load', onLoaded);
    };

    modelViewer.addEventListener('load', onLoaded);
  });
});
