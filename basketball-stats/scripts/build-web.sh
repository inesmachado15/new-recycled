#!/usr/bin/env bash
# Gera a versão web (pac-basket-stats.vercel.app) na pasta web/.
set -euo pipefail
cd "$(dirname "$0")/.."
rm -rf web
npx expo export --platform web --output-dir web
cp assets/icon.png web/apple-touch-icon.png
cat > web/vercel.json <<'JSON'
{
  "framework": null,
  "installCommand": "",
  "buildCommand": "",
  "outputDirectory": ".",
  "rewrites": [{ "source": "/(.*)", "destination": "/index.html" }]
}
JSON
printf 'User-agent: *\nDisallow: /\n' > web/robots.txt
# Ícone e nome ao adicionar ao ecrã principal (iPhone/iPad); não indexar
node -e '
const fs = require("fs");
const p = "web/index.html";
let h = fs.readFileSync(p, "utf8");
h = h.replace(/<title>[^<]*<\/title>/, "<title>Basket Stats</title>");
h = h.replace("</head>", [
  "<link rel=\"apple-touch-icon\" href=\"/apple-touch-icon.png\">",
  "<meta name=\"apple-mobile-web-app-capable\" content=\"yes\">",
  "<meta name=\"mobile-web-app-capable\" content=\"yes\">",
  "<meta name=\"apple-mobile-web-app-title\" content=\"Basket Stats\">",
  "<meta name=\"apple-mobile-web-app-status-bar-style\" content=\"black-translucent\">",
  "<meta name=\"theme-color\" content=\"#2F6B45\">",
  "<meta name=\"robots\" content=\"noindex\">",
  "</head>"].join(""));
fs.writeFileSync(p, h);
'
echo "Versão web gerada em web/"
