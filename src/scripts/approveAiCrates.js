const fs = require('fs');
const path = require('path');
const seratojs = require('seratojs');

const PROPOSAL_FILE = path.join(__dirname, '..', '..', 'ai_crate_proposal.json');

/**
 * Main script function.
 */
async function main() {
    // Get crate IDs to approve from command line arguments
    const approvedIds = process.argv.slice(2);

    if (approvedIds.length === 0) {
        console.error('Error: Please provide at least one crate ID to approve.');
        console.log('Example: node src/scripts/approveAiCrates.js closing_time_mix open_format_warmup');
        return;
    }

    if (!fs.existsSync(PROPOSAL_FILE)) {
        console.error(`Error: Proposal file not found at ${PROPOSAL_FILE}`);
        console.log('Please run the "proposeAiCrates.js" script first.');
        return;
    }

    console.log('Starting AI Crate approval process...');
    
    const proposal = JSON.parse(fs.readFileSync(PROPOSAL_FILE, 'utf-8'));
    const approvedCrates = new Set(approvedIds);

    for (const crateData of proposal.proposed_crates) {
        if (approvedCrates.has(crateData.id)) {
            console.log(`\nApproving and creating crate: "${crateData.name}"`);

            if (!crateData.tracks || crateData.tracks.length === 0) {
                console.log('  - Warning: This crate has no tracks in the proposal. Skipping.');
                continue;
            }

            try {
                const newCrate = new seratojs.Crate(crateData.name);
                crateData.tracks.forEach(track => {
                    if (track.filePath) {
                        newCrate.addSong(track.filePath);
                    }
                });
                await newCrate.save();
                console.log(`  ✅ Successfully created crate "${crateData.name}" in your Serato library.`);
            } catch (error) {
                console.error(`  ❌ Failed to create or save crate "${crateData.name}".`, error);
            }
        }
    }

    console.log('\nCrate approval process complete.');
}

main().catch(error => {
    console.error('\nAn unexpected error occurred during the approval process:');
    console.error(error);
    process.exit(1);
});
