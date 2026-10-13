import cors from "cors";
import express from "express";
import { buildAppRoutes } from "./api/routes";
import { errorHandler, notFound, requestLogger } from "./api/middlewares";

const app = express();

app.use(requestLogger);
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

buildAppRoutes(app);

app.use(notFound);
app.use(errorHandler);

export default app;
