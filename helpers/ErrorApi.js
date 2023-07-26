class ErrorApi extends Error {
	constructor(message,statusCode) {
		super(message)
		this.statusCode = statusCode
		this.message = message
		this.status = `${statusCode}`.startsWith(4) ? "fail" : "error";
		this.isOperational = true
	}
	
	 finalCatchError(error, finalCatchErrorStatus) {
    this.finalCatchErrorMessage = error.message;
    this.finalCatchErrorStatus = finalCatchErrorStatus;
    this.finalCatchErrorStack = error.stack;
  }
}


module.exports = ErrorApi