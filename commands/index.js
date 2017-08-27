const fs = require('fs');

fs.readdirSync('./commands')
    .filter(file => file != 'index.js')
    .forEach(title => {
        var commands = require('./' + title);
        for (var key in commands) {
            module.exports[key] = module.exports[key] || {};
            module.exports[key] = {
                ...module.exports[key],
                ...commands[key]
        }
    });