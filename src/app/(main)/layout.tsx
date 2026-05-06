import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { MobileNav } from "@/components/layout/mobile-nav";
import { NativeBanner } from "@/components/ads/native-banner";

export default function MainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <NativeBanner />
      <main className="flex-1 pt-16 md:pt-20">{children}</main>
      <Footer />
      <MobileNav />
    </div>
  );
}
