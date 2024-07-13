const mongoose = require("mongoose");

exports.connectDB = async () => {
  mongoose.set("strictQuery", false);
  await mongoose
    .connect(process.env.MONGO_URI, {
      dbName: "Mailboxninja",
    })
    .then((e) => console.log(`DB connected  ${e.connection.host}`))
    .catch((e) => console.log(`Some error occured => ${e}`));
};
