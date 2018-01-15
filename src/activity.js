const config = require('./config.js'),
activities = typeof config.activities == 'string' ? JSON.parse(config.activities) : config.activities,
next_activity = (OpalBot, i = -1) => {
    const activity = activities[++i];
    OpalBot.client.user.setActivity(activity.name, {
        url: activity.url,
        type: activity.type
    });
    setTimeout(() => next_activity(OpalBot, i), activity.duration || 15 * 60 * 1000);
};

module.exports = next_activity;