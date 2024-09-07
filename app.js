if(process.env.NODE_ENV!="production"){
  require("dotenv").config();
}

const express = require("express");    //A web application framework for Node.js.
const ejsmate=require("ejs-mate");     //A layout manager for EJS, which allows using layouts and blocks.
const app = express();
const mongoose = require("mongoose");   //An ODM (Object Data Modeling) library for MongoDB and Node.js.
const path = require("path");
const methodOverride = require("method-override");   
const ExpressError = require("./utils/ExpressError.js");    //A custom error class.
const session=require("express-session");        //express-session is a middleware for managing sessions in Express.js applications. A session is used to store user data across multiple requests. It can be useful for things like user authentication, shopping carts, and other situations where you need to persist data between different HTTP requests.
const MongoStore=require("connect-mongo");
const flash=require("connect-flash");            //connect-flash is a middleware for providing flash messages. Flash messages are typically used for displaying messages to the user after a redirect, such as success or error messages.
const passport=require("passport");
const LocalStrategy=require("passport-local");
const User=require("./models/user.js");


const listingRouter=require("./routes/listing.js");
const reviewRouter=require("./routes/review.js");
const userRouter=require("./routes/user.js");


const dbUrl = process.env.ATLASDB_URL;

main()         //An asynchronous function to connect to the MongoDB database using Mongoose.
  .then(() => {
    console.log("connected to DB");
  })
  .catch((err) => {
    console.log(err);
  });

async function main() {
  await mongoose.connect(dbUrl);
}



app.set("view engine", "ejs");         // Setting EJS as the templating engine and configuring the views directory.
app.set("views", path.join(__dirname, "views"));
app.use(express.urlencoded({ extended: true }));    //Parses incoming requests with URL-encoded payloads
app.use(methodOverride("_method"));
app.engine("ejs",ejsmate);
app.use(express.static(path.join(__dirname,"/public")));    // Serves static files from the public directory.


const store=MongoStore.create({
  mongoUrl:dbUrl,
  crypto:{
    secret:process.env.SECRET,
  },
  touchAfter:24*3600,
});


store.on("error",()=>{
  console.log("ERROR IN MONGO STORE",err);
})

//In summary, the sessionOptions object is configured to create a session with a secret key for signing, does not resave unchanged sessions, saves uninitialized sessions, and sets the session cookie to expire in 7 days with httpOnly protection.
const sessionOptions={
  store,
  secret:process.env.SECRET,    //This is a string used to sign the session ID cookie. This ensures that the cookie cannot be tampered with on the client-side. It's crucial to keep this secret and secure
  resave:false,                 //This option determines whether the session should be saved back to the session store, even if it was never modified during the request. Setting it to false means the session won't be saved if it hasn't been modified. This can help improve performance by reducing the number of writes to the session store.
  saveUninitialized:true,       //This option controls whether to save a session that is new but hasn't been modified. If set to true, a new session that hasn't been modified will be saved to the session store. This can be useful for implementing login sessions where you might want to create a session for a user as soon as they visit the site, even if they haven't logged in yet
  cookie:{                      //This is an object that defines options for the session cookie. Let's break down its properties:

    expires:Date.now() + 7*24*60*60*1000,    //This sets the expiration date of the cookie to be 7 days from the current time. Date.now() returns the current timestamp in milliseconds, and 7 * 24 * 60 * 60 * 1000 calculates the number of milliseconds in 7 days
    maxAge:7*24*60*60*1000,                  //This sets the maximum age of the cookie in milliseconds. Similar to expires, it specifies that the cookie should last for 7 days. After this period, the cookie will expire and the session will be invalid.
    httpOnly:true,                           //This flag indicates that the cookie should not be accessible via JavaScript running in the browser. This is a security feature that helps prevent cross-site scripting (XSS) attacks by ensuring the cookie is only sent in HTTP requests
  },
};




// app.get("/", (req, res) => {    //Basic route to check if the server is running
//   res.send("Hi, I am root");
// });


//app.use(session(sessionOptions)); sets up session management, allowing you to store and retrieve session data across multiple requests.
//app.use(flash()); sets up flash message support, allowing you to store temporary messages that are available for the next request, typically used for success or error messages.
//These middlewares enhance the user experience by maintaining state (sessions) and providing feedback (flash messages) across different requests and responses in your application
app.use(session(sessionOptions));     //This line is setting up session management for your Express application. Here's how it works in detail:
app.use(flash());  //This line sets up the connect-flash middleware for your Express application. Here’s what it does in detail:




app.use(passport.initialize());          //This line initializes Passport.js. It sets up Passport so that it can be used to handle authentication. This middleware must be used before any routes that require authentication
app.use(passport.session());             //This line is used to enable persistent login sessions. When a user is authenticated, Passport will serialize the user into the session, and on subsequent requests, deserialize the user from the session.
passport.use(new LocalStrategy(User.authenticate()));          //Here, we are using the LocalStrategy provided by Passport.js for authentication. The LocalStrategy is a username and password strategy, meaning it authenticates users using a username and password.
                                                             //new LocalStrategy(User.authenticate()): This creates a new instance of the LocalStrategy and passes User.authenticate() as the authentication method. User.authenticate() is a method provided by the passport-local-mongoose package, which simplifies user authentication in Mongoose (MongoDB).


passport.serializeUser(User.serializeUser());         //Serialization refers to how Passport saves the user’s information in the session. When passport.serializeUser is called, it determines which data of the user object should be stored in the session. The result of the serialization is the user ID, which is then stored in the session.
                                                      //User.serializeUser(): This method provided by passport-local-mongoose serializes the user’s information.

passport.deserializeUser(User.deserializeUser());    //Deserialization is the reverse of serialization. It retrieves the full user object from the session information. When passport.deserializeUser is called, it takes the user ID from the session and retrieves the user information from the database.
                                                      //User.deserializeUser(): This method provided by passport-local-mongoose deserializes the user’s information



//req.flash("success"): This retrieves any flash messages stored under the key "success". Flash messages are temporary and are typically used to show feedback to users (e.g., after form submissions or actions like login/logout).
//res.locals.success: This sets the retrieved flash messages to res.locals.success. The res.locals object contains response local variables scoped to the request, and it is passed to the view when the response is rendered. This means that success messages will be available in your templates (e.g., in EJS, Pug, or any other templating engine).
//req.flash("error"): This retrieves any flash messages stored under the key "error".
//res.locals.error: This sets the retrieved flash messages to res.locals.error, making error messages available in your templates.
//This calls the next middleware function in the stack. It's crucial to call next() in middleware functions to pass control to the next middleware or route handler. Without this, the request will be left hanging and the response will not be sent to the client
app.use((req,res,next)=>{              //This line registers a middleware function in your Express application. This function will run on every incoming request.
  res.locals.success=req.flash("success");
  res.locals.error=req.flash("error");
  res.locals.currUser=req.user;
  next();
});


/*app.get("/demouser",async(req,res)=>{
  let fakeUser=new User({
    email:"student@gmail.com",
    username:"delta-student",
  });

  let registeredUser=await User.register(fakeUser,"helloworld");
  res.send(registeredUser);
})*/


app.use("/listings",listingRouter);
app.use("/listings/:id/reviews",reviewRouter);
app.use("/",userRouter);


app.all("*",(req,res,next)=>{           //Catches any undefined routes and throws a custom error
  next(new ExpressError(404,"Page not found!"));
});


app.use((err,req,res,next)=>{          //Renders an error page with the error details
  let{statuscode=500,message="something went wrong"}=err;
  res.status(statuscode).render("error.ejs",{err});
  //res.status(statuscode).send(message);
});


app.listen(3000, () => {
  console.log("server is listening to port 3000");
});





/*
const express = require("express");    //A web application framework for Node.js.
const app = express();
const review=require("./models/review.js");
const listing=require("./models/listing.js");
const cookieParser=require("cookie-parser");

app.use(cookieParser("secretcode"));

app.get("/getsignedcookie",(req,res)=>{
  res.cookie("made-in","India",{signed:true});
  res.send("signed cookie sent");
});

app.get("verify",(req,res)=>{
  console.log(rew.signedCookies);
  res.send("verified");
});


app.get("/getcookies",(req,res)=>{
  res.cookie("greet","namaste");
  res.cookie("madeIn","India");
  res.send("sent you some cookies!");
});

app.get("/greet",(req,res)=>{
  let{name="anonymous"}=req.cookies;
  res.send(`Hi, ${name}`);
});

app.get("/",(req,res)=>{
  console.dir(req.cookies);
  res.send("Hi,I am root!");
});
*/