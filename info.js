const mongoose = require("mongoose");
const DetailsSchema = mongoose.Schema({
  FirstName: String,
  MiddleName: String,
  LastName: String,
  EmailId: String,
  Age: Number,
  Degree: String,
  Branch: String,
  CollegeName: String,
  NativePlace: String,
  author: {
    id: {
      type: mongoose.Schema.Types.ObjectId,
      default: null,
      ref: "User"
    },
    username: String
  }
});
module.exports = mongoose.model("Detail", DetailsSchema);
