const ASH = require('aws-ses-helper');
const AWS = require('aws-sdk');
const fs = require('fs');
const ses = new AWS.SES();
const params = JSON.parse(fs.readFileSync('config.json'));

exports.handler = (event, context) => {
  let checker = new ASH.CaptchaChecker(params.captchaSecret, event.captchaResponse);
  let template = new ASH.EmailTemplate('files/message.twig', {
    Name: event.name,
    Email: event.email,
    Phone: event.phone,
    Message: event.message
  });

  checker.checkCaptcha()
    .then(res => {
      return (!res.success) ? Promise.reject('The security code is invalid or expired') : Promise.resolve();
    })
    .then(() => template.render())
    .then(html => {
      return Promise.resolve({
        sourceEmail: params.emailFrom,
        destinationEmails: params.emailTo,
        subject: event.subject,
        body: html
      });
    })
    .then(config => {
      return Promise.resolve(new ASH.EmailSender(ses, config).sendEmail());
    })
    .then(res => {
      context.succeed(res);
    })
    .catch(err => {
      context.fail(err);
    });
};
