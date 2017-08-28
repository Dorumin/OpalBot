module.exports.admin = {};

module.exports.admin.prune = async (message, content, lang, i18n, OpalBot) => {
    var count;
    if (!content) {
        content = 7;
    } else if (isNaN(count = parseInt(content, 10))) {
        message.reply(i18n.msg('invalid', 'prune', lang));
        return;
    } else if (count == 0) {
        message.reply(i18n.msg('non-zero', 'prune', lang));
        return;
    }
    try {
        var pruned = await message.guild.pruneMembers(count, true);
    } catch(e) {
        message.channel.send(i18n.msg('missing-permissions', 'prune', lang));
        return;
    }
    if (!pruned) {
        message.reply(i18n.msg('lonely', 'prune', lang));
        return;
    }
    var blocked = OpalBot.unprefixed.push({
        type: 'prune',
        triggers: [
            i18n.msg('confirm', 'main', lang),
            i18n.msg('cancel', 'main', lang)
        ],
        user: message.author.id,
        channel: message.channel.id,
        caseinsensitive: true,
        timeout: 30000,
        callback: async (message, index) => {
            if (index == 0) { // confirm
                try {
                    message.channel.send(i18n.msg('pruning', 'prune', lang));
                    var pruned = await message.guild.pruneMembers(count);
                    message.channel.send(i18n.msg('pruned', 'prune', pruned, lang));
                } catch(e) {
                    message.channel.send(i18n.msg('missing-permissions', 'prune', lang));
                }
            } else { // cancel
                message.channel.send(i18n.msg('cancelled', 'prune', lang));
            }
        },
        ontimeout: () => {
            message.channel.send(i18n.msg('timed-out', 'prune', lang));
        }
    });
    if (blocked === true) {
        message.channel.send(i18n.msg('blocked', 'prune', lang));
    } else {
        message.channel.send(i18n.msg('prompt', 'prune', pruned, lang));
    }
};

module.exports.admin.bulkdelete = 'purge';
module.exports.admin.purge = async (message, content, lang, i18n, OpalBot) => {
    if (isNaN(parseInt(content, 10))) {
        message.reply(i18n.msg('usage', 'purge', lang));
        return;
    }
    var count = parseInt(content, 10) + 2,
    member = message.mentions.users.first() || content.replace(/^\d+/, '').trim(),
    isId = false;
    if (typeof member != 'string') {
        isId = true;
        member = member.id;
    }
    message.channel.send(i18n.msg('loading', 'purge', lang));
    var ids = new Set(),
    messages = await OpalBot.util.getChannelMessages(message.channel, null, coll => {
        var l = coll.filter(model => {
            return member ? (isId ? model.author.id == member : model.author.username + '#' + model.author.discriminator == member) : true;
        }).size;
        if (l > count) return true;
    });
    messages = messages.filter(model => {
        return member ? (isId ? model.author.id == member : model.author.username + '#' + model.author.discriminator == member) : true;
    });
    if (!messages.size) {
        message.channel.send(i18n.msg('no-messages', 'purge', lang));
        return;
    } else if (messages.size > count) {
        var i = messages.size - count;
        while (i--) {
            messages.delete(messages.lastKey());
        }
    }
    messages = messages.filter(msg => msg.deletable); // This is done separately to the main .filter to provide a helpful error message
    if (!messages.size) {
        message.channel.send(i18n.msg('missing-permissions', 'purge', lang));
        return;
    }
    messages.forEach(model => ids.add(model.author.id));
    var deletionStack = [],
    blocked = OpalBot.unprefixed.push({
        type: 'akinator',
        triggers: [
            i18n.msg('confirm', 'main', lang),
            i18n.msg('cancel', 'main', lang)
        ],
        user: message.author.id,
        channel: message.channel.id,
        caseinsensitive: true,
        timeout: 30000,
        callback: async (message, index) => {
            if (index == 0) { // confirm
                try {
                    deletionStack.push(message, await message.channel.send(i18n.msg('deleting', 'purge', lang)));
                    for (var msg of messages.values()) {
                        await msg.delete();
                    }
                    deletionStack.forEach(msg => msg.delete());
                    message.channel.send(i18n.msg('deleted', 'purge', messages.size, lang));
                } catch(e) {
                    message.channel.send(i18n.msg('missing-permissions', 'purge', lang));
                    console.log(e);
                }
            } else { // cancel
                message.channel.send(i18n.msg('cancelled', 'purge', lang));
            }
        },
        ontimeout: () => {
            message.channel.send(i18n.msg('timed-out', 'purge', lang));
        }
    });
    if (blocked === true) {
        message.channel.send(i18n.msg('blocked', 'purge', lang));
    } else {
        deletionStack.push(await message.channel.send(i18n.msg('prompt', 'purge', messages.size, ids.size, lang)));
    }
};