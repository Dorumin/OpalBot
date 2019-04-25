const got = require('got'),
cheerio = require('cheerio');

module.exports = (OpalBot) => {
    const out = {};
    
    out.peasants = {};
    out.peasants.define = async (message, content) => {
        const res = await got(`https://www.dictionary.com/browse/${encodeURIComponent(content)}`);
        const $ = cheerio.load(res.body);
        $('.luna-example').remove();
        const first = $('div[value="1"]');
        const next = first.nextAll();
        const text = first.text() + '\n' + next.map((_, node) => $(node).text()).toArray().join('\n');
        message.channel.send(text);
    };

    return out;
}