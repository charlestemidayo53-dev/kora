"use client";

import { useState } from "react";
import { getProducts, updateProduct } from "@/lib/store";

type Props = {
  params: {
    id: string;
  };
};

export default function EditProduct({ params }: Props) {
  const index = parseInt(params.id);
  const products = getProducts();
  const product = products[index];

  const [name, setName] = useState(product?.name || "");
  const [price, setPrice] = useState(product?.price || "");
  const [location, setLocation] = useState(product?.location || "");
  const [quantity, setQuantity] = useState(product?.quantity || "");
  const [image, setImage] = useState(product?.image || "");
  const [seller, setSeller] = useState(product?.seller || "");
  const [category, setCategory] = useState(product?.category || "");

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    updateProduct(index, {
      name,
      price,
      location,
      quantity,
      image,
      seller,
      category,
    });

    window.location.href = "/seller-dashboard";
  }

  if (!product) {
    return (
      <div className="min-h-screen flex items-center justify-center text-2xl">
        Product not found
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <form
        onSubmit={handleSubmit}
        className="bg-white shadow-xl rounded-2xl p-8 w-full max-w-xl"
      >
        <h1 className="text-3xl font-bold mb-6 text-center">
          Edit Product
        </h1>

        <input
          className="w-full border p-3 mb-4 rounded-lg"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Product Name"
        />

        <input
          className="w-full border p-3 mb-4 rounded-lg"
          value={price}
          onChange={(e) => setPrice(e.target.value)}
          placeholder="Price"
        />

        <input
          className="w-full border p-3 mb-4 rounded-lg"
          value={location}
          onChange={(e) => setLocation(e.target.value)}
          placeholder="Location"
        />

        <input
          className="w-full border p-3 mb-4 rounded-lg"
          value={quantity}
          onChange={(e) => setQuantity(e.target.value)}
          placeholder="Quantity"
        />

        <input
          className="w-full border p-3 mb-4 rounded-lg"
          value={image}
          onChange={(e) => setImage(e.target.value)}
          placeholder="Image URL"
        />

        <input
          className="w-full border p-3 mb-4 rounded-lg"
          value={seller}
          onChange={(e) => setSeller(e.target.value)}
          placeholder="Seller Name"
        />

        <select
          className="w-full border p-3 mb-6 rounded-lg"
          value={category}
          onChange={(e) => setCategory(e.target.value)}
        >
          <option value="">Select Category</option>
          <option value="Grains">Grains</option>
          <option value="Livestock">Livestock</option>
          <option value="Vegetables">Vegetables</option>
          <option value="Fruits">Fruits</option>
          <option value="Fertilizer">Fertilizer</option>
          <option value="Machinery">Machinery</option>
        </select>

        <button
          type="submit"
          className="w-full bg-black text-white py-3 rounded-lg hover:bg-gray-800 transition"
        >
          Save Changes
        </button>
      </form>
    </div>
  );
}