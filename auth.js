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

  function associateMixpanelWithUser(userId, data) {
    return database.ref('users/' + userId).update(data)
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

  function initViz (secret) {
    MP.api.setCredentials(secret);

    $.ajax({
      dataType: "jsonp",
      url: 'https://'+ secret + '@mixpanel.com/api/2.0/segmentation/multiseg?event=Expense&type=general&limit=150&inner=number(properties%5B%22amount%22%5D)&outer=properties%5B%22category%22%5D&action=sum&unit=day&buckets=12&allow_more_buckets=false',
      success: function (response) {
        $('#chart').MPChart({chartType: 'pie', data: response.data.values});
        $('#table').MPTable({data: response.data.values});
      }
    })
  }

  function showMoolahContainer(secret) {
    document.querySelector('#moolah-container').style.display = 'block';
    initViz(secret);
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
              if (!user.mixpanelToken || !user.mixpanelSecret) {
                // show an input box to accept a mixpanel token
                if (user.mixpanelToken) {
                  document.querySelector('#token').value = user.mixpanelToken;
                }
                if (user.mixpanelSecret) {
                  document.querySelector('#secret').value = user.mixpanelSecret;
                }
                showMixpanelContainer();

              } else {
                // all good. associate mixpanel
                mixpanel.init(user.mixpanelToken);
                showMoolahContainer(user.mixpanelSecret);
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
    var secret = document.querySelector('#secret').value.trim();
    var updateWith = {};
    if (token.length === 32) {
      updateWith.mixpanelToken = token;
      mixpanel.init(token);
    }
    if (secret.length === 32) {
      updateWith.mixpanelSecret = secret;
    }
    associateMixpanelWithUser(firebase.auth().currentUser.uid, updateWith).then(function () {
      location.reload();
    })
  })

})();
