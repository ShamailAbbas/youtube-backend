const express = require('express')
const router = express.Router()
const multer = require('multer')
var ffmpeg = require('fluent-ffmpeg')
let path = require('path')
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
    if (ext !== '.mp4') {
      return cb(res.status(400).end('only jpg, png, mp4 is allowed'), false)
    }
    cb(null, true)
  },
})

var upload = multer({ storage: storage }).single('file')

//=================================
//             User
//=================================

router.post('/uploadfiles', (req, res) => {
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

router.post('/thumbnail', (req, res) => {
  let thumbsFilePath = ''
  let fileDuration = ''
                                      
  //====================================================================
  //      To get the video duration
  //====================================================================  


  ffmpeg.ffprobe(req.body.filePath, function (err, metadata) {
    fileDuration = metadata.format.duration
  })

   //===============================================================================
  // To generate thumbnails from the videos automatically
  //================================================================================= 
    
  ffmpeg(req.body.filePath)
    .on('filenames', function (filenames) {
      thumbsFilePath = 'uploads/thumbnails/' + filenames[0]
    })
    .on('end', function () {
      return res.json({
        success: true,
        thumbsFilePath: thumbsFilePath,
        fileDuration: fileDuration,
      })
    })
    .screenshots({
      // Will take screens at 20%, 40%, 60% and 80% of the video
      count: 3,
      folder: 'uploads/thumbnails',
      size: '320x240',
      // %b input basename ( filename w/o extension )
      filename: 'thumbnail-%b.png',
    })


})


router.post('/uploadVideo', (req, res) => {
  const video = new Video(req.body)
  console.log('video is >>' + video)
  video.save((err, video) => {
    if (err) return res.status(400).json({ success: false, err })
    return res.status(200).json({
      success: true,
    })
  })
})


module.exports = router
