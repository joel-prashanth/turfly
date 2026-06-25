import { Clock, IndianRupee } from "lucide-react";
import Input from "../../ui/Input";

const TurfPricing = ({ formData, handleChange }) => {
  return (
    <div className="space-y-6">
      <h2 className="text-lg font-semibold text-slate-900">Pricing & Policy</h2>

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

      <Input
        label="Cancellation Window (hours)"
        name="cancellationWindowHours"
        type="number"
        value={formData.cancellationWindowHours}
        onChange={handleChange}
        placeholder="24"
        leftIcon={Clock}
        helperText="Players must cancel at least this many hours before the slot starts. Set to 0 to disable cancellations."
        min={0}
        required
      />
    </div>
  );
};

export default TurfPricing;
