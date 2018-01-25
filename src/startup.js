const OpalBot = require('./static.js');

require('./i18n.js')(OpalBot);
require('./util.js')(OpalBot);
require('./commands.js')(OpalBot);
require('./database.js')(OpalBot);
require('./discord.js')(OpalBot);
require('./server.js')(OpalBot);
require('./ready.js')(OpalBot);

module.exports = OpalBot;