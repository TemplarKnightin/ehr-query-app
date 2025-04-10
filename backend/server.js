import express from "express";
import cors from "cors";
import connectDB from "./db/connectDB.js";
import queryRoutes from "./routes/query.route.js";

const app = express();
app.use(cors());
app.use(express.json());

await connectDB();

app.use("/api/query", queryRoutes);

const PORT = 4000;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
