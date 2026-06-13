import { useNavigate } from "react-router-dom";

import Section from "../ui/Section";
import SportCard from "../ui/SportCard";

import { SPORTS } from "../../constants/sports";

function SportsCategoriesSection() {
  const navigate = useNavigate();

  const handleSportClick = (sport) => {
    // Sprint 3:
    // Later this will navigate with filters.
    // Example:
    // navigate(`/turfs?sport=${sport.value}`);

    navigate("/turfs");
  };

  return (
    <Section className="bg-white">
      <div className="text-center">
        <p className="font-semibold uppercase tracking-widest text-green-600">
          Sports
        </p>

        <h2 className="mt-3 text-4xl font-bold text-slate-900">
          Choose Your Game
        </h2>

        <p className="mx-auto mt-4 max-w-2xl text-lg text-slate-600">
          Discover premium sports venues tailored for your favorite game.
        </p>
      </div>

      <div className="mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {SPORTS.map((sport) => (
          <SportCard key={sport.id} sport={sport} onClick={handleSportClick} />
        ))}
      </div>
    </Section>
  );
}

export default SportsCategoriesSection;
