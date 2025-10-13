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
            imageUrl ||
            "https://www.symmetric.events/wp-content/uploads/2025/08/SYM_062_1200x350_web-HDR.jpg"
          }
          alt={event.Title || "Event image"}
          width={1000}
          height={1000}
          className="h-full w-full object-cover"
        />
        <h1 className="mt-6 text-4xl font-bold text-gray-900">{event.Title}</h1>
      </div>
    </div>
  );
}
