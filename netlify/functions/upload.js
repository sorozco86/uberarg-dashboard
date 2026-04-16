import { getStore } from "@netlify/blobs";
import XLSX from "xlsx";

function normalize(v) {
  return v == null ? "" : String(v).trim();
}

function titleCase(v) {
  return normalize(v)
    .toLowerCase()
    .split(/\s+/)
    .map(w => w ? w[0].toUpperCase() + w.slice(1) : "")
    .join(" ");
}

function sentenceCase(v) {
  const clean = normalize(v)
    .replace(/\s+/g, " ")
    .replace(/\s+([,.;:!?])/g, "$1")
    .trim();
  return clean ? clean[0].toUpperCase() + clean.slice(1) : "";
}

export default async (req) => {
  try {
    const buffer = await req.arrayBuffer();

    const workbook = XLSX.read(buffer, { type: "array" });
    const ws = workbook.Sheets[workbook.SheetNames[0]];
    const rows = XLSX.utils.sheet_to_json(ws, { header: 1, defval: "" });

    const data = rows
      .slice(1)
      .filter(r => r.some(cell => String(cell).trim() !== ""))
      .map(r => ({
        storeCode: normalize(r[3]),           // Col D
        baseStore: normalize(r[4]),           // Col E
        zone: normalize(r[6]),                // Col G
        date: normalize(r[7]),                // Col H
        store: titleCase(r[9]),               // Col J
        restaurantType: normalize(r[10]),     // Col K
        otherType: titleCase(r[11]),          // Col L
        facadePhoto: normalize(r[12]),        // Col M
        contactReached: normalize(r[13]),     // Col N
        flyerDelivered: normalize(r[14]),     // Col O
        flyerPhoto: normalize(r[15]),         // Col P
        proposalUnderstood: normalize(r[16]), // Col Q
        competition: normalize(r[17]),        // Col R
        competitionMaterial: normalize(r[18]),// Col S
        compPhoto1: normalize(r[19]),         // Col T
        compPhoto2: normalize(r[20]),         // Col U
        compPhoto3: normalize(r[21]),         // Col V
        comments: sentenceCase(r[22])         // Col W
      }));

    const payload = {
      updatedAt: new Date().toISOString(),
      rows: data
    };

    const store = getStore("dashboard");
    await store.set("latest", JSON.stringify(payload));

    return new Response(
      JSON.stringify({
        ok: true,
        rows: data.length,
        updatedAt: payload.updatedAt
      }),
      {
        headers: { "Content-Type": "application/json" }
      }
    );

  } catch (error) {
    return new Response(
      JSON.stringify({
        ok: false,
        error: "No se pudo procesar el Excel"
      }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" }
      }
    );
  }
};