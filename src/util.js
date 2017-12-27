const util = require('util');

module.exports = (OpalBot) => {
    const out = {};

    out.pad = (n, l, force = true) => {
        if (typeof n != 'number') throw new TypeError('n must be a number');
        if (!force && n.toString().length >= l) {
            return n.toString();
        }
        return ('0000' + n).slice(-l || -4);
    };
    
    out.log = (...args) => {
        let pad = out.pad;
        args.forEach(arg => {
            console.log(arg);
            OpalBot.log_count++
            if (typeof arg == 'object') {
                OpalBot.log += '______\n' + pad(OpalBot.log_count) + ': ' + util.inspect(arg) + '\n______\n';
            } else {
                OpalBot.log += pad(OpalBot.log_count) + ': ' + arg + '\n';
            }
        });
    };
    
    out.formatBytes = (bytes, decimals) => {
        if (bytes == 0) return '0 Bytes';
        let k = 1024,
            dm = decimals || 2,
            sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'],
            i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
     };
    
    out.formatDate = (format, date = new Date(), utc = true) => {
        let table = out.formatDate.methodTable;
        return format.replace(new RegExp(`(${Object.keys(table).join('|')})+`, 'g'), (s, type) => {
            let method = table[type].replace('UTC', utc ? 'UTC' : ''),
            value = date[method]();
            if (table[type] == 'getUTCMonth') { // BECAUSE JAVASCRIPT
                value += 1;
            }
            return out.pad(value, s.length);
        });
    };
    
    out.formatDate.methodTable = {
        S: 'getUTCMilliseconds',
        s: 'getUTCSeconds',
        m: 'getUTCMinutes',
        h: 'getUTCHours',
        H: 'getUTCHours', // Alias
        d: 'getUTCDate',
        D: 'getUTCDate', // Alias
        M: 'getUTCMonth',
        y: 'getUTCFullYear',
        Y: 'getUTCFullYear' // Alias
    };

    out.formatDuration = (s) => {
        let f = n => out.pad(Math.floor(n), 2, false);
        return [
            f(s / 3600),
            f(s / 60 % 60),
            f(s % 60)
        ].join(':').replace(/^(00:)+/g, '').replace(/^0+/, '');
    };

    out.readDuration = (str) => {
        if (!str) return 0;
        if (!str.match && str[0] && str[0].match) {
            str = str[0];
        }
        str = str.trim();
        let ms = str.match(/\.\d+$/),
        s = 0;
        if (ms) {
            str = str.slice(0, ms.index);
            s += Number(ms[0]);
        }
        let m = str.match(/\d+/g);
        if (!m) return s;
        m.reverse().map(Number).forEach((value, index) => {
            while (index--) {
                value = value * 60;
            }
            s += value;
        });
        return s;
    };
    
    out.getChannelMessages = async (channel, before, break_function) => { // break function MUST return true for the message querying to stop, truthy values don't do the trick
        before = before || Date.now() - 1209600000; // 2 weeks
        return new Promise(async (res, rej) => {
            let LIMIT = 50,
            last_id = null,
            collection = null;
            while (LIMIT--) {
                try {
                    let coll = await channel.fetchMessages({
                        limit: 100,
                        ...last_id
                    });
                } catch(e) {
                    rej(e);
                }
                if (!collection) {
                    collection = coll;
                } else {
                    collection = collection.concat(coll);
                }
                last_id = {before: coll.last().id};
                if (coll.last().createdTimestamp < before || (typeof break_function != 'function' || break_function(collection) === true)) {
                    break;
                }
            }
            collection = collection.filter(model => {
                return model.createdTimestamp > before;
            });
            res(collection);
        });
    };
    
    out.getGuildLanguage = async (guild) => {
        let langs = ((await OpalBot.db).data || {}).languages;
        try {
            return langs[guild.id] || langs.default;
        } catch(e) {
            return langs.default;
        }
    };
    
    out.isPlainObject = (obj) => { // https://stackoverflow.com/a/5878101
        if (typeof obj == 'object' && obj !== null) {
            
            if (typeof Object.getPrototypeOf == 'function') {
    
                let proto = Object.getPrototypeOf(obj);
                return proto === Object.prototype || proto === null;
            }
    
            return Object.prototype.toString.call(obj) == '[object Object]';
        }
    
        return false;
    }
    
    out.mergeObjects = (obj1, obj2, soft) => {
        for (let key in obj2) {
            if (out.isPlainObject(obj2[key]) && out.isPlainObject(obj1[key])) {
                obj2[key] = out.mergeObjects(obj1[key], obj2[key]);
            }
        }
    
        if (soft) {
            return {
                ...obj2,
                ...obj1
            };
        }
    
        return {
            ...obj1,
            ...obj2
        };
    };
    
    out.extendDatabase = async (file, obj) => {
        const db = await OpalBot.db,
        value = db[file];
        if (value) {
            OpalBot.db = {
                name: file,
                value: out.mergeObjects(value, obj)
            }
        } else {
            OpalBot.db = {
                name: file,
                value: obj
            };
        }
        return db;
    };

    OpalBot.util = out;
    return out;
};