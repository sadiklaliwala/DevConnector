const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const userSchema = new Schema({
    name: {
        type: String,
        // required: true
    },
    // email:{
    //     type:String,
    //     required:true
    // },

    email: {
        type: String,
        required: function () {
            return !this.googleId && !this.githubId; // email is required only for local
        },
        unique: true,
        lowercase: true
    },

    // password:{
    //     type:String,
    //     required:true
    // },

    // Local strategy
    password: {
        type: String,
        required: function () {
            return !this.googleId && !this.githubId; // password is required only for local
        }
    },

    // OAuth providers
    googleId: { 
        type: String, 
        unique: true, 
        sparse: true 
    },

    githubId: { 
        type: String, 
        unique: true, 
        sparse: true 
    },

    avatar: {
        type: String,
    },
    date: {
        type: Date,
        default: Date.now
    },
});

module.exports = mongoose.model('User', userSchema);