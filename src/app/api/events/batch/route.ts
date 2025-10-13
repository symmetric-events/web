import { NextRequest, NextResponse } from "next/server";
import { getPayload } from "payload";
import config from "~/payload.config";

export async function POST(request: NextRequest) {
  try {
    const { slugs } = await request.json();
    
    if (!Array.isArray(slugs)) {
      return NextResponse.json({ error: "Invalid request format" }, { status: 400 });
    }

    const payload = await getPayload({ config: await config });
    const eventDataMap: Record<string, any> = {};

    // Fetch all events in parallel
    const eventPromises = slugs.map(async (slug: string) => {
      try {
        const eventRes = await payload.find({
          collection: "events",
          where: {
            slug: {
              equals: slug,
            },
          },
          depth: 2,
          limit: 1,
        });

        if (eventRes.docs.length > 0) {
          const event = eventRes.docs[0];
          if (event) {
            return {
              slug,
              data: {
                id: event.id,
                title: event.Title,
                slug: event.slug,
                eventDates: event["Event Dates"] || [],
                price: event.Price || {},
              }
            };
          }
        }
        return null;
      } catch (error) {
        console.error(`Failed to fetch event data for ${slug}:`, error);
        return null;
      }
    });

    const results = await Promise.all(eventPromises);
    
    // Build the event data map
    results.forEach((result) => {
      if (result) {
        eventDataMap[result.slug] = result.data;
      }
    });

    return NextResponse.json(eventDataMap);
  } catch (error) {
    console.error("Error fetching events:", error);
    return NextResponse.json(
      { error: "Failed to fetch event data" },
      { status: 500 }
    );
  }
}
