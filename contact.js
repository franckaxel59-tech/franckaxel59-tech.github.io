document.addEventListener('DOMContentLoaded', function () {
  var emailUser = 'Franckaxelk26';
  var emailDomain = 'gmail.com';
  var email = emailUser + '@' + emailDomain;


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
});
