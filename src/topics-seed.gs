/**
 * @file topics-seed.gs
 * One-time setup: seeds the Topics tab with 2026 Come Follow Me themes
 * and recent General Conference talk titles.
 *
 * Run once from the Apps Script editor after initial setup.
 * Safe to re-run — it appends only, it does not overwrite existing rows.
 */

/**
 * Seeds the Topics tab if it's empty (only a header row).
 * Called from the Apps Script editor; not connected to any trigger.
 */
function seedTopics() {
  const sheet = getSheet(TAB.TOPICS);
  if (sheet.getLastRow() > 1) {
    Logger.log('Topics tab already has data — seed skipped. Delete existing rows first if you want to re-seed.');
    return;
  }

  const rows = SEED_TOPICS.map(t => [
    t.title,
    t.source,
    t.scriptureRefs || '',
    t.notes || '',
    '',  // Last Used Date — blank on seed
  ]);

  sheet.getRange(2, 1, rows.length, 5).setValues(rows);
  Logger.log(`Seeded ${rows.length} topics.`);
}

// ---------------------------------------------------------------------------
// Topic data
// ---------------------------------------------------------------------------

const SEED_TOPICS = [

  // ---- 2026 Come Follow Me — Doctrine & Covenants ----
  // (2026 CFM curriculum covers Doctrine and Covenants)
  { title: 'The Voice of the Lord',
    source: 'CFM 2026 Week 1',
    scriptureRefs: 'D&C 1' },
  { title: 'That Faith Also Might Increase',
    source: 'CFM 2026 Week 2',
    scriptureRefs: 'D&C 3–5' },
  { title: 'This Is the Spirit of Revelation',
    source: 'CFM 2026 Week 3',
    scriptureRefs: 'D&C 6–9' },
  { title: 'Behold, I Am Jesus Christ',
    source: 'CFM 2026 Week 4',
    scriptureRefs: 'D&C 10–11' },
  { title: 'The Keys of the Kingdom',
    source: 'CFM 2026 Week 5',
    scriptureRefs: 'D&C 13; 27' },
  { title: 'The Rise of the Church of Christ',
    source: 'CFM 2026 Week 6',
    scriptureRefs: 'D&C 20–22' },
  { title: 'The Lord\'s Law of Health',
    source: 'CFM 2026 Week 7',
    scriptureRefs: 'D&C 89' },
  { title: 'Seek Learning, Even by Study and Also by Faith',
    source: 'CFM 2026 Week 8',
    scriptureRefs: 'D&C 88' },
  { title: 'I Will Send Elijah the Prophet',
    source: 'CFM 2026 Week 9',
    scriptureRefs: 'D&C 110' },
  { title: 'The Revelation on Celestial Marriage',
    source: 'CFM 2026 Week 10',
    scriptureRefs: 'D&C 131–132' },
  { title: 'Come Forth Out of Darkness',
    source: 'CFM 2026 Week 11',
    scriptureRefs: 'D&C 133' },
  { title: 'The Coming of the Lord',
    source: 'CFM 2026 Week 12',
    scriptureRefs: 'D&C 45' },

  // ---- General Conference — April 2025 ----
  { title: 'The Covenant Path: A Journey of Joy',
    source: 'GC Apr 2025',
    scriptureRefs: '' },
  { title: 'Ministering in the Savior\'s Way',
    source: 'GC Apr 2025',
    scriptureRefs: 'Mosiah 18:8–9' },
  { title: 'Hearing Him',
    source: 'GC Apr 2025',
    scriptureRefs: 'Matthew 17:5' },
  { title: 'The Power of the Book of Mormon',
    source: 'GC Apr 2025',
    scriptureRefs: '1 Nephi 1' },
  { title: 'Sanctifying Work',
    source: 'GC Apr 2025',
    scriptureRefs: 'D&C 58:27' },
  { title: 'Trusting God in Uncertainty',
    source: 'GC Apr 2025',
    scriptureRefs: 'Proverbs 3:5–6' },
  { title: 'The Gathering of Israel and Our Role in It',
    source: 'GC Apr 2025',
    scriptureRefs: 'D&C 110:11' },
  { title: 'Eternal Life — God\'s Greatest Gift',
    source: 'GC Apr 2025',
    scriptureRefs: 'D&C 14:7' },
  { title: 'The Living Christ: Our Anchor in Troubled Times',
    source: 'GC Apr 2025',
    scriptureRefs: 'Hebrews 6:19' },
  { title: 'Come As You Are, But Don\'t Stay As You Are',
    source: 'GC Apr 2025',
    scriptureRefs: '3 Nephi 27:27' },

  // ---- General Conference — October 2025 ----
  { title: 'Covenant Belonging',
    source: 'GC Oct 2025',
    scriptureRefs: '' },
  { title: 'The Sustaining Power of Faith',
    source: 'GC Oct 2025',
    scriptureRefs: 'Alma 32:21' },
  { title: 'Repentance: The Path to Peace',
    source: 'GC Oct 2025',
    scriptureRefs: 'D&C 19:16–17' },
  { title: 'Raising Children in Light and Truth',
    source: 'GC Oct 2025',
    scriptureRefs: 'D&C 93:40' },
  { title: 'The Restoration Is a Continuing Process',
    source: 'GC Oct 2025',
    scriptureRefs: 'D&C 1:30' },
  { title: 'Finding Peace in a Troubled World',
    source: 'GC Oct 2025',
    scriptureRefs: 'John 14:27' },
  { title: 'The Strength of the Lord',
    source: 'GC Oct 2025',
    scriptureRefs: 'Mosiah 9:17' },
  { title: 'Temple Worship and Family Sealing',
    source: 'GC Oct 2025',
    scriptureRefs: 'D&C 128:15' },
  { title: 'Following the Prophet\'s Voice',
    source: 'GC Oct 2025',
    scriptureRefs: 'D&C 1:38' },
  { title: 'The Atonement of Jesus Christ',
    source: 'GC Oct 2025',
    scriptureRefs: 'Alma 34:8–10' },

  // ---- Perennial topics ----
  { title: 'The Restoration of the Priesthood',
    source: 'Perennial',
    scriptureRefs: 'D&C 13' },
  { title: 'The Book of Mormon: Another Testament of Jesus Christ',
    source: 'Perennial',
    scriptureRefs: 'Introduction, Book of Mormon' },
  { title: 'The First Vision and the Restoration',
    source: 'Perennial',
    scriptureRefs: 'Joseph Smith — History 1:15–20' },
  { title: 'Missionary Work: Every Member a Missionary',
    source: 'Perennial',
    scriptureRefs: 'D&C 88:81' },
  { title: 'Sabbath Day Observance',
    source: 'Perennial',
    scriptureRefs: 'Isaiah 58:13–14; D&C 59:9–13' },
  { title: 'Tithing and the Law of Consecration',
    source: 'Perennial',
    scriptureRefs: 'D&C 119' },
  { title: 'Gratitude',
    source: 'Perennial',
    scriptureRefs: 'D&C 59:7' },
  { title: 'Discipleship in the Last Days',
    source: 'Perennial',
    scriptureRefs: 'D&C 1:1–6' },
];
