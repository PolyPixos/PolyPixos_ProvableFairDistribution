let shuffleSeed = require('shuffle-seed');
let sha256 = require('js-sha256');
let fs = require('fs');
let path = require('path');

const metadataLocation = "./Metadata/";

let metadataArray = [];

const getObjectFromJSON = function(location) {

    return new Promise((resolve, reject) => {
        fs.readFile(location, 'utf8', function (err, data) {
            if (err) {
                console.log(err);
                reject(err);
            }
            else {
                resolve(JSON.parse(data));
            }
        });
    });

};

const ensureDirectoryExistence = function(filePath) {
    let dirname = path.dirname(filePath);
    if (fs.existsSync(dirname)) {
        return true;
    }
    ensureDirectoryExistence(dirname);
    fs.mkdirSync(dirname);
}

const writeJSONFile = function(path, jsonString) {

    ensureDirectoryExistence(path);

    fs.writeFile(path, jsonString, (err) => {
        if (err) {
            throw err;
        }
        console.log(`JSON data saved: ${path}`);
    });

};

const reindexBasedOnNewOrder = function(arr) {

    arr.forEach((e, i) => {

        let newTokenId = i+1;

        e.tokenId = newTokenId;

        e.name.split("#");
        e.name = e.name.split("#")[0] + "#" + newTokenId;

    });

};

const shuffleMetadata = function(generateSingleFiles) {

    const promises = [
        getObjectFromJSON(metadataLocation + 'unshuffled/metadata.json'),
    ];

    Promise.all(promises).then(result => {

        metadataArray = result[0];

        let metadataString = JSON.stringify(metadataArray, null, 1);

        // CALCULATE PROVENANCE
        let provenance = sha256(sha256(metadataString));

        console.log(`PROVENANCE: ${provenance}`);

        // Block number: 13806520
        let seed = "0xe1c973180ece5b54bf8853c4647842b03122a8bbf9e5135cc1f2dcf537139d61";

        let metadataShuffled = shuffleSeed.shuffle(metadataArray, seed);

        reindexBasedOnNewOrder(metadataShuffled);

        let jsonString = JSON.stringify(metadataShuffled, null, 1);
        writeJSONFile(metadataLocation + 'shuffled/metadata.json', jsonString);

        if (generateSingleFiles) {

            metadataShuffled.forEach((m, i) => {

                let js = JSON.stringify(m, null, 1);
                writeJSONFile(metadataLocation + 'shuffled/single/' + (i + 1).toString(), js);

            });

        }

    });

};

(function() {

    shuffleMetadata(true);

})();
