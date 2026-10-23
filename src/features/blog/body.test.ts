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

  it("supports nested headings and ordered or unordered lists as semantic blocks", () => {
    expect(parseBlogBody("## Steps\n### First\n- Clean the filter\n- Check airflow\n\n1. Turn it off\n2. Call a technician")).toEqual([
      { kind: "heading", text: "Steps" },
      { kind: "subheading", text: "First" },
      { kind: "list", ordered: false, items: ["Clean the filter", "Check airflow"] },
      { kind: "list", ordered: true, items: ["Turn it off", "Call a technician"] },
    ]);
  });

  it("creates safe URL slugs from titles", () => {
    expect(blogSlug("Why Isn’t My AC Cooling? ")).toBe("why-isn-t-my-ac-cooling");
  });
});
