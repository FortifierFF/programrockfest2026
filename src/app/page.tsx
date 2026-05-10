import { ScheduleViewer } from "@/components/ScheduleViewer";

export default function Home() {
  return (
    // flex-1 min-h-0: fill the body flex column so the viewer gets a bounded height (needed for overflow scroll + wheel).
    <div className="flex min-h-0 flex-1 flex-col bg-zinc-100 text-zinc-900 dark:bg-zinc-950 dark:text-zinc-50">
      <ScheduleViewer />
    </div>
  );
}
