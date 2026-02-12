import { ImageResponse } from "next/og";

export const alt = "Carpe Diem – Film Photography Archive";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          display: "flex",
          width: "100%",
          height: "100%",
          background: "#0a0a0a",
          alignItems: "center",
          justifyContent: "center",
          flexDirection: "column",
          gap: 16,
        }}
      >
        <span
          style={{
            fontSize: 96,
            fontWeight: 700,
            color: "white",
            letterSpacing: "-0.03em",
          }}
        >
          Carpe Diem
        </span>
        <span
          style={{
            fontSize: 28,
            color: "rgba(255,255,255,0.55)",
          }}
        >
          Film Photography Archive
        </span>
      </div>
    ),
    { ...size }
  );
}
