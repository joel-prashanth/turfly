import Input from "../../../components/ui/Input";

const FALLBACK_IMAGE =
  "https://images.unsplash.com/photo-1517466787929-bc90951d0974?w=1200";

const TurfImage = ({ formData, handleChange }) => {
  return (
    <div className="space-y-6">
      <h2 className="text-lg font-semibold text-slate-900">Turf Image</h2>

      <Input
        label="Image URL"
        name="imageUrl"
        value={formData.imageUrl}
        onChange={handleChange}
        placeholder="https://example.com/turf.jpg"
        helperText="Paste an image URL. Cloudinary upload will replace this later."
      />

      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-slate-50">
        <img
          src={formData.imageUrl || FALLBACK_IMAGE}
          alt="Turf Preview"
          className="h-64 w-full object-cover"
          onError={(e) => {
            e.currentTarget.src = FALLBACK_IMAGE;
          }}
        />
      </div>
    </div>
  );
};

export default TurfImage;
