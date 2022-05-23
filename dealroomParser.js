const puppeteer = require("puppeteer");
const fs = require("fs/promises");

async function start() {
  // opens new instance of the browser
  // const browser = await puppeteer.launch();

  /**
   * Connects to the running web browser.
   * EndpointUrl changes everytime you relaunch the browser.
   * Go to http://127.0.0.1:9222/json/version to find current endpoint.
   */
  const wsChromeEndpointUrl =
    "ws://127.0.0.1:9222/devtools/browser/dad875a5-b69f-40fd-9340-a6e70ecc206e";
  const browser = await puppeteer.connect({
    browserWSEndpoint: wsChromeEndpointUrl,
  });
  const websiteUrl = "https://app.dealroom.co/dashboard";

  const page = await browser.newPage();

  const companiesArray = [
    "ZaNiheza",
    "Konark Pro",
    "SCINET, INC",
  ];

  await page.goto(websiteUrl);

  async function writeInCSVFile(content) {
    try {
      await fs.appendFile("C:\\Users\\BohdanF\\Desktop\\test1.csv", content);
    } catch (err) {
      console.log(err);
    }
  }

  for (const element of companiesArray) {
    let data;
    await page.waitForTimeout(2000);
    await page.type(
      "#app > div > div.top-fixed-content > header > div:nth-child(3) > div > div > div > div > input",
      element
    );
    await page.waitForTimeout(3000);

    const companyNameInListSelector =
      "#react-autowhatever-1--item-0 > a > div.entity-suggestion-item__name > div:nth-child(1) > div.hbox > h4";

    if ((await page.$(companyNameInListSelector)) !== null) {
      const companyNameInList = await page.$eval(
        companyNameInListSelector,
        (el) => el.innerText
      );
      // in case if coincidence with element from the array
      if (companyNameInList.toLowerCase().includes(element.toString().toLowerCase())) {
        await page.click("#react-autowhatever-1--item-0");
        await page.waitForTimeout(1500);

        async function getInfoBySelector(selector) {
          await page.waitForTimeout(2500);
          if ((await page.$(selector)) !== null) {
            return await page.$eval(selector, (element) => element.innerText);
          } else return "-";
        }

        async function getJobsInfoBySelector(pageSelector, listSelector) {
          await page.waitForTimeout(2500);
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
              link: e.innerHTML
                .match(/(https?:\/\/[^\s]+)/g)[0]
                .slice(0, -1)
                .replace("&amp;", "&"),
            }))
          );
        }

        let teamSelectorExists;
        const teamSelector =
          "#window-scrollbar > div:nth-child(1) > main > div > div > section > footer > div > a:nth-child(5)";
        if ((await page.$(teamSelector)) !== null) {
          const isTeamExists = await page.$eval(
            teamSelector,
            (element) => element.innerText
          );
          teamSelectorExists = !!isTeamExists.includes("TEAM");
        }

        function getIsCompanyHiring(jobs) {
          let jobsAmount = jobs.replace(/[^0-9]+/g, "");
          return parseInt(jobsAmount) > 0;
        }

        const companyName = await getInfoBySelector(
          "#window-scrollbar > div:nth-child(1) > main > div > div > section > div.card__content.card__content--with-padding > div > div.title-tagline-column > div.item-name > h1"
        );
        console.log("Company name: " + companyName);

        const companyValuation = await getInfoBySelector(".valuation__value");
        const writeCompanyValuation =
          companyValuation === "-"
            ? companyValuation
            : companyValuation.substring(1);
        const divideValuation = writeCompanyValuation.match(
          /[+]?[0-9mbk]*\.?[0-9mbk]+/g
        );

        function countAverageValuationValue(divideValuation) {
          if (divideValuation !== null) {
            if (divideValuation[0] !== 0 && divideValuation[1] !== undefined) {
              if (
                divideValuation[0].includes("k") &&
                divideValuation[1].includes("k")
              ) {
                if (
                  (parseInt(divideValuation[0]) * 1000 +
                    parseInt(divideValuation[1]) * 1000) /
                    2 >
                  100000
                )
                  return (
                    (parseInt(divideValuation[0]) * 1000 +
                      parseInt(divideValuation[1]) * 1000) /
                    2
                  );
              }
              if (
                divideValuation[0].includes("m") &&
                divideValuation[1].includes("m")
              ) {
                if (
                  (parseInt(divideValuation[0]) * 1000000 +
                    parseInt(divideValuation[1]) * 1000000) /
                    2 >
                  1000000
                )
                  return (
                    (parseInt(divideValuation[0]) * 1000000 +
                      parseInt(divideValuation[1]) * 1000000) /
                    2
                  );
              }
              if (
                divideValuation[0].includes("b") &&
                divideValuation[1].includes("b")
              ) {
                if (
                  (parseInt(divideValuation[0]) * 1000000000 +
                    parseInt(divideValuation[1]) * 1000000000) /
                    2 >
                  1000000000
                )
                  return (
                    (parseInt(divideValuation[0]) * 1000000000 +
                      parseInt(divideValuation[1]) * 1000000000) /
                    2
                  );
              }
              if (
                divideValuation[0].includes("k") &&
                divideValuation[1].includes("m")
              ) {
                if (
                  (parseInt(divideValuation[0]) * 1000 +
                    parseInt(divideValuation[1]) * 1000000) /
                    2 >
                  100000
                )
                  return (
                    (parseInt(divideValuation[0]) * 1000 +
                      parseInt(divideValuation[1]) * 1000000) /
                    2
                  );
              }
              if (
                divideValuation[0].includes("m") &&
                divideValuation[1].includes("b")
              ) {
                if (
                  (parseInt(divideValuation[0]) * 1000000 +
                    parseInt(divideValuation[1]) * 1000000000) /
                    2 >
                  1000000
                )
                  return (
                    (parseInt(divideValuation[0]) * 1000000 +
                      parseInt(divideValuation[1]) * 1000000000) /
                    2
                  );
              }
              if (divideValuation[1].includes("k")) {
                if (
                  (parseInt(divideValuation[0]) * 1000 +
                    parseInt(divideValuation[1]) * 1000) /
                    2 >
                  100000
                )
                  return (
                    (parseInt(divideValuation[0]) * 1000 +
                      parseInt(divideValuation[1]) * 1000) /
                    2
                  );
              }
              if (divideValuation[1].includes("m")) {
                if (
                  (parseInt(divideValuation[0]) * 1000000 +
                    parseInt(divideValuation[1]) * 1000000) /
                    2 >
                  1000000
                )
                  return (
                    (parseInt(divideValuation[0]) * 1000000 +
                      parseInt(divideValuation[1]) * 1000000) /
                    2
                  );
              }
              if (divideValuation[1].includes("b")) {
                if (
                  (parseInt(divideValuation[0]) * 1000000000 +
                    parseInt(divideValuation[1]) * 1000000000) /
                    2 >
                  1000000000
                )
                  return (
                    (parseInt(divideValuation[0]) * 1000000000 +
                      parseInt(divideValuation[1]) * 1000000000) /
                    2
                  );
              }
            } else if (
              divideValuation[0] !== 0 &&
              divideValuation[1] === undefined
            ) {
              return divideValuation[0];
            }
          } else {
            return "-";
          }
        }

        const averageValuationValue =
          countAverageValuationValue(divideValuation);

        function multiplyAbbreviation(abbreviationValue) {
          if (abbreviationValue.includes("k")) {
            return parseFloat(abbreviationValue) * 1000;
          } else if (abbreviationValue.includes("m")) {
            return parseFloat(abbreviationValue) * 1000000;
          } else if (abbreviationValue.includes("b")) {
            return parseFloat(abbreviationValue) * 1000000000;
          } else return abbreviationValue;
        }

        const finalValuationValue = multiplyAbbreviation(
          averageValuationValue.toString()
        );
        console.log("Company valuation: " + parseFloat(finalValuationValue));

        const companyTotalFunding = await getInfoBySelector(
          "#window-scrollbar > div:nth-child(1) > main > div > div > div.layout-container.company-overview > div > div:nth-child(1) > section:nth-child(3) > div.card__content.card__content--with-padding > table > tfoot > tr"
        );
        const writeCompanyTotalFunding =
          companyTotalFunding.replace("Total Funding", "").trim() === "-"
            ? "-"
            : companyTotalFunding
                .replace("Total Funding", "")
                .trim()
                .substring(1);

        const finalFunding = multiplyAbbreviation(writeCompanyTotalFunding);
        console.log("Company funding: " + finalFunding);

        const isCompanyHiring = await getInfoBySelector(
          teamSelectorExists
            ? "#window-scrollbar > div:nth-child(1) > main > div > div > section > footer > div > a:nth-child(7) > span"
            : "#window-scrollbar > div:nth-child(1) > main > div > div > section > footer > div > a:nth-child(6) > span"
        );

        const companyWebsite = await getInfoBySelector(
          ".item-details-info__url"
        );
        console.log("Company website: " + companyWebsite);

        const companyLinkedIn = await getInfoBySelector(
          "#window-scrollbar > div:nth-child(1) > main > div > div > section > div.card__content.card__content--with-padding > div > div.title-tagline-column > div.item-details-info__details.info > div.entity-details > div.details > div.item-details-info__website > div > a:nth-child(3) > span.accessible-hide"
        );
        console.log("Company LinkedIn: " + companyLinkedIn);

        const companyNumberOfEmployees = await getInfoBySelector(
          "#window-scrollbar > div:nth-child(1) > main > div > div > div.layout-container.company-overview > div > div:nth-child(1) > section.box.card.company-info > div.card__content.card__content--with-padding > div > div.field.employees > div.description > span > a"
        );
        const writeNumberOfEmployees = companyNumberOfEmployees.replace(
          " people",
          ""
        );
        console.log("Company number of employees: " + writeNumberOfEmployees);

        let companyJobs;
        let writeCompanyJobs;
        if (getIsCompanyHiring(isCompanyHiring)) {
          companyJobs = await getJobsInfoBySelector(
            teamSelectorExists
              ? "#window-scrollbar > div:nth-child(1) > main > div > div > section > footer > div > a:nth-child(7)"
              : "#window-scrollbar > div:nth-child(1) > main > div > div > section > footer > div > a:nth-child(6)",
            ".company-card__slot1"
          );
          writeCompanyJobs = JSON.stringify(companyJobs);
        } else {
          writeCompanyJobs = "-";
        }
        console.log("Company jobs: " + writeCompanyJobs);

        data =
          companyName +
          ";" +
          parseFloat(finalValuationValue) +
          ";" +
          finalFunding +
          ";" +
          companyWebsite +
          ";" +
          writeCompanyJobs +
          ";" +
          companyLinkedIn +
          ";" +
          writeNumberOfEmployees.toString() +
          "\n";
      } else {
        data =
          "-" +
          ";" +
          "-" +
          ";" +
          "-" +
          ";" +
          "-" +
          ";" +
          "-" +
          ";" +
          "-" +
          ";" +
          "-" +
          "\n";
      }
    }

    await writeInCSVFile(data);

    await page.goto(websiteUrl);
  }

  //await browser.close();
}

start();
