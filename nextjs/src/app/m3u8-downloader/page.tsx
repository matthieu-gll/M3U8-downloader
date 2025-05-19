import { DownloadForm } from "@/components/DownloadForm/DownloadForm";

export default function Page() {
  return (
    <div className="max-w-lg mx-auto my-32">
      <h1 className="mb-8 text-4xl">Download M3U8 file and convert it to .mp4</h1>
      <DownloadForm />
    </div>
  );
}
