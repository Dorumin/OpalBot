const got = require('got'),
cheerio = require('cheerio');


function chunk(arr, overhead = 0, jump = 1, max = 2000) {
    const chunks = [];
    let len = overhead,
    current = 0;

    chunks[current] = [];
    for (let i = 0; i < arr.length; i++) {
        const item = arr[i];
        if (len + item.length > max) {
            len = 0;
            current++;
            chunks[current] = [];
        }

        len += item.length + jump;
        chunks[current].push(item);
    }

    return chunks;
}

function formatLyrics(lyrics) {
    const split = lyrics.split('\n').map(line => line.trim()).filter(line => !line.startsWith('['));

    return split.join('\n').replace(/\n{2,}/g, '\n\n').replace(/\*/g, '\\*').trim();
}

module.exports = (OpalBot) => {
    const out = {};

    out.peasants = {};
    out.peasants.lyrics = async (message, content, lang) => {
        const res = await got(`https://genius.com/api/search/song?page=1&q=${encodeURIComponent(content)}`, {
            json: true
        });
        const songs = res.body.response.sections[0].hits
            .sort((a, b) => {
                var same1 = a.result.title.toLowerCase() == content.toLowerCase(),
                same2 = b.result.title.toLowerCase() == content.toLowerCase();

                if (same1 == same2) return b.result.stats.pageviews - a.result.stats.pageviews;

                if (same1) return -1;
                if (same2) return 1;
            });
        
        const song = songs[0];
        const lyricsRes = await got(`https://genius.com${song.result.path}`);
        const $ = cheerio.load(lyricsRes.body);
        const title = song.result.title;
        const artist = song.result.primary_artist.name;
        const lyrics = formatLyrics($('.lyrics p').first().text());
        const split = chunk(lyrics.split('\n'), 10, 1, 2000);

        for (let i = 0; i < split.length; i++) {
            await message.channel.send({
                embed: {
                    color: OpalBot.color,
                    url: `https://genius.com${song.result.path}`,
                    title: i == 0
                        ? OpalBot.i18n.msg('for', 'lyrics', title, artist, lang)
                        : undefined,
                    description: split[i].join('\n'),
                    footer: i == split.length - 1
                        ? {
                            text: OpalBot.i18n.msg('footer', 'lyrics', message.member.nickname || message.author.username, lang),
                            icon_url: message.author.displayAvatarURL
                        }
                        : undefined
                }
            });
        }
    };

    return out;
};
