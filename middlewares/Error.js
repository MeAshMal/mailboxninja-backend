const errorMiddleware = (err, req, res, next) => {
  err.message = err.message || "Internal Server Error";
  err.statusCode = err.statusCode || 400;

  res.status(err.statusCode).json({
    success: false,
    message: err.message,
  });
};
module.exports = errorMiddleware;
