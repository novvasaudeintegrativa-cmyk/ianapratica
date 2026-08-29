// TikTok/V11 — headline 7 ("Dá pra fazer Reels com IA?") em 5 slides.
// Mesmo padrão fixo do V05.
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
  { idx: "01", theme: "dark",  duration: 4.6, cta: false, text: "Dá pra fazer<br><span class=\"accent\">Reels</span> com IA?" },
  { idx: "02", theme: "light", duration: 4.6, cta: false, text: "Sim — roteiro, vídeo<br>e legenda, tudo gerado" },
  { idx: "03", theme: "dark",  duration: 4.6, cta: false, text: "Sem precisar gravar<br>nem editar nada" },
  { idx: "04", theme: "light", duration: 4.6, cta: false, text: "Publica direto no seu<br><span class=\"accent\">Instagram</span>, sozinho" },
  { idx: "05", theme: "dark",  duration: 5.0, cta: true,  text: "<span class=\"accent\">Segue</span> esse perfil e<br>deixe seu comentário" },
];
const TOTAL_SLIDES = SLIDES.length;

const ORANGE = "#E94F00";
const ORANGE_RGB = "233,79,0";

const THEMES = {
  dark: {
    bg: "#0e1613", gridColor: "rgba(255,255,255,.035)", ink: "#ffffff",
    brandColor: "rgba(255,255,255,.75)", idxColor: "rgba(255,255,255,.35)",
    accent: ORANGE, bar: ORANGE, sparkColor: ORANGE,
  },
  light: {
    bg: "#F0EBE1", gridColor: "rgba(30,28,25,.05)", ink: "#211f1c",
    brandColor: "rgba(33,31,28,.6)", idxColor: "rgba(33,31,28,.35)",
    accent: ORANGE, bar: ORANGE, sparkColor: ORANGE,
  },
};

const GLOW_POS = ["20% 15%", "85% 10%", "15% 85%", "90% 80%", "50% 85%"];

function frameHtml(slide) {
  const t = THEMES[slide.theme];
  const glowOpacity = slide.theme === "dark" ? 0.55 : 0.10;
  const glowSpread = slide.theme === "dark" ? 60 : 45;
  const glow = `radial-gradient(circle at ${GLOW_POS[SLIDES.indexOf(slide)]}, rgba(${ORANGE_RGB},${glowOpacity}), transparent ${glowSpread}%)`;
  const headlineShadow = slide.theme === "dark"
    ? `text-shadow:0 0 50px rgba(${ORANGE_RGB},.65), 0 0 110px rgba(${ORANGE_RGB},.35);`
    : "";
  const decorCorner = SLIDES.indexOf(slide) % 2 === 0 ? "left" : "right";
  const decor = slide.theme === "dark" ? `
    <div class="dots" style="${decorCorner}:0;"></div>
    <div class="stripes" style="${decorCorner === "left" ? "right" : "left"}:0;"></div>
    <div class="rays"></div>
  ` : "";
  return `<!doctype html><html><head><meta charset="utf-8"><style>
    *{margin:0;padding:0;box-sizing:border-box;}
    html,body{width:${W}px;height:${H}px;}
    body{
      position:relative;overflow:hidden;
      background-color:${t.bg};
      background-image:
        ${glow},
        repeating-linear-gradient(0deg, ${t.gridColor} 0px, ${t.gridColor} 1px, transparent 1px, transparent 64px),
        repeating-linear-gradient(90deg, ${t.gridColor} 0px, ${t.gridColor} 1px, transparent 1px, transparent 64px);
      font-family:-apple-system,"Segoe UI",Arial,sans-serif;color:${t.ink};
      display:flex;flex-direction:column;
    }
    .dots{
      position:absolute;top:0;width:520px;height:520px;pointer-events:none;
      background-image:radial-gradient(rgba(${ORANGE_RGB},.9) 2.4px, transparent 3px);
      background-size:28px 28px;
      -webkit-mask-image:radial-gradient(circle at 0% 0%, black 0%, black 38%, transparent 72%);
    }
    .stripes{
      position:absolute;top:0;width:560px;height:820px;pointer-events:none;
      background-image:repeating-linear-gradient(45deg, rgba(${ORANGE_RGB},.5) 0px, rgba(${ORANGE_RGB},.5) 3px, transparent 3px, transparent 30px);
      -webkit-mask-image:radial-gradient(circle at 100% 0%, black 0%, black 32%, transparent 68%);
    }
    .rays{
      position:absolute;inset:-260px;pointer-events:none;
      background-image:repeating-conic-gradient(from 0deg at 50% 62%, rgba(${ORANGE_RGB},.12) 0deg 3deg, transparent 3deg 11deg);
      -webkit-mask-image:radial-gradient(circle at 50% 62%, black 0%, black 22%, transparent 58%);
    }
    .header{ height:280px;flex-shrink:0;position:relative;padding:0 80px;z-index:2; }
    .brand{
      position:absolute;top:170px;left:80px;
      font-size:40px;font-weight:700;letter-spacing:.12em;color:${t.brandColor};
      text-transform:uppercase;display:flex;align-items:center;gap:12px;
    }
    .brand .spark{color:${t.sparkColor};}
    .idx{
      position:absolute;top:176px;right:80px;
      font-size:30px;font-weight:700;color:${t.idxColor};
      font-family:Consolas,"Courier New",monospace;
    }
    .main{ flex:1;display:flex;flex-direction:column;justify-content:center;padding:0 80px 150px 80px;position:relative;z-index:2; }
    .bar{ width:72px;height:9px;border-radius:5px;background:${t.bar};margin-bottom:36px; }
    .headline{
      font-size:${slide.cta ? 78 : 92}px;font-weight:800;color:${t.ink};line-height:1.18;
      letter-spacing:-.01em;${headlineShadow}
    }
    .accent{ color:${t.accent}; }
  </style></head><body>
    ${decor}
    <div class="header">
      <div class="brand"><span class="spark">✳</span> Claude Code + Instagram</div>
      <div class="idx">${slide.idx}/0${TOTAL_SLIDES}</div>
    </div>
    <div class="main">
      <div class="bar"></div>
      <div class="headline">${slide.text}</div>
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
    console.log(`  Frame gerado: ${outPath} (${slide.theme}, ${slide.duration}s)`);
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
