const chunk = (array, maxlen) => {
    const final = [''],
    current = 0;

    for (let i = 0; i < array.length; i++) {
        const item = array[i];
        if (item.length > maxlen) return;
        if ((item[current] + item).length > maxlen) {
            current++;
            final[current] = item;
        } else {
            final[current] += item;
        }
    }

    return final;
};

const escape = str => str.replace(/`/g, '\\`');

const pad = n => ('0' + n).slice(-2);

const date = d => `${pad(d.getUTCDate())}/${pad(d.getUTCMonth() + 1)}/${pad(d.getUTCFullYear())} ${pad(d.getUTCHours())}:${pad(d.getUTCMinutes())}`;

module.exports = (OpalBot) => {
    const out = {};
    
    out.messages = {};
    out.messages.pinpilation = 'pindump';
    out.messages.pindump = async (message, content, lang) => {
        const pins = await message.channel.fetchPinnedMessages();

        if (!pins.size) {
            message.channel.send(OpalBot.i18n.msg('no-pins', 'pindump', lang));
            return;
        }

        const pieces = pins.map(message => {
            const content = message.content.trim()
                ? '```' + escape(message.author.username) + ' - ' + date(message.createdAt) + '\n' + escape(message.content) + '```'
                :
                message.embeds.length
                    ? '```<embed>```'
                    : '\n';
            return content
                + message.attachments.map(attachment => attachment.url + '\n').join('')
                + ` > <https://discordapp.com/channels/${message.guild.id}/${message.channel.id}/${message.id}>`;
        });
        const chunked = chunk(pieces.reverse(), 2000);
        const links = [];

        for (let i = 0; i < chunked.length; i++) {
            const compilation = await message.channel.send(chunked[i]);
            links.push(`<https://discordapp.com/channels/${compilation.guild.id}/${compilation.channel.id}/${compilation.id}>`);
        }

        message.channel.send(OpalBot.i18n.msg('compilation', 'pindump', links.length, lang) + '\n' + links.join('\n'));
    };

    return out;
}