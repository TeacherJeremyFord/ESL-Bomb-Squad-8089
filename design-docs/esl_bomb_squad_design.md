# ESL Bomb Squad - Game Design Document

## Core Concept

ESL Bomb Squad is a cooperative communication game inspired by *Keep Talking and Nobody Explodes*, designed for English as a Second Language (ESL) learners. One player, the **Defuser**, interacts with a bomb interface, while the other players, the **Experts**, use an English-only manual to describe how to deactivate the bomb's modules. The Defuser cannot see the manual, and the Experts cannot see the bomb, forcing players to use clear English communication under time pressure.

## Teacher Mode & QR Code Configuration

### Teacher Mode Access

Teachers can access advanced configuration options through a simple toggle:

**Settings Menu:**
```
☐ Sound Effects
☐ Emoji Fallback
☐ Teacher Mode
    Password: [____]
    (Default: "teacher" - case insensitive)
```

**Purpose:**
- Keeps curious students out of configuration
- Easy for teachers to remember and access
- Not about security, just access control
- Password can be changed if needed

---

## QR Code System (Settings Only)

QR codes contain **only game settings** - no URLs, no downloads required. The QR code data is hardcoded directly into the image and can be read offline.

### QR Code Contents:

```json
{
  "name": "5th Grade, Unit 3",
  "version": "1.2.3",
  "settings": {
    "modules": 4,
    "timer": 300,
    "difficulty": "B1",
    "enabled_modules": ["color_wires", "word_scramble", "whos_on_first"],
    "vocab_folders": ["animals_basic", "food_basic"],
    "vocab_settings": {
      "emoji_fallback": true
    }
  }
}
```

### Teacher Workflow:

**Creating Configurations:**
1. Open Teacher Mode
2. Configure settings (timer, difficulty, modules, vocab)
3. Give it a name: "5th Grade, Unit 3"
4. [Save Configuration]
5. [Generate QR Code]
6. [Export as PDF] → Saves "5th_Grade_Unit_3.pdf" with title and QR code

**Result:** Teacher builds a library of saved configurations:
```
/saved_configs/
  5th_Grade_Unit_3.pdf
  5th_Grade_Unit_4.pdf
  6th_Grade_Unit_1.pdf
  Advanced_Practice.pdf
```

### Using QR Codes in Class:

**Week 1:** Teacher projects "5th Grade, Unit 3.pdf" on screen
**Week 4:** Teacher projects "5th Grade, Unit 4.pdf"
**Remedial Group:** Projects "Beginner_Review.pdf"

Students scan → Settings apply instantly → Play begins

**Key Features:**
- QR codes never expire
- Same QR code = same settings forever
- No internet required to scan
- Reusable across semesters/years
- Shareable with other teachers

### PDF Export Format:

```
┌─────────────────────────────────────┐
│      ESL Bomb Squad                 │
│                                     │
│      5th Grade, Unit 3              │
│                                     │
│   ┌─────────────────────────┐       │
│   │                         │       │
│   │     [QR CODE IMAGE]     │       │
│   │                         │       │
│   └─────────────────────────┘       │
│                                     │
│   Settings:                         │
│   • Timer: 5:00                     │
│   • Difficulty: B1                  │
│   • Modules: 4 per bomb             │
│   • Using: Animals, Food vocab      │
│   • Modules: 8 enabled              │
│                                     │
│   Scan this code to start playing   │
└─────────────────────────────────────┘
```

### Student Scan Experience:

```
1. Student opens app
2. Clicks [Scan Teacher Code]
3. Camera scans QR code
4. App decodes settings (no internet needed)
5. App applies all settings:
   ✓ Timer: 5:00
   ✓ Difficulty: B1
   ✓ Modules per bomb: 4
   ✓ Enabled modules applied
   
6. App checks what's locally available:
   ✓ color_wires - installed
   ✓ word_scramble - installed
   ❌ whos_on_first - missing
   
7. If content missing:
   - Brief dismissible notification
   - Downloads in background (if sources configured)
   - Game starts immediately with available content
   - Missing content used in next round (after download)
```

### Saved Configurations Screen (Teacher Mode):

```
┌─────────────────────────────────────┐
│   My Saved Configurations           │
├─────────────────────────────────────┤
│                                     │
│  📄 5th Grade, Unit 3               │
│     B1 • 5:00 • 4 modules           │
│     [Show QR] [Edit] [Export PDF]   │
│                                     │
│  📄 5th Grade, Unit 4               │
│     B1 • 5:00 • 4 modules           │
│     [Show QR] [Edit] [Export PDF]   │
│                                     │
│  📄 6th Grade, Unit 1               │
│     B2 • 4:00 • 5 modules           │
│     [Show QR] [Edit] [Export PDF]   │
│                                     │
│  [+ New Configuration]              │
└─────────────────────────────────────┘
```

---

## Content Distribution (Separate from QR Codes)

Download sources are **configured in the app**, not in QR codes. This keeps QR codes simple and allows teachers to update download sources without regenerating all QR codes.

### Content Sources Configuration (Teacher Mode):

```
Content Sources (Optional):
  ☑ Project Default (https://esl-bomb-squad.com/content/)
  ☑ Custom URL: [https://my-dropbox-link.com/modules]
  ☑ GitHub: [repository URL]
  ☑ Google Drive: [shared folder ID]
  
Priority Order:
  1. Local files (already installed)
  2. Custom sources (in order listed)
  3. Project default
```

### Supported Distribution Methods:

**GitHub (Public Repository):**
```
https://raw.githubusercontent.com/user/repo/main/modules/
```

**Dropbox (Shared Link):**
```
https://www.dropbox.com/sh/abc123/modules?dl=1
```

**Google Drive (Public Folder):**
```
https://drive.google.com/uc?id=FOLDER_ID
```

**Direct URL:**
```
https://teacher-website.com/esl-content/
```

### Background Download Behavior:

**When student scans QR code and content is missing:**

1. **Immediate:** Game starts with available content
2. **Background:** Downloads missing content from configured sources
3. **Silent:** No blocking, no waiting
4. **Next Round:** New content available for use

**If download fails:**
- Game continues with available content
- Error logged quietly (doesn't bother student)
- Retry on next launch

**No internet available:**
- Brief dismissible notification
- Game plays with available content
- Retry when connection restored

---

## Game Code & Deterministic Generation

Every bomb gets a **unique game code** that can recreate it exactly. This enables practice, replay, and accountability.

### Game Code Format:

```
ESL-v1.2.3-B1-a3f89d-4m-300s

Breaking it down:
ESL          = Game identifier
v1.2.3       = Game version
B1           = Difficulty level
a3f89d       = Seed hash (determines randomization)
4m           = Number of modules
300s         = Timer length in seconds
```

### Seed Hash Determines:

- Which specific modules appear on the bomb
- Serial number
- Module configurations (wire colors, button positions, word scrambles, etc.)
- All randomized lookup tables
- All module-specific random elements

**Key Feature:** Same game code = exact same bomb

### Use Cases:

**Teacher assigns practice:** "Everyone play game ESL-v1.2.3-B1-a3f89d-4m-300s"

**Student asks for help:** "I'm stuck on ESL-v1.2.3-B1-7f2e91-4m-300s, can you show me?"

**Replay for improvement:** Student replays yesterday's bomb to beat their time

**Competitive speedrun:** Class competes on same bomb configuration

---

## Score Tracking & Storage

### Local Storage (On Device)

All scores are stored **indefinitely** on the student's device. No automatic deletion.

**Storage Location:**
```
/game_data/
  scores.json           (all historical game sessions)
  error_log_1.txt       (most recent errors)
  error_log_2.txt       (second most recent)
  error_log_3.txt       (third most recent)
```

### Player Name Entry (Optional):

At game start, students can optionally enter their name:

```
┌─────────────────────────────────┐
│   Ready to Start?               │
├─────────────────────────────────┤
│                                 │
│   Enter your name (optional):   │
│   [Alex Chen____________]       │
│                                 │
│   This helps track your         │
│   progress and high scores.     │
│                                 │
│   [Skip]          [Start Game]  │
└─────────────────────────────────┘
```

**If skipped:** Records with fun anonymous names:
- "Mystery Defuser #42"
- "Secret Agent"
- "Anonymous Hero"
- "The Nameless One"

### Session Record Structure:

```json
{
  "session_id": "uuid-1234-5678",
  "timestamp": "2024-12-02T14:35:22Z",
  "player_name": "Alex Chen",
  "game_code": "ESL-v1.2.3-B1-a3f89d-4m-300s",
  "game_version": "1.2.3",
  "difficulty": "B1",
  "settings": {
    "modules_count": 4,
    "timer": 300,
    "enabled_modules": ["color_wires", "word_scramble", "whos_on_first", "number_keypad"],
    "vocab_folders": ["animals_basic", "food_basic"]
  },
  "result": {
    "status": "defused",
    "time_taken": 245,
    "time_remaining": 55,
    "total_strikes": 1,
    "modules_completed": 4,
    "modules_failed": 0
  },
  "module_details": [
    {
      "module": "color_wires",
      "status": "completed",
      "time_taken": 45,
      "strikes": 0
    },
    {
      "module": "word_scramble",
      "status": "completed", 
      "time_taken": 78,
      "strikes": 1
    }
  ]
}
```

### Student Statistics View:

```
┌─────────────────────────────────┐
│   Your Stats                    │
├─────────────────────────────────┤
│                                 │
│   Total Games: 127              │
│   Games Won: 95 (74.8%)         │
│   Games Lost: 32                │
│                                 │
│   Total Time Played: 10h 40m    │
│   Average Time: 4:45            │
│   Best Time: 3:00               │
│   Total Strikes: 47             │
│                                 │
│   Favorite Module:              │
│   🏆 Word Scramble (never failed)│
│                                 │
│   Needs Practice:               │
│   ⚠️  Who's on First (6 failures)│
│                                 │
│   [View Full History]           │
│   [Export Data]                 │
└─────────────────────────────────┘
```

### Game History View:

```
┌─────────────────────────────────┐
│   My Game History               │
├─────────────────────────────────┤
│                                 │
│  Dec 2, 2024 - 2:35 PM          │
│  Alex Chen                      │
│  ✓ Defused in 4:05 (1 strike)   │
│  Code: ESL-v1.2.3-B1-a3f89d...  │
│  [View Details] [Replay]        │
│                                 │
│  Dec 2, 2024 - 2:20 PM          │
│  Alex Chen                      │
│  ✗ Exploded at 1:23 (3 strikes) │
│  Code: ESL-v1.2.3-B1-7f2e91...  │
│  [View Details] [Replay]        │
│                                 │
│  [Export All Data]              │
└─────────────────────────────────┘
```

### Replay System:

Students can replay any previous game using the [Replay] button:
- Recreates exact same bomb
- Same serial number
- Same module selection  
- Same randomization (wire colors, word scrambles, button layouts)
- Useful for practice and improvement

---

## Data Export & Teacher Collection

### Export Formats:

**CSV Export (for spreadsheets):**
```csv
Timestamp,Player Name,Game Code,Status,Time Taken,Time Remaining,Strikes,Modules
2024-12-02 14:35:22,Alex Chen,ESL-v1.2.3-B1-a3f89d-4m-300s,Defused,245,55,1,"color_wires,word_scramble,whos_on_first,number_keypad"
```

**JSON Export (full detail)**

### Export/Share Methods:

- Email attachment
- Save to Google Drive
- Save to Dropbox  
- AirDrop (iOS)
- Nearby Share (Android)
- Copy to clipboard
- QR code (student generates QR with their scores, teacher scans)

### Teacher Collection Options:

**Manual Collection:**
- Student exports and shares with teacher
- Teacher compiles manually

**Local Network Share:**
- Students export to shared folder on school network
- Teacher collects from centralized location

**QR Code Transfer:**
- Student generates QR code containing score data
- Teacher scans to import into their records

**Optional Server Upload (Advanced):**
- Teacher configures server in their setup
- Scores auto-upload after each game
- Teacher sees real-time dashboard

---

## Error Log Management

The game keeps only the **last 3 error logs** to save space while preserving recent debugging information.

### Log Rotation:

```
When new errors occur:
1. Delete error_log_3.txt (oldest)
2. Rename error_log_2.txt → error_log_3.txt
3. Rename error_log_1.txt → error_log_2.txt
4. Create new error_log_1.txt (most recent)
```

### Error Log Format:

```
=== ERROR LOG ===
Date: 2024-12-02
Device: iPad Pro (iOS 17.1)
Game Version: 1.2.3

[14:25:33] WARNING: Module 'whos_on_first' vocab.txt insufficient (8 words, need 12)
           → Fallback to vocab.json

[14:26:15] WARNING: Missing image for 'elephant' in /animals/
           → Using emoji fallback 🐘

[14:30:42] ERROR: Module 'categorical_python' failed to load
           → Replaced with 'word_buttons' (same difficulty)
           → Reason: Insufficient categorized vocab

[14:35:18] INFO: Game completed successfully
           → Code: ESL-v1.2.3-B1-a3f89d-4m-300s
```

**Students can export error logs** if teacher requests them for troubleshooting.

---

## The Information Gap Principle (Critical Design Rule)

**The Defuser must NEVER be able to solve modules alone** - they always require the Expert's information to succeed.

This information gap is the foundation of the game and must be preserved in every module design. Without it, students stop communicating and the educational value disappears.

### How to Create Strong Information Gaps:

Every module must use **at least one** of these techniques:

1. **Serial Number Dependency** - The correct action depends on the bomb's serial number, which the Expert must reference in the manual
2. **Hidden Lookup Tables** - The Defuser has input data, but only the Expert has the conversion/lookup table
3. **Conditional Logic** - Multiple possible rules exist; only the Expert's manual reveals which rule applies
4. **Position/Order Dependencies** - Rules reference specific positions, sequences, or arrangements that require Expert interpretation

### Examples of Strong vs. Weak Information Gaps:

**✅ STRONG:** Defuser sees colored wires. Expert has conditional rules ("If red wire is next to blue wire, cut blue"). Defuser cannot know rules without Expert.

**❌ WEAK:** Defuser sees [FAST] [SLOW] buttons. Expert says "press opposite of FAST." An advanced student might solve this without the Expert.

**✅ FIXED:** Defuser sees [FAST] [SLOW] [HAPPY] [SAD]. Expert checks serial number to determine rule ("If serial ends in A-E, press word describing how turtle moves"). Defuser cannot know which rule applies.

---

## Learning Objectives

* **Listening comprehension:** Follow multi-step instructions in English
* **Speaking practice:** Describe images, colors, shapes, and patterns accurately
* **Reading comprehension:** Interpret and relay short English instructions
* **Vocabulary reinforcement:** Practice target words per ESL Unit
* **Grammar and logic:** Understand conditionals, sequencing, and opposites
* **Critical thinking:** Apply logical deduction to solve puzzles

---

## Core Vocabulary (Built-In)

The following vocabulary is always available and never needs to be provided by teachers:

* **Colors:** Red, Orange, Yellow, Green, Blue, Purple, Pink, White, Black, Brown
* **Numbers:** 0-9, written forms (one, two, three...), ordinals (first, second, third...)
* **Alphabet:** A-Z, letter names
* **Positions:** Top, bottom, left, right, first, last

**Modules using ONLY core vocab:** Color Wires, User Name, Number Keypad, Color Switchboard, Word Buttons

### Serial Number Display

The bomb's serial number is displayed with visual clarity:
- **Font:** Fira Code (monospace, clear distinction between I/1 and O/0)
- **Color coding:** Letters appear in purple, numbers in orange
- **Format:** `XXNNN-XNXNN` (e.g., `YI520-Q2N37`)
- **Manual legend:** Explains color coding for Experts

---

## Custom Vocabulary System

### Folder Structure

Teachers organize vocabulary in folders within `/vocab/`:

```
/vocab/
  /animals/
    animals.txt          (cat, dog, bird, elephant)
    cat.png
    dog.jpg
    bird.png
    elephant.png
  
  /food/
    food.txt             (apple, banana, pizza, bread)
    apple.png
    banana.jpg
    pizza.png
  
  /actions/
    actions.txt          (run, jump, sleep, eat)
    run.png              (optional - only for image-based modules)
    jump.png
```

### Text File Format

Teachers can use **commas, semicolons, OR line breaks** to separate words:

```
cat, dog, bird
```
OR
```
cat; dog; bird
```
OR
```
cat
dog
bird
```

**For word relationships (opposites, synonyms):**
Use the pipe symbol `|` to link related words:
```
fast|slow
hot|cold
big|small
```
Spacing and capitalization don't matter: `fast|slow`, `fast | slow`, and `FAST | SLOW` are all valid.

Optional categories (for organization only):
```
# Farm Animals
cow, pig, chicken

# Wild Animals
lion, tiger, bear

# Opposites
fast|slow
happy|sad
```

### Image Requirements

**Accepted formats:** `.png`, `.jpg`, `.jpeg`, `.gif`, `.svg`

**Naming:** Image filename (without extension) must match vocabulary word
- Case-insensitive: `Cat.PNG`, `cat.jpg`, `CAT.png` all match "cat"
- First valid image found is used
- If multiple extensions exist, one is selected automatically

### Image Fallback System

**Teacher Setting (default: ON):**
- ☑ Use emoji fallback when images missing

When a word has no matching image file:
1. **Check for emoji:** Try common emoji mapping (cat → 🐱, pizza → 🍕)
2. **If emoji found AND fallback enabled:** Use emoji as temporary placeholder
3. **If no emoji OR fallback disabled:** Skip word entirely for image-based modules
4. **Log warning:** `⚠ Missing image for 'elephant' in /animals/ - using emoji 🐘`

### Auto-Generation

**If folder contains images but no .txt file:**
- Automatically generate `.txt` file from image filenames
- Remove extensions, create comma-separated list

**If folder contains .txt but no images:**
- Folder works for text-only modules (Word Buttons, Word Completion)
- Skipped for image-based modules (Symbol Panel, Categorical Python)

### Teacher Selection Interface

**Options Menu → Vocabulary Button:**

```
Settings:
☑ Use emoji fallback when images missing

☐ Select All / Deselect All

Available Vocabulary Folders:
☑ animals_basic (20 words, 20 images)
☑ food_basic (15 words, 15 images)  
☐ actions (25 words, 0 images) ⚠ No images
☐ emotions (10 words, 10 images)
☐ custom_unit_3 (8 words, 5 images) ⚠ Missing 3 images
```

Shows word/image counts and warnings for each folder.

---

## Default Vocabulary Sets

The game ships with starter vocabulary folders that teachers can use as-is or modify:

```
/vocab/
  /animals_basic/
    animals_basic.txt (20 common animals)
    cat.png, dog.png, bird.png, etc.
  
  /food_basic/
    food_basic.txt (20 common foods)
    apple.png, banana.png, pizza.png, etc.
  
  /classroom_objects/
    classroom_objects.txt (20 classroom items)
    book.png, pencil.png, desk.png, etc.
  
  /actions_basic/
    actions_basic.txt (20 common verbs)
    run.png, jump.png, sleep.png, etc.
```

**Total: 80+ words with matching images**

Each module also ships with sensible defaults in its `vocab.json` file:
- Who's on First: Common homophones (their/there/they're, your/you're, etc.)
- Word Scramble: 50 common ESL words of varying lengths
- Password: 40 five-letter words
- Anagrams: 30 word pairs with anagram relationships

Teachers have full access to modify, delete, or add to these defaults.

---

## Graceful Degradation System

### Module Fallback Behavior

**When a module cannot load due to insufficient vocabulary:**
1. Log the failure with reason
2. Search for replacement module of **equal difficulty**
3. If none available, try **one difficulty level lower**
4. If still none, try **one difficulty level higher**
5. Continue until valid module found
6. **Critical:** Replacement module uses ONLY the vocabulary already selected by teacher (no new vocab added)

**Example:**
```
Symbol Panel (B1) requires 6 animal words with images
Available: only 3 valid animal words found
→ Cannot use Symbol Panel
→ Searching for B1 replacement...
→ Found: Word Buttons (B1) - uses same selected vocab
→ Replacement successful
```

**Important:** Failed modules don't add new vocabulary requirements. If a bomb can't create a module with selected vocab, it replaces it with a module that CAN work with that same vocab.

### Module Reduction

**If teacher sets "6 modules" but only 3 can be generated:**
- Launch bomb with 3 modules (reduced difficulty)
- Log warning: `⚠ Only 3 of 6 requested modules could be created with available vocabulary`
- Players never see the reduction
- Teacher device receives notification: "Errors logged - check error log"

### Critical Module Failures

Modules may fail to load if:
- **Symbol Panel:** Not enough words with valid images/emojis (needs 6)
- **Categorical Python:** Not enough categorized vocab (needs food/animals/vehicles)
- **Word Buttons:** Not enough words from selected vocab (needs 4-6)
- **Word Completion:** Not enough words from selected vocab (needs 10+)

Modules using core vocab (Color Wires, User Name, Number Keypad, Color Switchboard) **never fail**.

### Error Logging & Teacher Notification

**Silent to Players:**
- Module replacements are invisible to Defuser and Experts
- Bomb loads with available modules
- Gameplay proceeds normally

**Error Log (text file accessible to teacher):**
```
⚠ Vocabulary Warnings:
  - Multiple images for 'cat' in /animals/ (using cat.png)
  - Missing image for 'elephant' in /animals/ (using emoji 🐘)
  - Missing image for 'nebula' in /space/ (no emoji, word skipped)

⚠ Module Vocab Warnings:
  - whos_on_first/vocab.txt: Found 8 words, need minimum 12
    → Falling back to default vocab.json
  - word_scramble/vocab.txt: Line 5 invalid format, skipping entry
    → Using 15 valid words from file
  - password/vocab.txt: Not found
    → Using default vocab.json (50 common words)

❌ Module Replacements:
  - Bomb #3 (Student: Alex): Symbol Panel (B1) → Word Buttons (B1)
    Reason: Insufficient images (needed 6, found 3)
  - Bomb #7 (Student: Maria): Categorical Python (B2) → Who Lives Where (B2)
    Reason: No categorized vocab folders selected
```

**Teacher Device Notification:**
- Single consolidated notification: "3 errors logged across all active bombs - check error log"
- Prevents notification spam if 30 students encounter issues simultaneously
- Teacher can review log at their convenience

---

## Difficulty Settings

### Teacher Options

**Number of Modules:** 1–6 (how many modules appear on the bomb)

**Timer:** Default 5:00 minutes, adjustable (3:00 to 10:00 range recommended)

**Vocabulary Folders:** Checkbox selection as described above

**Module Difficulty Level:** A1, A2, B1, B2, C1
- Affects module complexity and vocabulary difficulty
- Modules are selected from the chosen difficulty tier

### Module Difficulty Ratings

**A1 (Beginner):**
- Color Wires (A1)
- User Name (A1)
- Word Buttons Level 1 (A1) ⭐
- Monster Lab (A1)
- World Clock (A1)
- Symbol Keypad Level 1 (A1)

**A1-A2 (Beginner–Elementary):**
- Vending Machine (A1-A2)
- Fashion Police (A1-A2)
- Skeleton Key (A1-B1)
- Symbol Keypad Level 2 (A2)
- Places (A1-A2)
- Big Button (A1-A2)

**A2 (Elementary):**
- Number Keypad (A2)
- Word Buttons Level 2 (A2) ⭐⭐
- Date Night (A2)
- Sliders (A2)

**A2-B1 (Elementary–Intermediate):**
- Combination Lock (A2-B1)
- Emoji Sentence Builder (A2-B1)
- Memory (A2-B1)

**B1 (Intermediate):**
- Word Buttons Level 3 (B1) ⭐⭐⭐
- Symbol Panel (B1)
- Color Switchboard (B1)
- Picture Description (B1)
- Symbol Keypad Level 3 (B1)

**B1-B2 (Intermediate–Upper Intermediate):**
- Gossip Module (B1-B2)
- Emoji Translator (B1-B2)
- Color Word Trap (B1-B2)
- Word Code Translator (B1-B2)
- Prefix/Suffix Circuit (B1-B2)

**B2-C1 (Upper Intermediate–Advanced):**
- Word Completion (B2-C1)
- Categorical Python (B2-C1)
- Who Lives Where (B2-C1)

**Modules with Multiple Levels:**
| Module | Level 1 | Level 2 | Level 3 |
|--------|---------|---------|---------|
| Word Buttons | A1 ⭐ | A2 ⭐⭐ | B1 ⭐⭐⭐ |
| Symbol Panel | B1 ⭐ | - | B1 ⭐⭐⭐ |

**Module Count by Difficulty:**
| Level | Count |
|-------|-------|
| A1 | 5 |
| A1-A2 | 2 |
| A2 | 3 |
| A2-B1 | 2 |
| B1 | 4 |
| B1-B2 | 5 |
| B2-C1 | 3 |
| **Total** | **22 modules** |

---

## Manual Generation System

### Dynamic Manual Creation

The Expert Manual is **dynamically generated** based on:
- Selected vocabulary folders
- Number of modules
- Difficulty level
- Randomized module-specific tables (where applicable)

### Manual Unique ID

**ID Generation:**
- Hash created from: selected vocab folders + difficulty + timestamp
- Displayed prominently on manual
- Must match bomb configuration to play

**ID Verification:**
- Teacher/Defuser enters Manual ID when starting bomb
- Mismatch warning: "Manual ID doesn't match bomb configuration"
- Prevents using wrong manual with wrong bomb

### Manual Format

**HTML Page (browser viewable):**
- Clean, printable layout
- Downloadable as PDF
- Each page includes header/footer:
  - Manual ID: `MNL-A3F89D2`
  - Creation Date: `2024-12-01 14:23`
  - Page Number: `Page 3 of 12`
  - Active Vocab: `Using: animals.txt, food.txt, actions.txt`

**Content Sections:**
- Cover page with Manual ID and vocabulary list
- One page per possible module type with instructions
- Lookup tables for each module (randomized where applicable)
- Quick reference guide on back page

### Manual Regeneration

**Module fallback does NOT require manual regeneration** because:
- Replacement modules use the same selected vocabulary
- No new vocab is added to the manual
- Manual already contains instructions for all possible modules at the selected difficulty level

The manual can include module instructions that don't appear in a specific bomb - this is acceptable and expected.

**Manual only needs regeneration if:**
- Teacher changes selected vocabulary folders
- Teacher changes difficulty level
- Teacher adjusts number of modules
- Teacher customizes module-specific tables (if implementing randomization)

---

## Gameplay Loop

1. The bomb activates with a visible timer
2. The Defuser describes what they see (modules, symbols, colors, etc.)
3. The Experts search the manual for matching module instructions
4. The Experts read and explain English instructions
5. The Defuser acts on those instructions (cut wire, press button, enter code, etc.)
6. Mistakes cause strikes; 3 strikes or timer expiration causes detonation
7. Success defuses the bomb and earns progression to the next mission

---

## Standard Game Elements

### Strike System
* Each module begins with 0 strikes
* Incorrect actions add 1 strike to both the module and the bomb
* 3 total bomb strikes = explosion (game over)
* Visual/audio feedback for each strike level

### Standard Color Palette
Red, Orange, Yellow, Green, Blue, Purple, Pink, White, Black, Brown

### Serial Number Format
`ABC12-D3E45` (Letters and numbers with hyphen separator)

---

## Module Progression (Beginner to Advanced)

---

## 1. Color Wires Module
**Difficulty:** Beginner (A1–A2)  
**Time Estimate:** 30–60 seconds

### Defuser View
* 3–6 colored wires displayed vertically
* Each wire has a "CUT" button next to it
* Wires use Standard Color Palette

### Expert Manual
Contains conditional rules based on wire colors and positions:

**Example Rules:**
* If there are exactly 3 wires and no red wire, cut the second wire
* If the last wire is white and there are more than 3 wires, cut the last white wire
* If there is more than one blue wire, cut the last blue wire
* If the red wire is next to a blue wire, cut the blue wire
* Otherwise, cut the first wire

### Difficulty Scaling
* **A1:** 3 wires, 2 simple rules
* **A2:** 4–5 wires, 3–4 rules with basic conditionals
* **B1:** 6 wires, 5+ rules with complex conditions

### ESL Focus
* Colors vocabulary
* Prepositions (next to, between, first, last)
* Conditionals (if/then)
* Ordinal numbers

**Vocabulary Type:** Core (uses built-in color palette)

---

## 2. User Name Module
**Difficulty:** Beginner (A1–A2)  
**Time Estimate:** 30–45 seconds

### Defuser View
* Displays "ENTER USER NAME"
* Text input box (letters only, case insensitive)
* Submit button

### Expert Manual
Contains a list of **26 names**, one for each letter A–Z:

| Letter | Name | Letter | Name |
|--------|------|--------|------|
| A | ANNA | N | NOAH |
| B | BEN | O | OLIVIA |
| C | CARL | P | PETER |
| D | DIANA | Q | QUINN |
| E | EMMA | R | ROSE |
| F | FRANK | S | SAM |
| G | GEORGE | T | TOM |
| H | HELEN | U | UMA |
| I | IAN | V | VERA |
| J | JANE | W | WILL |
| K | KATE | X | XENA |
| L | LUCY | Y | YARA |
| M | MIKE | Z | ZOE |

**Rule:** Look at the **last letter** in the bomb's serial number. Enter the name that starts with that letter.

**Example:**  
Serial: `AP123-Z4K55`  
Last letter: `K`  
Correct answer: `KATE` (any case accepted)

### Teacher Customization
Replace with classroom-relevant names (one per letter)

### ESL Focus
* Alphabet recognition
* Letter-sound correspondence
* Spelling practice
* Following simple instructions

**Vocabulary Type:** Core (uses built-in alphabet; name list can be customized by teacher)

---

## 3. Number Keypad Module
**Difficulty:** Beginner–Intermediate (A2–B1)  
**Time Estimate:** 45–90 seconds

### Defuser View
* Number buttons labeled 0–9 in random arrangement (not in order)
* Single display showing entered numbers
* Submit button
* Clear/Delete button

### Expert Manual
Contains serial number-based conditional rules:

| First Letter of Serial | Rule |
|------------------------|------|
| A, B, C, D | Enter the LARGEST odd number |
| E, F, G, H | Enter the SMALLEST even number, then the LARGEST even number |
| I, J, K, L | Enter the number that comes AFTER the first number in the serial |
| M, N, O, P | Press all PRIME numbers from smallest to largest (2, 3, 5, 7) |
| Q, R, S, T | Enter the SUM of the first and last digits in the serial number |
| U, V, W, X | Enter all numbers in DESCENDING order (9, 8, 7...) |
| Y, Z | Enter only the numbers that appear in the serial number, in order |

**Additional conditionals (B1-B2):**
* If serial contains the number 5, ignore above and enter: 5-5-5
* If serial ends with an even number, DOUBLE the answer (enter it twice)

### Gameplay
1. Defuser describes keypad: "I see numbers 0 through 9"
2. Expert asks for serial number
3. Expert checks first letter and determines rule
4. Expert tells Defuser the rule or the specific numbers to press
5. Defuser enters numbers and submits
6. Correct sequence defuses module; incorrect adds strike

### Difficulty Scaling
* **A2:** Single number entry, basic concepts (odd/even, big/small)
* **B1:** Multi-number sequences, comparatives, mathematical operations
* **B2:** Prime numbers, complex conditionals, serial number math

### Information Gap
✅ **Strong** - Defuser cannot know which rule to follow without Expert checking serial number. Even if Defuser knows math concepts, they don't know which operation is required.

### ESL Focus
* Number vocabulary
* Comparatives (larger, smaller, biggest, first, last)
* Mathematical terms (odd, even, sum, prime, ascending, descending)
* Sequencing language
* Following multi-step mathematical instructions

**Vocabulary Type:** Core (uses built-in number vocabulary)

---

## 4. Word Buttons Module
**Difficulty:** Intermediate (B1)  
**Time Estimate:** 45–75 seconds

### Defuser View
* 4–6 buttons, each labeled with a word
* Words are verbs or adjectives from current ESL Unit
* Example words: FAST, SLOW, HAPPY, SAD, BIG, SMALL

### Expert Manual
Contains serial number-based lookup table that determines which rule to follow:

| Last Letter of Serial | Rule |
|----------------------|------|
| A, B, C, D, E | Press the word that describes how a TURTLE moves |
| F, G, H, I, J | Press the word that is the OPPOSITE of the first word you see |
| K, L, M, N, O | Press the word with the MOST letters |
| P, Q, R, S, T | Press a word that describes FEELINGS |
| U, V, W, X, Y, Z | Press the word that means the same as "unhappy" |

**Additional conditional rules (advanced):**
* If serial number contains a vowel (A, E, I, O, U), ignore the above and press the LAST word
* If there are more than 5 buttons, press the word in position 3

### Gameplay
1. Defuser reads all visible words aloud: "I see FAST, SLOW, HAPPY, SAD, BIG, SMALL"
2. Expert asks for serial number
3. Expert checks last letter and determines rule
4. Expert tells Defuser which word to press (or describes the rule)
5. Defuser presses button

### Difficulty Scaling
* **A2:** 4 words, simple rules (position-based: "press first word")
* **B1:** 5 words, category rules (speed, feelings, size)
* **B2:** 6 words, complex conditionals with opposites/synonyms

### Information Gap
✅ **Strong** - Defuser cannot know which rule applies without Expert checking serial number in manual

### ESL Focus
* Opposites (antonyms)
* Synonyms
* Verbs and adjectives
* Semantic categories
* Following multi-step conditional instructions

**Vocabulary Type:** Custom (requires vocab folders with opposites, synonyms, and categorized words)

---

## 5. Symbol Panel Module
**Difficulty:** Intermediate (A2–B1)  
**Time Estimate:** 60–90 seconds

### Defuser View
* Grid of 6–9 images representing vocabulary words from current Unit
* Images have NO text labels
* Example images: cat, dog, apple, bus, book, tree
* Each image has a numbered position (1-9)

### Expert Manual
Contains serial number-based lookup table:

| First Number in Serial | Rule |
|------------------------|------|
| 0 | Press position 3 |
| 1 | Press something you can EAT |
| 2 | Press something with FOUR LEGS |
| 3 | Press something you can RIDE IN |
| 4 | Press the smallest LIVING thing shown |
| 5 | Press something made of WOOD |
| 6 | Press position 7 |
| 7 | Press an ANIMAL in an ODD position (1, 3, 5, 7, 9) |
| 8 | Press the picture in the TOP RIGHT corner |
| 9 | Press something BIGGER than a person |

**Additional rules:**
* If serial number contains the letter "B", ignore above and press position 2
* If there are exactly 6 pictures, press the one in the MIDDLE of the bottom row

### Gameplay
1. Defuser describes all images: "Position 1 is a cat, position 2 is an apple, position 3 is a bus..."
2. Expert asks for serial number
3. Expert checks first number and determines rule
4. Expert tells Defuser: "Press the picture in position 3" OR "Press something you can eat"
5. If rule is descriptive, Defuser identifies which picture matches
6. Defuser presses button

### Difficulty Scaling
* **A2:** 6 images, position-based rules only (press position 3)
* **B1:** 9 images, category rules (food, animals, vehicles)
* **B2:** 9 images, complex descriptive rules (bigger than person, made of wood)

### Information Gap
✅ **Strong** - Defuser cannot know which rule applies without Expert checking serial number. Even if Defuser knows categories, they don't know which category to select.

### ESL Focus
* Descriptive language
* Category identification (food, animals, vehicles, materials)
* Position vocabulary (top, bottom, corner, middle)
* Following conditional instructions

**Vocabulary Type:** Custom (requires vocab folders with matching images; uses emoji fallback)

---

## 6. Color Switchboard Module
**Difficulty:** Intermediate (B1–B2)  
**Time Estimate:** 90–120 seconds

### Defuser View
* 3×3 grid of colored switches (9 total)
* Each switch uses one color from Standard Palette
* Each switch points in one of four directions: UP, DOWN, LEFT, RIGHT
* Indicator light above each switch: Dark (unchecked), Green (correct), Red (incorrect)

### Expert Manual
Contains a Color-Direction lookup table:

| Color | UP | DOWN | LEFT | RIGHT |
|-------|-----|------|------|-------|
| Red | RIGHT | LEFT | UP | DOWN |
| Orange | DOWN | UP | RIGHT | LEFT |
| Yellow | LEFT | RIGHT | DOWN | UP |
| Green | UP | DOWN | LEFT | RIGHT |
| Blue | DOWN | RIGHT | LEFT | UP |
| Purple | LEFT | UP | RIGHT | DOWN |
| Pink | RIGHT | DOWN | UP | LEFT |
| White | UP | LEFT | DOWN | RIGHT |
| Black | DOWN | RIGHT | UP | LEFT |
| Brown | RIGHT | UP | LEFT | DOWN |

**Rule:** Find the color row and current direction column. The intersection shows the correct new direction.

**Example:**  
Defuser: "Top left is red, pointing left."  
Expert checks table: Red + LEFT = UP  
Expert: "Switch it to UP."

### Difficulty Scaling
* **B1:** 4 switches (2×2 grid)
* **B2:** 9 switches (3×3 grid)
* **C1:** 9 switches + additional conditional rules

### ESL Focus
* Color vocabulary
* Directional language (up, down, left, right)
* Positional language (top, bottom, middle)
* Clear command structure
* Active listening

**Vocabulary Type:** Core (uses built-in color palette)

---

## 7. Gossip Module
**Difficulty:** Intermediate–Advanced (B1–B2)  
**Time Estimate:** 60–90 seconds

### Defuser View
* Smartphone screen with colored background (Red, Blue, Green, Yellow, or Purple)
* 3 text message bubbles displayed (messages visible to Defuser)
* "SEND" button next to each message
* **Defuser CAN read the messages but doesn't know the rules**

### Expert Manual
**The Texting Etiquette Guide (Serial Number Based):**

| Last Digit of Serial | Background Color Rules |
|---------------------|------------------------|
| 0, 1 | Blue = message about FOOD / Green = CORRECT grammar / Red = contains a QUESTION / Yellow = mentions a PERSON / Purple = uses past tense |
| 2, 3 | Blue = INCORRECT grammar / Green = message about WEATHER / Red = uses future tense / Yellow = contains a NUMBER / Purple = mentions a PLACE |
| 4, 5 | Blue = shortest message / Green = message about MOVEMENT / Red = contains an ADJECTIVE / Yellow = mentions an ANIMAL / Purple = longest message |
| 6, 7 | Blue = contains the word "the" / Green = message with NO pronouns / Red = mentions a TIME / Yellow = uses present tense / Purple = contains a comma |
| 8, 9 | Blue = message about FEELINGS / Green = contains a PLURAL noun / Red = has exactly TWO sentences / Yellow = mentions FAMILY / Purple = contains "and" or "but" |

**The background color determines which rule to use.**

**Additional Conditional:**
* If serial contains a vowel (A, E, I, O, U), ignore the background color and send the message with the MOST words

### Example Messages:
* Message A: "I is going to the store." (incorrect grammar, 6 words)
* Message B: "She doesn't like pizza." (food, correct grammar, 4 words)
* Message C: "We am very happy today." (feelings, incorrect grammar, 5 words)

### Gameplay
1. Defuser sees background color and reads three messages aloud
2. Expert asks for serial number
3. Expert checks last digit to determine which color-rule set to use
4. Expert checks the background color visible to Defuser
5. Expert identifies which rule applies (e.g., "Blue background = message about food")
6. Expert analyzes the three messages and determines which one matches
7. Expert tells Defuser: "Send message B"
8. Correct message defuses module; incorrect adds strike

### Difficulty Scaling
* **B1:** Simple categories (food, feelings, colors), obvious grammar errors
* **B2:** Complex grammar rules (tenses, pronouns, sentence structure), subtle content differences
* **C1:** Very subtle grammatical distinctions, compound conditionals

### Information Gap
✅ **Strong** - Defuser can read messages but doesn't know the rules. Expert must check serial number to know which rule-set applies, then check background color to know specific rule. Defuser cannot solve without Expert's rule interpretation.

### ESL Focus
* Grammar identification (subject-verb agreement, tenses, sentence structure)
* Content comprehension and categorization
* Identifying questions vs. statements
* Recognizing parts of speech (nouns, adjectives, pronouns)
* Counting words and sentences
* Real-world communication context

**Vocabulary Type:** Custom (requires vocab folders with relevant words/phrases)

---

## 8. Emoji Translator Module
**Difficulty:** Intermediate–Advanced (B1–B2)  
**Time Estimate:** 60–90 seconds

### Defuser View
* Sequence of 3 emojis displayed
* 4 buttons labeled A, B, C, D
* Each button displays a complete English sentence (visible to Defuser)
* **Defuser can read all sentences but doesn't know the matching rule**

**Example Display:**
* Emojis: 🥶 🏃 🏠
* Button A: "I like running in the summer."
* Button B: "It is cold, so run inside."
* Button C: "The house is very blue."
* Button D: "She runs to school every day."

### Expert Manual
**The Emoji Interpretation Guide (Serial Number Based):**

**Step 1: Check the FIRST emoji to determine interpretation mode**

| First Emoji Category | Mode | How to Interpret |
|---------------------|------|------------------|
| 😊 😢 😠 (Face/Emotion) | FEELING MODE | All emojis represent emotions/feelings. Find sentence about emotions. |
| 🏃 🚶 💤 (Person/Action) | ACTION MODE | All emojis represent actions. Find sentence describing actions in sequence. |
| 🥶 ☀️ 🌧️ (Weather/Nature) | CONDITION MODE | First emoji is a condition, others are responses. Find if-then sentence. |
| 🍕 🍎 🥕 (Food/Object) | OBJECT MODE | Count emojis. Find sentence mentioning that many objects. |

**Step 2: Check last digit of serial number for additional rule**

| Last Digit | Additional Rule |
|-----------|-----------------|
| 0, 1, 2 | If sentence contains a color word, skip to next option |
| 3, 4, 5 | If sentence has MORE than 8 words, it is correct |
| 6, 7, 8 | If sentence uses past tense, it is correct |
| 9 | Choose the shortest sentence |

### Gameplay
1. Defuser sees emojis and reads all four sentences aloud: "Button A says: I like running in the summer..."
2. Expert asks: "What is the first emoji?"
3. Defuser describes: "A blue face that looks cold, a person running, and a house"
4. Expert identifies first emoji category (🥶 = Weather) → CONDITION MODE
5. Expert checks serial number for additional rule
6. Expert analyzes which sentence is an if-then statement about weather
7. Expert tells Defuser: "Press button B"
8. Correct sentence defuses module; incorrect adds strike

### Difficulty Scaling
* **B1:** 2 emojis, simple sentences, obvious meaning
* **B2:** 3 emojis, mode-based interpretation, additional serial rule
* **C1:** 4 emojis, complex conditional logic, abstract meanings

### Information Gap
✅ **Strong** - Defuser can see all sentences but doesn't know the interpretation rules. Expert must identify emoji category to determine mode, then apply serial number rule. Defuser cannot determine correct answer without Expert's rule interpretation.

### ESL Focus
* Visual-to-text translation
* Sentence comprehension and analysis
* Concept synthesis and pattern matching
* Vocabulary flexibility (multiple meanings)
* Identifying sentence types (if-then, past tense, word count)
* Collaborative meaning negotiation

**Vocabulary Type:** Hybrid (core emojis + custom vocab for advanced sentences)

---

## 9. Picture Description Module
**Difficulty:** Intermediate–Advanced (B1–C1)  
**Time Estimate:** 60–90 seconds

### Defuser View
* Displays a detailed illustration or photograph
* Image contains 5–8 identifiable elements (people, objects, actions, colors)
* Four buttons labeled A, B, C, D below the image
* **Defuser CANNOT see the descriptions** - only the buttons

### Expert Manual
**Description Matching Guide:**

Contains four written descriptions of the same scene concept, with subtle differences. Only ONE matches the actual image shown to the Defuser.

**Example Descriptions in Manual:**
* **A:** "A boy in a blue shirt plays soccer in a park. A dog runs beside him. Two trees are in the background."
* **B:** "A boy in a red shirt plays soccer in a park. A cat runs beside him. Two trees are in the background."
* **C:** "A boy in a red shirt plays soccer in a park. A dog runs beside him. Two trees are in the background." ← **Correct for this image**
* **D:** "A boy in a red shirt plays basketball in a park. A dog runs beside him. Two trees are in the background."

### Gameplay
1. Defuser describes what they see: "I see a boy. He's wearing a red shirt. He's playing soccer. There's a dog running next to him. I see two trees behind them."
2. Expert listens carefully and compares to the four descriptions in the manual
3. Expert identifies which description perfectly matches what Defuser described
4. Expert tells Defuser: "Press button C"
5. Correct match defuses module; incorrect adds strike

### Difficulty Scaling
* **B1:** Simple images, obvious differences (colors, numbers of objects)
* **B2:** Complex images, subtle differences (prepositions: "next to" vs "behind")
* **C1:** Very subtle differences (articles: "a dog" vs "the dog", verb tenses, adjective order)

### Information Gap
✅ **Strong** - Defuser cannot see the descriptions, only buttons. Expert has descriptions and must carefully listen to match. Defuser cannot guess without Expert's comparison.

### ESL Focus
* Descriptive language (adjectives, colors, sizes, positions)
* Present continuous tense ("is running," "are standing")
* Prepositions of place (in, on, beside, behind, in front of, next to)
* Detail-oriented observation
* Active listening and comparison skills
* Precise communication

**Vocabulary Type:** Custom (requires vocab folders; descriptions generated from selected vocab)

---

## 10. Word Completion Module
**Difficulty:** Intermediate–Advanced (B1–C1)  
**Time Estimate:** 60–90 seconds

### Defuser View
* Displays a partially obscured word with missing letters shown as underscores
* Example: `G _ _ D   M _ R N _ N G` or `H _ P P _`
* "REVEAL LETTER" button (limited uses: 2–3 per word)
* Four colored buttons: Red, Blue, Green, Yellow
* NO text input - must identify category, not spell word

### Expert Manual
**Word Category Guide (based on serial number):**

| Last Digit of Serial | Category Rules |
|---------------------|----------------|
| 0, 1 | If word is a GREETING → Yellow / If NUMBER → Blue / If EMOTION → Red / Otherwise → Green |
| 2, 3 | If word is about FOOD → Red / If ANIMAL → Green / If PLACE → Yellow / Otherwise → Blue |
| 4, 5 | If word is an ACTION → Blue / If OBJECT → Green / If PERSON → Yellow / Otherwise → Red |
| 6, 7 | If word has MORE than 6 letters → Red / If EXACTLY 5 letters → Yellow / If LESS than 5 → Green / Otherwise → Blue |
| 8, 9 | If word starts with a VOWEL → Yellow / If ends with a VOWEL → Blue / If has 2+ vowels → Green / Otherwise → Red |

**Additional conditional rules:**
* If serial contains letter "A", all rules shift: Yellow→Blue, Blue→Green, Green→Red, Red→Yellow
* If word is revealed and has double letters (HAPPY, TREE), press Red regardless of other rules

### Gameplay
1. Defuser sees partial word and reads pattern aloud: "G underscore underscore D, space, M underscore R N underscore N G"
2. Defuser can press "REVEAL LETTER" to reveal one letter (limited uses)
3. Defuser and Expert work together to deduce word: "GOOD MORNING"
4. Expert asks for serial number
5. Expert checks last digit and determines category rule
6. Expert tells Defuser which colored button to press
7. Correct category defuses module; incorrect adds strike

### Alternative Gameplay
* Defuser tries to solve word, then Expert determines category
* Or Expert helps solve word using vocabulary knowledge, then determines category together

### Difficulty Scaling
* **B1:** 70% letters visible, simple categories (food, animal, action), 4-6 letter words
* **B2:** 50% letters visible, mixed rules (category OR letter count), 6-8 letter words
* **C1:** 40% letters visible, complex conditionals (vowel patterns, double letters), 8-10 letter words

### Information Gap
✅ **Strong** - Even if Defuser solves the word, they cannot know which category rule applies without Expert checking serial number in manual.

### ESL Focus
* Spelling and pattern recognition
* Vocabulary recall from partial information
* Letter naming and phonetic awareness
* Category classification
* Collaborative word-solving and communication
* Describing letter positions and patterns

**Vocabulary Type:** Custom (pulls words from selected vocab folders)

---

## 11. Who Lives Where? Module
**Difficulty:** Advanced (B2–C1)  
**Time Estimate:** 90–150 seconds

### Defuser View
* Image of 4-story apartment building (2×2 grid of windows)
* Each window shows a character: Chef, Doctor, Cat, Robot
* Keypad for entering 4-digit code
* Submit button

**Example Layout:**
```
[Cat]    [Robot]
[Chef]   [Doctor]
```

### Expert Manual
**Tenant Logic Puzzle:**

**Clues:**
* The Chef lives **below** the Cat
* The Robot lives **next to** the Doctor
* If the Cat is on the **top floor**, the code is **1-2-3-4**
* If the Doctor is on the **bottom floor**, the code is **5-6-7-8**
* If the Chef is in the **left column**, the code is **9-8-7-6**
* If the Robot is on the **right side**, the code is **4-5-6-7**

**Note:** Multiple conditions may be true. The Expert must verify which condition matches the actual layout.

### Gameplay
1. Defuser describes character positions using positional language
2. Expert verifies each clue against the description
3. Expert identifies which condition is satisfied
4. Expert tells Defuser the corresponding code
5. Defuser enters code and submits

### Difficulty Scaling
* **B2:** 2×2 grid, 3 clues, 1 correct answer
* **C1:** 3×2 grid (6 apartments), 5 clues, multiple conditions to verify

### ESL Focus
* Prepositions of place (above, below, next to, between)
* Spatial reasoning vocabulary (top, bottom, left, right, floor, column)
* Logical deduction
* Conditional statements
* Precise descriptive language

**Vocabulary Type:** Core (uses spatial/directional language; character names could be vocab-themed)

---

## 12. Categorical Python Module
**Difficulty:** Advanced (B2–C1)  
**Time Estimate:** 90–180 seconds

### Defuser View
* Grid (10×10) containing a green two-segment snake
* Control with arrow keys, WASD, or virtual thumbstick
* Multiple food icons appear simultaneously (4–6 icons)
* Example icons: Apple, Car, Dog, Banana, Plane, Cat, Bus, Carrot

### Expert Manual
**Serial Number Category Rules:**

| Condition | Category | Description |
|-----------|----------|-------------|
| Last digit is **EVEN** | Vegetarian | Only eat fruits and vegetables |
| Last digit is **ODD** | Pilot | Only eat things that fly |
| Serial contains a **vowel** (A,E,I,O,U) | Zookeeper | Only eat animals |
| First letter is **A-M** | Driver | Only eat vehicles |
| First number is **0-4** | Chef | Only eat food items |
| First number is **5-9** | Gardener | Only eat plants |

**Food Icon Categories:**

| Icon | Categories |
|------|------------|
| 🍎 Apple | Food, Fruit, Plant, Vegetarian |
| 🚗 Car | Vehicle, Driver |
| 🐕 Dog | Animal, Zookeeper |
| 🍌 Banana | Food, Fruit, Plant, Vegetarian, Chef |
| ✈️ Plane | Flying, Pilot, Vehicle |
| 🐱 Cat | Animal, Zookeeper |
| 🚌 Bus | Vehicle, Driver |
| 🥕 Carrot | Food, Vegetable, Plant, Vegetarian, Chef, Gardener |

### Gameplay
1. Expert determines category based on serial number
2. Defuser describes visible icons
3. Expert identifies which icons belong to the category
4. Defuser navigates snake to eat only category-matching icons in any order
5. Eating wrong icon or hitting wall = 1 strike
6. Module defused when all category items are consumed

### Difficulty Scaling
* **B2:** 4 icons spawn, 3 correct items needed, slower speed
* **C1:** 6 icons spawn, 5 correct items needed, faster speed, icons respawn

### Safe Spawn Logic
* Icons never spawn on snake's body
* Minimum 2-space distance from snake head
* Icons alternate between grid quadrants

### ESL Focus
* Semantic categories (food, animals, vehicles, plants)
* Categorical thinking
* Vocabulary under pressure
* Icon-to-word translation
* Directional commands

**Vocabulary Type:** Custom (requires categorized vocab folders with images; uses emoji fallback)

---

## 13. Monster Lab Module
**Difficulty:** Beginner (A1)  
**Time Estimate:** 30–45 seconds

### Defuser View
* Screen shows a randomly generated **Monster**
* Monster has variable features:
  * **Eyes:** 1, 2, 3, or 4 eyes
  * **Arms:** Tentacles, Robot Arms, or Hairy Arms
  * **Color:** Red, Orange, Yellow, Green, Blue, Purple, White, Black, or Brown
  * **Body Shape:** Tall, Short, Fat, Thin, or Normal
* Four buttons labeled with **Names** (ZORG, BLIP, FLOP, MEEP)
* Monster display label shows all features

### Expert Manual
**Check the LAST NUMBER in the serial number:**

| Last Digit | Use This Feature | Rules |
|------------|------------------|-------|
| 0, 1, 2 | EYES | 1→MEEP, 2→BLIP, 3→ZORG, 4→FLOP |
| 3, 4 | COLOR | Warm (Red/Orange/Yellow)→FLOP, Cool (Green/Blue/Purple)→ZORG, Neutral (White/Black/Brown)→BLIP |
| 5, 6 | ARMS | Tentacles→BLIP, Robot→MEEP, Hairy→FLOP |
| 7, 8 | BODY SHAPE | Tall→ZORG, Short→MEEP, Fat→FLOP, Thin→BLIP, Normal→use eyes |
| 9 | COMBINATIONS | See combination rules |

**Combination Rules (digit 9):**
- 3 eyes AND cool color → ZORG
- 1 eye AND robot arms → MEEP
- Red/Orange AND tentacles → BLIP
- 4 eyes AND fat → FLOP
- Otherwise: 1-2 eyes → MEEP, 3-4 eyes → ZORG

### Gameplay
1. Defuser describes the monster: "It has three eyes. It is blue. It is tall. It has tentacles."
2. Expert asks: "What is the last number in the serial?"
3. Defuser: "Seven."
4. Expert checks rules: 7 → Use BODY SHAPE. Tall → "Press ZORG!"
5. Correct name defuses module; incorrect adds strike

### Information Gap
✅ **Strong** - Defuser sees monster but not identification rules. Expert has rules but cannot see monster. Description required.

### ESL Focus
* Body parts vocabulary (eyes, arms)
* Colors (9 standard colors)
* Numbers (1-4 for eyes, 0-9 for serial)
* Body shape adjectives (tall, short, fat, thin)
* "Has/Have" structure ("It has three eyes")
* "To be" structure ("It is green", "It is tall")

**Vocabulary Type:** Core (uses built-in body parts, colors, numbers, adjectives)

---

## 14. Vending Machine Module
**Difficulty:** Beginner–Elementary (A1–A2, leveled)  
**Time Estimate:** 45–60 seconds

### Defuser View
* Picture of a vending machine with 4 random items
* Each item shows: emoji, name, and price
* Items come from categories: Fruit, Vegetable, Snack, Drink

### Item Categories

| Category | Items |
|----------|-------|
| Fruit | Apple 🍎, Orange 🍊, Banana 🍌 |
| Vegetable | Carrot 🥕, Broccoli 🥦 |
| Snack | Chocolate 🍫, Candy 🍬, Chips 🍟, Cookie 🍪 |
| Drink | Soda 🥤, Water 💧, Juice 🧃, Coffee ☕, Milk 🥛 |

### Expert Manual (Level 1 - A1)
**Category-Based Rules (check in order):**

| Condition | Action |
|-----------|--------|
| Fruit AND Vegetable present | Buy the CHEAPER one |
| Fruit but NO vegetable | If it's an APPLE → buy MOST EXPENSIVE item. Otherwise → buy the FRUIT |
| NO fruit but vegetable present | Buy the VEGETABLE |
| NO fruit AND NO vegetable | If there's CANDY → buy CHEAPEST DRINK. Otherwise → buy MOST EXPENSIVE item |

### Gameplay (Level 1)
1. Expert asks: "Is there a fruit?"
2. Defuser: "Yes, there's a banana."
3. Expert asks: "Is there a vegetable?"
4. Defuser: "No, no vegetables."
5. Expert checks rules: Fruit but no vegetable, not an apple → "Buy the banana!"
6. Correct item defuses module; incorrect adds strike

### Level Progression

**Level 1 (A1): Categories only**
- Expert asks about what items exist
- Rules based purely on presence/absence of categories
- Price comparison only for "cheaper/cheapest/most expensive"
- No actual price numbers needed

**Level 2 (A2): Categories + Prices**
- Same category questions PLUS price questions
- "Is there a fruit?" → "Yes, an apple" → "How much is the apple?" → "$1.50"
- Rules involve specific prices:
  - "If there is a fruit that costs MORE than $1.50, buy it"
  - "If the cheapest drink costs LESS than $1.00, buy the most expensive food"

**Level 3 (B1): Categories + Prices + Sales/Discounts**
- Some items have SALE stickers with discounts
- "Is there a sale?" → "Yes, the cookie is on sale" → "How much is the discount?" → "50 cents off"
- Rules involve calculating sale prices and change

### Information Gap
✅ **Strong** - Defuser sees items but not the decision rules. Expert has rules but cannot see which items are present. Must ask questions to determine correct answer.

### ESL Focus
* Food vocabulary (fruit, vegetable, snack, drink)
* Yes/no questions ("Is there...?" "Do you see...?")
* Category identification
* Comparatives (cheaper, cheapest, most expensive)
* Level 2+: Money vocabulary, numbers with decimals
* Level 3+: Discount/sale vocabulary, calculations

### Currency Configuration (Future)
Teachers can configure currency style:
- USD style: $1.50, $2.25 (with decimals)
- NTD/JPY style: $100, $45 (whole numbers)

**Vocabulary Type:** Core (uses built-in food and money vocabulary)

---

## 15. World Clock Module
**Difficulty:** Beginner (A1)  
**Time Estimate:** 60–90 seconds

### Defuser View
* A **Digital Clock** at the top showing the home city time (e.g., "Taipei 3:30 PM")
* Three **Analog Clocks** below, each labeled with a city name (e.g., London, Tokyo, New York)
* Each analog clock can be adjusted:
  * **Left-click:** Advance 15 minutes
  * **Right-click:** Go back 15 minutes
* Current time displayed below each analog clock
* **Submit button** to check answer

### Expert Manual
**GMT Time Zone Offsets:**

| City | GMT Offset |
|------|------------|
| London | 0 |
| Paris | +1 |
| Dubai | +4 |
| Taipei | +8 |
| Tokyo | +9 |
| Sydney | +11 |
| New York | -5 |
| Los Angeles | -8 |

**How to Calculate:**
1. Find the difference between two cities' offsets
2. Add hours if going to a higher offset
3. Subtract hours if going to a lower offset

**Examples:**
* Taipei (+8) to Tokyo (+9) → Add 1 hour
* Taipei (+8) to London (0) → Subtract 8 hours
* Taipei (+8) to New York (-5) → Subtract 13 hours

### Gameplay
1. Defuser: "The digital clock says Taipei, 3:30 PM. I have London, Tokyo, and New York."
2. Expert calculates each city's correct time using GMT offsets
3. Expert: "Set London to 7:30 AM. Set Tokyo to 4:30 PM. Set New York to 2:30 AM."
4. Defuser clicks each clock to adjust the time
5. Defuser clicks Submit when all clocks are set
6. All correct = success; any wrong = strike

### Configuration File
Teachers can customize cities and offsets via `timezones.txt`:

```
# WORLD CLOCK SETTINGS
# First city is the HOME CITY (shown on digital clock)
# Format: CityName +/-offset

Home City: Taipei +8

Other Cities:
London 0
Paris +1
New York -5
Tokyo +9
Sydney +11
Dubai +4
Los Angeles -8
```

### Hidden Balancing
* Total clicks needed is randomized (default: 14-16 total)
* Distributed across 3 clocks (3-8 clicks each)
* Ensures consistent puzzle timing without being obvious

### Information Gap
✅ **Strong** - Defuser sees clocks and times but doesn't have GMT offset chart. Expert has offsets but cannot see current clock positions. Must communicate city names, home time, and calculated target times.

### ESL Focus
* City names (pronunciation practice)
* Telling time (o'clock, half past, quarter past, AM/PM)
* Numbers and basic math (add/subtract hours)
* Following instructions ("Set London to...")

### Difficulty Scaling
* **Level 1 (A1):** Quarter hours only (:00, :15, :30, :45)
* **Level 2 (A2):** 5-minute increments, more cities
* **Level 3 (B1):** Any minute, crossing midnight (yesterday/tomorrow awareness)

**Vocabulary Type:** Core (uses built-in time and number vocabulary)

---

## 16. Fashion Police Module
**Difficulty:** Beginner–Elementary (A1–A2)  
**Time Estimate:** 45–60 seconds

### Defuser View
* A paper doll/mannequin wearing a random outfit
* Current outfit shows: **Hat**, **Clothes**, **Shoes** (each randomly selected)
* A **Weather Icon** in the corner (Snowing, Sunny, Raining, Windy)
* Three buttons: **Change Hat**, **Change Clothes**, **Change Shoes**

### Expert Manual
**The Dress Code (Weather-Based Rules):**

| Weather | Required Items |
|---------|---------------|
| Snowing ❄️ | Must wear: Coat, Boots, Winter Hat |
| Sunny ☀️ | Must wear: Sunglasses, T-shirt, Sandals |
| Raining 🌧️ | Must wear: Raincoat, Boots, No hat OR Umbrella |
| Windy 💨 | Must wear: Jacket, Closed shoes, No loose hat |

**Fix Priority:**
* If multiple items are wrong, fix **Clothes** first, then **Shoes**, then **Hat**

### Gameplay
1. Expert asks: "What is the weather? What is the person wearing?"
2. Defuser describes: "It is snowing. They are wearing a swimsuit, sandals, and a baseball cap."
3. Expert checks dress code: All three items wrong!
4. Expert instructs: "Change the clothes first."
5. Defuser presses button, outfit changes to something weather-appropriate
6. Repeat until outfit matches weather; wrong changes add strikes

### Information Gap
✅ **Strong** - Defuser sees outfit and weather but not dress code rules. Expert has rules but cannot see current outfit.

### ESL Focus
* Clothing vocabulary (coat, boots, hat, shirt, etc.)
* Weather vocabulary
* Describing what someone is wearing
* "Must wear" / "Should wear" structures

**Vocabulary Type:** Core (uses built-in clothing and weather vocabulary)

---

## 17. Date Night Module
**Difficulty:** Elementary (A2)  
**Time Estimate:** 45–60 seconds

### Defuser View
* A calendar page showing one month (e.g., July)
* One date is circled in Red (e.g., July 4th)
* Calendar shows day names (Monday, Tuesday, etc.)
* Keypad to enter a new date (1-31)
* Submit button

### Expert Manual
**The Scheduler (Serial Number Based):**

| Last Digit | Rule |
|-----------|------|
| 0, 1 | Press the date that is **one week later** |
| 2, 3 | Press the **Friday** of that week |
| 4, 5 | Press the **first day** of the month |
| 6, 7 | Press the **last day** of the month |
| 8, 9 | Press the date that is **3 days before** the circled date |

**Additional Conditionals:**
* If the circled date is a **Monday**, add 1 to your answer
* If the month is **December**, subtract 1 from your answer

### Gameplay
1. Expert asks: "What month is it? What date is circled? What day is that?"
2. Defuser answers: "July. The fourth is circled. It's a Monday."
3. Expert checks serial number and applies rule
4. Expert calculates and tells Defuser the answer
5. Correct date defuses module; incorrect adds strike

### Information Gap
✅ **Strong** - Defuser sees calendar but not rules. Expert has rules but cannot see calendar.

### ESL Focus
* Days of the week
* Months of the year
* Ordinal numbers (first, fourth, twenty-first)
* Prepositions of time (before, after, on)
* Date calculations

**Vocabulary Type:** Core (uses built-in calendar vocabulary)

---

## 18. Combination Lock Module
**Difficulty:** Elementary–Intermediate (A1–B1, leveled)  
**Time Estimate:** 60–90 seconds

**Special:** This module has NO STRIKES. Wrong input resets the lock. Players must solve before timer runs out.

### Defuser View
* A Masterlock-style dial with numbers around the edge (0-39)
* Large display showing current number
* **Locker Number** displayed on the lock (e.g., "A123", "B507", "C842")
* Shackle (U-shaped part) at top of lock
* Clockwise/Counter-clockwise buttons on either side of dial
* Reset button to start over

### Controls
* **Clockwise button:** Rotate dial clockwise (right)
* **Counter-clockwise button:** Rotate dial counter-clockwise (left)
* Dial moves at constant speed while held
* Numbers lock in when you **change direction**

### Expert Manual
**Calculating the Combination from Locker Number:**

The locker number (e.g., "C527") is used to calculate the combination!

**First Number - Letter Value:**
| Letter | Value |
|--------|-------|
| A | 15 |
| B | 30 |
| C | 5 |
| D | 25 |
| E | 10 |
| F | 20 |

**Second Number - Add All Digits:**
Add the three digits together.
* Example: 527 → 5 + 2 + 7 = **14**
* Maximum possible: 9 + 9 + 9 = 27

**Third Number - (Middle × 3) + Last:**
Multiply the middle digit by 3, then add the last digit.
* Example: 527 → (2 × 3) + 7 = 6 + 7 = **13**
* Maximum possible: (9 × 3) + 9 = 36

**Complete Example:** Locker **C527**
1. C → **5**
2. 5 + 2 + 7 = **14**
3. (2 × 3) + 7 = **13**
4. Combination: **5 - 14 - 13**

**Instructions to give:**
1. "Turn CLOCKWISE. Stop at 5."
2. "Turn COUNTER-CLOCKWISE. Stop at 14."
3. "Turn CLOCKWISE. Stop at 13."

The pattern is always: **CLOCKWISE → COUNTER-CLOCKWISE → CLOCKWISE**

### How It Works (Internal Logic)

**Direction change mechanic:**
* Numbers lock in when player **changes direction**, not when they stop
* Player can pause and continue in same direction without penalty
* Only the final number (third) locks in when player stops on it

**State machine:**
1. **Stage 0** - Turning clockwise toward N1
2. **Stage 1** - Changed to counter-clockwise on N1, now heading to N2
3. **Stage 2** - Changed to clockwise on N2, now heading to N3  
4. **Stage 3** - Stopped on N3 → SUCCESS

**Reset conditions (no strike, just restart):**
* Turning wrong direction at any stage
* This simulates a real combination lock - wrong input means start over

### Level Progression

**Level 1 (A1): Visual helpers + smaller numbers**
* Numbers 0-39 on dial
* Shackle provides visual feedback:
  * Stage 1 correct → shackle lifts 1/3
  * Stage 2 correct → shackle lifts 2/3
  * Stage 3 correct → shackle pops open
* Or: Three indicator dots ●○○ → ●●○ → ●●● → OPEN
* Teaches students how combination locks work

**Level 2 (A2): No visual helpers + larger numbers**
* Numbers 0-99 on dial
* No shackle movement until fully open
* Must trust Expert completely
* "Did I get the first number?" "I don't know, keep going!"

**Level 3 (B1): Realistic Masterlock rules**
* Numbers 0-99 on dial
* No visual helpers
* Must turn RIGHT past N1 once, then stop on second pass (like real Masterlocks)
* "Turn right, pass 23, keep going all the way around, then stop on 23"
* Adds vocabulary: "past", "keep going", "all the way around", "second time", "again"

### Gameplay Example
1. Defuser: "The locker number is B527."
2. Expert decodes: B=12, 5→+20=32, 27→-10=17. Combination is 12-32-17.
3. Expert: "Turn right."
4. Defuser starts turning right, calls out numbers: "10... 11... 12..."
5. Expert: "Stop!"
6. (Level 1: Shackle lifts slightly)
7. Expert: "Good. Now turn left."
8. Defuser turns left: "30... 31... 32..."
9. Expert: "Stop!"
10. (Level 1: Shackle lifts more)
11. Expert: "Turn right. Stop at 17."
12. Defuser turns right to 17, lock pops open!

### Information Gap
✅ **Strong** - Defuser sees the locker number but not the decoding rules. Expert has the rules but cannot see the locker number. Must communicate to solve.

### ESL Focus
* Left/right directions
* Numbers (0-39 or 0-99)
* Letters (A, B, C, D, E, F)
* Imperatives: "Turn", "Stop", "Keep going"
* Real-time communication: "You're at 15... 16... 17... STOP!"
* Level 3: "past", "around", "again", "second time"

### Vocabulary Progression

| Level | New Vocabulary |
|-------|---------------|
| A1 | turn, right, left, stop, numbers 0-39, letters A-F |
| A2 | + numbers 0-99, keep going, wait |
| B1 | + past, around, again, second time, first time, all the way |

**Vocabulary Type:** Core (uses built-in directional and number vocabulary)

---

## 19. Color Word Trap Module
**Difficulty:** Intermediate (B1–B2)  
**Time Estimate:** 45–60 seconds

### Defuser View
* Four words displayed on screen
* Each word is a color name BUT written in a DIFFERENT color ink
* Example: The word "RED" written in blue ink, "GREEN" written in yellow ink
* Four buttons to select which word to press

### Expert Manual
**The Stroop Rules (Serial Number Based):**

| Last Digit | Rule |
|-----------|------|
| 0, 1 | Press the word that **SAYS** "BLUE" |
| 2, 3 | Press the word that **IS COLORED** blue |
| 4, 5 | Press the word where the **text and color MATCH** |
| 6, 7 | Press the word where the **text and color are DIFFERENT** |
| 8, 9 | Press the word that **SAYS** the color of the first word's ink |

**Example:**
* RED (in blue ink), GREEN (in yellow ink), BLUE (in blue ink), YELLOW (in red ink)
* Rule "Press word COLORED blue" → Press "RED" (because it's written in blue ink)

### Gameplay
1. Expert asks: "What words do you see? What color is each word written in?"
2. Defuser describes: "RED is written in blue. GREEN is written in yellow..."
3. Expert checks serial number for rule
4. Expert applies rule and tells Defuser which word to press
5. Correct word defuses module; incorrect adds strike

### Information Gap
✅ **Strong** - Defuser sees colored words but not rules. Must carefully describe both word AND ink color.

### ESL Focus
* Color vocabulary (precise usage)
* Distinguishing "says" vs "is colored"
* The Stroop effect (cognitive challenge)
* Careful, precise description

**Vocabulary Type:** Core (uses built-in color vocabulary)

---

## 20. Emoji Sentence Builder Module
**Difficulty:** Elementary–Intermediate (A2–B1)  
**Time Estimate:** 60–90 seconds

### Defuser View
* A sequence of 3-4 emojis displayed (e.g., 👩 + 🍎 + 🏫)
* Four sentence options labeled A, B, C, D
* Each sentence attempts to describe the emoji sequence

### Expert Manual
**Emoji Grammar Guide:**

**Emoji Position Rules:**
| Position | Grammar Role |
|----------|-------------|
| First emoji | Subject (who/what) |
| Second emoji | Verb OR Object |
| Third emoji | Location OR Object |
| Fourth emoji | Time OR Additional detail |

**Sentence Structure by Serial Number:**
| First Digit | Required Structure |
|------------|-------------------|
| 0-2 | Subject + Verb + Object |
| 3-5 | Subject + Verb + Location |
| 6-9 | Subject + Verb + Object + Location |

**Example:**
* Emojis: 👩 + 🍎 + 🏫
* Structure needed: Subject + Verb + Location
* Correct: "The woman eats at school" (NOT "The woman eats an apple")

### Gameplay
1. Defuser describes emojis: "Woman, apple, school"
2. Defuser reads all four sentences aloud
3. Expert determines required structure from serial number
4. Expert identifies which sentence matches the structure
5. Correct sentence defuses module; incorrect adds strike

### Information Gap
✅ **Strong** - Defuser sees emojis and sentences but not structure rules. Expert has rules but cannot see options.

### ESL Focus
* Sentence structure (SVO, SVL)
* Emoji-to-word translation
* Grammar awareness
* Listening for sentence patterns

**Vocabulary Type:** Core + Custom (emojis can represent vocab items)

---

## 21. Word Code Translator Module
**Difficulty:** Intermediate (B1–B2)  
**Time Estimate:** 60–90 seconds

### Defuser View
* A nonsense word displayed (e.g., "BLOOP", "GRINT", "FLAM")
* Four real English words as options (e.g., CAT, DOG, BIRD, FISH)
* The nonsense word has visual clues: letter colors, underlines, or patterns

### Expert Manual
**The Decoder Ring:**

**Step 1:** Count syllables in nonsense word
| Syllables | Category |
|-----------|----------|
| 1 syllable | Animals |
| 2 syllables | Food |
| 3+ syllables | Objects |

**Step 2:** Check first letter of nonsense word
| First Letter | Rule |
|-------------|------|
| A-F | Choose the **shortest** word in the category |
| G-M | Choose the **longest** word in the category |
| N-S | Choose the word that **starts closest to A** |
| T-Z | Choose the word that **starts closest to Z** |

**Step 3:** Serial number modifier
* If serial contains the first letter of your answer, press the NEXT option instead

### Gameplay
1. Defuser reads nonsense word: "GRINT"
2. Expert determines: 1 syllable = Animal category, G = longest word
3. Expert asks: "What animal words do you see?"
4. Defuser lists: "Cat, dog, elephant, ant"
5. Expert picks longest animal: "Press elephant"
6. Correct word defuses module; incorrect adds strike

### Information Gap
✅ **Strong** - Defuser sees nonsense words and options but not decoding rules.

### ESL Focus
* Syllable counting
* Category recognition
* Alphabetical ordering
* Word length comparison

**Vocabulary Type:** Custom (requires vocab folders for word options)

---

## 22. Prefix/Suffix Circuit Module
**Difficulty:** Intermediate (B1–B2)  
**Time Estimate:** 60–90 seconds

### Defuser View
* A circuit board with word fragments in boxes
* Fragments include prefixes (UN-, RE-, PRE-), roots (HAPPY, PLAY, HEAT), and suffixes (-NESS, -FUL, -ING)
* Wires connect some fragments, showing possible combinations
* A display showing the "target meaning" (e.g., "not happy")

### Expert Manual
**The Word Formation Guide:**

**Valid Combinations:**
| Prefix | Root | Suffix | Result | Meaning |
|--------|------|--------|--------|---------|
| UN- | HAPPY | - | UNHAPPY | not happy |
| UN- | HAPPY | -NESS | UNHAPPINESS | state of not being happy |
| RE- | PLAY | - | REPLAY | play again |
| RE- | PLAY | -ING | REPLAYING | playing again |
| PRE- | HEAT | - | PREHEAT | heat before |
| - | PLAY | -FUL | PLAYFUL | full of play |

**Selection Rules (Serial Number Based):**
| Last Digit | Choose the word that... |
|-----------|------------------------|
| 0-2 | Has a **PREFIX** only |
| 3-5 | Has a **SUFFIX** only |
| 6-9 | Has **BOTH** prefix and suffix |

### Gameplay
1. Defuser reads target meaning: "The meaning is 'not happy'"
2. Defuser describes available fragments: "I see UN, RE, HAPPY, PLAY, NESS, FUL"
3. Expert identifies valid combinations that mean "not happy"
4. Expert checks serial number for prefix/suffix requirement
5. Expert tells Defuser which fragments to connect
6. Correct combination defuses module; incorrect adds strike

### Information Gap
✅ **Strong** - Defuser sees fragments and target meaning but not formation rules or serial-based requirements.

### ESL Focus
* Word formation (prefixes, suffixes)
* Morphology awareness
* Meaning construction
* Grammar patterns

**Vocabulary Type:** Core (uses built-in prefix/suffix/root combinations)

---

## 23. Skeleton Key Module
**Difficulty:** Beginner–Intermediate (A1–B1, leveled)  
**Time Estimate:** 45–75 seconds

### Defuser View
* A door with distinctive features (keyhole shape, color, symbols)
* Multiple keys displayed (3 for A1, 5 for A2/B1)
* Each key has unique features (handle shape, teeth, color)
* Click a key to try it in the door

### Door Features (to describe)
* Keyhole shape (heart, cross, circle, star, diamond)
* Door color
* Symbol on door (optional for higher levels)
* Number of locks (optional for higher levels)

### Key Features (to describe)
* Handle shape (heart, cross, circle, star, diamond)
* Number of teeth (1, 2, or 3)
* Shape inside teeth (heart, cross, circle, hollow, solid)
* Key color

### Expert Manual (Level 1 - A1)
**Key Matching Rules:**

| Door Keyhole | Correct Key Handle |
|--------------|-------------------|
| Heart ♥ | Heart handle |
| Cross ✚ | Cross handle |
| Circle ● | Circle handle |

**Color Rules:**
| Door Color | Key Color |
|------------|-----------|
| Red door | Red or Black key |
| Blue door | Blue or White key |
| Green door | Green or Black key |
| Yellow door | Yellow or White key |

*If multiple keys match, choose the one with MORE teeth.*

### Level Progression

**Level 1 (A1): 3 keys, simple matching**
* Simple colors: red, blue, green, yellow, orange, purple, brown, black, white
* Basic shapes: heart, cross, circle
* Rules: Match keyhole to handle shape, then match colors
* "The door has a heart keyhole and is red. Which key has a heart handle?"

**Level 2 (A2): 5 keys, metal colors + more features**
* Metal colors: gold, silver, bronze, copper, iron (gray)
* More shapes: add star, diamond
* Must describe teeth count and shapes inside teeth
* Rules involve multiple features

**Level 3 (B1): 5 keys, complex conditional rules**
* Same features as A2
* Rules have exceptions and conditions
* "If the door has a cross AND is gold, use the key with 2 teeth UNLESS the teeth have hearts in them"

### Color Vocabulary

| Level | Colors |
|-------|--------|
| A1 | red, blue, green, yellow, orange, purple, brown, black, white |
| A2+ | gold, silver, bronze, copper, iron/gray, rusty |

### Gameplay Example (A1)
1. Expert: "What shape is the keyhole?"
2. Defuser: "It's a heart shape."
3. Expert: "What color is the door?"
4. Defuser: "The door is blue."
5. Expert: "Describe the keys."
6. Defuser: "There's a red key with a circle handle, a blue key with a heart handle, and a black key with a heart handle."
7. Expert: "Blue door needs blue or white key. The blue key has a heart handle. Try the blue key!"
8. Defuser clicks blue key → Success!

### Information Gap
✅ **Strong** - Defuser sees door and keys but not matching rules. Expert has rules but cannot see the features. Must describe shapes, colors, and details.

### ESL Focus
* Shape vocabulary (heart, cross, circle, star, diamond)
* Color vocabulary (basic and metal colors)
* Descriptive language ("The key has...", "I see a...", "There are...")
* Counting (teeth: one, two, three)
* Comparatives for tiebreakers ("more teeth", "bigger")

### Open Design Questions
* Wrong key = strike, or "doesn't fit, try again"?
* Should keyhole always match handle, or can rules override?
* Multiple doors in higher levels?

**Vocabulary Type:** Core (uses built-in shape and color vocabulary)

---

## 24. Symbol Keypad Module
**Difficulty:** Beginner–Intermediate (A1–B1, leveled)  
**Time Estimate:** 45–75 seconds

*Inspired by the Keypad module from Keep Talking and Nobody Explodes*

### Defuser View
* Four buttons displaying symbols
* Symbols vary by level (letters/numbers, shapes, or abstract symbols)
* Buttons can be pressed in any order

### Expert Manual
**The Symbol Column Chart:**

Expert has a chart with 6 columns. Each column contains symbols in a specific order (top to bottom). The Defuser's 4 symbols will ALL appear in exactly ONE column. Press the buttons in the order they appear in that column.

**Levels 1 & 2 Chart (Letters, Numbers, Shapes):**

| Col 1 | Col 2 | Col 3 | Col 4 | Col 5 | Col 6 |
|-------|-------|-------|-------|-------|-------|
| A | 3 | ● | F | ★ | 7 |
| ■ | B | 2 | ▲ | D | ● |
| 5 | ★ | G | 1 | ■ | C |
| ▲ | D | 8 | ● | 4 | ★ |
| C | ■ | ★ | 9 | A | ▲ |
| 9 | ▲ | B | ★ | 6 | 2 |
| ● | 7 | ■ | C | ▲ | D |

**Level 3 Chart (Abstract Symbols):**
Separate chart with symbols like: Ѭ, Ϙ, ƛ, Ω, Ѧ, Ψ, Ӝ, æ, ¶, §, ©, ®, etc.

### Level Progression

**Level 1 (A1): Letters & Numbers only**
* Buttons show only: A, B, C, D, E, F, G, H, 1, 2, 3, 4, 5, 6, 7, 8, 9, 0
* "I see the letter B, the number 7, the letter D, and the number 3"
* Uses Levels 1 & 2 chart (shapes won't appear on buttons)
* Teaches alphabet and number vocabulary

**Level 2 (A2): Letters, Numbers & Shapes**
* Adds shapes: circle ●, square ■, triangle ▲, star ★, diamond ◆, heart ♥
* "I see a triangle, the letter F, a star, and the number 2"
* Uses same chart as Level 1
* Teaches shape vocabulary

**Level 3 (B1): Abstract Symbols**
* Weird/arcane symbols that must be DESCRIBED
* "It looks like a 6 with a line through it"
* "It's like a backwards E"
* "There's a circle with a dot in the middle"
* Uses separate Level 3 chart
* Forces creative descriptive language

### Gameplay Example (Level 1)
1. Defuser: "I see the letter B, the number 7, the letter G, and the number 2"
2. Expert scans columns for one containing all four: B, 7, G, 2
3. Expert finds Column 3: ●, 2, G, 8, ★, B, ■ - contains B, G, 2 but not 7... keep looking
4. Expert finds Column 2: 3, B, ★, D, ■, ▲, 7 - has B, 7 but not G, 2... keep looking
5. Expert finds the right column
6. Expert: "Press them in this order: 2, G, B, 7"
7. Defuser presses in that order → Success!

### Gameplay Example (Level 3)
1. Defuser: "The first one looks like a pitchfork. The second is like an O with a line through it. The third looks like a 3 with a tail. The fourth is like two triangles pointing at each other."
2. Expert interprets descriptions and finds them on chart
3. Expert: "Press the pitchfork first, then the two triangles, then the O with a line, then the 3 with a tail"

### Information Gap
✅ **Strong** - Defuser sees symbols but not the column chart. Expert has chart but cannot see which symbols are displayed. Must communicate to identify and order.

### ESL Focus

| Level | Vocabulary & Skills |
|-------|---------------------|
| A1 | Alphabet names (A, B, C...), number names (one, two, three...), "I see..." |
| A2 | Shape names (circle, square, triangle, star), "It's a...", "There is a..." |
| B1 | Descriptive language: "looks like", "similar to", "with a line through it", "backwards", "upside down", "pointing", "inside" |

### Why This Works
* Simple symbols (Level 1-2) build confidence with basic vocabulary
* Abstract symbols (Level 3) force creative description - real communication practice
* Order matters - Expert must clearly communicate sequence
* Chart lookup requires careful listening and cross-referencing

**Vocabulary Type:** Core (uses built-in letters, numbers, shapes, and abstract symbols)

---

## 25. Places Module
**Difficulty:** Beginner–Elementary (A1–A2)  
**Time Estimate:** 45–60 seconds

### Defuser View
* 4 place icons/images displayed (randomly selected from pool)
* Each place is clickable
* Must select all places in the correct order

### Place Pool
| Place | Description |
|-------|-------------|
| Bakery | Where bread and pastries are made |
| Bank | Where you keep your money |
| Cinema | Movie theater, where you watch films |
| Fast Food | Restaurant with quick food like burgers |
| Fire Station | Where fire trucks and firefighters are |
| Gas Station | Where you buy fuel for your car |
| Hospital | Where doctors treat sick people |
| Minimart | Small convenience store |
| Park | Green space with trees and grass |
| Parking Garage | Building where cars are parked inside |
| Parking Lot | Open area where cars are parked |
| Pharmacy | Where you buy medicine (drug store) |
| Police Station | Where police officers work |
| School | Where children learn and study |

### Expert Manual

**Step 1: Calculate the Serial Number Sum**
Add up all the numbers in the serial number (ignore letters).

Examples:
* Serial: AB2-4C1 → Numbers: 2, 4, 1 → Sum: 7 (odd)
* Serial: X1Y3-Z2W → Numbers: 1, 3, 2 → Sum: 6 (even)

**Step 2: Determine the Order**
* If the sum is **EVEN** → Select in **alphabetical** order
* If the sum is **ODD** → Select in **reverse alphabetical** order

**Step 3: Alphabetical Reference**
1. Bakery
2. Bank
3. Cinema
4. Fast Food
5. Fire Station
6. Gas Station
7. Hospital
8. Minimart
9. Park
10. Parking Garage
11. Parking Lot
12. Pharmacy
13. Police Station
14. School

### Gameplay Example
1. Expert: "What is the serial number?"
2. Defuser: "ABC-123"
3. Expert calculates: 1 + 2 + 3 = 6 (even) → alphabetical order
4. Expert: "What places do you see?"
5. Defuser: "Park, Bank, Hospital, Cinema"
6. Expert sorts alphabetically: Bank, Cinema, Hospital, Park
7. Expert: "Select Bank, then Cinema, then Hospital, then Park"
8. Defuser selects in that order → Success!

If sum was ODD:
→ "Select Park, then Hospital, then Cinema, then Bank" (reverse)

### Information Gap
✅ **Strong** - Defuser sees places but not the ordering rule. Expert has the rule but cannot see which places are displayed. Must communicate to solve.

### ESL Focus
* Place/building vocabulary
* Describing locations ("Where you buy medicine", "Where doctors work")
* Alphabetical ordering
* Serial number reading
* Math vocabulary (add, sum, odd, even)
* Sequential instructions ("First... then... then...")

### Communication Tips (for Expert Manual)
* Ask: "What is the serial number on the bomb?"
* Ask: "Can you tell me what places you see?"
* Calculate: Add up the numbers in the serial number
* Check: "Is the sum odd or even?"
* Help: "Is it where you buy food? Where doctors work?"
* Instruct: "Select them in this order: First [place], then [place]..."

**Vocabulary Type:** Core (uses built-in place vocabulary)

---

## 26. Sliders Module
**Difficulty:** Elementary (A2)  
**Time Estimate:** 45–60 seconds

### Defuser View
* 3-5 colored sliders (randomly selected colors)
* Each slider shows a number from 0 to 9
* Sliders can be adjusted up/down
* Submit button to check answer

### Slider Colors
* Red, Blue, Yellow, White, Black

### Expert Manual

**# IMPORTANT: Get the Serial Number First!**
Before solving this module, ask the Defuser: "What is the serial number on the bomb?" You need the serial number to calculate the correct slider positions!

**Step 1: Ask for Information**
* Ask: "What is the serial number?"
* Ask: "What colors are the sliders?" (from top to bottom)
* Write down the serial number to analyze it

**Step 2: Calculate Each Slider's Correct Position**

| Slider Color | Rule |
|--------------|------|
| **RED** | Set to the **FIRST DIGIT** in the serial number. If no digits, set to **0**. |
| **BLUE** | Set to the **SECOND DIGIT** in the serial number. If no second digit, set to **1**. |
| **YELLOW** | Set to the **THIRD DIGIT** in the serial number. If no third digit, set to **2**. |
| **WHITE** | Add up ALL digits in the serial number, then take only the **last digit** of the sum. |
| **BLACK** | Count how many **LETTERS** (not digits) are in the serial number. Use only last digit if 10+. |

**Step 3: Tell the Defuser**
For each slider (from top to bottom), tell them:
* "Set the red slider to 2"
* "Move the blue slider to 4"
* "The yellow slider should be at 1"
* "When they're all set, press Submit"

### Complete Example Walkthrough

**Serial Number:** XY3-8Z1  
**Defuser sees:** Red, Blue, White sliders

**Your calculations:**
* Digits in serial: 3, 8, 1
* Letters in serial: X, Y, Z = 3 letters
* **RED slider:** First digit = **3**
* **BLUE slider:** Second digit = **8**
* **WHITE slider:** Sum of digits = 3+8+1 = 12 → last digit = **2**

→ Tell them: "Red to 3, Blue to 8, White to 2, then press Submit"

### Another Example

**Serial Number:** AB2-4C1  
**Defuser sees:** Red, Blue, Yellow, White, Black sliders

**Calculations:**
* Digits: 2, 4, 1
* Letters: A, B, C = 3 letters
* **RED:** First digit = **2**
* **BLUE:** Second digit = **4**
* **YELLOW:** Third digit = **1**
* **WHITE:** Sum = 2+4+1 = 7 → **7**
* **BLACK:** Letter count = 3 → **3**

→ Tell them: "Red to 2, Blue to 4, Yellow to 1, White to 7, Black to 3"

### Information Gap
✅ **Strong** - Defuser sees slider colors but not the calculation rules. Expert has rules but cannot see the colors or adjust the sliders.

### ESL Focus
* Color vocabulary (red, blue, yellow, white, black)
* Serial number reading (letters and digits)
* Math vocabulary (first, second, third, digit, sum, count)
* Position/number vocabulary (set to, move to)
* Ordinal numbers and sequencing

### Communication Tips
* Start with: "What is the serial number?"
* Ask: "What color sliders do you see, from top to bottom?"
* Be clear: "Set the [color] slider to [number]"
* Confirm: "Can you read back the serial number?"
* Final check: "When all sliders are set, press the Submit button"

**Vocabulary Type:** Core (uses built-in color and number vocabulary)

---

## 27. Big Button Module
**Difficulty:** Beginner–Elementary (A1–A2)  
**Time Estimate:** 30–45 seconds

### Defuser View
* One large colored button
* Button has a word/label on it (ABORT, DETONATE, HOLD, PRESS)
* When held, a colored strip appears
* Timer visible on bomb

### Button Colors
* Blue, White, Red, Yellow

### Button Labels
* ABORT, DETONATE, HOLD, PRESS

### Strip Colors (when holding)
* Blue, White, Yellow, Red

### Expert Manual

**Step 1: Decide whether to PRESS or HOLD**

Ask: "What color is the button?" and "What word is on the button?"

| Condition | Action |
|-----------|--------|
| Button is **blue** AND says "ABORT" | **HOLD** the button |
| Button says "DETONATE" | **PRESS** and release immediately |
| Button is **white** | **HOLD** the button |
| Otherwise | **HOLD** the button |

**Step 2: If you need to HOLD**

When holding the button, a colored strip will appear. Ask the Defuser what color the strip is:

| Strip Color | When to Release |
|-------------|-----------------|
| **Blue** | Release when the timer shows a **4** |
| **White** | Release when the timer shows a **1** |
| **Yellow** | Release when the timer shows a **5** |
| Any other color | Release when the timer shows a **1** |

### Gameplay Example 1 (Press)
1. Expert: "What color is the button?"
2. Defuser: "It's red."
3. Expert: "What word is on the button?"
4. Defuser: "DETONATE"
5. Expert: "Press and release immediately!"
6. Defuser presses and releases → Success!

### Gameplay Example 2 (Hold)
1. Expert: "What color is the button?"
2. Defuser: "It's blue."
3. Expert: "What word is on the button?"
4. Defuser: "ABORT"
5. Expert: "Hold the button down and tell me the color of the strip."
6. Defuser: "It's yellow."
7. Expert: "Keep holding. Release when the timer shows a 5."
8. Defuser watches timer: "4... 5!" (releases)
9. Success!

### Information Gap
✅ **Strong** - Defuser sees button color/label but not the rules. Expert has rules but cannot see the button or timer. Real-time communication needed for release timing.

### ESL Focus
* Color vocabulary (blue, white, red, yellow)
* Action verbs (press, hold, release)
* Reading words (ABORT, DETONATE, HOLD, PRESS)
* Numbers (for timer)
* Conditional instructions ("If... then...")
* Time-sensitive communication

### Communication Tips
* Ask: "What color is the button?"
* Ask: "What word is written on the button?"
* If holding: "Hold the button down and tell me the color of the strip"
* Instruct: "Press and release immediately" OR "Hold until I say release"
* For timing: "Tell me when the timer shows a [number]" or "Release NOW!"

**Vocabulary Type:** Core (uses built-in color and action vocabulary)

---

## 28. Memory Module
**Difficulty:** Elementary–Intermediate (A2–B1)  
**Time Estimate:** 60–90 seconds

### Defuser View
* Display showing a number (1, 2, 3, or 4)
* 4 buttons below, each labeled 1, 2, 3, or 4 (positions shuffled each stage)
* Stage indicator (Stage 1 of 5, Stage 2 of 5, etc.)
* Buttons are in positions 1-4 from left to right

### Core Mechanic
* Complete 5 stages to disarm the module
* Each stage: display shows a number, press the correct button based on rules
* Expert must track what was pressed (position AND label) in previous stages
* Wrong press = strike + reset to Stage 1

### Expert Manual

**Important:** You must remember what was pressed each stage!
* Track the **position** (1st, 2nd, 3rd, 4th from left)
* Track the **label** (the number on the button: 1, 2, 3, or 4)

**Stage 1:**
| Display | Action |
|---------|--------|
| 1 | Press position 1 (leftmost) |
| 2 | Press position 3 |
| 3 | Press position 4 (rightmost) |
| 4 | Press position 2 |

**Stage 2:**
| Display | Action |
|---------|--------|
| 1 | Press button labeled "3" |
| 2 | Press position 1 |
| 3 | Press same position as Stage 1 |
| 4 | Press same label as Stage 1 |

**Stage 3:**
| Display | Action |
|---------|--------|
| 1 | Press same label as Stage 2 |
| 2 | Press position 2 |
| 3 | Press same position as Stage 2 |
| 4 | Press button labeled "1" |

**Stage 4:**
| Display | Action |
|---------|--------|
| 1 | Press same position as Stage 1 |
| 2 | Press same label as Stage 2 |
| 3 | Press same label as Stage 1 |
| 4 | Press position 4 |

**Stage 5:**
| Display | Action |
|---------|--------|
| 1 | Press same label as Stage 3 |
| 2 | Press same label as Stage 4 |
| 3 | Press same label as Stage 2 |
| 4 | Press same label as Stage 1 |

### Gameplay Example

**Stage 1:** Display shows "3"
- Expert: "Press position 4" (rightmost button)
- Defuser presses it. Button label was "2"
- Expert notes: Stage 1 = Position 4, Label 2

**Stage 2:** Display shows "4"  
- Expert: "Press the same label as Stage 1. What buttons do you see?"
- Defuser: "1, 4, 2, 3 from left to right"
- Expert: "Press the button labeled 2"
- Defuser presses it. It was in position 3.
- Expert notes: Stage 2 = Position 3, Label 2

**Stage 3:** Display shows "1"
- Expert: "Press the same label as Stage 2. Press the button labeled 2"
- And so on...

### Information Gap
✅ **Strong** - Defuser sees buttons but not the rules. Expert has rules but cannot see button positions. Must communicate labels AND track history together.

### ESL Focus
* Position vocabulary: first, second, third, fourth, leftmost, rightmost
* Label vs position distinction
* Ordinal numbers for stages
* Memory phrases: "What did you press?", "Which position was it?", "What was the label?"
* Past tense: "pressed", "was"

### Communication Tips
* Ask: "What number is on the display?"
* Ask: "What are the button labels from left to right?"
* Track: Write down position AND label for each stage
* Clarify: "Press POSITION 2" vs "Press the button LABELED 2"
* Confirm: "What label did you just press? What position was it in?"

**Vocabulary Type:** Core (uses numbers and position vocabulary)

---

## 29. Compass Module (CONCEPT - NOT YET DESIGNED)
**Difficulty:** Beginner–Elementary (A1–A2, leveled)  
**Time Estimate:** TBD

**Status:** Concept phase - mechanics to be determined

### Core Idea
A module focused on communicating compass headings/directions between Defuser and Expert.

### Level Progression
| Level | Directions |
|-------|------------|
| A1 | N, S, E, W (4 cardinal) |
| A2 | + NE, NW, SE, SW (8 directions) |
| B1 | + Degrees? Or combined with distance? |

### Mechanic Options to Consider

**Option A: Navigation Path**
- Defuser sees a grid with a start point and target
- Expert has rules based on serial number/indicators
- Defuser describes current position, Expert gives directions
- "Go North 2 spaces, then East 1 space"

**Option B: Heading Matcher**
- Defuser sees a compass with a needle pointing somewhere
- Expert has a table of "correct headings" based on some indicator
- Defuser must rotate to the correct heading
- "The needle is pointing Northeast. What should I set it to?"

**Option C: Waypoint Sequence**
- Defuser sees multiple direction markers/arrows
- Must activate them in correct order based on rules
- "Press North, then Southwest, then East"

**Option D: Ship/Plane Navigation**
- Defuser is "piloting" and sees current heading
- Expert has destination rules
- "What's your current heading?" → "Northwest" → "Turn to face South"

**Option E: Treasure Map**
- Defuser sees landmarks (tree, rock, house, etc.)
- Expert has instructions like "From the tree, go West"
- Combines direction vocab with landmark vocab

### Vocabulary Focus
- Cardinal: North, South, East, West
- Intercardinal: Northeast, Northwest, Southeast, Southwest
- Actions: turn, face, go, head toward, set heading to
- Position: left, right, clockwise, counter-clockwise

### Notes
- Compass directions are practical, real-world vocabulary
- Good for giving/following directions
- Could combine with other vocab themes (landmarks, distances)

---

## Thematic Mission Design

### Mission Themes
Each bomb mission focuses on a specific vocabulary theme:

* **Mission 1: The Kitchen** - Food, utensils, cooking verbs
* **Mission 2: The Airport** - Travel, transportation, directions
* **Mission 3: The School** - Education, classroom objects, subjects
* **Mission 4: The Hospital** - Body parts, health, emotions
* **Mission 5: The City** - Buildings, occupations, urban life

### Benefits
* Primes students for specific vocabulary retrieval
* Creates narrative coherence
* Allows vocabulary recycling across multiple modules
* Increases engagement through storytelling

---

## Teacher Integration Features

### Customization Options
* Set vocabulary lists per Unit
* Upload custom images for Symbol Panel
* Replace User Name list with student names
* Adjust timer length based on proficiency
* Select which modules appear on each bomb

### Classroom Implementation
* **Group Roles:** Rotate Defuser and Expert roles for balanced practice
* **Team Size:** 2–4 students per bomb (1 Defuser, 1–3 Experts)
* **Session Length:** 15–30 minutes per bomb
* **Reflection Time:** 5 minutes post-game vocabulary review

### Assessment Integration
* Track vocabulary usage frequency
* Monitor communication clarity
* Record successful vs. failed modules
* Identify problematic grammar patterns
* Generate individualized practice recommendations

---

## Platform Options

### Digital (Primary)
* **Web-based:** Browser game, no installation
* **Unity Build:** Desktop/tablet app with offline mode
* **Features:** Automatic timer, strike tracking, audio feedback, progress saving

### Classroom (Hybrid)
* **Defuser Interface:** Projected screen or shared tablet
* **Expert Manual:** Printed binder with "TOP SECRET" label
* **Props:** Safety glasses for Defuser, clipboards for Experts
* **Benefits:** Increased engagement, tactile learning, reduced screen time

### AR Extension (Future)
* Camera-based module recognition
* Physical bomb prop with digital overlay
* Mixed reality manual consultation

---

## Polish & "Game Juice"

### Strike Feedback
* **Visual (Always):** 
  - Strike 1: Module shakes, displays "ERROR: TRY AGAIN", red border flash
  - Strike 2: Screen shake intensifies, "WARNING: INCORRECT" with pulsing red background
  - Strike 3: Screen flashes red, explosion animation, "MISSION FAILED"
  - Strike Counter: Visual strike indicators (❌) appear on main bomb display
* **Audio (Optional Enhancement - Not Required):**
  - Subtle error beep, alarm, or explosion sounds
  - Can be completely muted without affecting gameplay
  - All critical information conveyed visually

### Success Feedback
* **Visual (Always):**
  - Module Clear: Green checkmark, smooth fade-out animation
  - Bomb Defused: Congratulations screen, timer stops, confetti animation
  - XP Earned: Vocabulary words "collected," level-up notification with particle effects
  - Progress Bar: Visual completion meter fills with satisfying animation
* **Audio (Optional Enhancement - Not Required):**
  - Success chime, victory fanfare, ambient music
  - Purely atmospheric - adds polish but not needed for gameplay

### Visual Design (Core Experience)
* Clean, high-contrast interface optimized for classroom viewing
* Color-blind friendly palette options
* Large, readable fonts for all text
* Animated timer with color-coded urgency (green → yellow → red)
* Pulsing/flashing effects for critical moments
* Screen shake for errors (visual emphasis)
* Smooth animations and transitions for all state changes
* **All game information is accessible visually - device audio not required**
* **Game designed for noisy classroom environments where players communicate verbally**

---

## Future Module Ideas

These are additional concepts not yet fully designed:

* **Maze Navigator:** Follow written directions to guide character through maze ("Go north 2 steps, turn east...")
* **Rhyme Matcher:** Match words that rhyme using visual word cards
* **Sentence Builder:** Arrange word cards in correct order to form grammatically correct sentences
* **Story Sequencer:** Put illustrated story panels in correct chronological order
* **Spot the Difference:** Defuser describes two similar images; Expert identifies the differences
* **Map Navigator:** Follow preposition-based directions on a simple map ("The treasure is between the tree and the rock")
* **Pattern Predictor:** Complete visual/number/word sequences (what comes next?)
* **Memory Match:** Defuser briefly sees grid of images, then must describe from memory what was where
* **Opposite Day:** Defuser sees instructions but must do the opposite; Expert has the "translation" rules
* **Spelling Bee:** Defuser hears a word (text-to-speech), must spell it using letter buttons; Expert has hints
* **Chinese Calendar:** Uses the 12 Chinese Zodiac animals (Rat, Ox, Tiger, Rabbit, Dragon, Snake, Horse, Goat, Monkey, Rooster, Dog, Pig). Could involve matching animals to years, cycle calculations, or animal-based logic puzzles. Good for cultural relevance in Taiwan/Asia.

---

## Implementation Details & Design Patterns

This section documents patterns and conventions established during development.

### Serial Number System

The serial number is a key game element that creates the information gap between Defuser and Expert.

**Format:** `XXNNN-XNXNN` (e.g., `YI520-Q2N37`)
- X = Letter (A-Z)
- N = Number (0-9)
- Hyphen at position 6

**Visual Display:**
- Font: Fira Code (monospace with clear I/1 and O/0 distinction)
- Color coding: Letters = purple (#bb86fc), Numbers = orange (#ff9800), Hyphen = gray (#666)
- Manual legend: "ABC = Letters (purple) | 123 = Numbers (orange)"

**Usage in Modules:**
- Number Keypad: Uses letter-to-number cipher based on serial letters
- Color Wires: References serial for cutting rules
- User Name: References last letter/digit for name selection
- NOT all modules should use serial number - variety is important

### Module Level System

Modules can have multiple difficulty levels, allowing the same module type to scale from A1 to B1.

**Folder Structure:**
```
/modules
  /colorWires
    colorWires.jsx        (no levels - simple on/off)
  /wordButtons
    wordButtons_01.jsx    (Level 1 - A1)
    wordButtons_02.jsx    (Level 2 - A2)
    wordButtons_03.jsx    (Level 3 - B1)
  /symbolPanel
    symbolPanel_01.jsx    (Level 1)
    symbolPanel_03.jsx    (Level 3 - skips level 2)
```

**Selection Behavior:**
- Click cycles through available levels, then off
- If module has levels [1, 2, 3]: Click 1 = Level 1, Click 2 = Level 2, Click 3 = Level 3, Click 4 = Off
- If module has levels [1, 3] only: Click 1 = Level 1, Click 2 = Level 3, Click 3 = Off
- If module has no levels: Click 1 = On, Click 2 = Off

**Visual Indicator:**
- Three dots below module name: ●○○ (Level 1), ●●○ (Level 2), ●●● (Level 3)
- Unavailable levels show as dark/invisible dots
- Difficulty tag updates based on selected level

### Manual Design Pattern: "Same as Level X"

For multi-level modules, avoid repeating identical rules. Instead:

```
Level 1: [Full rules]

Level 2: 
- FIRST: Same as Level 1
- NEW STEP: [new rules here]

Level 3:
- FIRST & SECOND: Same as Level 2  
- NEW STEP: [new rules here]
```

**Benefits:**
- Reduces manual length
- Teaches building-block thinking
- Easier navigation for Experts
- Single source of truth (fewer update errors)
- Teaches skim-reading skills

### Module Reset Behavior

When a module receives a strike, different reset behaviors create variety:

**Full Reset:** Module regenerates completely (new random state)
- Example: Color Wires regenerates with new wire colors

**Partial Reset:** Some elements change, others persist
- Example: Color Switchboard keeps switch positions but randomizes colors
- Creates "new puzzle" signal while maintaining continuity

**Sequence Reset:** Progress resets but puzzle stays same
- Example: Word Buttons resets pressed sequence but same words/rules apply

### Word Buttons Module (Detailed Design)

**Core Mechanic:** Press words in sequence based on word properties and lookup charts.

**Level 1 (A1) - Tie-Breaker Rules + Chart:**

First, check tie conditions:
| Condition | Action |
|-----------|--------|
| All 4 words same length | → Press BOTTOM RIGHT |
| 2 words are shortest | → Press TOP RIGHT |
| 2 words are longest | → Press BOTTOM LEFT |
| 3 words same length | → Press word closest to A |

If no ties, use first letter of shortest word:
| Letter | Action |
|--------|--------|
| A-E | → Press LONGEST word |
| F-J | → Press TOP LEFT word |
| K-O | → Press BOTTOM RIGHT word |
| P-T | → Press SHORTEST word |
| U-Z | → Press TOP RIGHT word |

**Level 2 (A2) - IS/IS NOT Decision Trees:**

Two presses required.

FIRST press:
- All same length → TOP LEFT
- TOP LEFT IS shortest → LONGEST
- TOP LEFT IS NOT shortest → BOTTOM RIGHT

SECOND press:
- All same length → BOTTOM RIGHT
- BOTTOM RIGHT IS longest → SHORTEST
- BOTTOM RIGHT IS NOT longest → TOP LEFT

**Level 3 (B1) - Adds Alphabetical Logic:**

Three presses required.
- FIRST: Same as Level 2
- SECOND: Same as Level 2
- THIRD: Find word closest to A. If in TOP ROW → press word closest to Z. If in BOTTOM ROW → press TOP RIGHT.

**Word Set Flexibility:**
- Works with ANY word lengths (no curation required)
- All same length: ✓
- Mixed lengths: ✓
- Ties: ✓ (handled by tie-breaker rules)

### Language Simplification Guidelines

Target vocabulary for different CEFR levels:

**A1 Words (use freely):**
- Articles: the, a, an
- Pronouns: I, you, it, this, that
- Prepositions: in, on, at, to, of
- Conjunctions: and, but, or, if, then
- Adjectives: big, small, long, short, first, last, same
- Positions: top, bottom, left, right
- Numbers: one, two, three, four
- Comparatives: shortest, longest

**A2 Words (use with context):**
- is, is not, are, are not
- closest, nearest, farthest
- before, after, between

**B1 Words (define or provide context):**
- alphabetically, sequence, chart
- condition, rule, pattern

**Avoid at A1-A2:**
- "digit" → use "number"
- "sum" → use "add" or "plus"
- "adjacent" → use "next to"
- "consecutive" → use "in a row"

### Settings Panel Features

**Module Count Slider:**
- Range: 1-6 modules
- Auto-syncs with module selection (until manually moved)
- Can exceed selected modules (causes repeats)

**Module Repetition Logic:**
| Selected | On Bomb | Result |
|----------|---------|--------|
| 3 | 3 | All 3 modules |
| 4 | 3 | Random 3 from 4 |
| 3 | 6 | Each module 1-2 times |

**Timer Presets:** 3:00, 4:00, 5:00, 6:00, 7:00

---

## Summary

ESL Bomb Squad transforms high-stakes communication into authentic language practice. By creating an information gap between Defuser and Expert roles, it forces students to negotiate meaning, practice active listening, and communicate clearly under time pressure. The modular design allows teachers to scale difficulty and customize vocabulary while maintaining the core game loop that makes cooperative communication both challenging and rewarding.

**Core Strength:** It's not a test disguised as a game—it's a game that happens to teach language.

---

## Design Decisions

### Bilingual How to Play Screen

The game includes a "How to Play" screen with instructions in both **Chinese (Traditional)** and **English**. 

**Rationale:**
- The Expert Manual stays **English-only** because the goal is to practice English communication
- But the **game setup instructions** should be in students' native language so they understand:
  - The two roles (Defuser vs Expert)
  - The core rules (no screen peeking, communicate in English)
  - The win/lose conditions (timer, strikes)
- This reduces confusion during setup and lets students focus on English during actual gameplay

**Content includes:**
- 目標 / Goal - explaining the cooperative objective
- 角色 / Roles - Defuser (拆彈員) and Expert (專家) responsibilities  
- 規則 / Rules - key rules with emoji icons for visual clarity

### Monster Lab Art System (Planned)

The Monster Lab module will use a layered "paper doll" system for monster generation:

**Layer Structure:**
```
        [HEAD ZONE]
           - Head shape (furry, smooth, eye stalks, etc.)
           - Eyes (layered on top, 1-4 eyes)
           - Mouth (layered on top)
           - Optional: nose, horns, antennae
           
[ARM ZONE] [TORSO ZONE] [ARM ZONE]
           - Body color
           - Arm type (tentacles, robot, hairy)
           
        [LEGS ZONE]
           - Leg type (two legs, tentacle base, etc.)
```

**Current Puzzle Variables:**

| Variable | Options | Count |
|----------|---------|-------|
| Eye Count | 1, 2, 3, 4 | 4 |
| Body Color | Red, Orange, Yellow, Green, Blue, Purple, White, Black, Brown | 9 |
| Arm Type | Tentacles, Robot, Hairy | 3 |
| Body Shape | Tall, Short, Fat, Thin, Normal | 5 |

**Total combinations:** 4 × 9 × 3 × 5 = **540 unique monsters**

**Body Shape CSS Transforms:**
- Tall: `scaleY(1.25)`
- Short: `scaleY(0.75)`
- Fat: `scaleX(1.3)`
- Thin: `scaleX(0.7)`
- Normal: `scale(1)`

**Color Groups (for puzzle rules):**
- Warm colors: Red, Orange, Yellow → FLOP
- Cool colors: Green, Blue, Purple → ZORG
- Neutral colors: White, Black, Brown → BLIP

**Future Expansion Variables:**
- Head Shape (furry, smooth, pointy, stalks, etc.)
- Leg Type (two legs, tentacle base, wheels, ghost tail, etc.)
- Eye Color
- Mouth Type (smile, fangs, beak)
- Accessories (horns, antennae, ears)

**Benefits:**
- Generates many unique monsters from few art assets
- Clear visual distinction for each trait (no emoji confusion)
- Expandable vocabulary over time
- Art assets can be AI-generated or hand-drawn
- CSS transforms add variety without extra art

**Art Asset Requirements (when ready):**

| Part | Variants Needed | Notes |
|------|-----------------|-------|
| Head shapes | 3-5 | Blank faced, eyes/mouth layered on top |
| Eye sets | 4 | 1, 2, 3, 4 eyes - positioned on head |
| Mouths | 3-5 | Smile, fangs, etc. |
| Torsos | 1 | CSS tint for colors, transform for shape |
| Arms | 3 | Tentacles, Robot, Hairy - wide image behind torso |
| Legs | 3-5 | Standing, tentacle base, etc. |

**Total: ~15-20 images** for 500+ unique monsters