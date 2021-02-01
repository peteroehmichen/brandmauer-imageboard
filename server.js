const express = require("express");
const app = express();
const db = require("./db.js");
const { uploader, uploadToAWS } = require("./upload.js");
// const s3 = require("./s3");
app.use(express.static("public"));

// app.use((req, res, next) => {
//     db.getAllImages();
//     next();
// });

app.get("/images", (req, res) => {
    db.getAllImages()
        .then((images) => res.json(images))
        .catch(() => res.json({ err: "could not load pictures" }));
});

app.post("/upload", uploader.single("file"), uploadToAWS, (req, res) => {
    db.addNewImage(
        req.body.url,
        req.body.username,
        req.body.title,
        req.body.description
    ).then((result) => {
        // console.log("error DB:", result);
        if (result.rowCount) {
            console.log("SQL-DB upload successful");
            res.json(req.body);
        } else {
            res.json({ err: "server denied picture for unkown reason." });
        }
    });
});

app.listen(8080, () => {
    console.log("Imageboard is running...");
});

/*
to do: 
good error messages for 
    file to large
    


*/
