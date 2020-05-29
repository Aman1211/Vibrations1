const express=require("express");
const path=require("path");
const router=express();


router.get("/home",(req,res,next)=>{
     res.render('home',{ 
        "username":req.session.username
     });
});



module.exports=router;