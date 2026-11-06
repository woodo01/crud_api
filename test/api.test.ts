process.env.PORT = '4111';

import { server } from '../src';
import supertest from "supertest";

const request = supertest(server);

describe("User API testing", () => {
  beforeAll((): void => {
    server.close();
    server.listen(4111);
  });

  afterAll(async (): Promise<void> => {
    await new Promise((resolve): void => {
      server.close(resolve);
    });
  });

  let testUserId: string;

  it("should return an empty list when there are no users", async () => {
    const response = await request.get("/api/users");
    expect(response.status).toBe(200);
    expect(response.body).toEqual([]);
  });

  it("should create a new user", async () => {
    const newUser = {
      username: "Ivan",
      age: 100,
      hobbies: ["a", "b"],
    };

    const response = await request.post("/api/users").send(newUser);
    expect(response.status).toBe(201);
    expect(response.body).toHaveProperty("id");
    expect(response.body.username).toBe("Ivan");
    expect(response.body.age).toBe(100);
    expect(response.body.hobbies).toEqual(["a", "b"]);

    testUserId = response.body.id;
  });

  it("should find a user by ID", async () => {
    const response = await request.get(`/api/users/${testUserId}`);
    expect(response.status).toBe(200);
    expect(response.body.id).toBe(testUserId);
    expect(response.body.username).toBe("Ivan");
    expect(response.body.age).toBe(100);
    expect(response.body.hobbies).toEqual(["a", "b"]);
  });

  it("should update the user", async () => {
    const updatedUser = {
      username: "ivan",
      age: 101,
      hobbies: ["v", "a", "t"],
    };

    const response = await request
      .put(`/api/users/${testUserId}`)
      .send(updatedUser);
    expect(response.status).toBe(200);
    expect(response.body.username).toBe("ivan");
    expect(response.body.age).toBe(101);
    expect(response.body.hobbies).toEqual(["v", "a", "t"]);
  });

  it("should delete a user by ID", async () => {
    const response = await request.delete(`/api/users/${testUserId}`);
    expect(response.status).toBe(204);

    const getResponse = await request.get(`/api/users/${testUserId}`);
    expect(getResponse.status).toBe(404);
  });

  it("should return 404 after deletion", async () => {
    const response = await request.get(`/api/users/${testUserId}`);

    expect(response.status).toBe(404);
    expect(response.body.message).toBe("User not found");
  });
});
