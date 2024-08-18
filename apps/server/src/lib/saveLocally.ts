import { CustomError, generateOTP } from "@repo/utils";
import { Request } from "express";
import path from "path";
import fs from "fs";

// Function to save a single file locally
export const saveAssetLocally = async (
  req: Request,
  folderName = ""
): Promise<string | null> => {
  return new Promise((resolve, reject) => {
    if (!req.files || !req.files.media) {
      throw new CustomError({ message: "No files were uploaded." });
    }

    let media = req.files.media;
    // If media is an array, reject as this function is for single files
    if (Array.isArray(media)) {
      throw new CustomError({
        message: "Expected a single file, but received multiple.",
      });
    }

    const fileName = path.parse(media.name).name;

    const extName = path.extname(media.name);

    const uploadPath = path.join(
      process.cwd(),
      "assets",
      folderName,
      `${fileName}__${generateOTP(10)}${extName}`
    );

    media.mv(uploadPath, (err: any) => {
      if (err) {
        reject(new CustomError({ message: "Error saving the file." }));
      } else {
        resolve(uploadPath);
      }
    });
  });
};

// Function to save multiple files locally
export const saveAssetsLocally = async (req: Request) => {
  return new Promise((resolve, reject) => {
    if (!req.files || !req.files.media) {
      throw new CustomError({ message: "No files were uploaded." });
    }

    let media = req.files.media;

    // If media is not an array, reject as this function is for multiple files
    if (!Array.isArray(media)) {
      throw new CustomError({
        message: "Expected multiple files, but received a single file.",
      });
    }

    const uploadPaths: string[] = [];

    media.forEach((file: any) => {
      const uploadPath = path.join(process.cwd(), "assets", file.name);

      file.mv(uploadPath, (err: any) => {
        if (err) {
          reject(
            new CustomError({ message: `Error saving the file: ${file.name}` })
          );
        } else {
          uploadPaths.push(uploadPath);
        }
      });
    });

    resolve(uploadPaths);
  });
};

export const deleteFile = (filePath: string) => {
  return new Promise<void>((resolve, reject) => {
    fs.unlink(filePath, (err) => {
      if (err) {
        reject(
          new CustomError({ message: `Error deleting the file: ${filePath}` })
        );
      } else {
        resolve();
      }
    });
  });
};
