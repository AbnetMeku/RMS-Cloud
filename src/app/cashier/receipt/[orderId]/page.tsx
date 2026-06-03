import { notFound } from "next/navigation";
import { requireRouteAccess } from "@/lib/route-guard";
import { requireTenantId } from "@/lib/tenant";
import { money } from "@/lib/utils";
import { getOrderForReceipt } from "@/modules/cashier/service";

export default async function ReceiptPage({ params }: { params: Promise<{ orderId: string }> }) {
  const session = await requireRouteAccess("/cashier");
  const tenantId = requireTenantId(session);
  const { orderId } = await params;
  const order = await getOrderForReceipt(tenantId, orderId);
  if (!order) notFound();

  const paid = order.payments.reduce((s, p) => s + Number(p.amount), 0);

  return (
    <div className="mx-auto max-w-md bg-white p-8 print:p-4">
      <div className="text-center">
        <h1 className="text-xl font-bold">{order.tenant.name}</h1>
        <p className="text-sm text-slate-500">{order.tenant.branchName}</p>
        <p className="text-xs text-slate-400">{order.tenant.address}</p>
      </div>
      <div className="mt-6 space-y-1 border-b pb-4 text-sm">
        <p>Table: {order.table.name}</p>
        <p>Waiter: {order.waiter.name}</p>
        <p>Order: {order.id.slice(-8).toUpperCase()}</p>
        <p>Date: {order.closedAt?.toLocaleString() ?? order.createdAt.toLocaleString()}</p>
      </div>
      <div className="mt-4 space-y-2 text-sm">
        {order.items.map((item) => (
          <div key={item.id} className="flex justify-between">
            <span>{item.quantity}x {item.menuItem.name}</span>
            <span>{money(Number(item.totalPrice), order.tenant.currency)}</span>
          </div>
        ))}
      </div>
      <div className="mt-4 space-y-1 border-t pt-4 text-sm">
        <div className="flex justify-between"><span>Subtotal</span><span>{money(Number(order.subtotal), order.tenant.currency)}</span></div>
        <div className="flex justify-between"><span>Tax</span><span>{money(Number(order.taxTotal), order.tenant.currency)}</span></div>
        <div className="flex justify-between"><span>Service</span><span>{money(Number(order.serviceChargeTotal), order.tenant.currency)}</span></div>
        {Number(order.discountTotal) > 0 && (
          <div className="flex justify-between"><span>Discount</span><span>-{money(Number(order.discountTotal), order.tenant.currency)}</span></div>
        )}
        <div className="flex justify-between text-base font-bold"><span>Total</span><span>{money(Number(order.grandTotal), order.tenant.currency)}</span></div>
        <div className="flex justify-between"><span>Paid</span><span>{money(paid, order.tenant.currency)}</span></div>
      </div>
      <div className="mt-6 text-center text-xs text-slate-400">Thank you!</div>
      <script dangerouslySetInnerHTML={{ __html: "if (typeof window !== 'undefined') window.print();" }} />
    </div>
  );
}
