import sharp from 'sharp';
import fs from 'fs';
import path from 'path';

const scrambleImage = async (imagePath) => {
  try {
    const absolutePath = path.resolve(imagePath);
    if (!fs.existsSync(absolutePath)) {
      console.error(`File not found: ${absolutePath}`);
      return;
    }

    console.log(`Scrambling: ${absolutePath}...`);

    const image = sharp(absolutePath);
    const metadata = await image.metadata();
    const { width, height, channels } = metadata;

    // Get raw pixel data
    const { data } = await image.raw().toBuffer({ resolveWithObject: true });

    // We'll scramble by 8x8 blocks for better obfuscation while maintaining some "image-like" quality,
    // or just 1x1 for maximum scramble. Let's do 1x1 pixels for total recognition avoidance.
    const pixelCount = width * height;
    const bytesPerPixel = channels;

    // Create an array of indices
    const indices = new Array(pixelCount);
    for (let i = 0; i < pixelCount; i++) {
      indices[i] = i;
    }

    // Shuffle indices (Fisher-Yates)
    for (let i = pixelCount - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [indices[i], indices[j]] = [indices[j], indices[i]];
    }

    // Create new buffer based on shuffled indices
    const scrambledData = Buffer.alloc(data.length);
    for (let i = 0; i < pixelCount; i++) {
      const oldIdx = i;
      const newIdx = indices[i];
      
      for (let c = 0; c < bytesPerPixel; c++) {
        scrambledData[newIdx * bytesPerPixel + c] = data[oldIdx * bytesPerPixel + c];
      }
    }

    // Construct output path with _scrambled affix and force .jpg extension
    const parsedPath = path.parse(absolutePath);
    const outputPath = path.join(parsedPath.dir, `${parsedPath.name}_scrambled.jpg`);

    // Save with explicit jpeg format for optimization
    await sharp(scrambledData, {
      raw: {
        width,
        height,
        channels
      }
    })
    .toFormat('jpeg', { quality: 85 })
    .toFile(outputPath);

    console.log(`Success! Scrambled image saved at: ${outputPath}`);
  } catch (err) {
    console.error('Error scrambling image:', err);
  }
};

const args = process.argv.slice(2);
if (args.length === 0) {
  console.log('Usage: node scripts/scramble.js <path-to-image>');
} else {
  scrambleImage(args[0]);
}
