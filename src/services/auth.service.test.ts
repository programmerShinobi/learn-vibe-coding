import { beforeEach, describe, expect, it, mock } from "bun:test";

const findUserByEmailMock = mock(async (_email: string) => undefined);
const createUserMock = mock(async (userData: any) => ({ id: 1, ...userData }));
const generateTokenMock = mock((_payload: object) => "token");

mock.module("../repositories/auth.repository", () => ({
  findUserByEmail: findUserByEmailMock,
  createUser: createUserMock,
}));

mock.module("../utils/jwt.utils", () => ({
  generateToken: generateTokenMock,
}));

const { registerUser, loginUser } = await import("./auth.service");

describe("auth service", () => {
  beforeEach(() => {
    findUserByEmailMock.mockReset();
    createUserMock.mockReset();
    generateTokenMock.mockReset();
    findUserByEmailMock.mockResolvedValue(undefined);
    createUserMock.mockImplementation(async (userData: any) => ({ id: 1, ...userData }));
    generateTokenMock.mockReturnValue("token");
  });

  it("registers a new user without returning password", async () => {
    const user = await registerUser({ name: "User", email: "user@example.com", password: "secret" });

    expect(findUserByEmailMock).toHaveBeenCalledWith("user@example.com");
    expect(createUserMock).toHaveBeenCalled();
    expect(user).toEqual({ id: 1, name: "User", email: "user@example.com" });
  });

  it("rejects duplicate email during registration", async () => {
    findUserByEmailMock.mockResolvedValue({ id: 1, email: "user@example.com" });

    await expect(registerUser({ name: "User", email: "user@example.com", password: "secret" })).rejects.toThrow("User already exists");
  });

  it("logs in a user and returns token without password", async () => {
    const bcrypt = await import("bcryptjs");
    const hashedPassword = await bcrypt.default.hash("secret", 10);
    findUserByEmailMock.mockResolvedValue({ id: 1, name: "User", email: "user@example.com", password: hashedPassword });

    const result = await loginUser({ email: "user@example.com", password: "secret" });

    expect(generateTokenMock).toHaveBeenCalledWith({ id: 1, email: "user@example.com" });
    expect(result).toEqual({ id: 1, name: "User", email: "user@example.com", token: "token" });
  });

  it("rejects invalid login credentials", async () => {
    findUserByEmailMock.mockResolvedValue(undefined);

    await expect(loginUser({ email: "missing@example.com", password: "secret" })).rejects.toThrow("Invalid credentials");
  });
});
