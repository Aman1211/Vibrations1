const http=require("http");
const express=require("express");
const multer=require("multer");
var cors = require('cors')

const body_parser=require("body-parser");
const authRouter=require('./routes/auth');
const homeRouter=require('./routes/home');
const forgotRouter=require("./routes/forgot");
const adminRouter=require("./routes/event");
const ExpenseRouter=require("./routes/expense");
const FundRouter=require("./routes/fund");
const RequestRouter=require("./routes/requests");
const ExpenseRouterd=require("./routes/design");
const ExpenseRouteri=require("./routes/ict");
const FeedRouter=require("./routes/feed");
const representRouter=require("./routes/represent");
const MemberRouter=require("./routes/member");
const sponseradmin=require("./routes/admin");
const VolunteerRouter = require("./routes/volunteer"); //added file from scratch by helly
const GoodiesRouter = require("./routes/goodies");
const studentRouter=require("./routes/student")
const FaqRouter = require("./routes/faq");
const path=require("path");
const session=require("express-session");
const app=express();
const flash=require("connect-flash");
const filestorage=multer.diskStorage(
    {
        destination:(req,file,cb)=>{
           cb(null,"public/images");
        },
        filename:(req,file,cb)=>{
            cb(null,file.originalname);
        }
    }
)

const mongoconnect=require("./db").MongoConnect;
app.use(multer({storage:filestorage}).array("upload",2))
app.use(flash());
app.set("view engine","ejs");
app.set("views","views");


app.use(session({secret:"aman",resave:false,saveUninitialized:false}));
app.use(express.static(path.join(__dirname,"views")));
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.static(path.join(__dirname,"/views/admin")));
app.use(express.static(path.join(__dirname,"/views/ict")));
app.use(express.static(path.join(__dirname,"/views/sponser_admin")));
app.use(express.static(path.join(__dirname,"/views/design")));
app.use(express.static(path.join(__dirname,"/views/representation")));
app.use("/images",express.static(path.join(__dirname,"public","images")));
app.use(body_parser.urlencoded({extended:false}));
app.use((req,res,next)=>{
    if(req.session.username)
    {
res.locals.user=req.session.username;
    }
    next();
});





app.use(function(req, res, next) {
    //allow cross origin requests
    res.setHeader("Access-Control-Allow-Methods", "POST, PUT, OPTIONS, DELETE, GET");
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    res.header("Access-Control-Allow-Credentials", true);
    next();
});

app.use(FaqRouter);
app.use(authRouter);
app.use(homeRouter);
app.use(forgotRouter);
app.use(adminRouter);
app.use(ExpenseRouter);
app.use(FundRouter);
app.use(RequestRouter);
app.use(FeedRouter);
app.use(MemberRouter);
app.use(sponseradmin);
app.use(ExpenseRouteri);
app.use(ExpenseRouterd);
app.use(representRouter);
app.use(VolunteerRouter);
app.use(GoodiesRouter);
app.use(studentRouter);
app.use(cors())
mongoconnect(()=>{
    app.listen(3000);
});














