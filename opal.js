process.on('uncaughtException', function (exception) {
    console.log(exception);
});

module.exports = require('./src/startup.js');