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
       const date1=date.split("-").reverse().join("/");
       const team=req.body.team
       const judges=req.body.judges;
       const file=req.files;
       const logo=file[0].filename;
        const logo1=logo.replace(logo,'images\\'+logo)
       const pdf=file[1].filename;
       const pdf1=pdf.replace(pdf,"images\\"+pdf)
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
                            Date:date1,
                            time:time,
                            participation:[],
                            Judges:judges,
                            Volunteer:[],
                            pdf:pdf1,
                            image:logo1,
                            team:[],
                            teamstatus:team
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
router.get("/process_Team",(req,res,next)=>{
    if(req.session.username)
    {
        const event=req.session.info
        let team=[];
        let eventname
        for(let i=0; i<event.length; i++)
        {
            eventname=event[i].Sub_Events.Event_name
               event[i].Sub_Events.team.forEach(data=>{
                     if(team.indexOf(data.name.toLowerCase())==-1)
                     {
                         team.push(data.name.toLowerCase())
                     }
               })
            }
            console.log(team)
            console.log(eventname)
            res.render("admin/show/view_Team",{
                info:team,
                event:eventname
            })

        
    }
    else
    {
        res.redirect("/login");
    }
})

router.get("/show_Team",(req,res,next)=>{
    if(req.session.username)
    {
           const team=req.query.name;
           const event=req.query.eventname;
           const db=getdb();
           db.collection("Main_Event").aggregate([{$unwind:'$Sub_Events'},{$match:{'Sub_Events.Event_name':{$eq:event}}}]).toArray((err,data)=>{
               
                req.session.info=data;
                req.session.event=event;
                req.session.teamname=team
                res.redirect("/process_show_team");
                });
  

    }
    else
    {
        res.redirect("/login");
    }
})
router.get("/process_show_team",(req,res,next)=>{
    if(req.session.username)
    {
        const db=getdb();
        const info=req.session.info;
        const team=req.session.teamname
        const event=req.session.event;
        console.log(info);
        let stud=[];
        let institute=[];
        for(let i=0; i<info.length; i++)
        {
               info[i].Sub_Events.team.forEach(data=>{
                      if(team==data.name.toLowerCase())
                      {
                      const id2=mongodb.ObjectID('5e79bd7bc5808a541b546d48');
                      const id1=mongodb.ObjectID(data.Student_id);
                      institute.push(data.institute)
                      stud.push(id1);
                      stud.push(id2);
                      }
                        
 
               })
               
               
        }
       
      
     
        db.collection("Student").find({_id:{$in:stud}}).toArray((err,data2)=>{
               
               if(err)
               console.log("error")
               else 
               res.render("admin/show/show_Team",{
                      detail:data2,
                      institute:institute,
                      event:event
               })
        })
 
    }
    else
    {
        res.redirect("/login")
    }
})
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
router.get("/view_Team",(req,res,next)=>{
    if(req.session.username)
    {
           const name=req.query.Event_name
           const db=getdb()
           db.collection("Main_Event").aggregate([{$unwind:'$Sub_Events'},{$match:{'Sub_Events.Event_name':{$eq:name}}}]).toArray((err,data)=>{
           
             req.session.info=data;
             req.session.event=name;
             res.redirect("/process_Team");
             });
    }
    else
    {
        res.redirect("/login")
    }
})


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
       let logo;
       let pdf;
       if(req.files.length>1)
       {

       const logo=req.files[0].filename
       const pdf=req.files[1].filename
       logo=logo.replace(logo,"images\\"+logo)
       pdf=pdf.replace(pdf,"images\\"+pdf)
       }
       else if(req.files.length==1)
       {
           if(req.files[0].filename.split('.').pop()=='pdf')
           {
                pdf=req.files[0].filename
                pdf=pdf.replace(pdf,"images\\"+pdf)
           }
           else
           {
               logo=req.files[0].filename
               logo=logo.replace(logo,"images\\"+logo)
           }
       }

       const date1=date.split("-").reverse().join("/");
       const judges=req.body.judges;
       const team=req.body.team;
      console.log(logo + ""+ pdf)
     
       const db=getdb();
      
   
      
      
      
      if(logo==null && pdf==null)
      {        
       db.collection("Main_Event").updateOne({"Category_name":cat,"Sub_Events.Event_name":req.query.Event_name},{$set:{
             
              "Category_name":cat,
              "Sub_Events.$.Event_name":event_name,
              "Sub_Events.$.Venue":venue,
              "Sub_Events.$.Date":date1,
              "Sub_Events.$.time":time,
              "Sub_Events.$.Judges":judges,
              "Sub_Events.$.teamstatus":team
              
              
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
    }
    else if(logo!=null && pdf==null)
    {
        db.collection("Main_Event").updateOne({"Category_name":cat,"Sub_Events.Event_name":req.query.Event_name},{$set:{
             
            "Category_name":cat,
            "Sub_Events.$.Event_name":event_name,
            "Sub_Events.$.Venue":venue,
            "Sub_Events.$.Date":date1,
            "Sub_Events.$.time":time,
            "Sub_Events.$.Judges":judges,
            "Sub_Events.$.teamstatus":team,
            "Sub_Events.$.logo":logo
            
            
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
    }
    else if(logo==null && pdf!=null)
    {
        db.collection("Main_Event").updateOne({"Category_name":cat,"Sub_Events.Event_name":req.query.Event_name},{$set:{
             
            "Category_name":cat,
            "Sub_Events.$.Event_name":event_name,
            "Sub_Events.$.Venue":venue,
            "Sub_Events.$.Date":date1,
            "Sub_Events.$.time":time,
            "Sub_Events.$.Judges":judges,
            "Sub_Events.$.teamstatus":team,
            "Sub_Events.$.pdf":pdf
            
            
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
    }
    else
    {
        db.collection("Main_Event").updateOne({"Category_name":cat,"Sub_Events.Event_name":req.query.Event_name},{$set:{
             
            "Category_name":cat,
            "Sub_Events.$.Event_name":event_name,
            "Sub_Events.$.Venue":venue,
            "Sub_Events.$.Date":date1,
            "Sub_Events.$.time":time,
            "Sub_Events.$.Judges":judges,
            "Sub_Events.$.teamstatus":team,
            "Sub_Events.$.logo":logo,
            "Sub_Events.$.pdf":pdf

            
            
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
    }

});

router.get("/view_mou1",(req,res,next)=>{
       if(req.session.username)
       {
            const id=mongodb.ObjectID(req.query.id);
            const db=getdb();
            db.collection("Sponsers").findOne({_id:id},(err,data)=>{
                const path=data.mou;
                
                if(path!='')
                res.download("../SEPROJECT/public/"+path);
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
        const pdf=req.files[0].filename
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
      const page=parseInt(req.query.page);
         const db=getdb();
         db.collection("Expenses").find({committee_id:com_id}).count((err,data3)=>{
         db.collection("Expenses").find({committee_id:com_id}).skip((page-1)*5).limit(5).toArray((err,data)=>{
             res.render("admin/show/show_Expenses",{
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


router.get("/download1",(req,res,next)=>{
    const path1=req.query.path;
    console.log(path1);
        res.download("../SEPROJECT/public/"+path1);
    
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


  
router.get("/event_team", (req, res, next) => {
    const db = getdb();
    db.collection("Student").find({ "com_status": "1" }).toArray((err, data) => {
        // console.log(data);
        res.json(data);
    });
})

router.get("/show_Events", (req, res, next) => {
    {
        const db = getdb();
        db.collection("Main_Event").aggregate([{ $unwind: '$Sub_Events' }]).toArray((err, data) => {
            if (err) {
                res.json(err);
            } else {
                res.json(data);
                // console.log(data);
            }


        });
    }
});

router.get("/show_Events/:Event_name", (req, res, next) => {
    {
        const db = getdb();
        console.log(req.params.Event_name);
        db.collection("Main_Event").aggregate([{ $unwind: '$Sub_Events' }, { $match: { 'Sub_Events.Event_name': req.params.Event_name } }]).toArray((err, data) => {
            res.setHeader('Access-Control-Allow-Origin', '*');
            if (err) {
                res.json(err);
            } else {
                res.json(data);
                // console.log(data);
            }


        });
    }


});


router.get("/participate_Events", (req, res, next) => {
    const userId = req.session.username;

    if (userId) {
        const name = req.query.eventname;
        res.render("user/add/participate_Events.ejs", { EventName: name, user: userId });


    } else {
        res.redirect("/login")
    }
});

router.post("/participate_Events", (req, res, next) => {
    const eve = req.body.event;
    let hasParticipated = 0;
    let stu_id = "";
    let team_status = "";
    const db = getdb();
    let already_participated = "You have already participated in this event";
    let successfully_participated = "Your participation request is sucessfully accepted";
    let successfully_team_participated = "Your participation request as team is sucessfully accepted";
    // console.log(req.body.email);
    db.collection("Main_Event").aggregate([{ $unwind: '$Sub_Events' }, { $match: { 'Sub_Events.Event_name': { $eq: eve } } }]).toArray((err, data) => {
        let participationList = data[0].Sub_Events.participation;
        let teamList = data[0].Sub_Events.team;
        console.log(teamList);
        db.collection("Student").findOne({ "email": req.body.email }, (err, stu) => {
            if (stu) {
                // console.log(stu._id);
                stu_id = stu._id;
                if (data[0].Sub_Events.teamstatus == null) {
                    for (let i = 0; i < participationList.length; i++) {
                        if (participationList[i]._id.toString() === stu_id.toString()) {
                            hasParticipated = 1;
                            res.json(already_participated);
                            console.log("You have already participated in this event");

                        }
                    }
                } else if (data[0].Sub_Events.teamstatus == "on") {
                    console.log(stu_id);
                    for (let i = 0; i < teamList.length; i++) {
                        if (teamList[i].Student_id.toString() === stu_id.toString()) {
                            hasParticipated = 1;
                            res.json(already_participated);
                            console.log("You have already participated in this event");
                        }
                    }
                }

            }
            // console.log(stu_id);
            if (hasParticipated === 0) {
                // console.log(data[0].Sub_Events.teamstatus);
                console.log(stu_id);
                if (data[0].Sub_Events.teamstatus == null) {
                    const participants = {
                        _id: stu_id,
                        // team: req.body.team,
                        institute: req.body.institute,
                        email: req.body.email,
                        phone: req.body.phone,
                    }
                    db.collection("Main_Event").updateOne({ "Sub_Events.Event_name": req.body.event }, { $push: { "Sub_Events.$.participation": participants } }, (err, data1) => {
                        if (err) {
                            console.log("error");
                        } else {
                            // res.json(data1);
                            res.json(successfully_participated);
                            console.log("Your participation request is sucessfully accepted");
                        }
                    })

                } else if (data[0].Sub_Events.teamstatus == "on") {
                    const teams = {
                        Student_id: stu_id,
                        name: req.body.team,
                        institute: req.body.institute,
                        team_size: req.body.team_size
                    }
                    db.collection("Main_Event").updateOne({ "Sub_Events.Event_name": req.body.event }, { $push: { "Sub_Events.$.team": teams } }, (err, data1) => {
                        if (err) {
                            console.log("error");
                        } else {
                            // res.json(data1);
                            res.json(successfully_team_participated);
                            console.log("Your participation request as team is sucessfully accepted");
                        }
                    })
                    console.log("success")

                }


            }


        })
    })

});


router.get("/eventgallary", (req, res, next) => {
    {
        const db = getdb();
        db.collection("Images").find().toArray((err, data) => {
            res.setHeader('Access-Control-Allow-Origin', '*');
            if (err) {
                res.json(err);
            } else {
                res.json(data);
                // console.log(data);
            }
        });
    }
});   
   
module.exports=router;
