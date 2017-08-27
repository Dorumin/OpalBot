const fs = require('fs');

fs.readdirSync('./commands')
    .filter(file => file != 'index.js')
    .forEach(title => require('./' + title));