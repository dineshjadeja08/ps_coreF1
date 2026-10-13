import { describe, expect, it } from "vitest";

import { blogSlug, parseBlogBody } from "./body";

describe("blog content", () => {
  it("keeps plain text and section headings separate", () => {
    expect(parseBlogBody("Intro\ncontinued.\n\n## Check first\nDetails here.")).toEqual([
      { kind: "paragraph", text: "Intro continued." },
      { kind: "heading", text: "Check first" },
      { kind: "paragraph", text: "Details here." },
    ]);
  });

  it("creates safe URL slugs from titles", () => {
    expect(blogSlug("Why Isn’t My AC Cooling? ")).toBe("why-isn-t-my-ac-cooling");
  });
});
