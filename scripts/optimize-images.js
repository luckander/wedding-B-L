const fs = require('fs');
const path = require('path');
const sharp = require('sharp');

async function processDirectory(dirPath) {
  const files = fs.readdirSync(dirPath);
  for (const file of files) {
    const fullPath = path.join(dirPath, file);
    const stat = fs.statSync(fullPath);
    if (stat.isDirectory()) {
      await processDirectory(fullPath);
    } else if (file.toLowerCase().endsWith('.png') || file.toLowerCase().endsWith('.jpg') || file.toLowerCase().endsWith('.jpeg')) {
      const originalSize = stat.size;
      // Comprime imagens maiores que 100KB
      if (originalSize > 100 * 1024) {
        const tmpPath = fullPath + '.tmp';
        try {
          const image = sharp(fullPath);
          const metadata = await image.metadata();
          let pipeline = sharp(fullPath);
          if (metadata.width > 800) {
            pipeline = pipeline.resize({ width: 800 });
          }
          await pipeline
            .png({ quality: 80, compressionLevel: 9, effort: 9 })
            .toFile(tmpPath);
          const newSize = fs.statSync(tmpPath).size;
          if (newSize < originalSize) {
            fs.renameSync(tmpPath, fullPath);
            console.log(`✓ Comprimido: ${file} (${(originalSize / 1024 / 1024).toFixed(2)}MB -> ${(newSize / 1024).toFixed(0)}KB)`);
          } else {
            fs.unlinkSync(tmpPath);
            console.log(`- Mantido: ${file} (já está otimizado)`);
          }
        } catch (err) {
          console.error(`✕ Erro em ${file}:`, err.message);
          if (fs.existsSync(tmpPath)) fs.unlinkSync(tmpPath);
        }
      }
    }
  }
}

async function main() {
  const imagesDir = path.join(__dirname, '../public/images');
  console.log("🚀 Iniciando otimização automática de imagens...");
  await processDirectory(imagesDir);
  console.log("✅ Processo de otimização concluído com sucesso!");
}

main();
