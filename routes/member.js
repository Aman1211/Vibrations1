const getdb=require("../db").getdb;
const express=require("express");
const mongodb=require("mongodb");
const router=express();

router.get("/add_Member",(req,res,next)=>{
    if(req.session.username)
    {
            let page=req.query.page;
            page=((page-1)*5);
            const db=getdb();
            db.collection("Student").find({com_status:'0'}).count((err,data1)=>{
            db.collection("Student").find({com_status:'0'}).skip(page).limit(5).toArray((err,data)=>{
                   res.render("admin/add/add_Member",{
                       info:data,
                       count:data1
                   })
            })
        })
    }
    else
    {
        res.redirect("/login");
    }
})

router.post("/add_Member",(req,res,next)=>{
    const id=req.body.id;
    const user=req.session.username;
    const db=getdb();
    db.collection("Student").findOne({email:user},(err,data1)=>{
        const com_id=mongodb.ObjectID(data1.com_id);
        console.log(id);
        db.collection("Student").updateOne({_id:id},{$set:{com_status:'1'}},{$push:{com_id:com_id}},(err,data)=>{
            if(err)
            console.log("error");
            else
            {
                res.redirect("/view_Members");
            }
        })
    })
})


router.get("/process_Member",(req,res,next)=>{
if(req.session.username)
{
       const mem=mongodb.ObjectID(req.query.stud);
       const user=req.session.username;
       const db=getdb();
       db.collection("Student").findOne({email:user},(err,data)=>{
           const com_id=data.com_id;
           db.collection("Student").updateOne({_id:mem},{$set:{com_status:'1',com_id:com_id}},(err,data1)=>{
               if(err)
               console.log("error")
               else
               {
                   res.redirect("/add_Member");
               }
           },false,true)
       })

}
else
{
    res.redirect("/login");
}
})

router.get("/view_Member",(req,res,next)=>{
    if(req.session.username)
    {
         let page =parseInt(req.query.page);
         page=((page-1)*5);
         const db=getdb();
         
         db.collection("Student").findOne({email:req.session.username},(err,data)=>{
             db.collection("Student").find({com_id:data.com_id}).count((err,data2)=>{  
             db.collection("Student").find({com_id:data.com_id}).skip(page).limit(5).toArray((err,data1)=>{
                 res.render("admin/show/view_Member",{
                     info:data1,
                     count:data2
                 })
             })
            })
         })
    }
    else
    {
        res.redirect("/login");
    }
})

router.get("/remove_Member",(req,res,next)=>{
    if(req.session.username)
    {
        const user=mongodb.ObjectID(req.query.id);
        const db=getdb();
        db.collection("Student").update({_id:user},{$unset:{"com_id":""}},(err,data)=>{
            if(err)
            console.log('error')
            else
            res.redirect("/view_Member");
        })
    }
    else
    {
        res.redirect("/login");
    }
})

module.exports=router;