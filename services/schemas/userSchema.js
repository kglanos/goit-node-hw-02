const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const bcrypt = require('bcryptjs');
const gravatar = require('gravatar');

const user = new Schema({
    password: {
    type: String,
    required: [true, 'Password is required'],
    },
    email: {
        type: String,
            required: [true, 'Email is required'],
            unique: true,
    },
    subscription: {
        type: String,
            enum: ["starter", "pro", "business"],
            default: "starter"
    },
    token: {
        type: String,
        default: null,
    },
    avatarUrl: {
        type: String,
        default: function() {
            return gravatar.url(this.email, { protocol: 'https', s: '200' });
        },
    },
    verify: {
        type: Boolean,
        default: false,
    },
    verificationToken: {
        type: String,
        required: [true, 'Verify token is required'],
    },
});

user.methods.setPassword = function(password) {
    this.password = bcrypt.hashSync(password, bcrypt.genSaltSync(6));
};

user.methods.validPassword = function(password) {
    return bcrypt.compareSync(password, this.password);
};

const User = mongoose.model('user', user);

module.exports = { User };