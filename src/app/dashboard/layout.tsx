import { Header } from "@/components/Header";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <Header />
      <main className="container" style={{ padding: "40px 24px 80px" }}>
        {children}
      </main>
    </>
  );
}
