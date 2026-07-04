import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";

import Card from "../../ui/Card";
import Button from "../../ui/Button";
import Spinner from "../../ui/Spinner";

import TurfBasicInfo from "./TurfBasicInfo";
import TurfPricing from "./TurfPricing";
import TurfImageSection from "./TurfImageSection";
import BusinessHoursEditor, { DEFAULT_BUSINESS_HOURS } from "./BusinessHoursEditor";

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
    cancellationWindowHours: 24,
    image: {
      url: "",
      publicId: "",
    },
    isActive: true,
    businessHours: DEFAULT_BUSINESS_HOURS,
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
          cancellationWindowHours: turf.cancellationWindowHours ?? 24,
          image: {
            url: turf.imageUrl || "",
            publicId: turf.imagePublicId || "",
          },
          isActive: turf.isActive,
          businessHours: turf.businessHours || DEFAULT_BUSINESS_HOURS,
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

  const handleImageChange = (image) => {
    setFormData((prev) => ({
      ...prev,
      image,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.pricePerHour) {
      toast.error("Please enter the price per hour.");
      return;
    }

    if (!formData.image.url) {
      toast.error("Please upload a turf image.");
      return;
    }

    try {
      setLoading(true);

      const payload = {
        name: formData.name,
        description: formData.description,
        location: formData.location,
        sport: formData.sport,
        pricePerHour: Number(formData.pricePerHour),
        cancellationWindowHours: Number(formData.cancellationWindowHours),
        imageUrl: formData.image.url,
        imagePublicId: formData.image.publicId,
        isActive: formData.isActive,
        businessHours: formData.businessHours,
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
  };

  if (fetching) {
    return (
      <Card className="mx-auto max-w-3xl p-10">
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

        <TurfImageSection image={formData.image} onChange={handleImageChange} />

        <div className="border-t border-slate-100 pt-8">
          <BusinessHoursEditor
            value={formData.businessHours}
            onChange={(hours) =>
              setFormData((prev) => ({ ...prev, businessHours: hours }))
            }
          />
        </div>

        <Button
          type="submit"
          className="w-full"
          loading={loading}
          disabled={loading}
        >
          {mode === "create" ? "Create Turf" : "Save Changes"}
        </Button>
      </form>
    </Card>
  );
}

export default TurfForm;
