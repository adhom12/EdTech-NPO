import katex from "katex";

export type Block =
  | { type: "p"; text: string }
  | { type: "display"; math: string }
  | { type: "subtext"; text: string };

export function renderInline(text: string): string {
  const parts = text.split(/(\$[^$\n]+?\$)/g);
  return parts
    .map((part, i) => {
      if (i % 2 === 1) {
        const math = part.slice(1, -1);
        return katex.renderToString(math, {
          displayMode: false,
          throwOnError: false,
        });
      }
      return part
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;");
    })
    .join("");
}

export function renderDisplay(math: string): string {
  return katex.renderToString(math, {
    displayMode: true,
    throwOnError: false,
  });
}
