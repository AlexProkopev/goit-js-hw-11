import { refs } from './refs';
import { fetchData } from './fetch-data';
import { Notify } from 'notiflix/build/notiflix-notify-aio';
import { animationLoader, animationLoaderFinaly } from './loader-function';
import { renderListImage } from './render-list';
import SimpleLightbox from 'simplelightbox';

// Дополнительный импорт стилей
import 'simplelightbox/dist/simple-lightbox.min.css';

// Объявление переменных
let currentValue = null; // Значение текущего поискового запроса
let page = 1; // Текущая страница результатов
let num = 0; // Количество загруженных изображений
let isLoading = false; // Флаг, указывающий, выполняется ли загрузка
let lastPage = 0; // Последняя страница результатов
let currentPage = 0; // Текущая страница результатов

// Обработчик события отправки формы поиска
refs.form.addEventListener('submit', searchImage);

// Создание экземпляра Intersection Observer для бесконечной загрузки
const observer = new IntersectionObserver(loadMoreData, {
  root: null, // Наблюдение в пределах всего видимого окна
  rootMargin: '200px', // Дополнительные отступы вокруг корня
  threshold: 1, // Порог наблюдения
});

// Функция для обработки события отправки формы поиска
function searchImage(event) {
  event.preventDefault();

   // Прекращение наблюдения через Intersection Observer перед новым поиском
  observer.unobserve(refs.jsGuard);

  num = 0
  refs.gallery.innerHTML = ''; // Очистка галереи перед новым запросом
  animationLoader();
  
  page = 1; // Обнуление номера страницы перед новым запросом

  currentValue = refs.form.elements.searchQuery.value.trim();

  if (currentValue === '') {
    Notify.failure('Request cannot be empty');
    animationLoaderFinaly();
  } else {
    fetchAndRenderImages(); // Запуск функции загрузки и отображения изображений
  }
}

// Функция для инициализации библиотеки SimpleLightbox
function initializeLightbox() {
  const lightbox = new SimpleLightbox('.gallery a'); // Инициализация лайтбокса для изображений
}

// Функция для загрузки дополнительных изображений при прокрутке
function loadMoreData(entries) {
  if (isLoading) return; // Если уже выполняется загрузка, прекращаем выполнение

  entries.forEach(entry => {
    if (entry.isIntersecting) {
      isLoading = true;
      page += 1; // Увеличение номера страницы для загрузки следующей порции изображений
      animationLoader();
      fetchAndRenderMoreImages(); // Загрузка и отображение дополнительных изображений
    }
  });
}

// Функция для загрузки и отображения дополнительных изображений
async function fetchAndRenderMoreImages() {
  try {
    const data = await fetchData(currentValue, page); // Запрос данных с сервера

    refs.gallery.insertAdjacentHTML('beforeend', renderListImage(data.hits)); // Отображение полученных изображений

    initializeLightbox(); // Инициализация лайтбокса для новых изображений

    num += data.hits.length; // Увеличение счетчика загруженных изображений

    lastPage = Math.ceil(data.totalHits / 40); // Вычисление последней страницы результатов
    currentPage = Math.ceil(num / 40); // Вычисление текущей страницы результатов
    console.log(lastPage);
    console.log(currentPage);

    if (currentPage === lastPage) {
      observer.unobserve(refs.jsGuard); // Отключение бесконечной загрузки, если достигнут конец результатов
      animationLoaderFinaly();
      Notify.failure('The last page has been loaded');
    }

    animationLoaderFinaly();
    isLoading = false;
    smoothScrollToNextGroup()
  } catch (error) {
    Notify.failure('Oops erore'); // Обработка ошибки при загрузке данных
  }
}

// Функция для загрузки и отображения изображений при отправке формы
async function fetchAndRenderImages() {
  try {
    const data = await fetchData(currentValue, page); // Запрос данных с сервера
    Notify.success(`Hooray! We found ${data.totalHits} images.`); // Уведомление об успешной загрузке

    observer.observe(refs.jsGuard); // Начало наблюдения за бесконечной загрузкой

    if (data.hits.length === 0) {
      Notify.failure(
        'Sorry, there are no images matching your search query. Please try again.'
      ); // Уведомление о отсутствии результатов

      animationLoaderFinaly();
    }

    refs.gallery.insertAdjacentHTML('beforeend', renderListImage(data.hits)); // Отображение полученных изображений

    initializeLightbox(); // Инициализация лайтбокса для изображений

    animationLoaderFinaly();

    num += data.hits.length; // Увеличение счетчика загруженных изображений

    if (data.totalHits < 40) {
      observer.unobserve(refs.jsGuard); // Отключение бесконечной загрузки, если общее количество изображений меньше 40
      return;
    } else if (num === data.totalHits) {
      observer.unobserve(refs.jsGuard); // Отключение бесконечной загрузки, если загружено все доступное количество изображений
      animationLoaderFinaly();
      return;
    }
  } catch (error) {
    Notify.failure('An error occurred on the server, please try later'); // Обработка ошибки при загрузке данных
    animationLoaderFinaly();
  }
}


function smoothScrollToNextGroup() {
  const { height: cardHeight } = document
    .querySelector(".gallery")
    .firstElementChild.getBoundingClientRect();

  window.scrollBy({
    top: cardHeight * 2,
    behavior: "smooth",
  });
}
