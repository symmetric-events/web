import { Square } from "lucide-react";

interface EventKeyTopicsProps {
  event: any;
}

export function EventKeyTopics({ event }: EventKeyTopicsProps) {
  const keyTopics = event["Key Topic"] || [];

  if (keyTopics.length === 0) return null;

  return (
    <section className="mt-8">
      <h2 className="mb-8 text-center text-3xl font-bold text-gray-900">
        KEY TOPICS
      </h2>

      <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
        {keyTopics.map((topic: any, index: number) => (
          <div
            key={index}
            className="border-secondary/20 bg-secondary/5 hover:border-secondary/30 hover:bg-secondary/10 flex cursor-default items-center gap-3 rounded-lg border p-3 transition-all duration-200 hover:shadow-sm"
          >
            <div className="text-secondary flex-shrink-0 rounded-md p-1">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 640 640"
                className="h-5 w-5 fill-current"
              >
                <path d="M288.3 61.5C308.1 50.1 332.5 50.1 352.3 61.5L528.2 163C548 174.4 560.2 195.6 560.2 218.4L560.2 421.4C560.2 444.3 548 465.4 528.2 476.8L352.3 578.5C332.5 589.9 308.1 589.9 288.3 578.5L112.5 477C92.7 465.6 80.5 444.4 80.5 421.6L80.5 218.6C80.5 195.7 92.7 174.6 112.5 163.2L288.3 61.5zM496.1 421.5L496.1 255.4L352.3 338.4L352.3 504.5L496.1 421.5z" />
              </svg>
            </div>
            <span className="font-medium text-gray-800">{topic.item}</span>
          </div>
        ))}
      </div>
    </section>
  );
}
