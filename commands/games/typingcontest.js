const request = require('request'),
req = (obj, POST) => {
    return new Promise((res, rej) => {
        (POST ? request.post : request)(obj, (e, r, body) => {
            if (e || r.statusCode == '404') {
                rej(e);
                return;
            }
            res({res: r, body: body});
        });
    });
};

// http://stackoverflow.com/questions/11919065#answer-11958496
function lev_dist(s, t) {
    var d = []; //2d matrix
    // Step 1
    var n = s.length;
    var m = t.length;
    if (n == 0) return m;
    if (m == 0) return n;
    s = s.toLowerCase();
    t = t.toLowerCase();
    if (s == t) return 0;
    //Create an array of arrays in javascript (a descending loop is quicker)
    for (var i = n; i >= 0; i--) d[i] = [];
    // Step 2
    for (var i = n; i >= 0; i--) d[i][0] = i;
    for (var j = m; j >= 0; j--) d[0][j] = j;
    // Step 3
    for (var i = 1; i <= n; i++) {
        var s_i = s.charAt(i - 1);
        // Step 4
        for (var j = 1; j <= m; j++) {
            //Check the jagged ld total so far
            if (i == j && d[i][j] > 4) return n;
            var t_j = t.charAt(j - 1);
            var cost = (s_i == t_j) ? 0 : 1; // Step 5
            //Calculate the minimum
            var mi = d[i - 1][j] + 1;
            var b = d[i][j - 1] + 1;
            var c = d[i - 1][j - 1] + cost;
            if (b < mi) mi = b;
            if (c < mi) mi = c;
            d[i][j] = mi; // Step 6
            //Damerau transposition
            if (i > 1 && j > 1 && s_i == t.charAt(j - 2) && s.charAt(i - 2) == t_j) {
                d[i][j] = Math.min(d[i][j], d[i - 2][j - 2] + cost);
            }
        }
    }
    // Step 7
    return d[n][m];
};

module.exports = (OpalBot) => {
    const out = {},
    i18n = OpalBot.i18n;

    out.peasants = {};
    
    out.peasants.typestart = 'typingcontest';
    out.peasants.typecontest = 'typingcontest';
    out.peasants.typingspeed = 'typingcontest';
    out.peasants.typingstart = 'typingcontest';
    out.peasants.typingcontest = async (message, content, lang) => {
        let storage = OpalBot.storage.quotes = OpalBot.storage.quotes || {},
        quote = null,
        fancy_characters = {
            '“': '"',
            '”': '"',
            '‘': "'",
            '’': "'",
            '—': '-',
            '―': '-',
            '‒': '-',
            '–': '-'
        },
        reg = new RegExp( Object.keys(fancy_characters).join('|'), 'g' ),
        leaderboard = i18n.msg('leaderboard', 'typingcontest', lang).split('|').includes(content.trim());
        if (leaderboard) {
            let db = await OpalBot.db,
            games = db.games || {},
            tc = games.typingcontest || [],
            names = '',
            scores = '',
            dates = '';
            if (!tc.length) {
                message.channel.send(i18n.msg('no-leaderboard', 'typingcontest', lang)).catch(OpalBot.util.log);
                return;
            }
            tc.forEach((obj, idx) => {
                let monospace_char = String.fromCharCode(55349) + String.fromCharCode(idx + 57335);
                names += `\n#${monospace_char} ${obj.name}`;
                scores += `\n${obj.wpm}`;
                dates += '\n' + OpalBot.util.formatDate(i18n.msg('date-format', 'typingcontest', lang), new Date(obj.date));
            });
            message.channel.send({
                embed: {
                    color: OpalBot.color,
                    title: i18n.msg('leaderboard-title', 'typingcontest', lang),
                    fields: [
                        {
                            name: i18n.msg('player', 'typingcontest', lang),
                            value: names,
                            inline: true
                        }, {
                            name: i18n.msg('wpm', 'typingcontest', lang),
                            value: scores,
                            inline: true
                        }, {
                            name: i18n.msg('date', 'typingcontest', lang),
                            value: dates,
                            inline: true
                        }
                    ]
                }
            }).catch(OpalBot.util.log);
            return;
        }
        if (storage[message.channel.id]) {
            message.channel.send(i18n.msg('multiple', 'typingcontest', lang)).catch(OpalBot.util.log);
            return;
        }
        storage[message.channel.id] = true;
        while (!quote) {
            let {body} = await req('http://quotesondesign.com/wp-json/posts?filter[orderby]=rand&filter[posts_per_page]=40'),
            quotes = JSON.parse(body).map(obj => {
                obj.content = obj.content
                    .replace(/&#\d+;/g, str => {
                        return String.fromCharCode(str.slice(2, -1));
                    })
                    .replace(/<[a-z-\s\/]+>/gi, '')
                    .replace(reg, char => fancy_characters[char])
                    .trim();
                return obj;
            }),
            i = quotes.length;
            while (i--) {
                if (quotes[i].content.length > 150  && quotes[i].content.length < 300 && quotes[i].content.indexOf('\n') == -1) {
                    quote = quotes[i];
                    break;
                }
            }
        }
        storage[quote.ID] = quote;
        message.channel.send(i18n.msg('duration', 'typingcontest', Math.ceil(quote.content.length / 3 + 3), lang)).catch(OpalBot.util.log);
        let countdown = await message.channel.send(i18n.msg('countdown', 'typingcontest', 3, lang)).catch(OpalBot.util.log),
        scores = [];
        setTimeout(() => {
            countdown.edit(i18n.msg('countdown', 'typingcontest', 2, lang)).catch(OpalBot.util.log)
        }, 1000);
        setTimeout(() => {
            countdown.edit(i18n.msg('countdown', 'typingcontest', 1, lang)).catch(OpalBot.util.log)
        }, 2000);
        setTimeout(() => {
            if (countdown.deletable) {
                countdown.delete().catch(OpalBot.util.log);
            }
        }, 3000);
        setTimeout(() => {
            OpalBot.unprefixed.remove({
                type: 'typingcontest',
                channel: message.channel.id
            });
        }, quote.content.length * 1000 / 3 + 3);
        await new Promise(res => {
            setTimeout(() => {
                res();
            }, 2000);
        });
        let start_timestamp = Date.now() + 3000,
        finished = {},
        i = 0,
        case_sensitive = !content.includes(i18n.msg('case-insensitive', 'typingcontest', lang)),
        punctuation = !content.includes(i18n.msg('punctuation-off', 'typingcontest', lang));
        message.channel.send({
            embed: {
                title: i18n.msg('image-title', 'typingcontest', lang),
                color: OpalBot.color,
                image: {
                    url: 'http://opalbot.herokuapp.com/quote_image?id=' + quote.ID // Change this if you're selfhosting
                }
            }
        }).catch(OpalBot.util.log);
        while (true) {
            let _message = message,
            message;
            try {
                message = (await OpalBot.unprefixed.expect({
                    type: 'typingcontest',
                    channel: _message.channel.id,
                    timeout: quote.content.length * 1000 / 3 + 10
                })).message;
            } catch(e) {
                break;
            }
            if (finished[message.author.id]) continue;
            let q = quote.content,
            c = message.content;
            if (!case_sensitive) {
                q = q.toLowerCase();
                c = c.toLowerCase();
            }
            if (!punctuation) {
                q = q.replace(/[\.,-\/#!$%\^&\*;:{}=\-_`~()@\+\?><\[\]\+']/g, '').replace(/\s{2,}/g," ");
                c = c.replace(/[\.,-\/#!$%\^&\*;:{}=\-_`~()@\+\?><\[\]\+']/g, '').replace(/\s{2,}/g," ");
            }
            if (lev_dist(q, c) < Math.max(20, q.length / 20)) {
                finished[message.author.id] = true;
                scores.push([message.author, Date.now(), message.content, message.author.typingDurationIn(message.channel)]);
                message.channel
                    .send(i18n.msg('finished', 'typingcontest', message.author.username, ((Date.now() - start_timestamp) / 1000).toFixed(1), lang))
                    .catch(OpalBot.util.log);
            }
        }
        if (!scores.length) {
            message.channel.send(i18n.msg('snails', 'typingcontest', lang)).catch(OpalBot.util.log);
        } else {
            let players = '',
            wpm_scores = '',
            incorrect_words = '';
            scores.forEach((arr, idx) => {
                let q = quote.content;
                if (!case_sensitive) {
                    q = q.toLowerCase();
                    arr[2] = arr[2].toLowerCase();
                }
                if (!punctuation) {
                    q = q.replace(/[\.,-\/#!$%\^&\*;:{}=\-_`~()@\+\?><\[\]\+']/g, '').replace(/\s{2,}/g," ");
                    arr[2] = arr[2].replace(/[\.,-\/#!$%\^&\*;:{}=\-_`~()@\+\?><\[\]\+']/g, '').replace(/\s{2,}/g," ");
                }
                let correct_words = 0,
                errors = 0,
                split = arr[2].split(' ').filter(Boolean),
                original = q.split(' ').filter(Boolean),
                i = 0,
                cur_index = 0,
                max = Math.max(split.length, original.length);
                while (i < max) {
                    if (original[cur_index] == split[i]) {
                        cur_index++;
                        correct_words++;
                    } else {
                        errors++;
                        if (!correct_words--) { // don't reduce if it's already 0
                            correct_words = 0;
                        }
                        if (original[cur_index + 1] == split[i]) {
                            cur_index++;
                        } else if (original[cur_index - 1] == split[i]) {
                            cur_index--;
                        } else if (original[cur_index + 2] == split[i]) {
                            cur_index += 2;
                        } else if (original[cur_index - 2] == split[i]) {
                            cur_index -= 2;
                        }
                        cur_index++;
                    }
                    i++;
                }
                let elapsed = arr[1] - start_timestamp;
                elapsed = elapsed > arr[3] && arr[3] != -1 ? arr[3] : elapsed;
                let secs = (elapsed / 1000).toFixed(1),
                wpm = Math.ceil( correct_words * ( 60 / ( elapsed / 1000 ) ) );
                if (wpm > 140) {
                    // too op - pls nerf
                    elapsed = arr[1] - start_timestamp;
                    secs = (elapsed / 1000).toFixed(1);
                    wpm = Math.ceil( correct_words * ( 60 / ( elapsed / 1000 ) ) );
                }
                arr.wpm = `${i18n.msg('score-format', 'typingcontest', wpm, secs, lang)}\n`;
                arr.errors = errors;
            });
    
            scores.sort((a, b) => {
                return parseInt(b.wpm) - parseInt(a.wpm);
            });
    
            scores.forEach((arr, idx) => {
                let monospace_char = String.fromCharCode(55349) + String.fromCharCode(idx + 57335);
                players += '\n#' + monospace_char + ' ' + arr[0].username;
                wpm_scores += arr.wpm;
                incorrect_words += arr.errors + '\n';
            });
            message.channel.send({
                embed: {
                    title: i18n.msg('title', 'typingcontest', lang),
                    description: quote.content + ' - **' + quote.title + '**',
                    color: OpalBot.color,
                    fields: [
                        {
                            name: i18n.msg('player', 'typingcontest', lang),
                            value: players,
                            inline: true
                        }, {
                            name: i18n.msg('score', 'typingcontest', lang),
                            value: wpm_scores,
                            inline: true
                        }, {
                            name: i18n.msg('errors', 'typingcontest', lang),
                            value: incorrect_words,
                            inline: true
                        }
                    ]
                }
            }).catch(OpalBot.util.log);
            scores.forEach(async arr => {
                let wpm = parseInt(arr.wpm),
                games = (await OpalBot.db).games || {};
                games.typingcontest = games.typingcontest || [];
                games.typingcontest.push({
                    id: arr[0].id,
                    name: arr[0].username,
                    wpm: wpm,
                    date: Date.now()
                });
                games.typingcontest = games.typingcontest.sort((a, b) => {
                    return b.wpm - a.wpm;
                }).filter((score, index, scores) => {
                    return scores.findIndex(item => item.id == score.id) == index;
                }).slice(0, 5);
                OpalBot.util.extendDatabase('games', games);
            });
        }
        delete storage[message.channel.id];
    };    

    return out;
};