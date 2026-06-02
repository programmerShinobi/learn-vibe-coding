import { describe, expect, it, mock } from "bun:test";

const registerMock = mock((_req, res) => res.status(201).json({ route: "register" }));
const loginMock = mock((_req, res) => res.status(200).json({ route: "login" }));
const logoutMock = mock((_req, res) => res.status(200).json({ route: "logout" }));
const authenticateMock = mock((_req, _res, next) => next());

mock.module("../controllers/auth.controller", () => ({
  register: registerMock,
  login: loginMock,
  logout: logoutMock,
}));

mock.module("../middlewares/auth.middleware", () => ({
  authenticate: authenticateMock,
}));

const authRoutes = (await import("./auth.routes")).default;

describe("auth routes", () => {
  it("wires auth endpoints to their handlers", async () => {
    const routes = authRoutes.stack.map((layer: any) => ({
      path: layer.route?.path,
      methods: layer.route?.methods,
      handlers: layer.route?.stack.map((routeLayer: any) => routeLayer.handle),
    }));

    expect(routes[0]).toMatchObject({ path: "/register", methods: { post: true } });
    expect(routes[0].handlers).toContain(registerMock);
    expect(routes[1]).toMatchObject({ path: "/login", methods: { post: true } });
    expect(routes[1].handlers).toContain(loginMock);
    expect(routes[2]).toMatchObject({ path: "/logout", methods: { post: true } });
    expect(routes[2].handlers).toEqual([authenticateMock, logoutMock]);
  });
});
