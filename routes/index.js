var express = require('express');
var router = express.Router();

// DB 연결
var mongoose = require('mongoose');
var locationModel = require('../public/models/flower_location.js');

let db = mongoose.connection;
db.on('error', console.error);
db.once('open', () => {
  console.log('connected to mongoose server');
})

mongoose.connect(process.env.MONGODBURI
  , { useNewUrlParser: true, useUnifiedTopology: true });


/* GET home page. */
router.get('/', function (req, res, next) {
  res.render('home', { naverkey : process.env.NAVERKEY });
});

router.get('/add', function (req, res, next) {
  res.render('add', { kakaokey : process.env.KAKAOKEY });
});


router.post('/flower_fetch', function (req, res, next) {
  let season = req.body.season;
  console.log("season:",season);
  let filter = (season=="전체") ? {} : {season};
  locationModel.find(filter)
    .then((result) => {
      res.json({ message: "success", data: result })
    }).catch((error) => {
      res.json({ message: "error" });
    })
});


router.post('/flower_register', function (req, res, next) {
  let location = new locationModel();
  let body = req.body;
  location.flower_type = body.flower_type;
  location.season = body.season;
  location.lat = body.lat;
  location.lng = body.lng;
  // save to db
  location.save()
    .then((result) => {
      res.json({ message: "success", data: result })
    })
    .catch((error) => {
      console.log(error);
      res.json({ message: "failed" });
    })
});

//db delete by id
router.post('/flower_delete', function (req, res, next) {
  let id = req.body.id;
  locationModel.findByIdAndRemove(id, function (error, docs) {
    if (error) {
      console.log(error)
      res.json({ message: "failed" });
    }
    else {
      res.json({ message: "success", data: docs })
    }
  });
});

module.exports = router;
