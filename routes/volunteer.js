const app = require("express");
const express = require("express");
const getdb = require("../db").getdb;
const path = require("path");
const router = app.Router();

router.post("/volunteer/:Event_name", (req, res, next) => {
    const db = getdb();
    const event_exp = req.body.exp_txt;
    const event_name = req.params.Event_name;
    const flag_applied = "already_aplied";
    const flag_limit = "already_aplied to limit";
    var Student_id1;
    const store = {
            Event_name: event_name,
            Exprience: event_exp,
            status: "0"
        }
        // if (req.session.username) {
        // const event = req.params.Event_name;
    db.collection('Student').find({ "email": req.body.email }).toArray((err, data) => {
        Student_id1 = data[0]._id;
        count = data[0].volunteer_status;
        // console.log(data[0].volunteer_event.length);
        db.collection('Student').find({ _id: Student_id1, volunteer_event: { $elemMatch: { Event_name: event_name } } }).toArray((err, data1) => {
            // console.log(event_name);
            let count = 0;

            if (data1.length != 0) {
                // req.session.allready_applied = 1;
                res.json(flag_applied);

                // console.log("already_aplied");

            } else {
                if (data[0].volunteer_event.length >= 2) {
                    res.json(flag_limit);
                    console.log("already applied to limit");

                } else {
                    db.collection('Student').updateOne({ _id: Student_id1 }, {
                        $push: {
                            volunteer_event: store
                        }
                    }, (err, data1) => {
                        if (err) {
                            console.log("Error Occured during Insertion");
                            console.log(err);

                        } else {
                            res.json(data1);
                            console.log("Applied Successfully");

                        }
                        // req.flash("success", "Added");
                        // res.json(data1);
                        // console.log(data1);
                        // return res.redirect("/event_show");
                    })


                }
            }
        });
    });
});



router.get("/check_volunterring/:email", (req, res, next) => {
    // if (req.session.username) {

    const db = getdb();
    db.collection('Student').find({ "email": req.params.email }).toArray((err, data) => {
        if (data) {
            var count;
            var sid;
            sid = data[0]._id;
            student_status = data[0].stu_status;
            // db.collection('Main_Event').find().toArray((err,data2)=>{
            db.collection('Student').aggregate([{ $unwind: '$volunteer_event' }, { $match: { '_id': { $eq: sid } } }]).toArray((err, data2) => {
                // res.render('../views/main_side/check_volunteer_status', {
                //     s: data2,

                //     message: req.flash("success")
                // });
                if (err) {
                    res.json(err);
                } else {
                    // res.data(data2);
                    console.log(data[0].volunteer_status);
                    res.json(data[0].volunteer_status);
                    console.log(data2);
                }
            });
        } else {
            console.log("Not Applied re");
        }
    });


    // } else {
    //     return res.redirect("/login");
    // }
});
module.exports = router;