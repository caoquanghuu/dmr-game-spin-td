/* eslint-disable no-undef */
/* eslint-disable @typescript-eslint/no-require-imports */
const fs = require("fs");
const path = require("path");
const audioSprite = require('audiosprite');

const audioFolderPath = "./public/assets";

// Get audio files from directory
function getAudioFilesFromDir(dirPath) {
  return fs.readdirSync(dirPath).filter(file => file.endsWith(".mp3") || file.endsWith(".wav"));
}

// Create audio sprite
async function createAudioSprite(dirName) {
  try {
    const dirPath = path.join(audioFolderPath, dirName);
    const audioFiles = getAudioFilesFromDir(dirPath).map(file => path.join(dirPath, file));
    console.log(audioFiles)

    const outputDir = "./public/assets/sounds/soundsAtlas";
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir);
    }

    const outputFilePath = path.join(outputDir, `${dirName}_sprite`);
    audioSprite(
      audioFiles,
      { output: outputFilePath, export: "mp3" },
      (error, obj) => {
        if (error) {
          console.error(`Error creating audio sprite for directory ${dirName}:`, error);
          return;
        }
        obj.resources[0] = `./assets/sounds/sounds_sprite.mp3`;
        const jsonFile = JSON.stringify(obj, null, 2);
        const jsonPath = `${outputFilePath}.json`;
        fs.writeFileSync(jsonPath, jsonFile);
        console.log(`Audio sprite created: ${outputFilePath}`);
      }
    );
  } catch (error) {
    console.error(`Error processing directory ${dirName}:`, error);
  }
}

// Find all folders with audio files in raw_audio directory
async function createAllAudioSprites() {
  const directories = fs
    .readdirSync(audioFolderPath, { withFileTypes: true })
    .filter(dirent => dirent.isDirectory())
    .map(dirent => dirent.name);
  
  for (const dir of directories) {
    await createAudioSprite(dir);
  }
}

createAllAudioSprites();
