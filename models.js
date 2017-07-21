var mongoose = require('mongoose');

var User = mongoose.model('User', {
  username: String, //TODO: figure this out in comparison to given ._id
  receipts: [
    {
      image: String, // TODO: Do I actually need this?
      plainText: [
        {
          line: String
        }
      ],
      date: String,
      amount: Integer,
      address: String
    }
  ]
})

module.exports={
  User: User
}
