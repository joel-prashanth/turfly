import { IndianRupee } from "lucide-react";
import Input from "../../ui/Input";

const TurfPricing = ({ formData, handleChange }) => {
  return (
    <div className="space-y-6">
      <h2 className="text-lg font-semibold text-slate-900">Pricing</h2>

      <Input
        label="Price Per Hour"
        name="pricePerHour"
        type="number"
        value={formData.pricePerHour}
        onChange={handleChange}
        placeholder="1200"
        leftIcon={IndianRupee}
        helperText="The amount players pay for one hour of booking."
        required
      />
    </div>
  );
};

export default TurfPricing;
