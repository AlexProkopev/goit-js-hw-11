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

export let currentValue = '';
let page = 0;

refs.form.addEventListener('submit', e => {
  submitForm(e);
});

function submitForm(event) {
  event.preventDefault();
  animationLoader();
  page = 1; // Обнуление страницы при новом запросе
  currentValue = refs.form.elements.searchQuery.value.trim();

  fetchData()
    .then(data => {
      if (data.data.hits.length === 0) {
        Notify.failure(
          'Sorry, there are no images matching your search query. Please try again.'
        );
      }
      refs.gallery.innerHTML = renderListImage(data.data.hits);
        initializeLightbox()
        
        
    })
    .catch(console.log)
    .finally(() => animationLoaderFinaly());
}


//Запрос для скролла
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

// функция для вызова библиотеки
function initializeLightbox() {
  const lightbox = new SimpleLightbox('.gallery a');
}

const options = {
  root: null,
  rootMargin: '300px',
  treshold: 0,
};

const observer = new IntersectionObserver(() => {
  page += 1;
    animationLoader();

    fetcLoadMore().then(data => {
      renderMoreImage(data)
    }).catch(() => {
        Notify.failure("Ошибка загрузки")
    }).finally(() => animationLoaderFinaly());
}, options);

observer.observe(refs.jsGuard);


function renderMoreImage(data) {
    refs.gallery.insertAdjacentHTML(
      'beforeend',
      renderListImage(data.data.hits)
        );
        
        initializeLightbox()
}

