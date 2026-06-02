import { describe, expect, it, mock, spyOn } from "bun:test";

const listenMock = mock((_port: string | number, callback: () => void) => {
  callback();
  return { close: mock(() => undefined) };
});

mock.module("./app", () => ({
  default: {
    listen: listenMock,
  },
}));

const { printBanner, startServer } = await import("./server");

describe("server", () => {
  it("prints a startup banner with the selected port", () => {
    const consoleSpy = spyOn(console, "log").mockImplementation(() => undefined);

    printBanner(3000);

    expect(consoleSpy).toHaveBeenCalled();
    expect(String(consoleSpy.mock.calls[0]?.[0])).toContain("http://localhost:3000");
    consoleSpy.mockRestore();
  });

  it("starts the express app", () => {
    const consoleSpy = spyOn(console, "log").mockImplementation(() => undefined);

    startServer();

    expect(listenMock).toHaveBeenCalled();
    consoleSpy.mockRestore();
  });
});
