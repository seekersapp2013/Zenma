import { Routes, Route, useParams } from "react-router-dom";
import { Toaster } from "sonner";
import { HomePage } from "./HomePage";
import { Admin } from "./Admin";
import { PageView } from "./PageView";

export default function App() {
  return (
    <>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/admin/*" element={<Admin />} />
        <Route path="/:slug" element={<DynamicPageRoute />} />
      </Routes>
      <Toaster />
    </>
  );
}

function DynamicPageRoute() {
  const { slug } = useParams();
  return <PageView slug={slug || ''} />;
}
