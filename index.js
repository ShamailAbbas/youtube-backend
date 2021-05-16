const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
const bodyParser = require("body-parser");

require("dotenv").config();
const app = express();
const URL = process.env.mongoURL;

const connect = mongoose
  .connect(URL, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log("MongoDB Connected..."))
  .catch((err) => console.log(err));

app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.use(cors());

const videoRouter = require("./routes/video");
app.get("/", (req, res) => {
  res.send("Hello sir");
});
app.use("/video", videoRouter);
app.use("/users", require("./routes/users"));
app.use("/subscribe", require("./routes/subscribe"));
app.use("/comment", require("./routes/comment"));
app.use("/like", require("./routes/like"));

app.use("/uploads", express.static("uploads"));
app.use("uploads/thumbnails", express.static("uploads/thumbnails"));

const port = process.env.PORT || 5000;

app.listen(port, () => {
  console.log(`Server Running at ${port}`);
});
mongoose.set("useFindAndModify", false);
