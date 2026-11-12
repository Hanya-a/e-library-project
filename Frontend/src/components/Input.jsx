
/*
 * Reusable form input component.
 * Associates labels with inputs and provides accessible
 * validation feedback when an error occurs.
 */

function Input({
    label,
    name,
    type = "text",
    value,
    onChange,
    placeholder = "",
    required = false,
    error = "",
    autoComplete,
}) {
    return (
        <div className="input-group">

            {/* Associate the label with its corresponding input. */}
            <label htmlFor={name}>
                {label}
            </label>
            {/* Input field with validation and autocomplete support. */}
            <input
                id={name}
                name={name}
                type={type}
                value={value}
                onChange={onChange}
                placeholder={placeholder}
                required={required}
                autoComplete={autoComplete}
                aria-invalid={error ? "true" : "false"}
                aria-describedby={error ? `${name}-error` : undefined}
            />

            {/* Announce validation errors to screen-reader users. */}
            {error && (
                <p id={`${name}-error`} role="alert">
                    {error}
                </p>
            )}

        </div>
    );
}

export default Input;
