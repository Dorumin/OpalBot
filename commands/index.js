const fs = require('fs'),
path = require('path'),
c = './commands';

module.exports = (OpalBot) => {
    const out = {};

    fs.readdirSync(c)
        .filter(file => !file.startsWith('.') && fs.statSync(path.join(c, file)).isDirectory())
        .forEach(file => {
            fs.readdirSync(path.join(c, file))
                .forEach(command => {
                    let xport = require(path.join('.' + c, file, command))(OpalBot);
                    if (!xport) {
                        console.log(`Module not exported anything: ${file}`);
                        return;
                    }
                    for (let key in xport) {
                        out[key] = out[key] || {};
                        out[key] = {
                            ...out[key],
                            ...xport[key]
                        };
                    }
                });
        });

    return out;
}