const express=require("express");
const router=express();
const mongodb=require("mongodb");
const getdb=require("../db").getdb;

router.get("/show_Requests",(req,res,next)=>{
    if(req.session.username)
    {
               const db=getdb();
               db.collection("Main_Event").find({}).toArray((err,data)=>{
                    res.render("admin/show/show_Requests",{
                        info:data
                    })
               })

    }
    else
    {
        res.redirect("/login");
    }
});


router.get("/view_Requests",(req,res,next)=>{
 if(req.session.username)
 {
    let event=req.query.event_name;
    const db=getdb();
    event=[event,"abc"]
    db.collection("Student").find({volunteer_event:{$in:event}}).toArray((err,data)=>{
        
        res.render("admin/show/view_Requests",{
            info:data,
            event:req.query.event_name
        })
    })
 }
 else
 {
     res.redirect("/login");
 }
});

router.get("/accept_Request",(req,res,next)=>{
   const stud_id=req.query.stud;
   const event=req.query.event_name;
   const db=getdb();
   db.collection("Student").updateOne({},{$pull:{volunteer_event:event}},(err,data)=>{
       if(err)
       console.log("error")
       else{
           const id=mongodb.ObjectID(stud_id);
           db.collection("Main_Event").updateOne({"Sub_Events.Event_name":event},{$push:{"Sub_Events.$.Volunteer":id}},(err,data1)=>{
                   if(err)
                   {
                       console.log("error");
                   }
                   else
                   {
                       res.redirect("/show_Requests");
                   }
           })
       }
   })


});


router.get("/reject_Request",(req,res,next)=>{
    const stud_id=req.query.stud;
    const event=req.query.event_name;
    const db=getdb();
    db.collection("Student").updateOne({},{$pull:{volunteer_event:event}},(err,data)=>{
        if(err)
        console.log(error)
        else{
            res.redirect("/show_Requests");
        }
})
})


module.exports=router;
