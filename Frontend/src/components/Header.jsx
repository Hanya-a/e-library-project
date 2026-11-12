
/*
 * Displays the main application header.
 * Shows the library title, welcome message and logout button.
 */

function Header({
    title,
    subtitle,
    showActions = false,
    onLogout,
}) {
    return (
        <header className="header">
            <div className="header-left">
                <div>
                    <h1>{title}</h1>
                    <p>{subtitle}</p>
                </div>
            </div>

            {/* Display the logout action when enabled. */}
            {showActions && (
                <button
                    type="button"
                    onClick={onLogout}
                    className="logout-button"
                >
                    Logout
                </button>
            )}
        </header>
    );
}

export default Header;
