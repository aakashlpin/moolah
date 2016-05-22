(function(App) {
  App.viz = {
    draw: function () {
      firebase.database().ref('users/' + firebase.auth().currentUser.uid).once('value', function (snapshot) {
        var secret = snapshot.val().mixpanelSecret;
        $.ajax({
          dataType: "jsonp",
          url: 'https://'+ secret + '@mixpanel.com/api/2.0/segmentation/multiseg?event=Expense&type=general&limit=150&inner=number(properties%5B%22amount%22%5D)&outer=properties%5B%22category%22%5D&action=sum&unit=day&buckets=12&allow_more_buckets=false',
          success: function (response) {
            $('#chart')
              .find('.content').remove()
              .end()
              .html('<div class="content"></div>')
              .find('.content')
              .MPChart({chartType: 'pie', data: response.data.values});

            $('#table')
            .find('.content').remove()
            .end()
            .html('<div class="content"></div>')
            .find('.content')
            .MPTable({data: response.data.values});
          }
        })
      })
    }
  }
})(App)
