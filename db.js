const spicedPg = require("spiced-pg");
const sql = spicedPg(
    process.env.DATABASE_URL ||
        "postgres:postgres:postgres@localhost:5432/adobo-imageboard"
);

module.exports.getImages = function (startId) {
    let param = [];
    let q;
    if (startId == 0) {
        // q =
        //     "SELECT *, (SELECT id FROM images ORDER BY id ASC LIMIT 1) AS lowest_id, (SELECT COUNT(id) FROM images) AS total FROM images ORDER BY id DESC LIMIT 6;";
        q =
            "SELECT *, (SELECT id FROM images ORDER BY id ASC LIMIT 1) AS lowest_id, (SELECT COUNT(id) FROM images) AS total, LAG(id, 1) OVER () AS younger, LEAD(id, 1) OVER () AS older FROM images ORDER BY id DESC LIMIT 6;";
        param = [];
    } else {
        // q =
        //     "SELECT *, (SELECT id FROM images ORDER BY id ASC LIMIT 1) AS lowest_id, (SELECT COUNT(id) FROM images) AS total FROM images WHERE id < $1 ORDER BY id DESC LIMIT 6;";
        q =
            "SELECT *, (SELECT id FROM images ORDER BY id ASC LIMIT 1) AS lowest_id, (SELECT COUNT(id) FROM images) AS total, LAG(id, 1) OVER () AS younger, LEAD(id, 1) OVER () AS older FROM images WHERE id < $1 ORDER BY id DESC LIMIT 6;";

        param = [startId];
    }
    return sql
        .query(q, param)
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
        .query(
            `WITH list AS (SELECT *, (SELECT id FROM images ORDER BY id ASC LIMIT 1) AS lowest_id, (SELECT COUNT(id) FROM images) AS total, LAG(id, 1) OVER () AS younger, LEAD(id, 1) OVER () AS older FROM images ORDER BY id DESC) SELECT * FROM list WHERE id=$1;`,
            [id]
        )
        .then((result) => result)
        .catch((err) => err);
    // return sql
    //     .query(`SELECT * FROM images WHERE id=$1;`, [id])
    //     .then((result) => result)
    //     .catch((err) => err);
};

module.exports.getComments = function (imageId) {
    return sql
        .query(
            `SELECT * FROM comments WHERE image_id=$1 ORDER BY created_at DESC;`,
            [imageId]
        )
        .then((result) => result)
        .catch((err) => err);
};

module.exports.addComment = function (imageId, username, comment, response) {
    // console.log("writing comment");
    const params = [imageId, username, comment, response];
    const q = `INSERT INTO comments (image_id, username, comment, response_to) VALUES ($1, $2, $3, $4) RETURNING id, created_at;`;
    return sql
        .query(q, params)
        .then((result) => result.rows)
        .catch((err) => err);
};

module.exports.deleteImage = function (imageId) {
    // console.log("running SQLDB deletion for", imageId);
    // return;
    return sql
        .query(`DELETE FROM comments WHERE image_id=$1;`, [imageId])
        .then((result) => {
            // console.log("Comment deleted: ", result);
            return sql
                .query(`DELETE FROM images WHERE id=$1;`, [imageId])
                .then((result) => result);
        })
        .catch((err) => err);
};

/*

*/
