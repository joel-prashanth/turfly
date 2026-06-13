const uploadService = require("./upload.service");

const uploadImage = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "Image file is required.",
      });
    }

    const result = await uploadService.uploadImage(req.file.buffer);

    return res.status(200).json({
      success: true,
      message: "Image uploaded successfully.",
      image: {
        url: result.secure_url,
        publicId: result.public_id,
      },
    });
  } catch (error) {
    console.error("Image upload error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to upload image.",
    });
  }
};

module.exports = {
  uploadImage,
};