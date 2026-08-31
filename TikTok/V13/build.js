// TikTok/V13 — "Claude Code + Instagram = Automação" em 5 slides.
// Direção visual fornecida pronta pelo usuário (Imgs/v13.png): fundo dark
// cyberpunk com pessoa de headset VR, rede de partículas, formas
// geométricas laranja e o selo "CLAUDE CODE". Não alteramos nada da arte —
// só cobrimos a área do headline original (mantendo o selo acima intacto)
// com um retângulo preto sólido (a mesma cor do fundo ali) e desenhamos o
// texto de cada slide por cima, no mesmo lugar/estilo do texto original.
const fs = require("fs");
const path = require("path");
const { chromium } = require("playwright");
const ffmpegPath = require("ffmpeg-static");
const { execFileSync } = require("child_process");

const ROOT = path.join(__dirname, "..", "..");
const OUT_DIR = __dirname;
const FRAMES_DIR = path.join(OUT_DIR, "frames");
const AUDIO_PATH = path.join(ROOT, "TikTok", "Audio", "AudioIA.mp3");
const W = 1080, H = 1920;

const SLIDES = [
  { idx: "01", duration: 4.6, cta: false,
    headline: "Claude Code<br>+ <span class=\"accent\">Instagram</span><br>= <span class=\"accent-orange\">Automação</span>" },
  { idx: "02", duration: 4.6, cta: false,
    headline: "Ele cria a arte,<br>escreve a legenda<br>e <span class=\"accent-orange\">publica</span>" },
  { idx: "03", duration: 4.6, cta: false,
    headline: "Você só <span class=\"accent\">aprova</span> —<br>ele executa sozinho" },
  { idx: "04", duration: 4.6, cta: false,
    headline: "Sem Canva,<br>sem agência,<br>sem <span class=\"accent-orange\">perder tempo</span>" },
  { idx: "05", duration: 5.0, cta: true,
    headline: "<span class=\"accent\">Segue</span> esse perfil e<br>deixe seu comentário" },
];
const TOTAL_SLIDES = SLIDES.length;

const BG_PATH = path.join(ROOT, "Imgs", "v13.png");
const BG_SRC = "data:image/png;base64," + fs.readFileSync(BG_PATH).toString("base64");

// Retângulo que cobre o headline original (arte em 941x1672, escala 1.1477
// até 1080x1920) — começa abaixo do selo "CLAUDE CODE" e termina antes da
// foto da pessoa, preenchido na mesma cor de fundo (preto) da peça.
const MASK = { top: 333, left: 0, width: 820, height: 516 };

function frameHtml(slide) {
  return `<!doctype html><html><head><meta charset="utf-8"><style>
    *{margin:0;padding:0;box-sizing:border-box;}
    html,body{width:${W}px;height:${H}px;}
    body{
      position:relative;overflow:hidden;background:#000;
      font-family:-apple-system,"Segoe UI",Arial,sans-serif;
    }
    .bg{
      position:absolute;inset:0;width:${W}px;height:${H}px;object-fit:cover;z-index:1;
    }
    .mask{
      position:absolute;top:${MASK.top}px;left:${MASK.left}px;
      width:${MASK.width}px;height:${MASK.height}px;background:#000;z-index:2;
    }
    .textbox{
      position:absolute;top:${MASK.top}px;left:64px;
      width:${MASK.width - 64}px;height:${MASK.height}px;
      display:flex;flex-direction:column;justify-content:center;z-index:3;
    }
    .headline{
      font-size:${slide.cta ? 76 : 84}px;font-weight:800;color:#fff;line-height:1.16;
      letter-spacing:-.01em;
    }
    .accent{
      background:linear-gradient(90deg, #F58529 0%, #DD2A7B 45%, #8134AF 75%, #515BD4 100%);
      -webkit-background-clip:text;background-clip:text;color:transparent;
    }
    .accent-orange{ color:#FF6A00; }
  </style></head><body>
    <img class="bg" src="${BG_SRC}" />
    <div class="mask"></div>
    <div class="textbox">
      <div class="headline">${slide.headline}</div>
    </div>
  </body></html>`;
}

async function main() {
  fs.mkdirSync(FRAMES_DIR, { recursive: true });
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: W, height: H } });

  const framePaths = [];
  for (const slide of SLIDES) {
    await page.setContent(frameHtml(slide));
    const outPath = path.join(FRAMES_DIR, `frame-${slide.idx}.png`);
    await page.screenshot({ path: outPath });
    framePaths.push({ path: outPath, duration: slide.duration });
    console.log(`  Frame gerado: ${outPath} (${slide.duration}s)`);
  }
  await browser.close();

  const totalNoAudio = framePaths.reduce((s, f) => s + f.duration, 0);
  console.log(`  Duração total (sem contar crossfade): ${totalNoAudio.toFixed(1)}s`);

  const XFADE = 0.4;
  const inputArgs = [];
  framePaths.forEach(f => {
    inputArgs.push("-loop", "1", "-t", String(f.duration + XFADE), "-i", f.path);
  });

  let filter = "";
  let lastLabel = "0:v";
  let offset = 0;
  for (let i = 1; i < framePaths.length; i++) {
    offset += framePaths[i - 1].duration;
    const outLabel = i === framePaths.length - 1 ? "vout" : `v${i}`;
    filter += `[${lastLabel}][${i}:v]xfade=transition=fade:duration=${XFADE}:offset=${offset}[${outLabel}];`;
    lastLabel = outLabel;
  }
  filter = filter.replace(/;$/, "");

  const audioIndex = framePaths.length;
  const outVideo = path.join(OUT_DIR, "video.mp4");
  const args = [
    ...inputArgs,
    "-i", AUDIO_PATH,
    "-filter_complex", filter,
    "-map", `[${lastLabel}]`,
    "-map", `${audioIndex}:a`,
    "-r", "30",
    "-pix_fmt", "yuv420p",
    "-c:a", "aac",
    "-shortest",
    "-y", outVideo,
  ];

  console.log("Montando vídeo com áudio via ffmpeg...");
  execFileSync(ffmpegPath, args, { stdio: "inherit" });
  console.log(`\nVídeo pronto: ${outVideo}`);
}

main().catch(e => { console.error("ERRO:", e.message); process.exit(1); });
