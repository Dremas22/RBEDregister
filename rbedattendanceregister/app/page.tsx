import FrontPage from "./components/frontPage";
import Footer from "./components/footer";

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col bg-zinc-50 font-sans dark:bg-black">
      {/* Main Content */}
      <main className="flex-1 flex items-center justify-center">
        <FrontPage />
      </main>

      {/* Footer */}
      <Footer />
    </div>
  );
}