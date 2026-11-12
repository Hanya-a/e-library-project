
/*
 * Provides horizontal navigation between the library sections.
 * Highlights the current page and supports keyboard-accessible
 * navigation using standard buttons.
 */

function Navbar({ activePage, onNavigate }) {
    return (
        <nav className="sidebar" aria-label="Main navigation">

            {/* Navigate to the dashboard. */}
            <button
                type="button"
                onClick={() => onNavigate("dashboard")}
                aria-current={activePage === "dashboard" ? "page" : undefined}
            >
                Dashboard
            </button>

            {/* Navigate to book management. */}
            <button
                type="button"
                onClick={() => onNavigate("books")}
                aria-current={activePage === "books" ? "page" : undefined}
            >
                Books
            </button>

            {/* Navigate to member management. */}
            <button
                type="button"
                onClick={() => onNavigate("members")}
                aria-current={activePage === "members" ? "page" : undefined}
            >
                Members
            </button>

            {/* Navigate to borrowing management. */}
            <button
                type="button"
                onClick={() => onNavigate("borrowings")}
                aria-current={activePage === "borrowings" ? "page" : undefined}
            >
                Borrowings
            </button>

        </nav>
    );
}

export default Navbar;
