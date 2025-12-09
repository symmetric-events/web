import { InfoCard } from './InfoCard'

interface EventWhyAttendProps {
  event: any;
}

export function EventWhyAttend({ event }: EventWhyAttendProps) {
  const whyAttendItems = event["Why Attend"] || [];

  if (whyAttendItems.length === 0) return null;

  return (
    <section className="mt-8">
      <h2 className="mb-8 text-center text-3xl font-bold text-gray-900">
        WHY SHOULD YOU ATTEND?
      </h2>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-3 lg:grid-cols-4">
        {whyAttendItems.map((item: any, index: number) => (
          <InfoCard
            key={index}
            title={item.Title}
            description={item.Description}
          />
        ))}
      </div>
    </section>
  );
}
