import { refs } from './refs';
import { fetchData } from './fetch-data';
import { Notify } from 'notiflix/build/notiflix-notify-aio';
import { animationLoader, animationLoaderFinaly } from './loader-function';
import { renderListImage } from './render-list';
import { BASE_URL, key } from './http';
import axios from 'axios';
import SimpleLightbox from 'simplelightbox';

// Дополнительный импорт стилей
import 'simplelightbox/dist/simple-lightbox.min.css';

export let currentValue = null;
let page = 0;


// Настройки для Intersection Observer
const options = {
  root: null,
  rootMargin: '300px',
  treshold: 0,
};

// Создание экземпляра Intersection Observer
const observer = new IntersectionObserver(() => {
  page += 1;
  animationLoader();

  // Вызов функции fetcLoadMore для загрузки дополнительных изображений
  fetcLoadMore()
    .then(data => {
      renderMoreImage(data);
    })
    .catch(() => {
      Notify.failure('Ошибка загрузки');
    })
    .finally(() => animationLoaderFinaly());
}, options);

// Добавление слушателя события "submit" на форму
refs.form.addEventListener('submit', e => {
    e.preventDefault()
    submitForm(e);

    // Начало наблюдения за элементом с id "jsGuard"
observer.observe(refs.jsGuard);
});

// Функция для обработки отправки формы
function submitForm(event) {
  event.preventDefault();
  animationLoader();
  page = 1; // Обнуление страницы при новом запросе
  currentValue = refs.form.elements.searchQuery.value.trim();

  // Вызов функции fetchData для получения данных
  fetchData()
    .then(data => {
      if (data.data.hits.length === 0) {
        Notify.failure(
          'Sorry, there are no images matching your search query. Please try again.'
        );
      }
      refs.gallery.innerHTML = renderListImage(data.data.hits);
      initializeLightbox();
    })
    .catch(console.log)
    .finally(() => animationLoaderFinaly());
}

// Запрос для скролла
async function fetcLoadMore() {
  const options = {
    params: {
      key: key,
      q: currentValue,
      image_type: 'photo',
      orientation: 'horizontal',
      safesearch: true,
      page,
      per_page: 40,
    },
  };

  const response = await axios.get(BASE_URL, options);

  return response;
}

// Функция для инициализации библиотеки SimpleLightbox
function initializeLightbox() {
  const lightbox = new SimpleLightbox('.gallery a');
}







// Функция для отображения дополнительных изображений
function renderMoreImage(data) {
  refs.gallery.insertAdjacentHTML(
    'beforeend',
    renderListImage(data.data.hits)
  );

  initializeLightbox();
}
