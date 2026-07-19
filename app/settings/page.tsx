import { sampleUserSettings } from "../../lib/mock/sampleData";
import { SettingsForm } from "../components/SettingsForm";

export default function SettingsPage() {
  return (
    <main className="mx-auto max-w-md space-y-6 p-4">
      <h1 className="text-lg font-semibold">設定</h1>
      <SettingsForm initialSettings={sampleUserSettings} />
    </main>
  );
}
