const express = require('express');
const cors = require('cors');
const sqlite3 = require('sqlite3').verbose();
const bodyParser = require('body-parser');
const path = require('path');

const app = express();
const db = new sqlite3.Database(path.join(__dirname, 'drawings.db'));

app.use(cors());
app.use(bodyParser.json());

db.run(`
  CREATE TABLE IF NOT EXISTS drawings (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT NOT NULL,
    data TEXT NOT NULL,
    timestamp DATETIME DEFAULT CURRENT_TIMESTAMP
  )
`);

app.post('/api/drawings', (req, res) => {
  const { username, data } = req.body;
  if (!username || !data) {
    return res.status(400).json({ error: 'username and data required' });
  }
  db.run(
    'INSERT INTO drawings (username, data) VALUES (?, ?)',
    [username, JSON.stringify(data)],
    function (err) {
      if (err) return res.status(500).json({ error: err.message });
      res.json({ id: this.lastID });
    }
  );
});

app.get('/api/drawings/:username', (req, res) => {
  const username = req.params.username;
  db.all(
    'SELECT id, data, timestamp FROM drawings WHERE username = ? ORDER BY timestamp DESC',
    [username],
    (err, rows) => {
      if (err) return res.status(500).json({ error: err.message });
      res.json(
        rows.map(r => ({
          id: r.id,
          data: JSON.parse(r.data),
          timestamp: r.timestamp
        }))
      );
    }
  );
});

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`Backend listening on port ${PORT}`);
});

