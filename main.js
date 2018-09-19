const AWS = require('aws-sdk');
const cli = require('cli');

const puppeteer = require('puppeteer');

const cliParams = cli.parse({
  credentials: [ 'c', 'AWS credentials', 'string', '' ],
  password: [ 'p', 'password', 'string', ''],
  email: [ 'e', 'login email aka user name', 'mirka.lison@gmail.com'],
});

const password = cliParams.password;
const email = cliParams.email;

AWS.config.credentials = JSON.parse(cliParams.credentials);

const ses = new AWS.SES();

const emailParams = {
  Destination: {
    ToAddresses: [
      'mirka.lison@gmail.com'
    ],
  },
  Message: {
    Body: {
      Html: {
        Data: 'Booking successfull',
        Charset: "UTF-8",
      },
      Text: {
        Data: 'Booking successfull',
        Charset: "UTF-8",
      }
    },
    Subject: {
      Data: 'Booking successfull',
      Charset: "UTF-8"
    }
  },
  Source: 'mirka.lison@gmail.com'
};

(async () => {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  await page.goto('https://polenow.com/login.php');
  await page.waitForSelector("[name=loginform]");
  await page.click("input[name=loginemail]");
  await page.type("input[name=loginemail]", email);
  await page.click("input[name=loginpassword]");
  await page.type("input[name=loginpassword]", password);
  await page.click("button[type=submit]");

  console.log(email, password);
  await page.waitForSelector("[class=CALENDARCONT]");
  console.log('login success');

  const handleButton = async (button) => {
    await page.screenshot({path: 'example.png', fullPage: true});
    await button.click();
    console.log('subscription success!');

    ses.sendEmail(emailParams, function(err, data) {
      if (err) {
        console.log(err, err.stack);
      }
      else {
        console.log('email sent');
        await browser.close();
      }
    });
  }

  const checkPage = async (index) => {
    try {
      await page.waitForSelector('.glyphicon-plus', {timeout: 10 * 1000});
    } catch (error) {
      console.log('no queued class found');
      await browser.close();
      return;
    }

    //for testing only - creates fake queue button
    // if(index === 1) {
    //   await page.evaluate(() => {
    //     let elem = document.querySelector('a[href*="classid=26306"][title="Book class"]');
    //     if(!elem) { return; }
    //     elem.classList.add('btn-warning');
    //   });
    // }

    const button = await page.$('.btn-warning');
    if(!button) {
      const forwardArrow = await page.$('.glyphicon-chevron-right');

      await forwardArrow.click();
      await page.waitForNavigation();

      console.log('next page');

      checkPage(index+1);
    } else {
      handleButton(button);
    }
  }
  checkPage(0);
})();