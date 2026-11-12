
import { useState } from "react";
import { useNavigate } from "react-router-dom";

function SignIn() {
    const navigate = useNavigate();

    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    // Store the email and password entered by the user.
    const [form, setForm] = useState({
        email: "",
        password: "",
    });

    // Update the corresponding form field when the user types.
    function handleChange(e) {
        const { name, value } = e.target;

        setForm((prevForm) => ({
            ...prevForm,
            [name]: value,
        }));

        // Clear the previous error when the user edits the form.
        if (error) {
            setError("");
        }
    }

    // Validate the form and simulate signing in.
    function handleSubmit(e) {
        e.preventDefault();

        // Prevent another submission while signing in.
        if (loading) return;

        // Check that both fields contain information.
        if (!form.email.trim() || !form.password.trim()) {
            setError("Please enter both email and password.");
            return;
        }

        // Clear errors and show the loading state.
        setError("");
        setLoading(true);

        // Simulate a short sign-in process before navigating.
        setTimeout(() => {
            setLoading(false);
            navigate("/dashboard");
        }, 1000);
    }

    return (
        <main className="signin-container">

            <section
                className="signin-form"
                aria-labelledby="signin-title"
            >

                <h1 id="signin-title">E-Library</h1>
                <h2>Staff Sign In</h2>

                <form onSubmit={handleSubmit}>

                    {/* Email input */}
                    <div className="input-group">
                        <label htmlFor="email">Email</label>

                        <input
                            id="email"
                            name="email"
                            type="email"
                            placeholder="Enter your email"
                            value={form.email}
                            onChange={handleChange}
                            autoComplete="username"
                            required
                            aria-invalid={error ? "true" : "false"}
                            aria-describedby={error ? "signin-error" : undefined}
                        />
                    </div>

                    {/* Password input */}
                    <div className="input-group">
                        <label htmlFor="password">Password</label>

                        <input
                            id="password"
                            name="password"
                            type="password"
                            placeholder="Enter your password"
                            value={form.password}
                            onChange={handleChange}
                            autoComplete="current-password"
                            required
                            aria-invalid={error ? "true" : "false"}
                            aria-describedby={error ? "signin-error" : undefined}
                        />
                    </div>

                    {/* Display validation errors accessibly */}
                    {error && (
                        <p
                            id="signin-error"
                            className="error"
                            role="alert"
                        >
                            {error}
                        </p>
                    )}

                    {/* Submit button with loading feedback */}
                    <div className="signin-buttons">
                        <button type="submit" disabled={loading}>
                            {loading ? "Signing in..." : "Login"}
                        </button>
                    </div>

                    {/* Announce the loading state to screen readers */}
                    {loading && (
                        <p role="status">
                            Signing in, please wait...
                        </p>
                    )}

                </form>
            </section>
        </main>
    );
}

export default SignIn;
