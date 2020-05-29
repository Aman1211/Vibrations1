const app=require("express");
const path=require("path");
const bcrypt=require("bcryptjs");
const mongodb=require("mongodb");
const nodemailer=require('nodemailer');
const transport=nodemailer.createTransport({
    service:"gmail",
    auth:{
        user:"aman.sharma122111@gmail.com",
        pass:"aman$123"
    }
    });
    

const router=app.Router();

const getdb=require("../db").getdb;
router.get("/reg",(req,res,next)=>{
    res.render('reg');
});

router.get("/login",(req,res,next)=>{
    res.render('login',{
        errormessage:req.flash("error")
    });
});


router.post("/login",(req,res,next)=>{ 
     const username=req.body.username;
     const password=req.body.pass;

    const db=getdb();
    const user=db.collection("Student");
    user.findOne({"email":username},(err,data)=>{
          if(!data)
          
           return res.redirect('/login');
          else
          {
              bcrypt.compare(password,data.password).then(domatch=>{
                    if(domatch)
                    {
                       if(data.com_status=='1')
                       {
                           db.collection("Committee").findOne({_id:data.com_id},(err,data2)=>{
                            
                               if(data2._id=='5e6efd28dda9c64eccbe37b8')
                               {
                                   
                                req.session.username=username;  
                                return res.redirect("/admin_core");
                               }
                               else if(data2._id=='5e6efef74429714eccbd6ab9')
                               {07
                                req.session.username=username;  
                                return res.redirect("/admin_sponser");
                               }
                               else if(data2._id=='5e6eff464429714eccbd6aba')
                               {
                                req.session.username=username;  
                                return res.redirect("/admin_design");
                               }
                               else if(data2._id=='5e6eff694429714eccbd6abb')
                               {
                                req.session.username=username;  
                                return res.redirect("/admin_ict");
                               }
                               else if(data2._id=='5e6eff864429714eccbd6abc')
                               {
                                req.session.username=username;  
                                return res.redirect("/admin_represent");
                               }
                               else if(data2._id=='5e6effa44429714eccbd6abd')
                               {
                                req.session.username=username;  
                                return res.redirect("/admin_core");
                               }
                           })
                       }
                       else
                       {
                        req.session.username=username;  
                        return res.redirect("/home");
                       }    
                    
                    }
                    else
                    {
                   req.flash("error","Invalid Username or Passsword");
                    return res.redirect("/login");
                    }
              }).catch(err=>{
                  console.log(err);
              });
          } 
           
});

      

     
              
  
     
});

router.post("/reg",(req,res,next)=>{ 
 const name=req.body.name;
 const email=req.body.email;
 const pass=req.body.pass;
 const con=req.body.contact;
 const bit=req.body.bit;
 const img1=req.files;
 const img=img1[0].path
bcrypt.hash(pass,12).then(data=>{
   console.log(bit);  
const pass1=data;
const data1={
     "name":name,
     "contact":con,
     "email":email,
     "password":pass1,
     "stu_status":bit,
     "product":[],
      "volunteer_status":"0",
      "volunteer_event":[],
      "com_status":'0',
      "image":img
      
}

const db=getdb();
if(bit==null)
{
db.collection("Student").insertOne(data1,function(err){
    if(err)
    {
        console.log("Error Occured during Insertion");
    }
    else
    {
    console.log("Data Inserted Successfully");
    transport.sendMail({
        to:"sharma.aman1298@gmail.com",
        from:"aman.sharma122111@gmail.com",
        subject:"Registration Successful",
        text:"Thanks for Registering in Vibrations"
         
    });
    return res.redirect('/login');
}
});
}
else
{
            req.session.data=data1;
           res.redirect("/reg1");
}
});


});



router.get("/reg1",(req,res,next)=>{
     res.render("reg1");
});




router.post("/reg1",(req,res,next)=>{
      const data1=req.session.data;
      const id=req.body.id;
      const year=req.body.year;
      const stream=req.body.stream;
      const data2={
          'student_id':id,
          'year':year,
          'stream':stream
      }
     Object.assign(data1,data2)
      const db=getdb();
      db.collection("Student").insertOne(data1,function(err){
        if(err)
        {
            console.log("Error Occured during Insertion");
        }
        else
        {
        console.log("Data Inserted Successfully");
        transport.sendMail({
            to:"sharma.aman1298@gmail.com",
            from:"aman.sharma122111@gmail.com",
            subject:"Registration Successful",
            text:"Thanks for Registering in Vibrations"
             
        });
        res.redirect("/login");
    }
    });
})




router.get("/about",(req,res,next)=>{
 if(req.session.username)
 {
 const db=getdb();
 const user=req.session.username;
 db.collection("Student").findOne({"email":user},(err,data)=>{
         const name=data.name;
         const contact=data.contact;
         const bit=data.stu_status;
         const stream=data.stream;
         const year=data.year;
         const stud_id=data.student_id;
         let status;
         if(bit==="on")
              status="BIT Student";
         else
           status="NON-BIT Student";     

            res.render("about",{
                username:name,
                email:req.session.username,
                contact:contact,
                status:status,
                status1:bit,
                stream:stream,
                year:year,
                stud_id:stud_id
            });

 });
}
else
{
    return res.redirect("/login");
}   
});




router.post("/about",(req,res,next)=>{
            
    const email=req.body.email;
    const con=req.body.contact;
   const user=req.session.username;
    const db=getdb();
    const updateon={email:user};
    const newval={$set:{email:email,contact:con }};
db.collection("Student").updateOne(updateon,newval,(err,data)=>{
    if(err)
    {
        console.log("Error in updation");
    }
    else
    {
      
       req.session.username=email;
        return res.redirect("/about");
    }
});

});
module.exports=router;