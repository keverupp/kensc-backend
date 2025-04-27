import {
  uploadSave,
  listFiles,
  statusSave,
} from "../controllers/saveController.js";

async function saveRoutes(app, options) {
  app.post("/upload", uploadSave);
  app.get("/files/:groupId/:type", listFiles);
  app.get("/status/:groupId", statusSave); // 👈 novo
}

export default saveRoutes;
