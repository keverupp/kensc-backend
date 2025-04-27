import {
  createGroup,
  joinGroup,
  listGroupMembers,
} from "../controllers/groupController.js";

async function groupRoutes(app, options) {
  app.post("/create", createGroup);
  app.post("/join", joinGroup);
  app.get("/members/:groupId", listGroupMembers);
}

export default groupRoutes;
