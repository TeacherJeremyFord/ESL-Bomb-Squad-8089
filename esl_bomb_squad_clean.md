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

## Vocabulary Philosophy: The 260-Word Standard

### The Official Word List

All game text — module instructions, manual entries, button labels, feedback messages, and UI copy — must be written using the **Touhu Elementary School 260-Word List** wherever possible. This list represents the vocabulary that 6th-grade students are officially expected to know. Students likely know more words than this in practice (basic connective words like *a*, *the*, *and*, *but*, *is*, *are* are not on the list but can be freely used), but the 260-word list is the boundary of what can be *relied upon*.

The full word list is maintained in `TargetVocab.md`.

### Synonym Rule

If a word you want to use has a synonym on the 260-word list, **use the 260-word version instead**, even if it sounds less natural to a fluent English speaker.

> ❌ "Press the button adjacent to the red wire."
> ✅ "Press the button next to the red wire."

> ❌ "Select the correct answer."
> ✅ "Press the good answer." *(or restructure the sentence to avoid "correct" entirely)*

### The Efficiency Trade-Off

Native English speakers — and most speakers in any language — naturally compress their sentences. We drop words, use shorthand, and prefer the shortest phrase that gets the point across. This is the opposite of what ESL learners with a limited vocabulary need.

**When vocabulary is limited, sentences get longer — not shorter.** That is normal and correct. A student who doesn't know the word "refrigerator" has to say "the big cold box in the kitchen where you keep food." That sentence is longer and less efficient than one word, but it communicates clearly using known words. This game should embrace that pattern.

Do not trim sentences to sound more natural to a fluent speaker if trimming requires using a word outside the 260-word list.

> ❌ "Locate the symbol on panel three."
> ✅ "Find the picture on the third part of the bomb."

> ❌ "Disarm the module if the sequence is invalid."
> ✅ "If the order is wrong, make the bomb part go away." *(or find a module-specific phrasing that stays in-list)*

### What This Means for Module Design

- **Instructions must be writable in 260-word vocabulary.** If a module concept cannot be clearly explained without going outside the list, the module design should be revisited — not the vocabulary rule.
- **Manual entries (what the Expert reads aloud) are the highest priority.** These are the sentences students speak out loud. They must be natural-feeling *within* the vocabulary constraints.
- **Error messages and UI labels** should follow the same rule, but minor exceptions are acceptable where no reasonable substitute exists.
- **When in doubt, write longer.** A longer sentence that a student can read and understand is always better than a shorter sentence with an unknown word.

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

**Modules using ONLY core vocab:** Color Wires, User Name, Number Keypad, Color Switchboard

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

**A1-A2 (Beginner):**
- Color Wires (A1)
- User Name (A1)
- Number Keypad (A2)

**B1 (Intermediate):**
- Word Buttons (B1)
- Symbol Panel (B1)
- Color Switchboard (B1)
- Picture Description (B1)

**B2 (Upper Intermediate):**
- Gossip Module (B2)
- Emoji Translator (B2)
- Word Completion (B2)
- Categorical Python (B2)

**C1 (Advanced):**
- Who Lives Where (C1)

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

* **Maze Navigator:** Follow written directions to guide character through maze ("Go north 2 steps, turn east...")
* **Rhyme Matcher:** Match words that rhyme using visual word cards
* **Sentence Builder:** Arrange word cards in correct order to form grammatically correct sentences
* **Story Sequencer:** Put illustrated story panels in correct chronological order
* **Spot the Difference:** Defuser describes two similar images; Expert identifies the differences
* **Clock Reader:** Set analog clock to match written time descriptions
* **Map Navigator:** Follow preposition-based directions on a simple map ("The treasure is between the tree and the rock")
* **Pattern Predictor:** Complete visual/number/word sequences (what comes next?)
* **Memory Match:** Defuser briefly sees grid of images, then must describe from memory what was where

---

## Summary

ESL Bomb Squad transforms high-stakes communication into authentic language practice. By creating an information gap between Defuser and Expert roles, it forces students to negotiate meaning, practice active listening, and communicate clearly under time pressure. The modular design allows teachers to scale difficulty and customize vocabulary while maintaining the core game loop that makes cooperative communication both challenging and rewarding.

**Core Strength:** It's not a test disguised as a game—it's a game that happens to teach language.