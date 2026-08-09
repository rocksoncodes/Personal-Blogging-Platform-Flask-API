import { Request, Response, Router } from "express";
import { NewsController } from "./news.controller.js";

export function provideNewsRouter(newsController: NewsController): Router {
  const newsRouter = Router();

  newsRouter.get(
    "/topic",
    async (req: Request, res: Response): Promise<void> => {
      await newsController.handleGetNewsArticlesRequest(req, res);
    },
  );

  newsRouter.get(
    "/top-headlines",
    async (req: Request, res: Response): Promise<void> => {
      await newsController.handleGetTopHeadlines(req, res);
    },
  );

  return newsRouter;
}
