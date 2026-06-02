/*
  Tests for authentication controllers

  Unit tests that verify controller behavior for registration, login, and
  logout flows. These tests mock the service layer to exercise controller
  validation, response codes, and JSON payload shapes.
*/
import { beforeEach, describe, expect, it, mock } from "bun:test";
import type { Request } from "express";
import { createMockResponse } from "../test-utils/http";

const registerUserMock = mock(async (_userData: any) => ({ id: 1, name: "User", email: "user@example.com" }));
const loginUserMock = mock(async (_credentials: any) => ({ id: 1, email: "user@example.com", token: "token" }));

mock.module("../services/auth.service", () => ({
  registerUser: registerUserMock,
  loginUser: loginUserMock,
}));

const { register, login, logout } = await import("./auth.controller");

describe("auth controller", () => {
  beforeEach(() => {
    registerUserMock.mockClear();
    loginUserMock.mockClear();
  });

  it("registers a valid user", async () => {
    const req = { body: { name: "User", email: "user@example.com", password: "secret123" } } as Request;
    const res = createMockResponse();

    await register(req, res);

    expect(registerUserMock).toHaveBeenCalledWith(req.body);
    expect(res.statusCode).toBe(201);
    expect(res.body).toEqual({ message: "User created successfully", data: { id: 1, name: "User", email: "user@example.com" } });
  });

  it("rejects incomplete registration data", async () => {
    const req = { body: { email: "user@example.com" } } as Request;
    const res = createMockResponse();

    await register(req, res);

    expect(res.statusCode).toBe(400);
    expect(registerUserMock).not.toHaveBeenCalled();
  });

  it("logs in with valid credentials", async () => {
    const req = { body: { email: "user@example.com", password: "secret123" } } as Request;
    const res = createMockResponse();

    await login(req, res);

    expect(loginUserMock).toHaveBeenCalledWith(req.body);
    expect(res.statusCode).toBe(200);
  });

  it("logs out successfully", async () => {
    const res = createMockResponse();

    await logout({} as Request, res);

    expect(res.statusCode).toBe(200);
    expect(res.body).toEqual({ message: "User logged out successfully", data: null });
  });
});
