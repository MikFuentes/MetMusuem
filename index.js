// const DATE = `2021-05-01`
const DATE = `2023-10-21`
const MAX_ART = 12
const KEY_HANDLERS = {
    Enter: search ,
    Escape: deleteModal 
}

// ------ FRONT-END -------
// TODO:
// Make it responsive
// Make department hamburger

function onKeyDown(ev) {
    console.log(ev)
    if (ev.repeat) return
    if (!(ev.key in KEY_HANDLERS)) return
    KEY_HANDLERS[ev.key]()
}

// Called when the highlight checkbox is toggled
function highlight() {
    isHighlight = !isHighlight
    search()
}

// Removes the images on the screen
function clearScreen() {
    let container = document.querySelector('#container')
    while(container.firstChild) {
        container.removeChild(container.lastChild)
    }
    // prevImage = null
    counter = 0
}

function revealImage() {
    let image = document.querySelector('.modal-content')
    image.style.display = 'flex'
    let spinner = document.querySelector('.spinner')
    spinner.style.display = 'none'
    // spinner.style.visibility = 'hidden';
}


function createModal(image, alt){
    let modal = document.createElement('div')
    modal.className = 'myModal'
    modal.id = 'myModal'
    modal.style.display = "block";
    modal.style.overflow = "auto";
    modal.onclick = (ev) => { 
        if (ev.target === ev.currentTarget) deleteModal()
        if(ev.target.classList.contains('modal-content')) deleteModal()
    }
    document.onkeydown = onKeyDown

    let close = document.createElement('span')
    close.className = 'modal-close'
    close.innerHTML = "&times"
    close.onclick = deleteModal

    let svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
    svg.setAttribute("class", "spinner");
    svg.setAttribute("viewBox", "0 0 50 50");

    var circle = document.createElementNS("http://www.w3.org/2000/svg", "circle");
    circle.setAttribute("class", "path");
    circle.setAttribute("cx", "25");
    circle.setAttribute("cy", "25");
    circle.setAttribute("r", "20");
    circle.setAttribute("fill", "none");
    circle.setAttribute("stroke-width", "5");

    svg.appendChild(circle);

    let modalContent = document.createElement('div')
    modalContent.className = 'modal-content'
    modalContent.style.display = 'none'
    
    let img = document.createElement('img')
    img.className = 'modal-image'
    img.id = 'img01'
    img.src = image
    img.onload = () => revealImage()

    let caption = document.createElement('p')
    caption.className = 'modal-caption'
    caption.textContent = alt

    modalContent.append(img, caption)
    
    modal.append(close, svg, modalContent)
    document.body.append(modal)

    document.querySelector("body").classList.add("stopScrolling")    
}



function deleteModal() {
    document.onkeydown = ''
    document.getElementById('myModal').remove()
    document.querySelector("body").classList.remove("stopScrolling")
}

// Adds the images to the HTML
function addImageToDocument(image, imageSmall, title, medium, artistDisplayName, artistDisplayBio) {

    if (artistDisplayName == "" || artistDisplayName == null) {
        artistDisplayName = "Unknown artist"
    }

    let div = document.createElement('div')
    div.className = "artPiece"

    let img = document.createElement('img')
    // img.setAttribute('data-small-image', imageSmall)
    img.src = imageSmall
    img.className = "myImg"
    img.alt = title + " | " + medium + " | " + artistDisplayName
    img.loading = 'lazy'
    img.onclick = () => createModal(image, img.alt)
    
    let h1 = document.createElement('h1')
    h1.className = "artHeader"
    h1.innerHTML = title
    
    let p1 = document.createElement('p')
    p1.className = "medium"
    p1.innerHTML = medium
    
    let p2 = document.createElement('p')
    p2.className = "artist"
    p2.innerHTML = artistDisplayName + "<br>" + artistDisplayBio
    
    document.querySelector('#container').appendChild(div).appendChild(img)

    let artContainer = document.querySelector('.artPiece:last-child')
    artContainer.appendChild(h1)
    artContainer.appendChild(p1)
    artContainer.appendChild(p2)
}


// Adds the departments to the sidebar and assigns functions to them
async function addDepartmentsToDocument() {
    
    let array = await requestDepartments()
    for (let department of array.departments) {
        let li = document.createElement('li')
        let a = document.createElement('a')
        
        a.className = "sidebarButton"
        a.id = department.departmentId
        a.innerHTML = department.displayName
        
        // TODO: Fix BUG where if u click a new department too quickly, only some of the images will load
        a.onclick = function() {
            document.querySelector('#myInput').value = ''
            document.querySelector(".searchHeader").innerHTML = "Artwork from " + a.innerHTML
            
            // Check for any activeDepartments
            let active = document.querySelector(".active")
            
            // If there is an active department before this was clicked, deactivate it
            if (active) {
                prevDepartmentID = active.id
                active.classList.remove("active")
            }
            this.classList.add('active') // Make the clicked department the active one
            active = document.querySelector('.active'); // Get the active department (this one)
            
            if (active.id == prevDepartmentID) {
                active.classList.remove("active")
                prevDepartmentID = null;
                document.querySelector(".searchHeader").innerHTML = "Recently Updated Artwork"
            }
            request()
        }
        li.append(a)
        document.querySelector('.departments').appendChild(li)
    }
}

// Opens/closes the sidebar
function toggleSidebar(){
    sidebarOn = !sidebarOn
    let galleryDark = document.querySelector('.galleryDark')
    let sidebar = document.querySelector('.sidebar')
    let body = document.querySelector('body')

    if(sidebarOn){
        // galleryDark.style.display = "block"
        galleryDark.classList.add("animate-fadeIn")
        galleryDark.classList.remove("animate-fadeOut")
        
        sidebar.classList.add("animate-right")
        sidebar.classList.remove("animate-left")
        
        body.classList.add("stopScrolling")
    }
    else{
        // galleryDark.style.display = "none"
        galleryDark.classList.add("animate-fadeOut")
        galleryDark.classList.remove("animate-fadeIn")
        sidebar.classList.add("animate-left")
        sidebar.classList.remove("animate-right")
        body.classList.remove("stopScrolling")
    }
    galleryDark.onclick = toggleSidebar
}

function getPos(el) {
    var rect = el.getBoundingClientRect();
    return {x:rect.left,y:rect.top};
}



// ------ BACK-END ------

// TODO: Add highlight functionality
// Returns an array of object IDs that correspond to the specified department
async function requestObjects(date = '', departmentId = '') {
    try {
        let response = await fetch(`https://collectionapi.metmuseum.org/public/collection/v1/objects?metadataDate=${date}&departmentIds=${departmentId}`)
        return response.json() 
    }
    catch (error) {console.log(error)}
}

// Returns an array of object IDs that correspond to a search query
async function searchObjects(query, departmentId = '', isHighlight = false){
    try {
        let response = await fetch(`https://collectionapi.metmuseum.org/public/collection/v1/search?departmentId=${departmentId}&isHighlight=${isHighlight}&title=true&q=${query}`)
        return response.json()
    }
    catch (error) {console.log(error)}
}

// Returns the specified Object according to an ID
async function requestObject(objectID) {
    try {
        let response = await fetch(`https://collectionapi.metmuseum.org/public/collection/v1/objects/${objectID}`)
        return response.json()
    }
    catch (error) {console.log(error)}
}

// Returns the array of departments
async function requestDepartments() {
    try {
        let response = await fetch(`https://collectionapi.metmuseum.org/public/collection/v1/departments`)
        return response.json()
    }
    catch (error) {console.log(error)}
  }
  
// Requests
async function request() {
    try {
        let date = DATE
        let department = document.querySelector(".active");
        let departmentID = (department === null) ? '' : department.id
        let objects = await requestObjects(date, departmentID)

        getArt(objects, true, 0)
    }
    catch (error) {console.log(error)}
}

// Will search for the appropriate object array when called 
async function search() {
    try {
        let input = document.querySelector('#myInput').value
        let department = document.querySelector(".active")
        let departmentID = (department === null) ? '' : department.id

        if (input === "") {
            request()
            return
        }
        let objects = await searchObjects(input, departmentID, isHighlight)

        getArt(objects, false, 0, input) // TODO remove fourth parameter in getArt()
    }
    catch(error) {console.log(error)}
}

// Check if the objects have images
async function filterObjects(list) {
    try {
        let objects = await Promise.all(list)
        for (let object of objects) {
            if (counter >= MAX_ART) { break } // Break out of the for loop
            if (object.primaryImage === null || object.primaryImage === '') { continue } 
            if (isHighlight && object.isHighlight == false) { continue } // Filter for isHighlight

            addImageToDocument(
                object.primaryImage,
                object.primaryImageSmall,
                object.title,
                object.medium,
                object.artistDisplayName,
                object.artistDisplayBio
            )
            // prevImage = object.primaryImage
            counter++
        }
    }
    catch (error) { console.error(error) }

    return counter
}

// Gets artworks
function getArt(objectArray, isRandom, startIndex, query = "") {
    console.log("Loading...")
    document.querySelector('.searchResult').innerHTML = "Loading..."

    // Exit if null
    if (objectArray.objectIDs === null) {
        clearScreen()
        let message = (!isHighlight) ? "No results found" : "No highlighted results found"
        if (query) { message += ` for: ${query}` }
        return document.querySelector('.searchResult').innerHTML = message
    }

    let objectIDs = objectArray.objectIDs
    let MAX = objectIDs.length
    let listOfAllPromises = []

    // Run only during the initial call
    if (startIndex === 0) {
        clearScreen()
        objectIDs = objectIDs.sort((a, b) => a-b) // Ascending sort the array by index
    }

    if (isRandom) {
        // Randomly
        for (let i = 0; i < MAX_ART; i++) {
            if (listOfAllPromises.length >= MAX || startIndex >= MAX) { break }
            let rand = Math.floor(Math.random() * MAX) + 0
            object = requestObject(objectIDs[rand]) // Pending promises
            listOfAllPromises.push(object)
        }
        startIndex = 1
    }
    else {
        // Sequentially
        for (let i = 0; i < MAX_ART; i++) {
            if (listOfAllPromises.length >= MAX || startIndex >= MAX) { break }
            object = requestObject(objectIDs[startIndex]) // Pending promises
            listOfAllPromises.push(object)
            startIndex++
        }
    }

    filterObjects(listOfAllPromises)
        .then(numObjects => {
            if (numObjects < MAX_ART && numObjects < MAX && startIndex < MAX) {
                getArt(objectArray, isRandom, startIndex, query) // Recursively call the function
            }
            else {
                console.log("Loading complete.")
                let message = ''

                if (numObjects > 0) {
                    message = (isHighlight) ? `Found ${numObjects} highlighted result(s)` : `Showing ${numObjects} out of ${MAX.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",")} result(s)` 
                }
                else {
                    message = (isHighlight) ?  "No highlighted results found" : "No results found"
                }

                if (query) { message += ` for: ${query}` }
                return document.querySelector('.searchResult').innerHTML = message
            }
        })
        .catch(error => console.log(error))
}

// GLOBAL VARIABLES(?)
let prevDepartmentID = -1
// let prevImage // IDK WHAT THIS IS
let counter = 0
let handleKeyDown = true
let isHighlight = false // TODO use states?
let sidebarOn = false

// document.querySelector("#hamburger").addEventListener('click', toggleSidebar)

/*------DEFAULT LOAD------*/

// Add departments to the sidebar
addDepartmentsToDocument()

document.querySelector(".searchHeader").innerHTML = "Recently Updated Artwork"

// Generate random artworks
requestObjects(DATE)
    .then((objects) => getArt(objects, true, 0))
    .catch((error) => console.error(error))

// TO-DO:
// - Modal: 
//   - Create/delete modal or open/close modal?
// - TopBar:
//   - Rename to nav bar
//   - Fix fullscreen not working