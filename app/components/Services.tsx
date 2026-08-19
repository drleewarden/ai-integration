import { Brain, Zap, Target, Users, Globe2, ArrowRight } from "lucide-react";
import type { ReactNode } from "react";

type Service = {
  icon: ReactNode;
  number: string;
  title: string;
  description: string;
};

const SERVICES: Service[] = [
  {
    icon: <Brain size={22} strokeWidth={1.4} />,
    number: "01",
    title: "AI Strategy & Roadmap",
    description:
      "We scope every engagement around a specific business problem. That means defining what success looks like before we start -- not after we've shipped.",
  },
  {
    icon: <Zap size={22} strokeWidth={1.4} />,
    number: "02",
    title: "AI Agents & Workflow Automation",
    description:
      "Agents that read documents, make decisions within defined rules, update business systems, and send exceptions to your team for approval.",
  },
  {
    icon: <Target size={22} strokeWidth={1.4} />,
    number: "03",
    title: "Implementation & Integration",
    description:
      "Seamless integration into your existing workflows. We measure success by hours recovered and decisions improved -- not features shipped.",
  },
  {
    icon: <Users size={22} strokeWidth={1.4} />,
    number: "04",
    title: "Team Training & Support",
    description:
      "Your team needs to own the outcome. We build capability alongside the system so the results compound after we leave.",
  },
  {
    icon: <Globe2 size={22} strokeWidth={1.4} />,
    number: "05",
    title: "Websites",
    description:
      "Fast, accessible websites built around a clear business goal. We bring strategy, design, and development together to create a site that earns attention and drives action.",
  },
];

export default function Services() {
  return (
    <section
      id="services"
      className="section"
      style={{ background: "var(--off-white)" }}
    >
      <div className="container">
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "minmax(0, 1.2fr) minmax(0, 1fr)",
            gap: "clamp(2rem, 5vw, 5rem)",
            alignItems: "end",
            paddingBottom: "clamp(2rem, 4vw, 3.5rem)",
            borderBottom: "1px solid var(--rule)",
          }}
        >
          <div>
            <span className="eyebrow" style={{ marginBottom: "1.25rem" }}>
              02 -- Services
            </span>
            <h2
              className="h-section"
              style={{ color: "var(--midnight-ink)", marginTop: "1rem" }}
            >
              What we
              <br />
              <em className="gold">actually</em> build
            </h2>
          </div>
          <p
            className="body-copy"
            style={{ maxWidth: "44ch", justifySelf: "end" }}
          >
            Custom AI agents, workflow automation, and integrations scoped to
            your business context. We don&apos;t sell tools. We build systems that
            run inside your existing stack.
          </p>
        </div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
          }}
        >
          {SERVICES.map((service, idx) => (
            <ServiceCard key={service.number} service={service} index={idx} />
          ))}
        </div>
      </div>
    </section>
  );
}

function ServiceCard({ service, index }: { service: Service; index: number }) {
  return (
    <article
      id={service.title === "Websites" ? "websites" : undefined}
      className="service-card"
      style={{
        position: "relative",
        padding: "clamp(2rem, 3vw, 3rem)",
        borderRight: "1px solid var(--rule)",
        borderBottom: "1px solid var(--rule)",
        cursor: "default",
        animation: `fadeInUp 0.7s var(--ease-out) ${index * 0.08}s both`,
      }}
    >
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-start",
          marginBottom: "2rem",
        }}
      >
        <div
          style={{
            width: 48,
            height: 48,
            background: "var(--midnight-ink)",
            color: "var(--liquid-gold)",
            display: "inline-flex",
            alignItems: "center",
            justifyContent: "center",
          }}
          aria-hidden="true"
        >
          {service.icon}
        </div>
        <span
          style={{
            fontFamily: "var(--font-mono)",
            fontSize: "0.62rem",
            letterSpacing: "0.14em",
            color: "var(--slate-light)",
          }}
        >
          {service.number}
        </span>
      </div>

      <h3
        style={{
          fontFamily: "var(--font-display)",
          fontSize: "clamp(1.5rem, 2vw, 1.85rem)",
          fontWeight: 400,
          lineHeight: 1.15,
          color: "var(--midnight-ink)",
          margin: "0 0 0.85rem",
        }}
      >
        {service.title}
      </h3>
      <p
        style={{
          fontFamily: "var(--font-sans)",
          fontSize: "0.88rem",
          lineHeight: 1.75,
          color: "var(--slate-mid)",
          margin: "0 0 1.75rem",
          maxWidth: "40ch",
        }}
      >
        {service.description}
      </p>
      <span
        className="svc-arrow"
        style={{
          fontFamily: "var(--font-mono)",
          fontSize: "0.6rem",
          letterSpacing: "0.16em",
          textTransform: "uppercase",
          color: "var(--liquid-gold)",
          display: "inline-flex",
          alignItems: "center",
          gap: "0.55rem",
          transition: "transform var(--dur-fast) var(--ease-out)",
          transform: "translateX(0)",
        }}
      >
        Discuss this <ArrowRight size={12} />
      </span>
    </article>
  );
}
