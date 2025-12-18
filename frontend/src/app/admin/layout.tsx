import Link from "next/link";

export default function AdminLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <div style={{ display: "flex", minHeight: "100vh" }}>
            <aside
                style={{
                    width: 220,
                    padding: 16,
                    background: "#111",
                    color: "#fff",
                }}
            >
                <h3>Admin</h3>
                <nav style={{ marginTop: 16 }}>
                    <ul style={{ listStyle: "none", padding: 0 }}>
                        <li>
                            <Link href="/admin" style={{ color: "#fff" }}>
                                Dashboard
                            </Link>
                        </li>
                    </ul>
                </nav>
            </aside>

            <main style={{ flex: 1, padding: 24 }}>{children}</main>
        </div>
    );
}
