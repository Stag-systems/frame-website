/**
 * FRAME · Kontaktformular
 * Cloudflare Pages Function — nimmt das Formular entgegen und schickt
 * die Anfrage per Resend an info@theframe.at.
 *
 * Environment Variables (Cloudflare → Pages → Settings → Variables and Secrets):
 *   RESEND_API_KEY   Pflicht. Als Secret anlegen, nicht als Plaintext.
 *   MAIL_TO          optional, Default info@theframe.at
 *   MAIL_FROM        optional, Default "FRAME Website <anfrage@send.theframe.at>"
 *                    (send.theframe.at ist bei Resend verifiziert)
 */

const LIMITS = { name: 120, email: 200, art: 80, datum: 120, equip: 400, msg: 4000 };

const json = (obj, status = 200) =>
  new Response(JSON.stringify(obj), {
    status,
    headers: { 'content-type': 'application/json; charset=utf-8' },
  });

// Steuerzeichen raus (Header-Injection), trimmen, Laenge kappen
const clean = (v, max) =>
  typeof v === 'string'
    ? v.replace(/[\u0000-\u001F\u007F]/g, ' ').trim().slice(0, max)
    : '';

export async function onRequestPost({ request, env }) {
  let f;
  try {
    const ct = request.headers.get('content-type') || '';
    f = ct.includes('application/json')
      ? await request.json()
      : Object.fromEntries(await request.formData());
  } catch {
    return json({ ok: false, error: 'bad_request' }, 400);
  }

  // Honigtopf: echte Menschen fuellen das unsichtbare Feld nie aus.
  // Bots schon — dann still "ok" melden, damit sie es nicht erneut versuchen.
  if (clean(f.website, 100)) return json({ ok: true });

  const name  = clean(f.name,  LIMITS.name);
  const email = clean(f.email, LIMITS.email);
  const art   = clean(f.art,   LIMITS.art);
  const datum = clean(f.datum, LIMITS.datum);
  const equip = clean(f.equip, LIMITS.equip);
  const msg   = clean(f.msg,   LIMITS.msg);

  if (!name || !email) return json({ ok: false, error: 'missing_fields' }, 400);
  if (!/^[^@\s]+@[^@\s.]+\.[^@\s]+$/.test(email)) {
    return json({ ok: false, error: 'bad_email' }, 400);
  }

  if (!env.RESEND_API_KEY) {
    console.error('RESEND_API_KEY fehlt');
    return json({ ok: false, error: 'not_configured' }, 500);
  }

  const to   = env.MAIL_TO   || 'info@theframe.at';
  const from = env.MAIL_FROM || 'FRAME Website <anfrage@send.theframe.at>';

  const zeilen = [
    ['Name',         name],
    ['E-Mail',       email],
    ['Projektart',   art],
    ['Wunschtermin', datum],
    ['Equipment',    equip],
  ].filter(([, v]) => v);

  const text =
    zeilen.map(([k, v]) => `${k}: ${v}`).join('\n') +
    (msg ? `\n\nNachricht:\n${msg}` : '') +
    '\n\n— gesendet über das Kontaktformular auf theframe.at';

  try {
    const r = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        authorization: `Bearer ${env.RESEND_API_KEY}`,
        'content-type': 'application/json',
      },
      body: JSON.stringify({
        from,
        to: [to],
        reply_to: email,          // Stefan kann direkt auf "Antworten" druecken
        subject: `FRAME · ${art || 'Anfrage'} · ${name}`,
        text,
      }),
    });

    if (!r.ok) {
      console.error('Resend', r.status, await r.text());
      return json({ ok: false, error: 'send_failed' }, 502);
    }
    return json({ ok: true });
  } catch (e) {
    console.error('Resend fetch', e);
    return json({ ok: false, error: 'send_failed' }, 502);
  }
}

// GET auf /api/contact soll nicht die Startseite ausliefern
export const onRequestGet = () => json({ ok: false, error: 'method_not_allowed' }, 405);
