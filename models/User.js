/**
 * User model
 * @author Yogesh Joshi <iyogeshjoshi@gmail.com>
 */
var Mongoose = require('mongoose');
var Schema = Mongoose.Schema;

var userSchema = new Schema({
  username: { type: String, unique: true},
  password: String,
  commands: [
    {
      command: String,
      output: String
    }
  ]
})

module.exports = function(mongoose) {
  return mongoose.model('User', userSchema);
};
