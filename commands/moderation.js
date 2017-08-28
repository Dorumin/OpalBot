module.exports.kick = {};
module.exports.ban = {};

module.exports.kick.kick = (message, content, lang, i18n) => {
    var user = message.mentions.users.filter(u => u.id != client.user.id).first();
    if (!user) {
        message.channel.send(i18n.msg('no-mention', 'kick', lang));
        return;
    }
    var guild_user = message.guild.members.find(member => member.user.id == user.id),
    reason = reason.replace(`<@${user.id}>`, '').trim();
    if (!guild_user.kickable) {
        message.channel.send(i18n.msg('cannot-kick', 'kick', user.username, lang));
        return;
    }
    message.channel.send(i18n.msg('kicking' + (reason ? 'with-reason' : ''), 'kick', user.username, reason, lang));
    guild_user.kick(reason).then(() => {
        message.channel.send(i18n.msg('success', 'kick', user.username, lang));
    }).catch(err => {
        message.channel.send(i18n.msg('failure', 'kick', user.username, err, lang));
        console.log('Error (commands.admin.kick):', err);
    });
};

module.exports.ban.ban = (message, content, lang, i18n) => {
    var user = message.mentions.users.filter(u => u.id != client.user.id).first();
    if (!user) {
        message.channel.send(i18n.msg('no-mention', 'ban', lang));
        return;
    }
    var guild_user = message.guild.members.find(member => member.user.id == user.id),
    split = reason.replace(`<@${user.id}>`, '').trim().split('|'),
    days = split[0].trim(),
    reason = split.slice(1).join('|').trim(),
    ban;
    if (!guild_user.bannable) {
        message.channel.send(i18n.msg('cannot-ban', 'ban', user.username, lang));
        return;
    }
    if (reason && !isNaN(days)) {
        message.channel.send(i18n.msg('banning', 'ban', user.username, lang));
        ban = guild_user.ban({
            days: Number(days),
            reason: reason
        });
    } else {
        ban = guild_user.ban(isNaN(days) ? days : Number(days));
    }
    ban.then(() => {
        message.channel.send(
            i18n.msg('success', 'ban', user.username, lang) +
            (days && !isNaN(days) ? '\n' + i18n.msg('deleted-since', 'ban', days, lang) : '') + 
            (reason || isNaN(days) ? '\n' + i18n.msg('reason', 'ban', reason || days, lang) : '')
        );
    }).catch(err => {
        message.channel.send(i18n.msg('failure', 'ban', user.username, err, lang));
        console.log('Error (commands.admin.ban):', err);
    });
};

module.exports.ban.unban = async (message, content, lang, i18n) => {
    if (!content) {
        message.reply(i18n.msg('no-name', 'unban', lang));
        return;
    }
    var split = content.split('#'),
    name = split[0],
    id = split[1],
    bans = await message.guild.fetchBans(),
    filtered = bans.filter(n => n.username == name && (id ? n.discriminator == id : true));
    if (!filtered.size) {
        message.reply(i18n.msg('no-matches' + (id ? 'with-discriminator' : ''), 'unban', name, id, lang));
    } else if (filtered.size == 1) {
        message.guild.unban(filtered.first()).then(user => {
            message.channel.send(i18n.msg('success', 'unban', user.username, lang));
        }).catch(err => {
            message.channel.send(i18n.msg('failure', 'unban', username, err, lang));
            console.log('Error (commands.admin.ban):', err);
        });
    } else {
        var users = [];
        filtered.forEach(n => users.push(n));
        message.channel.send(i18n.msg('multiple-matches', 'unban', users.join(' '), lang));
    }
};