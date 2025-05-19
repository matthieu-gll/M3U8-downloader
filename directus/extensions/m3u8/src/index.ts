import { defineEndpoint } from "@directus/extensions-sdk";
import { spawn } from "node:child_process";
import fs from "node:fs";
import tmp from "tmp";

export default defineEndpoint((router, context) => {
  const { services, getSchema } = context;
  const { FilesService } = services;

  router.post("/", async (req, res) => {
    try {
      const { url, title } = req.body;

      if (!url || !title) {
        return res.status(400).json({
          error: "Champs manquants. Requiert { url, title }",
        });
      }

      // Créer un fichier temporaire
      const tmpFile = tmp.fileSync({ postfix: ".mp4" });

      // Télécharger la vidéo avec ffmpeg
      await new Promise<void>((resolve, reject) => {
        const ffmpeg = spawn("ffmpeg", [
          "-i",
          url,
          "-c",
          "copy",
          "-y",
          tmpFile.name,
        ]);

        ffmpeg.stderr.on("data", (data) => console.log(data.toString()));
        ffmpeg.on("exit", (code) => {
          if (code === 0) resolve();
          else reject(new Error(`ffmpeg exited with code ${code}`));
        });
      });

      // Créer un stream à partir du fichier téléchargé
      const fileStream = fs.createReadStream(tmpFile.name);

      // Initialiser le FilesService de Directus
      const filesService = new FilesService({
        schema: await getSchema(),
      });

      // Déterminer le mimetype manuellement ou via un package (ici: video/mp4)
      const mimetype = "video/mp4";

      // Envoi du fichier dans Directus
      const fileId = await filesService.uploadOne(fileStream, {
        filename_download: title,
        title: title,
        type: mimetype,
        storage: "local",
      });

      // Nettoyage du fichier temporaire
      tmpFile.removeCallback();

      return res.status(200).json({
        message: "Fichier téléchargé et importé avec succès",
        fileId,
      });
    } catch (error) {
      console.error("Erreur dans l’endpoint:", error);
      return res.status(500).json({ error: "Erreur interne du serveur" });
    }
  });
});
