import { v2 as cloudinary } from "cloudinary";
import { categorizeFileType } from "./categorizeFileType";

export const cloduinaryUploader = async (filePath: string) => {
  try {
    cloudinary.config({
      cloud_name: process.env.CLOUDINARY_NAME,
      secure: true,
      api_key: process.env.CLOUDINARY_API_KEY,
      api_secret: process.env.CLOUDINARY_API_SECRET,
    });
    const resource_type = categorizeFileType(filePath);

    const results = await cloudinary.uploader.upload(filePath, {
      use_filename: true,
      unique_filename: false,
      folder: process.env.CLOUDINARY_FOLDER,
      resource_type,
    });

    if (resource_type == "image") {
      const efficientUrl = cloudinary.url(results.public_id, {
        transformation: [
          {
            quality: "auto",
            fetch_format: "auto",
          },
          {
            width: 1000,
            height: 800,
          },
        ],
      });
      return efficientUrl;
    }

    return results.secure_url;
  } catch (error) {
    console.error("error while uploading to cloduinary: ", error);
  }
};
