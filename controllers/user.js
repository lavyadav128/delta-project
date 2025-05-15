const Listing=require("../models/listing");
const User=require("../models/user");


module.exports.rendersignupform=(req,res)=>{              //Renders the signup form (HTML view: views/users/signup.ejs).
    res.render("users/signup.ejs");                         // Triggered by a GET route like /signup.
};




module.exports.signup=async(req,res)=>{                                 //Extracts username, email, and password from the form submission.
    try{                                                                //Creates a new User object.
        let{username,email,password}=req.body;                          // Registers the user using User.register(), which Hashes and salts the password. Saves the user to MongoDB.
        const newUser=new User({email,username});                       // Automatically logs in the user via req.login().
        const registeredUser=await User.register(newUser,password);     //On success, flashes a success message and redirects to /listings.
        console.log(registeredUser);                                    //On error (e.g., duplicate email), flashes the error and redirects back to /signup.
        req.login(registeredUser,(err)=>{
            if(err){
                return next(err);
            }
            req.flash("success","Welcome to Wanderlust");
            res.redirect("/listings");
        });
    }catch(e){
        req.flash("error",e.message);
        res.redirect("/signup");
    }
};




module.exports.renderloginform=(req,res)=>{                //Renders the login form (HTML view: views/users/login.ejs).
    res.render("users/login.ejs");
};



module.exports.login=async(req,res)=>{                      //This is called after successful login (via Passport middleware in the route).
    req.flash("success","Welcome back to Wanderlust");          //Displays a flash message and redirects the user:
    let redirectUrl=res.locals.redirectUrl|| "/listings";           //Either to a URL stored in res.locals.redirectUrl (if they were trying to access a protected route before login), or
    res.redirect(redirectUrl);
}


module.exports.logout=(req,res,next)=>{                     //Logs the user out using req.logout(), which is asynchronous in Passport 0.6+.
    req.logout((err)=>{                                     //On success, flashes a logout message and redirects to /listings.
        if(err){                                            //On error, passes the error to next().
            return next(err);
        }
        req.flash("success","you are logged out!");
        res.redirect("/listings");
    });
}