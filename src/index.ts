import app from "./app";
import "dotenv/config";

const port = Number(process.env.PORT) || 3000;
const host = process.env.HOST || "localhost";

app.listen(port, host, () => {
  console.log(`Server is running at http://${host}:${port}`);
  console.log(`Environment: ${process.env.NODE_ENV}`);
});