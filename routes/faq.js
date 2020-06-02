
const app = require("express");
const express = require("express");
const getdb = require("../db").getdb;
const path = require("path");
const mongodb = require("mongodb");
const router = app.Router();
const bodyparser = require('body-parser');

router.use(bodyparser.urlencoded({
    extended: true
}));
router.use(bodyparser.json());

router.get("/faq", (req, res, next) => {
    const db = getdb();
    db.collection('QueryFeed').find().toArray((err, data2) => {
            res.setHeader('Access-Control-Allow-Origin', '*');
            if (err) {
                res.json(err);
            } else {
                res.json(data2);
                // console.log(data2);
            }
        })
        // if (req.session.username) {
        //     const db = getdb();
        //     var Student_id1;
        //     db.collection('Student').find({ "email": req.session.username }).toArray((err, data) => {
        //         console.log(data);
        //         Student_id1 = data[0]._id;
        //         var a;
        //         db.collection('QueryFeed').find({ "Student_id": Student_id1, "status": "1" }).toArray((err, data1) => {
        //             db.collection('QueryFeed').find({ "status": "1" }).toArray((err, data2) => {
        //                 res.json(data2);
        //                 res.setHeader('Access-Control-Allow-Origin', '*');
        //                 console.log(data2);
        //                 // res.render('../views/main_side/faq', {
        //                 //     queryfeed: data2,
        //                 //     queryfeed_user: data1,
        //                 //     message: req.flash("success")
        //                 // });
        //             });
        //         });
        //     });
        // } else {
        //     return res.redirect("/login");
        // }
});

router.post("/faq", (req, res, next) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    const db = getdb();
    console.log(req.body);
    db.collection('Student').find({ "email": req.body.email }).toArray((err, data) => {
        res.setHeader('Access-Control-Allow-Origin', '*');
        if (data.length != 0) {
            console.log(data[0]._id);
            var data1 = {

                "Student_id": data[0]._id,
                "Query_String": req.body.Query_String,
                "Email": req.body.email,
                "reply_string": "",
                "status": "1",
                "ans_status": "0"
            }
        } else {
            var data1 = {
                "Email": req.body.email,
                "Query_String": req.body.Query_String,
                "reply_string": "",
                "status": "1",
                "ans_status": "0"
            }
        }


        db.collection("QueryFeed").insertOne(data1, function(err) {
            if (err) {
                console.log("Error Occured during Insertion");
            }
            console.log("Data Inserted Successfully");
            // return res.redirect("/faq");
            res.json(data1);
            // console.log(data1);
        });
    });
});

router.post("/feedback", (req, res, next) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    const db = getdb();
    console.log(req.body);
    db.collection('Student').find({ "email": req.body.email }).toArray((err, data) => {
        res.setHeader('Access-Control-Allow-Origin', '*');
        if (data.length != 0) {
            console.log(data[0]._id);
            var data1 = {

                "Student_id": data[0]._id,
                "Query_String": req.body.Query_String,
                "Email": req.body.email,
                "status": "0",
            }
        } else {
            var data1 = {
                "Email": req.body.email,
                "Query_String": req.body.Query_String,
                "status": "0",
            }
        }


        db.collection("QueryFeed").insertOne(data1, function(err) {
            if (err) {
                console.log("Error Occured during Insertion");
            }
            console.log("Data Inserted Successfully");
            // return res.redirect("/faq");
            res.json(data1);
            // console.log(data1);
        });
    });
});
// router.post("/faq_ask_question", (req, res, next) => {
//     if (req.session.username) {
//         const db = getdb();
//         const question = req.body.question;
//         db.collection('Student').find({ "email": req.session.username }).toArray((err, data) => {
//             const data1 = {
//                 "Student_id": data[0]._id,
//                 "Query_String": question,
//                 "reply_string": "",
//                 "status": "1",
//                 "ans_status": "0"
//             }
//             const db = getdb();
//             db.collection("QueryFeed").insertOne(data1, function(err) {
//                 if (err) {
//                     console.log("Error Occured during Insertion");
//                 }
//                 console.log("Data Inserted Successfully");
//                 return res.redirect("/faq");
//                 res.json(data1);
//                 res.setHeader('Access-Control-Allow-Origin', '*');
//             });
//         });
//     } else {
//         return res.redirect("/login");
//     }
// });

// router.post("/faq_give_feedback", (req, res, next) => {
//     if (req.session.username) {
//         const db = getdb();
//         const feedback = req.body.feedback;
//         db.collection('Student').find({ "email": req.session.username }).toArray((err, data) => {
//             const data1 = {
//                 "Student_id": data[0]._id,
//                 "Query_String": feedback,
//                 "status": "0"
//             }
//             const db = getdb();
//             db.collection("QueryFeed").insertOne(data1, function(err) {
//                 if (err) {
//                     console.log("Error Occured during Insertion");
//                 }
//                 console.log("Data Innerted Successfully");
//                 return res.redirect("/faq");
//             });
//         });
//     } else {
//         return res.redirect("/login");
//     }
// });

module.exports = router;

