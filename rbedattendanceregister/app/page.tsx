import Image from "next/image";
import FrontPage from "./components/frontPage";

export default function Home() {
  return (
    <div className="flex flex-col flex-1 items-center justify-center bg-zinc-50 font-sans dark:bg-black">
      <FrontPage />
    </div>
  );
}
