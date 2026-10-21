// ================= Supabase client =================
// A small GoTrue + PostgREST client over fetch: sign-up, sign-in, sign-out,
// access-token refresh and table reads and writes. Enough for Sculptor, so the
// page stays dependency-free.

function sbMessage(b, status) {
  const m = b && (b.error_description || b.msg || b.message || b.error_code || b.error);
  if (!m) return status ? `Something went wrong (${status}). Try again.` : 'No connection. Check your network.';
  const s = String(m);
  if (/invalid login credentials/i.test(s)) return 'That email and password do not match.';
  if (/email not confirmed/i.test(s)) return 'Confirm your email first — open the link we sent you.';
  if (/already registered|already been registered|already exists/i.test(s)) return 'That email already has an account. Sign in instead.';
  if (/password should be at least|weak.?password/i.test(s)) return 'Use a password of at least 6 characters.';
  if (/unable to validate email|invalid format|email address .* is invalid|email_address_invalid/i.test(s)) return 'Enter a valid email address.';
  if (/signup.*disabled|signups not allowed/i.test(s)) return 'New accounts are turned off for this project.';
  if (/rate limit|too many|over_email_send/i.test(s)) return 'Too many attempts. Wait a minute, then try again.';
  if (/duplicate key.*username/i.test(s)) return 'That username is taken. Pick another.';
  return s.charAt(0).toUpperCase() + s.slice(1);
}

const SB = {
  // Accept a bare project URL or one that already points at /rest/v1.
  url: String(typeof SUPABASE_URL === 'string' ? SUPABASE_URL : '').replace(/\/+$/, '').replace(/\/rest\/v1$/, ''),
  key: typeof SUPABASE_ANON_KEY === 'string' ? SUPABASE_ANON_KEY : '',
  skey: 'sculptor.session.v1',
  sess: null,

  configured() { return !!(this.url && this.key); },
  get user() { return (this.sess && this.sess.user) || null; },

  // ---------- session ----------
  read() {
    try {
      const d = JSON.parse(localStorage.getItem(this.skey) || 'null');
      if (d && d.access_token && d.user) this.sess = d;
    } catch (e) { }
    return this.sess;
  },
  write(s) {
    // GoTrue reports a lifetime in seconds; keep an absolute ms deadline instead.
    this.sess = s && s.access_token ? { ...s, exp_ms: Date.now() + (s.expires_in || 3600) * 1000 } : null;
    try {
      if (this.sess) localStorage.setItem(this.skey, JSON.stringify(this.sess));
      else localStorage.removeItem(this.skey);
    } catch (e) { }
    return this.sess;
  },

  async call(path, opts = {}) {
    let r, txt;
    try {
      r = await fetch(`${this.url}/auth/v1/${path}`, {
        ...opts,
        headers: { apikey: this.key, 'Content-Type': 'application/json', ...(opts.headers || {}) }
      });
      txt = await r.text();
    } catch (e) { throw new Error('No connection. Check your network.'); }
    let body = null;
    try { body = txt ? JSON.parse(txt) : null; } catch (e) { }
    if (!r.ok) throw new Error(sbMessage(body, r.status));
    return body;
  },

  // ---------- auth ----------
  // With email confirmation on, signup returns a user but no session, so the
  // caller has to send them to their inbox rather than straight into the app.
  async signUp(email, password, username) {
    const b = await this.call('signup', {
      method: 'POST',
      body: JSON.stringify({ email, password, data: { username } })
    });
    if (b && b.access_token) { this.write(b); return { signedIn: true }; }
    return { signedIn: false };
  },
  async signIn(email, password) {
    this.write(await this.call('token?grant_type=password', {
      method: 'POST',
      body: JSON.stringify({ email, password })
    }));
    return this.user;
  },
  async signOut() {
    const t = this.sess && this.sess.access_token;
    this.write(null);
    if (t) { try { await this.call('logout', { method: 'POST', headers: { Authorization: 'Bearer ' + t } }); } catch (e) { } }
  },
  async refresh() {
    if (!this.sess || !this.sess.refresh_token) return null;
    try {
      return this.write(await this.call('token?grant_type=refresh_token', {
        method: 'POST',
        body: JSON.stringify({ refresh_token: this.sess.refresh_token })
      }));
    } catch (e) {
      this.write(null); // refresh token is spent or revoked: treat as signed out
      return null;
    }
  },
  async token() {
    if (!this.sess) return null;
    if (Date.now() > (this.sess.exp_ms || 0) - 60000) await this.refresh();
    return this.sess ? this.sess.access_token : null;
  },

  // ---------- tables ----------
  async rest(path, opts = {}) {
    const t = await this.token();
    if (!t) throw new Error('Your session expired. Sign in again.');
    let r, txt;
    try {
      r = await fetch(`${this.url}/rest/v1/${path}`, {
        ...opts,
        headers: { apikey: this.key, Authorization: 'Bearer ' + t, 'Content-Type': 'application/json', ...(opts.headers || {}) }
      });
      txt = await r.text();
    } catch (e) { throw new Error('No connection. Check your network.'); }
    let body = null;
    try { body = txt ? JSON.parse(txt) : null; } catch (e) { }
    if (!r.ok) throw new Error(sbMessage(body, r.status));
    return body;
  }
};
