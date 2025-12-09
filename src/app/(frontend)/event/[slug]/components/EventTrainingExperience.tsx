import { CollapsibleCard } from "./CollapsibleCard";

interface EventTrainingExperienceProps {
  event: any;
}

export function EventTrainingExperience({
  event,
}: EventTrainingExperienceProps) {
  const trainingExperienceItems = event["Training Experience"] || [];

  if (trainingExperienceItems.length === 0) return null;

  return (
    <section className="mt-8">
      <h2 className="mb-8 text-center text-3xl font-bold">
        OUR ONLINE TRAINING EXPERIENCE INCLUDE
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {trainingExperienceItems.map((item: any, index: number) => (
          <CollapsibleCard
            key={index}
            title={item.Title}
            description={item.Description}
            isOpen={index === 0} // Open first item by default
          />
        ))}
      </div>
    </section>
  );
}
