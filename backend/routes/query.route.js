import fs from "fs";
import express from "express";
import QueryBuilder from "../utils/QueryBuilder.js";
import EHRFlattener from "../utils/EHRFlattener.js";
import { MongoClient } from "mongodb";

// ✅ Load models.json safely using fs (no import assertion needed)
const modelsPath = new URL("../models/models.json", import.meta.url);
const models = JSON.parse(fs.readFileSync(modelsPath, "utf-8"));

const router = express.Router();
const client = new MongoClient("mongodb://127.0.0.1:27017");
const db = client.db("orbda");
const collection = db.collection("ehrs");

router.post("/", async (req, res) => {
  const { filters } = req.body;

  try {
    const builder = new QueryBuilder(models);
    const query = builder.buildQuery(filters);

    const records = await collection.find(query).toArray();
    const flattener = new EHRFlattener(models);
    const flattened = flattener.flattenEHRS(records);

    res.json(flattened);
  } catch (error) {
    console.error("Query error:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

export default router;
