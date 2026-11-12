
/*
 * Reusable button component used throughout the application.
 * Supports different button types, styles and disabled states.
 */

function Button({
    children,
    type = "button",
    onClick,
    disabled = false,
    variant = "primary",
}) {
    return (
        <button
            type={type}
            onClick={onClick}
            disabled={disabled}
            className={`button ${variant}`}
        >
            {children}
        </button>
    );
}

export default Button;
