/** One row of three widget cards — used twice for seamless infinite scroll */
export default function WidgetRail({ scrollToSection, duplicate = false }) {
  return (
    <div
      className="home-thq-sidebar-track"
      aria-hidden={duplicate ? true : undefined}
    >
      <div className="home-thq-widget-card home-thq-widget-card-catalogue">
        <img
          src="/rectangle12028-igaa.svg"
          alt=""
          className="home-thq-widget-card-bg"
        />
        <img
          src="/rectangle62028-1787-500w.png"
          alt=""
          className="home-thq-widget-card-photo"
        />
        <a
          id={duplicate ? undefined : 'catalogue'}
          href="#shop"
          className="home-thq-widget-link home-thq-widget-link-catalogue"
          aria-label="Go to catalogue section"
          tabIndex={duplicate ? -1 : undefined}
          onClick={(event) => scrollToSection(event, '#shop')}
        >
          <span className="home-thq-text-elm33">CATALOGUE</span>
        </a>
      </div>
      <div className="home-thq-widget-card home-thq-widget-card-impact">
        <img
          src="/rectangle22028-whu-600w.png"
          alt=""
          className="home-thq-widget-card-bg"
        />
        <img
          src="/rectangle42028-uqyl-300h.png"
          alt=""
          className="home-thq-widget-card-photo"
        />
        <a
          id={duplicate ? undefined : 'impact'}
          href="#problem"
          className="home-thq-widget-link home-thq-widget-link-impact"
          aria-label="Go to our impact section"
          tabIndex={duplicate ? -1 : undefined}
          onClick={(event) => scrollToSection(event, '#problem')}
        >
          <span className="home-thq-text-elm31">OUR IMPACT</span>
        </a>
      </div>
    </div>
  )
}
