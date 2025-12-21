import QRCode from "qrcode";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const data = searchParams.get("data");

  if (!data) {
    return new Response("Missing data", { status: 400 });
  }

  const png = await QRCode.toBuffer(data, {
    type: "png",
    margin: 1,
    scale: 6,
    color: {
      dark: "#0f172a",
      light: "#ffffff",
    },
  });

  const body = new Uint8Array(png);
  return new Response(body, {
    headers: {
      "Content-Type": "image/png",
      "Cache-Control": "public, max-age=86400",
    },
  });
}
