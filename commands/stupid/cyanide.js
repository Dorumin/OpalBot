let Canvas,
Image;
try {
    Canvas = require('canvas');
    Image = Canvas.Image;
} catch(e) {}

const got = require('got');

module.exports = (OpalBot) => {
    const out = {},
    i18n = OpalBot.i18n;

    out.peasants = {};
    out.peasants.cah = 'cyanide';
    out.peasants.cyanide = (message, content, lang) => {
        const { body: page } = await got('http://explosm.net/rcg/view/');
        const urls = page.match(/https:\/\/rcg-cdn\.explosm\.net\/panels\/[A-Z0-9].png/g);
        if (!urls) return;
        const images = await Promise.all(
            urls.map(url => got(url, { encoding: null }))
        );
        const canvas = new Canvas(275 * 3, 398);
        images.forEach((buffer, i) => {
            const panel = new Image();
            panel.src = buffer;
            canvas.drawImage(panel, 275 * i, 0, 275, 398);
        });
        message.channel.send({
            file: canvas.toBuffer()
        });
    };

    return out;
};