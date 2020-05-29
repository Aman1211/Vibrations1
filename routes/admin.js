const express=require("express");
const router=express();
const getdb=require("../db").getdb;
const mongodb=require("mongodb");

router.get("/admin_sponser",(req,res,next)=>{
    if(req.session.username)
  {
       let stu_cnt;
       let exp_cnt;
       let fund;
             const db=getdb();
          db.collection("Student").findOne({email:req.session.username},(err,data)=>{
                 const com_id=data.com_id;
               
                
                
                 db.collection("Committee").findOne({_id:com_id},(err,data2)=>{
                        
                        if(data2._id=='5e6efef74429714eccbd6ab9')
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
                            res.render("sponser_admin/index",{
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

router.get("/add_Member1",(req,res,next)=>{
    if(req.session.username)
    {
            const db=getdb();
            db.collection("Student").find({com_status:'0'}).toArray((err,data)=>{
                   res.render("sponser_admin/add/add_Member",{
                       info:data
                   })
            })
    }
    else
    {
        res.redirect("/login");
    }
})

router.post("/add_Member1",(req,res,next)=>{
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
                res.redirect("view_Members1");
            }
        })
    })
})


router.get("/process_Member1",(req,res,next)=>{
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
                   res.redirect("/add_Member1");
               }
           },false,true)
       })

}
else
{
    res.redirect("/login");
}
})

router.get("/view_Member1",(req,res,next)=>{
    if(req.session.username)
    {
        let page=parseInt(req.query.page);
        page=((page-1)*5);

         const db=getdb();
         
         db.collection("Student").findOne({email:req.session.username},(err,data)=>{
             db.collection("Student").find({com_id:data.com_id}).count((err,data2)=>{
             db.collection("Student").find({com_id:data.com_id}).skip(page).limit(5).toArray((err,data1)=>{
                 res.render("sponser_admin/show/view_Member",{
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
});


router.get("/remove_Member1",(req,res,next)=>{
     if(req.session.username)
     {
         const user=mongodb.ObjectID(req.query.id);
         const db=getdb();
         db.collection("Student").update({_id:user},{$unset:{"com_id":""}},(err,data)=>{
             if(err)
             console.log('error')
             else
             res.redirect("/view_Member1");
         })
     }
     else
     {
         res.redirect("/login");
     }
})

router.get("/add_Expenses1",(req,res,next)=>{
    if(req.session.username)
    {
        const  db=getdb();
        const user=req.session.username;
        db.collection("Student").findOne({email:user},(err,data1)=>{
            const com_id=data1.com_id;
        db.collection("Funds").findOne({"committee_id":com_id},(err,data6)=>{
           console.log(data6);
          if(data6!=undefined)
          {
         res.render("sponser_admin/add/add_Expense");
          }
          else
          {
              res.redirect("/show_message1");
          }
        })
    })
    }
    else
    {
        res.redirect("/login");
    }
});

router.post("/add_Expenses1",(req,res,next)=>{
    
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
                       
                        db.collection("Funds").findOne({"committee_id":com_id},(err,data5)=>{
                            const amt1=data5.fund_allocated;
                        db.collection("Funds").updateOne({"committee_id":com_id},{$set:{fund_allocated:amt1-amt}},(err,data4)=>{

                        })
                    })
                


               
                res.redirect("/add_Expenses1")
            
        
            
        
    })
             }
            })
     })

});

router.get("/show_message1",(req,res,next)=>{
    if(req.session.username)
    {
         res.render("sponser_admin/show/show_message",{
             data:"Funds not Allocated"
         })
    }
})

router.get("/show_Expenses1",(req,res,next)=>{
   
   
  if(req.session.username)
  {

  let page=parseInt(req.query.page);
  page=((page-1)*5)
    const user=req.session.username;

         const db=getdb();
         db.collection("Student").findOne({email:user},(err,data2)=>{
          const com_id=data2.com_id;
         db.collection("Expenses").find({committee_id:com_id}).count((err,data1)=>{
         db.collection("Expenses").find({committee_id:com_id}).skip(page).limit(5).toArray((err,data)=>{
             res.render("sponser_admin/show/show_Expenses",{
                 info:data,
                 count:data1
                 
             });
         })
        })
    })
  }
  else
  {
      res.redirect("/login");
  }

});


router.get("/download11",(req,res,next)=>{
    const path1=req.query.path;
    console.log(path1);
        res.download("../PROJECT/"+path1);
    
});


router.get("/add_Sponser1",(req,res,next)=>{
    if(req.session.username)
    {
        res.render("sponser_admin/add/add_Sponser");
    }
    else
    {
        res.redirect("/login");
    }
});

router.get("/add_mou",(req,res,next)=>{
    if(req.session.username)
    {
        const db=getdb();
        db.collection("Sponsers").find({}).toArray((err,data)=>{
            res.render("sponser_admin/add/add_mou",{
                info:data
            })
        })
    }
    else
     {
         res.redirect("/login");
     }
       
})

router.post("/add_mou",(req,res,next)=>{
    const spon=req.body.sponser;
    const mou=req.file.path;    
    const db=getdb();
    db.collection("Sponsers").updateOne({Sponser_name:spon},{$set:{mou:mou}},(err,data)=>{
        if(err)
        console.log("error")
        else
        {
            res.redirect("/add_mou");
        }
    })
})
router.post("/add_Sponser1",(req,res,next)=>{
    const name=req.body.spon
    const logo1=req.files
    const logo=logo1[0].path
    const mou='';
    const db=getdb();
    const data={
        Sponser_name:name,
        Image:logo,
        mou:mou
        
    }
    db.collection("Sponsers").insertOne(data,(err,data1)=>{
              if(err)
              console.log("Error")
              else
              res.redirect("/add_Sponser1");
    })
});

router.get("/add_Fund1",(req,res,next)=>{
 if(req.session.username)
 {
     const db=getdb();
     db.collection("Sponsers").find({}).toArray((err,data)=>{
         db.collection("Main_Event").find({}).toArray((err,data1)=>{
            
             res.render("sponser_admin/add/add_Fund",{
                 spon:data,
                 event:data1
             })
         })
     })
 }
 else
 {
     res.redirect("/login");
 }
})

router.post("/add_Fund1",(req,res,next)=>{
    const sponser=req.body.sponser;
    const event=req.body.event;
    const type=req.body.type;
    const amt=req.body.amt;
    const db=getdb();
    db.collection("Sponsers").findOne({Sponser_name:sponser},(err,data)=>{
        console.log(data);
        const spon_id=data._id;
        const data1={
            id:spon_id,
            type:type,
            amt:amt
        }
        db.collection("Event_Sponser").updateOne({Event_name:event},{$push:{Sponsers:data1}},(err,data2)=>{
            if(err)
            console.log("error")
            else
            {
                   db.collection("Committee").findOne({type:'Core'},(err,data3)=>{
                       console.log(data3)
                       const com_id=data3._id;
                       db.collection("Funds").findOne({committee_id:com_id},(err,data4)=>{
                           console.log(data4);
                           const fund=data4.total_fund;
                           const total=parseInt(fund)+parseInt(amt);
                           db.collection("Funds").updateOne({committee_id:com_id},{$set:{total_fund:total}},(err,data5)=>{
                               if(err)
                               console.log("Error in updation")
                               else
                               res.redirect("/add_Fund1");
                           })
                       })
                   })
            }
        })
    })

})


router.get("/edit_Fund1",(req,res,next)=>{
    if(req.session.username)
    {
         const event=req.query.event;
         const id=mongodb.ObjectId(req.query.id);
         const db=getdb();
         db.collection("Event_Sponser").aggregate([{$match:{"Event_name":event,"Sponsers.id":id}},{$unwind:"$Sponsers"},{$lookup:{from:"Sponsers",localField:"Sponsers.id",foreignField:"_id",as:"data"}}]).toArray((err,data2)=>{
            if(err)
            console.log("error")
            else
           {
             
            res.render("sponser_admin/edit/edit_Fund",{
                   info:data2
            })
    }
})
    }
    else
    {
        res.redirect("/login");
    }
})


router.post("/edit_Fund1",(req,res,next)=>{
     const id=req.query.id;
     const event=req.query.event
     const amt=req.body.amt;
     const db=getdb();
     let new_amt;
     db.collection("Event_Sponser").findOne({Event_name:event},{"Sponsers.$.id":mongodb.ObjectID(id)},(err,data)=>{
      const fund=data.Sponsers[0].amt; 
       db.collection("Event_Sponser").updateOne({Event_name:event,Sponsers:{$elemMatch:{id:mongodb.ObjectID(id)}}},{$set:{"Sponsers.$.amt":amt}},(err,data2)=>{
        
    })
      db.collection("Committee").findOne({type:'Core'},(err,data1)=>{
        const com_id=data1._id;
        db.collection("Funds").findOne({committee_id:com_id},(err,data3)=>{
            let total=parseInt(data3.total_fund); 
      if(fund<amt)
      {
           new_amt=amt-fund;
           total=total+new_amt;
      } 
      else
      {
         new_amt=fund-amt;
         total=total-new_amt;
      }
       db.collection("Funds").updateOne({committee_id:com_id},{$set:{"total_fund":total}},(err,data)=>{
           if(err)
           console.log("Error")
           else
           {
               res.redirect("/view_Sponser1")
           }
       })

        })
    })
})
})
router.get("/view_Sponser1",(req,res,next)=>{
    if(req.session.username)
    {
        let page=parseInt(req.query.page);
        page=((page-1)*5)
         const db=getdb();
         db.collection("Sponsers").find({}).count((err,data2)=>{
         db.collection("Sponsers").find({}).skip(page).limit(5).toArray((err,data)=>{

             res.render("sponser_admin/show/view_Sponser",{
                 info:data,
                 count:data2
                 
                
             })
         })
        })
    }
    else
    {
           res.redirect("login");
    }
})

router.get("/show_Sponser1",(req,res,next)=>{
    if(req.session.username)
    {
         let page=parseInt(req.query.page);
         page=((page-1)*5);
            const id=mongodb.ObjectID(req.query.id);
            const db=getdb();
            db.collection("Event_Sponser").aggregate([{$unwind:"$Sponsers"},{$match:{"Sponsers.id":{$eq:id}}}]).toArray((err,data1)=>{
            db.collection("Event_Sponser").aggregate([{$unwind:"$Sponsers"},{$match:{"Sponsers.id":{$eq:id}}},{$skip:page},{$limit:5}]).toArray((err,data)=>{
               
                res.render("sponser_admin/show/show_Sponser",{
                    info:data,
                    count:data1,
                    id:id
                })
            })
        })
        
    }
    else
    {
        res.redirect("/login");
    }
})


router.get("/remove_Sponser",(req,res,next)=>{
    if(req.session.username)
    {
              const sponser=mongodb.ObjectID(req.query.id);
               req.session.sponser=sponser;
             const db=getdb();
              db.collection("Event_Sponser").aggregate([{$unwind:"$Sponsers"},{$match:{"Sponsers.id":{$eq:sponser}}}]).toArray((err,data)=>{
                  req.session.spon_data=data;
                  db.collection("Event_Sponser").updateMany({},{$pull:{"Sponsers":{id:sponser}}},(err,data2)=>{
                      if(err)
                      console.log("error")
                      else
                      {
                          res.redirect("/process_rem_Sponser");
                      }
                  })
              })
    }
    else
    {
        res.redirect("/login");
    }
});

router.get("/process_rem_Sponser",(req,res,next)=>{
     if(req.session.username)
     {
              const data=req.session.spon_data;
              let amt=0;
              const db=getdb();
              for(let i=0; i < data.length ;i++)
              {
                  amt+=parseInt(data[i].Sponsers.amt);
              }
              db.collection("Committee").findOne({type:'Core'},(err,data1)=>{
                   const com_id=data1._id;
                   db.collection("Funds").findOne({committee_id:com_id},(err,data3)=>{
                       const total=parseInt(data3.total_fund);
                       const total1=total-amt;
                       db.collection("Funds").updateOne({committee_id:com_id},{$set:{total_fund:total1}},(err,data)=>{
                           if(err)
                           console.log("error in updation")
                           else
                           {
                               
                               db.collection("Sponsers").deleteOne({_id:mongodb.ObjectID(req.session.sponser)},(err,data)=>{
                                res.redirect("/view_Sponser1");
                               })
                              
                           }
                       })
                   })

              })
     }
     else
     {
         res.redirect("/login");
     }
})


router.get("/view_mou",(req,res,next)=>{
    if(req.session.username)
    {
         const id=mongodb.ObjectID(req.query.id);
         const db=getdb();
         db.collection("Sponsers").findOne({_id:id},(err,data)=>{
             const path=data.mou;
             
             if(path!='')
             res.download("../PROJECT/"+path);
             else
             res.redirect("/view_Sponser1")
         })
    }
    else
    {
        res.redirect("/login");
    }
})


router.get("/logout1",(req,res,next)=>{
    req.session.username=null;
    if(!req.session.username)
    res.redirect("/login");
})


router.get("/request_Fund1",(req,res,next)=>{
    if(req.session.username)
    {
       res.render("sponser_admin/add/request_fund");
         
    }
    else
    {
        res.redirect("/login");
    }
})

router.post("/request_Fund1",(req,res,next)=>{
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
        res.redirect("/request_Status");
    })

    })
})

router.get("/request_Status",(req,res,next)=>{
    if(req.session.username)
    {
        let page =parseInt(req.query.page);
        page=((page-1)*5);
        const db=getdb();
        db.collection("Student").findOne({email:req.session.username},(err,data)=>{
            const com_id=data.com_id;
            db.collection("Funds").aggregate([{$match:{committee_id:com_id}},{$unwind:"$request"}]).toArray((err,data3)=>{
            db.collection("Funds").aggregate([{$match:{committee_id:com_id}},{$unwind:"$request"},{$skip:page},{$limit:5}]).toArray((err,data2)=>{
            
                res.render("sponser_admin/show/request_Status",{
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


     







module.exports=router;