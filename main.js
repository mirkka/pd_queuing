const AWS = require('aws-sdk');
const cli = require('cli');

const puppeteer = require('puppeteer');

const cliParams = cli.parse({
  credentials: [ 'c', 'AWS credentials', 'string', '' ],
  password: [ 'p', 'password', 'string', ''],
  email: [ 'e', 'login email aka user name', 'string', 'mirka.lison@gmail.com'],
});

const password = cliParams.password;
const email = cliParams.email;

let awsCredentials = {};
let awsRegion;

try {
  const parsedCredentials = JSON.parse(cliParams.credentials);
  awsCredentials.email = parsedCredentials.email;
  awsCredentials.password = parsedCredentials.password;
  awsRegion = parsedCredentials.region;
} catch (error) {
  console.log(new Date(), 'ERROR', error);
  return;
}

AWS.config.credentials = JSON.parse(cliParams.credentials);
AWS.config.region = JSON.parse(cliParams.credentials).region;

const ses = new AWS.SES();

let emailParams = {
  Destination: {
    ToAddresses: [
      'mirka.lison@gmail.com'
    ],
  },
  Message: {
    Body: {
      Html: {
        Data: '',
        Charset: "UTF-8",
      },
      Text: {
        Data: `Subscription successfull! Booked at ${new Date()}`,
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

  await page.waitForSelector("[class=CALENDARCONT]");
  console.log('login success');

  const handleButton = async (button, classDetails) => {
    await page.screenshot({path: 'screenshot.png', fullPage: true});
    await button.click();
    console.log(`Subscription successfull! Booked at ${new Date()}`);

    emailParams.Message.Body.Html.Data = `Subscription successfull! <br /> Class details: ${classDetails} <br />Booked at ${new Date()}`

    ses.sendEmail(emailParams, (err, data) => {
      if (err) {
        console.log('ERROR',err, err.stack);
      } else {
        console.log(new Date(), 'email sent success');
      }
    });

    await logout();
    await browser.close();
  }

  const logout = async () => {
    try {
      await page.waitForSelector('a[href*="action=logout"]', {timeout: 10 * 1000});
      const logoutButton = await page.$('a[href*="action=logout"]');
      await logoutButton.click();
      console.log(new Date(), 'Logout');
    } catch (error) {
      console.log(new Date(), error);
    }
  }

  const checkPage = async (index) => {
    try {
      await page.waitForSelector('.glyphicon-plus', {timeout: 10 * 1000});
    } catch (error) {
      console.log(new Date(), 'no queued class found');
      await logout();
      await browser.close();
      return;
    }

    //for testing only - creates fake queue button
    //change class ID in href selector
    // if(index === 0) {
    //   await page.evaluate(() => {
    //     let elem = document.querySelector('a[href*="classid=26677"][title="Book class"]');
    //     if(!elem) { return; }
    //     elem.classList.add('btn-warning');
    //   });
    // }

    const button = await page.$('.btn-warning');

    if(!button) {
      const forwardArrow = await page.$('.glyphicon-chevron-right');

      await forwardArrow.click();
      await page.waitForNavigation();

      console.log('next page', index+1);

      checkPage(index+1);
    } else {
      const classDetails = await page.evaluateHandle(() => document.querySelector('.btn-warning').parentElement.querySelector('.classbutton').innerHTML);
      handleButton(button, classDetails);
    }
  }
  checkPage(0);
})();