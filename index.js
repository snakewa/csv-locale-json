#! /usr/bin/env node
const fs = require("fs").promises;
const parse = require("csv-parse/lib/sync");
const fetch = require("node-fetch");

(async function () {
  const { program } = require("commander");
  program.version("0.0.1");
  program
    .option("-d, --debug", "output extra debugging")
    .option("-l, --langs <langs>", "langs list seperated by ,")
    .requiredOption("-u, --csv-url <url>", "csv url")    
    .requiredOption("-o, --output <output>", "output folder");
  program.parse(process.argv);
  const options = program.opts();
  

  // Read the content
  console.log("fetching...")
  const response = await fetch(options.csvUrl);
  const content = await response.text();

  
  // Parse the CSV content
  const records = parse(content);
  // Print records to the console
  const zipObject = (props, values) => {
    return props.reduce((prev, prop, i) => {
      return Object.assign(prev, { [prop]: values[i] });
    }, {});
  };
  const headers = records.shift();
  const langs = headers.slice(1).filter(f=>f.indexOf('_')!=0 );
  let db = {};
  langs.forEach((lang) => {
    db[lang] = {};
  });
  records.forEach((record) => {
    let data = zipObject(headers, record);
    const key = data["key"];
    langs.forEach((lang) => {
      db[lang][key] = data[lang];
    });
  });
  let filterLangs = options.langs ? options.langs.split(',') : false;
  langs.forEach((lang) => {
    if(filterLangs && filterLangs.indexOf(lang)===-1 ) {
      console.log(`skip ${target}...`);  
      continue;
    }
    const target = `${options.output}/${lang}.json`;
    console.log(`saving ${target}...`);
    fs.writeFile(
      target,
      JSON.stringify(db[lang], "", 2)
    );
  });
})();
