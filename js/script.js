const global = {
    currentPage: window.location.pathname,
    search: {
        term: "",
        type: "",
        page: 1,
        totalPages: 1,
        totalResults: 0
    },
    api: {
        apiKey: "960fe5eeb7ab9466bcf5d022d543c35d",
        apiUrl: "https://api.themoviedb.org/3"
    }
}

// Helper Functions for Favorites
function isFavorite(type, id) {
    const favorites = JSON.parse(localStorage.getItem('favorites')) || [];
    return favorites.some(fav => fav.type === type && fav.id === String(id));
}

function addToFavorites(type, id) {
    const favorites = JSON.parse(localStorage.getItem('favorites')) || [];
    if (!isFavorite(type, id)) {
        favorites.push({ type, id: String(id) });
        localStorage.setItem('favorites', JSON.stringify(favorites));
    }
}

function removeFromFavorites(type, id) {
    let favorites = JSON.parse(localStorage.getItem('favorites')) || [];
    favorites = favorites.filter(fav => !(fav.type === type && fav.id === String(id)));
    localStorage.setItem('favorites', JSON.stringify(favorites));
}

async function displayPopularMovies() {
    const { results } = await fetchAPIData('/movie/popular');

    results.forEach(movie => {
        const div = document.createElement('div');
        div.classList.add('card');
        div.innerHTML = `
        <a href="movie-details.html?id=${movie.id}">
            ${movie.poster_path
                ? `<img src="https://image.tmdb.org/t/p/w500${movie.poster_path}" class="card-img-top" alt="${movie.title}">`
                : `<img src="../images/no-image.jpg" class="card-img-top" alt="${movie.title}" />`
            }
        </a>
        <div class="card-body">
            <h5 class="card-title">${movie.title}</h5>
            <p class="card-text">
            <small class="text-muted">Release: ${movie.release_date}</small>
            </p>
            <button class="favorite-btn" data-type="movie" data-id="${movie.id}">
            ♥
            </button>
        </div>
        `;
        document.querySelector('#popular-movies').appendChild(div);
    });
    attachFavoriteListeners();
}

async function displayPopulartvShows() {
    const { results } = await fetchAPIData('/tv/popular');

    results.forEach(show => {
        const div = document.createElement('div');
        div.classList.add('card');
        div.innerHTML = `
        <a href="tv-details.html?id=${show.id}">
            ${show.poster_path
                ? `<img src="https://image.tmdb.org/t/p/w500${show.poster_path}" class="card-img-top" alt="${show.name}">`
                : `<img src="../images/no-image.jpg" class="card-img-top" alt="${show.name}" />`
            }
        </a>
        <div class="card-body">
            <h5 class="card-title">${show.name}</h5>
            <p class="card-text">
            <small class="text-muted">Air Date: ${show.first_air_date}</small>
            </p>
            <button class="favorite-btn" data-type="tv" data-id="${show.id}">
            ♥
            </button>
        </div>
        `;
        document.querySelector('#popular-shows').appendChild(div);
    });
    attachFavoriteListeners();
}

async function displayMovieDetail() {
    const movieId = window.location.search.split('=')[1];
    const movie = await fetchAPIData(`/movie/${movieId}`);
    displayBackgroundImage("movie", movie.backdrop_path);
    const div = document.createElement('div');
    div.innerHTML = `
    <div class="details-top">
        <div>
            ${movie.poster_path
            ? `<img src="https://image.tmdb.org/t/p/w500${movie.poster_path}" class="card-img-top" alt="${movie.title}">`
            : `<img src="../images/no-image.jpg" class="card-img-top" alt="${movie.title}" />`}
        </div>
        <div>
            <h2>${movie.title}</h2>
            <p>
            <i class="fas fa-star text-primary"></i>
            ${movie.vote_average.toFixed(1)} / 10
            </p>
            <p class="text-muted">Release Date: ${movie.release_date}</p>
            <p>
            ${movie.overview}
            </p>
            <h5>Genres</h5>
            <ul class="list-group">
            ${movie.genres.map(genre => `<li class="list-group-item">${genre.name}</li>`).join('')}
            </ul>
            <a href="${movie.homepage}" target="_blank" class="btn">Visit Movie Homepage</a>
            <button class="btn fav-btn" data-type="movie" data-id="${movie.id}">
                ${isFavorite('movie', movie.id) ? 'Remove from Favorites' : 'Add to Favorites'}
            </button>
        </div>
    </div>
    <div class="details-bottom">
        <h2>Movie Info</h2>
        <ul>
            <li><span class="text-secondary">Budget:</span> $${addCommasToNumber(movie.budget)}</li>
            <li><span class="text-secondary">Revenue:</span> $${addCommasToNumber(movie.revenue)}</li>
            <li><span class="text-secondary">Runtime:</span> ${movie.runtime} min</li>
            <li><span class="text-secondary">Status:</span> ${movie.status}</li>
        </ul>
        <h4>Production Companies</h4>
        <div class="list-group">
            ${movie.production_companies.map(company => `<span>${company.name}<span>`).join(', ')}
        </div>
    </div>
    `;
    document.querySelector('#movie-details').appendChild(div);

    const favButton = document.querySelector('.fav-btn');
    favButton.addEventListener('click', () => {
        const type = favButton.dataset.type;
        const id = favButton.dataset.id;
        if (isFavorite(type, id)) {
            removeFromFavorites(type, id);
            favButton.textContent = 'Add to Favorites';
        } else {
            addToFavorites(type, id);
            favButton.textContent = 'Remove from Favorites';
        }
    });
}

async function displayShowDetail() {
    const showId = window.location.search.split('=')[1];
    const show = await fetchAPIData(`/tv/${showId}`);
    displayBackgroundImage("show", show.backdrop_path);
    const div = document.createElement('div');
    div.innerHTML = `
    <div class="details-top">
        <div>
        ${show.poster_path
            ? `<img src="https://image.tmdb.org/t/p/w500${show.poster_path}" class="card-img-top" alt="${show.name}">`
            : `<img src="../images/no-image.jpg" class="card-img-top" alt="${show.name}" />`
        }
        </div>
        <div>
            <h2>${show.name}</h2>
            <p>
            <i class="fas fa-star text-primary"></i>
            ${show.vote_average.toFixed(1)} / 10
            </p>
            <p class="text-muted">Release Date: ${show.last_air_date}</p>
            <p>
            ${show.overview}
            </p>
            <h5>Genres</h5>
            <ul class="list-group">
            ${show.genres.map(genre => `<li class="list-group-item">${genre.name}</li>`).join('')}
            </ul>
            <a href="${show.homepage}" target="_blank" class="btn">Visit Show Homepage</a>
            <button class="btn fav-btn" data-type="tv" data-id="${show.id}">
                ${isFavorite('tv', show.id) ? 'Remove from Favorites' : 'Add to Favorites'}
            </button>
        </div>
    </div>
    <div class="details-bottom">
        <h2>Show Info</h2>
        <ul>
            <li><span class="text-secondary">Number of Episodes:</span> ${show.number_of_episodes}</li>
            <li><span class="text-secondary">Last Episode to Air:</span> ${show.last_episode_to_air.name}</li>
            <li><span class="text-secondary">Status:</span> ${show.status}</li>
        </ul>
        <h4>Production Companies</h4>
        <div class="list-group">
        ${show.production_companies.map(company => `<span>${company.name}<span>`).join(', ')}
        </div>
    </div>
    `;
    document.querySelector('#show-details').appendChild(div);

    const favButton = document.querySelector('.fav-btn');
    favButton.addEventListener('click', () => {
        const type = favButton.dataset.type;
        const id = favButton.dataset.id;
        if (isFavorite(type, id)) {
            removeFromFavorites(type, id);
            favButton.textContent = 'Add to Favorites';
        } else {
            addToFavorites(type, id);
            favButton.textContent = 'Remove from Favorites';
        }
    });
}

async function displayFavorites() {
    const favorites = JSON.parse(localStorage.getItem('favorites')) || [];
    const favoritesContainer = document.querySelector('#favorites');
    favoritesContainer.innerHTML = '';

    if (favorites.length === 0) {
        favoritesContainer.innerHTML = '<p>You have no favorites yet.</p>';
        return;
    }

    for (const favorite of favorites) {
        const endpoint = favorite.type === 'movie' ? `/movie/${favorite.id}` : `/tv/${favorite.id}`;
        try {
            const data = await fetchAPIData(endpoint);
            // Check if essential data is present
            if (!data || (!data.title && !data.name)) {
                throw new Error('Invalid data received');
            }
            const div = document.createElement('div');
            div.classList.add('card');
            div.innerHTML = `
                <a href="${favorite.type}-details.html?id=${favorite.id}">
                    ${data.poster_path
                    ? `<img src="https://image.tmdb.org/t/p/w500${data.poster_path}" class="card-img-top" alt="${favorite.type === 'movie' ? data.title : data.name}">`
                    : `<img src="../images/no-image.jpg" class="card-img-top" alt="${favorite.type === 'movie' ? data.title : data.name}" />`
                }
                </a>
                <div class="card-body">
                    <h5 class="card-title">${favorite.type === 'movie' ? data.title || 'N/A' : data.name || 'N/A'}</h5>
                    <p class="card-text">
                        <small class="text-muted">${favorite.type === 'movie'
                    ? 'Release: ' + (data.release_date || 'N/A')
                    : 'First Air Date: ' + (data.first_air_date || 'N/A')}</small>
                    </p>
                    <span class="remove-fav-btn" data-type="${favorite.type}" data-id="${favorite.id}">Remove from Favorites</span>
                </div>
            `;
            const removeButton = div.querySelector('.remove-fav-btn');
            removeButton.addEventListener('click', () => {
                removeFromFavorites(favorite.type, favorite.id);
                div.remove();
                displayFavorites(); // Refresh the list
            });
            favoritesContainer.appendChild(div);
        } catch (error) {
            console.error('Error fetching favorite item:', error);
            showAlert('Failed to load a favorite item.', 'error');
        }
    }
}

function attachFavoriteListeners() {
    const favButtons = document.querySelectorAll('.favorite-btn');
    favButtons.forEach(button => {
        button.addEventListener('click', () => {
            const type = button.dataset.type;
            const id = button.dataset.id;
            if (isFavorite(type, id)) {
                removeFromFavorites(type, id);
                button.classList.remove('active');
            } else {
                addToFavorites(type, id);
                button.classList.add('active');
            }
        });
    });
}

function displayBackgroundImage(type, backgroundPath) {
    const overlayDiv = document.createElement('div');
    overlayDiv.style.backgroundImage = `url(https://image.tmdb.org/t/p/original/${backgroundPath})`;
    overlayDiv.style.backgroundSize = 'cover';
    overlayDiv.style.backgroundPosition = 'center';
    overlayDiv.style.backgroundRepeat = 'no-repeat';
    overlayDiv.style.height = '100vh';
    overlayDiv.style.width = '100vw';
    overlayDiv.style.position = 'absolute';
    overlayDiv.style.top = '0';
    overlayDiv.style.left = '0';
    overlayDiv.style.zIndex = '-1';
    overlayDiv.style.opacity = '0.1';

    if (type === 'movie') {
        document.querySelector('#movie-details').appendChild(overlayDiv);
    } else {
        document.querySelector('#show-details').appendChild(overlayDiv);
    }
}

async function search() {
    const queryString = window.location.search;
    const urlParams = new URLSearchParams(queryString);
    global.search.type = urlParams.get('type');
    global.search.term = urlParams.get('search-term');

    if (global.search.term !== "" && global.search.type !== null) {
        const { results, total_pages, page, total_results } = await searchAPIData();
        global.search.page = page;
        global.search.totalPages = total_pages;
        global.search.totalResults = total_results;
        if (results.length === 0) {
            showAlert("No results found");
            return;
        }
        displaySearchResults(results);
        document.querySelector("#search-term").value = "";
    } else {
        showAlert("Please enter a search term");
    }
}

function displaySearchResults(results) {
    document.querySelector('#search-results').innerHTML = '';
    document.querySelector('#search-results-heading').innerHTML = '';
    document.querySelector('#pagination').innerHTML = '';

    results.forEach(result => {
        const div = document.createElement('div');
        div.classList.add('card');
        div.innerHTML = `
        <a href="${global.search.type}-details.html?id=${result.id}">
            ${result.poster_path
                ? `<img src="https://image.tmdb.org/t/p/w500/${result.poster_path}" class="card-img-top" alt="${global.search.type === 'movie' ? result.title : result.name}">`
                : `<img src="../images/no-image.jpg" class="card-img-top" alt="${global.search.type === 'movie' ? result.title : result.name}" />`
            }
        </a>
        <div class="card-body">
            <h5 class="card-title">${global.search.type === 'movie' ? result.title : result.name}</h5>
            <p class="card-text">
            <small class="text-muted">Release: ${global.search.type === 'movie' ? result.release_date : result.first_air_date}</small>
            </p>
        </div>
        `;
        document.querySelector('#search-results-heading').innerHTML = `
        <h2>${results.length} of ${global.search.totalResults} Results for ${global.search.term}</h2>
        `;
        document.querySelector('#search-results').appendChild(div);
    });
    displayPagination();
}

function displayPagination() {
    const div = document.createElement('div');
    div.classList.add('pagination');
    div.innerHTML = `
    <button class="btn btn-primary" id="prev">Prev</button>
    <button class="btn btn-primary" id="next">Next</button>
    <div class="page-counter">Page ${global.search.page} of ${global.search.totalPages}</div>
    `;
    document.querySelector('#pagination').appendChild(div);

    if (global.search.page === 1) {
        document.querySelector('#prev').disabled = true;
    }
    if (global.search.page === global.search.totalPages) {
        document.querySelector('#next').disabled = true;
    }

    document.querySelector('#next').addEventListener('click', async () => {
        global.search.page++;
        const { results, total_pages } = await searchAPIData();
        displaySearchResults(results);
    });

    document.querySelector('#prev').addEventListener('click', async () => {
        global.search.page--;
        const { results, total_pages } = await searchAPIData();
        displaySearchResults(results);
    });
}

async function displaySlider() {
    const { results } = await fetchAPIData('/movie/now_playing');
    results.forEach((movie) => {
        const div = document.createElement('div');
        div.classList.add('swiper-slide');
        div.innerHTML = `
        <a href="movie-details.html?id=${movie.id}">
            <img src="https://image.tmdb.org/t/p/w500${movie.poster_path}" alt="${movie.title}" />
        </a>
        <h4 class="swiper-rating">
            <i class="fas fa-star text-secondary"></i> ${movie.vote_average} / 10
        </h4>
        `;
        document.querySelector('.swiper-wrapper').appendChild(div);
        initSwiper();
    });
}

function initSwiper() {
    const swiper = new Swiper('.swiper', {
        slidesPerView: 1,
        spaceBetween: 30,
        loop: true,
        freeMode: true,
        autoplay: {
            delay: 4000,
            disableOnInteraction: false,
        },
        breakpoints: {
            500: {
                slidesPerView: 2,
            },
            700: {
                slidesPerView: 3,
            },
            1200: {
                slidesPerView: 4,
            }
        }
    });
}

async function fetchAPIData(endpoint) {
    const API_KEY = global.api.apiKey;
    const API_URL = global.api.apiUrl;
    showSpinner();

    const response = await fetch(
        `${API_URL}${endpoint}?api_key=${API_KEY}&language=en-US`
    );

    const data = await response.json();
    hideSpinner();
    return data;
}

async function searchAPIData() {
    const API_KEY = global.api.apiKey;
    const API_URL = global.api.apiUrl;
    showSpinner();

    const response = await fetch(
        `${API_URL}/search/${global.search.type}?api_key=${API_KEY}&language=en-US&query=${global.search.term}&page=${global.search.page}`
    );

    const data = await response.json();
    hideSpinner();
    return data;
}

function showSpinner() {
    document.querySelector('.spinner').classList.add('show');
}

function hideSpinner() {
    document.querySelector('.spinner').classList.remove('show');
}

function highlightActiveLink() {
    const links = document.querySelectorAll('.nav-link');
    links.forEach(link => {
        if (link.getAttribute('href') === global.currentPage) {
            link.classList.add('active');
        }
    });
}

function showAlert(message, className = "error") {
    const alertEl = document.createElement('div');
    alertEl.classList.add("alert", className);
    alertEl.appendChild(document.createTextNode(message));
    document.querySelector('#alert').appendChild(alertEl);

    setTimeout(() => alertEl.remove(), 3000);
}

function addCommasToNumber(number) {
    return number.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
}

function init() {
    switch (global.currentPage) {
        case '/':
        case '/index.html':
            displaySlider();
            displayPopularMovies();
            break;
        case '/shows.html':
            displayPopulartvShows();
            break;
        case '/movie-details.html':
            displayMovieDetail();
            break;
        case '/tv-details.html':
            displayShowDetail();
            break;
        case '/search.html':
            search();
            break;
        case '/favorites.html':
        case '/favorites':
            displayFavorites();
            break;
    }
    highlightActiveLink();
}

document.addEventListener('DOMContentLoaded', init);