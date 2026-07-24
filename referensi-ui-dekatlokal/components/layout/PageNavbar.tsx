import Navbar from "@/components/layout/Navbar";

/**
 * Compatibility wrapper for older page-level imports.
 * Public marketing pages now share the same route-based navigation.
 */
export default function PageNavbar() {
  return <Navbar />;
}
