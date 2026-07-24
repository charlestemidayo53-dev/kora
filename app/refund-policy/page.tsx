import Link from "next/link";

export const metadata = {
  title: "Refund and Dispute Policy | Kora Marketplace",
  description: "How refunds and order disputes are handled on Kora Marketplace.",
};

export default function RefundPolicyPage() {
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
          <h1 className={headerTitleClasses}>Refund and Dispute Policy</h1>
          <p className={headerSubtitleClasses}>Kora Marketplace</p>
        </div>
      </header>

      <div className={contentWrapperClasses}>
        <div className={cardClasses}>
          <p className={lastUpdatedClasses}>Last updated: July 22, 2026</p>

          <p className={paragraphClasses}>
            This policy explains how order disputes, refunds, and cancellations
            are handled between buyers and sellers on Kora Marketplace.
          </p>

          <section className={sectionClasses}>
            <h2 className={sectionTitleClasses}>1. Order Confirmation</h2>
            <p className={paragraphClasses}>
              An order is considered confirmed once a buyer and seller agree on
              price, quantity, and delivery terms through the Platform. Both
              parties are expected to honor confirmed orders in good faith.
            </p>
          </section>

          <section className={sectionClasses}>
            <h2 className={sectionTitleClasses}>2. Escrow Protection</h2>
            <p className={paragraphClasses}>
              Where an order uses Kora&apos;s escrow option, the buyer&apos;s payment is
              held until the buyer confirms satisfactory receipt of goods, or
              until an agreed inspection period has passed. Funds are released
              to the seller once these conditions are met.
            </p>
          </section>

          <section className={sectionClasses}>
            <h2 className={sectionTitleClasses}>3. Grounds for a Refund</h2>
            <p className={paragraphClasses}>A buyer may request a refund where:</p>
            <ul className={listClasses}>
              <li>Goods received are materially different from the listing description.</li>
              <li>Goods arrive damaged or in quantities less than ordered.</li>
              <li>The seller fails to deliver within the agreed timeframe.</li>
              <li>The order is cancelled by mutual agreement before dispatch.</li>
            </ul>
          </section>

          <section className={sectionClasses}>
            <h2 className={sectionTitleClasses}>4. Filing a Dispute</h2>
            <p className={paragraphClasses}>
              Disputes must be raised through the Platform&apos;s order or
              messaging tools within seven (7) days of delivery, or of the
              expected delivery date if goods were not received. Kora will
              review evidence submitted by both parties, which may include
              photos, messages, and order records.
            </p>
          </section>

          <section className={sectionClasses}>
            <h2 className={sectionTitleClasses}>5. Resolution</h2>
            <p className={paragraphClasses}>
              Kora will attempt to mediate a resolution between the buyer and
              seller. Where escrow applies, Kora may release funds to the
              seller, refund the buyer, or apply a partial refund, based on the
              evidence provided. Kora&apos;s decision on the release of escrowed
              funds is final.
            </p>
          </section>

          <section className={sectionClasses}>
            <h2 className={sectionTitleClasses}>6. Non-Refundable Situations</h2>
            <ul className={listClasses}>
              <li>Change of mind after goods have been dispatched and match the listing.</li>
              <li>Orders placed outside the Platform&apos;s messaging, cart, or order system.</li>
              <li>Delays caused by incorrect delivery information provided by the buyer.</li>
            </ul>
          </section>

          <section className={sectionClasses}>
            <h2 className={sectionTitleClasses}>7. Contact Us</h2>
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