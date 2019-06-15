module.exports = (OpalBot) => {
    const out = {};

    out.peasants = {};
    out.peasants.penis = 'pebnis';
    out.peasants.pebnis = (message) => {
        const length = message.author.id % 30,
        trunk = new Array(length + 1).join('=');

        message.channel.send(`${message.author}'s pebnis is ${length}cm!\n8${trunk}D`);
    };

    return out;
}