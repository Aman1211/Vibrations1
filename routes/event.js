const express=require("express");
const path=require("path");
const mongodb=require("mongodb");
const getdb=require("../db").getdb;
const router=express();


router.get("/admin_core",(req,res,next)=>{
  if(req.session.username)
  {

       let stu_cnt;
       let exp_cnt;
       let fund;
             const db=getdb();
            db.collection("Student").aggregate([{$project:{queryno:{$size:"$volunteer_event"}}}]).toArray((err,info10)=>{
             db.collection("QueryFeed").find({status:'1',ans_status:'0'}).count((err,data2)=>{
             db.collection("Funds").find({"request.req_status":1}).count((err,data3)=>{

             
              res.locals.pendingquery=data2;
                    res.locals.pendingrequest=info10;
                    res.locals.pendingfund=data3
          db.collection("Student").findOne({email:req.session.username},(err,data)=>{

                 const com_id=data.com_id;
               
                
                
                 db.collection("Committee").findOne({_id:com_id},(err,data2)=>{
                        
                        if(data2.type=='Core')
                        {
                            db.collection("Funds").findOne({committee_id:com_id},(err,data3)=>{
                               
                               
                                   fund=data3.total_fund;
                            
                            });
                        }
                        else
                        {
                              res.redirect("/login")
                        }
                        db.collection("Student").find({com_id:com_id}).count((err,data5)=>{
                     
                          
                           db.collection("Expenses").find({committee_id:com_id}).count((err,data1)=>{
                            res.render("admin/index",{
                                   user:req.session.username,
                                   fund:fund,
                                   stu_cnt:data5,
                                   exp_cnt:data1
                               })
                            
                         });
                         
                     });
                       
                 })

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



router.get("/add_Event",(req,res,next)=>{

    const db=getdb();
    db.collection("Sponsers").find({}).toArray((err,data)=>{
            res.render("admin/add/add_Event",{
                   sponser:data,
                   message:req.flash("success")
            });
    });
});

router.post("/add_Event",(req,res,next)=>{
       const cat=req.body.cat;
       const event_name=req.body.event_name;
       const venue=req.body.venue
       const time=req.body.time;
       const date=req.body.date;
       const judges=req.body.judges;
       const file=req.files;
       const logo=file[0].path;
       const pdf=file[1].path;
       const sponser=[];
       const insertdata={
              Event_name:event_name,
              Sponsers:sponser
       }
      var db=getdb();
      db.collection("Event_Sponser").insertOne(insertdata,(err,info1)=>{
       })
        const store={
             
                            Event_name:event_name,
                            Venue:venue,
                            Date:date,
                            time:time,
                            participation:[],
                            Judges:judges,
                            Volunteer:[],
                            pdf:pdf,
                            image:logo
                     }

                     
              const updateon={Category_name:cat};
        
         db.collection("Main_Event").updateOne(updateon,{$push:{
                Sub_Events:store
         }},(err,data)=>{
                req.flash("success","Event Added Successfully");
                return res.redirect("/add_Event");
         })
      });    



router.get("/view_Event",(req,res,next)=>{
       if(req.session.username)
       {
             
              const page=parseInt(req.query.page);
              const skip1=page-1;
            const db=getdb();
           
            db.collection("Main_Event").find({}).count((err,data4)=>{
              
            db.collection("Main_Event").find({}).skip(skip1).limit(1).toArray((err,data)=>{
              res.render("admin/show/view_Event",{
                     Event:data,
                     count:data4
              });
       
            });
            });
          
       }  
       else
       {
              return res.redirect("/login");
       }
});



router.get("/view_Participants",(req,res,next)=>{
       if(req.session.username)
       { 
              const part=[];
               let page=parseInt(req.query.page);
               page=((page-1)*5);
                const name=req.query.Event_name;
                const db=getdb();
                db.collection("Main_Event").aggregate([{$unwind:'$Sub_Events'},{$match:{'Sub_Events.Event_name':{$eq:name}}}]).toArray((err,data)=>{
                    req.session.info=data;
                    req.session.event=name;
                    req.session.page=page;
                     res.redirect("/process_participants");
                            
                      })
                   
                     
       }
       else
       {
              res.redirect("/login");
       }
});



router.get("/view_Volunteer",(req,res,next)=>{
       if(req.session.username)
       { 
               let page=parseInt(req.query.page)
               page=((page-1)*5);
                const name=req.query.Event_name;
                const db=getdb();
                db.collection("Main_Event").aggregate([{$unwind:'$Sub_Events'},{$match:{'Sub_Events.Event_name':{$eq:name}}}]).toArray((err,data)=>{
                    req.session.page=page;
                     req.session.info=data;
                     req.session.event=name;
                     res.redirect("/process_volunteer");
                     });
       }
       else
       {
              res.redirect("/login");
       }
});


router.get("/process_volunteer",(req,res,next)=>{
       if(req.session.username)
       {
       const db=getdb();
       const info=req.session.info;
       const page=parseInt(req.session.page);
       let stud=[];
       for(let i=0; i<info.length; i++)
       {
              info[i].Sub_Events.Volunteer.forEach(data=>{
                     
                     const id2=mongodb.ObjectID('5e79bd7bc5808a541b546d48');
                     const id1=mongodb.ObjectID(data);
                     stud.push(id1);
                     stud.push(id2);
                       

              })
              
              
       }
      
     
      db.collection("Student").find({_id:{$in:stud}}).count((err,data5)=>{
       db.collection("Student").find({_id:{$in:stud}}).skip(page).limit(5).toArray((err,data2)=>{
              console.log(data5)
              if(err)
              console.log("error")
              else 
              res.render("admin/show/view_Volunteer",{
                     detail:data2,
                     count:data5,
                     event:req.session.event
              })
       })
})
}
else
{
       res.redirect("/login");
}
});
router.get("/process_participants",(req,res,next)=>{
       if(req.session.username)
       {
       const db=getdb();
       const info=req.session.info;
       const page=parseInt(req.session.page);
       const event=req.session.event;
       console.log(info);
       let stud=[];
       for(let i=0; i<info.length; i++)
       {
              info[i].Sub_Events.participation.forEach(data=>{
                     
                     const id2=mongodb.ObjectID('5e79bd7bc5808a541b546d48');
                     const id1=mongodb.ObjectID(data);
                     stud.push(id1);
                     stud.push(id2);
                       

              })
              
              
       }
      
     
       db.collection("Student").find({_id:{$in:stud}}).toArray((err,data5)=>{
       db.collection("Student").find({_id:{$in:stud}}).skip(page).limit(5).toArray((err,data2)=>{
              
              if(err)
              console.log("error")
              else 
              res.render("admin/show/view_Participants",{
                     detail:data2,
                     count:data5,
                     event:event
              })
       })
})
}
else
{
       res.redirect("/login");
}
});


router.get("/view_Sponsers",(req,res,get)=>{
if(req.session.username)
{
       const name=req.query.Event_name;
       req.session.event=name;
       const db=getdb();
       db.collection("Event_Sponser").find({Event_name:name}).toArray((err,data)=>{
              console.log(data);
              req.session.detail=data;              
              res.redirect("/process_Sponsers");
       });
} 
else
{
       res.redirect("/login");
}
});


router.get("/process_Sponsers",(req,res,next)=>{
       if(req.session.username && req.session.detail)
       {
             const event=req.session.detail;
             let name;
             for(let i=0; i < event.length; i++)
             {
                name=event[i].Event_name;
             }
            const db=getdb();
            db.collection("Event_Sponser").aggregate([{$match:{"Event_name":name}},{$unwind:"$Sponsers"},{$lookup:{from:"Sponsers",localField:"Sponsers.id",foreignField:"_id",as:"data"}}]).toArray((err,data2)=>{
              if(err)
              console.log("error")
              else
             {
              res.render("admin/show/view_Sponsers",{
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

router.get("/edit_Event",(req,res,next)=>{
       if(req.session.username)
       {
              const name=req.query.Event_name;
              const db=getdb();
              db.collection("Main_Event").aggregate([{$unwind:"$Sub_Events"},{$match:{"Sub_Events.Event_name":{$eq:name}}}]).toArray((err,data)=>{
                     db.collection("Sponsers").find({}).toArray((err,data1)=>{
                             res.render("admin/edit/edit_Event",{
                                    sponser:data1,
                                    detail:data,
                                    message:req.flash("success")
                             });
                     });
                 });
                 
       }
       else
       {
              res.redirect("/login");
       }
});


router.post("/edit_Event",(req,res,next)=>{
       const cat=req.body.cat;
       const event_name=req.body.event_name;
       const venue=req.body.venue
       const time=req.body.time;
       const date=req.body.date;
       const judges=req.body.judges;
      
     
       const db=getdb();
      
   
      
      
      
              
       db.collection("Main_Event").updateOne({"Category_name":cat,"Sub_Events.Event_name":req.query.Event_name},{$set:{
             
              "Category_name":cat,
              "Sub_Events.$.Event_name":event_name,
              "Sub_Events.$.Venue":venue,
              "Sub_Events.$.Date":date,
              "Sub_Events.$.time":time,
              "Sub_Events.$.Judges":judges,
              
              
       }},(err,data)=>{
              if(err)
              {
                     console.log("error");
              }
              else
              {
                     console.log("Updated");
                     res.redirect("/edit_Event?Event_name="+ req.query.Event_name);
              }
       })

});

router.get("/view_mou1",(req,res,next)=>{
       if(req.session.username)
       {
            const id=mongodb.ObjectID(req.query.id);
            const db=getdb();
            db.collection("Sponsers").findOne({_id:id},(err,data)=>{
                const path=data.mou;
                
                if(path!='')
                res.download("../PROJECT/"+path);
                else
                {
                res.redirect("/view_Sponsers?Event_name=" + req.session.event)
                }
            })
       }
       else
       {
           res.redirect("/login");
       }
   })


   router.get("/delete_Event",(req,res,next)=>{
          if(req.session.username)
          {
       
          const event=req.query.Event_name;
          const db=getdb();
          let amt=0;
          db.collection("Event_Sponser").find({Event_name:event}).toArray((err,data1)=>{
             data1[0].Sponsers.forEach(data2=>{
                     amt=parseInt(amt)+parseInt(data2.amt);
             })
             db.collection("Funds").findOne({committee_id:mongodb.ObjectID('5e6efd28dda9c64eccbe37b8')},(err,data2)=>{
                    let amt1=data2.total_fund;
                    amt1=parseInt(amt1)-amt;
                    db.collection("Funds").updateOne({committee_id:mongodb.ObjectID('5e6efd28dda9c64eccbe37b8')},{$set:{total_fund:amt1}},(err,data3)=>{
                           if(err)
                           console.log("error")
                           else
                           {
                           db.collection("Event_Sponser").deleteOne({Event_name:event},(err,data21)=>{
                                  if(err)
                                  console.log("error in deletion");
                                  else
                                  {
                                     db.collection("Main_Event").updateMany({},{$pull:{"Sub_Events":{Event_name:event}}},(err,data31)=>{
                                            if(err)
                                            console.log("Error in the deletion of Event")
                                            else
                                            res.redirect("View_Event")
                                     })
                                  }
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
   



module.exports=router;