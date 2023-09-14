import { refs } from './refs';
import { fetchData } from './fetch-data';
import { Notify } from 'notiflix/build/notiflix-notify-aio';
import { animationLoader, animationLoaderFinaly } from './loader-function';
import { renderListImage } from './render-list';
import SimpleLightbox from 'simplelightbox';

// Дополнительный импорт стилей
import 'simplelightbox/dist/simple-lightbox.min.css';

let currentValue = null;
let page = 1;

refs.form.addEventListener('submit', searchImage);

// Создание экземпляра Intersection Observer
const observer = new IntersectionObserver(loadMoreData, { threshold: 0 });

function searchImage(event) {
  event.preventDefault();
  page = 1;
  refs.gallery.innerHTML = '';
  animationLoader();

  currentValue = refs.form.elements.searchQuery.value.trim();

  if (currentValue === '') {
    Notify.failure('Запрос не может быть пустым');
    animationLoaderFinaly();
  } else {
    fetchData(currentValue, page)
      .then(data => {
        if (data.data.hits.length === 0) {
          Notify.failure(
            'Sorry, there are no images matching your search query. Please try again.'
          );
        }

        refs.gallery.insertAdjacentHTML(
          'beforeend',
          renderListImage(data.data.hits)
        );

        initializeLightbox();
      })
      .catch(() =>
        Notify.failure(`We're sorry, but you've reached the end of search results.`)
      )
      .finally(() => {
        animationLoaderFinaly();
        observer.observe(refs.jsGuard);
      });
  }
}

// Функция для инициализации библиотеки SimpleLightbox
function initializeLightbox() {
  const lightbox = new SimpleLightbox('.gallery a');
}

let isLoading = false;
function loadMoreData(entries) {
  if (isLoading) return; // проверка что если уже выполняется загрузка, не запускаем ещё одну

  entries.forEach(entry => {
    if (entry.isIntersecting) {
      isLoading = true;
      page += 1;
      animationLoader();

      fetchData(currentValue, page)
        .then(data => {
          refs.gallery.insertAdjacentHTML(
            'beforeend',
            renderListImage(data.data.hits)
          );

          initializeLightbox();

          if (data.totalHits === page) {
            Notify.failure('Больше изображений нет');
          }
        })
        .catch(() => Notify.failure('Error fetching more data'))
        .finally(() => {
          animationLoaderFinaly();
          isLoading = false;
        });
    }
  });
}
