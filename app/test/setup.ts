import "@testing-library/jest-dom/vitest";

import { cleanup } from "@testing-library/react";
import { afterEach } from "vitest";

afterEach(() => {
  cleanup();
});

// jsdom has no modal dialog support. This mimics what browsers do:
// showModal/close toggle `open`, and Escape fires `cancel` then `close`.
if (typeof HTMLDialogElement.prototype.showModal !== "function") {
  HTMLDialogElement.prototype.showModal = function showModal() {
    this.setAttribute("open", "");
  };
  HTMLDialogElement.prototype.close = function close(returnValue?: string) {
    if (!this.open) return;
    if (returnValue !== undefined) this.returnValue = returnValue;
    this.removeAttribute("open");
    this.dispatchEvent(new Event("close"));
  };
  document.addEventListener("keydown", (event) => {
    if (event.key !== "Escape") return;
    const dialog = document.querySelector<HTMLDialogElement>("dialog[open]");
    if (!dialog) return;
    const cancel = new Event("cancel", { cancelable: true });
    if (dialog.dispatchEvent(cancel)) dialog.close();
  });
}
