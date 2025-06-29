const mongoose = require('mongoose')

const blogSchema = new mongoose.Schema({
    title:    { type: String, required: true },
    content:  { type: String, required: true },
    author:   { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    tags:     [String],
    likes:    [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    comments: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Comment' }],
    isApproved: { type: Boolean, default: true }, 
}, { timestamps: true });

module.exports = mongoose.model('Blog', blogSchema);
