import { Request, Response } from "express";
import { NewsService } from "./news.service.js";
import { IResponseHandler } from "../../app/interfaces/infrastructure/response.handler.interface.js";
import { NewsSearchParams } from "./news.types.js";

export class NewsController {
  private readonly httpClient: NewsService;
  private readonly responseHandler: IResponseHandler;

  constructor(newsService: NewsService, responseHandler: IResponseHandler) {
    this.httpClient = newsService;
    this.responseHandler = responseHandler;
  }

  async handleGetNewsArticlesRequest(req: Request, res: Response) {
    return this.responseHandler.handleRequest(
      req,
      res,
      (params: NewsSearchParams) => this.httpClient.getNewsArticles(params),
      "Related Article(s)",
      ["q"],
    );
  }

  async handleGetTopHeadlines(req: Request, res: Response) {
    return this.responseHandler.handleRequest(
      req,
      res,
      (params: NewsSearchParams) => this.httpClient.getTopHeadlines(params),
      "Top Headlines",
      ["country"],
    );
  }
}
