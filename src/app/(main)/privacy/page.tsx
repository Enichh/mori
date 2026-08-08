import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Privacy Policy | Mori",
  description:
    "Mori privacy policy — how we handle your data, third-party services, cookies, and your rights under RA 10173 and GDPR.",
};

const PROVIDERS = [
  { name: "SuperEmbed", url: "https://multiembed.mov" },
  { name: "EmbedAPI", url: "https://embed-api.stream" },
  { name: "Vidking", url: "https://www.vidking.net" },
  { name: "2Embed", url: "https://www.2embed.cc" },
  { name: "VidSrc", url: "https://vidsrc.mov" },
  { name: "VidLink", url: "https://vidlink.pro" },
  { name: "StreamVault", url: "https://streamvaultsrc.click" },
  { name: "YapGrid", url: "https://yapgrid.com" },
  { name: "VidSrc", url: "https://vidsrc.to" },
];

export default function PrivacyPage() {
  return (
    <div className="container-cine py-10 max-w-3xl">
      <h1 className="text-2xl md:text-3xl font-heading font-bold text-foreground mb-2">
        Privacy Policy
      </h1>
      <p className="text-xs text-muted-foreground mb-8">
        Last Updated: {new Date().toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })}
      </p>

      <section className="space-y-6 text-sm text-muted-foreground leading-relaxed">
        <div>
          <h2 className="text-base font-heading font-bold text-foreground mb-2">1. Overview</h2>
          <p>
            Mori (morimovie.netlify.app) is a free movie and TV show discovery platform. We do not create user accounts, collect email addresses, or require registration. This policy explains what data is collected, how it is used, and your rights.
          </p>
        </div>

        <div>
          <h2 className="text-base font-heading font-bold text-foreground mb-2">2. Information We Collect</h2>
          <p className="mb-2"><strong className="text-foreground">Automatically:</strong> IP address, browser type, device type, referring pages, and country-level location (via Netlify hosting and ad networks).</p>
          <p className="mb-2"><strong className="text-foreground">Locally (localStorage):</strong> Your watch history is stored exclusively in your browser. It never leaves your device and we cannot access it.</p>
          <p><strong className="text-foreground">We do NOT collect:</strong> Names, email addresses, passwords, payment information, or social media profiles.</p>
        </div>

        <div>
          <h2 className="text-base font-heading font-bold text-foreground mb-2">3. Cookies & Tracking</h2>
          <p className="mb-2">Mori does not set first-party cookies. However, third-party services we use may set cookies:</p>
          <ul className="list-disc pl-5 space-y-1">
            <li><strong className="text-foreground">Adsterra</strong> — advertising cookies for ad delivery, frequency capping, and measurement.</li>
            <li><strong className="text-foreground">Video embed providers</strong> — may set cookies for playback preferences and bandwidth estimation.</li>
            <li><strong className="text-foreground">Google Search Console</strong> — verification tag only; aggregate traffic analytics.</li>
          </ul>
          <p className="mt-2">
            You can disable cookies in browser settings. Opt out of interest-based ads at{" "}
            <a href="https://www.aboutads.info/choices/" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">aboutads.info</a> or{" "}
            <a href="https://www.networkadvertising.org/" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">networkadvertising.org</a>.
          </p>
        </div>

        <div>
          <h2 className="text-base font-heading font-bold text-foreground mb-2">4. Third-Party Advertising (Adsterra)</h2>
          <p className="mb-2">
            We partner with Adsterra to display advertisements (social bar and native banners). Adsterra may use cookies, pixel tags, and device identifiers for behavioral advertising, measurement, and fraud prevention.
          </p>
          <p>
            See:{" "}
            <a href="https://adsterra.com/privacy-policy-managed/" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">Adsterra Privacy Policy</a> and{" "}
            <a href="https://adsterra.com/cookies/" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">Adsterra Cookies Policy</a>.
          </p>
        </div>

        <div>
          <h2 className="text-base font-heading font-bold text-foreground mb-2">5. Video Embed Providers</h2>
          <p className="mb-2">Video content is streamed via third-party embed players. Each provider may collect data independently:</p>
          <ul className="list-disc pl-5 space-y-0.5">
            {PROVIDERS.map((p) => (
              <li key={p.name}>
                <a href={p.url} target="_blank" rel="noopener noreferrer" className="text-primary/80 hover:text-primary hover:underline">{p.name}</a>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h2 className="text-base font-heading font-bold text-foreground mb-2">6. TMDB API</h2>
          <p>
            Movie and TV metadata (titles, posters, descriptions, cast) is provided by The Movie Database (TMDB). Mori is not endorsed or certified by TMDB.{" "}
            <a href="https://www.themoviedb.org/privacy-policy" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">TMDB Privacy Policy</a>.
          </p>
        </div>

        <div>
          <h2 className="text-base font-heading font-bold text-foreground mb-2">7. Local Storage (Watch History)</h2>
          <p>
            Your watch history is stored only in your browser's localStorage. It never leaves your device. We cannot access, view, recover, or share it. Clear your browser data to delete it.
          </p>
        </div>

        <div>
          <h2 className="text-base font-heading font-bold text-foreground mb-2">8. Data Sharing</h2>
          <p>We do not sell personal information. Data may be processed by: Adsterra (ads), Google (analytics), Netlify (hosting), TMDB (metadata), and video embed providers (content delivery).</p>
        </div>

        <div>
          <h2 className="text-base font-heading font-bold text-foreground mb-2">9. Your Rights</h2>
          <p className="mb-2"><strong className="text-foreground">Philippines (RA 10173):</strong> Right to be informed, access, correct, delete, and object. Contact the National Privacy Commission at{" "}
            <a href="https://privacy.gov.ph" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">privacy.gov.ph</a>.
          </p>
          <p className="mb-2"><strong className="text-foreground">EU/EEA (GDPR):</strong> Right to access, rectify, erase, restrict, port, and object. Contact your local Data Protection Authority.</p>
          <p><strong className="text-foreground">California (CCPA):</strong> Right to know, delete, and opt out of sale/sharing.</p>
          <p className="mt-2">
            To exercise your rights, contact:{" "}
            <a href="mailto:privacy@morimovie.netlify.app" className="text-primary hover:underline">privacy@morimovie.netlify.app</a>
          </p>
        </div>

        <div>
          <h2 className="text-base font-heading font-bold text-foreground mb-2">10. Children's Privacy</h2>
          <p>Mori is not directed at children under 13 (COPPA) or under 18 (RA 10173). We do not knowingly collect data from minors.</p>
        </div>

        <div>
          <h2 className="text-base font-heading font-bold text-foreground mb-2">11. Changes</h2>
          <p>We may update this policy. Continued use of the site constitutes acceptance of the current version.</p>
        </div>
      </section>
    </div>
  );
}
