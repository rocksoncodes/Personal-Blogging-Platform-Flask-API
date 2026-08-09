import { NewsSearchParams } from "./news.types.js";
import { IHttpClient } from "../../app/interfaces/infrastructure/http.interface.js";

export class NewsService {
  private readonly httpClient: IHttpClient;

  constructor(httpClient: IHttpClient) {
    this.httpClient = httpClient;
  }

  async getNewsArticles(newsParams: NewsSearchParams) {
    try {
      const response = await this.httpClient.makeApiRequest(
        "everything",
        newsParams,
      );
      return response.data;
    } catch (error) {
      this.httpClient.handleApiErrors(error);
    }
  }

  async getTopHeadlines(newsParams: NewsSearchParams) {
    try {
      const response = await this.httpClient.makeApiRequest(
        "top-headlines",
        newsParams,
      );
      return response.data;
    } catch (error) {
      this.httpClient.handleApiErrors(error);
    }
  }
}
