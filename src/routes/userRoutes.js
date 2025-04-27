import { registerUser } from "../controllers/userController.js";

async function userRoutes(app, options) {
  app.post("/register", registerUser);
}

export default userRoutes;
