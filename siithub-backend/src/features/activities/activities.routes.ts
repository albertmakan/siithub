import { type Request, type Response, Router } from "express";
import "express-async-errors";
import { activitiesService } from "./activities.service";
import { z } from "zod";
import { optionalDateString } from "../../utils/zod";

const activitiesRoutes = Router();

const upTillQuerySchema = z.object({ upTill: optionalDateString.default(null) });

activitiesRoutes.get("/", async (req: Request, res: Response) => {
  const { upTill } = upTillQuerySchema.parse(req.query);
  res.send(await activitiesService.findActivities(res.locals.userId, upTill || undefined));
});

export { activitiesRoutes };
