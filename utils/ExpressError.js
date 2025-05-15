class ExpressError extends Error{
    constructor(statuscode,message){
        super();
        this.statuscode=statuscode;
        this.message=message;
    }
}

module.exports=ExpressError;



/*class ExpressError extends Error
Creates a custom error class.

Inherits from the native JavaScript Error class.

This allows it to be used like a regular error (throw new ExpressError(...)), but with additional functionality.

🔸 constructor(statuscode, message)
This method runs automatically when a new ExpressError is created.

Takes two arguments:

statuscode → The HTTP status code (e.g. 404, 400, 500)

message → The error message to show or log

🔸 super()
Calls the parent class (Error) constructor.

Initializes the error's internal properties like the stack trace.

🔸 this.statuscode = statuscode
Adds a custom property statuscode to the error instance.

Used later in middleware to set the correct HTTP response status.

🔸 this.message = message
Overwrites the default message property set by Error.

Stores the custom error message.

*/