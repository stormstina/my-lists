const createNewListBtn = document.querySelector("#createNewList");

// localStorage.clear()

//! Stina kom ihåg att ändra detta om du vill
let sigUser = localStorage.getItem("signedInUser") ? JSON.parse(localStorage.getItem("signedInUser")) : [];
const sigUserList = sigUser.userList;
//! Stina kom ihåg att ändra detta om du vill

// Save our productlist here
let productList = [];

// Anropar asynkron funktion för att hämta JSON produkt fil som JS-arr
fetchProductsJson()
    .then((data) => {
        // Om datan kan levereras ritar vi ut produkterna i DOM:en genom funktion renderLocalStorageListArr(data) som vi skickar med vår produkt-utbud arr i
        productList = data
        renderLocalStorageListArr(sigUserList, productList);
    })
    .catch(err => console.log("Rejected:", err.message));


// Skapar en ny lista i API:et
async function createList() {
    const listname = "Add Listname";

    const res = await fetch(`https://nackademin-item-tracker.herokuapp.com/lists`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({
            listname: listname,
        }),
    });

    const { list } = await res.json();


    // Skickar det precis skapade listobjektet till create acccordian funktion för att rendera ut i browser
    // console.log("25", list);
    createListAccordion(list, productList);

    // Retunerar id till local storage funktion för att spara en användares skapade listor
    id = list._id
    // console.log(list);
    // console.log("30",id);

    return id
}


// Funktion som hämtar en lista från API utifrån ett ID lagrat i local storage
async function getListByID(listId, recProductList) {
    let ID = listId
    const res = await fetch(`https://nackademin-item-tracker.herokuapp.com/lists/${ID}`);
    const sigUserList = await res.json();

    // Funktion som skapar en accordion och displayar i browser
    const ul = createListAccordion(sigUserList, recProductList);
    console.log("64", ul);

    // fias kod
    // hänmta itemList/varor ifrån data från apiet
    const itemList = sigUserList.itemList;



    // loopa igenon varorna
    itemList.forEach((listItemObject) => {
        // skapa productListItem elementet med nuvarande objektet
        //! Kan vi ta bort elem?
        let elem = productListItem(
            listItemObject.title,
            listItemObject.qty,
            listItemObject.image,
            listItemObject.checked,
            listItemObject._id,
            sigUserList._id,
            ul
        );

        // appenda in i ulen
    });
}

// Renderar den inloggade användarens sparade listor - om de finns
function renderLocalStorageListArr(idArr, recProductList) {
    // console.log("recProductList", recProductList);
    // console.log("sigUserList", arr);

    if (idArr) {
        // Anropar getListByID för varje list-id inloggade användarens har sparat
        idArr.forEach(id => {
            getListByID(id, recProductList)
        });
    }
}

// Funktion som skapar array från lista i API. Skriver ut i brower (förlåt för ful)
function createListAccordion(userListObj, recProductList) {
    let listName = userListObj.listname;
    // console.log("listName",listName);

    let listLength = userListObj.itemList.length;
    // console.log("list längd",listLength);

    let listID = userListObj._id;
    // console.log(listID);

    let div = document.createElement("div");
    div.classList.add("list-accordion", "d-flex", "justify-content-between", "mt-4", "p-3", "shadow");
    document.body.append(div);

    let image = document.createElement("img");
    image.setAttribute("class", "img-fluid image");
    image.setAttribute("src", "images/giorgio-trovato-fczCr7MdE7U-unsplash.jpg")

    let textWrapper = document.createElement("div");
    textWrapper.classList.add("d-flex", "flex-grow-1", "ms-3", "justify-content-between");

    div.append(image, textWrapper);

    let divText = document.createElement("div");
    textWrapper.append(divText);
    divText.innerHTML = `<h2>${listName}</h2><p class="text-secondary">${listLength} items</p>`;

    let buttonDiv = document.createElement("div");
    buttonDiv.classList.add("d-flex", "flex-column", "justify-content-between")
    div.append(buttonDiv);

    let trashBtn = document.createElement("button");
    trashBtn.classList.add("align-self-start", "border-0", "bg-transparent")
    trashBtn.innerHTML = `<i class="fa-regular fa-trash-can"></i>`;
    buttonDiv.append(trashBtn);

    let toggleBtn = document.createElement("button");
    toggleBtn.classList.add("align-self-end", "rounded", "border", "border-secondary")
    toggleBtn.innerHTML = `<i class="fa-solid fa-angle-down"></i>`;
    buttonDiv.append(toggleBtn);

    let toggleDiv = document.createElement("div");
    toggleDiv.classList.add("list-accordian-open", "hidden", "p-3", "shadow");
    document.body.append(toggleDiv);

    toggleBtn.addEventListener("click", toggleArrow);

    let ul = document.createElement("ul");
    ul.classList.add("progressList");

    let progressListTitle = document.createElement("h3");
    progressListTitle.classList.add("inListHeading")
    progressListTitle.innerText = "In Progress";

    let doneUL = document.createElement("ul");
    doneUL.classList.add("doneList");

    let doneListTitle = document.createElement("h3");
    doneListTitle.classList.add("inListHeading");
    doneListTitle.innerText = "Done";


    // RecommendationBar
    let recommendationUL = document.createElement("ul");
    recommendationUL.classList.add("recommendationUl")

    toggleDiv.append(recommendationUL, progressListTitle, ul, doneListTitle, doneUL);

    let h2 = document.createElement("h2");
    h2.classList.add("subheading")
    h2.innerText = "Recommended for you";

    let divRecomendationBar = document.createElement("div");
    divRecomendationBar.classList.add("row", "gy-5", "recProdContainer");

    recommendationUL.append(h2, divRecomendationBar)

    
    // console.log("rad152",recProductList);

    // Renderar en redommendation bar till varje list-accordian
    drawRecProd(divRecomendationBar, recProductList, listID);

    // Initerar addItem() för varje recommendation bar 
    addItem(divRecomendationBar)


    return [ul, doneUL];
}

//funktion som togglar div i accordion (den utfällda delen) mellan hidden och ej hidden
function toggleArrow(event) {
    let toggleDiv = event.target.parentElement.parentElement.nextSibling;
    toggleDiv.classList.toggle("hidden")
}

// Vid klick - kör asynkron funktion createList som skapar en ny lista i API:et
createNewListBtn.addEventListener("click", (e) => {
    // console.log("hej");

    createList().then(id => {
        // När den är klar, spara nya listans id i den inloggade användarens array med listID:n
        // console.log("208", id);

        // Anropar funktionen som uppdaterar local-storage-arrayen med användarens precis skapade list-id
        updateUserListArr(id)

    });

}) 
