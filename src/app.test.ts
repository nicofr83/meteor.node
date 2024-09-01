// import {describe, expect, test} from '@jest/globals';
import request from "supertest";
import app from "./app.js";

describe("API server endpoints", () => {
  // GET - List all colors
  it("test alive", async () => {
    const res = await request(app)
      .get("/check")
      .expect("Content-Type", /json/);
    expect(res.status).toEqual(200);
    expect(res.body.message).toEqual("I am alive!");
  });

  // GET - Invalid path
  it("should return Not Found", async () => {
    const res = await request(app).get("/INVALID_PATH");
    expect(res.status).toEqual(404);
  });

});