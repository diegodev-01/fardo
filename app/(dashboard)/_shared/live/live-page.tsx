import LiveClient from "./live-client";

export default function LivePage() {
  return (
    <div className="flex flex-col w-full h-full p-4 sm:p-6 bg-background overflow-y-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-text">Transmisión en vivo</h1>
        <p className="text-text/60 text-sm mt-1">
          Conecta tu TikTok Live, detecta los &quot;mío&quot; y confirma, reasigna, libera o cobra cada prenda.
        </p>
      </div>
      <LiveClient />
    </div>
  );
}
