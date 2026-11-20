
"use client";

import { useEffect, useState } from "react";
import {
  ArrowRight,
  ArrowUpRight,
  BookOpen,
  Camera,
  Check,
  CheckCircle2,
  ChevronDown,
  Droplets,
  Heart,
  Loader2,
  Menu,
  Minus,
  Moon,
  Plus,
  RefreshCw,
  Search,
  ShieldCheck,
  ShoppingBag,
  Sparkles,
  Star,
  Sun,
  Truck,
  UserRound,
  X,
} from "lucide-react";

type Product = {
  id: number;
  name: string;
  slug: string;
  description: string;
  category: string | null;
  price: number;
  oldPrice: number | null;
  image: string;
  stock: number;
  badge: string | null;
};

type ApiProduct = {
  id: number;
  name: string;
  slug: string;
  description: string;
  category: string | null;
  price: string | number;
  old_price: string | number | null;
  image_url: string | null;
  stock_quantity: number;
  badge: string | null;
};

const navigation = [
  { title: "Home", href: "#home" },
  { title: "Collections", href: "#collections" },
  { title: "Shop", href: "#shop" },
  { title: "Our Story", href: "#story" },
  { title: "Journal", href: "#journal" },
  { title: "FAQs", href: "#faq" },
];

const collections = [
  {
    name: "Fragrance",
    subtitle: "A scent for every story",
    description:
      "Explore signature fragrance concepts inspired by individuality, personal expression and contemporary elegance.",
    image:
      "https://images.unsplash.com/photo-1541643600914-78b084683601?w=1000&q=85",
  },
  {
    name: "Skincare",
    subtitle: "Your everyday glow",
    description:
      "Discover thoughtfully presented beauty essentials that celebrate simple routines and intentional self-care.",
    image:
      "https://images.unsplash.com/photo-1608248543803-ba4f8c70ae0b?w=1000&q=85",
  },
  {
    name: "Makeup",
    subtitle: "Define your expression",
    description:
      "Explore expressive colour, versatile styling and inspiring creative approaches to modern beauty.",
    image:
      "https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=1000&q=85",
  },
];

const rituals = [
  {
    number: "01",
    icon: Droplets,
    title: "The Gentle Beginning",
    tag: "CLEANSE & PREPARE",
    description:
      "Begin with a gentle cleansing routine to refresh the skin and prepare for your next steps. A simple and consistent approach can make everyday self-care feel more intentional.",
    background: "bg-[#E8F1FF]",
    color: "text-[#1739BA]",
  },
  {
    number: "02",
    icon: Sun,
    title: "The Morning Glow",
    tag: "HYDRATE & PROTECT",
    description:
      "Choose hydration suited to your skin type and use broad-spectrum sunscreen during the day. Focus on a routine that fits comfortably into your everyday life.",
    background: "bg-[#FFF3C7]",
    color: "text-[#9A6B00]",
  },
  {
    number: "03",
    icon: Heart,
    title: "The Signature Touch",
    tag: "EXPRESS YOUR STYLE",
    description:
      "Complete your routine with a fragrance or makeup detail that reflects your personality. From understated elegance to expressive colour, create a look that feels uniquely yours.",
    background: "bg-[#FCE8E5]",
    color: "text-[#B94A54]",
  },
  {
    number: "04",
    icon: Moon,
    title: "The Evening Reset",
    tag: "UNWIND & RESTORE",
    description:
      "At the end of the day, remove makeup, cleanse away daily buildup and finish with a suitable moisturiser. Enjoy a quiet moment before beginning a new day.",
    background: "bg-[#EAE9FF]",
    color: "text-[#5553AA]",
  },
];

const journal = [
  {
    number: "01",
    category: "BEAUTY JOURNAL",
    title: "The Art of Building Your Signature Routine",
    description:
      "Explore how thoughtfully selected essentials and simple everyday habits can create a beauty routine that feels personal, balanced and enjoyable.",
    image:
      "https://images.unsplash.com/photo-1608248543803-ba4f8c70ae0b?w=1100&q=85",
  },
  {
    number: "02",
    category: "FRAGRANCE STORIES",
    title: "Finding a Fragrance That Feels Like You",
    description:
      "Discover fresh, floral, woody and amber-inspired fragrance families and explore how different scents can complement your own personal style.",
    image:
      "https://images.unsplash.com/photo-1541643600914-78b084683601?w=1100&q=85",
  },
  {
    number: "03",
    category: "THE EDITORIAL EDIT",
    title: "Modern Beauty, Timeless Expression",
    description:
      "Explore the creative ideas behind a versatile beauty collection where familiar essentials and expressive colour work beautifully together.",
    image:
      "https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=1100&q=85",
  },
];

const faqs = [
  {
    question: "What is AURELIA Luxury E-Commerce?",
    answer:
      "AURELIA is an educational luxury e-commerce concept created to demonstrate premium website design, product discovery and full-stack development. It is not presented as an operating retail business.",
  },
  {
    question: "Are products loaded from a database?",
    answer:
      "Yes. The product gallery retrieves active product records from Neon PostgreSQL through a Next.js API route. Names, prices, descriptions, images and stock quantities come from the database.",
  },
  {
    question: "Can I add products to my shopping bag?",
    answer:
      "Yes. You can add available products, adjust quantities and see the calculated subtotal. The bag connects to a demo checkout, with no real payment processing.",
  },
  {
    question: "What happens when a product is out of stock?",
    answer:
      "Products with zero stock remain visible in the gallery but cannot be added to the shopping bag. Cart quantities are also limited to the available stock shown by the database.",
  },
  {
    question: "Can I make a real payment?",
    answer:
      "No. AURELIA currently provides a demonstration checkout only. No bank or card details are collected and no real purchases or deliveries are processed.",
  },
  {
    question: "Is AURELIA mobile friendly?",
    answer:
      "The website uses responsive Tailwind CSS layouts designed for desktop, tablet and mobile screens. Further device testing will be completed before final deployment.",
  },
];

function formatPrice(value: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(value);
}

export default function Home() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [menuOpen, setMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] =
    useState("All");

  const [cart, setCart] = useState<Record<number, number>>({});
  const [wishlist, setWishlist] = useState<number[]>([]);
  const [bagOpen, setBagOpen] = useState(false);

  const [email, setEmail] = useState("");
  const [subscribed, setSubscribed] = useState(false);
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  async function loadProducts() {
    try {
      setLoading(true);
      setError("");

      const response = await fetch("/api/products", {
        cache: "no-store",
      });

      if (!response.ok) {
        throw new Error("Unable to connect to the products API.");
      }

      const data = await response.json();

      if (!data.success || !Array.isArray(data.products)) {
        throw new Error("The products API returned an error.");
      }

      const loadedProducts: Product[] = (
        data.products as ApiProduct[]
      ).map((item) => ({
        id: Number(item.id),
        name: item.name,
        slug: item.slug,
        description: item.description,
        category: item.category,
        price: Number(item.price),
        oldPrice:
          item.old_price === null
            ? null
            : Number(item.old_price),
        image: item.image_url || "",
        stock: Number(item.stock_quantity),
        badge: item.badge,
      }));

      setProducts(loadedProducts);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Unable to load products."
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void loadProducts();
  }, []);

  const filteredProducts = products.filter((product) => {
    const matchesSearch =
      `${product.name} ${product.category || ""} ${product.description}`
        .toLowerCase()
        .includes(search.trim().toLowerCase());

    const matchesCategory =
      selectedCategory === "All" ||
      product.category?.toLowerCase() ===
        selectedCategory.toLowerCase();

    return matchesSearch && matchesCategory;
  });

  const cartCount = products.reduce(
    (sum, product) =>
      sum + Math.min(
        cart[product.id] || 0,
        Math.max(0, product.stock)
      ),
    0
  );

  const subtotal = products.reduce(
    (sum, product) =>
      sum +
      product.price *
        Math.min(
          cart[product.id] || 0,
          Math.max(0, product.stock)
        ),
    0
  );

  const cartProducts = products.filter(
    (product) =>
      (cart[product.id] || 0) > 0 && product.stock > 0
  );

  function addToCart(product: Product) {
    if (product.stock <= 0) return;

    setCart((previous) => ({
      ...previous,
      [product.id]: Math.min(
        (previous[product.id] || 0) + 1,
        product.stock
      ),
    }));

    setBagOpen(true);
  }

  function changeQuantity(product: Product, amount: number) {
    setCart((previous) => ({
      ...previous,
      [product.id]: Math.max(
        0,
        Math.min(
          (previous[product.id] || 0) + amount,
          product.stock
        )
      ),
    }));
  }

  function toggleWishlist(id: number) {
    setWishlist((previous) =>
      previous.includes(id)
        ? previous.filter((item) => item !== id)
        : [...previous, id]
    );
  }

  function chooseCategory(category: string) {
    setSelectedCategory(category);
    setSearch("");
  }

  return (
    <main className="min-h-screen overflow-x-hidden bg-[#FAFCFF] text-[#111B35]">
      {/* ANNOUNCEMENT BAR */}
      <div className="bg-[#1739BA] px-4 py-3 text-center text-[10px] font-extrabold uppercase tracking-[0.18em] text-white sm:text-xs">
        A NEW ERA OF EVERYDAY LUXURY
        <span className="mx-3 text-[#FFE59B]">✦</span>
        DISCOVER THE AURELIA EDIT
      </div>

      {/* NAVIGATION */}
      <header className="sticky top-0 z-40 border-b border-blue-100 bg-white/95 backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-5 px-5 py-5 lg:px-8">
          <a href="#home" className="flex items-center gap-2">
            <span className="flex h-10 w-10 items-center justify-center rounded-full bg-[#1739BA] text-[#FFE59B]">
              <Sparkles size={21} />
            </span>
            <span className="text-2xl font-black tracking-[-0.08em] text-[#1739BA] sm:text-3xl">
              AURELIA<span className="text-[#E8B935]">.</span>
            </span>
          </a>

          <nav className="hidden items-center gap-7 lg:flex">
            {navigation.map((item) => (
              <a
                key={item.title}
                href={item.href}
                className="text-[11px] font-extrabold uppercase tracking-widest transition hover:text-[#4475F2]"
              >
                {item.title}
              </a>
            ))}
          </nav>

          <div className="flex items-center gap-4 sm:gap-5">
            <button
              type="button"
              aria-label="Search products"
              onClick={() => setSearchOpen(!searchOpen)}
              className="transition hover:text-[#4475F2]"
            >
              <Search size={21} />
            </button>

            <a
              href="#newsletter"
              aria-label="Newsletter"
              className="hidden transition hover:text-[#4475F2] sm:block"
            >
              <UserRound size={21} />
            </a>

            <button
              type="button"
              aria-label="Open shopping bag"
              onClick={() => setBagOpen(true)}
              className="relative"
            >
              <ShoppingBag size={22} />
              {cartCount > 0 && (
                <span className="absolute -right-3 -top-3 flex h-5 w-5 items-center justify-center rounded-full bg-[#1739BA] text-[10px] font-bold text-white">
                  {cartCount}
                </span>
              )}
            </button>

            <button
              type="button"
              aria-label="Toggle navigation"
              onClick={() => setMenuOpen(!menuOpen)}
              className="lg:hidden"
            >
              {menuOpen ? <X /> : <Menu />}
            </button>
          </div>
        </div>

        {menuOpen && (
          <nav className="space-y-1 border-t border-blue-100 bg-white px-6 py-5 lg:hidden">
            {navigation.map((item) => (
              <a
                key={item.title}
                href={item.href}
                onClick={() => setMenuOpen(false)}
                className="block rounded-lg px-3 py-3 text-sm font-semibold hover:bg-blue-50"
              >
                {item.title}
              </a>
            ))}
          </nav>
        )}

        {searchOpen && (
          <div className="border-t border-blue-100 bg-white px-6 py-5">
            <div className="mx-auto flex max-w-3xl items-center gap-3 border border-blue-200 px-4 py-3">
              <Search size={19} className="text-[#1739BA]" />
              <input
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Search fragrance, skincare, makeup..."
                className="w-full bg-transparent text-sm outline-none"
              />
              <a
                href="#shop"
                onClick={() => setSearchOpen(false)}
                className="text-xs font-extrabold text-[#1739BA]"
              >
                VIEW
              </a>
            </div>
          </div>
        )}
      </header>

      {/* HERO SECTION */}
      <section id="home" className="overflow-hidden bg-[#F1F5FF]">
        <div className="mx-auto grid max-w-[1600px] lg:grid-cols-2">
          <div className="flex min-h-[600px] flex-col justify-center px-7 py-20 sm:px-14 lg:px-20 lg:py-28">
            <div className="mb-8 flex items-center gap-3">
              <span className="h-[2px] w-11 bg-[#1739BA]" />
              <span className="text-xs font-black uppercase tracking-[0.23em] text-[#1739BA]">
                THE SIGNATURE EDIT · 2026
              </span>
            </div>

            <h1 className="text-6xl font-black leading-[0.98] tracking-[-0.065em] sm:text-7xl xl:text-[90px]">
              BEAUTY
              <br />
              WITHOUT
              <br />
              <span className="text-[#1739BA]">LIMITS.</span>
            </h1>

            <p className="mt-8 max-w-lg text-base leading-8 text-slate-600 sm:text-lg">
              Discover a new expression of luxury. Explore curated
              beauty concepts, iconic fragrances and thoughtfully
              presented everyday essentials designed to celebrate
              individuality.
            </p>

            <div className="mt-10 flex flex-wrap gap-5">
              <a
                href="#shop"
                className="inline-flex items-center gap-3 bg-[#1739BA] px-8 py-5 text-xs font-black uppercase tracking-widest text-white shadow-lg shadow-blue-200 transition hover:-translate-y-1 hover:bg-[#0B287F]"
              >
                SHOP THE COLLECTION
                <ArrowUpRight size={19} />
              </a>

              <a
                href="#story"
                className="inline-flex items-center gap-2 border-b-2 border-[#1739BA] pb-2 text-xs font-black uppercase tracking-widest text-[#1739BA]"
              >
                OUR STORY <ArrowRight size={18} />
              </a>
            </div>

            <div className="mt-16 flex items-center gap-5">
              <div className="flex -space-x-2">
                {["✦", "★", "✧"].map((symbol, index) => (
                  <span
                    key={index}
                    className="flex h-10 w-10 items-center justify-center rounded-full border-2 border-white bg-[#FFE59B] text-lg text-[#1739BA]"
                  >
                    {symbol}
                  </span>
                ))}
              </div>

              <div>
                <div className="flex gap-1 text-[#E7B72C]">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Star key={star} size={13} fill="currentColor" />
                  ))}
                </div>
                <p className="mt-1 text-xs font-semibold text-slate-500">
                  Designed to feel extraordinary
                </p>
              </div>
            </div>
          </div>

          <div className="relative min-h-[480px] bg-[#C9D9FF] lg:min-h-[650px]">
            <img
              src="https://images.unsplash.com/photo-1541643600914-78b084683601?w=1500&q=90"
              alt="Elegant fragrance product photography"
              className="absolute inset-0 h-full w-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#081B45]/60 via-transparent to-transparent" />

            <div className="absolute right-7 top-8 rounded-full bg-[#FFE59B] px-6 py-5 text-center text-[11px] font-black tracking-widest text-[#1739BA] shadow-xl">
              THE
              <br />
              NEW EDIT
            </div>

            <div className="absolute bottom-10 left-8 right-8 text-white sm:left-12">
              <p className="mb-3 text-xs font-bold tracking-[0.2em] text-[#FFE59B]">
                THE AURELIA EXPERIENCE
              </p>
              <h2 className="text-3xl font-black tracking-tight sm:text-5xl">
                MADE TO BE ICONIC.
              </h2>
            </div>
          </div>
        </div>
      </section>

      {/* SHOPPING HIGHLIGHTS */}
      <section className="border-y border-blue-100 bg-white">
        <div className="mx-auto grid max-w-7xl gap-7 px-6 py-9 text-center sm:grid-cols-3">
          <div className="flex items-center justify-center gap-3">
            <Truck size={25} className="text-[#1739BA]" />
            <span className="text-xs font-bold uppercase tracking-wider">
              EFFORTLESS SHOPPING
            </span>
          </div>

          <div className="flex items-center justify-center gap-3">
            <ShieldCheck size={25} className="text-[#1739BA]" />
            <span className="text-xs font-bold uppercase tracking-wider">
              THOUGHTFULLY CURATED
            </span>
          </div>

          <div className="flex items-center justify-center gap-3">
            <Sparkles size={25} className="text-[#1739BA]" />
            <span className="text-xs font-bold uppercase tracking-wider">
              EVERYDAY LUXURY
            </span>
          </div>
        </div>
      </section>

      {/* COLLECTIONS */}
      <section id="collections" className="px-6 py-24 lg:py-32">
        <div className="mx-auto max-w-7xl">
          <div className="mb-14 flex flex-wrap items-end justify-between gap-6">
            <div>
              <p className="mb-5 text-xs font-black uppercase tracking-[0.24em] text-[#1739BA]">
                DISCOVER AURELIA
              </p>

              <h2 className="text-4xl font-black tracking-[-0.06em] sm:text-6xl">
                THE ART OF
                <br />
                <span className="text-[#1739BA]">DISCOVERY.</span>
              </h2>
            </div>

            <p className="max-w-sm text-sm leading-8 text-slate-500">
              Explore three distinctive beauty categories,
              each with its own personality and creative inspiration.
            </p>
          </div>

          <div className="grid gap-7 md:grid-cols-3">
            {collections.map((collection) => (
              <div
                key={collection.name}
                className="group overflow-hidden bg-white shadow-sm transition hover:shadow-xl hover:shadow-blue-100"
              >
                <a
                  href="#shop"
                  onClick={() => chooseCategory(collection.name)}
                  className="relative block h-[350px] overflow-hidden bg-[#E8EFFF]"
                >
                  <img
                    src={collection.image}
                    alt={collection.name}
                    className="h-full w-full object-cover transition duration-700 group-hover:scale-110"
                  />

                  <div className="absolute inset-0 bg-gradient-to-t from-black/65 via-transparent to-transparent" />

                  <div className="absolute bottom-7 left-7 text-white">
                    <p className="mb-2 text-xs font-semibold tracking-wider text-[#FFE59B]">
                      {collection.subtitle}
                    </p>

                    <h3 className="text-3xl font-black">
                      {collection.name}
                    </h3>
                  </div>
                </a>

                <div className="p-7">
                  <p className="min-h-24 text-sm leading-8 text-slate-500">
                    {collection.description}
                  </p>

                  <a
                    href="#shop"
                    onClick={() => chooseCategory(collection.name)}
                    className="mt-5 inline-flex items-center gap-2 text-xs font-black uppercase tracking-wider text-[#1739BA]"
                  >
                    EXPLORE COLLECTION
                    <ArrowUpRight size={19} />
                  </a>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* DYNAMIC PRODUCT GALLERY */}
      <section id="shop" className="bg-[#F0F5FF] px-6 py-24 lg:py-32">
        <div className="mx-auto max-w-7xl">
          <div className="mx-auto mb-12 max-w-2xl text-center">
            <p className="mb-5 text-xs font-black uppercase tracking-[0.24em] text-[#1739BA]">
              CURATED FOR YOU
            </p>

            <h2 className="text-4xl font-black tracking-[-0.06em] sm:text-6xl">
              THE AURELIA
              <span className="text-[#1739BA]"> EDIT.</span>
            </h2>

            <p className="mt-6 text-sm leading-8 text-slate-500">
              Explore our database-powered product collection.
              Product information, prices and stock availability
              are retrieved from NeonDB.
            </p>
          </div>

          {/* CATEGORY FILTERS */}
          <div className="mb-10 flex flex-wrap items-center justify-center gap-3">
            {["All", "Fragrance", "Skincare", "Makeup"].map(
              (category) => (
                <button
                  key={category}
                  type="button"
                  onClick={() => chooseCategory(category)}
                  className={`px-6 py-3 text-xs font-black uppercase tracking-wider transition ${
                    selectedCategory === category
                      ? "bg-[#1739BA] text-white"
                      : "border border-blue-200 bg-white text-[#1739BA] hover:bg-[#E1E9FF]"
                  }`}
                >
                  {category}
                </button>
              )
            )}

            <button
              type="button"
              onClick={() => void loadProducts()}
              disabled={loading}
              className="flex items-center gap-2 border border-blue-200 bg-white px-5 py-3 text-xs font-bold text-[#1739BA] disabled:opacity-50"
            >
              <RefreshCw size={15} />
              REFRESH
            </button>
          </div>

          {/* LOADING STATE */}
          {loading && (
            <div className="flex flex-col items-center justify-center py-24 text-[#1739BA]">
              <Loader2 size={42} className="animate-spin" />
              <p className="mt-5 text-sm font-bold">
                Loading the AURELIA collection...
              </p>
            </div>
          )}

          {/* ERROR STATE */}
          {!loading && error && (
            <div className="mx-auto max-w-xl border border-red-200 bg-white px-8 py-12 text-center">
              <h3 className="text-xl font-black text-red-600">
                Unable to Load Products
              </h3>

              <p className="mt-4 text-sm leading-7 text-slate-500">
                {error}
              </p>

              <button
                type="button"
                onClick={() => void loadProducts()}
                className="mt-7 bg-[#1739BA] px-7 py-4 text-xs font-black text-white"
              >
                TRY AGAIN
              </button>
            </div>
          )}

          {/* PRODUCTS */}
          {!loading && !error && (
            <>
              <div className="grid gap-7 sm:grid-cols-2 lg:grid-cols-4">
                {filteredProducts.map((product) => (
                  <article
                    key={product.id}
                    className="group flex flex-col bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-xl hover:shadow-blue-100"
                  >
                    <div className="relative h-[310px] overflow-hidden bg-[#E8EFFF]">
                      {product.image ? (
                        <img
                          src={product.image}
                          alt={product.name}
                          className="h-full w-full object-cover transition duration-700 group-hover:scale-110"
                        />
                      ) : (
                        <div className="flex h-full items-center justify-center">
                          <Sparkles
                            size={58}
                            className="text-[#1739BA]"
                          />
                        </div>
                      )}

                      {product.badge && (
                        <span className="absolute left-4 top-4 bg-[#FFE59B] px-3 py-2 text-[10px] font-black tracking-wider text-[#1739BA]">
                          {product.badge}
                        </span>
                      )}

                      <button
                        type="button"
                        aria-label={`Toggle wishlist for ${product.name}`}
                        onClick={() => toggleWishlist(product.id)}
                        className="absolute right-4 top-4 flex h-10 w-10 items-center justify-center rounded-full bg-white shadow-md"
                      >
                        <Heart
                          size={19}
                          className={
                            wishlist.includes(product.id)
                              ? "fill-red-500 text-red-500"
                              : "text-[#1739BA]"
                          }
                        />
                      </button>

                      {product.stock === 0 && (
                        <span className="absolute bottom-4 left-4 bg-[#111B35] px-4 py-2 text-xs font-bold text-white">
                          OUT OF STOCK
                        </span>
                      )}
                    </div>

                    <div className="flex flex-1 flex-col p-6">
                      <p className="text-[10px] font-black tracking-[0.2em] text-[#4475F2]">
                        {(product.category || "COLLECTION").toUpperCase()}
                      </p>

                      <h3 className="mt-4 text-xl font-black leading-7">
                        {product.name}
                      </h3>

                      <p className="mt-4 flex-1 text-sm leading-7 text-slate-500">
                        {product.description}
                      </p>

                      <div className="mt-6 flex items-center gap-3">
                        <span className="text-2xl font-black text-[#1739BA]">
                          {formatPrice(product.price)}
                        </span>

                        {product.oldPrice !== null && (
                          <span className="text-sm text-slate-400 line-through">
                            {formatPrice(product.oldPrice)}
                          </span>
                        )}
                      </div>

                      <p
                        className={`mt-4 text-xs font-semibold ${
                          product.stock > 0
                            ? "text-emerald-700"
                            : "text-red-600"
                        }`}
                      >
                        {product.stock > 0
                          ? `${product.stock} available in stock`
                          : "Currently unavailable"}
                      </p>

                      <button
                        type="button"
                        onClick={() => addToCart(product)}
                        disabled={product.stock <= 0}
                        className="mt-6 flex w-full items-center justify-center gap-3 bg-[#1739BA] px-4 py-4 text-xs font-black uppercase tracking-widest text-white transition hover:bg-[#0B287F] disabled:cursor-not-allowed disabled:bg-slate-300"
                      >
                        <ShoppingBag size={18} />
                        {product.stock > 0
                          ? "ADD TO BAG"
                          : "OUT OF STOCK"}
                      </button>
                    </div>
                  </article>
                ))}
              </div>

              {filteredProducts.length === 0 && (
                <div className="py-20 text-center">
                  <Search
                    size={40}
                    className="mx-auto text-[#1739BA]"
                  />

                  <h3 className="mt-5 text-xl font-black">
                    No Products Found
                  </h3>

                  <p className="mt-3 text-sm text-slate-500">
                    Try another category or search term.
                  </p>

                  <button
                    type="button"
                    onClick={() => {
                      setSearch("");
                      setSelectedCategory("All");
                    }}
                    className="mt-6 bg-[#1739BA] px-7 py-3 text-xs font-bold text-white"
                  >
                    SHOW ALL PRODUCTS
                  </button>
                </div>
              )}
            </>
          )}

          <p className="mt-10 text-center text-xs text-slate-400">
            Demonstration products and stock records stored in NeonDB.
            Prices are illustrative.
          </p>
        </div>
      </section>

      {/* SIGNATURE COLLECTION */}
      <section className="px-6 py-24 lg:py-32">
        <div className="mx-auto max-w-7xl">
          <div className="mb-12 flex flex-wrap items-end justify-between gap-6">
            <div>
              <p className="mb-5 text-xs font-black uppercase tracking-[0.24em] text-[#1739BA]">
                A CURATED EXPERIENCE
              </p>

              <h2 className="text-4xl font-black tracking-[-0.06em] sm:text-6xl">
                THE SIGNATURE
                <br />
                <span className="text-[#1739BA]">COLLECTION.</span>
              </h2>
            </div>

            <p className="max-w-sm text-sm leading-8 text-slate-500">
              A celebration of contemporary beauty, thoughtful
              presentation and sophisticated personal expression.
            </p>
          </div>

          <div className="grid overflow-hidden bg-[#F0F4FF] lg:grid-cols-2">
            <div className="relative min-h-[440px] lg:min-h-[610px]">
              <img
                src="https://images.unsplash.com/photo-1523293182086-7651a899d37f?w=1400&q=85"
                alt="Signature fragrance"
                className="absolute inset-0 h-full w-full object-cover"
              />

              <span className="absolute bottom-8 left-8 bg-[#FFE59B] px-5 py-3 text-xs font-black tracking-wider text-[#1739BA]">
                THE AURELIA EDIT
              </span>
            </div>

            <div className="flex flex-col justify-center px-8 py-16 sm:px-14 lg:px-16">
              <Sparkles
                size={38}
                className="mb-8 text-[#1739BA]"
              />

              <p className="mb-5 text-xs font-black uppercase tracking-[0.2em] text-[#4475F2]">
                A NEW EXPRESSION OF LUXURY
              </p>

              <h3 className="text-4xl font-black leading-tight tracking-[-0.06em] sm:text-5xl">
                EVERY DETAIL
                <br />
                TELLS A STORY.
              </h3>

              <p className="mt-7 text-base leading-8 text-slate-600">
                AURELIA brings together the artistry of fragrance,
                the simplicity of daily beauty rituals and the
                confidence that comes from expressing your
                personal style.
              </p>

              <p className="mt-5 text-sm leading-8 text-slate-500">
                Our signature concept combines carefully composed
                visuals, informative product descriptions and an
                intuitive browsing experience. Every detail is
                designed to make the digital storefront feel
                considered, welcoming and memorable.
              </p>

              <div className="mt-9 space-y-4">
                {[
                  "Thoughtfully presented collections",
                  "Premium editorial product experiences",
                  "A distinctive modern visual identity",
                ].map((feature) => (
                  <div
                    key={feature}
                    className="flex items-center gap-3"
                  >
                    <CheckCircle2
                      size={21}
                      className="text-[#1739BA]"
                    />
                    <span className="text-sm font-semibold">
                      {feature}
                    </span>
                  </div>
                ))}
              </div>

              <a
                href="#shop"
                className="mt-10 inline-flex w-fit items-center gap-3 bg-[#1739BA] px-8 py-5 text-xs font-black uppercase tracking-widest text-white"
              >
                DISCOVER THE EDIT
                <ArrowUpRight size={19} />
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* BEAUTY RITUAL GUIDE */}
      <section className="bg-[#F4F7FF] px-6 py-24 lg:py-32">
        <div className="mx-auto max-w-7xl">
          <div className="mx-auto mb-16 max-w-3xl text-center">
            <p className="mb-5 text-xs font-black uppercase tracking-[0.24em] text-[#1739BA]">
              THE AURELIA EXPERIENCE
            </p>

            <h2 className="text-4xl font-black tracking-[-0.06em] sm:text-6xl">
              YOUR BEAUTY.
              <br />
              <span className="text-[#1739BA]">
                YOUR RITUAL.
              </span>
            </h2>

            <p className="mt-7 text-base leading-8 text-slate-500">
              Beauty is more than the products we choose.
              It is also about the everyday moments we create
              for ourselves. Discover four thoughtful ideas
              for a simple routine.
            </p>
          </div>

          <div className="grid gap-7 md:grid-cols-2">
            {rituals.map((ritual) => {
              const Icon = ritual.icon;

              return (
                <article
                  key={ritual.number}
                  className="border border-blue-100 bg-white p-8 transition hover:-translate-y-1 hover:shadow-xl hover:shadow-blue-100 sm:p-10"
                >
                  <div className="mb-8 flex items-start justify-between">
                    <div
                      className={`flex h-16 w-16 items-center justify-center ${ritual.background}`}
                    >
                      <Icon size={30} className={ritual.color} />
                    </div>

                    <span className="text-6xl font-black text-[#E5ECFF]">
                      {ritual.number}
                    </span>
                  </div>

                  <p className="text-[11px] font-black uppercase tracking-[0.2em] text-[#4475F2]">
                    {ritual.tag}
                  </p>

                  <h3 className="mt-4 text-2xl font-black tracking-tight sm:text-3xl">
                    {ritual.title}
                  </h3>

                  <p className="mt-5 text-sm leading-8 text-slate-500">
                    {ritual.description}
                  </p>

                  <div className="mt-8 flex items-center gap-2 text-xs font-black tracking-wider text-[#1739BA]">
                    AURELIA BEAUTY NOTES
                    <Sparkles size={17} />
                  </div>
                </article>
              );
            })}
          </div>

          <p className="mx-auto mt-8 max-w-3xl text-center text-xs leading-6 text-slate-400">
            This guide provides general lifestyle information
            rather than personalised dermatological advice.
            Always follow the instructions for individual products.
          </p>
        </div>
      </section>

      {/* OUR STORY */}
      <section id="story" className="overflow-hidden bg-[#1739BA] text-white">
        <div className="mx-auto grid max-w-[1600px] lg:grid-cols-2">
          <div className="relative min-h-[440px]">
            <img
              src="https://images.unsplash.com/photo-1608248543803-ba4f8c70ae0b?w=1400&q=85"
              alt="Beauty essentials and skincare inspiration"
              className="absolute inset-0 h-full w-full object-cover"
            />
          </div>

          <div className="flex flex-col justify-center px-8 py-24 sm:px-16 lg:px-20">
            <p className="mb-6 text-xs font-black tracking-[0.25em] text-[#FFE59B]">
              THE STORY BEHIND THE BRAND
            </p>

            <h2 className="text-5xl font-black leading-tight tracking-[-0.06em] sm:text-6xl">
              MORE THAN
              <br />
              BEAUTY.
              <br />
              <span className="text-[#FFE59B]">
                A FEELING.
              </span>
            </h2>

            <p className="mt-8 text-base leading-8 text-blue-100">
              AURELIA is a conceptual luxury beauty brand
              developed around confidence, individuality and
              modern digital craftsmanship. Its purpose is to
              explore how a beautifully designed online store
              can create an engaging and intuitive customer
              experience.
            </p>

            <p className="mt-5 text-sm leading-8 text-blue-100">
              From editorial storytelling to database-powered
              product displays, the concept celebrates the balance
              between aesthetics and functionality. Every
              collection, product detail and digital interaction
              is part of a consistent brand experience.
            </p>

            <a
              href="#journal"
              className="mt-10 inline-flex w-fit items-center gap-3 border-b border-[#FFE59B] pb-3 text-xs font-black tracking-widest text-[#FFE59B]"
            >
              EXPLORE OUR JOURNAL
              <ArrowRight size={19} />
            </a>
          </div>
        </div>
      </section>

      {/* BEAUTY JOURNAL */}
      <section id="journal" className="px-6 py-24 lg:py-32">
        <div className="mx-auto max-w-7xl">
          <div className="mb-14 flex flex-wrap items-end justify-between gap-6">
            <div>
              <div className="mb-5 flex items-center gap-3">
                <BookOpen
                  size={20}
                  className="text-[#1739BA]"
                />

                <p className="text-xs font-black uppercase tracking-[0.24em] text-[#1739BA]">
                  STORIES & INSPIRATION
                </p>
              </div>

              <h2 className="text-4xl font-black tracking-[-0.06em] sm:text-6xl">
                THE BEAUTY
                <br />
                <span className="text-[#1739BA]">
                  JOURNAL.
                </span>
              </h2>
            </div>

            <p className="max-w-sm text-sm leading-8 text-slate-500">
              Explore stories about beauty routines, fragrance
              inspiration, personal expression and the creative
              ideas behind our editorial collections.
            </p>
          </div>

          <div className="grid gap-8 md:grid-cols-3">
            {journal.map((article) => (
              <article
                key={article.number}
                className="group overflow-hidden border border-slate-100 bg-white shadow-sm transition hover:shadow-xl hover:shadow-blue-100"
              >
                <div className="relative h-[290px] overflow-hidden bg-[#E7EFFF]">
                  <img
                    src={article.image}
                    alt={article.title}
                    className="h-full w-full object-cover transition duration-700 group-hover:scale-110"
                  />

                  <div className="absolute left-5 top-5 flex h-12 w-12 items-center justify-center bg-[#FFE59B] font-black text-[#1739BA]">
                    {article.number}
                  </div>
                </div>

                <div className="p-7">
                  <p className="text-[10px] font-black tracking-[0.2em] text-[#4475F2]">
                    {article.category}
                  </p>

                  <h3 className="mt-5 text-2xl font-black leading-tight">
                    {article.title}
                  </h3>

                  <p className="mt-5 text-sm leading-8 text-slate-500">
                    {article.description}
                  </p>

                  <div className="mt-8 flex items-center gap-2 border-t border-slate-100 pt-5 text-xs font-black tracking-wider text-[#1739BA]">
                    EDITORIAL PREVIEW
                    <ArrowUpRight size={18} />
                  </div>
                </div>
              </article>
            ))}
          </div>

          <p className="mt-8 text-center text-xs text-slate-400">
            Editorial previews only. Full article pages will
            be developed in a later stage.
          </p>
        </div>
      </section>

      {/* BRAND PHILOSOPHY */}
      <section className="bg-[#1739BA] px-6 py-24 text-center text-white lg:py-32">
        <div className="mx-auto max-w-5xl">
          <Sparkles
            size={40}
            className="mx-auto text-[#FFE59B]"
          />

          <p className="mt-8 text-xs font-black uppercase tracking-[0.27em] text-[#FFE59B]">
            THE AURELIA PHILOSOPHY
          </p>

          <h2 className="mt-8 text-4xl font-black leading-tight tracking-[-0.06em] sm:text-6xl">
            CONFIDENCE IS
            <br />
            YOUR MOST
            <br />
            <span className="text-[#FFE59B]">
              BEAUTIFUL SIGNATURE.
            </span>
          </h2>

          <p className="mx-auto mt-8 max-w-2xl text-base leading-8 text-blue-100">
            Our concept of luxury is built around personal
            expression, thoughtful details and memorable
            experiences. We believe digital shopping should
            feel inspiring, intuitive and beautifully designed.
          </p>

          <a
            href="#shop"
            className="mt-10 inline-flex items-center gap-3 bg-[#FFE59B] px-8 py-5 text-xs font-black tracking-widest text-[#1739BA]"
          >
            EXPLORE AURELIA
            <ArrowRight size={19} />
          </a>
        </div>
      </section>

      {/* FAQ SECTION */}
      <section id="faq" className="bg-[#F8FAFF] px-6 py-24 lg:py-32">
        <div className="mx-auto grid max-w-7xl gap-14 lg:grid-cols-5">
          <div className="lg:col-span-2">
            <p className="mb-5 text-xs font-black uppercase tracking-[0.24em] text-[#1739BA]">
              HELP & INFORMATION
            </p>

            <h2 className="text-4xl font-black leading-tight tracking-[-0.06em] sm:text-5xl">
              YOUR
              <br />
              QUESTIONS.
              <br />
              <span className="text-[#1739BA]">
                ANSWERED.
              </span>
            </h2>

            <p className="mt-7 max-w-sm text-sm leading-8 text-slate-500">
              Everything you need to know about the AURELIA
              concept, database-powered product collections
              and shopping features currently available.
            </p>

            <div className="mt-9 inline-flex items-center gap-3 bg-[#FFE59B] px-5 py-4 text-xs font-black tracking-wider text-[#1739BA]">
              <Sparkles size={18} />
              DESIGNED WITH CLARITY
            </div>
          </div>

          <div className="space-y-3 lg:col-span-3">
            {faqs.map((item, index) => {
              const isOpen = openFaq === index;

              return (
                <div
                  key={item.question}
                  className="border border-blue-100 bg-white"
                >
                  <button
                    type="button"
                    aria-expanded={isOpen}
                    onClick={() =>
                      setOpenFaq(isOpen ? null : index)
                    }
                    className="flex w-full items-center justify-between gap-5 px-6 py-6 text-left"
                  >
                    <span className="text-sm font-bold leading-6 sm:text-base">
                      {item.question}
                    </span>

                    <ChevronDown
                      size={22}
                      className={`shrink-0 text-[#1739BA] transition-transform ${
                        isOpen ? "rotate-180" : ""
                      }`}
                    />
                  </button>

                  {isOpen && (
                    <div className="border-t border-blue-50 px-6 py-6">
                      <p className="text-sm leading-8 text-slate-500">
                        {item.answer}
                      </p>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* NEWSLETTER */}
      <section id="newsletter" className="bg-[#FFE59B] px-6 py-24">
        <div className="mx-auto max-w-3xl text-center">
          <Sparkles
            size={37}
            className="mx-auto text-[#1739BA]"
          />

          <p className="mt-6 text-xs font-black uppercase tracking-[0.24em] text-[#1739BA]">
            THE INNER CIRCLE
          </p>

          <h2 className="mt-5 text-4xl font-black tracking-[-0.06em] sm:text-6xl">
            GOOD THINGS
            <br />
            ARE COMING.
          </h2>

          <p className="mx-auto mt-6 max-w-lg text-sm leading-8 text-[#36415C]">
            Discover new collection inspiration, beauty stories
            and future developments from our luxury e-commerce
            concept.
          </p>

          <form
            className="mx-auto mt-9 flex max-w-lg flex-col gap-3 sm:flex-row"
            onSubmit={(event) => {
              event.preventDefault();
              if (email.trim().includes("@")) {
                setSubscribed(true);
              }
            }}
          >
            <input
              type="email"
              required
              value={email}
              onChange={(event) => {
                setEmail(event.target.value);
                setSubscribed(false);
              }}
              placeholder="Your email address"
              className="min-w-0 flex-1 bg-white px-6 py-4 text-sm text-slate-900 outline-none"
            />

            <button
              type="submit"
              className="bg-[#1739BA] px-8 py-4 text-xs font-black tracking-widest text-white"
            >
              JOIN THE EDIT
            </button>
          </form>

          {subscribed && (
            <p className="mt-5 flex items-center justify-center gap-2 text-sm font-semibold text-[#1739BA]">
              <Check size={18} />
              Demo form submitted. Email delivery is not enabled.
            </p>
          )}
        </div>
      </section>

      {/* FOOTER */}
      <footer className="bg-[#0B1735] px-6 py-16 text-white">
        <div className="mx-auto max-w-7xl">
          <div className="grid gap-12 md:grid-cols-3">
            <div>
              <h2 className="text-3xl font-black tracking-[-0.08em]">
                AURELIA
                <span className="text-[#FFE59B]">.</span>
              </h2>

              <p className="mt-6 max-w-xs text-sm leading-8 text-slate-400">
                A modern exploration of beauty, creativity and
                elevated digital experiences. Designed as an
                educational luxury e-commerce portfolio project.
              </p>
            </div>

            <div>
              <h3 className="mb-7 text-xs font-bold tracking-widest text-[#FFE59B]">
                EXPLORE
              </h3>

              <div className="flex flex-col gap-4 text-sm text-slate-300">
                {navigation.map((item) => (
                  <a key={item.title} href={item.href}>
                    {item.title}
                  </a>
                ))}
              </div>
            </div>

            <div>
              <h3 className="mb-7 text-xs font-bold tracking-widest text-[#FFE59B]">
                THE AURELIA EXPERIENCE
              </h3>

              <p className="text-sm leading-8 text-slate-300">
                A distinctive beauty concept bringing together
                thoughtful storytelling, database-driven product
                displays and modern shopping interactions.
              </p>

              <div className="mt-6 flex gap-5 text-slate-300">
                <Camera size={22} />
                <Heart size={22} />
                <Sparkles size={22} />
              </div>
            </div>
          </div>

          <div className="mt-14 flex flex-wrap justify-between gap-4 border-t border-white/15 pt-7 text-xs text-slate-400">
            <p>
              © 2026 AURELIA. Educational Concept Project.
            </p>
            <p>DESIGNED TO BE DIFFERENT.</p>
          </div>
        </div>
      </footer>

      {/* SHOPPING BAG DRAWER */}
      {bagOpen && (
        <div className="fixed inset-0 z-[100] flex justify-end bg-black/55">
          <button
            type="button"
            aria-label="Close shopping bag overlay"
            onClick={() => setBagOpen(false)}
            className="absolute inset-0"
          />

          <aside className="relative z-10 flex h-full w-full max-w-md flex-col bg-white shadow-2xl">
            <div className="flex items-center justify-between border-b border-blue-100 p-6">
              <div>
                <h2 className="text-2xl font-black text-[#1739BA]">
                  YOUR BAG
                </h2>
                <p className="mt-1 text-xs text-slate-500">
                  {cartCount} items selected
                </p>
              </div>

              <button
                type="button"
                aria-label="Close shopping bag"
                onClick={() => setBagOpen(false)}
              >
                <X size={24} />
              </button>
            </div>

            <div className="flex-1 space-y-5 overflow-y-auto p-6">
              {cartCount === 0 && (
                <div className="py-20 text-center text-slate-500">
                  <ShoppingBag
                    size={48}
                    className="mx-auto mb-5"
                  />
                  Your shopping bag is empty.
                </div>
              )}

              {cartProducts.map((product) => (
                <div
                  key={product.id}
                  className="flex gap-4 border-b border-slate-100 pb-5"
                >
                  {product.image ? (
                    <img
                      src={product.image}
                      alt={product.name}
                      className="h-24 w-24 object-cover"
                    />
                  ) : (
                    <div className="flex h-24 w-24 items-center justify-center bg-blue-50">
                      <Sparkles
                        size={25}
                        className="text-[#1739BA]"
                      />
                    </div>
                  )}

                  <div className="flex-1">
                    <h3 className="font-bold">
                      {product.name}
                    </h3>

                    <p className="mt-2 font-semibold text-[#1739BA]">
                      {formatPrice(product.price)}
                    </p>

                    <div className="mt-3 flex w-fit items-center gap-4 border px-3 py-2">
                      <button
                        type="button"
                        aria-label={`Decrease quantity of ${product.name}`}
                        onClick={() =>
                          changeQuantity(product, -1)
                        }
                      >
                        <Minus size={16} />
                      </button>

                      <span className="text-sm font-bold">
                        {Math.min(
                          cart[product.id] || 0,
                          product.stock
                        )}
                      </span>

                      <button
                        type="button"
                        aria-label={`Increase quantity of ${product.name}`}
                        disabled={
                          (cart[product.id] || 0) >= product.stock
                        }
                        onClick={() =>
                          changeQuantity(product, 1)
                        }
                        className="disabled:opacity-30"
                      >
                        <Plus size={16} />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="border-t border-blue-100 p-6">
              <div className="mb-5 flex justify-between text-lg font-black">
                <span>SUBTOTAL</span>
                <span>{formatPrice(subtotal)}</span>
              </div>

              <p className="mb-5 text-xs leading-6 text-slate-500">
                Demo checkout only. No real payment is collected or
                physical order shipped.
              </p>

              <div className="space-y-3">
                <button
                  type="button"
                  disabled={cartCount === 0}
                  onClick={() => {
                    const checkoutItems = cartProducts.map((product) => ({
                      id: product.id,
                      quantity: Math.min(
                        cart[product.id] || 0,
                        product.stock
                      ),
                    }));

                    if (checkoutItems.length === 0) {
                      return;
                    }

                    window.localStorage.setItem(
                      "aurelia_checkout_cart",
                      JSON.stringify(checkoutItems)
                    );

                    window.location.assign("/checkout");
                  }}
                  className="flex w-full items-center justify-center gap-3 bg-[#1739BA] px-5 py-5 text-xs font-black uppercase tracking-widest text-white transition hover:bg-[#102B91] disabled:cursor-not-allowed disabled:opacity-50"
                >
                  PROCEED TO CHECKOUT
                  <ArrowRight size={19} />
                </button>

                <button
                  type="button"
                  onClick={() => setBagOpen(false)}
                  className="w-full border border-[#1739BA] bg-white px-5 py-4 text-xs font-black uppercase tracking-widest text-[#1739BA] transition hover:bg-[#FFE59B]"
                >
                  CONTINUE SHOPPING
                </button>
              </div>
            </div>
          </aside>
        </div>
      )}
    </main>
  );
}
