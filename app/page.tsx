import Link from 'next/link';
import { loadHistoricalDataset } from '../src/web/catalog.ts';
import { EvidenceNotice } from '../components/site-shell.tsx';
import { ServiceCard } from '../components/service-card.tsx';

export default function Page() {
  const historical = loadHistoricalDataset();

  return (
    <>
      <section className="hero-shell">
        <div className="hero-copy">
          <p className="eyebrow accent">PRIVACY RIGHTS · INDIA</p>
          <h1>Make the route <em>visible.</em></h1>
          <p className="hero-lede">Nyaya helps you find the right privacy channel, prepare a clear access request, and keep the final decision in your hands.</p>
          <div className="hero-actions">
            <Link className="button button-primary" href="/prepare">Prepare a request <span aria-hidden="true">↗</span></Link>
            <a className="button button-quiet" href="#index">Explore the Index <span aria-hidden="true">↓</span></a>
          </div>
        </div>
        <div className="hero-figure" aria-label="Illustration of an evidence trail">
          <div className="figure-grid"></div>
          <div className="figure-line line-one"></div>
          <div className="figure-line line-two"></div>
          <div className="figure-node node-one">01</div>
          <div className="figure-node node-two">02</div>
          <div className="figure-node node-three">03</div>
          <div className="figure-caption">TRACE / 001<br /><strong>Discover → prepare → review</strong></div>
        </div>
      </section>

      <section className="signal-strip" aria-label="Nyaya principles">
        <div><span className="signal-number">01</span><strong>Find the route</strong><span>Start from a service&apos;s public footprint.</span></div>
        <div><span className="signal-number">02</span><strong>Keep the evidence</strong><span>Separate observation from assumption.</span></div>
        <div><span className="signal-number">03</span><strong>Stay in control</strong><span>Nyaya stops before submission.</span></div>
      </section>

      <section className="section-shell" id="index">
        <div className="section-heading">
          <div>
            <p className="eyebrow accent">THE PUBLIC INDEX</p>
            <h2>What can be found <em>and what cannot.</em></h2>
            <Link className="text-link" href="/methodology">Read the methodology <span aria-hidden="true">→</span></Link>
          </div>
          <div className="heading-aside">
            <p>Routes below are historical observations from an earlier project, not current Nyaya findings.</p>
          </div>
        </div>
        <EvidenceNotice />
        <div className="index-toolbar">
          <span>{historical.targetsTested} historical records</span>
          <span>Source run: {historical.runAtUtc.slice(0, 10)}</span>
          <span>Overall scores unavailable</span>
        </div>
        <div className="service-grid">
          {historical.services.map((service) => (
            <ServiceCard key={service.id} service={service} />
          ))}
        </div>
      </section>

      <section className="section-shell" id="how-it-works">
        <div className="section-heading">
          <div>
            <p className="eyebrow accent">HOW NYAYA WORKS</p>
            <h2>Evidence guides <em>your</em> decisions.</h2>
          </div>
          <div className="heading-aside">
            <p>Nyaya prepares drafts and stops before submission. The route you follow is always your choice.</p>
          </div>
        </div>
        <div className="feature-grid">
          <FeatureItem
            title="Service discovery"
            description="Start from a service's public footprint and follow a reproducible path to its privacy-request route."
          />
          <FeatureItem
            title="Evidence transparency"
            description="Every observation is tied to sources, capture times, and methodology. We withhold scores when evidence is insufficient."
          />
          <FeatureItem
            title="Prepared, not submitted"
            description="Nyaya prepares and shows you a draft. You review, edit, and submit directly on the destination site."
          />
          <FeatureItem
            title="Honest about uncertainty"
            description="Historical input is labelled unverified. Synthetic data is marked as such. No route is presented as confirmed unless verified."
          />
        </div>
      </section>
    </>
  );
}

function FeatureItem({ title, description }: { title: string; description: string }) {
  return (
    <div className="feature-item">
      <strong>{title}</strong>
      <p>{description}</p>
    </div>
  );
}