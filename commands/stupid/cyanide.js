let Canvas,
Image;
try {
    Canvas = require('canvas');
    Image = Canvas.Image;
} catch(e) {}

const got = require('got');
const request = require('request').defaults({ encoding: null });

module.exports = (OpalBot) => {
    const out = {},
    i18n = OpalBot.i18n;

    out.peasants = {};
    out.peasants.cah = 'cyanide';
    out.peasants.rcg = 'cyanide';
    out.peasants.cyanide = async (message, content, lang) => {
        const { body: page } = await got('http://explosm.net/rcg/view/');
        const urls = page.match(/https:\/\/rcg-cdn\.explosm\.net\/panels\/[A-Z0-9]+\.png/g);
        if (!urls) return;

        const buffers = await Promise.all(
            urls.map(url => {
                return new Promise((res, rej) => {
                    request(url, (err, r, body) => {
                        if (err) {
                            rej(err);
                            return;
                        }
                        res(body);
                    });
                });
            })
        );

        const canvas = new Canvas(275 * 3, 398),
        context = canvas.getContext('2d');

        const images = await Promise.all(
            buffers.map((buffer) => {
                return new Promise((res, rej) => {
                    const panel = new Image();
                    panel.onload = res;
                    panel.onerror = rej;
                    panel.src = buffer;
                });
            })
        );

        images.forEach((image, i) => {
            context.drawImage(image, 275 * i, 0, 275, 398);
        });

        message.channel.send({
            file: canvas.toBuffer()
        });
    };

    return out;
};