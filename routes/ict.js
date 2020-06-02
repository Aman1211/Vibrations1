const getdb=require("../db").getdb;
const mongodb=require("mongodb");
const express=require("express");
const path=require("path");
const router=express();


router.get("/admin_ict",(req,res,next)=>{
    if(req.session.username)
  {
       let stu_cnt;
       let exp_cnt;
       let fund;
             const db=getdb();
          db.collection("Student").findOne({email:req.session.username},(err,data)=>{
                 const com_id=data.com_id;
               
                
                
                 db.collection("Committee").findOne({_id:com_id},(err,data2)=>{
                        
                        if(data2._id=='5e6eff694429714eccbd6abb')
                        {
                            db.collection("Funds").findOne({committee_id:com_id},(err,data4)=>{
                                fund=data4.fund_allocated;
                      
                         })
                            
                        }
                        else
                        {
                            res.redirect("/login");
                        }
                        db.collection("Student").find({com_id:com_id}).count((err,data5)=>{
                     
                          
                           db.collection("Expenses").find({committee_id:com_id}).count((err,data1)=>{
                            res.render("ict/index",{
                                   user:req.session.username,
                                   fund:fund,
                                   stu_cnt:data5,
                                   exp_cnt:data1
                               })
                            
                         });
                         
                     });
                       
                 })

          })
       }
  else
  {
         res.redirect("/login");
  }
});


//EXPENSES
router.get("/iadd_Expenses",(req,res,next)=>{
    if(req.session.username)
    {
         res.render("ict/add/add_Expense");
    }
    else
    {
        res.redirect("/login");
    }
});

router.post("/iadd_Expenses",(req,res,next)=>{
    
    const amt=req.body.amt;
    const  des=req.body.des;
    const pdf=req.files[0].filename;
      const pdf1=pdf.replace(pdf,"images\\"+pdf)
     const db=getdb();
    const user=req.session.username;
 db.collection("Student").findOne({"email":user},(err,data)=>{
     const com_id=data.com_id
     const data1={
         "committee_id":com_id,
         "expenses_detail":des,
         "expense_amt":amt,
         "bill_img":pdf1
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
                    db.collection("Funds").findOne({"committee_id":com_id},(err,data5)=>{
                        const amt1=data5.fund_allocated;
                    db.collection("Funds").updateOne({"committee_id":com_id},{$set:{fund_allocated:amt1-amt}},(err,data4)=>{

                    })
                })
                }
            })
            res.redirect("/ishow_Expenses?Com_id=5e6eff694429714eccbd6abb&type=Coordinate")
         }
        })
 })

});



router.get("/ishow_Expenses",(req,res,next)=>{
    const com_id=mongodb.ObjectID(req.query.Com_id);
    const type=req.query.type;
  if(req.session.username)
  {
    const page=parseInt(req.query.page);
    const db=getdb();
    db.collection("Expenses").find({committee_id:com_id}).count((err,data3)=>{
    db.collection("Expenses").find({committee_id:com_id}).skip((page-1)*5).limit(5).toArray((err,data)=>{
        res.render("ict/show/show_Expenses",{
            info:data,
            type:type,
            count:data3,
            com_id:com_id
        });
    })
   })
  }
  else
  {
      res.redirect("/login");
  }

});


router.get("/idownload1",(req,res,next)=>{
    const path1=req.query.path;
    console.log(path1);
        res.download("../SEPROJECT/public/"+path1);
    
});

//EXPENSES

//MEMBERS

router.get("/iadd_Member",(req,res,next)=>{
    if(req.session.username)
    {
            const page=parseInt(req.query.page);
            const db=getdb();
            db.collection("Student").find({com_status:'0'}).count((err,data1)=>{
            db.collection("Student").find({com_status:'0'}).skip((page-1)*5).limit(5).toArray((err,data)=>{
                   res.render("ict/add/add_Member",{
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

router.post("/iadd_Member",(req,res,next)=>{
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
                res.redirect("/iview_Members");
            }
        })
    })
})


router.get("/iprocess_Member",(req,res,next)=>{
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
                   res.redirect("/iview_Member");
               }
           },false,true)
       })

}
else
{
    res.redirect("/login");
}
})

router.get("/iview_Member",(req,res,next)=>{
    if(req.session.username)
    {
         const db=getdb();
         const page=parseInt(req.query.page);
         db.collection("Student").findOne({email:req.session.username},(err,data)=>{
            db.collection("Student").find({com_id:data.com_id}).count((err,data2)=>{  
                db.collection("Student").find({com_id:data.com_id,com_status:'1'}).skip((page-1)*5).limit(5).toArray((err,data1)=>{
                    res.render("ict/show/view_Member",{
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

router.get("/removeprocess_Member",(req,res,next)=>{
    if(req.session.username)
    {
           const user=mongodb.ObjectID(req.query.stud);
           const db=getdb();
            db.collection("Student").updateMany({_id:user},{$set:{com_id:'0',com_status:'0'}},(err,data1)=>{
                if(err)
                    console.log("error")
                else{
                    console.log('done');
                    res.redirect("/iview_Member");
                }
            })
    }
    else
    {
        res.redirect("/login");
    }
    })

//MEMBERS

//INVENTORY

router.get("/iadd_Inventory",(req,res,next)=>{
    if(req.session.username)
    {
            const db=getdb();
            db.collection("Student").find({com_status:'0'}).toArray((err,data)=>{
                   res.render("ict/add/add_Inventory",{
                       info:data,
                     
                   })
            })
    }
    else
    {
        res.redirect("/login");
    }
})



router.post("/iadd_Inventory",(req,res,next)=>{
   
    const item_name=req.body.item_name;
    const company=req.body.company;
    const quantity=req.body.quantity;
    const price=req.body.price;
    const db=getdb();
    const user=req.session.username;

    data1={
        _id: new mongodb.ObjectID(),
        item_name:item_name,
        company:company,
        quantity:quantity,
        last_issued:new Date(Date.now()).toDateString()
    };

    db.collection("Student").findOne({"email":user},(err,data)=>{
    const com_id=mongodb.ObjectID(data.com_id); 
        db.collection("Committee").updateOne({_id:com_id},{$push:{Inventory:data1}},(err,data)=>{
           
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
                    db.collection("Funds").findOne({"committee_id":com_id},(err,data5)=>{
                        const amt1=data5.fund_allocated;
                    db.collection("Funds").updateOne({"committee_id":com_id},{$set:{fund_allocated:amt1-price}},(err,data4)=>{

                    })
                })
                }
            })
            return res.redirect("/view_Inventory");
        })
    })
});



router.get("/iview_Inventory",(req,res,next)=>{
    const user=req.session.username;
    if(req.session.username)
    {
        const db=getdb();
        const page=parseInt(req.query.page);
        const s=parseInt(req.query.page)*5-5;
        const e=parseInt(req.query.page)*5;

        db.collection("Student").findOne({"email":user},(err,data)=>{
            const com=mongodb.ObjectID(data.com_id); 
            db.collection("Committee").find({_id:com},{ projection:{_id:0,Inventory:1}}).toArray((err,data)=>{
                res.render("ict/show/view_Inventory",{
                    info:data,
                    start:s,
                    end:e,
                    page:page
                });
            })
        })
    }
    else
    {
        res.redirect("/login");
    }
});

router.get("/plus_inventory",(req,res,next)=>{
    if(req.session.username)
    {
           const id=req.query.id;
           const qty=req.query.qty;
           req.session.item_id=id;
           req.session.qty=qty;
           res.render("ict/edit/edit_inventory",{
              
           })
    }
    else
    {
        res.redirect("/login");
    }
})



router.post("/plus_inventory",(req,res,next)=>{
    let qty=req.body.quantity;
    const price=req.body.price;
    qty=parseInt(qty)+parseInt(req.session.qty);
    const db=getdb();
    db.collection('Student').findOne({email:req.session.username},(err,data)=>{
        const com_id=mongodb.ObjectID(data.com_id);
        const dt=new Date(Date.now()).toDateString();
    db.collection('Committee').updateOne({_id:com_id,Inventory:{$elemMatch:{_id:mongodb.ObjectID(req.session.item_id)}}},{$set:{"Inventory.$.quantity":qty,"Inventory.$.last_issued":dt}},(err,data3)=>{
        
        if(err)
         console.log("error")
        else
        {
            db.collection("Funds").findOne({committee_id:com_id},(err,data4)=>{
                const fund=data4.fund_allocated;
                const new_fund=fund-price;
                db.collection("Funds").updateOne({committee_id:com_id},{$set:{fund_allocated:new_fund}},(err,data6)=>{
                    if(err)
                    console.log("error1")
                    else
                    {
                        res.redirect("/iview_Inventory?page=" + req.query.page);
                    }
                })
            })
        }
    })
    
})
})
router.get("/minus_inventory",(req,res,next)=>{
    if(req.session.username)
    {
            const id=mongodb.ObjectID(req.query.id);
            const db=getdb();
            db.collection('Student').findOne({email:req.session.username},(err,data)=>{
                const com_id=mongodb.ObjectID(data.com_id);
                let qty=req.query.qty;
                const dt=new Date(Date.now()).toDateString();
                qty=qty-1;
            db.collection('Committee').updateOne({_id:com_id,Inventory:{$elemMatch:{_id:id}}},{$set:{"Inventory.$.quantity":qty,"Inventory.$.last_issued":dt}},(err,data1)=>{
                if(err)
                console.log("error")
                else
                res.redirect("/iview_Inventory?page="+req.query.page);
            })
        })
    }
    else
    {
      res.redirect("/login");
    }
})

router.get("/iprocess_inventory",(req,res,next)=>{
    if(req.session.username)
    {
           const indx=mongodb.ObjectID(req.query.id);
           const qty=req.query.data;
           const user=req.session.username;
           console.log(qty);
           const db=getdb();
           db.collection("Student").findOne({email:user},(err,data)=>{
                const com_id=data.com_id;
                db.collection("committee").updateOne({Inventory: { $elemMatch: { _id:indx }}}, {$set: {"Inventory.$.quantity": 2}},(err,data1)=>{
                    if(err)
                        console.log("error")
                    else
                       res.redirect("/iview_Inventory");
               })
           })
    
    }
    else
    {
        res.redirect("/login");
    }
    })


    router.get("/request_Fund3",(req,res,next)=>{
        if(req.session.username)
        {
           res.render("ict/add/request_fund");
             
        }
        else
        {
            res.redirect("/login");
        }
    })
    
    router.post("/request_Fund3",(req,res,next)=>{
        const amt=req.body.amt;
        const dt=new Date(Date.now()).toDateString();
        const info={
            id:new mongodb.ObjectID(),
            req_status:1,
            amt:amt,
            dt:dt
        }
        const db=getdb();
        db.collection("Student").findOne({email:req.session.username},(err,data)=>{
            const com_id=data.com_id;
        
        db.collection("Funds").updateOne({committee_id:com_id},{$push:{request:info}},(err,data1)=>{
            if(err)
            console.log("error")
            else
            res.redirect("/request_Status3");
        })
    
        })
    })
    
    router.get("/request_Status3",(req,res,next)=>{
        if(req.session.username)
        {
            let page =parseInt(req.query.page);
            page=((page-1)*5);
            const db=getdb();
            db.collection("Student").findOne({email:req.session.username},(err,data)=>{
                const com_id=data.com_id;
                db.collection("Funds").aggregate([{$match:{committee_id:com_id}},{$unwind:"$request"}]).toArray((err,data3)=>{
                db.collection("Funds").aggregate([{$match:{committee_id:com_id}},{$unwind:"$request"},{$skip:page},{$limit:5}]).toArray((err,data2)=>{
                
                    res.render("ict/show/request_Status",{
                        info:data2,
                        count:data3
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
    
    

//INVENTORY
module.exports=router;