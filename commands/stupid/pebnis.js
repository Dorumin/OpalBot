module.exports = (OpalBot) => {
    const out = {};

    out.peasants = {};
    out.peasants.penis = 'pebnis';
    out.peasants.pebnis = (message) => {
        const perpetrator = message.mentions.users.first() || message.author,
        length = perpetrator.id % 30,
        trunk = new Array(length + 1).join('=');

        message.channel.send(`${perpetrator}'s pebnis is ${length}cm!\n8${trunk}D`);
    };

    return out;
}