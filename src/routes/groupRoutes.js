import {
  createGroup,
  joinGroup,
  listGroupMembers,
  listCreatedGroups,
  editGroup,
  deleteGroup,
} from "../controllers/groupController.js";

async function groupRoutes(app, options) {
  app.post("/create", createGroup);
  app.post("/join", joinGroup);
  app.get("/members/:groupId", listGroupMembers);
  app.get("/my-groups", listCreatedGroups);
  app.patch("/:groupId", editGroup); // editar grupo
  app.delete("/:groupId", deleteGroup); // excluir grupo
}

export default groupRoutes;
