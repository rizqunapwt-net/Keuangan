"use client";

import React from "react";
import Navigation from "@/components/Navigation";

export default function AdminLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <div className="min-h-screen bg-[#fdfdfd]">
            <Navigation />
            <div className="admin-container">
                {children}
            </div>

            <style jsx>{`
                .admin-container {
                    width: 100%;
                }
                @media (min-width: 768px) {
                    .admin-container {
                        padding-left: 0;
                    }
                }
            `}</style>
        </div>
    );
}
