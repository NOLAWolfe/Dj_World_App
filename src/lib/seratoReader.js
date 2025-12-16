const fs = require('fs');
const path = require('path');
const os = require('os');
const seratojs = require('seratojs');
const mm = require('music-metadata');

/**
 * The main folder for Serato data on this computer.
 */
const SERATO_ROOT_DIR = path.join(os.homedir(), 'Music', '_Serato_');

/**
 * Reads metadata from a single audio file.
 * @param {string} filePath - The absolute path to the audio file.
 * @returns {Promise<object|null>} A promise that resolves to an object with track metadata, or null if reading fails.
 */
async function getTrackMetadata(filePath) {
    try {
        const metadata = await mm.parseFile(filePath);
        const { common } = metadata;
        return {
            title: common.title || path.basename(filePath),
            artist: common.artist || 'Unknown Artist',
            bpm: common.bpm || null,
            key: common.key || null,
            comment: common.comment ? common.comment.join(' ') : null, // Include the comment/energy
            filePath: filePath, // Include the file path in the output
        };
    } catch (error) {
        console.error(`Could not read metadata for: ${filePath}`, error.message);
        return null; // Return null for files that can't be parsed
    }
}

/**
 * Parses a single .crate file to extract all track metadata.
 * @param {string} crateName - The name of the crate (without .crate extension).
 * @returns {Promise<object|null>} A promise that resolves to a crate object with its tracks, or null on failure.
 */
async function parseCrate(crateName) {
    console.log(`- Parsing crate: ${crateName}`);
    try {
        // seratojs reads crates relative to the SERATO_ROOT_DIR
        const crate = new seratojs.Crate(crateName);

        // MONKEY-PATCH: The Crate constructor incorrectly sanitizes filenames for nested crates.
        // We will manually overwrite the filename with the correct one before reading.
        crate.filename = crateName + '.crate';

        const songPaths = await crate.getSongPaths();

        const trackPromises = songPaths.map(getTrackMetadata);
        const tracks = (await Promise.all(trackPromises)).filter(t => t !== null); // Filter out failed reads

        return {
            name: crateName,
            tracks: tracks,
        };
    } catch (error) {
        console.error(`Could not parse crate "${crateName}". Is it in the default Serato folder?`, error.message);
        return null;
    }
}

/**
 * Scans the Serato 'Subcrates' directory and processes all .crate files found.
 * @returns {Promise<Array<object>>} A promise that resolves to an array of all parsed crate objects.
 */
async function processAllCrates() {
    const subcratesDir = path.join(SERATO_ROOT_DIR, 'Subcrates');

    if (!fs.existsSync(subcratesDir)) {
        console.error(`Serato Subcrates folder not found at: ${subcratesDir}`);
        return [];
    }

    console.log('Scanning for crates...');
    const crateFiles = fs.readdirSync(subcratesDir).filter(f => f.endsWith('.crate'));

    const cratePromises = crateFiles.map(file => {
        const crateName = path.basename(file, '.crate');
        return parseCrate(crateName);
    });

    const allCrates = (await Promise.all(cratePromises)).filter(c => c !== null); // Filter out failed crates
    console.log(`\nFinished processing ${allCrates.length} crates.`);
    return allCrates;
}

module.exports = { processAllCrates };
