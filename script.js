const client_id = '6bd55496962740caa6385f0332b7bed0';
const client_secret = '9e62bb563bd14bb9bb5a7f16d5b503bd';
const artistsIds = [
    '6eUKZXaKkcviH0Ku9w2n3V',
    '1dfeR4HaWDbWqFHLkxsg1d',
    '66CXWjxzNUsdJxJ2JdwvnR',
    '04gDigrS5kc9YWfZHwBETP',
    '53XhwfbYqKCa1cC15pYq2q',
    '7dGJo4pcD2V6oG8kP0tJRR',
    '1HY2Jd0NmPuamShAr6KMms',
    '4gzpq5DPGxSnKTe4SA8HAU',
    '6vWDO969PvNqNYHIOW5v0m',
    '0du5cEVh5yTK9QJze8zA0C',
    '5pKCCKE2ajJHZ9KAiaK11H',
    '0EmeFodog0BfCgMzAIvKQp',
    '1uNFoZAHBGtllmzznpCI3s',
    '6S2OmqARrzebs0tKUEyXyp',
    '06HL4z0CvFAxyc27GXpf02'
];

async function getToken() {
    const response = await fetch('https://accounts.spotify.com/api/token', {
        method: 'POST',
        body: new URLSearchParams({
            'grant_type': 'client_credentials',
        }),
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
            'Authorization': 'Basic ' + btoa(client_id + ':' + client_secret),
        },
    });

    const data = await response.json();
    return data.access_token;
}

async function getArtists() {
    const access_token = await getToken()

    const response = await fetch(`https://api.spotify.com/v1/artists?ids=${artistsIds.join(',')}`, {
        method: 'GET',
        headers: { 'Authorization': 'Bearer ' + access_token },
    })

    const data = await response.json();

    const formattedArtists = formatArtists(data.artists);
    const topGenres = getTopGenres(data.artists);

    return {
        formattedArtists, topGenres
    };
}

function getTopGenres(artists, topN = 5) {
    const genreCount = {};

    artists.forEach(artist => {
        artist.genres.forEach(genre => {
            if (genreCount[genre]) {
                genreCount[genre]++;
            } else {
                genreCount[genre] = 1;
            }
        });
    });
    const sortedGenres = Object.entries(genreCount)
        .sort((a, b) => b[1] - a[1])
        .slice(0, topN);

    return sortedGenres.map(([genre]) => genre);
}


function formatArtists(artists) {
    return sortArtistsByFollowers(artists).map((artist, i) => ({
        top: i+1,
        name: artist.name,
        total_followers: artist.followers.total,
        popularity: artist.popularity
    }))
}

function sortArtistsByFollowers(artists) {
    return artists.sort((a, b) => b.followers.total - a.followers.total);
}

const artistsButton = document.getElementById('artist_button');
const artistRank = document.getElementById('top_artists');
const genreButton = document.getElementById('genres_button');
const genreRank = document.getElementById('top_genres');


async function initialize() {
    const { formattedArtists, topGenres } = await getArtists();
    artistRank.classList.add('hidden');
    genreRank.classList.add('hidden');

    artistHtml(formattedArtists);
    genresHtml(topGenres);
}


function artistHtml(artists) {
    const list = document.getElementById('artists_list');
    const html = (artist) => `
        <li class='artist-card'>
            <h2>${artist.top}. ${artist.name}</h2>
            <div>
                <span>Número de seguidores: ${artist.total_followers}</span>    
                <span>Popularidade: ${artist.popularity}</span>
            </div>
        </li>
    `;

    list.innerHTML = artists.map((artist) => html(artist)).join('');        
}

function genresHtml(genres) {
    const list = document.getElementById('genres_list');
    const html = (genre, top) => `
        <li>
            <h2>${top}. ${genre.charAt(0).toUpperCase() + genre.slice(1)}</h2>
        </li>
    `;

    list.innerHTML = genres.map((genre, i) => html(genre, i+1)).join('');        
}

initialize();

artistsButton.addEventListener('click', () => {
    genreRank.classList.add('hidden')
    artistRank.classList.remove('hidden')
})

genreButton.addEventListener('click', () => {
    artistRank.classList.add('hidden')
    genreRank.classList.remove('hidden')

})