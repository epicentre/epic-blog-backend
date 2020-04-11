const errorHandler = (err, req, res, next) => {
  let statusCode = err.statusCode || 500;
  let code = err.code || null;
  let message = err.message || "Server Error";

  // MongoError
  if (err.name === 'MongoError') {

  }

  res.status(statusCode).send({
    error: {
      code, message
    }
  });
}

module.exports = errorHandler;