const config = require('./config.js'),
Dropbox = require('dropbox'),
database = new Dropbox({accessToken: config.dropbox_token});

module.exports = (OpalBot) => {
    OpalBot._db = {};
    OpalBot.timeouts = OpalBot.timeouts || {};
    OpalBot.timeouts.db = {};
    OpalBot.storage = {};
    Object.defineProperty(OpalBot, 'db', {
        get: () => {
            return new Promise((res, rej) => {
                if (Object.keys(OpalBot._db).length) { // cache that stuff so we're not a pain to the nice guys at dropbox, they provide a really nice free api ^^
                    res(OpalBot._db);
                    return;
                }
                database.filesListFolder({path: ''}).then(files => {
                    if (!files.entries.length) {
                        res(OpalBot._db);
                        return;
                    }
                    let promises = [];
                    files.entries.forEach(entry => {
                        promises.push(
                            database.filesDownload({
                                path: entry.path_lower
                            })
                        );
                    });
                    Promise.all(promises).then(a => {
                        a.forEach(r => {
                            let name = r.name;
                            if (name.slice(-5) != '.json') return;
                            name = name.slice(0, -5);
                            OpalBot._db[name] = JSON.parse(Buffer.from(r.fileBinary, 'base64').toString());
                        });
                        res(OpalBot._db);
                    }).catch(rej);
                }).catch(rej);
            });
        },
        set: (obj) => {
            if (!obj.name) return;
            OpalBot._db[obj.name] = obj.value;
            if (OpalBot.timeouts.db[obj.name]) return;
            OpalBot.timeouts.db[obj.name] = setTimeout(() => {
                database.filesUpload({
                    path: '/' + obj.name + '.json',
                    contents: Buffer.from(JSON.stringify(OpalBot._db[obj.name])).toString('base64'),
                    mode: 'overwrite'
                }).catch(OpalBot.util.log);
                delete OpalBot.timeouts.db[obj.name];
            }, 10000);
        }
    });
};