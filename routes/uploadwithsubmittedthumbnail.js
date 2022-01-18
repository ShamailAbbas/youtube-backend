const express = require('express')
const router = express.Router()
const multer = require('multer')
const fs = require('fs');
let path = require('path')
const { getVideoDurationInSeconds } = require('get-video-duration')
const { Video } = require('../models/Video')


var storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/')
  },
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}_${file.originalname}`)
  },
  
  fileFilter: (req, file, cb) => {
    const ext = path.extname(file.originalname)
    if (ext !== '.mp4'|| ext!==".png" || ext!==".jpg" || ext!=="jpeg" || ext!=="PNG") {
      return cb(res.status(400).end('only jpg, png, mp4 is allowed'), false)
    }
    cb(null, true)
  },
})

var upload = multer({ storage: storage }).single('video')
 var uploadthumbnail = multer({ storage: storage }).single('thumbnail')


router.post('/uploadvideo', (req, res) => {
      upload(req, res, (err) => {      
     
    if (err) {
      return res.json({ success: false, err })
    }
    return res.json({
        success: true,
        filePath: res.req.file.path,
        fileName: res.req.file.filename,
        
      })
  })
})

router.post('/uploadthumbnail', (req, res) => {
    uploadthumbnail(req, res, (err) => {      
   
  if (err) {
      
    fs.unlink(req.body.filePath, function (err) {            
        if (err) {                                                 
            console.error(err);                                    
        }                                                          
       console.log('File has been Deleted');                           
    });


    return res.json({ success: false, err })
  }
const thumbnail=res.req.file.path

const {filePath,writer,title,description,privacy,category}=req.body
getVideoDurationInSeconds(filePath).then((duration) => {
  
 const video = new Video({writer,filePath,title,description,privacy,category,duration,thumbnail})
        console.log("video object is ",video)
        video.save((err, video) => {
          if (err) return res.status(400).json({ success: false, err })
          
          return res.status(200).json({
            success: true,
          })
        })
})
})
})

module.exports = router
