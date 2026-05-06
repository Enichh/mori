import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "DMCA & Copyright Policy | Mori",
  description:
    "Mori does not host any video files. DMCA safe harbor policy, takedown procedure, and copyright information.",
};

export default function DMCAPage() {
  return (
    <div className="container-cine py-10 max-w-3xl">
      <h1 className="text-2xl md:text-3xl font-heading font-bold text-foreground mb-2">
        DMCA & Copyright Policy
      </h1>
      <p className="text-xs text-muted-foreground mb-8">
        Last Updated: {new Date().toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })}
      </p>

      <section className="space-y-6 text-sm text-muted-foreground leading-relaxed">
        <div>
          <h2 className="text-base font-heading font-bold text-foreground mb-2">1. No Content Hosted</h2>
          <p>
            <strong className="text-foreground">Mori does not host, store, upload, or distribute any video files, movies, TV shows, or copyrighted media on its servers.</strong> All video content is provided via third-party embed players and is hosted entirely on third-party servers over which Mori has no control. Mori functions as an information location tool — it indexes and organizes publicly available metadata (titles, descriptions, posters) for discovery, similar to a search engine.
          </p>
        </div>

        <div>
          <h2 className="text-base font-heading font-bold text-foreground mb-2">2. Third-Party Content</h2>
          <ul className="list-disc pl-5 space-y-1">
            <li>Video streams are embedded from third-party providers and played directly from their servers via iframe technology.</li>
            <li>Mori does not transmit, cache, or modify any video data.</li>
            <li>Movie and TV metadata (titles, posters, synopses) is provided by The Movie Database (TMDB) API.</li>
            <li>All trademarks and copyrights belong to their respective owners.</li>
          </ul>
        </div>

        <div>
          <h2 className="text-base font-heading font-bold text-foreground mb-2">3. DMCA Safe Harbor</h2>
          <p>
            Mori operates in compliance with the Digital Millennium Copyright Act (DMCA) and claims safe harbor protection under Section 512(d) for information location tools. We have no actual knowledge of infringing material on third-party servers, do not receive financial benefit directly attributable to infringing activity, and respond expeditiously to valid takedown notices.
          </p>
        </div>

        <div>
          <h2 className="text-base font-heading font-bold text-foreground mb-2">4. Filing a DMCA Takedown Notice</h2>
          <p className="mb-2">If you are a copyright owner (or authorized agent) and believe your work has been infringed through a third-party embed referenced on Mori, send a written notice containing:</p>
          <ol className="list-decimal pl-5 space-y-1">
            <li>Identification of the copyrighted work you claim has been infringed.</li>
            <li>The specific URL(s) on morimovie.netlify.app where the embed appears.</li>
            <li>Your full legal name, company name, mailing address, telephone number, and email address.</li>
            <li>A statement that you have a good faith belief that use of the material is not authorized by the copyright owner, its agent, or the law.</li>
            <li>A statement, under penalty of perjury, that the information in the notice is accurate and that you are authorized to act on behalf of the copyright owner.</li>
            <li>Your physical or electronic signature.</li>
          </ol>
          <p className="mt-2">
            Send notices to:{" "}
            <a href="mailto:dmca@morimovie.netlify.app" className="text-primary hover:underline">
              dmca@morimovie.netlify.app
            </a>
          </p>
        </div>

        <div>
          <h2 className="text-base font-heading font-bold text-foreground mb-2">5. Counter-Notification</h2>
          <p>
            If you believe content was removed by mistake, you may submit a counter-notification with your name, address, phone, email, identification of the removed material, a statement under penalty of perjury, and consent to jurisdiction.
          </p>
        </div>

        <div>
          <h2 className="text-base font-heading font-bold text-foreground mb-2">6. Repeat Infringer Policy</h2>
          <p>
            In accordance with the DMCA, Mori will terminate access for users determined to be repeat infringers.
          </p>
        </div>

        <div>
          <h2 className="text-base font-heading font-bold text-foreground mb-2">7. Philippine Law (RA 8293)</h2>
          <p>
            Mori respects the Intellectual Property Code of the Philippines (RA 8293, as amended by RA 10372). We take all allegations of infringement seriously and will cooperate with rights holders and the Intellectual Property Office of the Philippines (IPOPHL).
          </p>
        </div>

        <div>
          <h2 className="text-base font-heading font-bold text-foreground mb-2">8. Disclaimer</h2>
          <p>
            Mori is an independent service not affiliated with any movie studio, television network, or streaming platform. We do not condone copyright infringement. If you enjoy content discovered through Mori, please support the creators through legal means. Use{" "}
            <a href="https://ublockorigin.com/" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
              uBlock Origin
            </a>{" "}
            to block third-party advertisements.
          </p>
        </div>
      </section>
    </div>
  );
}
