import iziToast from 'izitoast';
import 'izitoast/dist/css/iziToast.min.css';
import { getImagesByQuery } from '../js/pixabay-api.js';
import {
  createGallery,
  clearGallery,
  showLoader,
  hideLoader,
  showLoadMoreButton,
  hideLoadMoreButton,
} from '../js/render-functions.js';

const form = document.querySelector('.form');
const loadMoreBtn = document.getElementById('load-more');

let searchQuery = '';
let currentPage = 1;
const perPage = 15;

form.addEventListener('submit', handleSearch);
loadMoreBtn.addEventListener('click', handleLoadMore);

async function handleSearch(event) {
  event.preventDefault();

  searchQuery = event.target.elements.searchQuery.value.trim();

  if (searchQuery === '') {
    iziToast.warning({
      message: 'Please enter a search query!',
      position: 'topRight',
      timeout: 4000,
      close: true,
      backgroundColor: '#FFA000',
      messageColor: '#FFF',
      iconColor: '#FFF',
      progressBarColor: '#CC8000',
      theme: 'dark',
    });
    return;
  }

  currentPage = 1;
  clearGallery();
  hideLoadMoreButton();
  showLoader();

  try {
    const data = await getImagesByQuery(searchQuery, currentPage);

    if (data.hits.length === 0) {
      iziToast.error({
        message:
          'Sorry, there are no images matching your search query. Please try again!',
        position: 'topRight',
        timeout: 5000,
        close: true,
        backgroundColor: '#EF4444',
        messageColor: '#FFF',
        iconColor: '#FFF',
        progressBarColor: '#B91C1C',
        theme: 'dark',
      });
      return;
    }

    // Рендеримо картки
    createGallery(data.hits);

    // Логіка перевірки кінця колекції на першій же сторінці:
    if (data.totalHits <= perPage) {
      // Якщо всього картинок менше або рівно 15, ховаємо кнопку і кажемо, що це кінець
      hideLoadMoreButton();
      iziToast.info({
        message: "We're sorry, but you've reached the end of search results.",
        position: 'topRight',
        timeout: 5000,
        close: true,
        backgroundColor: '#4E75FF',
        messageColor: '#FFF',
        iconColor: '#FFF',
        progressBarColor: '#2563EB',
        theme: 'dark',
      });
    } else {
      // Якщо картинок більше ніж 15 — показуємо кнопку "Load more"
      showLoadMoreButton();
    }
  } catch (error) {
    iziToast.error({
      message: 'Something went wrong. Please try again later.',
      position: 'topRight',
      backgroundColor: '#EF4444',
      messageColor: '#FFF',
      theme: 'dark',
    });
    console.error(error);
  } finally {
    hideLoader();
    form.reset();
  }
}

async function handleLoadMore() {
  currentPage += 1;
  hideLoadMoreButton();
  showLoader();

  try {
    const data = await getImagesByQuery(searchQuery, currentPage);

    createGallery(data.hits);
    smoothScroll();

    const maxPage = Math.ceil(data.totalHits / perPage);
    if (currentPage >= maxPage) {
      iziToast.info({
        message: "We're sorry, but you've reached the end of search results.",
        position: 'topRight',
        timeout: 5000,
        close: true,
        backgroundColor: '#4E75FF',
        messageColor: '#FFF',
        iconColor: '#FFF',
        progressBarColor: '#2563EB',
        theme: 'dark',
      });
    } else {
      showLoadMoreButton();
    }
  } catch (error) {
    iziToast.error({
      message: 'Failed to load more images.',
      position: 'topRight',
      backgroundColor: '#EF4444',
      messageColor: '#FFF',
      theme: 'dark',
    });
    console.error(error);
  } finally {
    hideLoader();
  }
}

function smoothScroll() {
  const firstCard = document.querySelector('.gallery-item');
  if (firstCard) {
    const { height: cardHeight } = firstCard.getBoundingClientRect();
    window.scrollBy({
      top: cardHeight * 2,
      behavior: 'smooth',
    });
  }
}
