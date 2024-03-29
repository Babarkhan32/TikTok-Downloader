const express = require("express");
const Fs = require("fs");
const Path = require("path");
const app = express();
var bodyParser = require("body-parser");
const tiktok = require(".");
const cors = require("cors");
const rateLimit = require("express-rate-limit");
app.use(cors());

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per `window` (here, per 15 minutes)
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
});

// Apply the rate limiting middleware to all requests
app.use(limiter);
app.use(bodyParser.urlencoded({ extended: false }));
// parse application/json
app.use(bodyParser.json());
app.use(express.static(__dirname + "/media"));
app.post("/video", async function (req, res) {
  let videoUrl = req.body.videoUrl;
  console.log("put something", videoUrl);
  if (!videoUrl) {
    return res.status(412).json({
      message: "Video URL missing",
    });
  }
  // Add a check to make sure its a VALID URL
  const url = videoUrl;

  tiktok
    .tiklydown(url)
    .then((result) => {
      downloadingUrl = result.video.noWatermark;

      return res.status(200).json({
        success: true,
        data: downloadingUrl,
      });
      // function one(tasks) {
      //   tasks.run().catch((e) => {
      //     console.log(e);
      //     res.json({ message: "Some error occured" });
      //     throw new Error(e);
      //   });
      // }

      // if (process.argv) {
      //   const tasks = [
      //     {
      //       title: "Downloading",
      //       task: async (ctx, task) => {
      //         const url = downloadingUrl;
      //         const videoPath = Date.now() + "_video.mp4";
      //         const path = Path.resolve(__dirname, "media", videoPath);

      //         const response = await Axios({
      //           method: "GET",
      //           url: url,
      //           responseType: "stream",
      //         });

      //         response.data.pipe(Fs.createWriteStream(path));

      //         return new Promise((resolve, reject) => {
      //           response.data.on("end", () => {
      //             res.status(200).json({
      //               success: true,
      //               data: "http://localhost:8000/" + videoPath,
      //             });
      //             resolve();
      //           });

      //           response.data.on("error", (err) => {
      //             reject(err);
      //           });
      //         });
      //       },
      //     },
      //   ];

      //   one(new Listr(tasks));
      // }
    })
    .catch((e) => {
      console.log(e);
      return res.status(502).json({
        message: e.message,
      });
    });

  // tiktok
  //   .dlpanda(slider_url)
  //   .then((result) => {
  //     console.log(result);
  //   })
  //   .catch((e) => console.log(e));
});
app.get("/get-videos", async function (req, res) {
  try {
    Fs.readdir("media", (err, files) => {
      return res.status(200).json({
        data: files,
      });
    });
  } catch (exception) {
    console.log("exception", exception);
    return res.status(500).json({
      message: exception.message,
    });
  }
});
app.delete("/delete-video", async function (req, res) {
  try {
    const fileName = req.body.fileName;
    const path = Path.resolve(__dirname, "media", fileName);
    Fs.unlink(path, (err) => {
      if (err) {
        throw err;
      }

      return res.status(200).json({
        message: "file deleted successfully",
      });
    });
  } catch (exception) {
    console.log(exception);
    return res.status(500).json({
      message: exception.message,
    });
  }
});
app.listen(8000, function () {
  console.log("Listening on port 8000!");
});
