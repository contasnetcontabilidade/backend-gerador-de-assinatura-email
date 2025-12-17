import "dotenv/config";
import express, { json } from "express";
import type { Request, Response } from "express";
import { usersRouter, templateRouter, exportRouter } from "../routes/routes";
import cors from "cors";

const app = express();

app.use(cors());

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
