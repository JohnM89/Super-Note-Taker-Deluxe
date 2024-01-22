const path = require('path');
const fs = require('fs');
const express = require('express');
const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(express.static('public'));

    // the path to the database file
const dbFilePath = path.join(__dirname, 'db', 'db.json');

    // reading and parsing JSON data from the database file
function readNotes() {
    return JSON.parse(fs.readFileSync(dbFilePath, 'utf8'));
}

    // writing JSON data to the database file
function writeNotes(notes) {
    fs.writeFileSync(dbFilePath, JSON.stringify(notes, null, 2)); 
}

    // serving the 'notes.html' file for the '/notes' route
app.get('/notes', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'notes.html')); 
});

    // responding with JSON data by calling the 'readNotes' function
app.get('/api/notes', (req, res) => {
    res.json(readNotes()); 
});

    // serving the 'index.html' file for all other routes
app.post('/api/notes', (req, res) => {

    // creating a new note object with a unique ID
    const newNote = req.body; 
    newNote.id = require('uuid').v4(); 
    const notes = readNotes(); 
    notes.push(newNote);

    // writing the updated notes array to the database file
    writeNotes(notes);
    res.json(newNote);
}); 

    // deleting a note with a specific ID
app.delete('/api/notes/:id', (req, res) => {

    // reading the ID of the note to be deleted from the request parameters
    const noteId = req.params.id;
    let notes = readNotes();
    notes = notes.filter(note => note.id !== noteId);

    // writing the updated notes array to the database file
    writeNotes(notes);
    res.json({ message: `Note with id ${noteId} deleted` });
    
});


    // starting the server and logging the port number
app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
