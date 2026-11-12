
/*
 * Displays success and error messages throughout the application.
 * Uses ARIA live announcements to notify screen-reader users
 * when dynamic feedback appears.
 */

function Notification({ message, type = "success", onClose }) {
    // Do not display an empty notification.
    if (!message) {
        return null;
    }

    // Determine the appropriate announcement behaviour.
    const isError = type === "error";

    return (
        <div
            className={`notification ${isError ? "error" : "success"}`}
            role={isError ? "alert" : "status"}
            aria-live={isError ? "assertive" : "polite"}
            aria-atomic="true"
        >
            {/* Display the notification message. */}
            <p>{message}</p>

            {/* Allow users to dismiss the notification. */}
            {onClose && (
                <button
                    type="button"
                    onClick={onClose}
                    aria-label="Dismiss notification"
                >
                    ×
                </button>
            )}
        </div>
    );
}

export default Notification;
