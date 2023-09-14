import { refs } from './refs';

function animationLoader() {
  refs.btnForm.classList.add('is-hidden');
  refs.loader.classList.remove('is-hidden');
}

function animationLoaderFinaly() {
  refs.loader.classList.add('is-hidden');
  refs.btnForm.classList.remove('is-hidden');
}

export { animationLoader, animationLoaderFinaly };
