import axios from 'axios';
import iziToast from 'izitoast';
import 'izitoast/dist/css/iziToast.min.css';
import simpleLightbox from 'simplelightbox';
import 'simplelightbox/dist/simple-lightbox.min.css';

const form = document.querySelector('.search-form');
const input = document.querySelector('.search-input');
const gallery = document.querySelector('.gallery');
const loader = document.querySelector('.loader');
loader.style.display = 'none';

let page = 1;
const perPage = 40;
const loadMoreBtn = document.querySelector('.load-more');
loadMoreBtn.style.display = 'none';

let query = '';

axios.defaults.baseURL = 'https://pixabay.com';
const url = `/api/`;

let modal = new simpleLightbox('ul.gallery a', {
  captionDelay: 250,
  captionsData: 'alt',
});

form.addEventListener('submit', async event => {
  event.preventDefault();
  query = input.value.trim();
  gallery.innerHTML = '';
  input.value = '';

  if (query === '') return;
  loader.style.display = 'block';
  input.value = '';

  page = 1;

  try {
    const response = await axios.get(url, {
      params: searchParams(query),
    });

    loader.style.display = 'none';
    const data = response.data;

    if (data.hits.length === 0) {
      throw iziToast.show({
        message:
          'Sorry, there are no images matching your search query. Please try again!',
        theme: 'dark',
        backgroundColor: '#EF4040',
        titleColor: 'white',
        position: 'topRight',
      });
    }

    renderImages(data.hits);

    if (data.totalHits <= perPage * page) {
      hideLoadMoreButton();
      iziToast.show({
        message: "You've reached the end of search results.",
        theme: 'dark',
        backgroundColor: '#EF4040',
        titleColor: 'white',
        position: 'topRight',
      });
    } else {
      showLoadMoreButton();
    }

    modal.refresh();
  } catch (error) {
    handleFetchError(error);
  }
});

loadMoreBtn.addEventListener('click', async () => {
  page += 1;

  try {
    const response = await axios.get(url, {
      params: searchParams(query),
    });

    loader.style.display = 'none';
    const data = response.data;

    if (data.totalHits <= perPage * page) {
      hideLoadMoreButton();
      iziToast.show({
        message: "You've reached the end of search results.",
        theme: 'dark',
        backgroundColor: '#EF4040',
        titleColor: 'white',
        position: 'topRight',
      });
    }

    renderImages(data.hits);
    scrollByTwoGalleryItems();

    modal.refresh();
  } catch (error) {
    handleFetchError(error);
  }
});

const renderImages = images => {
  const html = images.reduce(
    (
      html,
      { webformatURL, largeImageURL, tags, likes, views, comments, downloads }
    ) =>
      html +
      `<li class="gallery-item">
          <a class="gallery-link" href="${largeImageURL}">
           <img class="gallery-image"
           src="${webformatURL}"
           alt="${tags}"
           />
          </a>          
          <div class="description">
          <p>Likes:<span>${likes}</span></p>
          <p>Views:<span>${views}</span></p>
          <p>Comments:<span>${comments}</span></p>
          <p>Downloads:<span>${downloads}</span></p>
          </div> 
        </li>`,
    ''
  );

  gallery.insertAdjacentHTML('beforeend', html);
};

const hideLoadMoreButton = () => {
  loadMoreBtn.style.display = 'none';
};

const showLoadMoreButton = () => {
  loadMoreBtn.style.display = 'block';
};

const scrollByTwoGalleryItems = () => {
  const firstGalleryItem = document.querySelector('.gallery-item');
  const galleryItemHeight = firstGalleryItem.getBoundingClientRect().height;

  window.scrollBy({
    top: galleryItemHeight * 2,
    behavior: 'smooth',
  });
};

const searchParams = query =>
  new URLSearchParams({
    key: '41544078-5d11fd93221b0dd23a16f477d',
    q: query,
    image_type: 'photo',
    orientation: 'horizontal',
    safesearch: 'true',
    page: page,
    per_page: perPage,
  });

const handleFetchError = error => {
  loader.style.display = 'none';
  iziToast.error({
    message: error.message || 'Error fetching data',
    color: 'red',
    position: 'topRight',
  });
};
