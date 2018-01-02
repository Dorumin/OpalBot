module.exports = (OpalBot) => {
    const out = {},
    i18n = OpalBot.i18n;

    out.peasants = {};
    out.peasants.reverse = 'imagesearch';
    out.peasants.ris = 'imagesearch';
    out.peasants.reverseimage = 'imagesearch';
    out.peasants.imagesearch = (message, content, lang) => {
        let user = message.mentions.users.first(),
        url = user ? user.displayAvatarURL : content.trim().replace(/^<|>$/, '');

        message.channel.send({
            embed: {
                color: OpalBot.color,
                title: i18n.msg('title', 'imagesearch', lang),
                url: 'https://www.google.com/searchbyimage?image_url=' + encodeURIComponent(url),
                image: {
                    url: url
                },
                description: i18n.msg('description', 'imagesearch', lang)
            }
        }).catch(() => {
            message.reply(i18n.msg('invalid', 'imagesearch', lang)).catch(OpalBot.util.log);
        });
    };

    return out;
};