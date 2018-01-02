window.data = {};

window.data.en = {};

window.data.en.commands = {};

window.data.en.commands.utility = [
    {
        name: 'avatar',
        desc: 'Fetches the avatar of an user',
        aliases: ['avi', 'a'],
        usage: 'opal!avatar [@user]',
        description: 'Fetches the avatar of the user mentioned, or the user who executed the command.'
    },
    {
        name: 'hello',
        desc: 'Says hello to an user',
        aliases: ['hey', 'hi'],
        usage: 'opal!hello [@user]',
        description: 'Greets the user who executed the command or the user mentioned.'
    },
    {
        name: 'ping',
        desc: 'Posts ping between the bot and discord',
        aliases: ['pong'],
        usage: 'opal!ping',
        description: 'Calculates latency between Discord servers and the bot client.'
    },
    {
        name: 'prefix',
        desc: 'Allows to manipulate guild prefixes',
        aliases: ['prefixes'],
        usage: 'opal!prefix <list|add|remove> [prefix]',
        description: 'Adds or removes the selected prefix.\n\nLists guild prefixes by default.'
    },
    {
        name: 'runtime',
        desc: 'Shows bot uptime',
        aliases: ['uptime'],
        usage: 'opal!runtime',
        description: 'Shows how long the bot client has been running.'
    },
    {
        name: 'test',
        desc: 'Exactly what you think it does',
        aliases: ['status'],
        usage: 'opal!test',
        description: 'Confirms the bot is online.'
    },
    {
        name: 'dice',
        desc: 'Simulates a dice throw',
        aliases: ['d'],
        usage: 'opal!dice [sides<int>] [dice<int>]',
        description: 'Throws dice. First argument decides how many sides the dice has, the second how many dice to throw.'
    },
    {
        name: 'choose',
        desc: 'Chooses one of the supplied elements',
        aliases: ['pick'],
        usage: 'opal!choose option1|option2[...|optionN]',
        description: 'Picks one of the supplied elements, delimited by the characters ";" and "|".'
    },
    {
        name: 'coin',
        desc: 'Flips a coin',
        aliases: ['flip', 'coinflip'],
        usage: 'opal!coin',
        description: 'Chooses one of either heads or tails pseudo-randomly.'
    },
    {
        name: 'youtube',
        desc: 'Searches youtube videos',
        aliases: ['yt'],
        usage: 'opal!youtube query(required)',
        description: 'Searches YouTube for videos with the specified query string.\n\nCan be prefixed with --dl to automatically convert it to mp3'
    },
    {
        name: 'mp3',
        desc: 'Converts youtube videos to mp3',
        aliases: ['download', 'dl'],
        usage: 'opal!mp3 <url|id>(required) [--start duration] [--end duration]',
        description: 'Converts a youtube video to the mp3 format.\n\nOptionally, it takes start and end arguments to define where the file should begin and end playing.'
    },
    {
        name: 'seen',
        desc: 'Says last time someone was online',
        aliases: ['s'],
        usage: 'opal!seen @user(required)',
        description: 'Replies with the last time the supplied was seen by the bot.'
    },
    {
        name: 'imagesearch',
        desc: 'Provides a link to google image search',
        aliases: ['ris', 'reverseimagesearch', 'reverse'],
        usage: 'opal!imagesearch <@user|url>(required)',
        description: 'Gives a link to a direct image search query with the mentioned user\'s avatar, or the url provided.'
    }
];