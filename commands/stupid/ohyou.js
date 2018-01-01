const Canvas = require('canvas'),
Image = Canvas.Image,
request = require('request').defaults({ encoding: null }),
fs = require('fs');

module.exports = (OpalBot) => {
    const out = {},
    i18n = OpalBot.i18n;
    
    out.peasants = {};
    out.peasants.ohyou = (message, content, lang) => {
        let iter = message.mentions.users.values(),
        users = [
            iter.next().value || OpalBot.client.user,
            iter.next().value || message.author
        ].map(user => user.displayAvatarURL);
        fs.readFile('www/img/ohyou.png', (err, buf) => {
            if (err) {
                message.channel.send(i18n.msg('error', 'ohyou', lang));
                return;
            }
            let canvas = new Canvas(600, 456),
            img = new Image(),
            ctx = canvas.getContext('2d');
            img.src = buf,
            coords = [{
                x: 39,
                y: 254,
                w: 153
            }, {
                x: 379,
                y: 49,
                w: 173
            }];
            Promise.all(users.map(url => {
                return new Promise((res, rej) => {
                    request(url, (err, r, buffer) => {
                        if (err) {
                            rej(err);
                            return;
                        }
                        res(buffer);
                    });
                })
            })).then(buffs => {
                buffs.forEach((buff, i) => {
                    var image = new Image(),
                    coord = coords[i]
                    image.src = buff;
                    ctx.drawImage(image, coord.x, coord.y, coord.w, coord.w);
                });
                ctx.drawImage(img, 0, 0, img.width, img.height);
                message.channel.send({
                    file: canvas.toBuffer()
                });
            });
        });
    };

    return out;
};