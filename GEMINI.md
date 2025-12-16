# GEMINI.md

This file provides context for the Gemini AI assistant to understand this project.

## Project Overview

This project, "DJ World," is a DJ "Life Assistant" built with Node.js. Its core purpose is to help DJs manage their music by analyzing historical Serato sets to automatically propose and create new "AI Crates" based on predefined rules (e.g., genre, energy, time played).

## Core Workflow: AI Crate Generation

The main workflow involves three steps:

1.  **Generate Library Snapshot:** First, scan your entire Serato library to create a local data file. This gives the AI context of your music.
    `node src/scripts/generateLibrarySnapshot.js`

2.  **Propose AI Crates:** Next, analyze a Serato history file against your library snapshot. This generates a proposal of new crates based on the rules engine.
    `node src/scripts/proposeAiCrates.js`

3.  **Approve and Create Crates:** Finally, review the `ai_crate_proposal.json` file and then approve the crates you want, which creates them in your Serato library.
    `node src/scripts/approveAiCrates.js <id_of_crate_to_approve>`
    *(Example: `node src/scripts/approveAiCrates.js high_energy_mix`)*

## Key Files

*   `package.json`: Defines project metadata, dependencies, and scripts.
*   `README.md`: Provides a high-level overview of the project's goals.

### Logic Libraries (`src/lib`)

*   `src/lib/seratoReader.js`: Core logic for reading Serato `.crate` files and parsing track metadata from audio files.
*   `src/lib/historyReader.js`: Utility for parsing Serato's exported CSV history files.

### Executable Scripts (`src/scripts`)

*   `src/scripts/generateLibrarySnapshot.js`: The script for **Step 1**. Creates `library_snapshot.json`.
*   `src/scripts/proposeAiCrates.js`: The script for **Step 2**. Reads the library and a history file, and creates `ai_crate_proposal.json`.
*   `src/scripts/approveAiCrates.js`: The script for **Step 3**. Takes a crate ID from the proposal and creates a real `.crate` file in Serato.

### Data Files

*   `library_snapshot.json`: (Generated) A snapshot of your Serato library's crates and tracks.
*   `ai_crate_proposal.json`: (Generated) A list of proposed crates and tracks based on analysis.
*   `history-*.csv`: (User-provided) An exported Serato history file used as input for analysis.

## Dependencies

*   `seratojs`: For interacting with Serato library data (crates, sessions).
*   `csv-parse`: For parsing exported Serato history CSV files.
*   `music-metadata`: For reading detailed metadata (BPM, Key, etc.) from audio files.