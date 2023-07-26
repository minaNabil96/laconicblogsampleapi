const globalErrorHandler = function (err,req,res,next) {

  err.statusCode = err.statusCode || 500;
  err.status = err.status || "error";
  err.errmessage = err.message;
  // render the error page
  res.status(err.statusCode);
  res.json({
    error: err,
    status: err.status,
    statusCode: err.statusCode,
    message: err.message,
    stack: err.stack,
  });
}


module.exports = globalErrorHandler;
