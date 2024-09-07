//This code defines and exports a function that wraps an asynchronous route handler to catch any errors that occur during its execution.
//This pattern is commonly used in Express.js to handle asynchronous errors in a clean and efficient way.
module.exports=(fn)=>{             //This makes the function available to be imported in other files.  This is an arrow function that takes a single argument, fn, which is expected to be an asynchronous function 
    return(req,res,next)=>{        //This returns a new middleware function that takes req, res, and next as arguments
        fn(req,res,next).catch(next);     //This executes the passed-in function with req, res, and next as arguments
    }
}