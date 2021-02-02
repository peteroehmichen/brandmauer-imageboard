const spicedPg = require("spiced-pg");
const sql = spicedPg(
    process.env.DATABASE_URL ||
        "postgres:postgres:postgres@localhost:5432/adobo-imageboard"
);

module.exports.getAllImages = function () {
    return sql
        .query("SELECT * FROM images ORDER BY created_at DESC;")
        .then((result) => result.rows)
        .catch((err) => {
            console.log("Error fetching Images:", err);
            return [];
        });
}; // maybe I want to reduce the number of infos for this requests later...

module.exports.addNewImage = function (url, username, title, description) {
    const params = [url, username, title, description];
    const q = `INSERT INTO images (url, username, title, description) VALUES ($1, $2, $3, $4) RETURNING id, created_at;`;
    return sql
        .query(q, params)
        .then((result) => result)
        .catch((err) => err);
};

module.exports.getImageById = function (id) {
    return sql
        .query(`SELECT * FROM images WHERE id=$1;`, [id])
        .then((result) => result)
        .catch((err) => err);
}