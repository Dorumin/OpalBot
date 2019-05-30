module.exports = (OpalBot) => {
    const out = {};

    out.peasants = {};
    out.peasants.length = 'len';
    out.peasants.len = (message, content) => {
        if (!content) {
            message.channel.send('is a scalie');
            return;
        }

        message.channel.send(content.length);
    };

    return out;
}