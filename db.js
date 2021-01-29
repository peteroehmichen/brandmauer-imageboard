const spicedPg = require("spiced-pg");
const sql = spicedPg(
    process.env.DATABASE_URL ||
        "postgres:postgres:postgres@localhost:5432/adobo-imageboard"
);

module.exports.getAllImages = function () {
    return sql
        .query("SELECT * FROM images;")
        .then((result) => {
            const images = [];
            result.rows.forEach((img) => {
                images.push(img);
            });
            return images;
        })
        .catch((err) => {
            console.log("Error fetching Images:", err);
            return [];
        });
}; // maybe I want to reduce the number of infos for this requests later...
