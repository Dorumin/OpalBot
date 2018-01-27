module.exports = (OpalBot) => {
    const out = {},
    i18n = OpalBot.i18n;
    
    out.admin = {};
    out.admin.bulkdelete = 'purge';
    out.admin.batchdelete = 'purge';
    out.admin.purge = async (message, content, lang) => {
        if (isNaN(parseInt(content, 10))) {
            message.reply(i18n.msg('usage', 'purge', lang));
            return;
        }
        let count = parseInt(content, 10) + 2,
        member = message.mentions.users.first() || content.replace(/^\d+/, '').trim(),
        isId = false;
        if (typeof member != 'string') {
            isId = true;
            member = member.id;
        }
        message.channel.send(i18n.msg('loading', 'purge', lang));
        let ids = new Set(),
        messages = await OpalBot.util.getChannelMessages(message.channel, null, coll => {
            let l = coll.filter(model => {
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
            let i = messages.size - count;
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
        let deletionStack = [],
        blocked = OpalBot.unprefixed.push({
            type: 'batchdelete',
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
                        let chunked = OpalBot.util.chunk(messages.array(), 100);
                        for (let chunk of chunked) {
                            await message.channel.bulkDelete(chunk);
                        }
                        deletionStack.forEach(msg => msg.delete());
                        message.channel.send(i18n.msg('deleted', 'purge', messages.size, lang));
                    } catch(e) {
                        console.log(e);
                        message.channel.send(i18n.msg('missing-permissions', 'purge', lang));
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

    return out;
};