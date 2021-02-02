const multer = require("multer");
const uidSafe = require("uid-safe");
const path = require("path");
const { s3Url } = require("./config.json");
const fs = require("fs");

const diskStorage = multer.diskStorage({
    destination: function (req, file, callback) {
        callback(null, __dirname + "/uploads");
    },
    filename: function (req, file, callback) {
        uidSafe(24).then((uid) => {
            callback(null, uid + path.extname(file.originalname));
        });
    },
});

let secrets;
if (process.env.NODE_ENV == "production") {
    secrets = process.env; // in prod the secrets are environment variables
} else {
    secrets = require("./secrets"); // in dev they are in secrets.json which is listed in .gitignore
}

const aws = require("aws-sdk");
const s3 = new aws.S3({
    accessKeyId: secrets.AWS_KEY,
    secretAccessKey: secrets.AWS_SECRET,
});

module.exports.uploader = multer({
    storage: diskStorage,
    limits: {
        fileSize: 2097152,
    },
});

exports.uploadToAWS = (req, res, next) => {
    if (!req.file) {
        res.json({ err: "File does not match standards (max. 2MB, correct format, etc" });
    } else {
        const { filename, mimetype, size, path } = req.file;
        const promise = s3
            .putObject({
                Bucket: "oehmichen-imageboard",
                ACL: "public-read",
                Key: filename,
                Body: fs.createReadStream(path),
                ContentType: mimetype,
                ContentLength: size,
            })
            .promise();

        promise
            .then(() => {
                // it worked!!!
                // console.log("AWS Upload successful");
                fs.unlink(path, () => {});
                req.body.url = s3Url + req.file.filename;
                next();
            })
            .catch((err) => {
                // uh oh
                console.log(err);
            });
    }
};
