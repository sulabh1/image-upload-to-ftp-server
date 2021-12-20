const express = require("express");
const multer = require("multer");
const path = require("path");
const os = require("os");

const tempDir = os.tmpdir();
console.log(tempDir);
const app = express();
app.use(express.json());

app.use(
  express.urlencoded({
    extended: true,
  })
);

//ftp config
const fs = require("fs");
const Client = require("ftp");

const c = new Client();

//multer configuration
const storage = multer.diskStorage({
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname));
  },
});

const upload = multer({
  storage,
  limits: {
    fileSize: "1000000",
  },
  fileFilter: (req, file, cb) => {
    const fileTypes = /jpeg|jpg|png|gif/;
    const mimType = fileTypes.test(file.mimetype);
    const extname = fileTypes.test(path.extname(file.originalname));

    if (mimType && extname) {
      return cb(null, true);
    }
    cb("Give proper files format to upload");
  },
});

app.post(
  "/pic",
  upload.single("files"),
  async (req, res) => {
    const pic = req.file.path;

    c.connect({
      host: "10.13.200.117",
      port: 21,
      user: "sulabh",
      password: "password",
    });
    c.on("ready", () => {
      fs.readFile(pic, (err, data) => {
        c.put(data, `${Date.now()}.jpeg`, (err) => {
          if (!err) {
            console.log("ok");
          } else {
            console.log(err);
          }
        });
      });
    });

    //console.log(pic);
    res.status(200).json({
      status: "success",
    });
  },
  (err, req, res, next) => {
    console.log(err);
    res.status(400).json({
      status: "fail",
      message: err.message,
    });
  }
);

app.set("port", process.env.PORT || 2000);

app.listen(app.get("port"), () => {
  console.log(`Listening to the port ${app.get("port")}`);
});
