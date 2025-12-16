const fs = require('fs');
const path = require('path');
const { processAllCrates } = require('../lib/seratoReader');

const OUTPUT_FILE = path.join(__dirname, '..', '..', 'library_snapshot.json');

/**
 * Main function to run the script.
 */
async function main() {
    console.log('Starting DJ World library processing...');

    try {
        const libraryData = await processAllCrates();

        console.log(`\nSaving library snapshot to: ${OUTPUT_FILE}`);
        fs.writeFileSync(OUTPUT_FILE, JSON.stringify(libraryData, null, 2));

        console.log('\n✅ Success! AI context has been updated with your Serato library snapshot.');

    } catch (error) {
        console.error('\n❌ An unexpected error occurred:');
        console.error(error);
        process.exit(1); // Exit with an error code
    }
}

// Execute the main function
main();
