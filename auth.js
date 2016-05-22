(function () {
  // Initialize Firebase
  var config = {
    apiKey: "AIzaSyAgBLwiI_u2tVE8p1mpkezNRCAK1vsO0t8",
    authDomain: "moolah-5f9f7.firebaseapp.com",
    databaseURL: "https://moolah-5f9f7.firebaseio.com",
    storageBucket: "",
  };

  var app = firebase.initializeApp(config);

  var database = firebase.database();

  function registerUser(userId, data) {
    database.ref('users/' + userId).set(data);
  }

  function associateMixpanelWithUser(userId, mixpanelToken) {
    database.ref('users/' + userId).update({
      mixpanelToken: mixpanelToken
    })
  }

  function userRegistrationExists(userId, cb) {
    database.ref('users/' + userId).once('value', function (snapshot) {
      var val = snapshot.val();
      return cb(val ? val : false);
    })
  }

  function hideLoader() {
    document.querySelector('#loading-container').style.display = 'none';
  }

  function showMixpanelContainer() {
    document.querySelector('#mixpanel-token-container').style.display = 'block';
  }

  function showMoolahContainer() {
    document.querySelector('#moolah-container').style.display = 'block';
  }

  // FirebaseUI config.
  var uiConfig = {
   'signInSuccessUrl': location.href,
   'signInOptions': [
     firebase.auth.GoogleAuthProvider.PROVIDER_ID,
   ],
   // Terms of service url.
   'tosUrl': location.href,
  };

  var auth = app.auth();

  initApp = function() {
    auth.onAuthStateChanged(function(user) {
      if (user) {
        // User is signed in.
        var displayName = user.displayName;
        var email = user.email;
        var emailVerified = user.emailVerified;
        var photoURL = user.photoURL;
        var uid = user.uid;
        var providerData = user.providerData;
        user.getToken().then(function(accessToken) {
          userRegistrationExists(uid, function(user) {
            hideLoader();
            if (user) {
              if (!user.mixpanelToken) {
                // show an input box to accept a mixpanel token
                showMixpanelContainer();
              } else {
                // all good. associate mixpanel
                mixpanel.init(user.mixpanelToken);
                showMoolahContainer();
              }
            } else {
              registerUser(uid, {
                displayName: displayName,
                email: email,
                emailVerified: emailVerified,
                photoURL: photoURL,
                providerData: providerData,
                accessToken: accessToken
              });
              showMixpanelContainer();
            }
          })

        });
      } else {
        hideLoader();
        // User is signed out.
        var ui = new firebaseui.auth.AuthUI(auth);
        // The start method will wait until the DOM is loaded.
        ui.start('#firebaseui-auth-container', uiConfig);
      }
    }, function(error) {
      console.log(error);
    });
  };

  window.onload = function() {
    initApp()
  };

  var mixpanelForm = document.querySelector('#form-mixpanel');
  mixpanelForm.addEventListener('submit', function (e) {
    e.preventDefault();
    var token = document.querySelector('#token').value.trim();
    if (token.length === 32) {
      associateMixpanelWithUser(firebase.auth().currentUser.uid, token);
      mixpanel.init(token);
      document.querySelector('#mixpanel-token-container').style.display = 'none';
      showMoolahContainer();
    }
  })

})();
