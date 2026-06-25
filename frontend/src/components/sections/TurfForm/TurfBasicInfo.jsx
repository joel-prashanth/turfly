import Input from "../../ui/Input";

const TurfBasicInfo = ({ formData, handleChange }) => {
  return (
    <div className="space-y-6">
      <h2 className="text-lg font-semibold text-slate-900">
        Basic Information
      </h2>

      <Input
        label="Turf Name"
        name="name"
        value={formData.name}
        onChange={handleChange}
        placeholder="Elite Football Arena"
        required
      />

      <Input
        label="Description"
        name="description"
        value={formData.description}
        onChange={handleChange}
        placeholder="Premium FIFA standard football turf..."
      />

      <Input
        label="Location"
        name="location"
        value={formData.location}
        onChange={handleChange}
        placeholder="e.g. Gachibowli, Hyderabad"
        required
      />

      <div>
        <label className="mb-2 block text-sm font-medium text-slate-700">
          Sport
        </label>

        <select
          name="sport"
          value={formData.sport}
          onChange={handleChange}
          className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 outline-none transition focus:border-green-500 focus:ring-4 focus:ring-green-100"
        >
          <option value="FOOTBALL">Football</option>
          <option value="CRICKET">Cricket</option>
          <option value="BADMINTON">Badminton</option>
          <option value="TENNIS">Tennis</option>
          <option value="BASKETBALL">Basketball</option>
          <option value="VOLLEYBALL">Volleyball</option>
        </select>
      </div>
    </div>
  );
};

export default TurfBasicInfo;
