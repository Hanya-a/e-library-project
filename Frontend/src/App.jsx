
// Import the components and functions needed for routing.
import {
    BrowserRouter,
    Routes,
    Route,
    Navigate,
    useNavigate
} from "react-router-dom";

// Import useState to manage application state.
import { useState } from "react";

// Import reusable components.
import Header from "./components/Header";
import Navbar from "./components/Navbar.jsx";
import Notification from "./components/Notification";

// Import the application pages.
import SignIn from "./pages/SignIn";
import Dashboard from "./pages/Dashboard";
import Books from "./pages/Books";
import Members from "./pages/Members";
import Borrowings from "./pages/Borrowings";


// Shared layout displayed across all library pages.
function LibraryLayout({ children }) {

    // Allow navigation between application pages.
    const navigate = useNavigate();

    // Store the currently active page in the navigation bar.
    const [activePage, setActivePage] = useState(
        window.location.pathname.replace("/", "") || "dashboard"
    );

    // Update the active page and navigate to the selected route.
    function handleNavigate(page) {
        setActivePage(page);
        navigate(`/${page}`);
    }

    // Navigate back to the sign-in page when logging out.
    function handleLogout() {
        navigate("/");
    }

    return (
        <>
            {/* Display the application header and logout button. */}
            <Header
                title="E-Library"
                subtitle="Welcome to your library"
                showActions={true}
                onLogout={handleLogout}
            />

            {/* Display the main navigation bar. */}
            <Navbar
                activePage={activePage}
                onNavigate={handleNavigate}
            />

            {/* Display the page selected by the current route. */}
            {children}
        </>
    );
}


// Main application component.
function App() {

    // Store notification messages and their types.
    const [notification, setNotification] = useState({
        message: "",
        type: "success",
    });

    // Clear the notification after it is closed.
    function clearNotification() {
        setNotification({
            message: "",
            type: "success",
        });
    }

    return (
        // Enable client-side routing throughout the application.
        <BrowserRouter>

            {/* Display notifications when triggered by other components. */}
            <Notification
                message={notification.message}
                type={notification.type}
                onClose={clearNotification}
            />

            {/* Define the routes available in the application. */}
            <Routes>

                {/* Display the sign-in page at the root URL. */}
                <Route
                    path="/"
                    element={<SignIn />}
                />

                {/* Display the dashboard inside the shared library layout. */}
                <Route
                    path="/dashboard"
                    element={
                        <LibraryLayout>
                            <Dashboard setNotification={setNotification} />
                        </LibraryLayout>
                    }
                />

                {/* Display the books management page. */}
                <Route
                    path="/books"
                    element={
                        <LibraryLayout>
                            <Books setNotification={setNotification} />
                        </LibraryLayout>
                    }
                />

                {/* Display the members management page. */}
                <Route
                    path="/members"
                    element={
                        <LibraryLayout>
                            <Members setNotification={setNotification} />
                        </LibraryLayout>
                    }
                />

                {/* Display the borrowings management page. */}
                <Route
                    path="/borrowings"
                    element={
                        <LibraryLayout>
                            <Borrowings setNotification={setNotification} />
                        </LibraryLayout>
                    }
                />

                {/* Redirect unknown URLs to the sign-in page. */}
                <Route
                    path="*"
                    element={<Navigate to="/" replace />}
                />

            </Routes>
        </BrowserRouter>
    );
}

// Export App so it can be rendered by the main entry point.
export default App;
