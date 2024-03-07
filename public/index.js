
/*
Starter med å lage en funksjon som henter all dataen fra serveren og setter det inn på siden. 
Dette skal bli brukt senere så man slipper å kalle på databasen mer enn nødvendig.
*/
async function makeallcontent() {

    response = await fetch("/boker");
    boker = await response.json();

    // Lager alle de små bok-profilene
    for (const i in boker) {
        bilde = document.createElement("div")
        bilde.className = "bokbilder"
        bilde.id = `${boker[i].id}`
        bilde.title = `${boker[i].name}`
        bilde.setAttribute("author", `${await getAuthorByBookId(boker[i].id)}`)
        bilde.setAttribute("pages", `${boker[i].pages}`)
        bilde.setAttribute("genre", `${await getGenre(boker[i].id)}`)

        bilde.style.backgroundImage = `url(img/books/${encodeURIComponent(boker[i].img)})`


        let title = document.createElement("p");
        let author = document.createElement("p");

        title.textContent = `${boker[i].name}`;
        author.textContent = (await getAuthorByBookId(boker[i].id));

        bilde.appendChild(title);
        bilde.appendChild(author);

        bilde.addEventListener("click", async function (event) {


            let data = await getBookById(event.target.id)

            hideAllBooks();
            showBooks(data)
        })

        books.appendChild(bilde)


    }
    // Sorterer slik at bøkene er sortert etter tittel.
    sortTitleAZ();
};

//Kaller på funksjonen som henter all dataen fra serveren og som lager forfatter og sjanger valg/filter
window.onload = async function () {
    await makeallcontent();
    chooseGenre();
    chooseAuthor();
};

// Funksjon for å sortere bøkene kun etter sjanger
function sortByGenre(genre) {

    let container = document.getElementById('books');
    let divs = Array.from(container.getElementsByClassName('bokbilder'));


    // Gjemmer bøkene som ikke er av riktig sjanger
    divs.forEach(div => {
        if (!div.getAttribute('genre').includes(genre)) {
            div.style.display = 'none';
        }
    });

};

// Funksjon for å sortere bøkene kun etter forfatter
function sortByAuthor(author) {

    let container = document.getElementById('books');
    let divs = Array.from(container.getElementsByClassName('bokbilder'));


    // Gjemmer bøkene som ikke er av riktig forfatter
    divs.forEach(div => {
        if (div.getAttribute('author') !== author) {
            div.style.display = 'none';
        }
    });

}

// Funksjon for å sortere bøkene etter forfatter og sjanger
function sortByAuthorAndGenre(author, genre) {

    let container = document.getElementById('books');
    let divs = Array.from(container.getElementsByClassName('bokbilder'));


    //  Gjemmer bøkene som ikke er av riktig sjanger og forfatter
    divs.forEach(div => {
        if (!div.getAttribute('genre').includes(genre) || div.getAttribute('author') !== author) {
            div.style.display = 'none';
        }
    });

}

// Funksjon for å vise alle bøkene. Brukes hvis man kun har vist bokinfo eller forfatterinfo
function showAllBooks() {
    clearBooksDisplay();
    let container = document.getElementById('books');
    let divs = Array.from(container.getElementsByClassName('bokbilder'));


    // Viser alle bøkene
    divs.forEach(div => {
        div.style.removeProperty('display');
    });

}

// Funksjon for å gjemme alle bøkene. Brukes hvis kun skal vise bokinfo eller forfatterinfo
function hideAllBooks() {
    // Get the container
    let container = document.getElementById('books');

    // Get the divs as an array
    let divs = Array.from(container.getElementsByClassName('bokbilder'));

    // Hide all the divs
    divs.forEach(div => {
        div.style.display = 'none';
    });

}

// Funksjon for å fjerne all bokinfo og forfatterinfo. Da kan man vise alle bøkene igjen
function clearBooksDisplay() {
    const books = document.getElementById("booksdisplay");
    books.innerHTML = null;
}


// Dette er for å lage dropdown meny for forfatterfiltrering
async function chooseAuthor() {
    const response = await fetch("/forfattere");
    const info = await response.json();

    const forfattersel = document.getElementById("forfatter");

    let allContent = document.createElement("option");
    allContent.value = "Alle";
    allContent.id = "Alle"
    allContent.innerHTML = "Alle";
    forfattersel.appendChild(allContent);


    for (const i in info) {
        const listOfAuthors = document.createElement("option");
        listOfAuthors.id = info[i].id;
        listOfAuthors.innerHTML = info[i].author;
        listOfAuthors.value = info[i].author;
        forfattersel.appendChild(listOfAuthors);
    }
}

//Dette er for å lage dropdown meny for sjangerfiltrering
async function chooseGenre() {
    const response = await fetch("/sjanger");
    const info = await response.json();

    const sjangersel = document.getElementById("sjanger");

    allContent = document.createElement("option");
    allContent.value = "Alle";
    allContent.id = "Alle"
    allContent.innerHTML = "Alle";
    sjangersel.appendChild(allContent);


    for (const i in info) {
        const listOfGenres = document.createElement("option");
        listOfGenres.id = info[i].id;
        listOfGenres.innerHTML = info[i].genre;
        listOfGenres.value = info[i].genre;
        sjangersel.appendChild(listOfGenres);
    }
}


//Her skal den filtrere bøker basert på det som er valgt i dropdown menyene
document.getElementById('forfatter og sjanger').addEventListener('submit', function (event) {
    event.preventDefault(); // Trengs for at siden ikke skal refreshe
    const author = document.querySelector('#forfatter').value;
    const genre = document.querySelector('#sjanger').value;

    //Gjemmer da bokinfo eller forfatterinfo hvis det er vist
    clearBooksDisplay();

    //Gjør dette for å ta vekk "display: none" fra bøkene hvis de er gjemt fra før
    showAllBooks();

    // Klarte ikke bruke switch case her fordi det er to variabler som skal sjekkes
    if ((author == "Alle") && (genre != "Alle")) {
        sortByGenre(genre);
    }

    else if ((author != "Alle") && (genre == "Alle")) {
        sortByAuthor(author);
    }

    else if ((author != "Alle") && (genre != "Alle")) {
        sortByAuthorAndGenre(author, genre);
    }

    else if ((author == "Alle") && (genre == "Alle")) {
        showAllBooks();
    }
});

//Her skal den sortere bøker
document.getElementById('sort').addEventListener('submit', function (event) {
    event.preventDefault(); // Prevent the form from being submitted normally
    const sortOption = document.querySelector('#sortOption').value;

    // Kan bruke switch case her fordi det er kun én variabel som skal sjekkes
    switch (sortOption) {
        case "title a-z":
            sortTitleAZ();
            break;
        case "tilte z-a":
            sortTitleZA();
            break;
        case "author a-z":
            sortAuthorAZ();
            break;
        case "author z-a":
            sortAuthorZA();
            break;
        case "pages ascending":
            sortPagesAscending();
            break;
        case "pages descending":
            sortPagesDescending();
            break;


    }
});

// Sorterer bøkene etter tittel i stigende rekkefølge
async function sortTitleAZ() {

    // Hvis det er vist bokinfo eller forfatterinfo, så skal den vise alle bøkene istedenfor å sortere
    let booksDisplay = document.getElementById('booksdisplay');
    if (booksDisplay.innerHTML.trim() === '') {
    } else {
        showAllBooks();
        clearBooksDisplay();
    }


    let container = document.getElementById('books');
    let divs = Array.from(container.getElementsByClassName('bokbilder'));

    // Sorterer bøkene etter tittel i stigende rekkefølge
    divs.sort((a, b) => {
        // Forutsetter at tittelen er det første <p> elementet i hver div
        let titleA = a.querySelector('p').textContent.toUpperCase();
        let titleB = b.querySelector('p').textContent.toUpperCase();
        if (titleA < titleB) {
            return -1;
        }
        if (titleA > titleB) {
            return 1;
        }
        return 0;
    });

    // Fjerner de gamle bøkene
    while (container.firstChild) {
        container.removeChild(container.firstChild);
    }

    // Legger til de sorterte bøkene
    for (let div of divs) {
        container.appendChild(div);
    }
}

// Sorterer bøkene etter tittel i synkende rekkefølge
async function sortTitleZA() {

    // Hvis det er vist bokinfo eller forfatterinfo, så skal den vise alle bøkene istedenfor å sortere
    let booksDisplay = document.getElementById('booksdisplay');
    if (booksDisplay.innerHTML.trim() === '') {
    } else {
        showAllBooks();
        clearBooksDisplay();
    }


    let container = document.getElementById('books');
    let divs = Array.from(container.getElementsByClassName('bokbilder'));

    // Sorterer bøkene etter tittel i synkende rekkefølge
    divs.sort((a, b) => {
        // Forutsetter at tittelen er det første <p> elementet i hver div
        let titleA = a.querySelector('p').textContent.toUpperCase();
        let titleB = b.querySelector('p').textContent.toUpperCase();
        if (titleA > titleB) {
            return -1;
        }
        if (titleA < titleB) {
            return 1;
        }
        return 0;
    });

    // Fjerner de gamle bøkene
    while (container.firstChild) {
        container.removeChild(container.firstChild);
    }

    // Legger til de sorterte bøkene
    for (let div of divs) {
        container.appendChild(div);
    }
}

// Sorterer bøkene etter forfatter i stigende rekkefølge
async function sortAuthorAZ() {



    // Hvis det er vist bokinfo eller forfatterinfo, så skal den vise alle bøkene istedenfor å sortere
    let booksDisplay = document.getElementById('booksdisplay');
    if (booksDisplay.innerHTML.trim() === '') {
    } else {
        showAllBooks();
        clearBooksDisplay();
    }

    let container = document.getElementById('books');
    let divs = Array.from(container.getElementsByClassName('bokbilder'));

    // Sorterer bøkene etter forfatter i stigende rekkefølge
    divs.sort((a, b) => {
        let authorA = a.getAttribute('author').toUpperCase();
        let authorB = b.getAttribute('author').toUpperCase();
        if (authorA < authorB) {
            return -1;
        }
        if (authorA > authorB) {
            return 1;
        }
        return 0;
    });

    // Fjerner de gamle bøkene
    while (container.firstChild) {
        container.removeChild(container.firstChild);
    }

    // Legger til de sorterte bøkene
    for (let div of divs) {
        container.appendChild(div);
    }
}

// Sorterer bøkene etter forfatter i synkende rekkefølge
async function sortAuthorZA() {

    // Hvis det er vist bokinfo eller forfatterinfo, så skal den vise alle bøkene istedenfor å sortere
    let booksDisplay = document.getElementById('booksdisplay');
    if (booksDisplay.innerHTML.trim() === '') {
    } else {
        showAllBooks();
        clearBooksDisplay();
    }

    let container = document.getElementById('books');
    let divs = Array.from(container.getElementsByClassName('bokbilder'));

    // Sorterer bøkene etter forfatter i synkende rekkefølge
    divs.sort((a, b) => {
        let authorA = a.getAttribute('author').toUpperCase();
        let authorB = b.getAttribute('author').toUpperCase();
        if (authorA > authorB) {
            return -1;
        }
        if (authorA < authorB) {
            return 1;
        }
        return 0;
    });

    // Fjerner de gamle bøkene
    while (container.firstChild) {
        container.removeChild(container.firstChild);
    }

    // Legger til de sorterte bøkene
    for (let div of divs) {
        container.appendChild(div);
    }
}

// Sorterer bøkene etter antall sider i stigende rekkefølge
async function sortPagesAscending() {
    // Hvis det er vist bokinfo eller forfatterinfo, så skal den vise alle bøkene istedenfor å sortere
    let booksDisplay = document.getElementById('booksdisplay');
    if (booksDisplay.innerHTML.trim() === '') {
    } else {
        showAllBooks();
        clearBooksDisplay();
    }

    let container = document.getElementById('books');
    let divs = Array.from(container.getElementsByClassName('bokbilder'));

    // Sorterer bøkene etter antall sider i stigende rekkefølge
    divs.sort((a, b) => {
        let pagesA = a.getAttribute('pages');
        let pagesB = b.getAttribute('pages');
        return pagesA - pagesB;
    });

    // Fjerner de gamle bøkene
    while (container.firstChild) {
        container.removeChild(container.firstChild);
    }

    // Legger til de sorterte bøkene
    for (let div of divs) {
        container.appendChild(div);
    }
}

// Sorterer bøkene etter antall sider i synkende rekkefølge
async function sortPagesDescending() {


    // Hvis det er vist bokinfo eller forfatterinfo, så skal den vise alle bøkene istedenfor å sortere
    let booksDisplay = document.getElementById('booksdisplay');
    if (booksDisplay.innerHTML.trim() === '') {
    } else {
        showAllBooks();
        clearBooksDisplay();
    }

    let container = document.getElementById('books');
    let divs = Array.from(container.getElementsByClassName('bokbilder'));

    // Sorterer bøkene etter antall sider i synkende rekkefølge
    divs.sort((a, b) => {
        let pagesA = a.getAttribute('pages');
        let pagesB = b.getAttribute('pages');
        return pagesB - pagesA;
    });

    // Fjerner de gamle bøkene
    while (container.firstChild) {
        container.removeChild(container.firstChild);
    }

    // Legger til de sorterte bøkene
    for (let div of divs) {
        container.appendChild(div);
    }
}


//Henter all bokinfo basert på id til boken
async function getBookById(id) {
    const response = await fetch(`/boks/${id}`);
    const data = await response.json();
    return data
}

//Henter all bokinfo basert på navn til boken, her får man det første treffet som likner på søket.
async function getBookByName(name) {

    const response = await fetch(`/bok/${name}`);


    if (!response.ok) {
        console.error(`Error: ${response.status}`);
        return "error";
    }

    const data = await response.text();


    if (JSON.parse(data).message) {
        console.error('No data returned');
        return "error";
    }

    const bookinfo = JSON.parse(data);

    
    showBooks(bookinfo);
}


//Søkefunksjon for å søke etter bok eller forfatter
async function search() {
    clearBooksDisplay();
    hideAllBooks();
    const searchBar = document.getElementById('searchBar');
    const query = searchBar.value;

    //Sjekker først om det er en forfatter, hvis ikke så er det en bok

    if (await getAuthorByName(query) === "error") {

        getBookByName(query);
    }
    else {

        await showAuthor(await getAuthorByName(query));
    }

}

// Viser bøker basert på bokinfo fra hele bibliography table
async function showBooks(object) {
    const books = document.getElementById("booksdisplay");
    const container = document.createElement("div");

    container.id = `${object.name}`;
    container.className = "bokcontainer"
    // Legger til | mellom sjangrene
    let genres = await getGenre(object.id);
    let genreList = '| ' + genres.join(' | ') + ' |';    
    // Hvis det er flere enn en sjanger så skal det stå "Genres:" istedenfor "Genre:"
    let genreLabel = genres.length > 1 ? 'Genres:' : 'Genre:'; 
    container.innerHTML = `
            <h2>${object.name}</h2>
            <img id="bokbildet" src="img/books/${object.img}" alt="${object.name}">
            <p> ${genreLabel}</p>
            <p id= "bookGenres"> ${genreList}</p>
            <p id= "bookPages">Pages: ${object.pages}</p>
            <p id= "bookAuthor"> ${object.summary}</p>
            `;

    let authorElement = document.createElement("p");
    authorElement.id = `${object.author}`;
    authorElement.className = "authorElement"
    authorElement.innerHTML = `Author: ${await getAuthor(object.author)}`;
    authorElement.addEventListener("click", async function (event) {

        let data = await getAuthorById(event.target.id)

        clearBooksDisplay();
        showAuthor(data)
    })

    // Legger bare til alle blurbsene til boken
    container.appendChild(authorElement);
    let blurbs = await getBlurb(object.id);
    for (const i in blurbs) {
        let blurbElement = document.createElement("p");
        blurbElement.innerHTML = blurbs[i];
        container.appendChild(blurbElement);
    }


    books.appendChild(container);

}


// Får blurbene og forfatterid til blurbene basert på id til boken
async function getBlurb(id) {
    const response = await fetch(`/blubs/${id}`);
    const data = await response.json();
    let blurbs = ['<p>Blurbs: </p>'];
    for (const i in data) {
        // Isteden for en if else her så har jeg brukt ternary operator for å sjekke om det er en forfatterid eller bare en forfatter
        // Ville se om det funket i js også, og siden det bare var en if else så var det greit å bruke ternary operator
        !isNaN(data[i].blurb_author) ? blurbs.push(data[i].blurb + " <br>- " + await getAuthor(data[i].blurb_author) + "<br><br>") : blurbs.push(data[i].blurb + "<br> - " + data[i].blurb_author + " <br><br>");
    }
    return blurbs;
}

// Får forfatternavn basert på id til forfatteren
async function getAuthor(id) {

    const response = await fetch(`/forfattere/${id}`);
    const data = await response.json();
    return data.author
}

// Får all forfatterinfo basert på id til forfatteren
async function getAuthorById(id) {

    const response = await fetch(`/forfattere/${id}`);
    const data = await response.json();
    return data
}

// Får sjangeren(e) til boken basert på bokens id i bibliography-tabellen.
async function getGenre(id) {
    const response = await fetch(`/sjangre/${id}`);
    const data = await response.json();
    let genres = [];
    for (const i in data) {
        genres.push(data[i].genre);
    }
    return genres
}

// Viser forfatterinfo basert på det den får
async function showAuthor(object) {
    const authors = document.getElementById("booksdisplay");
    const container = document.createElement("div");

    container.id = `${object.author}`;
    container.className = "forfattercontainer"
    container.innerHTML = `
            <h2>${object.author}</h2>
            <img id = "bokbildet" id="forfatterbilde" src="img/authors/${object.img}" alt="${object.author}">
            <p>Birthday: ${object.bday}</p>
            <p>Country: ${object.country}</p>
            <p>Biography:</p>
            <p>${object.biography}</p>
            `;

    container.appendChild(await getAuthorBooksById(object.id));
    authors.appendChild(container);
}

// Får forfatterinfo basert på navn til forfatteren. Tar første treffet som likner på søket.
async function getAuthorByName(name) {

    const response = await fetch(`/forfatterId/${name}`);


    if (!response.ok) {
        console.error(`Error: ${response.status}`);
        return "error";
    }

    const data = await response.text();

    if (JSON.parse(data).message) {
        return "error";
    }

    const author = JSON.parse(data);


    // Here you can add the code to handle the data
    return author;
}

// Får forfatter navnet basert på id til boken
async function getAuthorByBookId(id) {
    const response = await fetch(`/forfatterBok/${id}`);
    const data = await response.json();
    return data.author
}

// Skal vise mini bokprofiler basert på forfatterinfo siden
async function getAuthorBooksById(id) {
    const response = await fetch(`/forfatterBoker/${id}`);
    boker = await response.json();
    let forfatterbokbildercontainer = document.createElement("div")
    for (const i in boker) {
        bilde = document.createElement("div")
        bilde.className = "forfatterbokbilder"
        bilde.id = boker[i].id

        bilde.style.backgroundImage = `url(img/books/${encodeURIComponent(boker[i].img)})`

        let title = document.createElement("p");


        // Set the text content of the new elements
        title.textContent = `${boker[i].name}`; // Replace 'boker[i].title' with the actual title property

        // Append the new elements to the 'bilde' div
        bilde.appendChild(title);


        bilde.addEventListener("click", async function () {


            let data = await getBookById(event.target.id)

            hideAllBooks();
            clearBooksDisplay();
            showBooks(data)

        })
        //books.appendChild(bilde)
        forfatterbokbildercontainer.appendChild(bilde)
    }
    return forfatterbokbildercontainer
}


