import express, { Request, Response } from "express";
import { prisma } from "./src/db/prisma/client";

const app = express();

app.use(express.json());

// Liveness/health check
app.get("/health", async (_req: Request, res: Response) => {
  try {
    await prisma.$queryRaw`SELECT 1`;
    return res.json({
      status: "status ok",
      db: "up",
      timestamp: new Date().toISOString(),
    });
  } catch (err) {
    res.status(503).json({
      status: "degraded",
      db: "down",
      timestamp: new Date().toISOString(),
    });
  }
});

const port = Number(process.env.APP_PORT) || 4000;

app.listen(port, () => {
  console.log(`Hourglass API listening on port ${port}`);
});
