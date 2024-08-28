// multer.js
const multer = require("multer");

// Set up multer for handling image uploads
const upload = multer({
  limits: {
    fileSize: 1024 * 1024 * 2, // Limit file size to 2MB
  },
  fileFilter(req, file, cb) {
    if (!file.originalname.match(/\.(jpg|jpeg|png)$/)) {
      return cb(new Error("Please upload a JPG, JPEG, or PNG image."));
    }
    cb(null, true);
  },
});

module.exports = upload;
