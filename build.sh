#!/usr/bin/env bash
# FRAME · Build fuer Cloudflare Pages
# Kopiert nur das, was oeffentlich sein darf, nach dist/.
# Cloudflare kennt .vercelignore NICHT — dieses Script ist der Ersatz dafuer.
set -euo pipefail

rm -rf dist
mkdir -p dist

EXCLUDES=(
  '.git'  'dist'  'build.sh'  '.DS_Store'
  '.gitignore'  '.vercelignore'
  '_wip'                    # Arbeitsmaterial: PDF-Quellen, Generatoren, Prototypen
                            # darin u.a. bts-src/ (Nutzungsrechte ungeklaert!) + polaroid-src/
  'fonts/_x'  'fonts/*.zip' # Font-Rohmaterial
  '_loading-preview.html'  '_plan-preview.html'  '_website-plan.md'
)

if command -v rsync >/dev/null 2>&1; then
  args=(); for e in "${EXCLUDES[@]}"; do args+=(--exclude "$e"); done
  rsync -a "${args[@]}" ./ dist/
else
  args=(); for e in "${EXCLUDES[@]}"; do args+=(--exclude="$e"); done
  tar "${args[@]}" -cf - . | tar -xf - -C dist
fi

echo "── dist/ gebaut ──"
find dist -type f | wc -l | xargs echo "Dateien:"
du -sh dist | cut -f1 | xargs echo "Groesse:"
# Sicherheitsnetz: Build bricht ab, wenn Heikles doch drin landet
for verboten in dist/_wip dist/fonts/_x; do
  [[ -e "$verboten" ]] && { echo "ABBRUCH: $verboten ist im Build!"; exit 1; }
done
echo "Check ok — _wip und fonts/_x sind draussen."
