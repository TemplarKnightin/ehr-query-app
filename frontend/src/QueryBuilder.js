import models from "../models/models.json";
export default class QueryBuilder {
  constructor(model = models) {
    this.model = model;
  }

  getPathForField(field) {
    const findPath = (node) => {
      if (node.name === field && node.path) return node.path;
      if (node.children) {
        for (const child of node.children) {
          const result = findPath(child);
          if (result) return result;
        }
      }
      return null;
    };
    return findPath(this.model);
  }

  buildQuery(filters) {
    const query = {};
    for (const [key, val] of Object.entries(filters)) {
      const path = this.getPathForField(key);
      if (!path) continue;

      if (typeof val === "object" && ("start" in val || "end" in val)) {
        query[path] = {};
        if (val.start) query[path]["$gte"] = val.start;
        if (val.end) query[path]["$lte"] = val.end;
      } else {
        query[path] = val;
      }
    }
    return query;
  }
}
