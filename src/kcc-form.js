var API_URL =
  process.env.NODE_ENV === 'development' ? 'https://kc-emea-staging.azurewebsites.net' : '';

function qs(str) {
  var search = str;
  search = search.replace(/^\?/, '');

  var arr = search.split('&');
  var result = {};
  arr.forEach(function(a) {
    var items = a.split('=');

    result[items[0]] = items[1];
  });

  return result;
}

var app = new Vue({
  el: '#app',
  data: {
    labels: {
      comments: 'Comment',
      disclaimer:
        'I agree to my personal data being processed in accordance with the {{Privacy Policy}} and agree to the {{Terms of Use}}',
      email: 'Email',
      file_Upload: 'File Upload',
      name: 'Name',
      requiredMessage: 'should not be empty',
      placeholder: 'Leave your comment here.',
      submissionConsentMessage: 'Please accept the consent condition.',
      typeMismatchMessage: 'is not in the correct format.',
      submit: 'Submit',
      policyLink: 'https://www.kcprofessional.co.uk/privacy-policy',
      termLink: 'https://www.kcprofessional.co.uk/terms-of-use'
    },
    errorMessage: '',
    returnUrl: window.location.origin + '/success.html'
  },
  computed: {
    disclaimer: function() {
      var str = this.labels.disclaimer;
      var reg = /\{\{((\w+\s?)*)\}\}/;
      str = str.replace(reg, '<a href="' + this.labels.policyLink + '" target="_blank">$1</a>');
      str = str.replace(reg, '<a href="' + this.labels.termLink + '" target="_blank">$1</a>');

      return str;
    }
  },
  methods: {
    handleInvalid: function(e) {
      var el = e.target;
      var value = e.target.value;
      if (el.validity.valueMissing && this.labels.requiredMessage) {
        el.setCustomValidity((el.dataset.label || el.name) + ' ' + this.labels.requiredMessage);
      } else if (el.validity.typeMismatch && this.labels.typeMismatchMessage) {
        el.setCustomValidity((el.dataset.label || el.name) + ' ' + this.labels.typeMismatchMessage);
      } else {
        el.setCustomValidity('');
      }
    },
    handleSubmit: function() {
      var formData = new FormData(this.$el);
      var params = qs(window.location.search);

      axios
        .post(params.action, formData)
        .then(
          function(resp) {
            this.$el.submit();
          }.bind(this)
        )
        .catch(
          function(error) {
            this.errorMessage = error.response.data.message;
          }.bind(this)
        );
    }
  }
});

axios.get(API_URL + '/api/setting/languageSetting').then(function(resp) {
  var params = qs(window.location.search);
  var lang = params.lang;

  var currentLanguageData = resp.data.find(function(d) {
    return d.languageCode === lang;
  });
  if (currentLanguageData) {
    app.labels = currentLanguageData.formLabels;
  }
});
