const Dropbox = require('dropbox');
const http = require('http');
const database = new Dropbox({accessToken: 'bwByQaA7fdAAAAAAAAAAD4fC_7yxnYY2KHutTp5xBiWDiNa54OBpSDejePmGic_S'});

var OpalBot = {
    _db: {},
    get db() {
        return new Promise((res, rej) => {
            if (Object.keys(OpalBot._db).length) { // cache that stuff so we're not a pain to the nice guys at dropbox, they provide a really nice free api ^^
                res(OpalBot_db);
                return;
            }
            database.filesListFolder({path: ''}).then(files => {
                var promises = [];
                files.entries.forEach(entry => {
                    promises.push(
                        database.filesDownload({
                            path: entry.path_lower
                        })
                    );
                });
                Promise.all(promises).then(a => {
                    a.forEach(r => {
                        var name = r.name;
                        if (name.slice(-5) != '.json') return;
                        name = name.slice(0, -5);
                        OpalBot._db[name] = JSON.parse(r.fileBinary);
                    });
                    res(OpalBot._db);
                }).catch(rej);
            }).catch(rej);
        });
    },
    set db(obj) {
        if (!obj.name) return;
        OpalBot._db[obj.name] = obj.value;
        if (OpalBot.timeouts.db[name]) return;
        OpalBot.timeouts.db[name] = setTimeout(() => {
            database.filesUpload({
                path: '/' + name + '.json',
                contents: JSON.stringify(OpalBot_.db[obj.name])
            });
            delete OpalBot.timeouts.db[name];
        }, 10000);
    },
    timeouts: {
        db: {}
    }
};
(async () => {
    var db = await OpalBot.db;
    console.log(JSON.stringify(db, null, 2));
})();

http.createServer(console.log).listen(5000);