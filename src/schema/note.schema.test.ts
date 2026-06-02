import { describe, expect, it } from "bun:test";
import { notes } from "./note.schema";

describe("notes schema", () => {
  it("defines the notes table columns", () => {
    expect(notes.id.name).toBe("id");
    expect(notes.userId.name).toBe("user_id");
    expect(notes.title.name).toBe("title");
    expect(notes.content.name).toBe("content");
    expect(notes.createdAt.name).toBe("created_at");
    expect(notes.updatedAt.name).toBe("updated_at");
  });
});
