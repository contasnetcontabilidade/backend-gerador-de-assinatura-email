import "dotenv/config";
import express, { json, type Request, type Response } from "express";
import { usersRouter, templateRouter, exportRouter } from "../routes/routes";
import cors from "cors";

const app = express();

const corsOptions = {
  origin: "*",
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
};

app.use(cors(corsOptions));
app.options("/*", cors(corsOptions));

app.use(json({ limit: "30mb" }));

const apiRouter = express.Router();

app.use("/api", apiRouter);

apiRouter.use("/users", usersRouter);
apiRouter.use("/templates", templateRouter);
apiRouter.use("/export", exportRouter);
app.listen(3000, () => {
  console.log("Server running on port 3000");
});
export default (req: Request, res: Response) => {
  app(req, res);
};
