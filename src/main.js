import iziToast from 'izitoast';
import 'izitoast/dist/css/iziToast.min.css';
import SimpleLightbox from 'simplelightbox';
import 'simplelightbox/dist/simple-lightbox.min.css';
import axios from 'axios';

const refs = {
  input: document.querySelector('[type="text"]'),
  searchBtn: document.querySelector('[type="submit"]'),
  gallery: document.querySelector('.gallery'),
  loadBtn: document.querySelector('.js-load'),
  loadDiv: document.querySelector('.js-loader'),
};

const params = {
  API_KEY: '41488002-513c6a9a4c115eae6a99045d3',
};
axios.defaults.baseURL = 'https://pixabay.com/api/';

let currentPage = 1;
const per_page = 40;
let lightbox = new SimpleLightbox('.gallery a');
let galleryItemHeight;

function toggleLoader(visible) {
  refs.loadDiv.innerHTML = visible ? '<span class="loader"></span>' : '';
  refs.loadBtn.classList.toggle('hidden', !visible);
}

async function getGaleryItems(page = currentPage) {
  try {
    const response = await axios.get(
      `?key=${params.API_KEY}&q=${refs.input.value}&image_type=photo&orientation=horizontal&safesearch=true&page=${page}&per_page=${per_page}`
    );

    return response.data;
  } catch (error) {
    console.error(error);
    iziToast.error({
      message: 'Oops! Something went wrong. Please try again later.',
      position: 'topRight',
    });
  }
}

refs.searchBtn.addEventListener('click', onSearch);
refs.loadBtn.addEventListener('click', onClick);

async function onSearch(e) {
  e.preventDefault();
  if (refs.input.value.trim() === '') {
    iziToast.error({
      message: 'Sorry, the field must be filled in!',
      position: 'topRight',
    });
    return;
  }

  currentPage = 1;
  toggleLoader(true);

  try {
    const data = await getGaleryItems();
    refs.gallery.innerHTML = createMarkup(data.hits);
    lightbox.refresh();
    if (data.hits.length > 0) {
      iziToast.info({
        message: `Total Hits: ${data.totalHits}, Loaded Files: ${data.hits.length}`,
        position: 'topRight',
      });
    }
    refs.loadBtn.classList.toggle('hidden', per_page >= data.totalHits);
  } catch (err) {
    console.error(err);
  } finally {
    toggleLoader(false);
  }
}

async function onClick(e) {
  e.preventDefault();
  currentPage += 1;
  toggleLoader(true);

  try {
    const data = await getGaleryItems(currentPage);
    refs.gallery.insertAdjacentHTML('beforeend', createMarkup(data.hits));
    lightbox.refresh();

    iziToast.info({
      message: `Loaded Files: ${data.hits.length}`,
      position: 'topRight',
    });

    if (data.totalHits / per_page <= currentPage) {
      refs.loadBtn.classList.toggle('hidden', true);
      refs.loadDiv.innerHTML = '';
      iziToast.info({
        message: "We're sorry, but you've reached the end of search results.",
        position: 'topRight',
      });
    } else if (data.totalHits / per_page >= currentPage) {
      refs.loadDiv.innerHTML = '';
      refs.loadBtn.classList.toggle('hidden', false);
    }

    const galleryItem = document.querySelector('.gallery-item');
    galleryItemHeight = galleryItem.getBoundingClientRect().height;
    scrollBy({
      top: galleryItemHeight * 3,
      behavior: 'smooth',
    });
  } catch (err) {
    console.error(err);
  } finally {
    toggleLoader(false);
  }
}

function createMarkup(arr) {
  if (arr.length === 0) {
    iziToast.error({
      message:
        'Sorry, there are no images matching <br> your search query. Please try again!',
      position: 'topRight',
    });
  }
  return arr
    .map(
      ({
        webformatURL,
        largeImageURL,
        tags,
        likes,
        views,
        comments,
        downloads,
      }) => {
        return `
    <li class='gallery-item'>
        <a href='${largeImageURL}'>
            <img src="${webformatURL}" alt="${tags}" data-source=${largeImageURL} class='gallery-img'/>
        </a>
        <div class='text-container'>
            <p>Likes<span>${likes}</span></p>
            <p>Views<span>${views}</span></p>
            <p>Comments<span>${comments}</span></p>
            <p>Downloads<span>${downloads}</span></p>
        </div>
    </li>`;
      }
    )
    .join('');
}
