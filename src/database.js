import Database from "better-sqlite3";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export const db = new Database(path.join(__dirname, "../eventsignups-database.sqlite"));

// WAL = write ahead logging, writes go into a separate file and are merged into the DB later (safer and prevents reads from blocking writes)
db.pragma("journal_mode = WAL");

//table to store all events
db.prepare(`
    CREATE TABLE IF NOT EXISTS events (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    description TEXT,
    image_url TEXT,
    team_size INTEGER NOT NULL,
    created_at INTEGER,
    is_open INTEGER DEFAULT 1
    )
`).run();

//table to store all signups
db.prepare(`CREATE TABLE IF NOT EXISTS event_signups (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    event_id INTEGER NOT NULL,
    user_id TEXT NOT NULL,
    username TEXT NOT NULL,
    rsn TEXT NOT NULL,
    created_at INTEGER,
    UNIQUE (event_id, user_id),
    FOREIGN KEY (event_id) REFERENCES events(id)
    )
`).run();