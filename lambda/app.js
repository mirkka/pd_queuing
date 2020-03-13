const AWS = require("aws-sdk")
const chromeLambda = require("chrome-aws-lambda")

exports.handler = async event => {
  const {
    PW,
    USERNAME,
  } = process.env

  var ses = new AWS.SES({
    region: 'eu-west-1'
  });

  let emailParams = {
    Destination: {
      ToAddresses: ["mirka.lison@gmail.com"]
    },
    Message: {
      Body: {
        Html: {
          Data: "",
          Charset: "UTF-8"
        },
        Text: {
          Data: `Subscription successfull! Booked at ${new Date()}`,
          Charset: "UTF-8"
        }
      },
      Subject: {
        Data: "Booking successfull",
        Charset: "UTF-8"
      }
    },
    Source: "mirka.lison@gmail.com"
  }

  // default browser viewport size
  const defaultViewport = {
    width: 1440,
    height: 1080
  }

  const browser = await chromeLambda.puppeteer.launch({
    args: chromeLambda.args,
    executablePath: await chromeLambda.executablePath,
    defaultViewport
  })

  const page = await browser.newPage()
  await page.goto("https://polenow.com/login.php")
  await page.waitForSelector("[name=loginform]")
  await page.click("input[name=loginemail]")
  await page.type("input[name=loginemail]", USERNAME)
  await page.click("input[name=loginpassword]")
  await page.type("input[name=loginpassword]", PW)
  await page.click("button[type=submit]")

  await page.waitForSelector("[class=CALENDARCONT]")
  console.log("login success")

  const handleButton = async (button, classDetails) => {
    await button.click()
    console.log(`Subscription successfull! Booked at ${new Date()}`)

    emailParams.Message.Body.Html.Data = `Subscription successfull! <br /> Class details: ${classDetails} <br />Booked at ${new Date()}`

    ses.sendEmail(emailParams, (err, data) => {
      if (err) {
        console.log("ERROR", err, err.stack)
      } else {
        console.log(new Date(), "email sent success")
      }
    })

    await logout()
    await browser.close()
    return
  }

  const logout = async () => {
    try {
      await page.waitForSelector('a[href*="action=logout"]', {
        timeout: 10 * 1000
      })
      const logoutButton = await page.$('a[href*="action=logout"]')
      await logoutButton.click()
      console.log('Logout success')
      console.log(new Date(), "Logout")
    } catch (error) {
      console.log(new Date(), error)
    }
  }

  const checkPage = async index => {
    try {
      await page.waitForSelector('.glyphicon-plus', {
        timeout: 10 * 1000
      })
      console.log('check page')
    } catch (error) {
      console.log(new Date(), "no queued class found")
      await logout()
      await browser.close()
      return
    }

    //Uncomment this for testing - creates fake queue button
    //change class ID in href selector
    // if(index === 1) {
    //   await page.evaluate(() => {
    //     let elem = document.querySelector('a[href*="classid=27299"][title="Book class"]');
    //     if(!elem) { return; }
    //     elem.classList.add('btn-warning');
    //   });
    // }

    const button = await page.$(".btn-warning")

    if (!button) {
      const forwardArrow = await page.$(".glyphicon-chevron-right")

      await forwardArrow.click()
      await page.waitForNavigation()

      console.log("next page", index + 1)

      await checkPage(index + 1)
    } else {
      const classDetails = await page.evaluateHandle(
        () =>
        document
        .querySelector(".btn-warning")
        .parentElement.querySelector(".classbutton").innerHTML
      )
      await handleButton(button, classDetails)
      return
    }
  }
  await checkPage(0)
}
