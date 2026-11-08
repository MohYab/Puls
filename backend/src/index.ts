import "dotenv/config";
import { createApp } from "./app.js";
import { assertProductionConfig } from "./utils/runtimeConfig.js";
import { assertClinicTimeZone } from "./utils/timeZone.js";

// Checked before listening, and not in app.ts, so Supertest is not affected.
assertClinicTimeZone();
assertProductionConfig();

const app = createApp();
const port = process.env.PORT || 3001;

app.listen(port, () => {
  console.log(`Server listening on port ${port}`);
});
