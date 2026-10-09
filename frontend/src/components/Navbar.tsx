import { useNavigate } from "react-router-dom";
import { getStoredUser, logout } from "../api/authApi";
import NotificationBell from "./NotificationBell";

export default function Navbar() {
  const navigate = useNavigate();

  const user = getStoredUser();

  function handleLogout() {
    logout();
    navigate("/login");
  }

  return (
    <header className="app-navbar">

      <div className="navbar-left">

        <div
          className="navbar-brand"
          onClick={() => navigate("/dashboard")}
        >
          <div className="navbar-logo">
            T
          </div>

          <span>
            TaskFlow
          </span>
        </div>

      </div>

      <div className="navbar-right">

        <NotificationBell />

        <div className="navbar-user">

          <div className="navbar-avatar">
            {user?.name
              ?.charAt(0)
              .toUpperCase() || "U"}
          </div>

          <div className="navbar-user-info">

            <strong>
              {user?.name || "User"}
            </strong>

            <span>
              {user?.role || "USER"}
            </span>

          </div>

        </div>

        <button
          className="navbar-logout"
          type="button"
          onClick={handleLogout}
        >
          Logout
        </button>

      </div>

    </header>
  );
}