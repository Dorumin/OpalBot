const got = require('got'),
cheerio = require('cheerio');


function chunk(arr, overhead = 0, jump = 1, max = 2000) {
    const chunks = [];
    let len = overhead,
    i = arr.length,
    current = 0;

    chunks[current] = [];
    while (i--) {
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

module.exports = (OpalBot) => {
    const out = {};

    out.peasants = {};
    out.peasants.lyrics = async (message, content) => {
        const res = await got(`https://lyricsfa.com/?s=${encodeURIComponent(content)}&orderby=relevance&order=DESC`);
        const $ = cheerio.load(res.body);
        const link = $('.entry-title a.dark').first().find('a').attr('href');
        const lyricsRes = await got(link);
        const $l = cheerio.load(lyricsRes.body);
        const lyrics = $l('.entry.entry-single').text()
            .replace(/\n{2,}/g, '\n\n')
            .split('\n')
            .map(line => line.trim());
        const split = chunk(lyrics, 10, 1, 2000);
        
        // await message.channel.send(`**${title}**`);

        for (let i = 0; i < split.length; i++) {
            await message.channel.send(split[i]);
        }
    };

    return out;
};