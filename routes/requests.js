const express=require("express");
const router=express();
const mongodb=require("mongodb");
const getdb=require("../db").getdb;

router.get("/show_Requests",(req,res,next)=>{
    if(req.session.username)
    {
        let page=parseInt(req.query.page);
        page=page-1;
               const db=getdb();
               db.collection("Main_Event").find({}).count((err,data2)=>{
               db.collection("Main_Event").find({}).skip(page).limit(1).toArray((err,data)=>{
                    res.render("admin/show/show_Requests",{
                        info:data,
                        count:data2
                    })
               })
            });

    }
    else
    {
        res.redirect("/login");
    }
});


router.get("/view_Requests",(req,res,next)=>{
 if(req.session.username)
 {
     let page=parseInt(req.query.page);
    let event=req.query.event_name;
    const db=getdb();
    let skip_num=((page-1)*5);
    db.collection("Student").aggregate([{$unwind:'$volunteer_event'},{$match:{"volunteer_event.Event_name":{$eq:event},"volunteer_event.status":{$eq:'0'}}}]).toArray((err,data1)=>{

    db.collection("Student").aggregate([{$unwind:'$volunteer_event'},{$match:{"volunteer_event.Event_name":{$eq:event},"volunteer_event.status":{$eq:'0'}}},{$limit:5},{$skip:skip_num}]).toArray((err,data)=>{
        
        res.render("admin/show/view_Requests",{
            info:data,
            count:data1.length,
            event:req.query.event_name
        })
    })
})
 }
 else
 {
     res.redirect("/login");
 }
});

router.get("/accept_Request",(req,res,next)=>{
   const stud_id=mongodb.ObjectID(req.query.id);
   const event=req.query.event;
   const db=getdb();
   db.collection("Student").updateOne({_id:stud_id,volunteer_event:{$elemMatch:{Event_name:event}}},{$set:{"volunteer_event.$.status":1}},(err,data)=>{
       if(err)
       console.log("error")
       else{

           db.collection("Main_Event").updateOne({"Sub_Events.Event_name":event},{$push:{"Sub_Events.$.Volunteer":stud_id}},(err,data1)=>{
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
   },false,true)


});


router.get("/reject_Request",(req,res,next)=>{
    const stud_id=mongodb.ObjectID(req.query.id);
    const event=req.query.event;
    const db=getdb();
    db.collection("Student").updateOne({_id:stud_id,volunteer_event:{$elemMatch:{Event_name:event}}},{$set:{"volunteer_event.$.status":2}},(err,data)=>{
        if(err)
        console.log(error)
        else{
            res.redirect("/show_Requests");
        }
},false,true)
});

router.get("/detail_Request",(req,res,next)=>{
    if(req.session.username)
    {
            const id=req.query.id;
            const  text=req.query.text;
            const event_name=req.query.event_name;
            res.render("admin/show/detail_Request",{
                stud_id:id,
                text:text,
                event:event_name
            })

    }
    else
    {
        res.redirect("/login");
    }
})
module.exports=router;
