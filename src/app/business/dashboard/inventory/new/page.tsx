import AddProductFlow from "@/components/dashboard/AddProductFlow";

export default function BusinessAddProductPage() {
  return (
    <main className="p-4 sm:p-6 md:p-8 lg:p-10">
      <AddProductFlow isBusiness={true} />
    </main>
  );
}