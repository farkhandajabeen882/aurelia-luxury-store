
"use client";

import { useEffect, useMemo, useState, type FormEvent } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  CreditCard,
  Loader2,
  LockKeyhole,
  Mail,
  MapPin,
  Package,
  ShieldCheck,
  ShoppingBag,
  Sparkles,
  Truck,
  UserRound,
} from "lucide-react";

type CheckoutCartItem = {
  id: number;
  quantity: number;
};

type Product = {
  id: number;
  name: string;
  price: string | number;
  image_url: string | null;
  stock_quantity: number;
  category: string | null;
};

type CustomerForm = {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  address: string;
  apartment: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
  notes: string;
};

const STORAGE_KEY = "aurelia_checkout_cart";

const initialForm: CustomerForm = {
  firstName: "",
  lastName: "",
  email: "",
  phone: "",
  address: "",
  apartment: "",
  city: "",
  state: "",
  postalCode: "",
  country: "",
  notes: "",
};

function formatPrice(value: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(value);
}

export default function CheckoutPage() {
  const [form, setForm] = useState<CustomerForm>(initialForm);
  const [cart, setCart] = useState<CheckoutCartItem[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [orderNumber, setOrderNumber] = useState<string | null>(
    null
  );

  useEffect(() => {
    let active = true;

    async function loadCheckout() {
      try {
        const saved = window.localStorage.getItem(STORAGE_KEY);

        if (saved) {
          const parsed: unknown = JSON.parse(saved);

          if (Array.isArray(parsed)) {
            const validItems: CheckoutCartItem[] = parsed
              .filter(
                (item): item is CheckoutCartItem =>
                  typeof item === "object" &&
                  item !== null &&
                  Number.isSafeInteger(item.id) &&
                  item.id > 0 &&
                  Number.isSafeInteger(item.quantity) &&
                  item.quantity > 0
              )
              .map((item) => ({
                id: item.id,
                quantity: item.quantity,
              }));

            if (active) {
              setCart(validItems);
            }
          }
        }

        const response = await fetch("/api/products", {
          cache: "no-store",
        });

        const data = await response.json();

        if (!response.ok || !data.success) {
          throw new Error("Unable to load product details.");
        }

        if (active) {
          setProducts(data.products || []);
        }
      } catch (err) {
        if (active) {
          setError(
            err instanceof Error
              ? err.message
              : "Unable to prepare checkout."
          );
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    }

    void loadCheckout();

    return () => {
      active = false;
    };
  }, []);

  const checkoutItems = useMemo(() => {
    return cart
      .map((cartItem) => {
        const product = products.find(
          (item) => item.id === cartItem.id
        );

        if (!product) {
          return null;
        }

        return {
          ...product,
          quantity: Math.min(
            cartItem.quantity,
            Math.max(0, Number(product.stock_quantity))
          ),
        };
      })
      .filter(
        (
          item
        ): item is Product & { quantity: number } =>
          item !== null && item.quantity > 0
      );
  }, [cart, products]);

  const subtotal = checkoutItems.reduce(
    (total, item) =>
      total + Number(item.price) * item.quantity,
    0
  );

  // Shipping is free in this portfolio demo.
  // Live shipping charges can be added later.
  const shipping = 0;
  const total = subtotal + shipping;

  const totalItems = checkoutItems.reduce(
    (sum, item) => sum + item.quantity,
    0
  );

  function updateField(
    field: keyof CustomerForm,
    value: string
  ) {
    setForm((previous) => ({
      ...previous,
      [field]: value,
    }));

    if (error) {
      setError("");
    }
  }

  async function handleSubmit(
    event: FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();
    setError("");

    if (checkoutItems.length === 0) {
      setError(
        "Your shopping bag is empty. Please add products first."
      );
      return;
    }

    if (
      !form.firstName.trim() ||
      !form.lastName.trim() ||
      !form.email.trim() ||
      !form.phone.trim() ||
      !form.address.trim() ||
      !form.city.trim() ||
      !form.state.trim() ||
      !form.postalCode.trim() ||
      !form.country.trim()
    ) {
      setError("Please complete all required delivery fields.");
      return;
    }

    setSubmitting(true);

    try {
      const response = await fetch("/api/orders", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          customer: {
            firstName: form.firstName.trim(),
            lastName: form.lastName.trim(),
            email: form.email.trim(),
            phone: form.phone.trim(),
          },
          shipping: {
            address: form.address.trim(),
            apartment: form.apartment.trim(),
            city: form.city.trim(),
            state: form.state.trim(),
            postalCode: form.postalCode.trim(),
            country: form.country.trim(),
            notes: form.notes.trim(),
          },
          items: checkoutItems.map((item) => ({
            productId: item.id,
            quantity: item.quantity,
          })),
          paymentMethod: "demo",
        }),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(
          data.message || "Unable to place your order."
        );
      }

      const reference = String(
        data.orderNumber ?? data.orderId ?? ""
      );

      setOrderNumber(reference || "CONFIRMED");
      setCart([]);
      window.localStorage.removeItem(STORAGE_KEY);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Order submission failed. Please try again."
      );
    } finally {
      setSubmitting(false);
    }
  }

  const inputClass =
    "mt-2 w-full rounded-none border border-[#D7E1FC] bg-white px-4 py-4 text-sm text-[#111B35] outline-none transition-colors placeholder:text-slate-400 focus:border-[#1739BA]";

  const labelClass =
    "block text-xs font-extrabold uppercase tracking-[0.12em] text-[#111B35]";

  if (orderNumber) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#F4F7FF] px-5 py-16">
        <section className="w-full max-w-2xl border border-blue-100 bg-white px-7 py-16 text-center shadow-xl shadow-blue-100/50 sm:px-16">
          <div className="mx-auto mb-8 flex h-20 w-20 items-center justify-center rounded-full bg-emerald-50 text-emerald-600">
            <CheckCircle2 size={42} />
          </div>

          <p className="mb-4 text-xs font-black uppercase tracking-[0.25em] text-[#1739BA]">
            AURELIA ORDER CONFIRMATION
          </p>

          <h1 className="text-4xl font-black tracking-[-0.05em] text-[#111B35] sm:text-5xl">
            ORDER
            <br />
            <span className="text-[#1739BA]">
              CONFIRMED.
            </span>
          </h1>

          <p className="mx-auto mt-7 max-w-md text-sm leading-8 text-slate-500">
            Thank you for shopping with AURELIA.
            Your demo order has been received successfully.
          </p>

          <div className="mx-auto mt-8 max-w-sm bg-[#FFF0C0] px-5 py-5">
            <p className="text-[11px] font-black uppercase tracking-widest text-[#1739BA]">
              Order Reference
            </p>
            <p className="mt-2 break-all text-xl font-black text-[#1739BA]">
              {orderNumber}
            </p>
          </div>

          <Link
            href="/"
            className="mt-10 inline-flex items-center justify-center gap-3 bg-[#1739BA] px-8 py-5 text-xs font-black uppercase tracking-widest text-white"
          >
            CONTINUE SHOPPING
            <ArrowRight size={18} />
          </Link>
        </section>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#F4F7FF] text-[#111B35]">
      {/* ANNOUNCEMENT BAR */}
      <div className="bg-[#1739BA] px-4 py-3 text-center text-[10px] font-black uppercase tracking-[0.2em] text-white sm:text-xs">
        A NEW ERA OF EVERYDAY LUXURY
        <span className="mx-3 text-[#FFE59B]">✦</span>
        THE AURELIA EDIT
      </div>

      {/* HEADER */}
      <header className="border-b border-blue-100 bg-white">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-4 px-6 py-6">
          <Link href="/" className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[#1739BA] text-[#FFE59B]">
              <Sparkles size={25} />
            </div>

            <div>
              <span className="text-3xl font-black tracking-[-0.08em] text-[#1739BA]">
                AURELIA
                <span className="text-[#E7BE48]">.</span>
              </span>
              <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-slate-400">
                THE LUXURY EDIT
              </p>
            </div>
          </Link>

          <div className="flex items-center gap-2 text-xs font-bold text-[#1739BA]">
            <LockKeyhole size={17} />
            SECURE CHECKOUT
          </div>
        </div>
      </header>

      {/* PAGE INTRO */}
      <section className="border-b border-blue-100 bg-white">
        <div className="mx-auto max-w-7xl px-6 py-12 sm:py-16">
          <Link
            href="/"
            className="mb-8 inline-flex items-center gap-2 text-xs font-black uppercase tracking-widest text-[#1739BA] hover:underline"
          >
            <ArrowLeft size={17} />
            RETURN TO SHOP
          </Link>

          <div className="flex flex-wrap items-end justify-between gap-6">
            <div>
              <p className="mb-4 text-xs font-black uppercase tracking-[0.2em] text-[#1739BA]">
                YOUR LUXURY EXPERIENCE
              </p>

              <h1 className="text-5xl font-black leading-[1.05] tracking-[-0.06em] sm:text-7xl">
                THE FINAL
                <br />
                <span className="text-[#1739BA]">
                  TOUCH.
                </span>
              </h1>

              <p className="mt-6 max-w-xl text-sm leading-8 text-slate-500">
                Complete your details below to place your
                AURELIA order.
              </p>
            </div>

            <div className="flex items-center gap-3 bg-[#FFE59B] px-6 py-5 text-[#1739BA]">
              <ShoppingBag size={24} />
              <div>
                <p className="text-[10px] font-black uppercase tracking-widest">
                  YOUR BAG
                </p>
                <p className="text-xl font-black">
                  {totalItems} {totalItems === 1 ? "ITEM" : "ITEMS"}
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CHECKOUT CONTENT */}
      <div className="mx-auto grid max-w-7xl gap-8 px-6 py-12 lg:grid-cols-[minmax(0,1.45fr)_minmax(320px,1fr)] lg:items-start">
        {/* CUSTOMER FORM */}
        <div>
          <form
            id="aurelia-checkout-form"
            onSubmit={handleSubmit}
            className="space-y-7"
          >
            {/* CONTACT INFORMATION */}
            <section className="border border-blue-100 bg-white p-6 shadow-sm sm:p-9">
              <div className="mb-8 flex items-center gap-4">
                <div className="flex h-12 w-12 items-center justify-center bg-[#E8EEFF] text-[#1739BA]">
                  <UserRound size={24} />
                </div>

                <div>
                  <p className="text-[10px] font-black uppercase tracking-[0.2em] text-[#4475F2]">
                    STEP 01
                  </p>
                  <h2 className="mt-1 text-2xl font-black tracking-tight">
                    Contact Information
                  </h2>
                </div>
              </div>

              <div className="grid gap-5 sm:grid-cols-2">
                <label className={labelClass}>
                  First Name *
                  <input
                    required
                    maxLength={100}
                    autoComplete="given-name"
                    value={form.firstName}
                    onChange={(e) =>
                      updateField("firstName", e.target.value)
                    }
                    placeholder="First name"
                    className={inputClass}
                  />
                </label>

                <label className={labelClass}>
                  Last Name *
                  <input
                    required
                    maxLength={100}
                    autoComplete="family-name"
                    value={form.lastName}
                    onChange={(e) =>
                      updateField("lastName", e.target.value)
                    }
                    placeholder="Last name"
                    className={inputClass}
                  />
                </label>

                <label className={labelClass}>
                  Email Address *
                  <input
                    required
                    type="email"
                    maxLength={255}
                    autoComplete="email"
                    value={form.email}
                    onChange={(e) =>
                      updateField("email", e.target.value)
                    }
                    placeholder="you@example.com"
                    className={inputClass}
                  />
                </label>

                <label className={labelClass}>
                  Phone Number *
                  <input
                    required
                    type="tel"
                    maxLength={30}
                    autoComplete="tel"
                    value={form.phone}
                    onChange={(e) =>
                      updateField("phone", e.target.value)
                    }
                    placeholder="+61 400 000 000"
                    className={inputClass}
                  />
                </label>
              </div>
            </section>

            {/* SHIPPING ADDRESS */}
            <section className="border border-blue-100 bg-white p-6 shadow-sm sm:p-9">
              <div className="mb-8 flex items-center gap-4">
                <div className="flex h-12 w-12 items-center justify-center bg-[#FFF0C0] text-[#1739BA]">
                  <MapPin size={24} />
                </div>

                <div>
                  <p className="text-[10px] font-black uppercase tracking-[0.2em] text-[#4475F2]">
                    STEP 02
                  </p>
                  <h2 className="mt-1 text-2xl font-black tracking-tight">
                    Delivery Address
                  </h2>
                </div>
              </div>

              <div className="grid gap-5 sm:grid-cols-2">
                <label className={`${labelClass} sm:col-span-2`}>
                  Street Address *
                  <input
                    required
                    maxLength={250}
                    autoComplete="street-address"
                    value={form.address}
                    onChange={(e) =>
                      updateField("address", e.target.value)
                    }
                    placeholder="Street name and house number"
                    className={inputClass}
                  />
                </label>

                <label className={`${labelClass} sm:col-span-2`}>
                  Apartment / Unit (Optional)
                  <input
                    maxLength={100}
                    value={form.apartment}
                    onChange={(e) =>
                      updateField("apartment", e.target.value)
                    }
                    placeholder="Apartment, suite or unit"
                    className={inputClass}
                  />
                </label>

                <label className={labelClass}>
                  City *
                  <input
                    required
                    maxLength={120}
                    autoComplete="address-level2"
                    value={form.city}
                    onChange={(e) =>
                      updateField("city", e.target.value)
                    }
                    placeholder="City"
                    className={inputClass}
                  />
                </label>

                <label className={labelClass}>
                  State / Province *
                  <input
                    required
                    maxLength={120}
                    autoComplete="address-level1"
                    value={form.state}
                    onChange={(e) =>
                      updateField("state", e.target.value)
                    }
                    placeholder="State or province"
                    className={inputClass}
                  />
                </label>

                <label className={labelClass}>
                  Postal Code *
                  <input
                    required
                    maxLength={20}
                    autoComplete="postal-code"
                    value={form.postalCode}
                    onChange={(e) =>
                      updateField("postalCode", e.target.value)
                    }
                    placeholder="Postal code"
                    className={inputClass}
                  />
                </label>

                <label className={labelClass}>
                  Country *
                  <input
                    required
                    maxLength={120}
                    autoComplete="country-name"
                    value={form.country}
                    onChange={(e) =>
                      updateField("country", e.target.value)
                    }
                    placeholder="Country"
                    className={inputClass}
                  />
                </label>
              </div>

              <label className={`${labelClass} mt-6`}>
                Order Notes (Optional)
                <textarea
                  rows={4}
                  maxLength={1000}
                  value={form.notes}
                  onChange={(e) =>
                    updateField("notes", e.target.value)
                  }
                  placeholder="Any special delivery instructions?"
                  className={`${inputClass} resize-y`}
                />
              </label>
            </section>

            {/* PAYMENT INFORMATION */}
            <section className="border border-blue-100 bg-white p-6 shadow-sm sm:p-9">
              <div className="mb-7 flex items-center gap-4">
                <div className="flex h-12 w-12 items-center justify-center bg-[#E8EEFF] text-[#1739BA]">
                  <CreditCard size={24} />
                </div>

                <div>
                  <p className="text-[10px] font-black uppercase tracking-[0.2em] text-[#4475F2]">
                    STEP 03
                  </p>
                  <h2 className="mt-1 text-2xl font-black tracking-tight">
                    Payment Method
                  </h2>
                </div>
              </div>

              <div className="flex items-start gap-4 border-2 border-[#1739BA] bg-[#F4F7FF] p-5">
                <div className="mt-1 h-5 w-5 shrink-0 rounded-full border-[6px] border-[#1739BA] bg-white" />

                <div>
                  <p className="text-sm font-black text-[#1739BA]">
                    DEMO CHECKOUT
                  </p>
                  <p className="mt-2 text-xs leading-6 text-slate-500">
                    Portfolio demonstration only. No payment
                    details are collected, and no real
                    transaction will be processed.
                  </p>
                </div>
              </div>
            </section>

            {error && (
              <div
                role="alert"
                className="border border-red-200 bg-red-50 p-5 text-sm font-semibold leading-7 text-red-700"
              >
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={
                loading ||
                submitting ||
                checkoutItems.length === 0
              }
              className="flex w-full items-center justify-center gap-3 bg-[#1739BA] px-7 py-6 text-xs font-black uppercase tracking-[0.16em] text-white transition hover:bg-[#0D2B92] disabled:cursor-not-allowed disabled:opacity-50"
            >
              {submitting ? (
                <>
                  <Loader2
                    size={20}
                    className="animate-spin"
                  />
                  PLACING ORDER...
                </>
              ) : (
                <>
                  PLACE DEMO ORDER
                  <ArrowRight size={20} />
                </>
              )}
            </button>

            <p className="text-center text-xs leading-7 text-slate-500">
              This is a portfolio demo checkout.
              No real payments or deliveries are arranged.
            </p>
          </form>
        </div>

        {/* ORDER SUMMARY */}
        <aside className="lg:sticky lg:top-8">
          <div className="border border-blue-100 bg-white shadow-sm">
            <div className="bg-[#1739BA] px-7 py-8 text-white">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <p className="text-[10px] font-black uppercase tracking-[0.2em] text-[#FFE59B]">
                    YOUR SELECTION
                  </p>

                  <h2 className="mt-3 text-2xl font-black">
                    Order Summary
                  </h2>
                </div>

                <ShoppingBag
                  size={28}
                  className="text-[#FFE59B]"
                />
              </div>
            </div>

            <div className="p-7">
              {loading ? (
                <div className="flex items-center justify-center gap-3 py-12 text-sm text-[#1739BA]">
                  <Loader2
                    size={20}
                    className="animate-spin"
                  />
                  Preparing your bag...
                </div>
              ) : checkoutItems.length === 0 ? (
                <div className="py-10 text-center">
                  <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center bg-[#F4F7FF] text-[#1739BA]">
                    <Package size={30} />
                  </div>

                  <h3 className="text-lg font-black">
                    Your bag is empty
                  </h3>

                  <p className="mt-3 text-sm leading-7 text-slate-500">
                    Choose something special from our
                    luxury collection to begin checkout.
                  </p>

                  <Link
                    href="/"
                    className="mt-7 inline-flex items-center gap-2 bg-[#1739BA] px-6 py-4 text-xs font-black tracking-wider text-white"
                  >
                    EXPLORE PRODUCTS
                    <ArrowRight size={17} />
                  </Link>
                </div>
              ) : (
                <div className="space-y-6">
                  {checkoutItems.map((item) => (
                    <div
                      key={item.id}
                      className="flex items-start gap-4 border-b border-blue-100 pb-6 last:border-b-0 last:pb-0"
                    >
                      <div className="flex h-20 w-20 shrink-0 items-center justify-center overflow-hidden bg-[#F4F7FF]">
                        {item.image_url ? (
                          <img
                            src={item.image_url}
                            alt={item.name}
                            className="h-full w-full object-cover"
                          />
                        ) : (
                          <Package
                            size={27}
                            className="text-[#1739BA]"
                          />
                        )}
                      </div>

                      <div className="min-w-0 flex-1">
                        <p className="text-[10px] font-black uppercase tracking-widest text-[#4475F2]">
                          {item.category || "AURELIA EDIT"}
                        </p>

                        <h3 className="mt-1 text-sm font-black leading-6">
                          {item.name}
                        </h3>

                        <p className="mt-2 text-xs text-slate-500">
                          Quantity: {item.quantity}
                        </p>

                        <p className="mt-2 text-sm font-black text-[#1739BA]">
                          {formatPrice(
                            Number(item.price) * item.quantity
                          )}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              <div className="mt-8 space-y-4 border-t border-blue-100 pt-7">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-slate-500">
                    Subtotal
                  </span>
                  <span className="font-bold">
                    {formatPrice(subtotal)}
                  </span>
                </div>

                <div className="flex items-center justify-between text-sm">
                  <span className="text-slate-500">
                    Demo Shipping
                  </span>
                  <span className="font-bold text-emerald-700">
                    FREE
                  </span>
                </div>

                <div className="flex items-center justify-between border-t border-blue-100 pt-6">
                  <span className="text-sm font-black uppercase tracking-wider">
                    TOTAL
                  </span>

                  <span className="text-3xl font-black text-[#1739BA]">
                    {formatPrice(total)}
                  </span>
                </div>

                <p className="text-[11px] leading-6 text-slate-500">
                  USD. Demo total only; no payment is charged.
                </p>
              </div>
            </div>
          </div>

          <div className="mt-5 grid gap-3">
            <div className="flex items-center gap-4 border border-blue-100 bg-white px-5 py-5">
              <Truck
                size={24}
                className="shrink-0 text-[#1739BA]"
              />
              <div>
                <p className="text-xs font-black">
                  DEMO DELIVERY
                </p>
                <p className="mt-1 text-xs text-slate-500">
                  No physical order will be shipped.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-4 border border-blue-100 bg-white px-5 py-5">
              <ShieldCheck
                size={24}
                className="shrink-0 text-[#1739BA]"
              />
              <div>
                <p className="text-xs font-black">
                  CUSTOMER PRIVACY
                </p>
                <p className="mt-1 text-xs text-slate-500">
                  No card or banking details requested.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-4 border border-blue-100 bg-white px-5 py-5">
              <Mail
                size={24}
                className="shrink-0 text-[#1739BA]"
              />
              <div>
                <p className="text-xs font-black">
                  ORDER INFORMATION
                </p>
                <p className="mt-1 text-xs text-slate-500">
                  Demo order confirmation appears on screen.
                </p>
              </div>
            </div>
          </div>
        </aside>
      </div>

      {/* FOOTER */}
      <footer className="border-t border-blue-100 bg-white">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-5 px-6 py-9">
          <div className="flex items-center gap-2">
            <Sparkles
              size={22}
              className="text-[#1739BA]"
            />
            <span className="text-xl font-black tracking-[-0.07em] text-[#1739BA]">
              AURELIA.
            </span>
          </div>

          <p className="text-xs text-slate-500">
            © 2026 AURELIA. LUXURY E-COMMERCE PORTFOLIO.
          </p>

          <Link
            href="/"
            className="inline-flex items-center gap-2 text-xs font-black uppercase tracking-widest text-[#1739BA]"
          >
            BACK TO STORE
            <ArrowRight size={17} />
          </Link>
        </div>
      </footer>
    </main>
  );
}
