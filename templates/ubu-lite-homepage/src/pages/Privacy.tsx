import React from 'react';

const Privacy: React.FC = () => {
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
        <h1 className="text-3xl font-extrabold tracking-tight">Privacy Policy</h1>
        <p className="mt-2 text-[var(--muted)]">Last updated: {new Date().toLocaleDateString()}</p>

        <div className="mt-8 space-y-8">
          <section className="rounded-2xl border border-[color:var(--border)] bg-[var(--card)] p-6">
            <h2 className="text-xl font-semibold">1. Introduction</h2>
            <p className="mt-2 text-[var(--muted)]">
              This Privacy Policy describes how UBU Lite collects, uses, and protects your information when you use the Service.
            </p>
          </section>

          <section className="rounded-2xl border border-[color:var(--border)] bg-[var(--card)] p-6">
            <h2 className="text-xl font-semibold">2. Information We Collect</h2>
            <ul className="mt-2 list-disc pl-6 text-[var(--muted)] space-y-1">
              <li>Account information (e.g. username, email).</li>
              <li>Profile and project details you choose to share.</li>
              <li>Usage data such as pages visited and actions taken.</li>
            </ul>
          </section>

          <section className="rounded-2xl border border-[color:var(--border)] bg-[var(--card)] p-6">
            <h2 className="text-xl font-semibold">3. How We Use Information</h2>
            <ul className="mt-2 list-disc pl-6 text-[var(--muted)] space-y-1">
              <li>To operate and improve the Service.</li>
              <li>To facilitate messaging, bookings, and payments.</li>
              <li>To comply with legal obligations.</li>
            </ul>
          </section>

          <section className="rounded-2xl border border-[color:var(--border)] bg-[var(--card)] p-6">
            <h2 className="text-xl font-semibold">4. Sharing of Information</h2>
            <p className="mt-2 text-[var(--muted)]">
              We do not sell your personal information. We may share it with service providers to support the Service or when required by law.
            </p>
          </section>

          <section className="rounded-2xl border border-[color:var(--border)] bg-[var(--card)] p-6">
            <h2 className="text-xl font-semibold">5. Data Retention</h2>
            <p className="mt-2 text-[var(--muted)]">
              We retain information as long as necessary to provide the Service and for legitimate business or legal purposes.
            </p>
          </section>

          <section className="rounded-2xl border border-[color:var(--border)] bg-[var(--card)] p-6">
            <h2 className="text-xl font-semibold">6. Your Choices</h2>
            <ul className="mt-2 list-disc pl-6 text-[var(--muted)] space-y-1">
              <li>Update or delete your profile information.</li>
              <li>Adjust communication preferences and notifications.</li>
              <li>Request access to or deletion of your data where applicable.</li>
            </ul>
          </section>

          <section className="rounded-2xl border border-[color:var(--border)] bg-[var(--card)] p-6">
            <h2 className="text-xl font-semibold">7. Security</h2>
            <p className="mt-2 text-[var(--muted)]">
              We use reasonable safeguards to protect information. No method of transmission or storage is completely secure.
            </p>
          </section>

          <section className="rounded-2xl border border-[color:var(--border)] bg-[var(--card)] p-6">
            <h2 className="text-xl font-semibold">8. Contact</h2>
            <p className="mt-2 text-[var(--muted)]">
              Questions about this policy? Contact us at privacy@example.com.
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

export default Privacy;

