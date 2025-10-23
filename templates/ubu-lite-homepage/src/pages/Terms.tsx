import React from 'react';

const Terms: React.FC = () => {
  return (
    <div className="min-h-screen bg-[var(--bg)] text-[var(--text)]">
      <header className="border-b border-[color:var(--border)]">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 py-6 flex items-center justify-between">
          <a href="/" className="font-extrabold tracking-tight text-xl">
            UBU <span className="text-[var(--orange-600)]">Lite</span>
          </a>
          <a href="/" className="text-sm hover:text-[var(--navy-800)]">Home</a>
        </div>
      </header>

      <main className="mx-auto max-w-4xl px-4 sm:px-6 py-10">
        <h1 className="text-3xl font-extrabold tracking-tight">Terms of Service</h1>
        <p className="mt-2 text-[var(--muted)]">Last updated: {new Date().toLocaleDateString()}</p>

        <div className="mt-8 space-y-8">
          <section className="rounded-2xl border border-[color:var(--border)] bg-[var(--card)] p-6">
            <h2 className="text-xl font-semibold">1. Acceptance of Terms</h2>
            <p className="mt-2 text-[var(--muted)]">
              By accessing or using UBU Lite, you agree to be bound by these Terms of
              Service. If you do not agree, do not use the Service.
            </p>
          </section>

          <section className="rounded-2xl border border-[color:var(--border)] bg-[var(--card)] p-6">
            <h2 className="text-xl font-semibold">2. Description of Service</h2>
            <p className="mt-2 text-[var(--muted)]">
              UBU Lite provides a marketplace for clients and creatives to discover,
              connect, and manage projects. Certain features may be experimental or
              offered as demos.
            </p>
          </section>

          <section className="rounded-2xl border border-[color:var(--border)] bg-[var(--card)] p-6">
            <h2 className="text-xl font-semibold">3. Accounts & Eligibility</h2>
            <ul className="mt-2 list-disc pl-6 text-[var(--muted)] space-y-1">
              <li>You must be at least 18 years old to use the Service.</li>
              <li>You are responsible for maintaining account security.</li>
              <li>Provide accurate information and keep it up to date.</li>
            </ul>
          </section>

          <section className="rounded-2xl border border-[color:var(--border)] bg-[var(--card)] p-6">
            <h2 className="text-xl font-semibold">4. Payments & Escrow</h2>
            <p className="mt-2 text-[var(--muted)]">
              Payments may be processed via third-party providers. Demo and test flows
              are for evaluation only and do not represent real transactions.
            </p>
          </section>

          <section className="rounded-2xl border border-[color:var(--border)] bg-[var(--card)] p-6">
            <h2 className="text-xl font-semibold">5. User Conduct</h2>
            <ul className="mt-2 list-disc pl-6 text-[var(--muted)] space-y-1">
              <li>Do not violate applicable laws or third-party rights.</li>
              <li>No harassment, spam, or harmful content.</li>
              <li>Respect project timelines and confidentiality.</li>
            </ul>
          </section>

          <section className="rounded-2xl border border-[color:var(--border)] bg-[var(--card)] p-6">
            <h2 className="text-xl font-semibold">6. Intellectual Property</h2>
            <p className="mt-2 text-[var(--muted)]">
              The Service and its original content are owned by their respective
              rights holders. You retain ownership of content you create unless
              otherwise agreed with your counterparty.
            </p>
          </section>

          <section className="rounded-2xl border border-[color:var(--border)] bg-[var(--card)] p-6">
            <h2 className="text-xl font-semibold">7. Disclaimers & Limitation of Liability</h2>
            <p className="mt-2 text-[var(--muted)]">
              The Service is provided "as is" without warranties of any kind. To the
              maximum extent permitted by law, UBU Lite is not liable for indirect or
              consequential damages.
            </p>
          </section>

          <section className="rounded-2xl border border-[color:var(--border)] bg-[var(--card)] p-6">
            <h2 className="text-xl font-semibold">8. Changes to Terms</h2>
            <p className="mt-2 text-[var(--muted)]">
              We may update these Terms from time to time. Continued use of the Service
              after changes constitutes acceptance of the new Terms.
            </p>
          </section>

          <section className="rounded-2xl border border-[color:var(--border)] bg-[var(--card)] p-6">
            <h2 className="text-xl font-semibold">Contact</h2>
            <p className="mt-2 text-[var(--muted)]">
              Questions about these Terms? Contact us at support@example.com.
            </p>
          </section>
        </div>
      </main>

      <footer className="mt-8 border-t border-[color:var(--border)]">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 py-6 text-sm text-[var(--muted)]">
          © {new Date().getFullYear()} UBU Lite - Ubuntu Graphix
        </div>
      </footer>
    </div>
  );
};

export default Terms;

