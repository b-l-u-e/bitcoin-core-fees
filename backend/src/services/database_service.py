import sqlite3
import os
import logging

logger = logging.getLogger(__name__)

DB_PATH = os.environ.get(
    "DB_PATH",
    os.path.join(os.path.dirname(os.path.abspath(__file__)), "fee_analysis.db")
)

MAX_RANGE_BLOCKS = 10_000  # safety cap on get_estimates_in_range

def init_db():
    try:
        with sqlite3.connect(DB_PATH) as conn:
            cursor = conn.cursor()
            cursor.execute('''
                CREATE TABLE IF NOT EXISTS fee_estimates (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    poll_height INTEGER,
                    target INTEGER,
                    estimate_feerate REAL,
                    expected_height INTEGER,
                    network TEXT DEFAULT 'main',
                    timestamp DATETIME DEFAULT CURRENT_TIMESTAMP  -- UTC
                )
            ''')
            # Migration: add network column if missing (existing DBs)
            try:
                cursor.execute("ALTER TABLE fee_estimates ADD COLUMN network TEXT DEFAULT 'main'")
            except sqlite3.OperationalError:
                pass  # column already exists
            cursor.execute('CREATE INDEX IF NOT EXISTS idx_poll_height ON fee_estimates(poll_height)')
            cursor.execute('CREATE INDEX IF NOT EXISTS idx_target ON fee_estimates(target)')
            cursor.execute('CREATE INDEX IF NOT EXISTS idx_network ON fee_estimates(network)')
            # Composite index for the most common query pattern (poll_height + target + network)
            cursor.execute('''
                CREATE INDEX IF NOT EXISTS idx_poll_height_target_network
                ON fee_estimates(poll_height, target, network)
            ''')
            conn.commit()
        logger.info(f"Database initialised at {DB_PATH}")
    except sqlite3.Error as e:
        logger.error(f"Failed to initialise database: {e}", exc_info=True)
        raise


def save_estimate(poll_height, target, feerate, network="main"):
    expected_height = poll_height + target
    try:
        with sqlite3.connect(DB_PATH) as conn:
            cursor = conn.cursor()
            cursor.execute('''
                INSERT INTO fee_estimates (poll_height, target, estimate_feerate, expected_height, network)
                VALUES (?, ?, ?, ?, ?)
            ''', (poll_height, target, feerate, expected_height, network))
            conn.commit()
        logger.debug(f"Saved estimate: poll_height={poll_height}, target={target}, feerate={feerate}, network={network}")
    except sqlite3.Error as e:
        logger.error(f"Failed to save estimate (poll_height={poll_height}, target={target}): {e}", exc_info=True)
        raise


def get_estimates_in_range(start_height, end_height, target=2, network="main"):
    # Enforce a max block range to prevent runaway queries
    if end_height - start_height > MAX_RANGE_BLOCKS:
        logger.warning(
            f"Requested range [{start_height}, {end_height}] exceeds MAX_RANGE_BLOCKS={MAX_RANGE_BLOCKS}. Clamping."
        )
        end_height = start_height + MAX_RANGE_BLOCKS

    try:
        with sqlite3.connect(DB_PATH) as conn:
            conn.row_factory = sqlite3.Row
            cursor = conn.cursor()
            cursor.execute('''
                SELECT DISTINCT poll_height, target, estimate_feerate, expected_height
                FROM fee_estimates
                WHERE poll_height >= ? AND poll_height <= ? AND target = ? AND (network = ? OR network IS NULL)
                ORDER BY poll_height ASC, timestamp ASC
            ''', (start_height, end_height, target, network))
            rows = cursor.fetchall()

        if not rows:
            logger.debug(f"No estimates found in range [{start_height}, {end_height}] for target={target}")

        return rows
    except sqlite3.Error as e:
        logger.error(f"Failed to query estimates in range: {e}", exc_info=True)
        raise


def get_db_height_range(target=2, network="main"):
    try:
        with sqlite3.connect(DB_PATH) as conn:
            cursor = conn.cursor()
            cursor.execute(
                'SELECT MIN(poll_height), MAX(poll_height) FROM fee_estimates WHERE target = ? AND (network = ? OR network IS NULL)',
                (target, network)
            )
            row = cursor.fetchone()

        if row and row[0] is None:
            logger.debug(f"No data in DB for target={target}")

        # Return raw tuple — preserves existing caller contract
        return row
    except sqlite3.Error as e:
        logger.error(f"Failed to get DB height range: {e}", exc_info=True)
        raise
