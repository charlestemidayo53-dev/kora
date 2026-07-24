import Link from "next/link";

export const metadata = {
  title: "Cookie Policy | Kora Marketplace",
  description: "How Kora Marketplace uses cookies and similar technologies.",
};

export default function CookiesPage() {
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
  const lastUpdatedClasses = "text-sm text-gray-500 mb-6";
  const tableWrapperClasses = "overflow-x-auto mb-2";
  const tableClasses = "w-full text-sm border border-[#d4ecdd] rounded-lg overflow-hidden";
  const tableHeadRowClasses = "bg-[#f0faf4] text-left text-[#1a4731]";
  const tableHeadCellClasses = "px-4 py-2 font-semibold border-b border-[#d4ecdd]";
  const tableCellClasses = "px-4 py-2 border-b border-[#d4ecdd] text-gray-700 align-top";
  const contactBoxClasses = "bg-[#f0faf4] border border-[#d4ecdd] rounded-lg p-6 mt-2";
  const backLinkClasses = "inline-block mt-6 text-[#2e8b5a] hover:text-[#1a4731] hover:underline text-sm";

  const cookieRows = [
    {
      type: "Essential",
      purpose: "Keep you signed in, secure your session, and enable core Platform features such as cart and checkout.",
      canDisable: "No",
    },
    {
      type: "Preference",
      purpose: "Remember settings such as your preferred category filters and display options.",
      canDisable: "Yes",
    },
    {
      type: "Analytics",
      purpose: "Understand how the Platform is used so we can improve performance and features.",
      canDisable: "Yes",
    },
  ];

  return (
    <div className={pageWrapperClasses}>
      <header className={headerClasses}>
        <div className={headerInnerClasses}>
          <h1 className={headerTitleClasses}>Cookie Policy</h1>
          <p className={headerSubtitleClasses}>Kora Marketplace</p>
        </div>
      </header>

      <div className={contentWrapperClasses}>
        <div className={cardClasses}>
          <p className={lastUpdatedClasses}>Last updated: July 22, 2026</p>

          <p className={paragraphClasses}>
            This Cookie Policy explains how Kora Marketplace uses cookies and
            similar technologies when you visit our Platform.
          </p>

          <section className={sectionClasses}>
            <h2 className={sectionTitleClasses}>1. What Are Cookies</h2>
            <p className={paragraphClasses}>
              Cookies are small text files stored on your device that help a
              website function properly and remember information about your
              visit.
            </p>
          </section>

          <section className={sectionClasses}>
            <h2 className={sectionTitleClasses}>2. Cookies We Use</h2>
            <div className={tableWrapperClasses}>
              <table className={tableClasses}>
                <thead>
                  <tr className={tableHeadRowClasses}>
                    <th className={tableHeadCellClasses}>Type</th>
                    <th className={tableHeadCellClasses}>Purpose</th>
                    <th className={tableHeadCellClasses}>Can Be Disabled</th>
                  </tr>
                </thead>
                <tbody>
                  {cookieRows.map(function renderCookieRow(row) {
                    return (
                      <tr key={row.type}>
                        <td className={tableCellClasses}>{row.type}</td>
                        <td className={tableCellClasses}>{row.purpose}</td>
                        <td className={tableCellClasses}>{row.canDisable}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </section>

          <section className={sectionClasses}>
            <h2 className={sectionTitleClasses}>3. Managing Cookies</h2>
            <p className={paragraphClasses}>
              You can control or delete cookies through your browser settings.
              Disabling essential cookies may affect your ability to sign in or
              use certain features of the Platform, such as the cart.
            </p>
          </section>

          <section className={sectionClasses}>
            <h2 className={sectionTitleClasses}>4. Changes to This Policy</h2>
            <p className={paragraphClasses}>
              We may update this Cookie Policy from time to time. Material
              changes will be indicated by updating the &quot;Last updated&quot; date
              above.
            </p>
          </section>

          <section className={sectionClasses}>
            <h2 className={sectionTitleClasses}>5. Contact Us</h2>
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