const mongoose = require('mongoose');
const User = require('./User');

const contactSchema = new mongoose.Schema({
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    name: { type: String, required: true },
    phone: { type: String, required: true }
});

module.exports = mongoose.model('Contact', contactSchema);
