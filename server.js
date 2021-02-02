const express = require("express");
const app = express();
const db = require("./db.js");
const { uploader, uploadToAWS } = require("./upload.js");

app.use(express.static("public"));

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

app.get("/details/:id", (req, res)=>{
    // console.log("Server received request for image with ID ", req.param);
    // console.log("Server received request for image with ID", req.params.id);
    db.getImageById(req.params.id).then((result)=>{
        if (result.rowCount) {
            // console.log("SQL-DB for details successful - returned:", result);
            res.json(result.rows[0]);
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
