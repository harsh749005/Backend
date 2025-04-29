const mongoose = require('mongoose');

// Connect to MongoDB
mongoose.connect('mongodb://127.0.0.1:27017/Account');

// Define the schema for the user model

const AccountSchmena = mongoose.Schema({
    name: String,
    email: String,
    password: String
})

// Create the User model

const Account = mongoose.model('account', AccountSchmena);

// Export the User model

module.exports = Account;

// const account = new Account({
//     name: 'John Doe',
//     email: 'johndoe@example.com',
//     password: 'password123'
// })