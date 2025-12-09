import { Users, UserCheck, Target, Award } from "lucide-react";

interface EventWhoIsTrainingForProps {
  event: any;
}

export function EventWhoIsTrainingFor({ event }: EventWhoIsTrainingForProps) {
  const audienceItems = event["Who Is Training For"] || [];

  if (audienceItems.length === 0) return null;

  return (
    <section className="mt-8">
      <div className="mb-12 text-center">
        <h2 className="mb-4 text-3xl font-bold text-gray-900">
          WHO IS THIS TRAINING FOR?
        </h2>
        <p className="mx-auto max-w-2xl text-lg text-gray-600">
          Designed for professionals who want to enhance their expertise and
          advance their careers
        </p>
      </div>

      <div className="grid cursor-default grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
        {audienceItems.map((item: any, index: number) => (
          <div
            key={index}
            className="border-secondary/20 hover:border-secondary/40 relative overflow-hidden rounded-lg border bg-gradient-to-br from-white p-4 transition-all duration-300 hover:shadow-sm"
          >
            {/* Content */}
            <div className="relative">
              <h3 className="font-semibold text-gray-900 text-base leading-tight">
                {item.item}
              </h3>

              {/* Decorative line */}
              <div className="from-secondary to-secondary/50 mt-2 h-1 w-8 rounded-full bg-gradient-to-r transition-all duration-300"></div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
