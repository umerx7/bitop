export default {
  template: `
    <div style="min-height:calc(100vh - var(--header-height) - var(--footer-height));display:flex;align-items:center;justify-content:center;padding:60px 24px;text-align:center;">
      <div style="max-width:400px;">
        <div style="font-size:12rem;font-weight:800;background:linear-gradient(135deg,var(--accent-primary),var(--gold-primary));-webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text;line-height:1;margin-bottom:24px;">404</div>
        <h1 style="font-size:2rem;font-weight:700;margin-bottom:16px;">Page Not Found</h1>
        <p style="color:var(--text-secondary);margin-bottom:32px;line-height:1.6;">Sorry, we couldn't find the page you're looking for. It might have been moved or doesn't exist.</p>
        <div class="flex-center gap-4 flex-wrap">
          <a href="/" data-link class="btn btn-primary">Go Home</a>
          <a href="/markets" data-link class="btn btn-secondary">Browse Markets</a>
        </div>
        <div style="margin-top:48px;padding-top:24px;border-top:1px solid var(--border-muted);color:var(--text-muted);font-size:0.875rem;">
          <p>If you think this is a mistake, <a href="/chat" data-link style="color:var(--accent-primary);">contact support</a></p>
        </div>
      </div>
    </div>
  `,

  init() {}
};