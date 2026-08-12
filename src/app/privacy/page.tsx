export default function PrivacyPage() {
  return (
    <main className="mx-auto max-w-3xl px-4 py-10 sm:px-6 lg:px-8">
      <h1 className="text-3xl font-bold text-foreground">Privacy Policy</h1>
      <p className="mt-2 text-sm text-muted-foreground">
        Last updated: August 12, 2026
      </p>

      <div className="mt-8 space-y-8 text-sm leading-relaxed text-foreground/90">
        <section>
          <h2 className="text-lg font-semibold text-foreground">1. Information we collect</h2>
          <p className="mt-2">
            We collect account details, credit-profile information, card preferences, recommendation
            inputs, spending transactions you enter or upload, and technical events needed to operate
            and secure the service. Bank statements may contain sensitive financial information, so
            only upload a statement you are authorized to use.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-foreground">2. How we use data</h2>
          <p className="mt-2">
            We use this information to authenticate you, calculate and explain card recommendations,
            import spending history, provide support, prevent abuse, and monitor reliability. Card
            recommendations are informational estimates, not financial or approval advice.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-foreground">3. Service Providers & AI Processing</h2>
          <p className="mt-2">
            We do not sell personal data. Supabase provides authentication and database hosting;
            Google GenAI may process the financial-profile and spending inputs required to generate
            an AI-assisted recommendation; Cloudflare Turnstile may process anti-abuse signals; and
            Sentry may receive technical error and performance telemetry. These providers process
            information using their own contractual and geographic infrastructure arrangements.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-foreground">4. Storage, Retention & Security</h2>
          <p className="mt-2">
            Account and recommendation records are retained while your account is active and as
            required for security, legal, backup, or fraud-prevention purposes. Some advisor inputs
            are also stored in your browser until you sign out, delete the account, or clear browser
            storage. We use access controls and encryption in transit, but no online service can
            guarantee absolute security.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-foreground">5. Your Controls</h2>
          <p className="mt-2">
            You can update profile information, download a copy of account data, sign out to clear
            locally stored financial inputs, and permanently delete your account from Settings.
            Deletion may require you to sign in again and may not immediately remove legally required
            or disaster-recovery backups.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-foreground">6. Cookies & Changes</h2>
          <p className="mt-2">
            CardSense uses authentication cookies and limited browser storage to keep you signed in,
            remember in-progress forms, and protect the service. Material policy changes will be
            reflected by the date at the top of this page.
          </p>
        </section>
      </div>
    </main>
  )
}
