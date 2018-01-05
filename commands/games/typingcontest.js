const request = require('request'),
config = require('../../src/config.js'),
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
    
    out.peasants.tc = 'typingcontest';
    out.peasants.tr = 'typingcontest';
    out.peasants.typeracer = 'typingcontest';
    out.peasants.typetest = 'typingcontest';
    out.peasants.typingtest = 'typingcontest';
    out.peasants.typingrace = 'typingcontest';
    out.peasants.typingcontest = async (message, content, lang) => {
        if (!config.selfping_url) {
            console.log('Please set the selfping_url configuration variable or server-dependant functions will not run. Typingcontest aborted.');
            return;
        }
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
        let count = 5,
        countdown = await message.channel.send(i18n.msg('countdown', 'typingcontest', count, lang)).catch(OpalBot.util.log),
        scores = {};
        while (count--) {
            await OpalBot.util.wait(1000);
            if (count) {
                countdown.edit(i18n.msg('countdown', 'typingcontest', count, lang)).catch(OpalBot.util.log);
            }
        }
        await countdown.delete().catch(OpalBot.util.log);
        await message.channel.send({
            embed: {
                title: i18n.msg('image-title', 'typingcontest', lang),
                color: OpalBot.color,
                image: {
                    url: config.selfping_url + '/quote_image?id=' + quote.ID
                }
            }
        }).catch(OpalBot.util.log);
        let starts = {
            default: Date.now() + 3000
        },
        case_sensitive = !content.includes(i18n.msg('case-insensitive', 'typingcontest', lang)),
        punctuation = !content.includes(i18n.msg('punctuation-off', 'typingcontest', lang)),
        on_typing = (chan, user) => {
            starts[user.id] = starts[user.id] || Date.now();
            OpalBot.util.log(starts);
        },
        timeout = Date.now() + quote.content.length * 1000 / 3

        OpalBot.handlers.typingStart = OpalBot.handlers.typingStart || [];
        OpalBot.handlers.typingStart.push(on_typing);
        OpalBot.storage.typingUsers = OpalBot.storage.typingUsers || {};
        OpalBot.storage.typingUsers[message.channel.id] = OpalBot.storage.typingUsers[message.channel.id] || [];
        OpalBot.storage.typingUsers[message.channel.id].forEach(user => {
            starts[user.id] = Date.now();
        });
        OpalBot.util.log(starts);

        const collector = message.channel.createMessageCollector(
            m => {
                let q = quote.content,
                c = m.content;
                if (!case_sensitive) {
                    q = q.toLowerCase();
                    c = c.toLowerCase();
                }
                if (!punctuation) {
                    q = q.replace(/[\.,-\/#!$%\^&\*;:{}=\-_`~()@\+\?><\[\]\+']/g, '').replace(/\s{2,}/g," ");
                    c = c.replace(/[\.,-\/#!$%\^&\*;:{}=\-_`~()@\+\?><\[\]\+']/g, '').replace(/\s{2,}/g," ");
                }
                return !scores[m.author.id] && lev_dist(q, c) < Math.max(20, q.length / 20)
            },
            {
                time: quote.content.length * 1000 / 3 + 20000 // Force timeout, but can end sooner
            }
        );

        setTimeout(() => {
            // End race if nobody is typing
            if (OpalBot.storage.typingUsers[message.channel.id].length) {
                collector.stop();
            }
        }, quote.content.length * 1000 / 3);

        collector.on('collect', msg => {
            scores[msg.author.id] = {
                user: msg.author,
                time: Date.now(),
                message: msg
            };
            msg.channel
                .send(i18n.msg('finished', 'typingcontest', msg.author.username, ((Date.now() - (starts[msg.author.id] || starts.default)) / 1000).toFixed(1), lang))
                .catch(OpalBot.util.log);
            // End race if nobody is typing, and race should have finished already
            if (OpalBot.storage.typingUsers[message.channel.id].length && timeout < Date.now()) {
                collector.stop();
            }
        });

        collector.on('end', collection => {
            if (!collection.size) {
                delete storage[message.channel.id];
                return message.channel.send(i18n.msg('snails', 'typingcontest', lang)).catch(OpalBot.util.log);
            }
            let players = '',
            results = '',
            incorrect = '',
            ordered = [];
            for (let key in scores) {
                console.log(typeof key != 'undefined' ? key : 'undefined', scores);
                let score = scores[key],
                q = quote.content,
                c = score.message.content;
                if (!case_sensitive) {
                    q = q.toLowerCase();
                    c = c.toLowerCase();
                }
                if (!punctuation) {
                    q = q.replace(/[\.,-\/#!$%\^&\*;:{}=\-_`~()@\+\?><\[\]\+']/g, '').replace(/\s{2,}/g," ");
                    c = c.replace(/[\.,-\/#!$%\^&\*;:{}=\-_`~()@\+\?><\[\]\+']/g, '').replace(/\s{2,}/g," ");
                }
                let correct = 0,
                errors = 0,
                qs = q.split(' ').filter(Boolean),
                cs = c.split(' ').filter(Boolean),
                i = 0,
                cur = 0,
                max = Math.max(qs.length, cs.length);
                while (i < max) {
                    if (qs[cur] == cs[i]) {
                        cur++;
                        correct++;
                    } else {
                        errors++;
                        if (!correct--) { // don't reduce if it's already 0
                            correct = 0;
                        }
                        if (qs[cur + 1] == cs[i]) {
                            cur++;
                        } else if (qs[cur - 1] == cs[i]) {
                            cur--;
                        } else if (qs[cur + 2] == cs[i]) {
                            cur += 2;
                        } else if (qs[cur - 2] == cs[i]) {
                            cur -= 2;
                        }
                        cur++;
                    }
                }
                let elapsed = score.time - (starts[score.user.id] || starts.default),
                secs = (elapsed / 1000).toFixed(1),
                wpm = Math.ceil(correct * (60 / elapsed / 1000));
                score.wpm = `${i18n.msg('score-format', 'typingcontest', wpm, secs, lang)}\n`;
                score.errors = errors;
                ordered.push(score);
            }

            // Sort scores and add results to end table
            ordered.sort((a, b) => {
                return parseInt(b.wpm) - parseInt(a.wpm);
            }).forEach((score, i) => {
                let cardinal = i + (i == 1 ? '  ' : ' ');
                players += '\n#' + cardinal + ' ' + score.user.username;
                results += score.wpm;
                incorrect += score.errors + '\n';
            });

            // Post race results
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
                            value: results,
                            inline: true
                        }, {
                            name: i18n.msg('errors', 'typingcontest', lang),
                            value: incorrect,
                            inline: true
                        }
                    ]
                }
            }).catch(OpalBot.util.log);

            // Update leaderboards
            ordered.forEach(async score => {
                let wpm = parseInt(score.wpm),
                games = (await OpalBot.db).games || {};
                games.typingcontest = games.typingcontest || [];
                games.typingcontest.push({
                    id: score.user.id,
                    name: score.user.username,
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

            // Close session
            delete storage[message.channel.id];
        });
    };    

    return out;
};