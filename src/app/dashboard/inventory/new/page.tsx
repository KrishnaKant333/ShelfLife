import AddProductFlow from "@/components/dashboard/AddProductFlow";

export default function NewInventoryItemPage() {
  return (
    <main className="p-6 md:p-8 lg:p-10">
      <AddProductFlow isBusiness={false} />
    </main>
  );
}