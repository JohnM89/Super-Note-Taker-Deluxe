$(document).ready(function () {

  // variables for DOM elements and form controls
  let noteForm, 
    noteTitle, 
    noteText,  
    saveNoteBtn,  
    newNoteBtn,  
    noteList; 
  // check if the current URL path is '/notes'
  if (window.location.pathname === '/notes') {
    // if the path is '/notes', initialize variables with jQuery selectors
    noteForm = $('.note-form');
    noteTitle = $('.note-title');
    noteText = $('.note-textarea');
    saveNoteBtn = $('.save-note');
    newNoteBtn = $('.new-note');
    clearBtn = $('.clear-btn');
    noteList = $('.list-container .list-group');
  }

  // function to show a DOM element
  const show = (elem) => {
    elem.show();
  };

  // function to hide a DOM element
  const hide = (elem) => {
    elem.hide();
  };

  let activeNote = {}; // object to hold the active note data

  // function to retrieve all notes from the database via an AJAX request
  const getNotes = () =>
    $.ajax({
      url: '/api/notes',
      method: 'GET',
      contentType: 'application/json',
    });

  // function to save a note to the database via an AJAX POST request
  const saveNote = (note) =>
    $.ajax({
      url: '/api/notes',
      method: 'POST',
      contentType: 'application/json',
      data: JSON.stringify(note),
    });

  // function to delete a note from the database via an AJAX DELETE request
  const deleteNote = (id) =>
    $.ajax({
      url: `/api/notes/${id}`,
      method: 'DELETE',
      contentType: 'application/json',
    });

  // function to render the active note on the UI
  const renderActiveNote = () => {
    // hide the "Save" and "Clear" buttons
    hide(saveNoteBtn);
    hide(clearBtn);

    if (activeNote.id) {
      // if there is an active note, show the "New Note" button
      show(newNoteBtn);
      // disable the title and text input fields
      noteTitle.attr('readonly', true);
      noteText.attr('readonly', true);
      // populate the input fields with the active note's data
      noteTitle.val(activeNote.title);
      noteText.val(activeNote.text);
    } else {
      // if there is no active note, hide the "New Note" button (probably not best practice)
      hide(newNoteBtn);
      // enable the title and text input fields
      noteTitle.removeAttr('readonly');
      noteText.removeAttr('readonly');
      // clears the input fields
      noteTitle.val('');
      noteText.val('');
    }
  };

  // function to handle saving a note
  const handleNoteSave = () => {
    // creates a new note object with title and text from input fields
    const newNote = {
      title: noteTitle.val(),
      text: noteText.val(),
    };

    // save the new note to the database and then update the UI
    saveNote(newNote).then(() => {
      getAndRenderNotes(); // Retrieve and render all notes
      renderActiveNote(); // Update the active note display
    });
  };

  // function to handle deleting a note
  const handleNoteDelete = (e) => {
    e.stopPropagation();

    const note = $(e.target);
    const noteId = JSON.parse(note.parent().attr('data-note')).id;

    if (activeNote.id === noteId) {
      activeNote = {};
    }

    // delete the note from the database and then update the UI
    deleteNote(noteId).then(() => {
      getAndRenderNotes(); 
      renderActiveNote(); 
    });
  };

  // function to handle viewing a note
  const handleNoteView = (e) => {
    e.preventDefault();
    activeNote = JSON.parse($(e.target).parent().attr('data-note'));
    renderActiveNote(); 
  };

  // function to handle creating a new note view
  const handleNewNoteView = (e) => {
    activeNote = {};
    show(clearBtn);
    renderActiveNote();
  };

  // function to handle rendering buttons
  const handleRenderBtns = () => {
    show(clearBtn);

    if (!noteTitle.val().trim() && !noteText.val().trim()) {
      hide(clearBtn);
    } else if (!noteTitle.val().trim() || !noteText.val().trim()) {
      hide(saveNoteBtn);
    } else {
      show(saveNoteBtn);
    }
  };

  // function to create a list item for a note
  const createLi = (text, delBtn = true) => {
    const liEl = $('<li>').addClass('list-group-item');
    const spanEl = $('<span>')
      .addClass('list-item-title')
      .text(text)
      .on('click', handleNoteView);

    liEl.append(spanEl);

    if (delBtn) {
      const delBtnEl = $('<i>')
        .addClass('fas fa-trash-alt float-right text-danger delete-note')
        .on('click', handleNoteDelete);

      liEl.append(delBtnEl);
    }

    return liEl;
  };

  // function to render the list of notes
  const renderNoteList = async (notes) => {
    let jsonNotes = await notes;

    if (window.location.pathname === '/notes') {
      noteList.each((index, el) => $(el).html(''));
    }

    let noteListItems = [];

    if (jsonNotes.length === 0) {
      noteListItems.push(createLi('No saved Notes', false));
    }

    for (let i = 1; i < jsonNotes.length; i++) {
      const note = jsonNotes[i];
      const li = createLi(note.title);
      li.attr('data-note', JSON.stringify(note));
      noteListItems.push(li);
    }

    if (window.location.pathname === '/notes') {
      noteListItems.forEach((note) => noteList.eq(0).append(note));
    }
  };

  // function to retrieve and render all notes
  const getAndRenderNotes = () => {
    getNotes().then(renderNoteList);
  };

  // checks if the current URL path is '/notes' before binding event handlers
  if (window.location.pathname === '/notes') {
    saveNoteBtn.on('click', handleNoteSave);
    newNoteBtn.on('click', handleNewNoteView);
    clearBtn.on('click', renderActiveNote);
    noteForm.on('input', handleRenderBtns);
  }

  // initially retrieve and render all notes when the page loads
  getAndRenderNotes();
});
