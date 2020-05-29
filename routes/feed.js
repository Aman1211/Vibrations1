const express=require("express");
const router=express();
const mongodb=require("mongodb");
<<<<<<< HEAD
const bodyparser=require("body-parser");
const getdb=require("../db").getdb;

router.use(bodyparser.urlencoded({
    extended:true
}));
router.use(bodyparser.json());
router.get("/view_Feedback",(req,res,next)=>{
    if(req.session.username)
    {
        let page=parseInt(req.query.page);
        page=((page-1)*5);
            const db=getdb();
            db.collection("QueryFeed").aggregate([{$match:{status:'0'}},{$lookup:{from:"Student",localField:"Student_id",foreignField:"_id","as":"data"}}]).toArray((err,data2)=>{
            db.collection("QueryFeed").aggregate([{$match:{status:'0'}},{$lookup:{from:"Student",localField:"Student_id",foreignField:"_id","as":"data"}},{$skip:page},{$limit:5}]).toArray((err,data1)=>{
                
                res.render("admin/show/view_Feedback",{
                        info:data1,
                        count:data2
                    })
                
                })
            })
        }
=======
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
>>>>>>> 51ad2ecd43b5ab386ca80bf11b67f7d37c991509
    else
    {
        res.redirect("/login");
    }
})

router.get("/view_Query",(req,res,next)=>{
    if(req.session.username)
    {
<<<<<<< HEAD
         let page=parseInt(req.query.page);
         page=((page-1)*5);
           const db=getdb();
           db.collection("QueryFeed").aggregate([{$match:{status:'1',ans_status:'0'}},{$lookup:{from:"Student",localField:"Student_id",foreignField:"_id","as":"data"}}])
           .toArray((err,data2)=>{
           db.collection("QueryFeed").aggregate([{$match:{status:'1',ans_status:'0'}},{$lookup:{from:"Student",localField:"Student_id",foreignField:"_id","as":"data"}},{$skip:page},{$limit:5}])
           .toArray((err,data1)=>{
                 
               res.render("admin/show/view_Query",{
                   info:data1,
                  count:data2
               })
           })
        })
=======
           const db=getdb();
           db.collection("QueryFeed").aggregate([{$match:{status:'1',ans_status:'0'}},{$lookup:{from:"Student",localField:"Student_id",foreignField:"_id","as":"data"}}])
           .toArray((err,data1)=>{
              
               res.render("admin/show/view_Query",{
                   info:data1
               })
           })
>>>>>>> 51ad2ecd43b5ab386ca80bf11b67f7d37c991509
    }
    else
    {
        res.redirect("/login");
    }
})

router.get("/reply_Query",(req,res,next)=>{
<<<<<<< HEAD

  
=======
>>>>>>> 51ad2ecd43b5ab386ca80bf11b67f7d37c991509
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
<<<<<<< HEAD
    console.log(req.body);
    const reply=req.body.reply;

=======
    const reply=req.body.reply;
>>>>>>> 51ad2ecd43b5ab386ca80bf11b67f7d37c991509
    const id=mongodb.ObjectID(req.query.id);
     const db=getdb();
     db.collection("QueryFeed").updateOne({_id:id},{$set:{ans_status:'1',reply_string:reply}},(err,data)=>{
         if(err)
         {
             console.log("error");
         }
         else
         {
<<<<<<< HEAD
            //  res.redirect("/view_Query");
=======
             res.redirect("/view_Query");
>>>>>>> 51ad2ecd43b5ab386ca80bf11b67f7d37c991509
         }
     })

})






module.exports=router;

