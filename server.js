const express = require("express");
const app = express();
const db = require("./db.js");
const { uploader, uploadToAWS, deleteFromAWS } = require("./upload.js");

app.use(express.static("public"));

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
            req.body.id = result.rows[0].id;
            req.body.created_at = result.rows[0].created_at;
            res.json(req.body);
        } else {
            res.json({ err: "server denied picture for unkown reason." });
        }
    });
});

app.get("/details/:id", (req, res) => {
    db.getImageById(req.params.id).then((result) => {
        if (result.rowCount) {
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

app.post("/comment", express.json(), (req, res) => {
    db.addComment(req.body.imageId, req.body.username, req.body.comment, req.body.response_to).then(
        (result) => {
            req.body.id = result[0].id;
            req.body.created_at = result[0].created_at;
            res.json(req.body);
        }
    );
});

app.post("/delete", express.json(), deleteFromAWS, (req, res) => {
    db.deleteImage(req.body.id).then((result)=>{
        res.json(result);
    });
});

if (require.main == module) {
    app.listen(process.env.PORT || 8080, () =>
        console.log("Imageboard is running...")
    );
}

/*
to do: 
good error messages for 
user input serverSide sterilisieren
protect against 
*/
