const fs = require('fs');
const exports = module.exports = {};

fs.readdirSync('../i18n')
    .filter(file => file.endsWith('.json'))
    .forEach(title => exports[title.slice(0, -5)] = require('./' + title));