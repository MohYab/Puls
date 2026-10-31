import "dotenv/config";
import { createApp } from "./app.js";
import { assertClinicTimeZone } from "./utils/timeZone.js";

const app = createApp();
const port = process.env.PORT || 3001;

assertClinicTimeZone();
app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});
