"use client";

import React, { useState } from "react";
import { json, type LoaderFunction } from "@remix-run/node";
import {
  useLoaderData,
  Link,
  useRouteError,
  isRouteErrorResponse,
} from "@remix-run/react";
import { motion } from "framer-motion";
import { Search, Package } from "lucide-react";
import { requireUserToken } from "~/utils/auth.server";
import { baseUrl } from "~/constants/api";

interface ProductDetails {
  cId: string;
  operator: string;
  name: string;
  price: string;
  data: string;
  InfoPos: string;
  validity: string;
  articleId: string;
  fortnoxarticleId: string;
  ean: string;
  vatCardValue: string;
  fortnoxarticleIdProv: string;
  provName: string;
  vatCardValueadded: string;
  moms: string;
}

interface VoucherData {
  articleId: string;
  productName: string;
  price: string;
  vouchersRemaining: number;
  productDetails: ProductDetails;
}

export const loader: LoaderFunction = async ({ request }) => {
  try {
    const token = await requireUserToken(request);

    const response = await fetch(`${baseUrl}/vouchers`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      throw json(
        { message: "Failed to fetch vouchers" },
        { status: response.status }
      );
    }

    const data = await response.json();
    return json(data.data);
  } catch (error) {
    console.error("Loader error:", error);
    throw error; // Let Remix handle the error
  }
};

export default function LagerPage() {
  const vouchers = useLoaderData<VoucherData[]>();
  const [searchQuery, setSearchQuery] = useState("");
  const [showLowStock, setShowLowStock] = useState(false);

  const groupedVouchers = vouchers.reduce((groups, voucher) => {
    const words = voucher.productName.split(" ");
    const prefix = words.length > 2 ? `${words[0]} ${words[1]}` : words[0];

    if (!groups[prefix]) {
      groups[prefix] = [];
    }
    groups[prefix].push(voucher);
    return groups;
  }, {} as Record<string, VoucherData[]>);

  const filteredGroups = Object.entries(groupedVouchers).reduce(
    (filtered, [group, vouchers]) => {
      const filteredVouchers = vouchers.filter((voucher) =>
        voucher.productName.toLowerCase().includes(searchQuery.toLowerCase())
      );
      if (filteredVouchers.length > 0) {
        filtered[group] = filteredVouchers;
      }
      return filtered;
    },
    {} as Record<string, VoucherData[]>
  );

  const lowStockFilter = (voucher: VoucherData) =>
    voucher.vouchersRemaining <= 50;

  return (
    <React.Fragment>
      <div className="min-h-screen bg-gray-200">
        <div className=" text-black">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
            <div className="text-center">
              <h1 className="text-4xl md:text-6xl font-bold mb-6 leading-tight">
                Nedcgroup Lager
              </h1>
              <p className="text-xl opacity-90 max-w-2xl mx-auto mb-8">
                Översikt av tillgängliga produkter och aktuellt lagersaldo
              </p>
              <div className="max-w-xl mx-auto">
                <div className="relative">
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Sök produkt..."
                    className="w-full px-6 py-4 rounded-full bg-white text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-400"
                  />
                  <div className="absolute right-4 top-4 text-gray-800">
                    <Search className="h-6 w-6" />
                  </div>
                </div>
              </div>
              <div className="mt-4">
                <label className="inline-flex items-center text-black">
                  <input
                    type="checkbox"
                    checked={showLowStock}
                    onChange={(e) => setShowLowStock(e.target.checked)}
                    className="form-checkbox text-indigo-600"
                  />
                  <span className="ml-2">
                    Visa endast produkter med lågt lager
                  </span>
                </label>
              </div>
            </div>
          </div>
        </div>
        <div className="max-w-7xl mx-auto  text-black sm:px-6 lg:px-8 py-12">
          {Object.entries(filteredGroups).map(([group, groupVouchers]) => (
            <div key={group} className="mb-12">
              <h2 className="text-2xl font-bold text-black mb-6">{group}</h2>
              <div className="flex flex-wrap -mx-4">
                {groupVouchers
                  .filter((voucher) => !showLowStock || lowStockFilter(voucher))
                  .map((voucher, index) => {
                    const isLowStock = voucher.vouchersRemaining <= 50;
                    return (
                      <motion.div
                        key={voucher.articleId}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.4, delay: index * 0.1 }}
                        className="w-full sm:w-1/2 lg:w-1/3 rounded-xl xl:w-1/4 px-4 mb-8"
                      >
                        <div
                          className={`bg-white rounded-2xl overflow-hidden shadow-lg hover:shadow-xl transition-all duration-300 flex flex-col h-full ${
                            isLowStock ? "border-4 border-red-500" : ""
                          }`}
                        >
                          <div className="p-6 flex-grow flex flex-col">
                            <div className="flex justify-between items-start mb-4">
                              <h3 className="text-base uppercase font-bold text-black leading-tight">
                                {voucher.productName}
                              </h3>
                              <span className="text-2xl font-bold text-indigo-600 whitespace-nowrap ml-2">
                                {voucher.price} kr
                              </span>
                            </div>
                            <div className="space-y-4 flex-grow">
                              <div className="flex items-center p-3 bg-indigo-50 rounded-lg">
                                <Package className="h-5 w-5 text-indigo-600 mr-3" />
                                <div>
                                  <p className="text-sm font-semibold text-black">
                                    Lager
                                  </p>
                                  <p
                                    className={`text-lg font-bold ${
                                      isLowStock
                                        ? "text-red-600"
                                        : "text-indigo-600"
                                    }`}
                                  >
                                    {voucher.vouchersRemaining} st
                                  </p>
                                </div>
                              </div>
                            </div>
                            {isLowStock && (
                              <div className="mt-4 text-center text-sm text-red-600">
                                <p>Varning: Lågt lager!</p>
                              </div>
                            )}
                            <div className="mt-6 pt-4 border-t border-gray-200">
                              <div className="flex justify-between items-center text-sm">
                                <div>
                                  <p className="text-gray-700 font-medium">
                                    Artikel-ID
                                  </p>
                                  <p className="font-semibold text-black">
                                    {voucher.articleId}
                                  </p>
                                </div>
                                <div className="text-right">
                                  <p className="text-gray-700 font-medium">
                                    EAN
                                  </p>
                                  <p className="font-semibold text-black">
                                    {voucher.productDetails.ean}
                                  </p>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    );
                  })}
              </div>
            </div>
          ))}
        </div>
      </div>
    </React.Fragment>
  );
}

export function ErrorBoundary() {
  const error = useRouteError();

  if (isRouteErrorResponse(error)) {
    return (
      <div className="error-container">
        <h1>
          {error.status} {error.statusText}
        </h1>
        <p>{error.data.message || "Something went wrong"}</p>
      </div>
    );
  }

  return (
    <div className="error-container">
      <h1>An unexpected error occurred</h1>
      <p>Please try again later or contact support if the problem persists.</p>
    </div>
  );
}
