// TODO:
// Make it responsive
// Make department hamburger

// Returns the array of object IDs updated after May 2021 (22534 objects)
async function requestObjects() {
    let response = await fetch(`https://collectionapi.metmuseum.org/public/collection/v1/objects?metadataDate=2021-05-01`)
    return response.json()
}

// Returns the array of departments
async function requestDepartments() {
    let response = await fetch(`https://collectionapi.metmuseum.org/public/collection/v1/departments`)
    return response.json()
}

// Returns the array of object IDs that correspond to the specified department
async function requestObjectsFromDepartment(departmentID) {
    let response = await fetch(`https://collectionapi.metmuseum.org/public/collection/v1/objects?departmentIds=${departmentID}`)
    return response.json()
}

// Returns the array of object IDs that correspond to a search query
async function searchObjects(query) {
    let response = await fetch(`https://collectionapi.metmuseum.org/public/collection/v1/search?title=true&q=${query}`)
    return response.json()
}

// Returns the array of highlighted object IDs that correspond to a search query
async function searchHighlightedObjects(query) {
    let response = await fetch(`https://collectionapi.metmuseum.org/public/collection/v1/search?isHighlight=true&title=true&q=${query}`)
    return response.json()
}

// Returns the array of object IDs that correspond to the department and search query
function searchObjectsFromDepartment(departmentId, query) {
    return fetch(`https://collectionapi.metmuseum.org/public/collection/v1/search?departmentId=${departmentId}&title=true&q=${query}`).then(response => {
        return response.json()
    }).then(responseBody => {
        return responseBody
    })
}

// Return the array of highlighted object IDs that correspond to the department and search query 
function searchHighlightedObjectsFromDepartment(departmentId, query) {
    return fetch(`https://collectionapi.metmuseum.org/public/collection/v1/search?departmentId=${departmentId}&isHighlight=true&title=true&q=${query}`).then(response => {
        return response.json()
    }).then(responseBody => {
        return responseBody
    })
}

// Returns the specified Object according to an ID
function requestObject(objectID) {
    return fetch(`https://collectionapi.metmuseum.org/public/collection/v1/objects/${objectID}`).then(response => {
        return response.json()
    }).then(responseBody => {
        return responseBody
    })
}

// Removes the images on the screen
function clearScreen() {
    let container = document.querySelector('#container')
    while(container.firstChild) {
        container.removeChild(container.lastChild)
    }
    prevImage = null
    counter = 0
}

// Closes the modal
function closeModal() {
    modal.style.display = "none";
    document.querySelector("body").classList.remove("stopScrolling")
}

// Will search for the appropriate object array when called 
async function search() {
    let input = document.querySelector('#myInput').value;
    var department = document.querySelector(".active");

    if (department !== null) {
        if (input == "") {
            // console.log("!Input, Department,", highlightOn)
            let objects = await requestObjectsFromDepartment(department.id)
            await getTenArt(objects, false, 0)
  
        }
        else {
            // console.log("Input, Department,", highlightOn)
            let objects = await searchObjectsFromDepartment(department.id, input)
            await getTenArt(objects, false, 0, input)
        }
    }
    else {
        if (input == "") {
            // console.log("!Input, !Department,", highlightOn)
            let objects = await requestObjects()
            await getTenArt(objects, true, 0)
            document.querySelector(".searchHeader").innerHTML = "Recently Updated Artwork"
        }
        else {
            // console.log("Input, !Department,", highlightOn)
            let objects = await searchObjects(input)
            await getTenArt(objects, false, 0, input)
        }
    }
}

// Called when a key is pressed whilst using the search bar
function onKeyDown(e) {
    let input = document.querySelector('#myInput').value;
    let enter = e.keyCode === 13
    let backspace = e.keyCode === 8

    // Enter
    if (enter) {
        search()
    }
    // Backspace/delete
    else if (backspace && input.length <= 1) {
        if (!handleKeyDown) { return }

        document.getElementById('myInput').value = ""
        handleKeyDown = false
        search()
    }
}

// Called when a key is released whilst using the search bar
function onKeyUp(e) {
    // Backspace/delete
    if (e.keyCode === 8) {
        handleKeyDown = true
    }
}

// Called when the highlight checkbox is toggled
function highlight() {
    isHighlight = !isHighlight
    search()
}

// Adds the images to the HTML
function addImageToDocument(image, title, medium, artistDisplayName, artistDisplayBio) {

    if (artistDisplayName == "" || artistDisplayName == null) {
        artistDisplayName = "Unknown artist"
    }

    let div = document.createElement('div')
    div.className = "artPiece"

    let img = document.createElement('img')
    img.src = image
    img.className = "myImg"
    img.alt = title + " | " + medium + " | " + artistDisplayName

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

    img.onclick = function () { // Give the image a click function for the modal
        document.querySelector("body").classList.add("stopScrolling")

        modal.style.display = "block";
        modal.style.overflow = "auto";
        modalImg.src = this.src;
        captionText.innerHTML = this.alt;
    }

    let artContainer = document.querySelector('.artPiece:last-child')
    artContainer.appendChild(h1)
    artContainer.appendChild(p1)
    artContainer.appendChild(p2)
}

// Opens/closes the sidebar
function toggleSidebar(){
    sidebarOn = !sidebarOn

    if(sidebarOn){
        document.querySelector(".sidebar").style.display = "block"
        document.querySelector(".galleryDark").style.display = "block"
    }
    else{
        document.querySelector(".sidebar").style.display = "none"
        document.querySelector(".galleryDark").style.display = "none"
        //document.querySelector(".sidebar").classList.replace("w3-animate-left", "w3-animate-right")
    }
}

// Adds the departments to the sidebar and assigns functions to them
function addDepartmentsToDocument() {
    requestDepartments().then(departmentList => {
        for (let department of departmentList.departments) {
            let a = document.createElement('a')
            a.className = "sidebarButton"
            a.id = department.departmentId
            a.innerHTML = department.displayName

            // TODO: Fix BUG where if u click a new department too quickly, only some of the images will load
            a.onclick = function () {
                document.querySelector(".searchHeader").innerHTML = "Artwork from " + a.innerHTML

                // Check for any activeDepartments
                var active = document.getElementsByClassName("active");

                // If there is an active department before this was clicked, deactivate it
                if (active.length > 0) {
                    prevDepartmentID = active[0].id
                    active[0].className = active[0].className.replace(" active", "");
                }
                this.className += " active"; // Make the clicked department the active one
                active = document.getElementsByClassName("active"); // Get the active department (this one)

                if (active[0].id == prevDepartmentID) {
                    active[0].className = active[0].className.replace(" active", ""); // Remove the active class
                    prevDepartmentID = null;
                    document.querySelector(".searchHeader").innerHTML = "Recently Updated Artwork"
                }
                search()
            }
            document.querySelector('.sidebar').appendChild(a)
        }
    })
}

// Check if the objects have a primaryImage
function filterObjects(listOfAllPromises) {
    let promises = Promise.all(listOfAllPromises)
        .then(listOfAllResponses => {
            for (let object of listOfAllResponses) {
                if (object.primaryImage != "" && object.primaryImage != null) { // Filter for images
                    if (isHighlight && object.isHighlight == false) { continue } // Filter for isHighlight
                    addImageToDocument(
                        object.primaryImage,
                        object.title,
                        object.medium,
                        object.artistDisplayName,
                        object.artistDisplayBio)
                    prevImage = object.primaryImage
                    counter++
                    if (counter >= 10) { break } // Break out of the for loop
                }
            }
            return counter
        })
        .catch(error => { console.log(error) })

    return promises
}

// Gets 10 artworks
function getTenArt(objectArray, isRandom, startIndex, query = "") {
    console.log("Loading...")
    // Exit if null
    if (objectArray.objectIDs == null) {
        clearScreen()

        if (!isHighlight) { var temp = "No results found" }
        else { var temp = "No highlighted results found" }
        if (query != "") { temp += " for: " + query }

        document.querySelector('.searchResult').innerHTML = temp
        return
    }

    var array = objectArray.objectIDs
    var MAX = array.length
    var listOfAllPromises = []

    // Run only during the initial call
    if (startIndex == 0) {
        // Reset the screen
        clearScreen() // Clear the artworks
        document.querySelector('.searchResult').innerHTML = "Loading..." // Clear the search text

        array = array.sort(function (a, b) { return a - b }) // Ascending sort the array by indexe
    }

    // Get 10 objects at a time...
    if (isRandom == true) {
        // Randomly
        for (let i = 0; i < 10; i++) {
            if (listOfAllPromises.length >= MAX || startIndex >= MAX) { break }
            let rand = Math.floor(Math.random() * MAX) + 0
            object = requestObject(array[rand]) // Pending promises
            listOfAllPromises.push(object)
        }
        startIndex = 1
    }
    else {
        // Sequentially
        for (let i = 0; i < 10; i++) {
            if (listOfAllPromises.length >= MAX || startIndex >= MAX) { break }
            object = requestObject(array[startIndex]) // Pending promises
            listOfAllPromises.push(object)
            startIndex++
        }
    }

    filterObjects(listOfAllPromises).then(response => {
        if (response < 10 && response < MAX && startIndex < MAX) {
            getTenArt(objectArray, isRandom, startIndex, query) // Recursively call the function
        }
        else {
            console.log("Loading complete.")
            if (!isHighlight) { var temp = "Showing " + response + " out of " + MAX.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",") + " result(s)" }
            else { var temp = "Found " + response + " highlighted result(s)" }

            if (response <= 0) {
                if (!isHighlight) { var temp = "No results found" }
                else { var temp = "No highlighted results found" }
            }
            if (query != "") { temp += " for: " + query }
            document.querySelector('.searchResult').innerHTML = temp
        }
    }).catch(error => { console.log(error) })
}

// GLOBAL VARIABLES(?)
let prevDepartmentID = -1
let prevImage
let counter = 0
let handleKeyDown = true
let highlightOn = false // TODO use states?
let sidebarOn = false

// MODAL
var modal = document.getElementById('myModal'); // Get the modal
var modalImg = document.getElementById("img01"); // Get the image and insert it inside the modal 
var captionText = document.getElementById("caption"); // Use its "alt" text as a caption
var span = document.getElementsByClassName("close")[0]; // Get the <span> element that closes the modal

document.getElementById("myModal").addEventListener("click", function (e) {
    e = window.event || e;
    if (this === e.target) {
        if (this.id == "myModal") {
            closeModal()
        }
    }
});

/*------DEFAULT LOAD------*/

// Add departments to the sidebar
addDepartmentsToDocument()

// Generate 10 random artworks
requestObjects()
.then((objects) => {
    document.querySelector(".searchHeader").innerHTML = "Recently Updated Artwork"
    getTenArt(objects, true, 0)
})