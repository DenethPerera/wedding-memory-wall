import { Suspense } from "react";
import PinForm from "@/components/PinForm";

export default function AdminEnterPage() {
  return (
    <Suspense>
      <PinForm
        endpoint="/api/admin-gate"
        title="Couple's dashboard"
        subtitle="Enter the admin code to view and download all uploads."
        defaultNext="/admin"
        pinLabel="Admin code"
      />
    </Suspense>
  );
}
