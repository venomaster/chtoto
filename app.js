const path = require('path');
const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const app = express();
const port = 3000;

app.use(express.json()); 
app.use(express.static(path.join(__dirname))); // Раздаём статические файлы

// Отдаём index.html при заходе на /
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

// Подключение к базе данных
const db = new sqlite3.Database('database.db');

// API маршруты
app.get('/api/users', (req, res) => {
    db.all("SELECT * FROM users", [], (err, rows) => {
      if (err) {
        console.error(err);
        return res.status(500).json({ error: err.message });
      }
      res.json(rows); 
    });
});

app.post('/api/users', (req, res) => {
    const { name, age } = req.body;
    db.run("INSERT INTO users (name, age) VALUES (?, ?)", [name, age], function(err) {
        if (err) {
            console.error(err);
            return res.status(500).json({ error: err.message });
        }
        res.status(201).json({ id: this.lastID, name, age });
    });
});

app.put('/api/users/:id', (req, res) => {
    const { name, age } = req.body;
    const { id } = req.params;
    db.run("UPDATE users SET name = ?, age = ? WHERE id = ?", [name, age, id], function(err) {
        if (err) {
            console.error(err);
            return res.status(500).json({ error: err.message });
        }
        if (this.changes === 0) {
            return res.status(404).json({ error: "User not found" });
        }
        res.status(200).json({ id, name, age });
    });
});

app.delete('/api/users/:id', (req, res) => {
    const { id } = req.params;
    db.run("DELETE FROM users WHERE id = ?", [id], function(err) {
        if (err) {
            console.error(err);
            return res.status(500).json({ error: err.message });
        }
        if (this.changes === 0) {
            return res.status(404).json({ error: "User not found" });
        }
        res.status(204).end(); 
    });
});

app.listen(port, () => {
    console.log(`Server is running at http://localhost:${port}`);
});
