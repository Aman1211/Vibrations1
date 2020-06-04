const app = require("express");
const path = require("path");
const bcrypt = require("bcryptjs");
const mongodb = require("mongodb");
const nodemailer = require('nodemailer');
const getdb = require("../db").getdb;
const transport = nodemailer.createTransport({
    service: "gmail",
    auth: {
        user: "sharma.aman1298@gmail.com",
        pass: "aman$1234"
    }
});
let OTP;
let EMAIL;


const router = app.Router();


router.get("/student/:email", (req, res, next) => {
    // if (req.session.username) {

    const db = getdb();
    db.collection('Student').find({ "email": req.params.email }).toArray((err, data) => {
        console.log(data);
        res.json(data);
    });
});



router.post("/use_login", (req, res, next) => {
    const username = req.body.username;
    const password = req.body.pass;

    const db = getdb();
    const user = db.collection("Student");
    // const not_found = { user: "not found" };
    user.findOne({ "email": username }, (err, data) => {
        if (!data) {
            res.json(null);
            // return res.redirect('/login');
        } else {
            bcrypt.compare(password, data.password).then(domatch => {
                console.log(domatch);
                if (domatch) {
                    console.log(data);
                    res.json(data);
                    // req.session.username = username;
                    // return res.redirect("/home");
                } else {
                    // req.flash("error", "Invalid Username or Passsword");
                    // return res.redirect("/login");
                    res.json(null);
                }
            }).catch(err => {
                console.log(err);
            });
        }

    });







});



router.post("/signup", (req, res, next) => {
    // console.log(req.body);
    const name = req.body.name;
    const email = req.body.email;
    const pass = req.body.pass;
    const con = req.body.contact;
    const bit = req.body.bit;
    bcrypt.hash(pass, 12).then(data => {
        const pass1 = data;
        const db = getdb();
        if (bit == null) {
            console.log("null inside");
            const data1 = {
                "name": name,
                "contact": con,
                "email": email,
                "password": pass1,
                "stu_status": bit,
                "product": [],
                "volunteer_status": "",
                "volunteer_event": [],
                "com_status": '0'
            }

            db.collection("Student").insertOne(data1, function(err, data1) {
                if (err) {
                    console.log("Error Occured during Insertion");
                } else {
                    console.log("Data Inserted Successfully");
                    res.json(data1);
                    transport.sendMail({
                        to: "201912120@daiict.ac.in",
                        from: "sharma.aman1298@gmail.com",
                        subject: "Registration Successful",
                        text: "Thanks for Registering in Vibrations"

                    });
                    // console.log(data);
                    // return res.redirect('/login');
                }
            });
        } else {
            console.log("bit inside");
            const bitdata = {
                "name": name,
                "contact": con,
                "email": email,
                "password": pass1,
                "stu_status": bit,
                "product": [],
                "volunteer_status": "",
                "volunteer_event": [],
                "com_status": '0',
                'student_id': req.body.id,
                'year': req.body.year,
                'stream': req.body.stream

            }
            db.collection("Student").insertOne(bitdata, function(err, data2) {
                if (err) {
                    console.log("Error Occured during Insertion");
                } else {
                    console.log("Data Inserted Successfully");
                    res.json(data2);
                    transport.sendMail({
                        to: "201912120@daiict.ac.in",
                        from: "sharma.aman1298@gmail.com",
                        subject: "Registration Successful",
                        text: "Thanks for Registering in Vibrations BIT"

                    });
                    // console.log(data);
                    // return res.redirect('/login');
                }
            });
        }
    });


});


router.post("/forgetpassword", (req, res, next) => {
    const min = 100;
    const max = 1000000;
    OTP = Math.floor(Math.random() * (+max - +min)) + +min;
    const email = req.body.username;
    EMAIL = email;
    transport.sendMail({
        to: email,
        from: "bitvibrationsjaipur@gmail.com",
        subject: "OTP for Resetting the Password",
        text: "Your One Time Password:-" + OTP
    });
    res.json(OTP);
    // res.redirect("/reset");
});


router.post("/resetpassword", (req, res, next) => {
    const otp = req.body.otp;
    const pass = req.body.pass;
    const pass1 = req.body.pass1;
    const user = EMAIL;
    const invalid = "INVALID DETAILS";

    if (otp == OTP && pass == pass1) {

        bcrypt.hash(pass, 12, (err, data) => {
            const db = getdb();
            const pass = data;
            const updateon = { email: user };
            const newval = { $set: { password: pass } };
            db.collection("Student").updateOne(updateon, newval, (err, data) => {
                if (err) {
                    console.log("Error");
                } else {
                    console.log("done")
                    res.json(data);
                    // return res.redirect("/login");
                }
            });
        });
    } else {
        console.log(otp + " " + pass + " " + pass1);
        res.json(invalid);


        // req.flash("error1", "Invalid Details")
        // res.redirect("/reset");

    }


});


module.exports = router;