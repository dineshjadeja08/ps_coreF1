import { renderToStaticMarkup } from "react-dom/server";
import { expect, it, vi } from "vitest";

const state = vi.hoisted(() => ({ failed: false, onError: () => {} }));
vi.mock("react", async (original) => ({ ...await original<object>(), useState: () => [state.failed, (value: boolean) => { state.failed = value; }] }));
vi.mock("next/image", async () => {
  const { createElement } = await import("react");
  return { default: (props: { src: string; alt: string; onError: () => void }) => {
    state.onError = props.onError;
    return createElement("img", { src: props.src, alt: props.alt });
  } };
});

import { ServiceImage } from "./service-image";

it("switches a failed upload to existing local artwork, even when a local match exists", () => {
  const props = { src: "https://res.cloudinary.com/demo/image/upload/broken.png", alt: "AC Installation" };
  expect(renderToStaticMarkup(<ServiceImage {...props} />)).toContain("broken.png");
  state.onError();
  expect(renderToStaticMarkup(<ServiceImage {...props} />)).toContain('src="/images/services/ac-installation.png"');
});
