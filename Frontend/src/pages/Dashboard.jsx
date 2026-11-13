
import { useState, useEffect, useCallback } from "react";
import Button from "../components/Button";

import {
    BOOKS_URL,
    MEMBERS_URL,
    BORROWINGS_URL,
} from "../services/api";

function Dashboard() {
    const [books, setBooks] = useState([]);
    const [members, setMembers] = useState([]);
    const [borrowings, setBorrowings] = useState([]);

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    // Fetch dashboard information from the backend
    const fetchDashboardData = useCallback(async () => {
        setLoading(true);
        setError("");

        try {
            // Fetch all three sets of data at the same time
            const [booksResponse, membersResponse, borrowingsResponse] =
                await Promise.all([
                    fetch(BOOKS_URL),
                    fetch(MEMBERS_URL),
                    fetch(BORROWINGS_URL),
                ]);

            // Check whether all requests were successful
            if (
                !booksResponse.ok ||
                !membersResponse.ok ||
                !borrowingsResponse.ok
            ) {
                throw new Error("Could not load dashboard information.");
            }

            // Convert the responses into JavaScript data
            const booksData = await booksResponse.json();
            const membersData = await membersResponse.json();
            const borrowingsData = await borrowingsResponse.json();

            // Support both normal arrays and paginated API responses
            setBooks(
                Array.isArray(booksData)
                    ? booksData
                    : booksData.results || []
            );

            setMembers(
                Array.isArray(membersData)
                    ? membersData
                    : membersData.results || []
            );

            setBorrowings(
                Array.isArray(borrowingsData)
                    ? borrowingsData
                    : borrowingsData.results || []
            );

        } catch (error) {
            setError(
                error.message || "Something went wrong while loading the dashboard."
            );
        } finally {
            setLoading(false);
        }
    }, []);

    // Load dashboard information when the component first appears
    useEffect(() => {
        fetchDashboardData();
    }, [fetchDashboardData]);

    // Calculate the total number of registered books
    const totalBooks = books.length;

    // Count books that are currently available
    const availableBooks = books.filter(
        (book) => book.available
    ).length;

    // Calculate the total number of registered members
    const totalMembers = members.length;

    // Count borrowing records that have not been returned
    const activeBorrowings = borrowings.filter(
        (borrowing) => !borrowing.returned_at
    ).length;

    return (
        <main className="dashboard-page">

            <h1>Dashboard</h1>

            <p>Welcome to your library management system.</p>

            {/* Display loading feedback while data is being fetched */}
            {loading && (
                <p role="status">Loading dashboard information...</p>
            )}

            {/* Display an error message and allow the user to retry */}
            {error && (
                <div role="alert">
                    <p>{error}</p>

                    <Button onClick={fetchDashboardData}>
                        Try Again
                    </Button>
                </div>
            )}

            {/* Display statistics only when data has loaded successfully */}
            {!loading && !error && (
                <>
                    <section aria-labelledby="overview-heading">

                        <h2 id="overview-heading">Library Overview</h2>

                        <div className="dashboard-stats">

                            <article className="stat-card">
                                <h3>Total Books</h3>
                                <span className="stat-value">
                                    {totalBooks}
                                </span>
                            </article>

                            <article className="stat-card">
                                <h3>Available Books</h3>
                                <span className="stat-value">
                                    {availableBooks}
                                </span>
                            </article>

                            <article className="stat-card">
                                <h3>Total Members</h3>
                                <span className="stat-value">
                                    {totalMembers}
                                </span>
                            </article>

                            <article className="stat-card">
                                <h3>Active Borrowings</h3>
                                <span className="stat-value">
                                    {activeBorrowings}
                                </span>
                            </article>

                        </div>
                    </section>

                    {/* Provide a short summary of the library records */}
                    <section
                        className="quick-summary"
                        aria-labelledby="summary-heading"
                    >

                        <h2 id="summary-heading">Quick Summary</h2>

                        <p className="summary-intro">
                            Here is an overview of the library's current records
                            and borrowing activity.
                        </p>

                        <div className="summary-items">

                            <article className="summary-item">
                                <h3 className="summary-label">
                                    Registered Books
                                </h3>

                                <strong>{totalBooks}</strong>

                                <p>Books registered in the library.</p>
                            </article>

                            <article className="summary-item">
                                <h3 className="summary-label">
                                    Available Books
                                </h3>

                                <strong>{availableBooks}</strong>

                                <p>Books currently available for borrowing.</p>
                            </article>

                            <article className="summary-item">
                                <h3 className="summary-label">
                                    Active Borrowings
                                </h3>

                                <strong>{activeBorrowings}</strong>

                                <p>Borrowing records currently active.</p>
                            </article>

                        </div>
                    </section>
                </>
            )}

        </main>
    );
}

export default Dashboard;
