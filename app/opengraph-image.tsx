import { ImageResponse } from "next/og";
import { readFile } from "node:fs/promises";
import path from "node:path";

// Default social share image, inherited by every route that doesn't
// define its own opengraph-image. Uses the site's self-hosted fonts.

export const alt = "Creative Milk — Intelligence that actually works";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function OpengraphImage() {
  const [cormorant, dmMono] = await Promise.all([
    readFile(
      path.join(process.cwd(), "public/fonts/CormorantGaramond-Light.ttf")
    ),
    readFile(path.join(process.cwd(), "public/fonts/DMMono-Regular.ttf")),
  ]);

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          background: "#0f1526",
          padding: "72px 80px",
        }}
      >
        <div
          style={{
            fontFamily: "DM Mono",
            fontSize: 26,
            letterSpacing: "0.25em",
            color: "#c9a84c",
            textTransform: "uppercase",
          }}
        >
          Creative Milk
        </div>
        <div
          style={{
            fontFamily: "Cormorant Garamond",
            fontSize: 92,
            lineHeight: 1.05,
            color: "#f5f0e8",
            maxWidth: 980,
          }}
        >
          Intelligence that actually works.
        </div>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            fontFamily: "DM Mono",
            fontSize: 24,
            color: "rgba(245, 240, 232, 0.7)",
          }}
        >
          <div>AI systems for Australian businesses</div>
          <div style={{ color: "#c9a84c" }}>creative-milk.com.au</div>
        </div>
      </div>
    ),
    {
      ...size,
      fonts: [
        {
          name: "Cormorant Garamond",
          data: cormorant,
          weight: 300,
          style: "normal",
        },
        { name: "DM Mono", data: dmMono, weight: 400, style: "normal" },
      ],
    }
  );
}
