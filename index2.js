var fs = require("fs");
var csv = require("csv");

var readStream = fs.createReadStream("C:\\Users\\BohdanF\\Desktop\\input.csv"); // readStream is a read-only stream wit raw text content of the CSV file
var writeStream = fs.createWriteStream(
  "C:\\Users\\BohdanF\\Desktop\\output.csv"
); // writeStream is a write-only stream to write on the disk

var csvStream = csv.parse(); // csv Stream is a read and write stream : it reads raw text in CSV and output untransformed records

csvStream
  .on("data", function (data) {
    let getValues = data
      .map(function (item) {
        return item === "-" || item === null ? 0 : item;
      })
      .map((e) => e.toString().match(/[+]?[0-9mbk]*\.?[0-9mbk]+/g));

    let realValues = getValues.map(function (item) {
      if (item[0] !== 0 && item[1] !== undefined) {
        if (item[0].includes("k") && item[1].includes("k")) {
          if (
            (parseInt(item[0]) * 1000 + parseInt(item[1]) * 1000) / 2 >
            100000
          )
            return (
              (parseInt(item[0]) * 1000 + parseInt(item[1]) * 1000) /
              2 /
              1000
            )
              .toString()
              .concat("k");
        }
        if (item[0].includes("m") && item[1].includes("m")) {
          if (
            (parseInt(item[0]) * 1000000 + parseInt(item[1]) * 1000000) / 2 >
            1000000
          )
            return (
              (parseInt(item[0]) * 1000000 + parseInt(item[1]) * 1000000) /
              2 /
              1000000
            )
              .toString()
              .concat("m");
        }
        if (item[0].includes("b") && item[1].includes("b")) {
          if (
            (parseInt(item[0]) * 1000000000 + parseInt(item[1]) * 1000000000) /
              2 >
            1000000000
          )
            return (
              (parseInt(item[0]) * 1000000000 +
                parseInt(item[1]) * 1000000000) /
              2 /
              1000000000
            )
              .toString()
              .concat("b");
        }
        if (item[0].includes("k") && item[1].includes("m")) {
          if (
            (parseInt(item[0]) * 1000 + parseInt(item[1]) * 1000000) / 2 >
            100000
          )
            return (
              (parseInt(item[0]) * 1000 + parseInt(item[1]) * 1000000) /
              2 /
              1000
            )
              .toString()
              .concat("k");
        }
        if (item[0].includes("m") && item[1].includes("b")) {
          if (
            (parseInt(item[0]) * 1000000 + parseInt(item[1]) * 1000000000) / 2 >
            1000000
          )
            return (
              (parseInt(item[0]) * 1000000 + parseInt(item[1]) * 1000000000) /
              2 /
              1000000
            )
              .toString()
              .concat("m");
        }
        if (item[1].includes("k")) {
          if (
            (parseInt(item[0]) * 1000 + parseInt(item[1]) * 1000) / 2 >
            100000
          )
            return (
              (parseInt(item[0]) * 1000 + parseInt(item[1]) * 1000) /
              2 /
              1000
            )
              .toString()
              .concat("k");
        }
        if (item[1].includes("m")) {
          if (
            (parseInt(item[0]) * 1000000 + parseInt(item[1]) * 1000000) / 2 >
            1000000
          )
            return (
              (parseInt(item[0]) * 1000000 + parseInt(item[1]) * 1000000) /
              2 /
              1000000
            )
              .toString()
              .concat("m");
        }
        if (item[1].includes("b")) {
          if (
            (parseInt(item[0]) * 1000000000 + parseInt(item[1]) * 1000000000) /
              2 >
            1000000000
          )
            return (
              (parseInt(item[0]) * 1000000000 +
                parseInt(item[1]) * 1000000000) /
              2 /
              1000000000
            )
              .toString()
              .concat("b");
        }
      } else if (item[0] === 0) {
        return 0;
      } else if (item[0] !== 0 && item[1] === undefined) {
        return item[0];
      }
    });

    //console.log(realValues)

    writeStream.write(JSON.stringify(realValues).concat("\n"));
  })
  .on("end", function () {
    console.log("done");
  })
  .on("error", function (error) {
    console.log(error);
  });

readStream.pipe(csvStream);
