export default function TermsPage() {
  return (
    <main className="mx-auto max-w-3xl px-4 py-10 sm:px-6 lg:px-8">
      <h1 className="text-3xl font-bold text-foreground">Terms of Service</h1>
      <p className="mt-2 text-sm text-muted-foreground">
        Last updated: February 26, 2026
      </p>

      <div className="mt-8 space-y-6 text-sm leading-relaxed text-foreground/90">
        <section>
          <h2 className="text-lg font-semibold text-foreground">1. Use of CardSense</h2>
          <p className="mt-2">
            CardSense provides educational card discovery and comparison insights. You are responsible
            for validating eligibility, fees, and official terms with each issuer before applying.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-foreground">2. No financial advice</h2>
          <p className="mt-2">
            Content and recommendations are informational and do not constitute legal, tax, or
            investment advice.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-foreground">3. Accounts and security</h2>
          <p className="mt-2">
            You are responsible for safeguarding account credentials and activity under your account.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-foreground">4. Availability</h2>
          <p className="mt-2">
            We may update, suspend, or discontinue features for maintenance, security, or product
            improvements.
          </p>
        </section>
      </div>
    </main>
  )
}
