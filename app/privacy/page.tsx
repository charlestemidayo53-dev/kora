import Link from "next/link";

export const metadata = {
  title: "Privacy Policy | Kora Marketplace",
  description: "How Kora Marketplace collects, uses, and protects your data.",
};

export default function PrivacyPage() {
  const pageWrapperClasses = "min-h-screen bg-[#f0faf4]";
  const headerClasses = "bg-[#1a4731] text-white py-12 px-6";
  const headerInnerClasses = "max-w-4xl mx-auto";
  const headerTitleClasses = "text-3xl md:text-4xl font-bold mb-2";
  const headerSubtitleClasses = "text-[#d4ecdd] text-sm";
  const contentWrapperClasses = "max-w-4xl mx-auto px-6 py-10";
  const cardClasses = "bg-white border border-[#d4ecdd] rounded-lg shadow-sm p-6 md:p-10";
  const sectionClasses = "mb-7";
  const sectionTitleClasses = "text-xl font-semibold text-[#1a4731] mb-2";
  const paragraphClasses = "text-gray-700 leading-relaxed mb-2";
  const listClasses = "list-disc pl-6 space-y-1 text-gray-700 mb-2";
  const lastUpdatedClasses = "text-sm text-gray-500 mb-6";
  const contactBoxClasses = "bg-[#f0faf4] border border-[#d4ecdd] rounded-lg p-6 mt-2";
  const backLinkClasses = "inline-block mt-6 text-[#2e8b5a] hover:text-[#1a4731] hover:underline text-sm";

  return (
    <div className={pageWrapperClasses}>
      <header className={headerClasses}>
        <div className={headerInnerClasses}>
          <h1 className={headerTitleClasses}>Privacy Policy</h1>
          <p className={headerSubtitleClasses}>Kora Marketplace</p>
        </div>
      </header>

      <div className={contentWrapperClasses}>
        <div className={cardClasses}>
          <p className={lastUpdatedClasses}>Last updated: July 22, 2026</p>

          <p className={paragraphClasses}>
            This Privacy Policy explains how Kora Marketplace (&quot;Kora,&quot; &quot;we,&quot;
            &quot;us&quot;) collects, uses, and protects information when you use our
            Platform across Nigeria and other African countries.
          </p>

          <section className={sectionClasses}>
            <h2 className={sectionTitleClasses}>1. Information We Collect</h2>
            <ul className={listClasses}>
              <li>Account details: name, email, phone number, business name and address.</li>
              <li>Profile data: avatar images, seller/buyer status, verification documents.</li>
              <li>Transaction data: orders, cart items, inquiries, and messages between buyers and sellers.</li>
              <li>Technical data: IP address, device and browser type, and usage logs.</li>
              <li>Cookies and similar technologies, as described in our Cookie Policy.</li>
            </ul>
          </section>

          <section className={sectionClasses}>
            <h2 className={sectionTitleClasses}>2. How We Use Your Information</h2>
            <ul className={listClasses}>
              <li>To create and manage your account and authenticate logins.</li>
              <li>To operate the marketplace, including listings, cart, orders, and messaging.</li>
              <li>To process payments and prevent fraud.</li>
              <li>To communicate with you about your account, orders, or support requests.</li>
              <li>To improve the Platform and comply with legal obligations.</li>
            </ul>
          </section>

          <section className={sectionClasses}>
            <h2 className={sectionTitleClasses}>3. How We Store and Process Data</h2>
            <p className={paragraphClasses}>
              Account, profile, and transaction data are stored using Supabase,
              our database, authentication, and file storage provider,
              including avatar images stored in a dedicated storage bucket.
              Supabase applies industry-standard security measures, and access
              to your data is restricted to what is necessary to operate the
              Platform.
            </p>
          </section>

          <section className={sectionClasses}>
            <h2 className={sectionTitleClasses}>4. Sharing of Information</h2>
            <p className={paragraphClasses}>
              We share information with sellers or buyers only as needed to
              complete a transaction, with payment processors to complete
              payments, and with service providers who support our
              infrastructure (such as Supabase). We do not sell your personal
              information to third parties.
            </p>
          </section>

          <section className={sectionClasses}>
            <h2 className={sectionTitleClasses}>5. Data Retention</h2>
            <p className={paragraphClasses}>
              We retain your information for as long as your account is active
              or as needed to provide the Platform, resolve disputes, and
              comply with legal obligations. You may request deletion of your
              account at any time, subject to records we are required to keep
              by law.
            </p>
          </section>

          <section className={sectionClasses}>
            <h2 className={sectionTitleClasses}>6. Your Rights</h2>
            <p className={paragraphClasses}>
              You may access, correct, or request deletion of your personal
              information, and may object to certain uses of your data, by
              contacting us using the details below.
            </p>
          </section>

          <section className={sectionClasses}>
            <h2 className={sectionTitleClasses}>7. Data Security</h2>
            <p className={paragraphClasses}>
              We use reasonable technical and organizational measures to
              protect your information. No method of transmission or storage
              is completely secure, and we cannot guarantee absolute security.
            </p>
          </section>

          <section className={sectionClasses}>
            <h2 className={sectionTitleClasses}>8. Children&apos;s Privacy</h2>
            <p className={paragraphClasses}>
              The Platform is intended for business use by individuals aged 18
              and above. We do not knowingly collect information from
              children.
            </p>
          </section>

          <section className={sectionClasses}>
            <h2 className={sectionTitleClasses}>9. Changes to This Policy</h2>
            <p className={paragraphClasses}>
              We may update this Privacy Policy from time to time. Material
              changes will be indicated by updating the &quot;Last updated&quot; date
              above.
            </p>
          </section>

          <section className={sectionClasses}>
            <h2 className={sectionTitleClasses}>10. Contact Us</h2>
            <div className={contactBoxClasses}>
              <p className={paragraphClasses + " mb-1"}>Kora Marketplace</p>
              <p className={paragraphClasses + " mb-1"}>Email: korasupport1@gmail.com</p>
              <p className={paragraphClasses + " mb-0"}>Nigeria</p>
            </div>
          </section>

          <Link href="/" className={backLinkClasses}>
            Back to Home
          </Link>
        </div>
      </div>
    </div>
  );
}