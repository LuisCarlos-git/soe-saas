import { createApi } from "./app";
import { parseConfiguration } from "./shared/config";

const config = parseConfiguration(process.env);
const app = await createApi(config);
await app.listen(config.API_PORT, config.API_HOST);
