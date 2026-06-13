import { useEffect, useRef, useState } from "react";
import {
  UploadCloud,
  ImagePlus,
  Loader2,
  Trash2,
  RefreshCw,
} from "lucide-react";
import toast from "react-hot-toast";

import Button from "../ui/Button";
import { uploadImage } from "../../services/upload.service";

const MAX_FILE_SIZE = 5 * 1024 * 1024;

const ALLOWED_TYPES = ["image/jpeg", "image/jpg", "image/png", "image/webp"];

function ImageUpload({ value, onChange }) {
  const inputRef = useRef(null);

  const [preview, setPreview] = useState(value?.url || "");

  const [dragging, setDragging] = useState(false);

  const [uploading, setUploading] = useState(false);

  const [error, setError] = useState("");

  useEffect(() => {
    setPreview(value?.url || "");
  }, [value]);

  const openFilePicker = () => {
    inputRef.current?.click();
  };

  const validateFile = (file) => {
    if (!file) return false;

    if (!ALLOWED_TYPES.includes(file.type)) {
      setError("Only JPG, PNG and WEBP images are allowed.");

      toast.error("Only JPG, PNG and WEBP images are allowed.");

      return false;
    }

    if (file.size > MAX_FILE_SIZE) {
      setError("Image size cannot exceed 5 MB.");

      toast.error("Image size cannot exceed 5 MB.");

      return false;
    }

    setError("");

    return true;
  };

  const uploadSelectedFile = async (file) => {
    if (!validateFile(file)) {
      return;
    }
    const localPreview = URL.createObjectURL(file);

    setPreview((previous) => {
      if (previous && previous.startsWith("blob:")) {
        URL.revokeObjectURL(previous);
      }

      return localPreview;
    });

    try {
      setUploading(true);

      const response = await uploadImage(file);

      onChange({
        url: response.image.url,
        publicId: response.image.publicId,
      });

      toast.success("Image uploaded successfully.");
    } catch (err) {
      console.error(err);

      setPreview(value?.url || "");

      setError(err.response?.data?.message || "Failed to upload image.");

      toast.error(err.response?.data?.message || "Failed to upload image.");
    } finally {
      setUploading(false);
    }
  };

  const handleFileChange = (event) => {
    const file = event.target.files?.[0];

    if (!file) return;

    uploadSelectedFile(file);
  };

  const handleDrop = (event) => {
    event.preventDefault();

    setDragging(false);

    const file = event.dataTransfer.files?.[0];

    if (!file) return;

    uploadSelectedFile(file);
  };

  const handleRemove = () => {
    setPreview("");

    setError("");

    if (inputRef.current) {
      inputRef.current.value = "";
    }

    onChange({
      url: "",
      publicId: "",
    });

    toast.success("Image removed.");
  };
  return (
    <div className="space-y-4">

      <input
        ref={inputRef}
        type="file"
        accept="image/png,image/jpeg,image/webp"
        className="hidden"
        onChange={handleFileChange}
      />

      {preview ? (
        <div className="space-y-4">
          <div className="relative overflow-hidden rounded-2xl border bg-gray-100">
            <img
              src={preview}
              alt="Turf Preview"
              className="h-72 w-full object-cover"
            />

            {uploading && (
              <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/60 text-white">
                <Loader2 size={42} className="mb-3 animate-spin" />

                <p className="text-lg font-semibold">Uploading...</p>

                <p className="mt-1 text-sm text-gray-200">
                  Please wait while we upload your image.
                </p>
              </div>
            )}
          </div>

          <div className="flex flex-col gap-3 sm:flex-row">
            <Button
              type="button"
              variant="secondary"
              className="flex-1"
              disabled={uploading}
              onClick={openFilePicker}
            >
              <RefreshCw size={18} className="mr-2" />
              Replace Image
            </Button>

            <Button
              type="button"
              variant="danger"
              className="flex-1"
              disabled={uploading}
              onClick={handleRemove}
            >
              <Trash2 size={18} className="mr-2" />
              Remove Image
            </Button>
          </div>
        </div>
      ) : (
        <div
          onClick={openFilePicker}
          onDragOver={(e) => {
            e.preventDefault();
            setDragging(true);
          }}
          onDragLeave={() => setDragging(false)}
          onDrop={handleDrop}
          className={`cursor-pointer rounded-2xl border-2 border-dashed p-10 transition-all duration-200 ${
            dragging
              ? "border-green-500 bg-green-50"
              : "border-gray-300 hover:border-green-500 hover:bg-gray-50"
          }`}
        >
          <div className="flex flex-col items-center justify-center text-center">
            <div className="mb-5 rounded-full bg-green-100 p-5">
              {dragging ? (
                <UploadCloud size={42} className="text-green-600" />
              ) : (
                <ImagePlus size={42} className="text-green-600" />
              )}
            </div>

            <h3 className="text-lg font-semibold">
              {dragging ? "Drop your image here" : "Upload Turf Image"}
            </h3>

            <p className="mt-2 max-w-md text-sm text-gray-500">
              Drag & drop an image here or click below to choose one from your
              computer.
            </p>

            <div className="mt-6">
              <Button
                type="button"
                disabled={uploading}
                onClick={(e) => {
                  e.stopPropagation();
                  openFilePicker();
                }}
              >
                <ImagePlus size={18} className="mr-2" />
                Choose Image
              </Button>
            </div>

            <p className="mt-5 text-xs text-gray-400">
              Supported formats: JPG, PNG, WEBP
            </p>

            <p className="mt-1 text-xs text-gray-400">
              Maximum file size: 5 MB
            </p>
          </div>
        </div>
      )}
      {error && (
        <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3">
          <p className="text-sm font-medium text-red-600">{error}</p>
        </div>
      )}
    </div>
  );
}

export default ImageUpload;
