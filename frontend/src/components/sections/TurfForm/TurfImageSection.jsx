import ImageUpload from "../../owner/ImageUpload";

const TurfImageSection = ({ image, onChange }) => {
  return (
    <section className="space-y-6">
      <div>
        <h2 className="text-lg font-semibold text-slate-900">
          Turf Image
        </h2>

        <p className="mt-1 text-sm text-slate-500">
          Upload a high-quality image of your turf.
        </p>
      </div>

      <ImageUpload
        value={image}
        onChange={onChange}
      />
    </section>
  );
};

export default TurfImageSection;