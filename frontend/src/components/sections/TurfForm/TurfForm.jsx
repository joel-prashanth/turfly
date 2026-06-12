import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";

import Card from "../../ui/Card";
import Button from "../../ui/Button";

import TurfBasicInfo from "./TurfBasicInfo";
import TurfPricing from "./TurfPricing";
import TurfImage from "./TurfImage";
import Spinner from "../../ui/Spinner";
import { createTurf, updateTurf, getTurfById } from "../../../api/turfApi";

function TurfForm({ mode = "create", turfId = null }) {
  const navigate = useNavigate();

  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(mode === "edit");

  const [formData, setFormData] = useState({
    name: "",
    description: "",
    location: "",
    sport: "FOOTBALL",
    pricePerHour: "",
    imageUrl: "",
    isActive: true,
  });

  useEffect(() => {
    if (mode !== "edit" || !turfId) {
      setFetching(false);
      return;
    }
    const fetchTurf = async () => {
      try {
        const response = await getTurfById(turfId);

        const turf = response.turf;

        setFormData({
          name: turf.name,
          description: turf.description || "",
          location: turf.location,
          sport: turf.sport,
          pricePerHour: turf.pricePerHour,
          imageUrl: turf.imageUrl || "",
          isActive: turf.isActive,
        });
      } catch (error) {
        console.error(error);
        toast.error("Failed to fetch turf.");
        navigate("/owner/turfs");
      } finally {
        setFetching(false);
      }
    };

    fetchTurf();
  }, [mode, turfId, navigate]);

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      setLoading(true);

      const payload = {
        ...formData,
        pricePerHour: Number(formData.pricePerHour),
      };

      if (mode === "create") {
        await createTurf(payload);
        toast.success("Turf created successfully!");
      } else {
        await updateTurf(turfId, payload);
        toast.success("Turf updated successfully!");
      }

      navigate("/owner/turfs");
    } catch (error) {
      console.error(error);

      toast.error(error?.response?.data?.message || "Something went wrong.");
    } finally {
      setLoading(false);
    }

    if (!formData.pricePerHour) {
      toast.error("Please enter the price per hour.");
      return;
    }
  };

  if (fetching) {
    return (
      <Card className="p-10">
        <div className="flex justify-center">
          <Spinner size="lg" />
        </div>
      </Card>
    );
  }

  return (
    <Card className="mx-auto max-w-3xl p-8">
      <form onSubmit={handleSubmit} className="space-y-10">
        <TurfBasicInfo formData={formData} handleChange={handleChange} />

        <TurfPricing formData={formData} handleChange={handleChange} />

        <TurfImage formData={formData} handleChange={handleChange} />

        <Button type="submit" className="w-full" disabled={loading}>
          {loading
            ? mode === "create"
              ? "Creating Turf..."
              : "Saving Changes..."
            : mode === "create"
              ? "Create Turf"
              : "Save Changes"}
        </Button>
      </form>
    </Card>
  );
}

export default TurfForm;
