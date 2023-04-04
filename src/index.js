import SimpleLightbox from 'simplelightbox';
// Додатковий імпорт стилів
import 'simplelightbox/dist/simple-lightbox.min.css';
import { Notify } from 'notiflix/build/notiflix-notify-aio';
import { galleryPictureCard } from './js-modules/galleryPictureCard';
import { fetchPhoto } from './js-modules/apiAxios';

const refs = {
  form: document.querySelector('#search-form'),
  gallery: document.querySelector('.gallery'),
  sentinel: document.querySelector('#sentinel'),
};

const lightbox = new SimpleLightbox('.gallery a', {
  animationSlide: false,
  captionsData: 'alt',
  captionDelay: 200,
});

let searchValue = '';
let numberPage = null;
let totalHits = null;
const per_page = 40;
refs.form.addEventListener('submit', onSearch);

async function onSearch(e) {
  e.preventDefault();
  numberPage = 1;
  refs.sentinel.style.display = 'none';
  refs.gallery.innerHTML = '';

  searchValue = e.target.searchQuery.value.trim();
  if (searchValue === '') {
    return Notify.failure('Sorry, type something. Please try again.');
  }

  try {
    const response = await fetchPhoto(searchValue);

    totalHits = response.data.totalHits;

    if (response.name === 'AxiosError') {
      throw new Error(response.message);
    }

    if (!totalHits) {
      Notify.failure(
        'Sorry, there are no images matching your search query. Please try again.'
      );
      return;
    } else if (totalHits === 1) {
      Notify.info(`Hooray! We found ${totalHits} image.`);
    } else {
      Notify.info(`Hooray! We found ${totalHits} images.`);
    }

    const photos = await response.data.hits;

    if (photos.length === 0) {
      Notify.failure(
        'Sorry, there are no images matching your search query. Please try again.'
      );
    }

    refs.form.reset();
    renderCard(photos);
    refs.sentinel.style.display = 'block';
  } catch (error) {
    Notify.failure(error);
  }
}

async function onLoad() {
  numberPage += 1;

  if (Math.ceil(totalHits / per_page) < numberPage) {
    return Notify.info(
      "We're sorry, but you've reached the end of search results."
    );
  }
  try {
    const response = await fetchPhoto(searchValue, numberPage);
    if (response.status !== 200) {
      throw new Error(response.status);
    }
    const photos = await response.data.hits;

    renderCard(photos);
  } catch (error) {
    Notify.failure(error.message);
  }
}

async function renderCard(data) {
  const markup = await data
    .map(
      ({
        webformatURL,
        largeImageURL,
        tags,
        likes,
        views,
        comments,
        downloads,
      }) =>
        galleryPictureCard({
          webformatURL,
          largeImageURL,
          tags,
          likes,
          views,
          comments,
          downloads,
        })
    )
    .join('');

  refs.gallery.insertAdjacentHTML('beforeend', markup);
  lightbox.refresh();
}

function smothScroll() {
  const { height: cardHeight } = document
    .querySelector('.gallery')
    .firstElementChild.getBoundingClientRect();

  window.scrollBy({
    top: cardHeight * 2,
    behavior: 'smooth',
  });
}

const onEntry = entries => {
  entries.forEach(entry => {
    if (entry.isIntersecting && searchValue !== '') {
      onLoad();
    }
  });
};
const options = {
  rootMargin: '300px',
};
const observer = new IntersectionObserver(onEntry, options);
observer.observe(refs.sentinel);
