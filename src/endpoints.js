// Welcome to the backend. We have cookies, but please don't leave, we're not that ugly.

module.exports = (OpalBot) => {
    OpalBot.registerEndpoint('kill', async (req, res) => {
        const id = req.query.guild,
        guild = OpalBot.client.guilds.get(id),
        user = res.locals.user,
        user_guild = user ? user.guilds.find(g => g.id == id) : null;
        if (!id) {
            res.status(400).send('No guild ID provided.');
        } else if (!user) {
            res.status(401).send('You need to be logged in in order to use this endpoint.');
        } else if (!user_guild) {
            res.status(403).send('You are not a part of the guild provided.');
        } else if (!user_guild.admin) {
            res.status(403).send('You are not an administrator in the guild provided.');
        } else if (!guild) {
            res.status(500).send('The bot is not a member of the guild provided.');
        } else {
            try {
                const channel = OpalBot.util.get_default_channel(guild),
                lang = await OpalBot.util.getGuildLanguage(guild);
                await channel.send(OpalBot.i18n.msg('on-leave', 'main', `<@!${user.id}>`, lang));
            } catch(e) {}
            try {
                await guild.leave();
                res.status(200).send('Successfully left guild.');
            } catch(e) {
                res.status(500).send('Something went wrong while leaving guild.');
            }
        }
    });
}