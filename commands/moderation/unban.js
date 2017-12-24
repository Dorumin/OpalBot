module.exports = (OpalBot) => {
    const out = {},
    i18n = OpalBot.i18n;
    
    out.ban = {};
    out.ban.unban = async (message, content, lang) => {
        if (!content) {
            message.reply(i18n.msg('no-name', 'unban', lang)).catch(OpalBot.util.log);
            return;
        }
        let split = content.split('#'),
        name = split[0],
        id = split[1],
        bans = await message.guild.fetchBans(),
        filtered = bans.filter(n => n.username == name && (id ? n.discriminator == id : true));
        if (!filtered.size) {
            message.reply(i18n.msg('no-matches' + (id ? 'with-discriminator' : ''), 'unban', name, id, lang)).catch(OpalBot.util.log);
        } else if (filtered.size == 1) {
            message.guild.unban(filtered.first()).then(user => {
                message.channel.send(i18n.msg('success', 'unban', user.username, lang)).catch(OpalBot.util.log);
            }).catch(err => {
                message.channel.send(i18n.msg('failure', 'unban', username, err, lang)).catch(OpalBot.util.log);
                OpalBot.util.log('Error (commands.admin.ban):', err);
            });
        } else {
            let users = [];
            filtered.forEach(n => users.push(n));
            message.channel.send(i18n.msg('multiple-matches', 'unban', '`' + users.join('` `') + '`', lang)).catch(OpalBot.util.log);
        }
    };

    return out;
};