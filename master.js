(function (App) {
  var form = document.querySelector('#form-moolah'),
      amount = document.querySelector('#amount'),
      description = document.querySelector('#description'),
      payee = document.querySelector('#payee'),
      category = document.querySelector('#category'),
      payer;

  function submitMoolah (e) {
    e.preventDefault();
    var userId = firebase.auth().currentUser.uid;
    firebase.database().ref('users/' + userId).once('value').then(function(snapshot) {
      payer = snapshot.val().displayName;
      if (!(Number(amount.value) > 0 && description.value.length)) {
        return;
      }

      mixpanel.track('Expense', {
        amount: Number(amount.value),
        description: description.value,
        payee: payee.value,
        category: category.options[category.selectedIndex].text,
        payer: payer
      });

      [amount, description, payee, category].forEach(function (item) {
        item.value = '';
      })

      setTimeout(function () {
        // redraw after 10 secs to get fresh data from api
        App.viz.draw();
      }, 10000);
    });
  }

  form.addEventListener('submit', submitMoolah);
})(App);
