const getdb=require("../db").getdb;
const mongodb=require("mongodb");
const express=require("express");
const router=express();
router.get("/distribute_fund",(req,res,next)=>{
      if(req.session.username)
      {
            const db=getdb();
             db.collection("Committee").find({"status":0}).toArray((err,data)=>{
                    
                res.render("admin/add/distribute_fund",{
                       info:data
                });
             })
              
      }
      else
      {
          res.redirect("/login");
      }
});


router.post("/distribute_fund",(req,res,next)=>{
    const com=req.body.com;
    const amt=req.body.amt;
    const db=getdb();
    db.collection("Committee").findOne({"Committee_name":com},(err,data)=>{
        const com_id=data._id
         let data1;
           if(data.type=='Coordinate')
           {
              data1={
                  committee_id:com_id,
                  fund_allocated:amt
                

              }
              db.collection("Committee").findOne({"type":"Core"},(err,data7)=>{
                  const id1=data7._id;
                  db.collection("Funds").findOne({"committee_id":id1},(err,data8)=>{
                      const amt5=data8.total_fund;
                      db.collection("Funds").updateOne({"committee_id":id1},{$set:{"total_fund":amt5-amt}},(err,data9)=>{

                      })
                  })
              })
              db.collection("Committee").updateOne({_id:com_id},{$set:{"status":1}},(err,data2)=>{

              })
           }
           else
           {
               data1={
                   committee_id:com_id,
                   total_fund:amt,
                
               }
               db.collection("Committee").updateOne({_id:com_id},{$set:{"status":1}},(err,data2)=>{
                  
            })
           }

           db.collection("Funds").insertOne(data1,(err,data3)=>{
               if(err)
               console.log("Error");
                else
                console.log("Allocated");
                res.redirect("/distribute_fund");
           })

    })


})




router.get("/view_fund",(req,res,next)=>{
    if(req.session.username)
    {
            const db=getdb();
            db.collection("Funds").aggregate([{$lookup:{from:"Committee",localField:"committee_id",foreignField:"_id","as":"data"}}]).toArray((err,data1)=>{
            res.render("admin/show/view_Fund",{
                    info:data1
                })
            
            })
               
    }
    else
    {
        res.redirect("/login");
    }
});



router.get("/edit_Fund",(req,res,next)=>{
    const com_id=mongodb.ObjectId(req.query.Com_id);
    const type=req.query.type;
    const db=getdb();
    db.collection("Funds").findOne({"committee_id":com_id},(err,data)=>{
        let data1;
       
        if(type=='Core')
        {
             data1=data.total_fund;
        }
        else
        {
            data1=data.fund_allocated;
        }
          res.render("admin/edit/edit_Fund",{
              info:data1
          })
    })

});



router.post("/edit_Fund",(req,res,next)=>{
    const amt=req.body.amt;
    const Com_id=mongodb.ObjectID(req.query.Com_id);
    const type=req.query.type;
    const db=getdb();
    let oldbal;
    let diffbal;
   let data1;
    if(type=='Core')
    {
           data1={
               total_fund:amt
           }  
    }
    else
    {
        data1={
            fund_allocated:amt
        }
    }
    if(type=='Coordinate')
    {
         db.collection("Funds").findOne({committee_id:Com_id},(err,info)=>{
                oldbal=info.fund_allocated;
                if(parseInt(oldbal)>parseInt(amt))
                 diffbal=parseInt(oldbal)-parseInt(amt);
                 else
                 diffbal=parseInt(amt)-parseInt(oldbal);
         db.collection("Committee").findOne({type:"Core"},(err,info1)=>{
             const id=info1._id;

             db.collection("Funds").findOne({committee_id:id},(err,info2)=>{
                 const tfund=info2.total_fund;
                 let nfund;
                 if(parseInt(oldbal)>parseInt(amt))
                 nfund=parseInt(tfund)+parseInt(diffbal);
                 else
                 nfund=parseInt(tfund)-parseInt(diffbal);
                 console.log(diffbal + " " + nfund);
                 db.collection("Funds").updateOne({"committee_id":id},{$set:{total_fund:nfund}},(err,info)=>{

                 })
             })
         })        
         })
    }
    db.collection("Funds").updateOne({"committee_id":Com_id},{$set:data1},(err,data3)=>{
        if(err)
        console.log("error")
        else
        {
       
        res.redirect("/edit_Fund?Com_id="+Com_id+"&type="+type);
    }
    })
})

module.exports=router;