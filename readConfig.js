const fs = require('fs');

exports.readConfig = (path) => {
    let contents = fs.readFileSync(path);
    return JSON.parse(contents);
};