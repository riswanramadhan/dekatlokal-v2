import { Footer, FinalCTA, PublicHeader, WhatsAppFAB } from "@/components/layout";

export default function LegalLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <div className="relative min-h-screen bg-background">
            <PublicHeader />

            <div>
                {children}
            </div>

            <FinalCTA />
            <Footer />
            <WhatsAppFAB />
        </div>
    );
}
