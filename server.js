const express = require("express");
const app = express();
const db = require("./db.js");
const { uploader, uploadToAWS } = require("./upload.js");

app.use(express.static("public"));
app.use("/comment", express.urlencoded({ extended: false }));

app.get("/images/:start", (req, res) => {
    db.getImages(req.params.start)
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
        if (result.rowCount) {
            // console.log("SQL-DB upload successful - returned:", result);
            req.body.id = result.rows[0].id;
            req.body.created_at = result.rows[0].created_at;
            // console.log("new Image:", req.body);
            res.json(req.body);
        } else {
            res.json({ err: "server denied picture for unkown reason." });
        }
    });
});

app.get("/details/:id", (req, res) => {
    // console.log("Server received request for image with ID", req.params.id);
    db.getImageById(req.params.id).then((result) => {
        if (result.rowCount) {
            // console.log("SQL-DB for details successful - returned:", result);
            res.json(result.rows[0]);
        } else {
            res.json({ err: "server denied picture for unkown reason." });
        }
    });
});

app.get("/comments/:imageId", (req, res) => {
    db.getComments(req.params.imageId).then((result) => {
        res.json(result.rows);
    });
});

app.post("/comment", (req, res) => {
    console.log("post-object:", req.body);
    res.json("comment probably written");
});

app.listen(8080, () => {
    console.log("Imageboard is running...");
});

/*
to do: 
good error messages for 
    file to large
    
*/
