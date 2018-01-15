const config = require('./config.js'),
activities = typeof config.ACTIVITIES == 'string' ? JSON.parse(config.ACTIVITIES) : config.ACTIVITIES,
next_activity = (OpalBot, i = -1) => {
    if (!activities || !activities.length) return;
    if (activities.length == ++i) {
        i = 0;
    }
    const activity = activities[i];
    OpalBot.util.log('SET ACTIVITY:', activity);
    OpalBot.client.user.setActivity(activity.name, {
        url: activity.url,
        type: activity.type
    });
    setTimeout(() => next_activity(OpalBot, i), activity.duration || 15 * 60 * 1000);
};

module.exports = next_activity;
