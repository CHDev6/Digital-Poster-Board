// Initialization
const add__note = document.querySelector(".add__note");
const add__line = document.querySelector(".add__line");
const add__hline = document.querySelector(".add__hline");
const notesContainer = document.getElementById("notes-container");
const noteColorInput = document.getElementById("note-color");
const clear__all = document.querySelector(".clear__all");

// When the page content is fully loaded, load any past notes saved to local storage
document.addEventListener('DOMContentLoaded', function() {
    loadNotes();
});

// Event listener to clear all data from the canvas
clear__all.addEventListener("click", function() {
    localStorage.clear();
    location.reload();
});

// Get the current viewport position below the headbar
function getViewportPos() {
    const headbarHeight = document.querySelector('.headbar').offsetHeight;
    const scrollY = window.scrollY;
    const scrollX = window.scrollX;
    return {
        top: scrollY + headbarHeight + 20, // 20px below the headbar
        left: scrollX + 50 // 50px from the left side of page
    };
}

// Event listener to add a new note at the current viewport position
add__note.addEventListener('click', function() {
    const { top, left } = getViewportPos();
    const color = noteColorInput.value;
    const textarea = createNote('', `${top}px`, `${left}px`, color);
    notesContainer.appendChild(textarea);
});

// Event listener to add a new vertical line at the current viewport position
add__line.addEventListener('click', function() {
    const { top, left } = getViewportPos();
    const line = createLine('vertical', `${top}px`, `${left}px`, '200px');
    notesContainer.appendChild(line);
});

// Event listener to add a new horizontal line at the current viewport position
add__hline.addEventListener('click', function() {
    const { top, left } = getViewportPos();
    const hline = createLine('horizontal', `${top}px`, `${left}px`, '200px');
    notesContainer.appendChild(hline);
});

// Function to create a new note element
function createNote(text = '', top = '100px', left = '100px', backgroundColor = '#ffffff') {
    const textarea = document.createElement("div");
    textarea.classList.add("note");
    textarea.style.top = top;
    textarea.style.left = left;
    textarea.style.backgroundColor = backgroundColor;

    const textAreaInput = document.createElement("textarea");
    textAreaInput.value = text;
    textAreaInput.setAttribute('spellcheck', 'false'); // Disable spellcheck
    textAreaInput.style.width = "100%";
    textAreaInput.style.height = "calc(100% - 10px)";
    textAreaInput.style.border = "none";
    textAreaInput.style.resize = "none";
    textAreaInput.style.backgroundColor = "transparent";
    textAreaInput.style.fontSize = "21px";
    textAreaInput.style.fontWeight = "bold";
    textAreaInput.style.outline = "none";
    textarea.appendChild(textAreaInput);

    // Grey bar at the bottom for dragging
    const dragBar = document.createElement("div");
    dragBar.classList.add("drag-bar");
    textarea.appendChild(dragBar);

    // White dot at bottom right for resizing
    const resizer = document.createElement("div");
    resizer.classList.add("resizer");
    textarea.appendChild(resizer);

    // Save note to localStorage on input
    textAreaInput.addEventListener('input', saveNotes);

    // Save note to localStorage on drag end
    textarea.addEventListener('mouseup', saveNotes);

    // Make the textarea draggable and resizable
    makeDragBar(textarea);
    makeResizer(textarea);

    return textarea;
}

// Function to create a new vertical or horizontal line
function createLine(type, top = '100px', left = '100px', length = '200px') {
    const line = document.createElement("div");
    line.classList.add(type === 'vertical' ? "vline" : "hline"); // Ternary operation
    line.style.top = top;
    line.style.left = left;
    line.style.width = type === 'vertical' ? '15px' : length; // Ternary operation
    line.style.height = type === 'vertical' ? length : '15px'; // Ternary operation

    // Add resizer to the line
    const resizer = document.createElement("div");
    resizer.classList.add("resizer");
    line.appendChild(resizer);

    // Save line to localStorage on resize end
    line.addEventListener('mouseup', saveNotes);

    // Make the line draggable and resizable
    makeDragBar(line);
    makeResizer(line);

    return line;
}

// Function to make elements draggable
function makeDragBar(element) {
    let isDragging = false;
    let startX, startY, initialX, initialY;

    element.addEventListener('mousedown', (e) => {
        if (e.target.classList.contains('resizer')) return;
        isDragging = true;
        startX = e.clientX;
        startY = e.clientY;
        initialX = element.offsetLeft;
        initialY = element.offsetTop;

        document.addEventListener('mousemove', onMouseMove);
        document.addEventListener('mouseup', onMouseUp);
    });
    
    // Takes current position of your mouse and uses that to create a new location for element
    function onMouseMove(e) {
        if (isDragging) {
            const dx = e.clientX - startX;
            const dy = e.clientY - startY;

            element.style.left = `${initialX + dx}px`;
            element.style.top = `${initialY + dy}px`;
        }
    }

    // for when you take your mouse off of the drag bar on an element
    function onMouseUp() {
        if (isDragging) {
            isDragging = false;
            document.removeEventListener('mousemove', onMouseMove);
            document.removeEventListener('mouseup', onMouseUp);
            saveNotes(); // Save notes after dragging ends
        }
    }
}

// Function to make elements resizable
function makeResizer(element) {
    const resizer = element.querySelector('.resizer');

    // Initialize variables to track resizing state and initial positions/sizes
    let isResizing = false;
    let startX, startY, startWidth, startHeight;

    // Event listener for when the resizer is clicked 
    resizer.addEventListener('mousedown', (e) => {
        isResizing = true;
        startX = e.clientX;
        startY = e.clientY;
        startWidth = element.offsetWidth;
        startHeight = element.offsetHeight;

        // Event listeners for when there is mouse movement or mouse release
        document.addEventListener('mousemove', onMouseMove);
        document.addEventListener('mouseup', onMouseUp);
    });

    // Function to handle mouse movement during resizing
    function onMouseMove(e) {
        if (isResizing) {
            const dx = e.clientX - startX;
            const dy = e.clientY - startY;
            if (element.classList.contains('vline')) {
                element.style.height = `${startHeight + dy}px`;
            } else if (element.classList.contains('hline')) {
                element.style.width = `${startWidth + dx}px`;
            } else if (element.classList.contains('note')) {
                element.style.width = `${startWidth + dx}px`;
                element.style.height = `${startHeight + dy}px`;
            }
        }
    }

    // Function to handle mouse release from resizer
    function onMouseUp() {
        if (isResizing) {
            isResizing = false;
            document.removeEventListener('mousemove', onMouseMove);
            document.removeEventListener('mouseup', onMouseUp);
            saveNotes(); // Save notes after resizing ends
        }
    }
}

// Function to save notes and lines to localStorage
function saveNotes() {
    const notes = [];
    document.querySelectorAll('.note').forEach(note => {
        const textarea = note.querySelector('textarea');
        notes.push({
            type: 'note',
            text: textarea.value,
            top: note.style.top,
            left: note.style.left,
            backgroundColor: note.style.backgroundColor,
            width: note.style.width,
            height: note.style.height
        });
    });
    document.querySelectorAll('.vline, .hline').forEach(line => {
        notes.push({
            type: line.classList.contains('vline') ? 'vertical' : 'horizontal', // Ternary Operation
            top: line.style.top,
            left: line.style.left,
            width: line.style.width,
            height: line.style.height
        });
    });
    localStorage.setItem('notes', JSON.stringify(notes)); // Safely converts array into string
}

// Function to load notes and lines from localStorage
function loadNotes() {
    const notes = JSON.parse(localStorage.getItem('notes')) || [];
    notes.forEach(noteData => {
        if (noteData.type === 'note') {
            const textarea = createNote(noteData.text, noteData.top, noteData.left, noteData.backgroundColor);
            textarea.style.width = noteData.width;
            textarea.style.height = noteData.height;
            notesContainer.appendChild(textarea);
        } else {
            const line = createLine(noteData.type, noteData.top, noteData.left, noteData.type === 'vertical' ? noteData.height : noteData.width);
            notesContainer.appendChild(line);
        }
    });
}
