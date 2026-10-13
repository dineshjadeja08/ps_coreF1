export type BlogBlock = { kind: "heading" | "paragraph"; text: string };

export function parseBlogBody(body: string): BlogBlock[] {
  return body.replaceAll("\r\n", "\n").split(/\n\s*\n/).flatMap((chunk) => {
    const lines = chunk.trim().split("\n");
    const blocks: BlogBlock[] = [];
    let paragraph: string[] = [];
    const flush = () => {
      if (paragraph.length) blocks.push({ kind: "paragraph", text: paragraph.join(" ").trim() });
      paragraph = [];
    };
    for (const line of lines) {
      if (line.startsWith("## ")) {
        flush();
        blocks.push({ kind: "heading", text: line.slice(3).trim() });
      } else if (line.trim()) {
        paragraph.push(line.trim());
      }
    }
    flush();
    return blocks.filter((block) => block.text);
  });
}

export function blogSlug(title: string) {
  return title.toLowerCase().normalize("NFKD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "").slice(0, 240).replace(/-$/g, "");
}
