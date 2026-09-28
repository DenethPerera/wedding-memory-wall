import { Suspense } from "react";
import PinForm from "@/components/PinForm";
import { EVENT } from "@/lib/event-config";

export default function EnterPage() {
  return (
    <Suspense>
      <PinForm
        endpoint="/api/gate"
        title={EVENT.coupleNames}
        subtitle="Enter the code from your invitation to open the memory wall."
        defaultNext="/"
      />
    </Suspense>
  );
}
