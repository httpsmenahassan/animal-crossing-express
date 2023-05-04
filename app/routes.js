// worked with mentor Mark on this

// model is the schema, gives stucture to the database, structure for what makes it into the database, the passport handles creating the users. the modle nothing is expected to be changed there


// module.export is exporting from our server to this routes file

module.exports = function (app, passport, db) {

  // gives us access to the ObjectId function which converts a string to the ObjectId
  const ObjectId = require('mongodb').ObjectID

  // normal routes ===============================================================

  // show the home page (will also have our login links)
  app.get('/', function (req, res) {
    res.render('index.ejs');
  });

  // PROFILE SECTION =========================
  app.get('/profile', isLoggedIn, async function (req, res) {
    // gets all villagers as an array
    const villagers = await db.collection('villagers').find().toArray()
    console.log(villagers)
    // because this is done as a GET rather than a POST we're using req.query rather than req.body
    if (req.query.villagerId) {
      const villagerFromMongo = await db.collection('villagers').findOne({ _id: ObjectId(req.query.villagerId) })
      res.render('profile.ejs', {
        user: req.user,
        villagers: villagers,
        // needs to match the variable name in the profile.ejs loop
        // villager: property allows us to create a variable in the profile.ejs page called villager which has the value of the villager we got from MongoDB on line 21
        // villagerFromMongo is the entire villager object
        selectedVillager: villagerFromMongo,
        totalGifts: 10,
      })
    } else {
      res.render('profile.ejs', {
        user: req.user,
        villagers: villagers,
        // needs to match the variable name in the profile.ejs loop
        // villager: property allows us to create a variable in the profile.ejs page called villager which has the value of the villager we got from MongoDB on line 21
        // villagerFromMongo is the entire villager object
        // selectedVillager is null because the user hasn't selected an option yet
        selectedVillager: null,
        totalGifts: 10,
      })
    }
  })
  // LOGOUT ==============================
  app.get('/logout', function (req, res) {
    req.logout(() => {
      console.log('User has logged out!')
    });
    res.redirect('/');
  });

  // message board routes ===============================================================

  app.post('/messages', (req, res) => {
    db.collection('villagers').save({ name: req.body.name, msg: req.body.msg, thumbUp: 0, thumbDown: 0 }, (err, result) => {
      if (err) return console.log(err)
      console.log('saved to database')
      res.redirect('/profile')
    })
  })

  app.put('/villager', (req, res) => {
    console.log(req.body)
    console.log(req.user._id.toString())
    // if main.js sends true, we want to like the villager, otherwise unlike it
    if (req.body.like === true) {
      db.collection('villagers')
        .findOneAndUpdate({ _id: ObjectId(req.body.villagerId) }, {
          $push: {
            likes: req.user._id.toString()
          }
        }, (err, result) => {
          if (err) return res.send(err)
          res.send(result)
        })
    } else {
      db.collection('villagers')
        .findOneAndUpdate({ _id: ObjectId(req.body.villagerId) }, {
          $pull: {
            likes: req.user._id.toString()
          }
        }, (err, result) => {
          if (err) return res.send(err)
          res.send(result)
        })
    }
  })

  app.delete('/messages', (req, res) => {
    db.collection('villagers').findOneAndDelete({ name: req.body.name, msg: req.body.msg }, (err, result) => {
      if (err) return res.send(500, err)
      res.send('Message deleted!')
    })
  })

  // =============================================================================
  // AUTHENTICATE (FIRST LOGIN) ==================================================
  // =============================================================================

  // locally --------------------------------
  // LOGIN ===============================
  // show the login form
  app.get('/login', function (req, res) {
    res.render('login.ejs', { message: req.flash('loginMessage') });
  });

  // process the login form
  app.post('/login', passport.authenticate('local-login', {
    successRedirect: '/profile', // redirect to the secure profile section
    failureRedirect: '/login', // redirect back to the signup page if there is an error
    failureFlash: true // allow flash messages
  }));

  // SIGNUP =================================
  // show the signup form
  app.get('/signup', function (req, res) {
    res.render('signup.ejs', { message: req.flash('signupMessage') });
  });

  // process the signup form
  app.post('/signup', passport.authenticate('local-signup', {
    successRedirect: '/profile', // redirect to the secure profile section
    failureRedirect: '/signup', // redirect back to the signup page if there is an error
    failureFlash: true // allow flash messages
  }));

  // =============================================================================
  // UNLINK ACCOUNTS =============================================================
  // =============================================================================
  // used to unlink accounts. for social accounts, just remove the token
  // for local account, remove email and password
  // user account will stay active in case they want to reconnect in the future

  // local -----------------------------------
  app.get('/unlink/local', isLoggedIn, function (req, res) {
    var user = req.user;
    user.local.email = undefined;
    user.local.password = undefined;
    user.save(function (err) {
      res.redirect('/profile');
    });
  });

};

// route middleware to ensure user is logged in
function isLoggedIn(req, res, next) {
  if (req.isAuthenticated())
    return next();

  res.redirect('/');
}
