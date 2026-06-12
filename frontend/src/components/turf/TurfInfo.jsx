import { MapPin, IndianRupee, Star } from "lucide-react";

import Card from "../ui/Card";
import turfImages from "../../utils/turfImages";

function TurfInfo({ turf }) {
  const image = turfImages[turf.name.length % turfImages.length];

  return (
    <Card className="overflow-hidden mb-10">
      <img
        src={image}
        alt={turf.name}
        className="h-[420px] w-full object-cover"
      />

      <div className="p-8">
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-4xl font-bold">{turf.name}</h1>

            <div className="mt-4 flex items-center gap-5 text-slate-600">
              <div className="flex items-center gap-2">
                <MapPin size={18} />

                {turf.location}
              </div>

              <div className="flex items-center gap-1">
                <Star size={18} className="fill-yellow-400 text-yellow-400" />
                4.8
              </div>
            </div>
          </div>

          <div className="flex items-center text-3xl font-bold text-green-700">
            <IndianRupee size={28} />

            {turf.pricePerHour}

            <span className="ml-1 text-base text-slate-500">/hour</span>
          </div>
        </div>

        <div className="mt-8 border-t pt-8">
          <h2 className="text-xl font-semibold">About this venue</h2>

          <p className="mt-4 leading-8 text-slate-600">{turf.description}</p>
        </div>
      </div>
    </Card>
  );
}

export default TurfInfo;
