// TikTok/V12 — "O Claude consegue gerenciar minha conta do Instagram?" em 5 slides.
// Direção final: baseada unicamente na referência enviada — um único
// degradê vertical preto -> laranja vívido, sem pôr-do-sol multi-cor, sem
// elementos decorativos. A tipografia alterna entre preto e branco puros
// (com contorno na cor oposta) pra ficar sempre no contraste máximo contra
// o fundo, seja qual for a faixa de cor que o texto ocupa.
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
  { idx: "01", text: "black", duration: 4.6, cta: false, headline: "O Claude consegue<br><span class=\"accent\">gerenciar</span> meu Instagram?" },
  { idx: "02", text: "white", duration: 4.6, cta: false, headline: "Sim — ele cria a arte,<br>escreve e <span class=\"accent\">publica</span> sozinho" },
  { idx: "03", text: "black", duration: 4.6, cta: false, headline: "Sem abrir o Canva,<br>sem copiar e colar nada" },
  { idx: "04", text: "white", duration: 4.6, cta: false, headline: "Direto do seu computador,<br>pro seu Instagram <span class=\"accent\">profissional</span>" },
  { idx: "05", text: "black", duration: 5.0, cta: true,  headline: "<span class=\"accent\">Segue</span> esse perfil e<br>deixe seu comentário" },
];
const TOTAL_SLIDES = SLIDES.length;

// Fundo único, sem sombreado preto — laranja vívido do topo à base.
const BG = "linear-gradient(180deg, #FF7A0E 0%, #FF6A00 100%)";

// Logo do Claude (badge laranja + sparkle branco), recriado em SVG pra
// ficar nítido em qualquer tamanho — mesmo esquema de cor da referência.
function logoSvg(size, shadow) {
  return `<svg width="${size}" height="${size}" viewBox="0 0 44 44" style="filter:drop-shadow(${shadow});flex-shrink:0;">
  <rect x="1" y="1" width="42" height="42" rx="10" fill="#FF6A00"/>
  <g stroke="#fff" stroke-width="4.2" stroke-linecap="round">
    <line x1="22" y1="7" x2="22" y2="37"/>
    <line x1="7" y1="22" x2="37" y2="22"/>
    <line x1="11.5" y1="11.5" x2="32.5" y2="32.5"/>
    <line x1="32.5" y1="11.5" x2="11.5" y2="32.5"/>
  </g>
</svg>`;
}
const LOGO_SVG = logoSvg(44, "0 2px 6px rgba(0,0,0,.35)");

// Versão "hero" da logo: a peça 3D real fornecida (badge + robozinho),
// fundo de estúdio removido. Já vem com perspectiva 3D própria da própria
// renderização original, então não aplicamos nenhum tilt sintético em cima
// — só centralizamos e adicionamos o halo de brilho.
const HERO_LOGO_PATH = path.join(ROOT, "Imgs", "claude-robozinho-sem-fundo-corrigido.png");
// data URI em vez de file:// — o Chromium do Playwright bloqueia recurso
// local numa página carregada via setContent() (about:blank).
const HERO_LOGO_SRC = "data:image/png;base64," + fs.readFileSync(HERO_LOGO_PATH).toString("base64");
const HERO_LOGO_WIDTH = 300;
const HERO_LOGO_HTML = `<div class="hero-logo-wrap">
  <div class="hero-logo-glow"></div>
  <img class="hero-logo-img" src="${HERO_LOGO_SRC}" width="${HERO_LOGO_WIDTH}" alt="" />
</div>`;

function frameHtml(slide) {
  const isBlack = slide.text === "black";
  const ink = isBlack ? "#0A0500" : "#FFFFFF";
  const accentInk = isBlack ? "#FFFFFF" : "#0A0500";
  const barColor = accentInk;

  return `<!doctype html><html><head><meta charset="utf-8"><style>
    *{margin:0;padding:0;box-sizing:border-box;}
    html,body{width:${W}px;height:${H}px;}
    body{
      position:relative;overflow:hidden;
      background:${BG};
      font-family:-apple-system,"Segoe UI",Arial,sans-serif;
      display:flex;flex-direction:column;
    }
    .halftone{
      position:absolute;inset:0;pointer-events:none;z-index:1;
      background-image:radial-gradient(rgba(255,255,255,.4) 2.6px, transparent 3px);
      background-size:26px 26px;
      -webkit-mask-image:radial-gradient(circle at 100% 100%, black 0%, black 30%, transparent 68%);
      mask-image:radial-gradient(circle at 100% 100%, black 0%, black 30%, transparent 68%);
    }
    .header{ height:280px;flex-shrink:0;position:relative;padding:0 80px;z-index:2; }
    .brand{
      position:absolute;top:254px;left:80px;
      font-size:40px;font-weight:700;letter-spacing:.12em;color:rgba(10,5,0,.85);
      text-transform:uppercase;display:flex;align-items:center;gap:14px;
    }
    .idx{
      position:absolute;top:260px;right:80px;
      font-size:30px;font-weight:700;color:rgba(10,5,0,.55);
      font-family:Consolas,"Courier New",monospace;
    }
    .hero-logo-wrap{
      position:absolute;top:370px;left:50%;transform:translateX(-50%);
      width:${HERO_LOGO_WIDTH}px;
      display:flex;align-items:center;justify-content:center;z-index:2;
    }
    .hero-logo-glow{
      position:absolute;inset:-46px;border-radius:50%;z-index:1;
      background:radial-gradient(circle, rgba(255,255,255,.6) 0%, rgba(255,255,255,.25) 45%, transparent 72%);
      filter:blur(16px);
    }
    .hero-logo-img{
      position:relative;z-index:2;display:block;width:100%;height:auto;
      filter:drop-shadow(0 18px 26px rgba(0,0,0,.3));
    }
    .main{ flex:1;display:flex;flex-direction:column;justify-content:center;padding:0 80px 150px 80px;position:relative;z-index:2; }
    .bar{ width:72px;height:9px;border-radius:5px;background:${barColor};margin-bottom:36px; }
    .headline{
      font-size:${slide.cta ? 78 : 92}px;font-weight:800;color:${ink};line-height:1.18;
      letter-spacing:-.01em;
    }
    .accent{ color:${accentInk}; }
  </style></head><body>
    <div class="halftone"></div>
    <div class="header">
      <div class="brand">${LOGO_SVG} Claude Code + Instagram</div>
      <div class="idx">${slide.idx}/0${TOTAL_SLIDES}</div>
    </div>
    ${HERO_LOGO_HTML}
    <div class="main">
      <div class="bar"></div>
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
    console.log(`  Frame gerado: ${outPath} (texto ${slide.text}, ${slide.duration}s)`);
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
