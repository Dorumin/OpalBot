module.exports = (OpalBot) => {
    const out = {};

    out.reverse = 'imagesearch';
    out.ris = 'imagesearch';
    out.reverseimage = 'imagesearch';
    out.imagesearch = (message) => {
        let user = message.mentions.users.first(),
        url = user ? user.displayAvatarURL : message;

        message.channel.send({
            embed: {
                color: OpalBot.color,
                title: i18n.msg('title', 'imagesearch', lang),
                image: {
                    url: url
                },
                description: i18n.msg('description', 'imagesearch', lang)
            }
        });
    };
};