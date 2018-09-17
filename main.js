// .btn-warning 
// div .classbutton > strong contains text

const puppeteer = require('puppeteer');

(async () => {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  await page.goto('https://polenow.com/login.php');
  await page.waitForSelector("[name=loginform]");
  await page.click("input[name=loginemail]");
  await page.type("input[name=loginemail]", 'mirka.lison@gmail.com');
  await page.click("input[name=loginpassword]");
  await page.type("input[name=loginpassword]", 'predator');
  await page.click("button[type=submit]");

  await page.waitForSelector("[class=CALENDARCONT]");
  console.log('login success');

  const handleButton = async (button) => {
    await button.screenshot({path: 'example.png'});
    await button.click();
    console.log('subscription success!');
    await browser.close();
  }

  const checkPage = async (index) => {
    await page.screenshot({path: 'example.png'});
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