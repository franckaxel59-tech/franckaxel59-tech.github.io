document.addEventListener('DOMContentLoaded', function () {
  var emailUser = 'Franckaxelk26';
  var emailDomain = 'gmail.com';
  var email = emailUser + '@' + emailDomain;

  var telParts = ['+33', '7', '59', '61', '82', '15'];
  var telHref = telParts.join('');
  var telDisplay = telParts.join(' ');

  var emailLink = document.getElementById('contact-email-link');
  var emailText = document.getElementById('contact-email-text');
  if (emailLink && emailText) {
    emailLink.addEventListener('click', function (e) {
      if (emailLink.href.indexOf('mailto:') === 0) return;
      e.preventDefault();
      emailLink.href = 'mailto:' + email;
      emailText.textContent = email;
    });
  }

  var telLink = document.getElementById('contact-tel-link');
  var telText = document.getElementById('contact-tel-text');
  if (telLink && telText) {
    telLink.addEventListener('click', function (e) {
      if (telLink.href.indexOf('tel:') === 0) return;
      e.preventDefault();
      telLink.href = 'tel:' + telHref;
      telText.textContent = telDisplay;
    });
  }
});
