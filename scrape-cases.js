const puppeteer = require("puppeteer");
const chalk = require("chalk");
var fs = require("fs");

const error = chalk.bold.red;
const success = chalk.keyword("green");

const SITE_URL = "http://lobis.nic.in/dhcindex.php?cat=1&hc=31";

(async () => {
  try {
    // open the headless browser
    var browser = await puppeteer.launch({ headless: true });
    // open a new page
    var page = await browser.newPage();
    // enter url in page
    await page.goto(SITE_URL);
    await page.waitForSelector('input[name="Submit3"]');

    const downloadLinks = await page.evaluate(async () => {
      // change this
      const dates = ["05/01/2018", "06/01/2018", "05/02/2018", "05/01/2016"];

      const downloadLinksObj = {};

      // define a function to wait for some milliseconds
      const wait = (amount = 0) =>
        new Promise(resolve => setTimeout(resolve, amount));

      for (let i = 0; i < dates.length; i++) {
        const date = dates[i];

        // find and click the judgement Date Button
        const judgementDateButton = document.querySelector(
          'input[name="Submit3"]'
        );
        judgementDateButton.click();

        await wait(1000);

        const iframe = document.querySelector("iframe");

        // find the dateInputField, fill the date and click submit
        const dateInputField = iframe.contentDocument.querySelector(
          'input[name="juddt"]'
        );
        dateInputField.value = date;

        const submitButton = iframe.contentDocument.querySelector(
          "#form3 > strong > p:nth-child(2) > input[type=submit]"
        );
        submitButton.click();

        await wait(1000);

        // find all the anchor tags and extract all the links
        const aLinks = iframe.contentDocument.querySelectorAll("a");
        const downloadLinks = [...aLinks].map(a => a.href);

        downloadLinksObj[date] = downloadLinks;
      }

      return downloadLinksObj;
    });

    await browser.close();
    // Writing the links inside a json file
    fs.writeFile("pdfLinks.json", JSON.stringify(downloadLinks), function(err) {
      if (err) throw err;
      console.log("Saved!");
    });

    console.log(success("Browser Closed"));
  } catch (err) {
    // Catch and display errors
    console.log(error(err));
    await browser.close();
    console.log(error("Browser Closed"));
  }
})();
