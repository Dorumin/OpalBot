const got = require('got');

module.exports = (OpalBot) => {
    const out = {};
    //note: 'v3' and 'nekoapi_v3.1' are not included due to not serving images, 'smallboobs' is not including due to the only image its serving is a 404 image.
    const sfw = ['meow', '8ball', 'lizard', 'goose'];
    const nsfw = [...sfw, 'femdom', 'classic', 'erok', 'les', 'hololewd', 'lewdk', 'keta', 'feetg', 'nsfw_neko_gif', 'kuni', 'tits', 'pussy_jpg', 'cum_jpg', 'pussy', 'lewdkemo', 'lewd', 'cum', 'spank', 'Random_hentai_gif', 'nsfw_avatar', 'boobs', 'feet', 'solog', 'bj', 'yuri', 'trap', 'anal', 'blowjob', 'hentai', 'futanari', 'solo', 'pwankg', 'erofeet', 'eroyuri', 'ero', 'eron', 'erokemo', 'holoero', 'wallpaper', 'tickle', 'poke', 'kiss', 'slap', 'cuddle', 'avatar', 'fox_girl', 'hug', 'pat', 'smug', 'kemonomimi', 'holo', 'woof', 'baka', 'feed', 'neko', 'waifu', 'gecg', 'gasm'];

    out.peasants = {};
    out.peasants.nl = 'view';
    out.peasants.viewer = 'view';
    out.peasants.view = async (message, content, lang) => {
        const lc = content.toLowerCase();

        if (!content || !nsfw.includes(lc)) {
            message.channel.send(`Options are \`${(message.channel.nsfw ? nsfw : sfw).join(', ')}\`.`);
            return;
        }

        if (!message.channel.nsfw && !sfw.includes(lc)) {
            message.channel.send('This is not a NSFW channel, so you can\'t view NSFW images here!');
            return;
        }

        const { body } = await got('https://nekos.life/api/v2/img/' + encodeURIComponent(content), { json: true });

        if (body && body.url) {
            message.channel.send(body.url);
        }
    };

    return out;
};
