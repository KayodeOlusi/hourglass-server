import cors from "cors";
import express from "express";
import { buildAppRoutes } from "./api/routes";

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

buildAppRoutes(app);

export default app;
