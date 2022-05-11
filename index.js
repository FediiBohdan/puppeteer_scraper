const puppeteer = require("puppeteer");
// const Excel = require("exceljs");

async function start() {
  // opens new instance of the browser
  // const browser = await puppeteer.launch();

  /**
   * Connects to the running web browser.
   * EndpointUrl changes everytime you relaunch the browser.
   * Go to http://127.0.0.1:9222/json/version to find current endpoint.
   */
  const wsChromeEndpointUrl =
    "ws://127.0.0.1:9222/devtools/browser/ec22e616-1916-4673-93de-516b3e9bfff1";
  const browser = await puppeteer.connect({
    browserWSEndpoint: wsChromeEndpointUrl,
  });

  // creates new tab
  const page = await browser.newPage();
  await page.goto("https://app.dealroom.co/companies/blockfi");

  async function getInfoBySelector(selector) {
    await page.waitForSelector(selector);
    return await page.$eval(selector, (element) => element.innerText);
  }

  async function getJobsInfoBySelector(pageSelector, listSelector) {
    await page.waitForTimeout(5000);
    await page.click(pageSelector);

    await page.waitForSelector(listSelector);
    await page.waitForTimeout(1000);

    return await page.$$eval(listSelector, (els) =>
      els.map((e) => ({
        jobTitle: JSON.stringify(e.innerText.toString())
          .split("\\")[0]
          .substring(1),
        basedIn: JSON.stringify(e.innerText.toString())
          .split("\\")[1]
          .substring(9),
        postedOn: JSON.stringify(e.innerText.toString())
          .split("\\")[2]
          .substring(10)
          .slice(0, -1),
        link: e.innerHTML.match(/(https?:\/\/[^\s]+)/g)[0].slice(0, -1),
      }))
    );
  }

  function getIsCompanyHiring(jobs) {
    let jobsAmount = jobs.replace(/[^0-9]+/g, "");

    return parseInt(jobsAmount) > 0;
  }

  // async function writeInFile(index, value) {
  //   // Reading our test file
  //   let file = 'C:\\Users\\BohdanF\\Desktop\\test.xlsx';
  //
  //   var workbook = new Excel.Workbook();
  //   workbook.xlsx.readFile(file)
  //       .then(function()  {
  //         var worksheet = workbook.getWorksheet(1);
  //         var lastRow = worksheet.lastRow;
  //         // var getRowInsert = worksheet.getRow(++(lastRow.number));
  //         var getRowInsert = worksheet.getRow(4);
  //         getRowInsert.getCell(index).value = value;
  //         getRowInsert.commit();
  //         return workbook.xlsx.writeFile(file);
  //       });
  // //await writeInFile("G", companyValuation);
  //
  // }

  const companyName = await getInfoBySelector(
    "#window-scrollbar > div:nth-child(1) > main > div > div > section > div.card__content.card__content--with-padding > div > div.title-tagline-column > div.item-name > h1"
  );
  console.log("companyName: " + companyName);

  const companyValuation = await getInfoBySelector(
    "#tooltip-20 > span:nth-child(1) > span"
  );
  console.log("Company Valuation: " + companyValuation);

  const companyTotalFunding = await getInfoBySelector(
    "#window-scrollbar > div:nth-child(1) > main > div > div > div.layout-container.company-overview > div > div:nth-child(1) > section:nth-child(3) > div.card__content.card__content--with-padding > table > tfoot > tr"
  );
  console.log(
    "Company total funding: " +
      companyTotalFunding.replace("Total Funding", "").trim()
  );

  const isCompanyHiring = await getInfoBySelector(
    "#window-scrollbar > div:nth-child(1) > main > div > div > section > footer > div > a:nth-child(7) > span"
  );
  console.log("Is company hiring?: " + getIsCompanyHiring(isCompanyHiring));

  const companyWebsite = await getInfoBySelector(
    "#window-scrollbar > div:nth-child(1) > main > div > div > section > div.card__content.card__content--with-padding > div > div.title-tagline-column > div.item-details-info__details.info > div.item-details-info__website > a"
  );
  console.log("Company website: " + companyWebsite);

  const companyLinkedIn = await getInfoBySelector(
      "#window-scrollbar > div:nth-child(1) > main > div > div > section > div.card__content.card__content--with-padding > div > div.title-tagline-column > div.item-details-info__details.info > div.item-details-info__website > div > a:nth-child(3) > span.accessible-hide"
  );
  console.log("Company LinkedIn: " + companyLinkedIn);

  const companyNumberOfEmployees = await getInfoBySelector(
      "#window-scrollbar > div:nth-child(1) > main > div > div > div.layout-container.company-overview > div > div:nth-child(1) > section.box.card.company-info > div.card__content.card__content--with-padding > div > div.field.employees > div.description > span > a"
  );
  console.log("Company number of employees: " + companyNumberOfEmployees);

  const companyJobs = await getJobsInfoBySelector(
    "#window-scrollbar > div:nth-child(1) > main > div > div > section > footer > div > a:nth-child(7)",
    ".company-card__slot1"
  );
  console.log("Company jobs: " + JSON.stringify(companyJobs));

  //await browser.close();
}

start();
