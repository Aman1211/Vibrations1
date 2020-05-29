const express=require("express");
const router=express();
const mongodb=require("mongodb");
const getdb=require("../db").getdb;


router.get("/view_Feedback",(req,res,next)=>{
    if(req.session.username)
    {
            const db=getdb();
            db.collection("QueryFeed").aggregate([{$match:{status:'0'}},{$lookup:{from:"Student",localField:"Student_id",foreignField:"_id","as":"data"}}]).toArray((err,data1)=>{
                
                res.render("admin/show/view_Feedback",{
                        info:data1
                    })
                
                })

    }
    else
    {
        res.redirect("/login");
    }
})

router.get("/view_Query",(req,res,next)=>{
    if(req.session.username)
    {
           const db=getdb();
           db.collection("QueryFeed").aggregate([{$match:{status:'1',ans_status:'0'}},{$lookup:{from:"Student",localField:"Student_id",foreignField:"_id","as":"data"}}])
           .toArray((err,data1)=>{
              
               res.render("admin/show/view_Query",{
                   info:data1
               })
           })
    }
    else
    {
        res.redirect("/login");
    }
})

router.get("/reply_Query",(req,res,next)=>{
    if(req.session.username)
    {
            res.render("admin/add/reply_Query");
    }
    else
    {
        res.redirect("/login");
    }
});

router.post("/reply_Query",(req,res,next)=>{
    const reply=req.body.reply;
    const id=mongodb.ObjectID(req.query.id);
     const db=getdb();
     db.collection("QueryFeed").updateOne({_id:id},{$set:{ans_status:'1',reply_string:reply}},(err,data)=>{
         if(err)
         {
             console.log("error");
         }
         else
         {
             res.redirect("/view_Query");
         }
     })

})






module.exports=router;

