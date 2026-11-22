const COOKIE_NAME = '__Host-teju_session'
const SESSION_TTL_SECONDS = 24 * 60 * 60

const encoder = new TextEncoder()

const securityHeaders = {
  'Cache-Control': 'no-store, max-age=0',
  'Content-Security-Policy':
    "default-src 'none'; form-action 'self'; base-uri 'none'; frame-ancestors 'none'",
  'Referrer-Policy': 'no-referrer',
  'X-Content-Type-Options': 'nosniff',
  'X-Frame-Options': 'DENY',
}

const getCookie = (request, name) => {
  const cookieHeader = request.headers.get('Cookie') || ''
  for (const part of cookieHeader.split(';')) {
    const [key, ...valueParts] = part.trim().split('=')
    if (key === name) return valueParts.join('=')
  }
  return null
}

const toBase64Url = (bytes) => {
  let binary = ''
  for (const byte of bytes) binary += String.fromCharCode(byte)
  return btoa(binary)
    .replaceAll('+', '-')
    .replaceAll('/', '_')
    .replaceAll('=', '')
}

const sign = async (value, secret) => {
  const key = await crypto.subtle.importKey(
    'raw',
    encoder.encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign'],
  )
  const signature = await crypto.subtle.sign(
    'HMAC',
    key,
    encoder.encode(value),
  )
  return toBase64Url(new Uint8Array(signature))
}

const constantTimeEqual = (left, right) => {
  const leftBytes = encoder.encode(left)
  const rightBytes = encoder.encode(right)
  const length = Math.max(leftBytes.length, rightBytes.length)
  let mismatch = leftBytes.length ^ rightBytes.length

  for (let index = 0; index < length; index += 1) {
    mismatch |=
      (leftBytes[index % leftBytes.length] || 0) ^
      (rightBytes[index % rightBytes.length] || 0)
  }

  return mismatch === 0
}

const createSession = async (secret) => {
  const expiresAt = Date.now() + SESSION_TTL_SECONDS * 1000
  const payload = String(expiresAt)
  const signature = await sign(`session:${payload}`, secret)
  return `${payload}.${signature}`
}

const hasValidSession = async (request, secret) => {
  const session = getCookie(request, COOKIE_NAME)
  if (!session) return false

  const [expiresAt, suppliedSignature, ...extra] = session.split('.')
  if (
    extra.length > 0 ||
    !expiresAt ||
    !suppliedSignature ||
    !/^\d{13}$/.test(expiresAt) ||
    Number(expiresAt) <= Date.now()
  ) {
    return false
  }

  const expectedSignature = await sign(`session:${expiresAt}`, secret)
  return constantTimeEqual(suppliedSignature, expectedSignature)
}

const nonce = () => {
  const bytes = new Uint8Array(16)
  crypto.getRandomValues(bytes)
  return toBase64Url(bytes)
}

const loginPage = (message = '', status = 200) => {
  const styleNonce = nonce()
  const safeMessage = message
    ? `<p class="error" role="alert">${message}</p>`
    : ''
  const html = `<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <meta name="robots" content="noindex, nofollow">
    <title>Protected Access</title>
    <style nonce="${styleNonce}">
      :root {
        color: #29172b;
        background: #fff7ee;
        font-family: "Segoe UI", system-ui, sans-serif;
      }
      * { box-sizing: border-box; }
      body {
        min-width: 320px;
        min-height: 100svh;
        margin: 0;
        display: grid;
        place-items: center;
        padding: 1.25rem;
        overflow: hidden;
        background:
          radial-gradient(circle at 14% 12%, rgba(246,184,200,.9), transparent 29rem),
          radial-gradient(circle at 90% 88%, rgba(187,168,242,.48), transparent 24rem),
          #fff7ee;
      }
      body::before, body::after {
        position: fixed;
        content: "";
        border-radius: 50%;
        pointer-events: none;
      }
      body::before {
        width: 12rem;
        height: 12rem;
        right: -4rem;
        top: 8%;
        background: rgba(255,226,138,.55);
      }
      body::after {
        width: 8rem;
        height: 8rem;
        left: -3rem;
        bottom: 8%;
        background: rgba(183,228,208,.55);
      }
      main {
        position: relative;
        z-index: 1;
        width: min(100%, 28rem);
        padding: clamp(1.35rem, 5vw, 2.4rem);
        border: 1px solid rgba(41,23,43,.15);
        border-radius: 1.4rem;
        background: rgba(255,253,249,.94);
        box-shadow: 0 28px 80px rgba(72,34,66,.18);
      }
      .stamp {
        display: inline-block;
        margin-bottom: 1.3rem;
        padding: .45rem .65rem;
        border: 2px solid #c93450;
        color: #c93450;
        font: 800 .66rem ui-monospace, monospace;
        letter-spacing: .1em;
        text-transform: uppercase;
        transform: rotate(-2deg);
      }
      .eyebrow {
        margin: 0 0 .65rem;
        color: #641e38;
        font: 800 .68rem ui-monospace, monospace;
        letter-spacing: .1em;
        text-transform: uppercase;
      }
      h1 {
        margin: 0;
        font: 600 clamp(2.35rem, 11vw, 4rem)/.98 Georgia, serif;
        letter-spacing: -.04em;
      }
      h1 em { color: #c93450; }
      .intro {
        margin: 1rem 0 1.35rem;
        color: #705d70;
        line-height: 1.65;
      }
      label {
        display: block;
        margin-bottom: .45rem;
        font-size: .78rem;
        font-weight: 800;
      }
      input {
        width: 100%;
        min-height: 50px;
        padding: .75rem .9rem;
        border: 1px solid rgba(41,23,43,.24);
        border-radius: .8rem;
        color: #29172b;
        background: #fff;
        font: inherit;
      }
      input:focus {
        outline: 3px solid #ff6f7d;
        outline-offset: 2px;
      }
      button {
        width: 100%;
        min-height: 50px;
        margin-top: .8rem;
        border: 0;
        border-radius: 999px;
        color: #fff;
        background: #29172b;
        box-shadow: 0 6px 0 #c93450;
        font: 800 .92rem "Segoe UI", system-ui, sans-serif;
        cursor: pointer;
      }
      button:active {
        box-shadow: 0 2px 0 #c93450;
        transform: translateY(4px);
      }
      .error {
        margin: 0 0 .8rem;
        padding: .7rem .8rem;
        border-radius: .65rem;
        color: #641e38;
        background: #ffe3e5;
        font-size: .82rem;
        line-height: 1.4;
      }
      footer {
        margin-top: 1.25rem;
        color: #806d7f;
        font: 700 .62rem ui-monospace, monospace;
        letter-spacing: .08em;
        text-align: center;
        text-transform: uppercase;
      }
      @media (prefers-reduced-motion: reduce) {
        *, *::before, *::after { transition: none; }
      }
    </style>
  </head>
  <body>
    <main>
      <h1>Enter password</h1>
      ${safeMessage}
      <form action="/__auth" method="post">
        <label for="password">Password</label>
        <input id="password" name="password" type="password" maxlength="128" autocomplete="current-password" required autofocus>
        <button type="submit">Continue</button>
      </form>
    </main>
  </body>
</html>`

  return new Response(html, {
    status,
    headers: {
      ...securityHeaders,
      'Content-Security-Policy': `${securityHeaders['Content-Security-Policy']}; style-src 'nonce-${styleNonce}'`,
      'Content-Type': 'text/html; charset=utf-8',
    },
  })
}

const redirect = (location, cookie) =>
  new Response(null, {
    status: 303,
    headers: {
      ...securityHeaders,
      Location: location,
      'Set-Cookie': cookie,
    },
  })

const authenticate = async (context) => {
  const { request, env } = context
  const body = await request.text()
  const password = new URLSearchParams(body).get('password') || ''
  const [suppliedHash, expectedHash] = await Promise.all([
    sign(`password:${password.slice(0, 128)}`, env.AUTH_SECRET),
    sign(`password:${env.SITE_PASSWORD}`, env.AUTH_SECRET),
  ])

  if (!constantTimeEqual(suppliedHash, expectedHash)) {
    return loginPage('Incorrect password.', 401)
  }

  const session = await createSession(env.AUTH_SECRET)
  const cookie = `${COOKIE_NAME}=${session}; Path=/; Max-Age=${SESSION_TTL_SECONDS}; HttpOnly; Secure; SameSite=Strict`
  return redirect('/', cookie)
}

export const onRequest = async (context) => {
  const { request, env } = context
  if (!env.SITE_PASSWORD || !env.AUTH_SECRET) {
    return new Response('Access protection is temporarily unavailable.', {
      status: 503,
      headers: securityHeaders,
    })
  }

  const url = new URL(request.url)
  if (url.pathname === '/__auth' && request.method === 'POST') {
    return authenticate(context)
  }

  if (url.pathname === '/__logout' && request.method === 'GET') {
    return redirect(
      '/',
      `${COOKIE_NAME}=; Path=/; Max-Age=0; HttpOnly; Secure; SameSite=Strict`,
    )
  }

  if (!(await hasValidSession(request, env.AUTH_SECRET))) {
    return loginPage()
  }

  const response = await context.next()
  const headers = new Headers(response.headers)
  headers.set('Referrer-Policy', 'strict-origin-when-cross-origin')
  headers.set('X-Content-Type-Options', 'nosniff')
  headers.set('X-Frame-Options', 'DENY')

  return new Response(response.body, {
    status: response.status,
    statusText: response.statusText,
    headers,
  })
}
