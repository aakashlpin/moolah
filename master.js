(function () {
  var form = document.querySelector('#form-moolah'),
      amount = document.querySelector('#amount'),
      description = document.querySelector('#description'),
      payee = document.querySelector('#payee'),
      category = document.querySelector('#category');

  function submitMoolah (e) {
    e.preventDefault();
    if (!(Number(amount.value) > 0 && description.value.length)) {
      return;
    }

    mixpanel.track('Expense', {
      amount: Number(amount.value),
      description: description.value,
      payee: payee.value,
      category: category.value,
    });

    [amount, description, payee, category].forEach(function (item) {
      item.value = '';
    })
  }

  form.addEventListener('submit', submitMoolah);
})();
