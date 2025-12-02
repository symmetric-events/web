import Image from "next/image";

interface EventHeaderProps {
  event: any;
}

export function EventHeader({ event }: EventHeaderProps) {
  const getImageUrl = (event: any): string | undefined => {
    const img = event?.["Featured Image"];
    if (!img) return undefined;
    if (typeof img === "string") return undefined;
    return img.url || img.filename || undefined;
  };

  const imageUrl = getImageUrl(event);

  return (
    <div className="mt-8">
      <div className="mx-auto py-8">
        <Image
          src={
            event["Featured Image"] 
          }
          alt={event.Title || "Event image"}
          width={1000}
          height={1000}
          className="h-full w-full object-cover"
        />
        <h1 className="mt-6 text-2xl font-bold text-gray-900">{event.Title}</h1>
      </div>
    </div>
  );
}
