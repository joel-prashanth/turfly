import ImageUpload from "./ImageUpload";

function TurfImage({ image, onChange }) {
  return (
    <section className="space-y-4">
      <div>
        <h3 className="text-lg font-semibold">Turf Image</h3>

        <p className="text-sm text-gray-500">
          Upload a high-quality image of your turf.
        </p>
      </div>

      <ImageUpload value={image} onChange={onChange} />
    </section>
  );
}

export default TurfImage;
