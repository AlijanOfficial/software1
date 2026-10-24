/** Google Places API (New): official, legal source of business data. Max 60 results per search (API limit). */
export async function searchPlaces(q: string, max: number) {
  const out: any[] = []; let token: string | undefined;
  while (out.length < max) {
    const r = await fetch("https://places.googleapis.com/v1/places:searchText", {
      method: "POST",
      headers: { "Content-Type": "application/json", "X-Goog-Api-Key": process.env.GOOGLE_PLACES_API_KEY!, "X-Goog-FieldMask": "places.id,places.displayName,places.formattedAddress,places.nationalPhoneNumber,places.websiteUri,places.rating,nextPageToken" },
      body: JSON.stringify({ textQuery: q, pageSize: Math.min(20, max - out.length), ...(token ? { pageToken: token } : {}) }),
    });
    if (!r.ok) throw new Error("Places API " + r.status);
    const j = await r.json(); out.push(...(j.places || [])); token = j.nextPageToken; if (!token) break;
  }
  return out.slice(0, max);
}
