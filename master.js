(function () {
  var form = document.querySelector('#form-moolah'),
      amount = document.querySelector('#amount'),
      description = document.querySelector('#description'),
      payee = document.querySelector('#payee'),
      category = document.querySelector('#category'),
      payer = document.querySelector('#payer');

  function getUrlParameterByName (name) {
    name = name.replace(/[\[]/, '\\[').replace(/[\]]/, '\\]');
    var regex = new RegExp('[\\?&]' + name + '=([^&#]*)'),
        results = regex.exec(location.search);
    return results === null ? '' : decodeURIComponent(results[1].replace(/\+/g, ' '));
  }

  var defaultPayer = getUrlParameterByName('payer');

  if (defaultPayer) {
    payer.value = defaultPayer;
  }

  function submitMoolah (e) {
    e.preventDefault();
    if (!(Number(amount.value) > 0 && description.value.length)) {
      return;
    }

    mixpanel.track('Expense', {
      amount: Number(amount.value),
      description: description.value,
      payee: payee.value,
      category: category.options[category.selectedIndex].text,
      payer: payer.options[payer.selectedIndex].text,
    });

    [amount, description, payee, category].forEach(function (item) {
      item.value = '';
    })
  }

  form.addEventListener('submit', submitMoolah);
})();
