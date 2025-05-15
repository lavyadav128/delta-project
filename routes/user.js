const express = require("express");
const router=express.Router();
const User=require("../models/user.js");
const wrapAsync=require("../utils/wrapAsync");
const passport=require("passport");
const {saveRedirectUrl}=require("../middleware.js");

const userController=require("../controllers/user.js");


router.route("/signup")                                //Calls userController.rendersignupform   Renders the signup form (signup.ejs)
.get(userController.rendersignupform)                   //Handles form submission.     
                                                      //  wrapAsync() is a utility to catch errors from async functions (no need for try/catch in routes).
.post(wrapAsync(userController.signup))               // Calls userController.signup, which:  Registers a new user    Logs them in      Redirects to /listings


router.route("/login")
.get(userController.renderloginform)                  //Calls userController.renderloginform      Renders the login page (login.ejs)
.post(saveRedirectUrl,passport.authenticate("local",{                //saveRedirectUrl middleware     Saves the URL the user originally wanted (e.g., /listings/new)     
    failureRedirect:"/login",                                        //Stores it in req.session.returnTo, then moves it to res.locals.redirectUrl for use in the controller.
    failureFlash:true,
}),                                                      //Uses Passport.js to verify username/password.  If login fails:   Redirects to /login    Shows a flash error message    If login succeeds:    Proceeds to userController.login     userController.login
);

router.get("/logout",userController.logout);                //userController.login    Flashes success message     Redirects to either the original protected page or /listings


module.exports=router;