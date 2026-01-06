import { Routes, Route, useParams } from "react-router-dom";
import { Toaster } from "sonner";
import { ComingSoon } from "./ComingSoon";
import { Admin } from "./Admin";
import { PageView } from "./PageView";

export default function App() {
  return (
    <>
      <Routes>
        <Route path="/" element={<ComingSoon />} />
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
