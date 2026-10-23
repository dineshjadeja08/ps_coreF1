import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";

import { ServiceImage } from "./service-image";

describe("server-rendered service images", () => {
  it("emits real img src/srcset, descriptive alt and responsive sizes without hydration", () => {
    const html = renderToStaticMarkup(<ServiceImage src={null} alt="AC Installation by Purple Squad" sizes="800px" />);
    expect(html).toContain("<img");
    expect(html).toContain('alt="AC Installation by Purple Squad"');
    expect(html).toContain("ac-installation.png");
    expect(html).toContain("srcSet=");
    expect(html).toContain('sizes="800px"');
  });
  it("preserves contextual alt even when only generic stock artwork is available", () => {
    const html = renderToStaticMarkup(<ServiceImage alt="Special appliance diagnosis" />);
    expect(html).toContain('alt="Special appliance diagnosis"');
  });
  it("renders Cloudinary uploads with the Next.js optimizer rather than CSS-only backgrounds", () => {
    const html = renderToStaticMarkup(<ServiceImage src="https://res.cloudinary.com/demo/image/upload/ac.jpg" alt="AC Inspection" />);
    expect(html).toContain("/_next/image?url=");
    expect(html).toContain("res.cloudinary.com");
  });
});
