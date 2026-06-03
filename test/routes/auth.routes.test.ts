/*
  Tests for authentication routes

  Ensure the correct HTTP verbs and middleware are wired for the auth route
  group. Tests inspect the router stack rather than performing HTTP requests.
*/
import { describe, expect, it, mock } from "bun:test";

const registerMock = mock((_req, res) => res.status(201).json({ route: "register" }));
const loginMock = mock((_req, res) => res.status(200).json({ route: "login" }));
const logoutMock = mock((_req, res) => res.status(200).json({ route: "logout" }));
const authenticateMock = mock((_req, _res, next) => next());

mock.module("../../src/controllers/auth.controller", () => ({
  register: registerMock,
  login: loginMock,
  logout: logoutMock,
}));

mock.module("../../src/middlewares/auth.middleware", () => ({
  authenticate: authenticateMock,
}));

const authRoutes = (await import("../../src/routes/auth.routes")).default;

describe("auth routes", () => {
  it("wires auth endpoints to their handlers", async () => {
    const routes = (authRoutes.stack as any[]).map((layer: any) => ({
      path: layer.route?.path,
      methods: layer.route?.methods,
      handlers: layer.route?.stack.map((routeLayer: any) => routeLayer.handle),
    }));
    const [registerRoute, loginRoute, logoutRoute] = routes as [any, any, any];

    expect(registerRoute).toMatchObject({ path: "/register", methods: { post: true } });
    expect(registerRoute.handlers).toContain(registerMock);
    expect(loginRoute).toMatchObject({ path: "/login", methods: { post: true } });
    expect(loginRoute.handlers).toContain(loginMock);
    expect(logoutRoute).toMatchObject({ path: "/logout", methods: { post: true } });
    expect(logoutRoute.handlers).toEqual([authenticateMock, logoutMock]);
  });
});
