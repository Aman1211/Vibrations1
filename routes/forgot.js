const express=require("express");
const getdb=require("../db").getdb;
const router=express();
const nodemailer=require('nodemailer');

const bcrypt=require("bcryptjs");


const transport=nodemailer.createTransport({
service:"gmail",
auth:{
    user:"aman.sharma122111@gmail.com",
    pass:"aman$123"
}
});


router.get("/forgot",(req,res,next)=>{
    res.render("forgot");
});

router.post("/forgot",(req,res,next)=>{
    const min=100;
    const max=1000000;
      req.session.otp= Math.floor(Math.random() * (+max - +min)) + +min; 
       const email=req.body.username;
       req.session.changemail=email;
       transport.sendMail({
        to:email,
        from:"aman.sharma122111@gmail.com",
        subject:"OTP for Resetting the Password",
        text:"Your One Time Password:-"+req.session.otp
         
    });
      res.redirect("/reset");
});


router.get("/reset",(req,res,next)=>{
    res.render("reset",{
        errormessage:req.flash("error1")
    });
});


router.post("/reset",(req,res,next)=>{
    const otp=req.body.otp;
    const pass=req.body.pass;
    const pass1=req.body.pass1;
    const user=req.session.changemail;
    if(otp==req.session.otp && pass==pass1)
    {
         
          bcrypt.hash(pass,12,(err,data)=>{
            const db=getdb();
            const pass=data;
            const updateon={email:user};
            const newval={$set:{password:pass}};
            db.collection("Student").updateOne(updateon,newval,(err)=>{
                if(err)
                {
                    console.log("Error");
                }
                else
                {
                    return res.redirect("/login");
                }
            });
           });
   }
    else
    {
        console.log(otp + " " + pass + "" + pass1);
        req.flash("error1","Invalid Details")
        res.redirect("/reset");
    }


});


module.exports=router;
