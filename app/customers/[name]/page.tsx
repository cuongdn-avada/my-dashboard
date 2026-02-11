import { fetchAllSheets } from "@/lib/data";
import { CustomerDetailClient } from "./customer-detail-client";

export const revalidate = 3600;

interface CustomerPageProps {
  params: Promise<{ name: string }>;
}

export default async function CustomerPage({ params }: CustomerPageProps) {
  const { name } = await params;
  const decodedName = decodeURIComponent(name);
  const { orders } = await fetchAllSheets();
  const customerOrders = orders.filter(
    (o) => o.customerName.toLowerCase() === decodedName.toLowerCase()
  );

  return (
    <CustomerDetailClient
      customerName={decodedName}
      orders={customerOrders}
    />
  );
}
