module.exports = (OpalBot) => {
    const out = {},
    i18n = OpalBot.i18n;
    
    out.kick = {};
    out.kick.boot = 'kick';
    out.kick.kick = (message, content, lang) => {
        let user = message.mentions.users.filter(u => u.id != OpalBot.client.user.id).first();
        if (!message.mentions.users.size) {
            message.channel.send(i18n.msg('no-mention', 'kick', lang)).catch(OpalBot.util.log);
            return;
        }
        if (!user) { // Trying to kick the bot. So predictable.
            message.channel.send(i18n.msg('hal-9000', 'kick', message.author, lang)).catch(OpalBot.util.log);
            return;
        }
        if (user.id == message.author.id) {
            message.reply(i18n.msg('masochist', 'kick', lang)).catch(OpalBot.util.log);
            return;
        }
        let guild_user = message.guild.members.find(member => member.user.id == user.id),
        reason = content.replace(`<@${user.id}>`, '').trim();
        if (!guild_user.kickable) {
            message.channel.send(i18n.msg('cannot-kick', 'kick', user.username, lang)).catch(OpalBot.util.log);
            return;
        }
        message.channel.send(i18n.msg('kicking' + (reason ? '-with-reason' : ''), 'kick', user.username, reason, lang)).catch(OpalBot.util.log);
        guild_user.kick(reason).then(() => {
            message.channel.send(i18n.msg('success', 'kick', user.username, lang)).catch(OpalBot.util.log);
        }).catch(err => {
            message.channel.send(i18n.msg('failure', 'kick', user.username, err, lang)).catch(OpalBot.util.log);
            OpalBot.util.log('Error (commands.admin.kick):', err);
        });
    };

    return out;
};