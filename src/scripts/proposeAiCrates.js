const fs = require('fs');
const path = require('path');
const { parseHistoryCsv } = require('../lib/historyReader');

const HISTORY_FILE = path.join(__dirname, '..', '..', 'history-10-25-25.csv');
const LIBRARY_SNAPSHOT_FILE = path.join(__dirname, '..', '..', 'library_snapshot.json');
const PROPOSAL_OUTPUT_FILE = path.join(__dirname, '..', '..', 'ai_crate_proposal.json');

/**
 * Creates a lookup map from the library snapshot.
 * @returns {Map<string, Array<object>>}
 */
function createLibraryLookup() {
    const library = JSON.parse(fs.readFileSync(LIBRARY_SNAPSHOT_FILE, 'utf-8'));
    const lookup = new Map();
    for (const crate of library) {
        for (const track of crate.tracks) {
            if (track.title) {
                const key = track.title.toLowerCase().trim();
                if (!lookup.has(key)) {
                    lookup.set(key, []);
                }
                lookup.get(key).push(track);
            }
        }
    }
    console.log(`Created a library lookup map with ${lookup.size} unique track titles.`);
    return lookup;
}

/**
 * Finds the best match for a history track from potential library tracks.
 * @param {object} historyTrack
 * @param {Array<object>} potentialMatches
 * @returns {object|null}
 */
function findBestMatch(historyTrack, potentialMatches) {
    if (potentialMatches.length === 1) return potentialMatches[0];
    let bestMatch = null;
    let smallestBpmDiff = Infinity;
    const sameGenreMatches = potentialMatches.filter(libTrack => libTrack.genre === historyTrack.genre);
    const matchesToSearch = sameGenreMatches.length > 0 ? sameGenreMatches : potentialMatches;
    const historyBpm = parseFloat(historyTrack.bpm);
    if (isNaN(historyBpm)) return matchesToSearch[0] || null;
    for (const libTrack of matchesToSearch) {
        if (libTrack.bpm) {
            const diff = Math.abs(historyBpm - libTrack.bpm);
            if (diff < smallestBpmDiff) {
                smallestBpmDiff = diff;
                bestMatch = libTrack;
            }
        }
    }
    return bestMatch || matchesToSearch[0] || null;
}

// --- Crate Definitions ---
const crateDefinitions = [
    {
        id: 'high_energy_mix',
        name: 'AI - High Energy Mix',
        filter: ({ library }) => {
            const energy = library.comment ? parseInt(library.comment, 10) : 0;
            return genre.includes('House') && energy >= 6;
        },
    },
    {
        id: 'midnight_house_mix',
        name: 'AI - Midnight House Mix',
        filter: ({ library, history }) => {
            const energy = library.comment ? parseInt(library.comment, 10) : 0;
            const startTime = new Date(history['start time']);
            const midnight = new Date('2025-10-25T23:00:00'); // 11:00 PM
            const closing = new Date('2025-10-26T01:30:00');  // 1:30 AM (next day)
            const isTimeMatch = startTime >= midnight && startTime <= closing;
            return library.genre === 'House' && (energy >= 5 && energy <= 7) && isTimeMatch;
        },
    },
    {
        id: 'hip_hop_and_rb',
        name: 'AI - Hip-Hop & R&B',
        filter: ({ library }) => genre.includes('Hip Hop') || genre.includes('R&B'),
    },
    {
        id: 'closing_time_mix',
        name: 'AI - Closing Time Mix',
        filter: ({ library }) => {
            const genre = library.genre || '';
            return !genre.includes('House') && library.bpm >= 120;
        },
    },
     {
        id: 'open_format_warmup',
        name: 'AI - Open Format Warmup',
        filter: ({ library }) => {
            const energy = library.comment ? parseInt(library.comment, 10) : 0;
            const bpm = library.bpm ? parseInt(library.bpm, 10) : 0;
            return energy < 7 && energy > 0 && bpm > 65 && bpm < 120;
        },
    },
];

/**
 * Main script function.
 */
async function main() {
    console.log('Starting AI Crate proposal generation...');

    const libraryLookup = createLibraryLookup();
    const historyTracks = await parseHistoryCsv(HISTORY_FILE);
    
    const proposal = {
        proposal_id: `prop_${Date.now()}`,
        proposed_crates: [],
    };

    for (const definition of crateDefinitions) {
        console.log(`\nProcessing rule for: "${definition.name}"`);
        const tracksForCrate = new Map();

        for (const historyTrack of historyTracks) {
            const key = historyTrack.name.toLowerCase().trim();
            const potentialMatches = libraryLookup.get(key);

            if (potentialMatches) {
                const bestMatch = findBestMatch(historyTrack, potentialMatches);
                if (bestMatch && definition.filter({ library: bestMatch, history: historyTrack })) {
                    if (!tracksForCrate.has(bestMatch.filePath)) {
                         tracksForCrate.set(bestMatch.filePath, {
                            artist: bestMatch.artist,
                            title: bestMatch.title,
                            genre: bestMatch.genre,
                            bpm: bestMatch.bpm,
                            filePath: bestMatch.filePath,
                        });
                    }
                }
            }
        }
        
        const tracks = Array.from(tracksForCrate.values());

        if (tracks.length > 0) {
            proposal.proposed_crates.push({
                id: definition.id,
                name: definition.name,
                track_count: tracks.length,
                tracks: tracks,
            });
            console.log(`  ✅ Added proposal for crate "${definition.name}" with ${tracks.length} tracks.`);
        } else {
            console.log(`  - No tracks from the history matched the rules for this crate.`);
        }
    }

    fs.writeFileSync(PROPOSAL_OUTPUT_FILE, JSON.stringify(proposal, null, 2));
    console.log(`\nProposal generation complete. Review the 'ai_crate_proposal.json' file.`);
}

main().catch(error => {
    console.error('\nAn unexpected error occurred during the process:', error);
    process.exit(1);
});