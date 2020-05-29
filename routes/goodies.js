const getdb = require("../db").getdb;
const mongodb = require("mongodb");
const express = require("express");
const path = require("path");
const router = express();


router.get("/add_Goodies", (req, res, next) => {
    if (req.session.username) {
        res.render("admin/add/add_Goodies");
    } else {
        res.redirect("/login");
    }
});

router.post("/add_Goodies", (req, res, next) => {
    let product = {
        title: req.body.title,
        description: req.body.description,
        price: req.body.price,
        quantity: req.body.quantity,
        image: req.file.path
    }
    const db = getdb();
    db.collection("Product").insertOne(product, function(err) {
        if (err) {
            console.log("Error Occured during Insertion");
        }
        console.log("Data Inserted Successfully");
    });

    res.redirect("/add_Goodies");
});



//user side start
router.get("/view_Goodies", (req, res, next) => {

    {
        const db = getdb();
        db.collection("Product").find({}).toArray((err, data) => {
            res.render("admin/show/view_Goodies", {
                Products: data,
                user: req.session.username
            });
        });
    }

});


router.get("/edit_Goodies", (req, res, next) => {
    const ProductId = mongodb.ObjectID(req.query.goodiesid);

    const db = getdb();
    db.collection("Product").findOne({ "_id": ProductId }, (err, data) => {
        let oldProduct = {
            title: data.title,
            description: data.description,
            price: data.price,
            quantity: data.quantity,
            image: data.image
        }

        res.render("admin/edit/edit_Goodies", {
            Product: oldProduct,
            user: req.session.username
        })
    })

});


router.post("/edit_Goodies", (req, res, next) => {
    let product = {
        title: req.body.title,
        description: req.body.description,
        price: req.body.price,
        quantity: req.body.quantity,
        image: req.file.path
    }
    const id = mongodb.ObjectID(req.query.goodiesid);
    const db = getdb();
    db.collection("Product").updateOne({ _id: id }, { $set: product }, function(err) {
        if (!err) {
            console.log("Data Updated Successfully");
        } else {
            console.log("Error Occured during Updation");
        }

    });

    res.redirect("/view_Goodies");

});

router.post("/delete_Goodies", (req, res, next) => {

    const id = mongodb.ObjectID(req.query.goodiesid);
    const db = getdb();
    db.collection("Product").deleteOne({ _id: id }, function(err, result) {
        if (!err) {
            console.log("Data Deleted Successfully");
        } else {
            console.log("Error Occured during deleting data");
        }

    });

    res.redirect("/view_Goodies");

});

router.get("/view_Orders", (req, res, next) => {

    const id = mongodb.ObjectID(req.query.goodiesid);
    const db = getdb();
    db.collection("Product")
        .aggregate([{ $match: { _id: id } }, { $lookup: { from: "Student", localField: "_id", foreignField: "product", "as": "data" } }])
        .toArray((err, result) => {
            if (!err) {
                console.log(result);
                res.render("admin/show/view_Orders", { Students: result, user: req.session.username });
            } else {
                res.redirect('/login');
            }
        });



});


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