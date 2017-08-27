const fs = require('fs');

fs.readdirSync('./i18n')
    .filter(file => file != 'index.js')
    .forEach(title => require('./' + title));