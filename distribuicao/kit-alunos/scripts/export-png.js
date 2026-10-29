#!/usr/bin/env node
// Rasteriza slides HTML (gerados pelo Designer) em PNG, usando o Chromium
// do Playwright. Não usa nenhuma IA generativa de imagem — é a mesma peça
// HTML/CSS, só capturada em pixel.
//
// Uso:
//   node scripts/export-png.js <arquivo.html>
//   node scripts/export-png.js <pasta-com-html>

const { chromium } = require("playwright");
const path = require("path");
const fs = require("fs");

async function exportOne(browser, htmlPath) {
  const page = await browser.newPage();
  const fileUrl = "file://" + path.resolve(htmlPath).replace(/\\/g, "/");
  await page.goto(fileUrl);

  // O tamanho real vem do próprio HTML (o Designer sempre declara width/
  // height fixos no body) — não fixamos 1080x1440 aqui pra também
  // funcionar com Stories (1080x1920) sem precisar de flag.
  const { width, height } = await page.evaluate(() => ({
    width: document.body.scrollWidth,
    height: document.body.scrollHeight,
  }));
  await page.setViewportSize({ width, height });

  const outPath = htmlPath.replace(/\.html$/i, ".png");
  await page.screenshot({ path: outPath });
  await page.close();
  return outPath;
}

async function main() {
  const target = process.argv[2];
  if (!target) {
    console.error("Uso: node scripts/export-png.js <arquivo.html ou pasta>");
    process.exit(1);
  }

  const stat = fs.statSync(target);
  const files = stat.isDirectory()
    ? fs
        .readdirSync(target)
        .filter((f) => f.toLowerCase().endsWith(".html"))
        .map((f) => path.join(target, f))
    : [target];

  if (files.length === 0) {
    console.error("Nenhum arquivo .html encontrado em:", target);
    process.exit(1);
  }

  const browser = await chromium.launch();
  try {
    for (const file of files) {
      const out = await exportOne(browser, file);
      console.log("Exportado:", out);
    }
  } finally {
    await browser.close();
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
