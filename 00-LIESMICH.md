# ⚠️ DEV — Git-Repo, deployt live

**Remote:** github.com/Stag-systems/frame-website · Branch `main` → Cloudflare Pages (Projekt `theframe`) → **www.theframe.at**
**Jeder Push auf `main` ist sofort öffentlich.**

Nichts per Finder ändern, verschieben oder umbenennen. Änderungen nur über Claude/Git, danach `git push`.

## Was hier liegt

| | |
|---|---|
| `index.html`, `agb*.html`, `impressum*.html` | die Seiten (Century Gothic über Adobe-Kit `kvz6mty`, nie als Datei) |
| `fonts/` | IBM Plex (self-hosted) |
| `gallery/`, `plan-assets/`, `bts/`, `*.mp4`, `*.pdf` | Assets, die live ausgeliefert werden |
| `functions/api/contact.js` | Kontaktformular (Resend) — läuft als Cloudflare Function, liegt nicht im Output |
| `_wip/` | Quellen für PDFs (Preisliste, AGB, Guide) und Prototypen — **nicht** im Build |
| `build.sh` | baut `dist/` ohne `_wip/` und `functions/` — Cloudflare ruft das auf |

## Wenn etwas nicht online kommt
Cloudflare → Workers & Pages → `theframe` → Deployments. Häufigste Ursache (19.09.): GitHub-App „Cloudflare Workers and Pages" hat den Zugriff auf dieses Repo verloren → github.com → Settings → Applications → Repository access prüfen. Danach reicht ein leerer Commit als Auslöser.

Details: `~/.claude/…/memory/frame-website-cloudflare-pages.md` und `2-KUNDEN/FRAME/_DOKU/_online-setup.md`.
