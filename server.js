const express = require("express");
const app = express();
const db = require("./db.js");

app.use(express.static("public"));

app.use((req, res, next) => {
    db.getAllImages();
    next();
});

let cities = [
    {
        name: "Berlin",
        country: "Germany",
    },
    {
        name: "Rome",
        country: "Italy",
    },
    {
        name: "London",
        country: "UK",
    },
];

app.get("/images", (req, res) => {
    db.getAllImages().then((images) => res.json(images));
});

app.listen(8080, () => {
    console.log("Imageboard is running...");
});
