const fs = require('fs');
const { parse } = require('csv-parse');

/**
 * Parses a Serato-exported history CSV file.
 * @param {string} filePath The full path to the history CSV file.
 * @returns {Promise<Array<object>>} A promise that resolves to an array of track objects from the history.
 */
function parseHistoryCsv(filePath) {
    return new Promise((resolve, reject) => {
        if (!fs.existsSync(filePath)) {
            return reject(new Error(`History file not found at: ${filePath}`));
        }

        const records = [];

        const parser = parse({
            columns: true, // Use the first row as headers
            trim: true,
            skip_empty_lines: true,
        });

        parser.on('readable', function() {
            let record;
            while ((record = parser.read()) !== null) {
                records.push(record);
            }
        });

        parser.on('error', function(err) {
            reject(err);
        });

        parser.on('end', function() {
            console.log(`Successfully parsed ${records.length} tracks from history.`);
            resolve(records);
        });

        fs.createReadStream(filePath).pipe(parser);
    });
}

module.exports = { parseHistoryCsv };
