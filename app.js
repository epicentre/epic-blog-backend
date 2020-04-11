const express = require("express");
const cors = require("cors");
const morgan = require("morgan");
const mongoose = require("mongoose");
const { APP_PORT, MONGODB_URL } = require("./config");
const apiRoutes = require("./routes");
const errorHandler = require("./middleware/error");

const app = express();

app.use(cors());
app.use(morgan("combined"));
app.use(express.json());
// app.use(express.urlencoded({ urlencoded: true}));

mongoose
  .connect(MONGODB_URL, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useCreateIndex: true,
  })
  .then(() => {
    console.log('Db connected successfully');
  })
  .catch((err) => {
    console.log('Error connecting db', err);
    process.exit(1);
  });

app.use("/", apiRoutes);

// Error handler
app.use(errorHandler);

/// 404
app.use(function (req, res, next) {
  res.status(404).json({
    error: {
      code: 404,
      message: "Not Found",
    },
  });
});

app.listen(APP_PORT, function () {
  console.log("Listening on port " + APP_PORT);
});
