const fs = require('fs'),
util = require('../src/util.js');

fs.readdirSync('./i18n')
    .filter(file => file.endsWith('.json'))
    .forEach(title => exports[title.slice(0, -5)] = require('./' + title));

exports.msg = function(message, obj, ...args) {
    let i18n = this,
    local = exports[args.pop()] || exports.en,
    ref = obj;
    if (typeof obj == 'string') {
        obj = local[obj];
    }
    if (!obj) {
        obj = exports['en'][ref];
    }
    let msg = obj[message];
    if (!msg || typeof msg != 'string') {
        if (typeof ref == 'string') {
            throw new ReferenceError(`(i18n) No key <${message}> in object <i18n.${ref}> found.`);
        }
        throw new ReferenceError(`(i18n) No key <${message}> found.`);
    }
    if (!args.length) return msg;
    return util.format_message(msg, args);
};