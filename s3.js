// const aws = require("aws-sdk");

// let secrets;
// if (process.env.NODE_ENV == "production") {
//     secrets = process.env; // in prod the secrets are environment variables
// } else {
//     secrets = require("./secrets"); // in dev they are in secrets.json which is listed in .gitignore
// }

// const s3 = new aws.S3({
//     accessKeyId: secrets.AWS_KEY,
//     secretAccessKey: secrets.AWS_SECRET,
// });

// exports.uploadToAWS = (req, res, next) => {
//     if (!req.file) {
//         res.sendStatus(500);
//     }

//     const fs = require("fs");
//     const { filename, mimetype, size, path } = req.file;
//     const promise = s3
//         .putObject({
//             Bucket: "oehmichen-imageboard",
//             ACL: "public-read",
//             Key: filename,
//             Body: fs.createReadStream(path),
//             ContentType: mimetype,
//             ContentLength: size,
//         })
//         .promise();

//     promise
//         .then(() => {
//             // it worked!!!
//             console.log("AWS Upload successfull");
//             fs.unlink(path, () => {});
//             next();
//         })
//         .catch((err) => {
//             // uh oh
//             console.log(err);
//         });
// };
