// === ELEMEN-ELEMEN PENTING DARI HTML ===
const folderList = document.getElementById('folder-list');
const addFolderButton = document.getElementById('add-folder-button');
const newFolderInput = document.getElementById('new-folder-input');

const notesHeader = document.getElementById('notes-header');
const noteInputArea = document.getElementById('note-input-area');
const notesList = document.getElementById('notes-list');
const saveNoteButton = document.getElementById('save-note-button');
const noteTitleInput = document.getElementById('note-title');
const noteBodyInput = document.getElementById('note-body');
const cancelNoteButton = document.getElementById('cancel-note-button');
const textCounter = document.getElementById('text-counter');

// === STRUKTUR DATA UTAMA ===
let folders = [];

// === VARIABEL PENANDA (STATE) ===
let selectedFolderId = null;
let editingNoteId = null;

// === FUNGSI-FUNGSI ===

function saveData() {
  localStorage.setItem('myNotesApp', JSON.stringify(folders));
}

function updateCounter() {
    const text = noteBodyInput.value;
    const characterCount = text.length;
    const trimmedText = text.trim();
    let wordCount = 0;
    if (trimmedText) {
        wordCount = trimmedText.split(/\s+/).length;
    }
    textCounter.textContent = `Kata: ${wordCount} | Karakter: ${characterCount}`;
}

function exitNoteEditMode() {
    editingNoteId = null;
    noteTitleInput.value = '';
    noteBodyInput.value = '';
    saveNoteButton.textContent = 'Simpan Catatan';
    cancelNoteButton.classList.add('hidden');
    updateCounter();
}

function renderFolders() {
  folderList.innerHTML = '';
  folders.forEach(folder => {
    const listItem = document.createElement('li');
    const isActive = folder.id === selectedFolderId;
    listItem.className = `p-3 rounded-md cursor-pointer hover:bg-slate-300 flex justify-between items-center ${isActive ? 'bg-blue-200 font-bold' : ''}`;
    
    const folderNameSpan = document.createElement('span');
    folderNameSpan.textContent = folder.name;
    folderNameSpan.className = 'flex-grow';
    folderNameSpan.dataset.folderId = folder.id;

    const folderButtonsDiv = document.createElement('div');
    folderButtonsDiv.className = 'flex gap-2';

    const renameButton = document.createElement('button');
    renameButton.textContent = '✏️';
    renameButton.className = 'px-2 py-1 rounded hover:bg-slate-400';
    renameButton.title = 'Ganti Nama Folder';
    renameButton.addEventListener('click', (e) => {
        e.stopPropagation();
        renameFolder(folder.id);
    });

    const deleteButton = document.createElement('button');
    deleteButton.textContent = '🗑️';
    deleteButton.className = 'px-2 py-1 rounded hover:bg-red-500 hover:text-white';
    deleteButton.title = 'Hapus Folder';
    deleteButton.addEventListener('click', (e) => {
        e.stopPropagation();
        deleteFolder(folder.id);
    });

    folderButtonsDiv.appendChild(renameButton);
    folderButtonsDiv.appendChild(deleteButton);
    listItem.appendChild(folderNameSpan);
    listItem.appendChild(folderButtonsDiv);
    folderList.appendChild(listItem);
  });
}

function renderNotes() {
    const selectedFolder = folders.find(folder => folder.id === selectedFolderId);
    if (!selectedFolder) {
        noteInputArea.classList.add('hidden');
        notesHeader.textContent = 'Pilih sebuah folder...';
        notesList.innerHTML = '';
        return;
    }
    noteInputArea.classList.remove('hidden');
    notesHeader.textContent = `Catatan di folder: ${selectedFolder.name}`;
    notesList.innerHTML = '';
    if (selectedFolder.notes.length === 0) {
        notesList.innerHTML = `<li class="text-slate-500">Belum ada catatan di folder ini.</li>`;
    } else {
        selectedFolder.notes.forEach(note => {
            const listItem = document.createElement('li');
            // --- PERUBAHAN 1: Tambahkan 'overflow-hidden' di sini ---
            listItem.className = 'bg-white p-4 rounded-md shadow mb-3 overflow-hidden';
            
            const titleElement = document.createElement('h3');
            titleElement.className = 'font-bold text-lg cursor-pointer hover:text-blue-600';
            titleElement.textContent = note.title;
            
            const contentWrapper = document.createElement('div');
            contentWrapper.className = 'mt-2 hidden';

            // --- PERUBAHAN 2: Hapus kelas 'prose' dari sini ---
            const bodyElement = document.createElement('div');
            bodyElement.className = 'text-slate-700 break-all whitespace-pre-wrap';
            
            bodyElement.innerHTML = marked.parse(note.body); 

            const buttonsDiv = document.createElement('div');
            buttonsDiv.className = 'flex justify-end gap-2 mt-4'; 
            
            const editButton = document.createElement('button');
            editButton.textContent = 'Edit';
            editButton.className = 'bg-yellow-500 text-white font-semibold px-4 py-1 rounded-md hover:bg-yellow-600 transition-colors text-sm';
            editButton.addEventListener('click', () => {
                noteTitleInput.value = note.title;
                noteBodyInput.value = note.body;
                editingNoteId = note.id;
                saveNoteButton.textContent = 'Update Catatan';
                cancelNoteButton.classList.remove('hidden');
                noteInputArea.scrollIntoView({ behavior: 'smooth' });
                updateCounter();
            });
            
            const deleteButton = document.createElement('button');
            deleteButton.textContent = 'Hapus';
            deleteButton.className = 'bg-red-500 text-white font-semibold px-4 py-1 rounded-md hover:bg-red-600 transition-colors text-sm';
            deleteButton.addEventListener('click', () => {
                if (confirm('Apakah Anda yakin ingin menghapus catatan ini?')) {
                    deleteNote(note.id);
                }
            });
            
            titleElement.addEventListener('click', () => {
                contentWrapper.classList.toggle('hidden');
            });
            
            buttonsDiv.appendChild(editButton);
            buttonsDiv.appendChild(deleteButton);
            
            contentWrapper.appendChild(bodyElement);
            contentWrapper.appendChild(buttonsDiv); 

            listItem.appendChild(titleElement);
            listItem.appendChild(contentWrapper);
            notesList.appendChild(listItem);
        });
    }
}

function deleteFolder(folderId) {
    if (confirm('Apakah Anda yakin ingin menghapus folder ini beserta semua isinya? Aksi ini tidak bisa dibatalkan.')) {
        folders = folders.filter(folder => folder.id !== folderId);
        if (selectedFolderId === folderId) {
            selectedFolderId = null;
        }
        saveData();
        renderFolders();
        renderNotes();
    }
}

function renameFolder(folderId) {
    const folderToRename = folders.find(folder => folder.id === folderId);
    if (!folderToRename) return;
    const newName = prompt('Masukkan nama folder baru:', folderToRename.name);
    if (newName === null || newName.trim() === '') {
        return;
    }
    folderToRename.name = newName.trim();
    saveData();
    renderFolders();
    if (selectedFolderId === folderId) {
        renderNotes();
    }
}

function deleteNote(noteId) {
    const activeFolder = folders.find(folder => folder.id === selectedFolderId);
    if (!activeFolder) return;
    activeFolder.notes = activeFolder.notes.filter(note => note.id !== noteId);
    saveData();
    renderNotes();
}

function loadData() {
  const dataFromStorage = localStorage.getItem('myNotesApp');
  if (dataFromStorage) {
    folders = JSON.parse(dataFromStorage);
  }
  renderFolders();
}

// === EVENT LISTENERS ===

noteBodyInput.addEventListener('input', updateCounter);

// --- PERUBAHAN 3: Event listener baru untuk tombol Tab ---
noteBodyInput.addEventListener('keydown', (event) => {
    if (event.key === 'Tab') {
        event.preventDefault(); // Hentikan perilaku default (pindah fokus)
        const start = noteBodyInput.selectionStart;
        const end = noteBodyInput.selectionEnd;
        const tabCharacter = '  '; // Sisipkan 2 spasi
        noteBodyInput.value = noteBodyInput.value.substring(0, start) + tabCharacter + noteBodyInput.value.substring(end);
        noteBodyInput.selectionStart = noteBodyInput.selectionEnd = start + tabCharacter.length;
    }
});

addFolderButton.addEventListener('click', () => {
  const folderName = newFolderInput.value.trim();
  if (folderName) {
    const newFolder = { id: Date.now(), name: folderName, notes: [] };
    folders.push(newFolder);
    saveData();
    renderFolders();
    newFolderInput.value = '';
  } else {
    alert('Nama folder tidak boleh kosong!');
  }
});

folderList.addEventListener('click', (event) => {
    const clickedFolderId = event.target.dataset.folderId;
    if (clickedFolderId) {
        selectedFolderId = parseInt(clickedFolderId);
        exitNoteEditMode();
        renderFolders();
        renderNotes();
    }
});

saveNoteButton.addEventListener('click', () => {
    const title = noteTitleInput.value.trim();
    const body = noteBodyInput.value.trim();
    if (!selectedFolderId) {
        alert('Pilih folder terlebih dahulu!');
        return;
    }
    if (!title || !body) {
        alert('Judul dan isi catatan tidak boleh kosong!');
        return;
    }
    const activeFolder = folders.find(folder => folder.id === selectedFolderId);
    if (!activeFolder) return;
    if (editingNoteId !== null) {
        const noteToUpdate = activeFolder.notes.find(note => note.id === editingNoteId);
        if (noteToUpdate) {
            noteToUpdate.title = title;
            noteToUpdate.body = body;
        }
    } else {
        const newNote = { id: Date.now(), title: title, body: body };
        activeFolder.notes.push(newNote);
    }
    saveData();
    renderNotes();
    exitNoteEditMode();
});

cancelNoteButton.addEventListener('click', exitNoteEditMode);

// === JALANKAN FUNGSI SAAT APLIKASI DIMULAI ===
loadData();