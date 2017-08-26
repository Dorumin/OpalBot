const fs = require('fs');

fs.readdirSync('./i18n')
    .filter(file => file.endsWith('.json'))
    .forEach(title => exports[title.slice(0, -5)] = require('./' + title));