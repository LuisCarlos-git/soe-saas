import { createApi } from "./app.js";
import { parseConfiguration } from "@soe/backend";

const config = parseConfiguration(process.env);
const app = await createApi(config);
await app.listen(config.API_PORT, config.API_HOST);
