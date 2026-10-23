export type BlogBlock =
  | { kind: "heading"; text: string }
  | { kind: "subheading"; text: string }
  | { kind: "paragraph"; text: string }
  | { kind: "list"; ordered: boolean; items: string[] };

export function parseBlogBody(body: string): BlogBlock[] {
  return body.replaceAll("\r\n", "\n").split(/\n\s*\n/).flatMap((chunk) => {
    const lines = chunk.trim().split("\n");
    const blocks: BlogBlock[] = [];
    let paragraph: string[] = [];
    let list: string[] = [];
    let orderedList = false;
    const flush = () => {
      if (paragraph.length) blocks.push({ kind: "paragraph", text: paragraph.join(" ").trim() });
      paragraph = [];
    };
    const flushList = () => {
      if (list.length) blocks.push({ kind: "list", ordered: orderedList, items: list });
      list = [];
      orderedList = false;
    };
    for (const line of lines) {
      const bullet = line.match(/^\s*[-*]\s+(.+)$/);
      const numbered = line.match(/^\s*\d+[.)]\s+(.+)$/);
      if (bullet || numbered) {
        flush();
        const isOrdered = Boolean(numbered);
        if (list.length && orderedList !== isOrdered) flushList();
        orderedList = isOrdered;
        list.push((bullet ?? numbered)![1].trim());
      } else if (line.startsWith("### ") || line.startsWith("## ")) {
        flush();
        flushList();
        const isSubheading = line.startsWith("### ");
        blocks.push({ kind: isSubheading ? "subheading" : "heading", text: line.slice(isSubheading ? 4 : 3).trim() });
      } else if (line.trim()) {
        flushList();
        paragraph.push(line.trim());
      } else {
        flushList();
      }
    }
    flush();
    flushList();
    return blocks.filter((block) => "items" in block ? block.items.length > 0 : Boolean(block.text));
  });
}

export function blogSlug(title: string) {
  return title.toLowerCase().normalize("NFKD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "").slice(0, 240).replace(/-$/g, "");
}
