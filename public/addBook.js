
// Lager input-felter for antall blurbs og blurbforfattere
function createBlurbInputs() {
    const numBlurbs = document.getElementById('numBlurbs').value;
    const blurbInputs = document.getElementById('blurbInputs');

    blurbInputs.innerHTML = '';

    for (let i = 0; i < numBlurbs; i++) {
        const blurbContainer = document.createElement('div');
        blurbContainer.className = 'blurb-container';

        const blurbLabel = document.createElement('label');
        blurbLabel.textContent = `Blurb ${i + 1}:`;

        const blurbInput = document.createElement('input');
        blurbInput.type = 'text';
        blurbInput.name = `blurb${i + 1}`;
        blurbInput.id = `blurb${i + 1}`;
        blurbInput.required = true;

        const blurbAuthorLabel = document.createElement('label');
        blurbAuthorLabel.textContent = `Blurb Author ${i + 1}:`;

        const blurbAuthorInput = document.createElement('input');
        blurbAuthorInput.type = 'text';
        blurbAuthorInput.name = `blurbAuthor${i + 1}`;
        blurbAuthorInput.id = `blurbAuthor${i + 1}`;
        blurbAuthorInput.required = true;

        blurbContainer.appendChild(blurbLabel);
        blurbContainer.appendChild(blurbInput);
        blurbContainer.appendChild(blurbAuthorLabel);
        blurbContainer.appendChild(blurbAuthorInput);

        blurbInputs.appendChild(blurbContainer);
        blurbInputs.appendChild(document.createElement('br'));
    }
}

// Lager input-felter for antall sjangre
function createGenreInputs() {
    const numGenres = document.getElementById('numGenres').value;
    const genreInputs = document.getElementById('genreInputs');


    genreInputs.innerHTML = '';


    for (let i = 0; i < numGenres; i++) {
        const genreLabel = document.createElement('label');
        genreLabel.textContent = `Genre ${i + 1}:`;

        const genreInput = document.createElement('input');
        genreInput.type = 'text';
        genreInput.name = `genre${i + 1}`;
        genreInput.id = `genre${i + 1}`;
        genreInput.required = true;

        genreInputs.appendChild(genreLabel);
        genreInputs.appendChild(genreInput);
        genreInputs.appendChild(document.createElement('br'));
        genreInputs.appendChild(document.createElement('br'));
    }
}


document.getElementById('addBookForm').addEventListener('submit', async function (event) {
    event.preventDefault();
    let title = document.getElementById('title').value;
    let bookImg = document.getElementById('bookImage').files[0].name;
    let pages = document.getElementById('pages').value;
    let summary = document.getElementById('summary').value;
    let bookImage = document.getElementById('bookImage').files[0];

    let numGenres = document.getElementById('numGenres').value;

    let numBlurbs = document.getElementById('numBlurbs').value;

    let author = document.getElementById('author').value;
    let authorImg = document.getElementById('authorImage').files[0].name;
    let authorBday = document.getElementById('authorBday').value;
    let authorCountry = document.getElementById('authorCountry').value;
    let authorBio = document.getElementById('authorBio').value;
    let authorImage = document.getElementById('authorImage').files[0];

    console.log('title:', title, '\nbookImage:', bookImage, '\npages:', pages, '\nsummary:', summary, '\nnumGenres:', numGenres, '\nnumBlurbs:', numBlurbs, '\nauthor:', author, '\nauthorImg:', authorImg, '\nauthorBday:', authorBday, '\nauthorCountry:', authorCountry, '\nauthorBio:', authorBio, '\nauthorImage:', authorImage);

    let genres = [];
    for (let i = 0; i < numGenres; i++) {
        genres.push(document.getElementById(`genre${i + 1}`).value);
    }
    console.log(genres);

    let blurbs = [];
    let blurbAuthors = [];
    for (let i = 0; i < numBlurbs; i++) {
        blurbs.push(document.getElementById(`blurb${i + 1}`).value);
        blurbAuthors.push(document.getElementById(`blurbAuthor${i + 1}`).value);
    }

    async function addWholeBookToDatabase(title, bookImg, pages, summary, author, authorImg, authorBday, authorCountry, authorBio, genres, blurbs, blurbAuthors) {

        await new Promise(resolve => setTimeout(resolve, 2000));

        const authorData = {
            name: author,
            img: authorImg,
            bday: authorBday,
            country: authorCountry,
            biography: authorBio
        };

        // Skal lage authordata og sende for å legge inn i databasen

        fetch('/addAuthor', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(authorData),
        })
            .then(response => response.json())
            .then(data => console.log('Success:', data))
            .catch((error) => console.error('Error:', error));

        //Finner forfatterId basert på navn til forfatter
        async function getAuthorIdByName(name) {
            const response = await fetch(`/forfatterId/${name}`);
            const data = await response.json();
            return data.id;
        }

        const bookData = {
            name: title,
            img: bookImg,
            pages: pages,
            author: await getAuthorIdByName(author),
            summary: summary,
        };



        fetch('/addBok', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(bookData),
        })
            .then(response => response.json())
            .then(data => console.log('Success:', data))
            .catch((error) => console.error('Error:', error));

            
        async function getBookIdByName(name) {
            const response = await fetch(`/bok/${name}`);
            const data = await response.json();
            return data.id;
        }

        for (let i = 0; i < numBlurbs; i++) {
            addBlurbToDatabase(await getBookIdByName(title), blurbs[i], blurbAuthors[i]);
        }

        async function addBlurbToDatabase(book_iden, blurben, blurb_authoren) {
            const blurbData = {
                book_id: book_iden,
                blurb: blurben,
                blurb_author: blurb_authoren
            };



            fetch('/addBlurb', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(blurbData),
            })
                .then(response => response.json())
                .then(data => console.log('Success:', data))

        }



        for (let i = 0; i < numGenres; i++) {
            addGenreToBook(await getBookIdByName(title), genres[i]);
        }

        async function addGenreToBook(book_iden, genren) {
            const genreData = {
                book: book_iden,
                genre: genren
            };

            fetch('/addGenre', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(genreData),
            })
        }
    }

    addWholeBookToDatabase(title, bookImg, pages, summary, author, authorImg, authorBday, authorCountry, authorBio, genres, blurbs, blurbAuthors);


    // Skal lagre bilde og sende til server
    async function sendBookImage(bookImage) {
        const formData = new FormData();
        formData.append('file', bookImage);
        await fetch('/upload/books', {
            method: 'POST',
            body: formData
        });
    }

    sendBookImage(bookImage);

    // Skal lagre bilde og sende til server
    async function sendAuthorImage(authorImage) {
        const formData = new FormData();
        formData.append('file', authorImage);
        await fetch('/upload/authors', {
            method: 'POST',
            body: formData
        });
    }

    sendAuthorImage(authorImage);
});
