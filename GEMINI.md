# GEMINI.md

This file provides context for the Gemini AI assistant to understand this project.

## Project Overview

This project, "DJ World," is a DJ "Life Assistant" built with Node.js. Its core purpose is to help DJs manage their music, analyze historical Serato sets, and build setlists for upcoming events. It aims to link to DJ Downloads, integrate with Serato data using `seratojs`, and eventually connect to Apple Music and DJ pools for music discovery.

## Key Files

*   `src/index.js`: The main entry point of the application, controlling the execution of different functionalities (historical data parsing or SeratoJS experiments) based on command-line arguments.
*   `package.json`: Defines project metadata, dependencies (`csv-parse`, `seratojs`), and scripts.
*   `README.md`: Provides a high-level overview and description of the project's goals.

## Building and Running

This project is a Node.js application.

*   **Dependencies:**
    *   `csv-parse`: Used for parsing CSV files, specifically Serato's exported history.
    *   `seratojs`: Used for interacting with Serato library data (crates, sessions).

*   **Install Dependencies:**
    `npm install`

*   **Run Modes:** The `src/index.js` script supports different operational modes:
    *   **Historical Data Parsing:** To process an exported Serato history CSV file (e.g., `history.csv` in the project root):
        `node src/index.js --mode=history`
    *   **SeratoJS Experiments:** To run experiments or functionalities related to SeratoJS library interaction (this is the default mode if no `--mode` argument is provided):
        `node src/index.js --mode=seratojs`
        or simply:
        `node src/index.js`

*   **Test:**
    `npm test` (Currently a placeholder)

## Development Conventions

*   **Language:** JavaScript (Node.js).
*   **Dependency Management:** `npm`.
*   **Code Structure:** Main application logic resides in `src/index.js`, with clear function separation for different features.
*   **Command-line Interface:** Utilizes `process.argv` for basic mode selection.
