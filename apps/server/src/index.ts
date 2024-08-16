require("dotenv").config({
  path: `${process.cwd()}/.env`,
});
import "express-async-errors";
import { server } from "./server";

const port = process.env.PORT || 4000;

server.listen(port, () => {
  console.log(`server running on ${port}`);
});

// ========================
// extends typings
declare global {
  namespace Express {
    interface Request {
      user?: {
        id: string;
        isAdmin: boolean;
        email: string;
        username: string;
      };
    }
  }
}
