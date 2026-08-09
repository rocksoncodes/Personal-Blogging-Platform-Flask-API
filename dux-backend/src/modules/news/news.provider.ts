import { NewsService } from "./news.service.js";
import { NewsController } from "./news.controller.js";
import {
  ModuleControllersProvider,
  SharedDependencies,
} from "../../bootstrap/bootstrap.types.js";
import { AxiosHttpClient } from "../../app/http/clients/axios.client.js";

export function provideNewsController(
  deps: SharedDependencies,
): Extract<ModuleControllersProvider, { name: "news" }> {
  const currentHttpClient = new AxiosHttpClient(
    deps.moduleEnvs.newsApiUrl,
    deps.moduleEnvs.newsApiKey,
    "apiKey",
  );
  const newsService = new NewsService(currentHttpClient);
  const newsController = new NewsController(newsService, deps.responseHandler);

  return {
    name: "news",
    controller: newsController,
  };
}
