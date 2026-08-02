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
  return { email, business_name: email };
}

export async function getParentCategories() {
  return [
    { id: "agriculture", name: "Agriculture" },
    { id: "machinery", name: "Machinery" },
    { id: "industrial", name: "Industrial" },
    { id: "raw-materials", name: "Raw Materials" },
  ];
}

export async function getSubcategories(_categoryId: string) {
  return [];
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

  if (error) throw error;
  return data;
}