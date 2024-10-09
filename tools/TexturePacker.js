/* eslint-disable no-undef */
/* eslint-disable @typescript-eslint/no-require-imports */
const fs = require("fs");
const path = require("path");
const { packAsync } = require("free-tex-packer-core");

const imageFolderPath = "./public/assets/images";

// get images file from folder
function getImagesFromDir(dirPath) {
  const files = fs.readdirSync(dirPath);
  return files.map((file) => ({
    path: file,
    contents: fs.readFileSync(path.join(dirPath, file)),
  }));
}

// rename file
function removeFileExtension(fileName) {
  return fileName.replace(/\.[^/.]+$/, "");
}

// create atlas json file and png
async function packImagesForDir(dirName) {
  try {
    const dirPath = path.join(imageFolderPath, dirName);

    // get image from file
    let images = getImagesFromDir(dirPath);

    // remove names of image before assign to pack
    images = images.map((image) => ({
      path: removeFileExtension(image.path),
      contents: image.contents,
    }));

    // read config
    const configPath = "./public/assets/images/atlasConfig.json";
    const atlasConfig = JSON.parse(fs.readFileSync(configPath, "utf8"));

    const options = { ...atlasConfig.options, textureName: dirName + "_atlas" };

    // create file
    const files = await packAsync(images, options);

    // define output
    const outputDir = "./public/assets/atlas";
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir);
    }
    files.forEach((file) => {
      const outputPath = path.join(outputDir, file.name);
      fs.writeFileSync(outputPath, file.buffer);
      console.log(`Saved: ${outputPath}`);
    });
  } catch (error) {
    console.error(`Error packing images for directory ${dirName}:`, error);
  }
}

// find all folder have image in raw_atlas file
async function packAllDirectories() {
  const directories = fs
    .readdirSync(imageFolderPath, { withFileTypes: true })
    .filter((dirent) => dirent.isDirectory())
    .map((dirent) => dirent.name);

  for (const dir of directories) {
    await packImagesForDir(dir);
  }
}

packAllDirectories();