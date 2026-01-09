import * as SQLite from 'expo-sqlite';
import wordsList from './words.json';

const db = SQLite.openDatabaseSync('impostorjf.db');

export const initDatabase = () => {
  // Core tables
  db.execSync(`
    CREATE TABLE IF NOT EXISTS players (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL
    );
    CREATE TABLE IF NOT EXISTS words (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      word TEXT NOT NULL,
      clue TEXT NOT NULL
    );
    CREATE TABLE IF NOT EXISTS active_game (
      id INTEGER PRIMARY KEY DEFAULT 1,
      word_id INTEGER,
      impostor_id INTEGER,
      current_player_index INTEGER DEFAULT 0,
      phase TEXT DEFAULT 'setup' -- 'setup', 'intermediate', 'reveal', 'end'
    );
  `);

  // Sync database words with library if lengths differ
  const wordsCount = db.getFirstSync('SELECT COUNT(*) as count FROM words').count;
  if (wordsCount !== wordsList.length) {
    db.withTransactionSync(() => {
      db.runSync('DELETE FROM words');
      for (const item of wordsList) {
        db.runSync('INSERT INTO words (word, clue) VALUES (?, ?)', item.word, item.clue);
      }
    });
    console.log(`Synchronized ${wordsList.length} words.`);
  }
};

// Player Management
export const addPlayer = (name) => {
  db.runSync('INSERT INTO players (name) VALUES (?)', name);
};

export const getPlayers = () => {
  return db.getAllSync('SELECT * FROM players');
};

export const clearPlayers = () => {
  db.runSync('DELETE FROM players');
};
export const deletePlayer = (id) => {
  db.runSync('DELETE FROM players WHERE id = ?', id);
};

// Game Logic
export const setupGame = async () => {
  const players = getPlayers();
  if (players.length < 3) throw new Error('Need at least 3 players');

  // Pick random word
  const word = db.getFirstSync('SELECT * FROM words ORDER BY RANDOM() LIMIT 1');

  // Pick random impostor from current players
  const impostor = players[Math.floor(Math.random() * players.length)];

  // Reset/Initialize active game
  db.runSync('DELETE FROM active_game');
  db.runSync(
    'INSERT INTO active_game (word_id, impostor_id, current_player_index, phase) VALUES (?, ?, 0, "intermediate")',
    word.id,
    impostor.id
  );

  return { word, impostor, players };
};

export const getGameState = () => {
  const state = db.getFirstSync(`
    SELECT ag.*, w.word, w.clue, p.name as impostor_name
    FROM active_game ag
    JOIN words w ON ag.word_id = w.id
    JOIN players p ON ag.impostor_id = p.id
    WHERE ag.id = 1
  `);
  return state;
};

export const updateGamePhase = (phase, nextIndex = null) => {
  if (nextIndex !== null) {
    db.runSync('UPDATE active_game SET phase = ?, current_player_index = ? WHERE id = 1', phase, nextIndex);
  } else {
    db.runSync('UPDATE active_game SET phase = ? WHERE id = 1', phase);
  }
};

export const resetGame = () => {
  db.runSync('UPDATE active_game SET phase = "setup" WHERE id = 1');
};
