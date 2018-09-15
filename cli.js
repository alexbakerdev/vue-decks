#!/usr/bin/env node

const fs = require("fs");
const path = require("path");
const spawn = require("cross-spawn");
const { inferTitle, parseFrontmatter } = require("vuepress/lib/util/index");
const onDeath = require("death"); //this is intentionally ugly
const chalk = require("chalk");

let argv;
let separateFileCache;
let resolvedFile;

require("yargs")
  .command(
    "dev <folder> [file]",
    "start the dev server",
    yargs => {
      yargs.positional("file", {
        describe: "path to the slides file",
        default: "slides.md"
      });
      yargs.positional("folder", {
        describe: "path to output separate files"
      });
    },
    argv => {
      setArgv(argv);
      dev(argv);
    }
  )
  .command(
    "build [file]",
    "build static site",
    yargs => {
      yargs.positional("file", {
        describe: "path to the slides file",
        default: 5000
      });
    },
    argv => {
      if (argv.verbose) console.info(`start server on :${argv.port}`);
      serve(argv.port);
    }
  )
  .option("verbose", {
    alias: "v",
    default: false
  }).argv;

function setArgv(a) {
  argv = a;
}

function resolveFile(file) {
  const resolvedFile = path.resolve(process.cwd(), file);
  if (argv.verbose) console.info(`using file: ${resolvedFile}`);
  return resolvedFile;
}

function resolveOutputFolder(folder) {
  const resolvedFolder = path.resolve(process.cwd(), folder);
  if (argv.verbose) console.info(`using output folder: ${resolvedFolder}`);
  return resolvedFolder;
}

function dev({ file, folder }) {
  separateFileCache = new Map();
  resolvedFile = resolveFile(file);
  const resolvedFolder = resolveOutputFolder(folder);

  splitToFiles(resolvedFile, resolvedFolder);
  fs.watch(resolvedFile, eventType => {
    if (eventType === "change") {
      splitToFiles(resolvedFile, resolvedFolder);
    }
  });
  const vuepressProcesss = spawn("./node_modules/.bin/vuepress", [
    "dev",
    folder
  ]);
  vuepressProcesss.stdout.on("data", data => {
    console.log(data.toString());
  });

  vuepressProcesss.stderr.on("data", data => {
    console.error(chalk.red(data.toString()));
  });

  vuepressProcesss.on("close", code => {
    console.log(`vuepress process exited with code: ${code}`);
  });
}

function slugify(text) {
  return text
    .toString()
    .toLowerCase()
    .replace(/\s+/g, "-") // Replace spaces with -
    .replace(/[^\w\-]+/g, "") // Remove all non-word chars
    .replace(/\-\-+/g, "-") // Replace multiple - with single -
    .replace(/^-+/, "") // Trim - from start of text
    .replace(/-+$/, ""); // Trim - from end of text
}

function splitToFiles(resolvedFile, resolvedFolder) {
  const content = fs.readFileSync(resolvedFile, { encoding: "utf8" });
  console.log(resolvedFile, "content", content);
  if (content) {
    const slides = content.split("\n~~~\n").map((content, i) => {
      const title = inferTitle(parseFrontmatter(content)) || `Slide ${i + 1}`;
      const data = { title, content };
      const slugifyTitle = slugify(title);
      if (i === 0) {
        data.outputPath = path.resolve(resolvedFolder, `README.md`);
        data.internalPath = "";
      } else {
        data.outputPath = path.resolve(resolvedFolder, `${slugifyTitle}.md`);
        data.internalPath = slugifyTitle;
      }

      return data;
    });

    slides.push({
      content: `---
title: $SlideshowData
slideOrder:
${slides.map(s => `  - /${s.internalPath}`).join("\n")}
---
`,
      outputPath: path.resolve(resolvedFolder, "SlideshowData.md")
    });

    console.log("slides", slides);
    slides.forEach(writeTempFile);
    cleanDeadSlides(slides);
  }
}

function writeTempFile({ outputPath, content }) {
  if (separateFileCache.get(outputPath) !== content) {
    fs.writeFileSync(outputPath, content, "utf8");
    separateFileCache.set(outputPath, content);
  }
}

function cleanDeadSlides(slides) {
  const validFilePaths = slides.map(x => x.outputPath);
  for (const filePath of separateFileCache.keys()) {
    if (fs.existsSync(filePath) && !validFilePaths.includes(filePath)) {
      fs.unlinkSync(filePath);
      separateFileCache.delete(filePath);
    }
  }
}

onDeath(function() {
  fs.unwatchFile(resolvedFile);
  for (const filePath of separateFileCache.keys()) {
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }
  }
  console.log("\nremoved temporary files");
  process.exit();
});
