import Link from "next/link";

export const metadata = {
  title: "Terms and Conditions | Kora Marketplace",
  description: "Terms and Conditions governing the use of Kora Marketplace.",
};

export default function TermsPage() {
  const pageWrapperClasses = "min-h-screen bg-[#fff7ed]";
  const headerClasses = "bg-[#c2410c] text-white py-10 px-6";
  const headerInnerClasses = "max-w-4xl mx-auto";
  const headerTitleClasses = "text-2xl md:text-3xl font-bold mb-2";
  const headerSubtitleClasses = "text-[#ffedd5] text-xs";
  const contentWrapperClasses = "max-w-4xl mx-auto px-6 py-8";
  const cardClasses = "bg-white border border-[#fed7aa] rounded-lg shadow-sm p-5 md:p-8";
  const tocWrapperClasses = "bg-[#fff7ed] border border-[#fed7aa] rounded-lg p-5 mb-8";
  const tocTitleClasses = "text-base font-semibold text-[#c2410c] mb-3";
  const tocListClasses = "space-y-1 text-sm";
  const tocLinkClasses = "text-[#ea580c] hover:text-[#c2410c] hover:underline";
  const sectionClasses = "mb-6 scroll-mt-24";
  const sectionTitleClasses = "text-lg font-semibold text-[#c2410c] mb-3";
  const paragraphClasses = "text-gray-700 leading-relaxed mb-3";
  const listClasses = "list-disc pl-6 space-y-2 text-gray-700 mb-3";
  const lastUpdatedClasses = "text-sm text-gray-500 mb-8";
  const contactBoxClasses = "bg-[#fff7ed] border border-[#fed7aa] rounded-lg p-5 mt-4";
  const backLinkClasses = "inline-block mt-6 text-[#ea580c] hover:text-[#c2410c] hover:underline text-sm";

  const sections = [
    { id: "acceptance", title: "1. Acceptance of Terms" },
    { id: "eligibility", title: "2. Eligibility" },
    { id: "nature-of-platform", title: "3. Nature of the Platform" },
    { id: "accounts", title: "4. Account Registration and Security" },
    { id: "seller-obligations", title: "5. Seller Obligations" },
    { id: "buyer-obligations", title: "6. Buyer Obligations" },
    { id: "listings", title: "7. Product Listings and Content" },
    { id: "fees", title: "8. Fees and Payments" },
    { id: "orders-escrow", title: "9. Orders, Escrow, and Delivery" },
    { id: "prohibited", title: "10. Prohibited Conduct and Items" },
    { id: "intellectual-property", title: "11. Intellectual Property" },
    { id: "disclaimers", title: "12. Disclaimers" },
    { id: "liability", title: "13. Limitation of Liability" },
    { id: "indemnification", title: "14. Indemnification" },
    { id: "termination", title: "15. Suspension and Termination" },
    { id: "disputes", title: "16. Dispute Resolution and Governing Law" },
    { id: "changes", title: "17. Changes to These Terms" },
    { id: "contact", title: "18. Contact Us" },
  ];

  return (
    <div className={pageWrapperClasses}>
      <header className={headerClasses}>
        <div className={headerInnerClasses}>
          <h1 className={headerTitleClasses}>Terms and Conditions</h1>
          <p className={headerSubtitleClasses}>Kora Marketplace</p>
        </div>
      </header>

      <div className={contentWrapperClasses}>
        <div className={cardClasses}>
          <p className={lastUpdatedClasses}>Last updated: July 22, 2026</p>

          <p className={paragraphClasses}>
            These Terms and Conditions (&quot;Terms&quot;) govern access to and use of the
            Kora Marketplace website, mobile applications, and related services
            (collectively, the &quot;Platform&quot;), operated by Kora Marketplace
            (&quot;Kora,&quot; &quot;we,&quot; &quot;us,&quot; or &quot;our&quot;), a business registered in Nigeria.
            Kora Marketplace&apos;s business name has been reserved with the Corporate
            Affairs Commission (CAC), and its registration certificate is currently
            being processed. References to Kora as a registered Nigerian business
            in these Terms will be updated with the relevant registration number
            once the certificate is issued.
          </p>

          <div className={tocWrapperClasses}>
            <p className={tocTitleClasses}>Contents</p>
            <ul className={tocListClasses}>
              {sections.map(function renderTocItem(section) {
                return (
                  <li key={section.id}>
                    <a href={"#" + section.id} className={tocLinkClasses}>
                      {section.title}
                    </a>
                  </li>
                );
              })}
            </ul>
          </div>

          <section id="acceptance" className={sectionClasses}>
            <h2 className={sectionTitleClasses}>1. Acceptance of Terms</h2>
            <p className={paragraphClasses}>
              By creating an account, accessing, or using the Platform in any way,
              you agree to be bound by these Terms and by our Privacy Policy,
              Cookie Policy, Refund and Dispute Policy, and Acceptable Use Policy,
              each of which is incorporated into these Terms by reference. If you
              do not agree to these Terms, you must not access or use the
              Platform.
            </p>
            <p className={paragraphClasses}>
              If you are using the Platform on behalf of a company or other legal
              entity, you represent that you have the authority to bind that
              entity to these Terms, in which case &quot;you&quot; refers to that entity.
            </p>
          </section>

          <section id="eligibility" className={sectionClasses}>
            <h2 className={sectionTitleClasses}>2. Eligibility</h2>
            <p className={paragraphClasses}>To use the Platform, you must:</p>
            <ul className={listClasses}>
              <li>Be at least 18 years of age or the age of legal majority in your jurisdiction.</li>
              <li>Have the legal capacity to enter into binding contracts.</li>
              <li>Not be barred from using the Platform under applicable law.</li>
              <li>
                If registering as a business, hold or be in the process of
                obtaining valid business registration in your country of
                operation.
              </li>
            </ul>
          </section>

          <section id="nature-of-platform" className={sectionClasses}>
            <h2 className={sectionTitleClasses}>3. Nature of the Platform</h2>
            <p className={paragraphClasses}>
              Kora Marketplace is a business-to-business (B2B) marketplace that
              connects buyers and sellers of goods across Nigeria and other
              African countries. Kora provides the technology and tools that
              allow suppliers, manufacturers, and buyers to discover one another,
              communicate, and transact.
            </p>
            <p className={paragraphClasses}>
              Kora is not a party to any contract of sale formed between buyers
              and sellers on the Platform. Kora does not manufacture, own, sell,
              resell, import, export, or take title to any goods listed on the
              Platform, except where Kora expressly identifies itself as the
              seller of record for a specific listing. Kora does not guarantee
              the quality, safety, legality, or accuracy of any listing, nor the
              ability of any seller to sell or any buyer to buy.
            </p>
          </section>

          <section id="accounts" className={sectionClasses}>
            <h2 className={sectionTitleClasses}>4. Account Registration and Security</h2>
            <p className={paragraphClasses}>
              You must provide accurate, current, and complete information when
              creating an account and must keep this information up to date. You
              are responsible for maintaining the confidentiality of your login
              credentials and for all activity that occurs under your account.
              You must notify us immediately at the contact details below if you
              suspect unauthorized use of your account.
            </p>
          </section>

          <section id="seller-obligations" className={sectionClasses}>
            <h2 className={sectionTitleClasses}>5. Seller Obligations</h2>
            <p className={paragraphClasses}>Sellers on the Platform agree to:</p>
            <ul className={listClasses}>
              <li>Provide accurate descriptions, pricing, minimum order quantities, and images for all listed products.</li>
              <li>Hold all licenses, permits, and regulatory approvals required to sell the listed goods, including any applicable NAFDAC, SON, or other regulatory certifications.</li>
              <li>Honor confirmed orders in the quantities, price, and timeframe agreed with the buyer.</li>
              <li>Not list counterfeit, stolen, prohibited, or illegal goods.</li>
              <li>Respond to buyer inquiries and disputes in good faith and within a reasonable time.</li>
            </ul>
          </section>

          <section id="buyer-obligations" className={sectionClasses}>
            <h2 className={sectionTitleClasses}>6. Buyer Obligations</h2>
            <p className={paragraphClasses}>Buyers on the Platform agree to:</p>
            <ul className={listClasses}>
              <li>Provide accurate business and shipping information.</li>
              <li>Pay for confirmed orders in accordance with the agreed terms.</li>
              <li>Use products purchased through the Platform for lawful purposes only.</li>
              <li>Raise any concerns about an order through the Platform&apos;s messaging or dispute channels before escalating elsewhere.</li>
            </ul>
          </section>

          <section id="listings" className={sectionClasses}>
            <h2 className={sectionTitleClasses}>7. Product Listings and Content</h2>
            <p className={paragraphClasses}>
              Sellers are solely responsible for the content of their listings,
              including product descriptions, images, pricing, and
              certifications referenced. Kora reserves the right, but not the
              obligation, to review, edit, remove, or refuse any listing that it
              believes violates these Terms, the Acceptable Use Policy, or
              applicable law.
            </p>
          </section>

          <section id="fees" className={sectionClasses}>
            <h2 className={sectionTitleClasses}>8. Fees and Payments</h2>
            <p className={paragraphClasses}>
              Kora may charge listing fees, transaction fees, subscription fees,
              or other charges for use of certain features of the Platform.
              Applicable fees will be disclosed to you before you incur them.
              All prices displayed on the Platform are in Nigerian Naira (N)
              unless otherwise stated, and are exclusive of any applicable taxes
              unless stated otherwise.
            </p>
          </section>

          <section id="orders-escrow" className={sectionClasses}>
            <h2 className={sectionTitleClasses}>9. Orders, Escrow, and Delivery</h2>
            <p className={paragraphClasses}>
              Where the Platform offers an escrow or protected-payment option,
              funds paid by a buyer may be held by Kora or a licensed third-party
              payment partner until the conditions for release agreed between
              the parties are met, as further described in our Refund and
              Dispute Policy. Kora is not responsible for the physical shipment,
              customs clearance, or delivery of goods unless expressly stated
              for a particular order.
            </p>
          </section>

          <section id="prohibited" className={sectionClasses}>
            <h2 className={sectionTitleClasses}>10. Prohibited Conduct and Items</h2>
            <p className={paragraphClasses}>
              Use of the Platform to list, sell, or purchase illegal goods,
              counterfeit goods, stolen goods, weapons, controlled substances,
              or any item prohibited under Nigerian or other applicable African
              national law is strictly forbidden. Full detail is set out in our
              Acceptable Use Policy, which forms part of these Terms.
            </p>
          </section>

          <section id="intellectual-property" className={sectionClasses}>
            <h2 className={sectionTitleClasses}>11. Intellectual Property</h2>
            <p className={paragraphClasses}>
              The Platform, including its design, logos, software, and
              underlying technology, is owned by Kora Marketplace and protected
              by applicable intellectual property laws. You retain ownership of
              content you upload, such as product images and descriptions, but
              grant Kora a non-exclusive, worldwide, royalty-free license to
              host, display, and distribute that content for the purpose of
              operating and promoting the Platform.
            </p>
          </section>

          <section id="disclaimers" className={sectionClasses}>
            <h2 className={sectionTitleClasses}>12. Disclaimers</h2>
            <p className={paragraphClasses}>
              The Platform is provided on an &quot;as is&quot; and &quot;as available&quot; basis.
              To the fullest extent permitted by law, Kora disclaims all
              warranties, express or implied, including warranties of
              merchantability, fitness for a particular purpose, and
              non-infringement, and does not warrant that the Platform will be
              uninterrupted, secure, or error-free.
            </p>
          </section>

          <section id="liability" className={sectionClasses}>
            <h2 className={sectionTitleClasses}>13. Limitation of Liability</h2>
            <p className={paragraphClasses}>
              To the fullest extent permitted by law, Kora and its officers,
              employees, and agents will not be liable for any indirect,
              incidental, special, consequential, or punitive damages, or any
              loss of profits, revenue, data, or goodwill, arising from your use
              of the Platform or any transaction between buyers and sellers.
              Kora&apos;s total liability for any claim arising out of these Terms
              will not exceed the fees paid by you to Kora in the six months
              preceding the event giving rise to the claim.
            </p>
          </section>

          <section id="indemnification" className={sectionClasses}>
            <h2 className={sectionTitleClasses}>14. Indemnification</h2>
            <p className={paragraphClasses}>
              You agree to indemnify and hold harmless Kora Marketplace and its
              officers, employees, and agents from any claims, damages,
              liabilities, and expenses, including reasonable legal fees,
              arising out of your breach of these Terms, or your violation of
              any applicable law or third-party right.
            </p>
          </section>

          <section id="termination" className={sectionClasses}>
            <h2 className={sectionTitleClasses}>15. Suspension and Termination</h2>
            <p className={paragraphClasses}>
              Kora may suspend or terminate your account, in whole or in part,
              at any time if we reasonably believe you have violated these
              Terms, the Acceptable Use Policy, or applicable law, or if
              required to do so by law. You may close your account at any time
              by contacting us. Provisions of these Terms that by their nature
              should survive termination will continue to apply.
            </p>
          </section>

          <section id="disputes" className={sectionClasses}>
            <h2 className={sectionTitleClasses}>16. Dispute Resolution and Governing Law</h2>
            <p className={paragraphClasses}>
              These Terms are governed by the laws of the Federal Republic of
              Nigeria. Disputes between Kora and a user arising from these Terms
              will first be addressed through good-faith negotiation. If
              unresolved within thirty (30) days, the dispute will be referred
              to arbitration in Nigeria in accordance with the Arbitration and
              Mediation Act, or to the competent courts of Nigeria, at Kora&apos;s
              election. Disputes between buyers and sellers regarding a specific
              transaction are addressed under our Refund and Dispute Policy.
            </p>
          </section>

          <section id="changes" className={sectionClasses}>
            <h2 className={sectionTitleClasses}>17. Changes to These Terms</h2>
            <p className={paragraphClasses}>
              Kora may update these Terms from time to time. Where changes are
              material, we will provide reasonable notice, such as by posting a
              notice on the Platform or updating the &quot;Last updated&quot; date above.
              Continued use of the Platform after changes take effect
              constitutes acceptance of the revised Terms.
            </p>
          </section>

          <section id="contact" className={sectionClasses}>
            <h2 className={sectionTitleClasses}>18. Contact Us</h2>
            <p className={paragraphClasses}>
              If you have questions about these Terms, please contact us:
            </p>
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
