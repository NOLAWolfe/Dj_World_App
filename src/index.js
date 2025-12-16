const fs = require('fs');
const path = require('path');
const { parse } = require('csv-parse');
const os = require('os');
const seratojs = require('seratojs');

const homeDir = os.homedir();
const seratoDir = path.join(homeDir, 'Music', '_Serato_');
const subcratesDir = path.join(seratoDir, 'Subcrates');

// Function to parse historical CSV data
async function parseHistoricalData() {
  const csvFilePath = path.resolve(__dirname, '../history.csv');
  const headers = ['Name', 'Artist', 'Start Time', 'End Time', 'Playtime', 'Deck', 'Notes'];

  try {
    const fileContent = fs.readFileSync(csvFilePath, { encoding: 'utf-8' });

    parse(fileContent, {
      delimiter: ',',
      columns: headers,
      fromLine: 2, // Skip the header row
    }, (error, result) => {
      if (error) {
        console.error('Error parsing historical data:', error);
        return;
      }

      console.log('Parsed historical CSV data:');
      console.log(result);
    });
  } catch (err) {
    console.error(`Error reading history.csv: ${err.message}`);
  }
}

// Function for SeratoJS functionality
async function runSeratoJsExperiment() {
  console.log(`Looking for Serato library at: ${seratoDir}`);

  try {
    await fs.promises.access(seratoDir, fs.constants.F_OK);
    console.log('Serato library found!');

    const crates = seratojs.listCratesSync();

    for (const crate of crates) {
      // Ignore the .DS_Store file and newly created test crates
      if (crate.name === '-DS_Store' || crate.name.startsWith('GeminiTestCrate')) {
        continue;
      }
      
      console.log(`\n--- Processing crate: ${crate.name} ---`);
      console.log(`Original crate filename from seratojs: ${crate.filename}`);

      let correctedCrateFilename = crate.filename;
      // Check if the crate name contains '--' which indicates a nested crate,
      // and replace it with '%%' for matching actual filenames on disk.
      if (crate.name.includes('--') || crate.filename.includes('--')) { // Added check for filename too
        correctedCrateFilename = crate.filename.replace(/--/g, '%%');
        console.log(`Corrected crate filename: ${correctedCrateFilename}`);
      }

      const crateFilePath = path.join(subcratesDir, correctedCrateFilename);
      console.log(`Attempting to read file directly at: ${crateFilePath}`);
      
      try {
        const fileContent = await fs.promises.readFile(crateFilePath);
        console.log('File read successfully (length):', fileContent.length);
        
        // Now try to get songs via seratojs's method (this might still fail if seratojs uses its own filename internally)
        const songs = crate.getSongPathsSync();
        console.log('Songs via seratojs.getSongPathsSync():', songs);

      } catch (e) {
        console.error('Error reading crate file directly or getting songs:', e.message);
      }
    }
  } catch (err) {
    if (err.code === 'ENOENT') {
      console.error('Serato library not found.');
      console.error('Please make sure your Serato library is located at: ~/Music/_Serato_');
    } else {
      console.error('Error:', err);
    }
  }
}

// Main function to control execution
async function main() {
  const args = process.argv.slice(2);
  const modeArg = args.find(arg => arg.startsWith('--mode='));
  const mode = modeArg ? modeArg.split('=')[1] : 'seratojs'; // Default to seratojs

  console.log(`Running in mode: ${mode}`);

  if (mode === 'history') {
    await parseHistoricalData();
  } else if (mode === 'seratojs') {
    await runSeratoJsExperiment();
  } else {
    console.log('Invalid mode specified. Use --mode=history or --mode=seratojs');
  }
}

main();
