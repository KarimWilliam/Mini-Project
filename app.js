var express = require('express');
var bodyParser = require('body-parser');
var path = require('path');
var expressValidator = require('express-validator');
var mongojs = require('mongojs');
var db = mongojs('miniproject', ['users']);
//var mongoose = require('mongoose');

var app = express();

/*
var logger = function(req,res,next){
  console.log('logging...');
  next();
}

index.use(logger);
*/
//mongoose


///view Engine
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname,'views'));

//body parser middleware
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));


//set static path
//app.use(express.static(path.join(__dirname,'public')));

// Global vars
app.use (function(req,res,next){
  res.locals.errors = null;
  res.locals.errors2 = null;
  //res.locals.link = null;
  next();
});

// Express Validator Middleware
app.use(expressValidator({
  errorFormatter: function(param, msg, value) {
      var namespace = param.split('.')
      , root = namespace.shift()
      , formParam = root;

    while(namespace.length) {
      formParam += '[' + namespace.shift() + ']';
    }
    return {
      param : formParam,
      msg   : msg,
      value : value
    };
  }
}));

app.get('/',function(req,res){
  db.users.find( function (err, docs) {
    console.log(docs);
    res.render('index' , {
      title: 'customers',
      users: docs

    });
  })

});


// Submit link
app.post('/submit_link',function(req,res){

  var newlink = req.body.newlink;
  var user = req.body.user;

db.users.findOne(
  {User_name : user},
    function(err,doc){
      var curlist = doc.links
      curlist.push(newlink)

      db.users.findAndModify({
        query:{User_name : user},
        update: {$set: {links : curlist}},
        new: true
      }, function (err, doc, lastErrorObject) {

        res.render('profile' , {
          links: curlist,
          images: doc.images,
          User_name: doc.User_name,
          profile_picture: doc.profile_picture
        });
      })
    })
  })


  // Submit IMG
  app.post('/submit_img_link',function(req,res){

    var newlink = req.body.newlink;
    var user = req.body.user;

  db.users.findOne(
    {User_name : user},
      function(err,doc){
        var curlist = doc.images
        curlist.push(newlink)

        db.users.findAndModify({
          query:{User_name : user},
          update: {$set: {images : curlist}},
          new: true
        }, function (err, doc, lastErrorObject) {

          res.render('profile' , {
            links: doc.links,
            images: doc.images,
            User_name: doc.User_name,
              profile_picture: doc.profile_picture
          });
        })
      })
    })


    // Change profile picture
    app.post('/submit_pic',function(req,res){

      var newlink = req.body.newlink;
      var user = req.body.user;

    db.users.findOne(
      {User_name : user},
        function(err,doc){
          var curlist = doc.profile_picture


          db.users.findAndModify({
            query:{User_name : user},
            update: {$set: {profile_picture : newlink}},
            new: true
          }, function (err, doc, lastErrorObject) {

            res.render('profile' , {
              links: doc.links,
              images: doc.images,
              User_name: doc.User_name,
              profile_picture:newlink
            });
          })
        })
      })
/
//outsider profile
app.post("/user/prof", function(req,res){

      var user = req.body.user;
    db.users.findOne(
      {User_name : user},
        function(err,doc){
  console.log(user);
  console.log(doc);
          res.render('outsiderProfile' , {

            links: doc.links,
            images: doc.images,
            User_name: user,
            profile_picture: doc.profile_picture

          });

        })
})

// REGISTER
app.post('/users/add', function(req,res){

req.checkBody('User_name', 'User name is  required').notEmpty();
req.checkBody('password', 'password is  required').notEmpty();
req.checkBody('email', 'email is  required').notEmpty();


var errors = req.validationErrors();

if(errors){
  res.render('index' , {
    title: 'customers',
    errors: errors

  });


} else {
  var User_name = req.body.User_name;
  var password = req.body.password;
  var email = req.body.password;
  var access = req.body.studentclient;

  var newUser = {
    User_name: req.body.User_name,
    password: req.body.password,
    email: req.body.email,
    access: req.body.studentclient,
    links: [],
    images: [],
    profile_picture: "https://bit.ly/fcc-relaxing-cat"
}

db.users.insert(newUser,function(err,result){
  if(err){
    console.log(err);
  }

  res.render('index' , {
    title: 1


  });
});

}

});


//go to main page
app.get('/mainpage',function(req,res){
db.users.find( function (err, docs) {

  res.render('mainPage' , {
    users: docs

  });
})
})



//LOGIN LOGIN LOGIN LOGIN
app.post('/users/login', function(req,res){

req.checkBody('User_name', 'User name is  required').notEmpty();
req.checkBody('password', 'password is  required').notEmpty();


var errors = req.validationErrors();

if(errors){
  res.render('index' , {
    title: 'customers',
    errors: errors

  });


} else {


    var user = req.body.User_name;
    var pass = req.body.password;
    var found = 0;

    db.users.find( function (err, docs) {

      docs.forEach(function(entry) {

        if(entry.User_name == user && entry.password == pass){
              console.log(entry.User_name);
              found =1;
              var access = entry.access;

                if(access=='student')
                {
                  res.render('profile' , {
                    links: entry.links,
                    images: entry.images,
                    User_name: user,
                    profile_picture: entry.profile_picture

                  });
                }else {

                  res.render('mainPage' , {
                    users: docs

                  });

                }
          }

      });

    if (found == 0){
      console.log('wrong user/password combination')

      res.render('index' , {
        title: 'customers',
        errors2: 'on'

      });
    }

    })

}

});


app.listen(3000,function() {
console.log('server started on port 3000...')
})
