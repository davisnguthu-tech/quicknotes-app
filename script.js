// ==========================================
// 1. DOM Element Selections
// ==========================================
// Previous elements
const noteTextarea = document.getElementById("note-text");
const charCountElem = document.getElementById("char-count");
const wordCountElem = document.getElementById("word-count");
const clearBtn = document.getElementById("clear-btn");
const themeToggleBtn = document.getElementById("theme-toggle");

// Project 1 additions
const noteForm = document.getElementById("note-form");
const noteCategory = document.getElementById("note-category");
const errorMessage = document.getElementById("error-message");
const searchInput = document.getElementById("search-input");
const noteCountElem = document.getElementById("note-count");
const notesList = document.getElementById("notes-list");
const clearAllNotesBtn = document.getElementById("clear-all-btn");

// Application Data State
let notes = [];

// ==========================================
// 2. Character & Word Counter Functions (From Previous Code)
// ==========================================
function updateCounts() {
  const text = noteTextarea.value;
  const charCount = text.length;

  // Word count (splits by whitespace, handles empty string)
  const words = text.trim() ? text.trim().split(/\s+/).length : 0;

  // Update text displays
  charCountElem.textContent = `${charCount} / 200 characters`;
  wordCountElem.textContent = `${words} ${words === 1 ? "word" : "words"}`;

  // Manage warning/over styling classes
  if (charCount > 200) {
    charCountElem.classList.add("over");
    charCountElem.classList.remove("warning");
  } else if (charCount > 180) {
    charCountElem.classList.add("warning");
    charCountElem.classList.remove("over");
  } else {
    charCountElem.classList.remove("warning", "over");
  }
}

// Clear textarea draft
function clearDraft() {
  noteTextarea.value = "";
  localStorage.removeItem("noteDraft");
  errorMessage.textContent = "";
  updateCounts();
}

// ==========================================
// 3. LocalStorage Persistence
// ==========================================
function loadNotes() {
  const saved = localStorage.getItem("quicknotes_data");
  if (saved) {
    try {
      notes = JSON.parse(saved);
    } catch (e) {
      notes = [];
    }
  }
}

function saveNotes() {
  localStorage.setItem("quicknotes_data", JSON.stringify(notes));
}

// ==========================================
// 4. Utility & Helper Functions
// ==========================================
function isDuplicate(text) {
  const cleanText = text.trim().toLowerCase();
  return notes.some(
    (note) => note.text.trim().toLowerCase() === cleanText
  );
}

function updateNoteCountDisplay(count) {
  if (!noteCountElem) return;
  if (count === 0) {
    noteCountElem.textContent = "You have no notes yet.";
  } else if (count === 1) {
    noteCountElem.textContent = "You have 1 note.";
  } else {
    noteCountElem.textContent = `You have ${count} notes.`;
  }
}

// ==========================================
// 5. DOM Rendering Function
// ==========================================
function renderNotes() {
  if (!notesList) return;

  // Clear current list content
  notesList.textContent = "";

  // Filter notes by search input query
  const query = searchInput ? searchInput.value.trim().toLowerCase() : "";
  const filteredNotes = notes.filter((note) =>
    note.text.toLowerCase().includes(query)
  );

  updateNoteCountDisplay(notes.length);

  // Display empty state message if no notes match
  if (filteredNotes.length === 0) {
    const emptyLi = document.createElement("li");
    emptyLi.className = "empty-message";
    emptyLi.textContent = query
      ? "No notes match your search."
      : "No notes available. Add one above!";
    notesList.appendChild(emptyLi);
    return;
  }

  // Construct elements safely using createElement and textContent
  filteredNotes.forEach((note) => {
    const li = document.createElement("li");
    const catClass = note.category.toLowerCase();
    li.className = `note-card category-${catClass}`;

    const contentDiv = document.createElement("div");
    contentDiv.className = "note-content";

    const textP = document.createElement("p");
    textP.className = "note-text";
    textP.textContent = note.text; // Prevents XSS

    const metaDiv = document.createElement("div");
    metaDiv.className = "note-meta";

    const badgeSpan = document.createElement("span");
    badgeSpan.className = `badge badge-${catClass}`;
    badgeSpan.textContent = note.category;

    const dateSpan = document.createElement("span");
    dateSpan.className = "note-date";
    dateSpan.textContent = note.createdAt;

    metaDiv.appendChild(badgeSpan);
    metaDiv.appendChild(dateSpan);

    contentDiv.appendChild(textP);
    contentDiv.appendChild(metaDiv);

    const deleteBtn = document.createElement("button");
    deleteBtn.className = "delete-btn";
    deleteBtn.textContent = "Delete";
    deleteBtn.addEventListener("click", () => deleteNote(note.id));

    li.appendChild(contentDiv);
    li.appendChild(deleteBtn);

    notesList.appendChild(li);
  });
}

// ==========================================
// 6. Action Handlers (Add, Delete, Clear All)
// ==========================================
function handleAddNote(event) {
  event.preventDefault();

  const text = noteTextarea.value.trim();
  const category = noteCategory ? noteCategory.value : "personal";

  // Validation Checks
  if (!text) {
    errorMessage.textContent = "Please type a note first.";
    return;
  }

  if (text.length > 200) {
    errorMessage.textContent = "Notes must be 200 characters or fewer.";
    return;
  }

  if (isDuplicate(text)) {
    errorMessage.textContent = "Note not added: A duplicate note already exists.";
    return;
  }

  // Create new Note object
  const newNote = {
    id: Date.now().toString(),
    text: text,
    category: category,
    createdAt: new Date().toLocaleString("en-US", {
      dateStyle: "medium",
      timeStyle: "short",
    }),
  };

  // Prepend to notes array
  notes.unshift(newNote);
  saveNotes();
  renderNotes();

  // Clear input draft and reset counters
  clearDraft();
  noteTextarea.focus();
}

function deleteNote(id) {
  notes = notes.filter((note) => note.id !== id);
  saveNotes();
  renderNotes();
}

function clearAllSavedNotes() {
  if (notes.length === 0) return;

  if (confirm("Are you sure you want to delete all saved notes?")) {
    notes = [];
    saveNotes();
    renderNotes();
  }
}

// ==========================================
// 7. Event Listeners
// ==========================================
// Textarea live counters & draft saving
noteTextarea.addEventListener("input", () => {
  updateCounts();
  localStorage.setItem("noteDraft", noteTextarea.value);
});

// Clear draft button
clearBtn.addEventListener("click", clearDraft);

// Escape key inside textarea clears draft
noteTextarea.addEventListener("keydown", (event) => {
  if (event.key === "Escape") {
    clearDraft();
  }
});

// Theme toggle button
themeToggleBtn.addEventListener("click", () => {
  document.body.classList.toggle("dark-mode");
  const isDark = document.body.classList.contains("dark-mode");
  themeToggleBtn.textContent = isDark ? "Light mode" : "Dark mode";
  localStorage.setItem("theme", isDark ? "dark" : "light");
});

// Form submission & Search listeners
if (noteForm) {
  noteForm.addEventListener("submit", handleAddNote);
}

if (searchInput) {
  searchInput.addEventListener("input", renderNotes);
}

if (clearAllNotesBtn) {
  clearAllNotesBtn.addEventListener("click", clearAllSavedNotes);
}

// ==========================================
// 8. Initialization Function
// ==========================================
function init() {
  // Restore saved textarea draft
  const savedDraft = localStorage.getItem("noteDraft");
  if (savedDraft !== null) {
    noteTextarea.value = savedDraft;
  }

  // Restore saved theme preference
  const savedTheme = localStorage.getItem("theme");
  if (savedTheme === "dark") {
    document.body.classList.add("dark-mode");
    themeToggleBtn.textContent = "Light mode";
  } else {
    document.body.classList.remove("dark-mode");
    themeToggleBtn.textContent = "Dark mode";
  }

  // Sync draft counters
  updateCounts();

  // Load saved notes and render them to the DOM
  loadNotes();
  renderNotes();
}

// Execute app startup
init();