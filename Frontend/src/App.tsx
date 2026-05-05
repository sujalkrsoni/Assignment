import { Navigate, Route, Routes } from "react-router-dom";

import { AppShell } from "./components/AppShell";
import { AuthGuard } from "./components/AuthGuard";
import { useAuth } from "./context/AuthContext";
import { ConfirmationPage } from "./pages/ConfirmationPage";
import { DrinkPage } from "./pages/DrinkPage";
import { EventsPage } from "./pages/EventsPage";
import { FeedPage } from "./pages/FeedPage";
import { InboxPage } from "./pages/InboxPage";
import { LoginPage } from "./pages/LoginPage";
import { RegisterPage } from "./pages/RegisterPage";
import { SummaryPage } from "./pages/SummaryPage";

const HomeRedirect = () => {
  const { isAuthenticated } = useAuth();
  return <Navigate to={isAuthenticated ? "/feed" : "/login"} replace />;
};

function App() {
  return (
    <Routes>
      <Route path="/" element={<HomeRedirect />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />

      <Route element={<AuthGuard />}>
        <Route element={<AppShell />}>
          <Route path="/feed" element={<FeedPage />} />
          <Route path="/events" element={<EventsPage />} />
          <Route path="/drinks" element={<DrinkPage />} />
          <Route path="/summary" element={<SummaryPage />} />
          <Route path="/inbox" element={<InboxPage />} />
          <Route path="/confirmation" element={<ConfirmationPage />} />
        </Route>
      </Route>
    </Routes>
  );
}

export default App;
