"use client";
import OrdersManagement from "./OrdersManagement";

import { useCallback, useEffect, useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowUpRight,
  Boxes,
  CheckCircle2,
  Database,
  Edit3,
  ExternalLink,
  FolderOpen,
  LayoutDashboard,
  Loader2,
  LogOut,
  Package,
  Plus,
  RefreshCw,
  Save,
  Search,
  ShieldCheck,
  ShoppingBag,
  Sparkles,
  Trash2,
  X,
} from "lucide-react";

type Product = {
  id: number;
  name: string;
  description: string;
  category: string | null;
  price: string | number;
  old_price: string | number | null;
  image_url: string | null;
  stock_quantity: number;
  badge: string | null;
  is_featured: boolean;
  is_active: boolean;
};

type ProductForm = {
  name: string;
  description: string;
  category: string;
  price: string;
  stock_quantity: string;
  image_url: string;
  badge: string;
  is_featured: boolean;
};

const emptyForm: ProductForm = {
  name: "",
  description: "",
  category: "Fragrance",
  price: "",
  stock_quantity: "0",
  image_url: "",
  badge: "",
  is_featured: false,
};

function money(value: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(value);
}

export default function AdminDashboardClient() {
  const router = useRouter();

  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [query, setQuery] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [form, setForm] = useState<ProductForm>(emptyForm);

  const loadProducts = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const response = await fetch("/api/admin/products", {
        cache: "no-store",
        credentials: "same-origin",
      });

      if (response.status === 401) {
        router.replace("/admin");
        return;
      }

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.message || "Unable to load products.");
      }

      setProducts(data.products as Product[]);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Unable to load products."
      );
    } finally {
      setLoading(false);
    }
  }, [router]);

  useEffect(() => {
    void loadProducts();
  }, [loadProducts]);

  function updateField<K extends keyof ProductForm>(
    field: K,
    value: ProductForm[K]
  ) {
    setForm((previous) => ({ ...previous, [field]: value }));
  }

  function startAdd() {
    setForm({ ...emptyForm });
    setEditingId(null);
    setShowForm(true);
    setNotice("");
    setError("");
  }

  function startEdit(product: Product) {
    setForm({
      name: product.name,
      description: product.description,
      category: product.category || "Fragrance",
      price: String(product.price),
      stock_quantity: String(product.stock_quantity),
      image_url: product.image_url || "",
      badge: product.badge || "",
      is_featured: product.is_featured,
    });

    setEditingId(product.id);
    setShowForm(true);
    setNotice("");
    setError("");

    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function closeForm() {
    setShowForm(false);
    setEditingId(null);
    setForm({ ...emptyForm });
  }

  async function saveProduct(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setNotice("");

    if (
      !form.name.trim() ||
      !form.description.trim() ||
      !form.price.trim() ||
      !form.stock_quantity.trim()
    ) {
      setError("Please complete all required product fields.");
      return;
    }

    setSaving(true);

    try {
      const response = await fetch("/api/admin/products", {
        method: editingId === null ? "POST" : "PUT",
        credentials: "same-origin",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...(editingId !== null ? { id: editingId } : {}),
          name: form.name,
          description: form.description,
          category: form.category,
          price: Number(form.price),
          stock_quantity: Number(form.stock_quantity),
          image_url: form.image_url,
          badge: form.badge,
          is_featured: form.is_featured,
        }),
      });

      if (response.status === 401) {
        router.replace("/admin");
        return;
      }

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.message || "Unable to save product.");
      }

      closeForm();

      await loadProducts();

      setNotice(
        editingId === null
          ? "New product successfully added to NeonDB."
          : "Product details successfully updated in NeonDB."
      );
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Unable to save product."
      );
    } finally {
      setSaving(false);
    }
  }

  async function archiveProduct(product: Product) {
    if (
      !window.confirm(
        `Remove "${product.name}" from the storefront? The record will be retained in the database.`
      )
    ) {
      return;
    }

    setError("");
    setNotice("");

    try {
      const response = await fetch("/api/admin/products", {
        method: "DELETE",
        credentials: "same-origin",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: product.id }),
      });

      if (response.status === 401) {
        router.replace("/admin");
        return;
      }

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.message || "Unable to remove product.");
      }

      await loadProducts();
      setNotice("Product removed from the storefront.");
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Unable to remove product."
      );
    }
  }

  async function handleLogout() {
    setLoggingOut(true);
    setError("");

    try {
      const response = await fetch("/api/admin/logout", {
        method: "POST",
        credentials: "same-origin",
      });

      if (!response.ok) {
        throw new Error("Unable to log out. Please try again.");
      }

      router.replace("/admin");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to log out.");
      setLoggingOut(false);
    }
  }

  const activeProducts = products.filter((item) => item.is_active);

  const totalStock = activeProducts.reduce(
    (sum, item) => sum + Number(item.stock_quantity),
    0
  );

  const inventoryValue = activeProducts.reduce(
    (sum, item) =>
      sum + Number(item.price) * Number(item.stock_quantity),
    0
  );

  const lowStock = activeProducts.filter(
    (item) => Number(item.stock_quantity) <= 10
  ).length;

  const categoriesCount = new Set(
    products.map((item) => item.category).filter(Boolean)
  ).size;

  const filtered = products.filter((item) =>
    `${item.name} ${item.category || ""}`
      .toLowerCase()
      .includes(query.toLowerCase())
  );

  const cards = [
    {
      label: "TOTAL PRODUCTS",
      value: products.length,
      icon: Package,
      color: "bg-[#E8EEFF] text-[#1739BA]",
    },
    {
      label: "ACTIVE PRODUCTS",
      value: activeProducts.length,
      icon: ShoppingBag,
      color: "bg-[#FFF0C0] text-[#916500]",
    },
    {
      label: "INVENTORY UNITS",
      value: totalStock,
      icon: Boxes,
      color: "bg-[#E3F7F2] text-[#087963]",
    },
    {
      label: "LOW STOCK ITEMS",
      value: lowStock,
      icon: FolderOpen,
      color: "bg-[#FCE6EB] text-[#AC3658]",
    },
  ];

  return (
    <main className="min-h-screen bg-[#F4F7FF] text-[#111B35]">
      <header className="border-b border-blue-100 bg-white">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-5 px-6 py-6">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[#1739BA] text-[#FFE59B]">
              <Sparkles size={25} />
            </div>

            <div>
              <h1 className="text-2xl font-black tracking-[-0.07em] text-[#1739BA]">
                AURELIA.
              </h1>
              <p className="text-[10px] font-black tracking-[0.2em] text-slate-400">
                ADMINISTRATION
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <a
              href="/"
              className="inline-flex items-center gap-2 bg-[#1739BA] px-5 py-3 text-xs font-black tracking-wider text-white"
            >
              VIEW STOREFRONT <ExternalLink size={16} />
            </a>

            <button
              type="button"
              onClick={() => void handleLogout()}
              disabled={loggingOut}
              className="inline-flex items-center gap-2 border border-[#1739BA] bg-white px-5 py-3 text-xs font-black tracking-wider text-[#1739BA] transition-colors hover:bg-[#FFE59B] disabled:cursor-wait disabled:opacity-60"
            >
              {loggingOut ? (
                <Loader2 size={16} className="animate-spin" />
              ) : (
                <LogOut size={16} />
              )}
              {loggingOut ? "LOGGING OUT..." : "LOGOUT"}
            </button>
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-7xl px-6 py-12">
        <div className="mb-10 flex flex-wrap items-end justify-between gap-6">
          <div>
            <div className="mb-5 flex items-center gap-3 text-[#1739BA]">
              <LayoutDashboard size={21} />
              <span className="text-xs font-black tracking-[0.2em]">
                BUSINESS OVERVIEW
              </span>
            </div>

            <h2 className="text-4xl font-black tracking-[-0.06em] sm:text-6xl">
              YOUR CREATIVE
              <br />
              <span className="text-[#1739BA]">
                CONTROL CENTRE.
              </span>
            </h2>

            <p className="mt-6 max-w-2xl text-sm leading-8 text-slate-500">
              Manage your luxury storefront, update product
              information, control inventory and review
              database-powered business statistics.
            </p>
          </div>

          <button
            type="button"
            onClick={startAdd}
            className="inline-flex items-center gap-3 bg-[#1739BA] px-7 py-5 text-xs font-black tracking-widest text-white"
          >
            <Plus size={20} /> ADD NEW PRODUCT
          </button>
        </div>

        <div className="mb-9 flex flex-wrap items-center gap-3">
          <span className="inline-flex items-center gap-2 bg-emerald-50 px-5 py-3 text-xs font-bold text-emerald-700">
            <ShieldCheck size={18} /> AUTHENTICATED ADMIN
          </span>

          <span className="inline-flex items-center gap-2 bg-[#FFE59B] px-5 py-3 text-xs font-bold text-[#1739BA]">
            <Database size={18} /> NEON POSTGRESQL
          </span>

          <button
            type="button"
            onClick={() => void loadProducts()}
            className="inline-flex items-center gap-2 border border-blue-200 bg-white px-5 py-3 text-xs font-bold text-[#1739BA]"
          >
            <RefreshCw size={17} /> REFRESH
          </button>
        </div>

        {notice && (
          <div
            role="status"
            className="mb-7 flex items-center gap-3 border border-emerald-200 bg-emerald-50 p-5 text-sm font-semibold text-emerald-700"
          >
            <CheckCircle2 size={21} />
            {notice}
          </div>
        )}

        {error && (
          <div
            role="alert"
            className="mb-7 border border-red-200 bg-red-50 p-5 text-sm font-semibold text-red-700"
          >
            {error}
          </div>
        )}

        {/* ADD / EDIT PRODUCT FORM */}
        {showForm && (
          <section className="mb-12 border border-blue-100 bg-white p-7 shadow-xl shadow-blue-100 sm:p-10">
            <div className="mb-9 flex items-center justify-between gap-4">
              <div>
                <p className="mb-2 text-xs font-black tracking-widest text-[#4475F2]">
                  PRODUCT MANAGEMENT
                </p>
                <h3 className="text-3xl font-black">
                  {editingId === null
                    ? "Add New Product"
                    : "Edit Product"}
                </h3>
              </div>

              <button
                type="button"
                onClick={closeForm}
                aria-label="Close product form"
                className="p-3 text-slate-500 hover:bg-blue-50"
              >
                <X size={24} />
              </button>
            </div>

            <form onSubmit={saveProduct} className="space-y-6">
              <div className="grid gap-6 md:grid-cols-2">
                <label className="block text-sm font-bold">
                  Product Name *
                  <input
                    required
                    maxLength={200}
                    value={form.name}
                    onChange={(e) =>
                      updateField("name", e.target.value)
                    }
                    placeholder="e.g. Aurelia Golden Glow"
                    className="mt-3 w-full border border-blue-200 p-4 font-normal outline-none focus:border-[#1739BA]"
                  />
                </label>

                <label className="block text-sm font-bold">
                  Category *
                  <select
                    required
                    value={form.category}
                    onChange={(e) =>
                      updateField("category", e.target.value)
                    }
                    className="mt-3 w-full border border-blue-200 bg-white p-4 font-normal outline-none focus:border-[#1739BA]"
                  >
                    <option>Fragrance</option>
                    <option>Skincare</option>
                    <option>Makeup</option>
                  </select>
                </label>

                <label className="block text-sm font-bold">
                  Price (USD) *
                  <input
                    required
                    type="number"
                    step="0.01"
                    min="0"
                    max="99999999"
                    value={form.price}
                    onChange={(e) =>
                      updateField("price", e.target.value)
                    }
                    placeholder="129.00"
                    className="mt-3 w-full border border-blue-200 p-4 font-normal outline-none focus:border-[#1739BA]"
                  />
                </label>

                <label className="block text-sm font-bold">
                  Stock Quantity *
                  <input
                    required
                    type="number"
                    step="1"
                    min="0"
                    max="1000000"
                    value={form.stock_quantity}
                    onChange={(e) =>
                      updateField("stock_quantity", e.target.value)
                    }
                    className="mt-3 w-full border border-blue-200 p-4 font-normal outline-none focus:border-[#1739BA]"
                  />
                </label>

                <label className="block text-sm font-bold md:col-span-2">
                  Product Image URL
                  <input
                    type="url"
                    value={form.image_url}
                    onChange={(e) =>
                      updateField("image_url", e.target.value)
                    }
                    placeholder="https://images.unsplash.com/..."
                    className="mt-3 w-full border border-blue-200 p-4 font-normal outline-none focus:border-[#1739BA]"
                  />
                </label>

                <label className="block text-sm font-bold">
                  Product Badge
                  <input
                    maxLength={100}
                    value={form.badge}
                    onChange={(e) =>
                      updateField("badge", e.target.value)
                    }
                    placeholder="NEW ARRIVAL"
                    className="mt-3 w-full border border-blue-200 p-4 font-normal outline-none focus:border-[#1739BA]"
                  />
                </label>

                <label className="flex items-center gap-3 self-end border border-blue-100 bg-[#F4F7FF] p-4 text-sm font-bold">
                  <input
                    type="checkbox"
                    checked={form.is_featured}
                    onChange={(e) =>
                      updateField("is_featured", e.target.checked)
                    }
                    className="h-5 w-5 accent-[#1739BA]"
                  />
                  Featured Product
                </label>
              </div>

              <label className="block text-sm font-bold">
                Product Description *
                <textarea
                  required
                  rows={5}
                  maxLength={5000}
                  value={form.description}
                  onChange={(e) =>
                    updateField("description", e.target.value)
                  }
                  placeholder="Write a detailed, attractive product description..."
                  className="mt-3 w-full border border-blue-200 p-4 font-normal leading-7 outline-none focus:border-[#1739BA]"
                />
              </label>

              <div className="flex flex-wrap gap-4 pt-3">
                <button
                  type="submit"
                  disabled={saving}
                  className="inline-flex items-center gap-3 bg-[#1739BA] px-8 py-5 text-xs font-black tracking-widest text-white disabled:opacity-60"
                >
                  {saving ? (
                    <Loader2 size={20} className="animate-spin" />
                  ) : (
                    <Save size={20} />
                  )}
                  {editingId === null
                    ? "SAVE NEW PRODUCT"
                    : "SAVE CHANGES"}
                </button>

                <button
                  type="button"
                  onClick={closeForm}
                  className="border border-blue-200 px-8 py-5 text-xs font-black text-[#1739BA]"
                >
                  CANCEL
                </button>
              </div>
            </form>
          </section>
        )}

        {/* ANALYTICS CARDS */}
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {cards.map((card) => {
            const Icon = card.icon;

            return (
              <div
                key={card.label}
                className="border border-blue-100 bg-white p-7 shadow-sm"
              >
                <div className={`mb-7 flex h-14 w-14 items-center justify-center ${card.color}`}>
                  <Icon size={28} />
                </div>

                <p className="text-[11px] font-black tracking-[0.16em] text-slate-500">
                  {card.label}
                </p>

                <p className="mt-4 text-5xl font-black text-[#1739BA]">
                  {loading ? "ÃƒÂ¢Ã¢â€šÂ¬Ã¢â‚¬Â" : card.value}
                </p>
              </div>
            );
          })}
        </div>

        {/* INVENTORY VALUATION */}
        <div className="mt-8 grid gap-6 md:grid-cols-2">
          <div className="bg-[#1739BA] p-9 text-white">
            <p className="text-xs font-black tracking-widest text-[#FFE59B]">
              ESTIMATED INVENTORY VALUE
            </p>

            <h3 className="mt-7 text-4xl font-black sm:text-5xl">
              {loading ? "ÃƒÂ¢Ã¢â€šÂ¬Ã¢â‚¬Â" : money(inventoryValue)}
            </h3>

            <p className="mt-5 text-sm leading-8 text-blue-100">
              Based on active product prices and available stock.
              This is not actual sales revenue.
            </p>
          </div>

          <div className="bg-[#FFE59B] p-9">
            <p className="text-xs font-black tracking-widest text-[#1739BA]">
              CURRENT PRODUCT CATEGORIES
            </p>

            <h3 className="mt-7 text-5xl font-black text-[#1739BA]">
              {loading ? "ÃƒÂ¢Ã¢â€šÂ¬Ã¢â‚¬Â" : categoriesCount}
            </h3>

            <p className="mt-5 text-sm leading-8 text-slate-600">
              Categories represented by the product records
              currently stored in NeonDB.
            </p>
          </div>
        </div>

        {/* PRODUCT MANAGEMENT TABLE */}
        <section className="mt-12 border border-blue-100 bg-white shadow-sm">
          <div className="flex flex-wrap items-center justify-between gap-5 border-b border-blue-100 p-7">
            <div>
              <p className="mb-2 text-xs font-black tracking-widest text-[#4475F2]">
                DATABASE MANAGEMENT
              </p>
              <h3 className="text-2xl font-black">
                Product Inventory
              </h3>
              <p className="mt-2 text-sm text-slate-500">
                Edit, manage or remove products from your storefront.
              </p>
            </div>

            <div className="flex items-center gap-3 border border-blue-200 px-4 py-3">
              <Search size={19} className="text-[#1739BA]" />
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search products..."
                aria-label="Search products"
                className="w-40 text-sm outline-none sm:w-52"
              />
            </div>
          </div>

          {loading ? (
            <div className="flex items-center justify-center gap-3 py-20 text-[#1739BA]">
              <Loader2 className="animate-spin" />
              Loading products...
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[900px] text-left">
                <thead className="bg-[#F4F7FF]">
                  <tr className="text-xs font-black uppercase tracking-wider text-slate-500">
                    <th className="px-6 py-5">Product</th>
                    <th className="px-5 py-5">Category</th>
                    <th className="px-5 py-5">Price</th>
                    <th className="px-5 py-5">Stock</th>
                    <th className="px-5 py-5">Status</th>
                    <th className="px-5 py-5">Actions</th>
                  </tr>
                </thead>

                <tbody>
                  {filtered.map((product) => (
                    <tr
                      key={product.id}
                      className="border-t border-slate-100"
                    >
                      <td className="px-6 py-5">
                        <div className="flex items-center gap-4">
                          {product.image_url ? (
                            <img
                              src={product.image_url}
                              alt={product.name}
                              className="h-16 w-16 shrink-0 object-cover"
                            />
                          ) : (
                            <div className="flex h-16 w-16 shrink-0 items-center justify-center bg-blue-50">
                              <Package className="text-[#1739BA]" />
                            </div>
                          )}

                          <div>
                            <p className="font-bold">{product.name}</p>
                            <p className="mt-1 text-xs text-slate-400">
                              ID: {product.id}
                            </p>
                          </div>
                        </div>
                      </td>

                      <td className="px-5 py-5 text-sm text-slate-600">
                        {product.category || "Uncategorised"}
                      </td>

                      <td className="px-5 py-5 font-bold text-[#1739BA]">
                        {money(Number(product.price))}
                      </td>

                      <td className="px-5 py-5 font-bold">
                        {product.stock_quantity}
                      </td>

                      <td className="px-5 py-5">
                        <span
                          className={`inline-block px-3 py-2 text-xs font-bold ${
                            !product.is_active
                              ? "bg-slate-100 text-slate-600"
                              : product.stock_quantity === 0
                              ? "bg-red-100 text-red-700"
                              : product.stock_quantity <= 10
                              ? "bg-amber-100 text-amber-700"
                              : "bg-emerald-100 text-emerald-700"
                          }`}
                        >
                          {!product.is_active
                            ? "REMOVED"
                            : product.stock_quantity === 0
                            ? "OUT OF STOCK"
                            : product.stock_quantity <= 10
                            ? "LOW STOCK"
                            : "IN STOCK"}
                        </span>
                      </td>

                      <td className="px-5 py-5">
                        {product.is_active ? (
                          <div className="flex items-center gap-2">
                            <button
                              type="button"
                              onClick={() => startEdit(product)}
                              className="flex items-center gap-2 bg-[#E8EEFF] px-4 py-3 text-xs font-bold text-[#1739BA]"
                            >
                              <Edit3 size={16} /> EDIT
                            </button>

                            <button
                              type="button"
                              onClick={() => void archiveProduct(product)}
                              className="flex items-center gap-2 bg-red-50 px-4 py-3 text-xs font-bold text-red-700"
                            >
                              <Trash2 size={16} /> DELETE
                            </button>
                          </div>
                        ) : (
                          <span className="text-xs text-slate-400">
                            Removed from storefront
                          </span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {filtered.length === 0 && (
                <div className="py-16 text-center text-slate-500">
                  No matching products found.
                </div>
              )}
            </div>
          )}
        </section>

        <OrdersManagement />

        <div className="mt-10 flex flex-wrap items-center justify-between gap-4 border-t border-blue-100 pt-8">
          <p className="text-xs leading-7 text-slate-500">
            Product changes are saved in NeonDB. Delete archives
            a product rather than permanently erasing its record.
          </p>

          <a
            href="/"
            className="inline-flex items-center gap-2 text-xs font-black tracking-wider text-[#1739BA]"
          >
            VIEW LIVE STOREFRONT <ArrowUpRight size={18} />
          </a>
        </div>
      </div>
    </main>
  );
}
