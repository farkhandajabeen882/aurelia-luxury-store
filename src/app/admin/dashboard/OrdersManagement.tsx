
"use client";

import { useCallback, useEffect, useState } from "react";
import {
  CheckCircle2,
  ChevronDown,
  Clock3,
  Loader2,
  PackageCheck,
  RefreshCw,
  ShoppingBag,
  Truck,
} from "lucide-react";

type OrderItem = {
  id: number;
  product_id: number | null;
  product_name: string;
  quantity: number;
  unit_price: number | string;
  subtotal: number | string;
};

type Order = {
  id: number;
  customer_name: string;
  customer_email: string;
  shipping_address: string | null;
  total_amount: number | string;
  status: string;
  payment_status: string;
  created_at: string;
  items: OrderItem[];
};

const statuses = [
  "pending",
  "processing",
  "shipped",
  "delivered",
  "cancelled",
];

function formatMoney(value: number | string) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(Number(value));
}

function formatDate(value: string) {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "Date unavailable";
  }

  return date.toLocaleString("en-AU", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function statusStyle(status: string) {
  switch (status) {
    case "delivered":
      return "bg-emerald-100 text-emerald-700";
    case "shipped":
      return "bg-blue-100 text-blue-700";
    case "processing":
      return "bg-amber-100 text-amber-800";
    case "cancelled":
      return "bg-red-100 text-red-700";
    default:
      return "bg-slate-100 text-slate-700";
  }
}

export default function OrdersManagement() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState<number | null>(null);
  const [expandedId, setExpandedId] = useState<number | null>(null);
  const [selectedStatuses, setSelectedStatuses] = useState<
    Record<number, string>
  >({});
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  const loadOrders = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const response = await fetch("/api/admin/orders", {
        cache: "no-store",
        credentials: "same-origin",
      });

      if (response.status === 401) {
        window.location.href = "/admin";
        return;
      }

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.message || "Unable to load orders.");
      }

      const loadedOrders = data.orders as Order[];

      setOrders(loadedOrders);
      setSelectedStatuses(
        Object.fromEntries(
          loadedOrders.map((order) => [order.id, order.status])
        )
      );
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Unable to load orders."
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadOrders();
  }, [loadOrders]);

  async function updateStatus(order: Order) {
    const newStatus = selectedStatuses[order.id] || order.status;

    if (newStatus === order.status) {
      return;
    }

    setUpdatingId(order.id);
    setError("");
    setNotice("");

    try {
      const response = await fetch("/api/admin/orders", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "same-origin",
        body: JSON.stringify({
          id: order.id,
          status: newStatus,
        }),
      });

      if (response.status === 401) {
        window.location.href = "/admin";
        return;
      }

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(
          data.message || "Unable to update order status."
        );
      }

      setOrders((previous) =>
        previous.map((item) =>
          item.id === order.id
            ? { ...item, status: newStatus }
            : item
        )
      );

      setNotice(
        `Order AUR-${String(order.id).padStart(6, "0")} updated to ${newStatus}.`
      );
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Unable to update order status."
      );
    } finally {
      setUpdatingId(null);
    }
  }

  const totalOrders = orders.length;
  const pendingOrders = orders.filter(
    (order) => order.status === "pending"
  ).length;
  const shippedOrders = orders.filter(
    (order) => order.status === "shipped"
  ).length;
  const deliveredOrders = orders.filter(
    (order) => order.status === "delivered"
  ).length;

  const summaryCards = [
    {
      label: "TOTAL ORDERS",
      value: totalOrders,
      icon: ShoppingBag,
      background: "bg-[#E8EEFF]",
      color: "text-[#1739BA]",
    },
    {
      label: "PENDING ORDERS",
      value: pendingOrders,
      icon: Clock3,
      background: "bg-[#FFF0C0]",
      color: "text-[#946500]",
    },
    {
      label: "SHIPPED ORDERS",
      value: shippedOrders,
      icon: Truck,
      background: "bg-[#E8EEFF]",
      color: "text-[#1739BA]",
    },
    {
      label: "DELIVERED ORDERS",
      value: deliveredOrders,
      icon: PackageCheck,
      background: "bg-[#E3F7F2]",
      color: "text-[#087963]",
    },
  ];

  return (
    <section className="mt-14 space-y-8">
      <div className="flex flex-wrap items-end justify-between gap-5">
        <div>
          <p className="mb-3 text-xs font-black tracking-[0.2em] text-[#1739BA]">
            CUSTOMER EXPERIENCE
          </p>

          <h2 className="text-3xl font-black tracking-[-0.06em] text-[#111B35] sm:text-5xl">
            ORDERS{" "}
            <span className="text-[#1739BA]">MANAGEMENT.</span>
          </h2>

          <p className="mt-4 text-sm leading-7 text-slate-500">
            Review customer purchases and manage demo order
            statuses directly from NeonDB.
          </p>
        </div>

        <button
          type="button"
          onClick={() => void loadOrders()}
          disabled={loading}
          className="inline-flex items-center gap-3 border border-blue-200 bg-white px-6 py-4 text-xs font-black tracking-wider text-[#1739BA] disabled:opacity-60"
        >
          <RefreshCw size={18} />
          REFRESH ORDERS
        </button>
      </div>

      {notice && (
        <div
          role="status"
          className="flex items-center gap-3 border border-emerald-200 bg-emerald-50 p-5 text-sm font-semibold text-emerald-700"
        >
          <CheckCircle2 size={20} />
          {notice}
        </div>
      )}

      {error && (
        <div
          role="alert"
          className="border border-red-200 bg-red-50 p-5 text-sm font-semibold text-red-700"
        >
          {error}
        </div>
      )}

      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {summaryCards.map((card) => {
          const Icon = card.icon;

          return (
            <div
              key={card.label}
              className="border border-blue-100 bg-white p-6 shadow-sm"
            >
              <div
                className={`flex h-12 w-12 items-center justify-center ${card.background} ${card.color}`}
              >
                <Icon size={24} />
              </div>

              <p className="mt-6 text-[11px] font-black tracking-widest text-slate-500">
                {card.label}
              </p>

              <p className="mt-3 text-4xl font-black text-[#1739BA]">
                {loading ? "—" : card.value}
              </p>
            </div>
          );
        })}
      </div>

      <div className="overflow-hidden border border-blue-100 bg-white shadow-sm">
        <div className="border-b border-blue-100 bg-[#1739BA] px-7 py-7 text-white">
          <p className="text-[11px] font-black tracking-[0.2em] text-[#FFE59B]">
            AURELIA ORDER RECORDS
          </p>

          <h3 className="mt-3 text-2xl font-black">
            Customer Orders
          </h3>

          <p className="mt-2 text-sm text-blue-100">
            Demo orders only. No real payments or deliveries.
          </p>
        </div>

        {loading ? (
          <div className="flex items-center justify-center gap-3 p-16 text-[#1739BA]">
            <Loader2 size={23} className="animate-spin" />
            Loading customer orders...
          </div>
        ) : orders.length === 0 ? (
          <div className="p-16 text-center">
            <ShoppingBag
              size={40}
              className="mx-auto text-[#1739BA]"
            />

            <p className="mt-5 text-lg font-bold text-[#111B35]">
              No orders found.
            </p>

            <p className="mt-3 text-sm text-slate-500">
              Customer demo orders will appear here.
            </p>
          </div>
        ) : (
          <div className="divide-y divide-blue-100">
            {orders.map((order) => {
              const isExpanded = expandedId === order.id;
              const selectedStatus =
                selectedStatuses[order.id] || order.status;

              return (
                <div key={order.id} className="p-6 sm:p-8">
                  <div className="flex flex-wrap items-start justify-between gap-6">
                    <div>
                      <p className="text-xs font-black tracking-widest text-[#1739BA]">
                        ORDER REFERENCE
                      </p>

                      <h4 className="mt-2 text-2xl font-black text-[#111B35]">
                        AUR-{String(order.id).padStart(6, "0")}
                      </h4>

                      <p className="mt-3 font-bold text-[#111B35]">
                        {order.customer_name}
                      </p>

                      <p className="mt-1 break-all text-sm text-slate-500">
                        {order.customer_email}
                      </p>

                      <p className="mt-2 text-xs text-slate-400">
                        {formatDate(order.created_at)}
                      </p>
                    </div>

                    <div className="text-left sm:text-right">
                      <p className="text-xs font-bold text-slate-500">
                        ORDER TOTAL
                      </p>

                      <p className="mt-2 text-3xl font-black text-[#1739BA]">
                        {formatMoney(order.total_amount)}
                      </p>

                      <span
                        className={`mt-3 inline-block px-3 py-2 text-xs font-black uppercase ${statusStyle(order.status)}`}
                      >
                        {order.status}
                      </span>

                      <p className="mt-3 text-xs text-slate-500">
                        Payment:{" "}
                        <span className="font-bold uppercase">
                          {order.payment_status}
                        </span>
                      </p>
                    </div>
                  </div>

                  <div className="mt-7 flex flex-wrap items-end gap-3 border-t border-slate-100 pt-6">
                    <label className="text-xs font-bold text-[#111B35]">
                      UPDATE ORDER STATUS
                      <select
                        value={selectedStatus}
                        disabled={updatingId === order.id}
                        onChange={(event) =>
                          setSelectedStatuses((previous) => ({
                            ...previous,
                            [order.id]: event.target.value,
                          }))
                        }
                        className="mt-3 block min-w-44 border border-blue-200 bg-white px-4 py-3 text-sm font-medium text-[#111B35]"
                      >
                        {statuses.map((status) => (
                          <option key={status} value={status}>
                            {status.toUpperCase()}
                          </option>
                        ))}
                      </select>
                    </label>

                    <button
                      type="button"
                      onClick={() => void updateStatus(order)}
                      disabled={
                        updatingId !== null ||
                        selectedStatus === order.status
                      }
                      className="inline-flex min-h-12 items-center gap-2 bg-[#1739BA] px-6 py-3 text-xs font-black tracking-wider text-white disabled:cursor-not-allowed disabled:opacity-40"
                    >
                      {updatingId === order.id && (
                        <Loader2
                          size={16}
                          className="animate-spin"
                        />
                      )}
                      SAVE STATUS
                    </button>

                    <button
                      type="button"
                      onClick={() =>
                        setExpandedId(
                          isExpanded ? null : order.id
                        )
                      }
                      aria-expanded={isExpanded}
                      className="inline-flex min-h-12 items-center gap-2 border border-blue-200 px-5 py-3 text-xs font-bold text-[#1739BA]"
                    >
                      ORDER DETAILS
                      <ChevronDown
                        size={17}
                        className={
                          isExpanded ? "rotate-180" : ""
                        }
                      />
                    </button>
                  </div>

                  {isExpanded && (
                    <div className="mt-6 grid gap-6 bg-[#F4F7FF] p-6 lg:grid-cols-2">
                      <div>
                        <h5 className="text-xs font-black tracking-widest text-[#1739BA]">
                          PURCHASED PRODUCTS
                        </h5>

                        <div className="mt-4 space-y-3">
                          {order.items.map((item) => (
                            <div
                              key={item.id}
                              className="border border-blue-100 bg-white p-4"
                            >
                              <p className="font-bold text-[#111B35]">
                                {item.product_name}
                              </p>

                              <p className="mt-2 text-sm text-slate-500">
                                Quantity: {item.quantity}
                              </p>

                              <p className="mt-1 text-sm font-bold text-[#1739BA]">
                                {formatMoney(item.subtotal)}
                              </p>
                            </div>
                          ))}
                        </div>
                      </div>

                      <div>
                        <h5 className="text-xs font-black tracking-widest text-[#1739BA]">
                          SHIPPING ADDRESS
                        </h5>

                        <p className="mt-4 whitespace-pre-wrap text-sm leading-7 text-slate-600">
                          {order.shipping_address ||
                            "Address unavailable"}
                        </p>

                        <div className="mt-6 border border-[#FFE59B] bg-white p-4">
                          <p className="text-xs font-bold leading-6 text-slate-600">
                            Portfolio demonstration only.
                            No payment is collected and
                            no physical order is shipped.
                          </p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
}
