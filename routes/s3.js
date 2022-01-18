const express = require("express");
const router = express.Router();
const aws = require("aws-sdk");
const multer = require("multer");
const multerS3 = require("multer-s3");
const { getVideoDurationInSeconds } = require('get-video-duration')
const { Video } = require('../models/Video')

const s3 = new aws.S3({
  accessKeyId: process.env.S3_ACCESS_KEY,
  secretAccessKey: process.env.S3_SECRET_ACCESS_KEY,
  region: process.env.S3_BUCKET_REGION,
});

const upload = (bucketName) =>
  multer({
    storage: multerS3({
      s3,
      bucket: bucketName,
      metadata: function (req, file, cb) {
        cb(null, { fieldName: file.fieldname });
      },
      key: function (req, file, cb) {
        cb(null, `${Date.now()}_${file.originalname}`);
      },
    }),
  });

  router.post("/uploadvideo", (req, res) => {
        console.log("from s3")
  const UploadVideoToS3 = upload(process.env.S3_BUCKET_NAME).single(
    "video"
  );

  UploadVideoToS3(req, res, async (err) => {
    if (err)
      return res.status(500).json({ success: false, message:"something went wrong..." });
  
    console.log("Video Name is ", req.file.filename)
    console.log("Video location is ", req.file.location)

    return res.json({
        success: true,
        filePath:req.file.location,
        fileName: req.file.filename,    
    }) 
    }); 
});

//======================================================================
//                        To uplaod the thumbnails
//======================================================================

router.post('/uploadthumbnail', (req, res) => {
    const UploadThumbnailToS3 = upload(process.env.S3_BUCKET_NAME).single(
        "thumbnail"
      );
      UploadThumbnailToS3(req, res, async (err) => {
        if (err)        
          return res.status(500).json({ success: false, message:"something went wrong..." });
      
        console.log("thumbnail name is ",req.file.filename)        
        console.log("thumbnail location is ",req.file.location)

        const thumbnail=req.file.location
        const {filePath,writer,title,description,privacy,category}=req.body

//===================================================================
//                         To get Video Duration
//===================================================================
getVideoDurationInSeconds(filePath).then((duration) => {
  
 const video = new Video({writer,filePath,title,description,privacy,category,duration,thumbnail})
        console.log("video object is ",video)

//===================================================================
//            Saving the video details to database
//===================================================================
        video.save((err, video) => {
          if (err) return res.status(400).json({ success: false, err })
          
          return res.status(200).json({
            success: true,
          })
        })
})       
})
})


module.exports = router;