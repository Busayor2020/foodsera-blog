import { render } from "@testing-library/react";
import type { ReactElement } from "react";
import { createRoutesStub } from "react-router";

/** Renders `ui` inside a router at `path`, for components that use links. */
export function renderWithRouter(ui: ReactElement, { path = "/" } = {}) {
  const Stub = createRoutesStub([{ path: "*", Component: () => ui }]);
  return render(<Stub initialEntries={[path]} />);
}
