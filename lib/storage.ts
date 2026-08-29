import { supabase } from "./supabase";

/**
 * DATABASE OPERATIONS - PRODUCTS
 */

export async function getProducts() {
  const { data, error } = await supabase
    .from("products")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error fetching products:", error);
    return [];
  }
  return data;
}

export async function getProductById(id: string) {
  const { data, error } = await supabase
    .from("products")
    .select("*")
    .eq("id", id)
    .single();

  if (error) {
    console.error("Error fetching product by ID:", error);
    return null;
  }
  return data;
}

export async function addProduct(product: any) {
  const { data, error } = await supabase
    .from("products")
    .insert([product])
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function updateProduct(id: string, updates: any) {
  const { data, error } = await supabase
    .from("products")
    .update(updates)
    .eq("id", id)
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function getProductsByOwner(email: string) {
  const { data, error } = await supabase
    .from("products")
    .select("*")
    .eq("owner", email);

  if (error) {
    console.error("Error fetching owner products:", error);
    return [];
  }
  return data;
}

export async function deleteProduct(id: string) {
  const { error } = await supabase
    .from("products")
    .delete()
    .eq("id", id);

  if (error) throw error;
}

/**
 * STORAGE OPERATIONS
 */

export async function uploadProductImage(file: File): Promise<string | null> {
  try {
    const fileExt = file.name.split(".").pop();
    const fileName = `${crypto.randomUUID()}.${fileExt}`;
    const filePath = `${fileName}`;

    const { error } = await supabase.storage
      .from("product-images")
      .upload(filePath, file, { upsert: true });

    if (error) throw error;

    const { data: { publicUrl } } = supabase.storage
      .from("product-images")
      .getPublicUrl(filePath);

    return publicUrl;
  } catch (err) {
    console.error("Image Upload Error:", err);
    return null;
  }
}

export async function uploadProfileImage(file: File, userId: string): Promise<string | null> {
  try {
    const fileExt = file.name.split(".").pop();
    const filePath = `${userId}/avatar-${Date.now()}.${fileExt}`;

    const { error } = await supabase.storage
      .from("profile-images")
      .upload(filePath, file, {
        cacheControl: "3600",
        upsert: true,
      });

    if (error) throw error;

    const { data: { publicUrl } } = supabase.storage
      .from("profile-images")
      .getPublicUrl(filePath);

    return publicUrl;
  } catch (err) {
    console.error("Profile Image Upload Error:", err);
    return null;
  }
}

export async function updateProfileAvatar(userId: string, avatarUrl: string) {
  const { data, error } = await supabase
    .from("profiles")
    .upsert({ id: userId, avatar_url: avatarUrl }, { onConflict: "id" })
    .select()
    .single();

  if (error) throw error;
  return data;
}

/**
 * DATABASE OPERATIONS - ORDERS
 */

export async function getOrders() {
  const { data, error } = await supabase
    .from("orders")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) return [];
  return data;
}

export async function getOrdersByBuyer(email: string) {
  const { data, error } = await supabase
    .from("orders")
    .select("*")
    .eq("buyer", email)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error fetching buyer orders:", error);
    return [];
  }
  return data;
}

export async function getOrdersBySeller(email: string) {
  const { data, error } = await supabase
    .from("orders")
    .select("*")
    .eq("seller", email)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error fetching seller orders:", error);
    return [];
  }
  return data;
}

export async function addOrder(order: any) {
  const { data, error } = await supabase
    .from("orders")
    .insert([{
      product_name: order.productName,
      buyer: order.buyer,
      seller: order.seller,
      status: "pending",
    }])
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function updateOrder(id: string, updates: any) {
  const { error } = await supabase
    .from("orders")
    .update(updates)
    .eq("id", id);

  if (error) throw error;
}

/**
 * PAYMENTS — Flutterwave integration
 *
 * Added alongside addOrder() rather than replacing it, so anything else
 * still calling addOrder() for a non-payment flow is untouched.
 * createPaidOrder() must only ever be called from the server (via
 * lib/payments/fulfill.ts), after Flutterwave verification has already
 * succeeded — never directly from client code.
 */

type CreatePaidOrderInput = {
  productId: string;
  productName: string;
  buyer: string;
  seller: string;
  amount: number;
  txRef: string;
  flwTransactionId: string;
};

export async function createPaidOrder(input: CreatePaidOrderInput) {
  const { data, error } = await supabase
    .from("orders")
    .insert([{
      product_id: input.productId,
      product_name: input.productName,
      buyer: input.buyer,
      seller: input.seller,
      amount: input.amount,
      status: "paid",
      payment_status: "paid",
      tx_ref: input.txRef,
      flw_transaction_id: input.flwTransactionId,
    }])
    .select()
    .single();

  if (error) throw error;
  return data;
}

/**
 * DATABASE OPERATIONS - INQUIRIES
 */

export async function submitInquiry(inquiry: any) {
  const { data, error } = await supabase
    .from("inquiries")
    .insert([inquiry])
    .select()
    .single();

  if (error) throw error;
  return data;
}

/**
 * DATABASE OPERATIONS - MESSAGES
 */

export async function getMyConversations(email: string) {
  const { data, error } = await supabase
    .from("messages")
    .select("*")
    .or(`sender_email.eq.${email},receiver_email.eq.${email}`)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error fetching conversations:", error);
    return [];
  }
  return data;
}

export async function getMessagesBetween(emailA: string, emailB: string) {
  const { data, error } = await supabase
    .from("messages")
    .select("*")
    .or(`and(sender_email.eq.${emailA},receiver_email.eq.${emailB}),and(sender_email.eq.${emailB},receiver_email.eq.${emailA})`)
    .order("created_at", { ascending: true });

  if (error) {
    console.error("Error fetching messages:", error);
    return [];
  }
  return data;
}

export async function sendMessage(message: any) {
  const { data, error } = await supabase
    .from("messages")
    .insert([{
      sender_email: message.sender_email,
      receiver_email: message.receiver_email,
      content: message.content,
      is_read: false,
    }])
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function markMessagesAsRead(receiverEmail: string, senderEmail: string) {
  const { error } = await supabase
    .from("messages")
    .update({ is_read: true })
    .eq("receiver_email", receiverEmail)
    .eq("sender_email", senderEmail)
    .eq("is_read", false);

  if (error) console.error("Error marking messages read:", error);
}

/**
 * SELLER PROFILE & CATEGORIES
 */

export async function getSellerProfile(email: string) {
  const { data, error } = await supabase
    .from("profiles")
    .select("*")
    .eq("email", email)
    .maybeSingle();

  if (error) {
    console.error("Error fetching seller profile:", error);
    return { email, business_name: email };
  }
  if (!data) {
    return { email, business_name: email };
  }

  return {
    email: data.email,
    business_name: data.company_name || data.full_name || email,
    logo_url: data.avatar_url || null,
    description: data.about_business || null,
    city: data.city || null,
    state: data.state || null,
    country: data.country || null,
    is_verified: data.verification_level === "Level 1" || data.verification_level === "Level 2",
    verification_badge: data.verification_level ? `${data.verification_level} Verified` : null,
    year_established: data.year_established || null,
    main_products: data.main_products || null,
    export_capable: data.export_capable || null,
  };
}

const CATEGORY_DATA: { id: string; name: string; subcategories: string[] }[] = [
  { id: "agriculture-food", name: "Agriculture & Food", subcategories: [
    "Grains & Cereals", "Fresh Produce", "Livestock & Poultry", "Fish & Seafood",
    "Cocoa & Coffee", "Spices & Seasonings", "Cooking Oils", "Processed Foods",
  ]},
  { id: "apparel-accessories", name: "Apparel & Accessories", subcategories: [
    "Men's Clothing", "Women's Clothing", "Children's Clothing", "Footwear",
    "Bags & Luggage", "Jewelry & Watches", "Fabrics & Textiles",
  ]},
  { id: "chemicals", name: "Chemicals", subcategories: [
    "Industrial Chemicals", "Agrochemicals", "Petrochemicals", "Cleaning Chemicals",
    "Dyes & Pigments", "Adhesives & Sealants",
  ]},
  { id: "computer-products", name: "Computer Products", subcategories: [
    "Laptops & Desktops", "Computer Accessories", "Networking Equipment",
    "Storage Devices", "Software",
  ]},
  { id: "construction-decoration", name: "Construction & Decoration", subcategories: [
    "Building Materials", "Cement & Concrete", "Roofing", "Doors & Windows",
    "Paints & Coatings", "Tiles & Flooring", "Interior Decor",
  ]},
  { id: "consumer-electronics", name: "Consumer Electronics", subcategories: [
    "Mobile Phones", "TVs & Displays", "Audio Equipment", "Cameras",
    "Home Appliances", "Wearable Devices",
  ]},
  { id: "electrical-electronics", name: "Electrical & Electronics", subcategories: [
    "Cables & Wires", "Switches & Sockets", "Generators", "Transformers",
    "Circuit Boards", "Batteries",
  ]},
  { id: "furniture", name: "Furniture", subcategories: [
    "Office Furniture", "Home Furniture", "Outdoor Furniture", "Furniture Materials",
  ]},
  { id: "health-medicine", name: "Health & Medicine", subcategories: [
    "Pharmaceuticals", "Medical Equipment", "Health Supplements",
    "Personal Care", "First Aid Supplies",
  ]},
  { id: "industrial-equipment", name: "Industrial Equipment", subcategories: [
    "Manufacturing Machinery", "Processing Equipment", "Material Handling",
    "Industrial Tools", "Spare Parts",
  ]},
  { id: "lights-lighting", name: "Lights & Lighting", subcategories: [
    "LED Lights", "Solar Lights", "Industrial Lighting", "Decorative Lighting",
  ]},
  { id: "machinery", name: "Machinery", subcategories: [
    "Agricultural Machinery", "Construction Machinery", "Packaging Machinery",
    "Textile Machinery", "Food Processing Machinery",
  ]},
  { id: "metallurgy-energy", name: "Metallurgy & Energy", subcategories: [
    "Steel & Iron", "Metal Sheets & Bars", "Solar Energy Products",
    "Fuel & Gas Equipment",
  ]},
  { id: "office-supplies", name: "Office Supplies", subcategories: [
    "Stationery", "Printers & Copiers", "Office Furniture", "Filing & Storage",
  ]},
  { id: "packaging-printing", name: "Packaging & Printing", subcategories: [
    "Packaging Materials", "Boxes & Cartons", "Labels & Stickers",
    "Printing Services", "Bottles & Containers",
  ]},
  { id: "raw-materials", name: "Raw Materials", subcategories: [
    "Plastics & Polymers", "Rubber", "Wood & Timber", "Minerals & Ores",
    "Textile Raw Materials",
  ]},
  { id: "security-protection", name: "Security & Protection", subcategories: [
    "CCTV & Surveillance", "Alarm Systems", "Safety Gear", "Locks & Access Control",
  ]},
  { id: "sporting-goods", name: "Sporting Goods", subcategories: [
    "Fitness Equipment", "Outdoor & Camping", "Team Sports Gear", "Sportswear",
  ]},
  { id: "textile", name: "Textile", subcategories: [
    "Cotton Fabrics", "Synthetic Fabrics", "Yarn & Thread", "Home Textiles",
  ]},
  { id: "tools-hardware", name: "Tools & Hardware", subcategories: [
    "Hand Tools", "Power Tools", "Fasteners", "Plumbing Supplies",
  ]},
  { id: "transportation", name: "Transportation", subcategories: [
    "Vehicle Parts", "Tires", "Motorcycles & Tricycles", "Logistics Equipment",
  ]},
  { id: "wholesale", name: "Wholesale", subcategories: [
    "Bulk Food Items", "Bulk Household Goods", "Bulk Electronics", "Assorted Lots",
  ]},
];

export async function getParentCategories() {
  return CATEGORY_DATA.map(function (c) { return { id: c.id, name: c.name }; });
}

export async function getSubcategories(categoryId: string) {
  const match = CATEGORY_DATA.find(function (c) { return c.id === categoryId; });
  if (!match) return [];
  return match.subcategories.map(function (name) {
    return { id: name.toLowerCase().replace(/[^a-z0-9]+/g, "-"), name };
  });
}

type CreatePendingOrderInput = {
  productId: string;
  productName: string;
  buyer: string;
  seller: string;
  amount: number;
  quantity: number;
  txRef: string;
};

export async function createPendingOrder(input: CreatePendingOrderInput) {
  const { data, error } = await supabase
    .from("orders")
    .insert([{
      product_id: input.productId,
      product_name: input.productName,
      buyer: input.buyer,
      seller: input.seller,
      amount: input.amount,
      quantity: input.quantity,
      status: "pending",
      payment_status: "pending",
      tx_ref: input.txRef,
    }])
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function markOrderPaid(orderId: string, flwTransactionId: string) {
  const { data, error } = await supabase
    .from("orders")
    .update({
      status: "paid",
      payment_status: "paid",
      flw_transaction_id: flwTransactionId,
      escrow_status: "holding",
    })
    .eq("id", orderId)
    .select()
    .single();

  return data;
}

/**
 * PRODUCT DISCOVERY — additive layer
 *
 * Everything below is new. Nothing above this line was changed.
 * Discovered products are just rows in `products` (listing_source:
 * 'discovered'), so getProducts()/getProductById() already return them —
 * no changes needed to either function.
 */

export async function getDiscoverySources() {
  const { data, error } = await supabase
    .from("discovery_sources")
    .select("*, discovery_runs(status, started_at, items_new, items_updated)")
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error fetching discovery sources:", error);
    return [];
  }
  return data;
}

export async function addDiscoverySource(source: {
  name: string;
  source_type: "api" | "csv" | "scrape";
  config: Record<string, unknown>;
  schedule_cron?: string;
}) {
  const { data, error } = await supabase
    .from("discovery_sources")
    .insert([{ ...source, enabled: true }])
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function setDiscoverySourceEnabled(id: string, enabled: boolean) {
  const { error } = await supabase
    .from("discovery_sources")
    .update({ enabled })
    .eq("id", id);

  if (error) throw error;
}

/**
 * Buyer clicks "Request This Product" on a discovered listing.
 *
 * Reuses your existing `rfqs` table (tagged with product_id, so it shows up
 * on /rfq automatically) and your existing `sendMessage` for notification —
 * no new tables for the common case. supplier_claim_invites is only touched
 * when the product has no matching registered supplier yet.
 */
type SubmitProductRequestInput = {
  productId: string;
  productName: string;
  category: string;
  quantity: string;
  location?: string;
  specifications?: string;
  buyer: string; // buyer's email
};

export async function submitProductRequest(input: SubmitProductRequestInput) {
  const { data: product, error: productError } = await supabase
    .from("products")
    .select("owner, external_supplier_contact_phone, external_supplier_contact_email, is_claimed")
    .eq("id", input.productId)
    .single();

  if (productError) throw productError;

  const description = [
    `Requested quantity: ${input.quantity}`,
    input.location ? `Destination: ${input.location}` : null,
    input.specifications ? `Requirements: ${input.specifications}` : null,
  ].filter(Boolean).join("\n");

  const { data: rfq, error: rfqError } = await supabase
    .from("rfqs")
    .insert([{
      title: `Request for ${input.productName}`,
      description,
      category: input.category,
      quantity: input.quantity,
      budget: "",
      urgency: "medium",
      buyer: input.buyer,
      responses: 0,
      status: "open",
      product_id: input.productId,
    }])
    .select()
    .single();

  if (rfqError) throw rfqError;

  if (product?.owner) {
    // Claimed supplier (internal or already-matched discovered listing) —
    // exact same path as a normal "Message Supplier" message.
    await sendMessage({
      sender_email: input.buyer,
      receiver_email: product.owner,
      content: `A buyer has requested ${input.quantity} of your "${input.productName}" listing. Log in to KORA to view the request and respond: /rfq`,
    });
  } else {
    // No registered owner yet — queue a claim invite instead of failing
    // silently. Actually sending the SMS/email to the external contact
    // needs your notification provider wired in here.
    await supabase.from("supplier_claim_invites").insert({
      product_id: input.productId,
      contact_phone: product?.external_supplier_contact_phone || null,
      contact_email: product?.external_supplier_contact_email || null,
      status: "pending",
    });
  }

  return rfq;
}