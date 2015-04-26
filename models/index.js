/**
 * Exports all models
 * @author Yogesh Joshi <iyogeshjoshi@gmail.com>
 */
var mongoose = require('mongoose');
mongoose.connect('localhost', 'webServerMonitor');

var User = require('./User')(mongoose);

module.exports = {
  User: User,
};
