const getdb=require("../db").getdb;
const mongodb=require("mongodb");
const express=require("express");
const pdf=require("pdfkit");
const path=require("path");

const router=express();
const nodemailer=require('nodemailer');
const transport=nodemailer.createTransport({
    service:"gmail",
    auth:{
        user:"sharma.aman1298@gmail.com",
        pass:"aman$1234"
    }
    });


router.get("/admin_represent",(req,res,next)=>{
    if(req.session.username)
  {
      req.session.success=false;
       let stu_cnt;
       let exp_cnt;
       let fund;
             const db=getdb();
          db.collection("Student").findOne({email:req.session.username},(err,data)=>{
                 const com_id=data.com_id;
               
                
                
                 db.collection("Committee").findOne({_id:com_id},(err,data2)=>{
                        
                        if(data2._id=='5e6eff864429714eccbd6abc')
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
                            res.render("representation/index",{
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
router.get("/radd_Expenses",(req,res,next)=>{
    if(req.session.username)
    {
         res.render("representation/add/add_Expense");
    }
    else
    {
        res.redirect("/login");
    }
});

router.post("/radd_Expenses",(req,res,next)=>{
    
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
                    db.collection("Funds").findOne({"committee_id":com_id},(err,data5)=>{
                        const amt1=data5.fund_allocated;
                    db.collection("Funds").updateOne({"committee_id":com_id},{$set:{fund_allocated:amt1-amt}},(err,data4)=>{

                    })
                })
                }
            })
            res.redirect("/rshow_Expenses?Com_id=5e6eff864429714eccbd6abc&type=Coordinate")
         }
        })
 })

});



router.get("/rshow_Expenses",(req,res,next)=>{
    const com_id=mongodb.ObjectID(req.query.Com_id);
    const type=req.query.type;
    let page=parseInt(req.query.page);
    page=((page-1)*5)
  if(req.session.username)
  {
         const db=getdb();
         db.collection("Expenses").find({committee_id:com_id}).count((err,data1)=>{
         db.collection("Expenses").find({committee_id:com_id}).skip(page).limit(5).toArray((err,data)=>{
             res.render("representation/show/show_Expenses",{
                 info:data,
                 type:type,
                 count:data1
             });
         })
        })
  }
  else
  {
      res.redirect("/login");
  }

});


router.get("/rdownload1",(req,res,next)=>{
    const path1=req.query.path;
    console.log(path1);
        res.download("../PROJECT/"+path1);
    
});

//EXPENSES

//MEMBERS

router.get("/radd_Member",(req,res,next)=>{
    if(req.session.username)
    {
            const db=getdb();
            let page=parseInt(req.query.page);
            page=((page-1)*5);
            db.collection("Student").find({com_status:'0'}).count((err,data1)=>{
            db.collection("Student").find({com_status:'0'}).skip(page).limit(5).toArray((err,data)=>{
                   res.render("representation/add/add_Member",{
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

router.post("/radd_Member",(req,res,next)=>{
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
                res.redirect("/rview_Members");
            }
        })
    })
})


router.get("/rprocess_Member",(req,res,next)=>{
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
                   res.redirect("/rview_Member");
               }
           },false,true)
       })

}
else
{
    res.redirect("/login");
}
})

router.get("/rview_Member",(req,res,next)=>{
    if(req.session.username)
    {
         const db=getdb();
         let page=parseInt(req.query.page);
         page=((page-1)*5);
         db.collection("Student").findOne({email:req.session.username},(err,data)=>{
             db.collection("Student").find({com_id:data.com_id,com_status:'1'}).count((err,data2)=>{
             db.collection("Student").find({com_id:data.com_id,com_status:'1'}).skip(page).limit(5).toArray((err,data1)=>{
                 res.render("representation/show/view_Member",{
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

router.get("/rremoveprocess_Member",(req,res,next)=>{
    if(req.session.username)
    {
           const user=mongodb.ObjectID(req.query.stud);
           const db=getdb();
            db.collection("Student").updateMany({_id:user},{$set:{com_id:'0',com_status:'0'}},(err,data1)=>{
                if(err)
                    console.log("error")
                else{
                    console.log('done');
                    res.redirect("/rview_Member");
                }
            })
    }
    else
    {
        res.redirect("/login");
    }
    })


 router.get("/add_Goodies",(req,res,next)=>{
    if(req.session.username)
    {
         res.render("representation/add/add_Goodies");
    }
    else
    {
        res.redirect("/login");
    }
});

router.post("/add_Goodies",(req,res,next)=>{
    const img=req.files;
    let product={
       title : req.body.title,
       description : req.body.description,
       price : req.body.price,
       quantity : req.body.quantity,
       image :img[0].path
    }
        const db=getdb();
        db.collection("Product").insertOne(product,function(err){
            if(err)
            {
                console.log("Error Occured during Insertion");
            }
            console.log("Data Inserted Successfully");
        });
                
                res.redirect("/add_Goodies");
});




router.get("/view_Goodies",(req,res,next)=>{
    
    {
         const db=getdb();
          let page=parseInt(req.query.page);
          page=((page-1)*5);
        db.collection("Product").find({}).count((err,data1)=>{
         db.collection("Product").find({}).skip(page).limit(5).toArray((err,data)=>{
           res.render("representation/show/view_Goodies",{
                  Products:data , user : req.session.username,
                  count:data1
           });
        });
         });
    }  
    
});


router.get("/edit_Goodies",(req,res,next)=>{
    const ProductId=mongodb.ObjectID(req.query.goodiesid);
    const db=getdb()
    db.collection("Product").findOne({"_id":ProductId},(err,data)=>{
        let oldProduct={
            title: data.title,
            description: data.description,
            price: data.price,
            quantity:data.quantity,
            image: data.image
        }
       
          res.render("representation/edit/edit_Goodies",{
              Product:oldProduct , user : req.session.username         
             })
    })

});


router.post("/edit_Goodies",(req,res,next)=>{
    const img=req.files;
    let product={
        title : req.body.title,
        description : req.body.description,
        price : req.body.price,
        quantity : req.body.quantity,
        image : img[0].path
     }
     const id=mongodb.ObjectID(req.query.goodiesid);
         const db=getdb();
         db.collection("Product").updateOne({_id:id} , {$set:product},function(err){
             if(!err)
             {
                console.log("Data Updated Successfully");
             }
             else
             {
                console.log("Error Occured during Updation");
             }
             
         });
                 
                 res.redirect("/view_Goodies");

});

router.post("/delete_Goodies",(req,res,next)=>{
    
     const id=mongodb.ObjectID(req.query.goodiesid);
         const db=getdb();
         db.collection("Product").deleteOne({_id:id} ,function(err,result){
             if(!err)
             {
                console.log("Data Deleted Successfully");
             }
             else
             {
                console.log("Error Occured during deleting data");
             }
             
         });
                 
                 res.redirect("/view_Goodies");

});

router.get("/view_Orders",(req,res,next)=>{
    
    const id=mongodb.ObjectID(req.query.goodiesid);
        const db=getdb();
        
         db.collection("Product")
         .aggregate([{$match:{_id:id}},{$lookup:{from:"Student",localField:"_id",foreignField:"product","as":"data"}}])
         .toArray((err,result)=>{
            if(!err)
            {
                
               res.render("representation/show/view_Orders",{Students:result ,user : req.session.username });
            }
            else
            {
                res.redirect('/login');
            }
        });            
                
               

});
//MEMBERS




router.get("/add_College",(req,res,next)=>{
    if(req.session.username)
    {
            res.render("representation/add/add_college");
    } 
    else
    {
        res.redirect("/login");
    }
});


router.post("/add_College",(req,res,next)=>{
    const name=req.body.college;
    const email=req.body.email;
    const db=getdb();
    const data={
        College_name:name,
        Email:email
    }

    db.collection("Colleges").insertOne(data,(err,data1)=>{
        if(err)
        console.log("Error")
        else
        res.redirect("/add_College");
    })
});

router.get("/college_Invitation",(req,res,next)=>{
    if(req.session.username)
    {
       req.session.success=false
        const db=getdb();
        db.collection("Colleges").find({}).toArray((err,data)=>{
        
            res.render("representation/add/college_invite",{
                info:data,
                success:req.session.success
            })
        })
    }
    else{
      res.redirect("/login");
    }
})

router.post("/college_Invitation",(req,res,next)=>{

const name=req.body.college;

const db=getdb()
for(let i=0; i<name.length; i++)
{
         db.collection("Colleges").findOne({College_name:name[i]},(err,data)=>{ 
             const email=data.Email;
             console.log(email);
             const doc=new pdf;
             doc.image('../PROJECT/images/bit.png', 110, 3, {width: 400, height: 150})
   .text('', 320, 130);
   doc.moveDown();
   doc.fontSize(13);
   doc.text("Repected Sir / Madam",40 );
   doc.moveDown()
   doc.fontSize(13);
   db.collection("About").findOne({_id:mongodb.ObjectID('5e9945df1c9d44000060c176')},(err,data)=>{
   const event_name=data.Name
   
   doc.font('Times-Bold').text('Subject:Invitation for'+ " " + event_name + ',Cultural Fest of BIT JAIPUR')
   doc.moveDown();
   doc.fontSize(13);
   doc.text("Greetings!");
   doc.moveDown();
   doc.fontSize(13.5);
   doc.font('Times-Roman')
   doc.text('We seek the pleasure of introducing ourselves as BIT JAIPUR,In order to encourage appreciation and participation in the cultural diversity and ethos of our national heritage and to enhance the manifestation of youth’s creativity and potential, we are organizing Cultural Fest' + " " + event_name + " " + " between " +  " " + data.time + " " +  "at" + " " + data.place + ".")
   doc.moveDown();
   doc.text(event_name + ',our inter-college fest, is congregation of students from various national reputed colleges. The countdown has already begun, with a promise of bigger and better celebration of talent than last year. It has been planned as a showcase of the very best of the young talent in a fun and frolic way. This fest would consist of the most interactive, motivated and enthusiastic people. This platform would give the participants an opportunity to unleash their hidden talents in the variety of genres ranging from creative skills to singing, dancing, acting and finally rocking up the stage with band music and fashion show. The event is sure to leave fond memories for years to cherish. ')
   doc.moveDown();
   doc.text('It will be our pleasure to have you as a part of ' + " " + event_name + " " + '. You are requested to kindly give wide publicity in your Institute, motivate your students to take part in this event');
   doc.moveDown();
   doc.text('We look forward to your participation in this mega event. Please join and experience the amazing time with us.')
   doc.moveDown();
   doc.fillColor('blue');
   doc.fontSize(13);
   doc.text('Regards');
   doc.text("\n Ms. PreetiBhaskar \n Coordinator-BIT-Cultural Fest")
   
   doc.end();
   transport.sendMail({
       from:'aman.sharma122111@gmail.com',
       to:email,
       subject:'Invitation for the annual Cultural Fest of BIT JAIPUR',
       attachments:[{
           filename:'Invitation.pdf',
           content:doc
       }]
   })
   
   })
         })
}
req.session.success=true
res.redirect("/college_Invitation")

});




router.get("/private_Invitation",(req,res,next)=>{

    if(req.session.username)
    {
             res.render("representation/add/private_invite",{
                 success:req.session.success
             });
    
    }
    else
    {
        res.redirect("/login");
    }
});



router.post("/private_Invitation",(req,res,next)=>{
    const email=req.body.email;
    const db=getdb();
    const doc=new pdf;
             doc.image('../PROJECT/images/bit.png', 110, 3, {width: 400, height: 150})
   .text('', 320, 130);
   doc.moveDown();
   doc.fontSize(13);
   doc.text("Repected Sir / Madam",40 );
   doc.moveDown()
   doc.fontSize(13);
   db.collection("About").findOne({_id:mongodb.ObjectID('5e9945df1c9d44000060c176')},(err,data)=>{
   const event_name=data.Name
   
   doc.font('Times-Bold').text('Subject:Invitation for'+ " " + event_name + ',Cultural Fest of BIT JAIPUR')
   doc.moveDown();
   doc.fontSize(13);
   doc.text("Greetings!");
   doc.moveDown();
   doc.fontSize(13.5);
   doc.font('Times-Roman')
   doc.text('We seek the pleasure of introducing ourselves as BIT JAIPUR,In order to encourage appreciation and participation in the cultural diversity and ethos of our national heritage and to enhance the manifestation of youth’s creativity and potential, we are organizing Cultural Fest' + " " + event_name + " " + " between " +  " " + data.time + " " +  "at" + " " + data.place + ".")
   doc.moveDown();
   doc.text(event_name + ',our inter-college fest, is congregation of students from various national reputed colleges. The countdown has already begun, with a promise of bigger and better celebration of talent than last year. It has been planned as a showcase of the very best of the young talent in a fun and frolic way. This fest would consist of the most interactive, motivated and enthusiastic people. This platform would give the participants an opportunity to unleash their hidden talents in the variety of genres ranging from creative skills to singing, dancing, acting and finally rocking up the stage with band music and fashion show. The event is sure to leave fond memories for years to cherish. ')
   doc.moveDown();
   doc.text('It will be our pleasure to have you as a part of ' + " " + event_name + " " + '. You are requested to kindly give wide publicity in your Institute, motivate your students to take part in this event');
   doc.moveDown();
   doc.text('We look forward to your participation in this mega event. Please join and experience the amazing time with us.')
   doc.moveDown();
   doc.fillColor('blue');
   doc.fontSize(13);
   doc.text('Regards');
   doc.text("\n Ms. PreetiBhaskar \n Coordinator-BIT-Cultural Fest")
   
   doc.end();
   transport.sendMail({
       from:'aman.sharma122111@gmail.com',
       to:email,
       subject:'Invitation for the annual Cultural Fest of BIT JAIPUR',
       attachments:[{
           filename:'Invitation.pdf',
           content:doc
       }]

   })
   
   req.session.success=true
   res.redirect("/private_Invitation")
   })
         })




    router.get("/request_Fund4",(req,res,next)=>{
            if(req.session.username)
            {
               res.render("representation/add/request_fund");
                 
            }
            else
            {
                res.redirect("/login");
            }
        })
        
        router.post("/request_Fund4",(req,res,next)=>{
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
                res.redirect("/request_Status4");
            })
        
            })
        })
        
        router.get("/request_Status4",(req,res,next)=>{
            if(req.session.username)
            {
                let page =parseInt(req.query.page);
                page=((page-1)*5);
                const db=getdb();
                db.collection("Student").findOne({email:req.session.username},(err,data)=>{
                    const com_id=data.com_id;
                    db.collection("Funds").aggregate([{$match:{committee_id:com_id}},{$unwind:"$request"}]).toArray((err,data3)=>{
                    db.collection("Funds").aggregate([{$match:{committee_id:com_id}},{$unwind:"$request"},{$skip:page},{$limit:5}]).toArray((err,data2)=>{
                    
                        res.render("representation/show/request_Status",{
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


//INVENTORY
module.exports=router;