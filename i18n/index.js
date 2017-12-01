const fs = require('fs');

fs.readdirSync('./i18n')
    .filter(file => file.endsWith('.json'))
    .forEach(title => exports[title.slice(0, -5)] = require('./' + title));

exports.msg = function(message, obj, ...vars) {
    var i18n = this,
    local = exports[vars.pop()] || exports.en,
    ref = obj;
    if (typeof obj == 'string') {
        obj = local[obj];
    }
    if (!obj) {
        obj = exports['en'][ref];
    }
    var msg = obj[message];
    if (!msg || typeof msg != 'string') {
        if (typeof ref == 'string') {
            throw new ReferenceError(`(i18n) No key <${message}> in object <i18n.${ref}> found.`);
        }
        throw new ReferenceError(`(i18n) No key <${message}> found.`);
    }
    if (!vars.length) return msg;
    return msg.replace(/\$(\d)/g, (s, n) => {
        return vars[n - 1] || s;
    }).replace(/\(([\d\.]+?\|.+?\|.+?)\)/g, (s, match) => { // Plural markdown, (1|singular|plural) => "1 singular"; (4|singular|plural) => "4 plural"
        var split = match.split('|');
        return split[0] == 1 ? split[1] : split[2];
    });
};