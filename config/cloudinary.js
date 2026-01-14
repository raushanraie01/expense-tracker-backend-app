import { v2 as cloudinary } from "cloudinary";
import { v4 as uuidv4 } from "uuid";
// Configuration
cloudinary.config({
  cloud_name: "dbv8etyuj",
  api_key: "413743824941479",
  api_secret: "V15aNU-SBRNvz0FSKOKEbIS3Lms",
});
export const uploadOnCloudinary = async (filepath) => {
  try {
    if (!filepath) return null;
    const uploadResult = await cloudinary.uploader.upload(filepath, {
      folder: "profile-images",
      public_id: uuidv4(),
    });
    console.log("From Cloudinary:", uploadResult);
    return uploadResult;
  } catch (error) {
    return null;
  }
};
