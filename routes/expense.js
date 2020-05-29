const getdb=require("../db").getdb;
const mongodb=require("mongodb");
const express=require("express");
const path=require("path");
const router=express();


router.get("/add_Expenses",(req,res,next)=>{
    if(req.session.username)
    {
         res.render("admin/add/add_Expense");
    }
    else
    {
        res.redirect("/login");
    }
});

router.post("/add_Expenses",(req,res,next)=>{
    
        const amt=req.body.amt;
        const  des=req.body.des;
        const pdf=req.file.path;
         const db=getdb();
        const user=req.session.username;
     db.collection("Student").findOne({"email":user},(err,data)=>{
         const com_id=data.com_id
         const data1={
             "committee_id":com_id,
             "expenses_detail":des,
             "expense_amt":amt,
             "bill_img":pdf
         }
         db.collection("Expenses").insertOne(data1,(err,data2)=>{
             if(err)
                console.log("error");
             else
             {
                console.log("Inserted");
                db.collection("Committee").findOne({"_id":com_id},(err,data3)=>{
                    if(data3.type=='Core')
                    {
                        db.collection("Funds").findOne({"committee_id":com_id},(err,data5)=>{
                            const amt1=data5.total_fund;
                        db.collection("Funds").updateOne({"committee_id":com_id},{$set:{"total_fund":amt1-amt}},(err,data4)=>{

                        })
                    })
                    }
                    else
                    {
                        db.collection("Funds").findOne({"commmittee_id":com_id},(err,data5)=>{
                            const amt1=data5.fund_allocated;
                        db.collection("Funds").updateOne({"committee_id":com_id},{$set:{fund_allocated:amt1-amt}},(err,data4)=>{

                        })
                    })
                    }
                })
                res.redirect("/add_Expenses")
             }
            })
     })

});



router.get("/view_Expenses",(req,res,next)=>{

    
    if(req.session.username)
    {
        const db=getdb();
    db.collection("Committee").find({}).toArray((err,data)=>{
        res.render("admin/show/view_Expenses",{
            info:data
        });
    })
       
    }
    else
    {
        res.redirect("/login");
    }
})


router.get("/show_Expenses",(req,res,next)=>{
    const com_id=mongodb.ObjectID(req.query.Com_id);
    const type=req.query.type;
  if(req.session.username)
  {
         const db=getdb();
         db.collection("Expenses").find({committee_id:com_id}).toArray((err,data)=>{
             res.render("admin/show/show_Expenses",{
                 info:data,
                 type:type
             });
         })
  }
  else
  {
      res.redirect("/login");
  }

});


router.get("/download1",(req,res,next)=>{
    const path1=req.query.path;
    console.log(path1);
        res.download("../PROJECT/"+path1);
    
});

router.get("/edit_Expenses",(req,res,next)=>{


    if(req.session.username)
    { 
         const com_id=mongodb.ObjectID(req.query.com_id);  
            const db=getdb();
            db.collection("Expenses").findOne({_id:com_id},(err,data)=>{
                res.render("admin/edit/edit_Expenses",{
                    info:data
                })
            })         
               
    }
    else
    {
        res.redirect("/login");
    }
})



module.exports=router;