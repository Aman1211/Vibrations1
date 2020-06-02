const getdb = require("../db").getdb;
const mongodb = require("mongodb");
const express = require("express");
const path = require("path");
const router = express();



// user side routers


router.get("/show_Products", (req, res, next) => {
    {
        const db = getdb();
        db.collection("Product").find({}).toArray((err, data) => {
            // res.render("user/show/show_Products", {
            if (err) {
                res.json(err);
            } else {
                res.json(data);
                // console.log(data);
            }
        });

    }

});

router.post("/adding_Products", (req, res, next) => {

    const userId = req.body.email;

    const db = getdb();
    db.collection("Student").findOne({ "email": userId }, (err, data) => {
        if (data) {
            let productList = data.product;
            let isOrdered = 0;
            const prodid = mongodb.ObjectID(req.body.Product_id);
            for (let i = 0; i < productList.length; i++) {
                if (productList[i].toString() === prodid.toString()) {
                    console.log("Product already Added to your cart. You can order only one unit of a particular type of product.");
                    isOrdered = 1;
                    res.json(isOrdered);
                    break;
                }
            }
            if (isOrdered === 0) {
                db.collection("Student").update({ "email": userId }, { $push: { product: prodid } }, function(err, result) {
                    if (result) {
                        res.json(isOrdered);
                        console.log("Product Added Successfully to cart");
                    } else {
                        console.log("Error Occured during adding product to cart");
                    }

                });


            }
        }
        // else {
        //     res.redirect('/login');
        // }
    });
});
router.post("/show_Products", (req, res, next) => {

    const userId = req.session.username;

    const db = getdb();
    db.collection("Student").findOne({ "email": userId }, (err, data) => {
        if (data) {
            let productList = data.product;
            let isOrdered = 0;
            const prodid = mongodb.ObjectID(req.query.goodiesid);
            for (let i = 0; i < productList.length; i++) {
                if (productList[i].toString() === prodid.toString()) {
                    console.log("Product already Added to your cart. You can order only one unit of a particular type of product.");
                    isOrdered = 1;
                    break;
                }
            }
            if (isOrdered === 0) {
                db.collection("Student").update({ "email": userId }, { $push: { product: prodid } }, function(err, result) {
                    if (result) {
                        console.log("Product Added Successfully to cart");
                    } else {
                        console.log("Error Occured during adding product to cart");
                    }

                });


            }
        } else {
            res.redirect('/login');
        }
    });
});


router.get("/show_Order", (req, res, next) => {
    const userId = req.session.username;
    const db = getdb();
    db.collection("Student")
        .aggregate([{ $match: { email: userId } }, { $lookup: { from: "Product", localField: "product", foreignField: "_id", "as": "data" } }])
        .toArray((err, result) => {
            if (!err) {
                console.log(result);
                res.render("user/show/show_Order", { Products: result });
            } else {
                res.redirect('/login');
            }
        });
});
router.post('/delete_from_Order', (req, res, next) => {

    const userId = req.session.username;

    const db = getdb();
    db.collection("Student").findOne({ "email": userId }, (err, data) => {
        if (data) {
            let productList = data.product;
            const prodid = mongodb.ObjectID(req.query.goodiesid);
            db.collection("Student").update({ "email": userId }, { $pull: { product: prodid } }, function(err, result) {
                if (result) {
                    console.log("Product Deleted Successfully from cart");
                } else {
                    console.log("Error Occured while deleting product from cart");
                }

            });


        }
        res.redirect('/show_Order');

    });

})

module.exports = router;