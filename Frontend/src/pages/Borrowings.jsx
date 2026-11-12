
import { useState, useEffect } from "react";

import Button from "../components/Button";
import DataTable from "../components/DataTable";
import Modal from "../components/Modal";

import {
    BORROWINGS_URL,
    BOOKS_URL,
    MEMBERS_URL,
} from "../services/api";

function Borrowings({ setNotification }) {

    // Store borrowing records, books, and members from the backend.
    const [borrowings, setBorrowings] = useState([]);
    const [books, setBooks] = useState([]);
    const [members, setMembers] = useState([]);

    // Store the information entered in the borrowing form.
    const [form, setForm] = useState({
        member: "",
        book: "",
    });

    // Store form errors and loading states.
    const [formError, setFormError] = useState("");
    const [loading, setLoading] = useState(false);
    const [saving, setSaving] = useState(false);

    // Search and filter values.
    const [searchTerm, setSearchTerm] = useState("");
    const [statusFilter, setStatusFilter] = useState("");
    const [draftStatusFilter, setDraftStatusFilter] = useState("");

    // Control the visibility of the modals.
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isFilterOpen, setIsFilterOpen] = useState(false);

    // Display success and error notifications.
    function notify(message, type = "success") {
        if (setNotification) {
            setNotification({ message, type });
        }
    }

    // Convert API list responses into an array.
    // Supports both normal and paginated Django REST Framework responses.
    function getList(data) {
        if (Array.isArray(data)) {
            return data;
        }

        if (data && Array.isArray(data.results)) {
            return data.results;
        }

        return [];
    }

    // Convert backend errors into readable messages.
    // Handles non_field_errors, field errors and other API error formats.
    function getErrorMessage(errorData, fallback) {
        if (!errorData) {
            return fallback;
        }

        if (typeof errorData === "string") {
            return errorData;
        }

        if (Array.isArray(errorData)) {
            return errorData
                .map((item) => getErrorMessage(item, ""))
                .filter(Boolean)
                .join(" ");
        }

        if (typeof errorData === "object") {
            const messages = Object.values(errorData)
                .flat(Infinity)
                .filter((item) => typeof item === "string");

            return messages.length > 0
                ? messages.join(" ")
                : fallback;
        }

        return fallback;
    }

    // Retrieve borrowing records, books, and members.
    async function fetchData() {
        setLoading(true);

        try {
            // Fetch all three resources at the same time.
            const [
                borrowingsResponse,
                booksResponse,
                membersResponse,
            ] = await Promise.all([
                fetch(BORROWINGS_URL),
                fetch(BOOKS_URL),
                fetch(MEMBERS_URL),
            ]);

            // Convert the API responses into JavaScript data.
            const [
                borrowingsData,
                booksData,
                membersData,
            ] = await Promise.all([
                borrowingsResponse.json().catch(() => null),
                booksResponse.json().catch(() => null),
                membersResponse.json().catch(() => null),
            ]);

            // Check each request and display a useful error if it fails.
            if (!borrowingsResponse.ok) {
                throw new Error(
                    getErrorMessage(
                        borrowingsData,
                        "Could not load borrowing records."
                    )
                );
            }

            if (!booksResponse.ok) {
                throw new Error(
                    getErrorMessage(
                        booksData,
                        "Could not load books."
                    )
                );
            }

            if (!membersResponse.ok) {
                throw new Error(
                    getErrorMessage(
                        membersData,
                        "Could not load members."
                    )
                );
            }

            // Check that the responses contain valid list data.
            if (
                !Array.isArray(borrowingsData) &&
                !Array.isArray(borrowingsData?.results)
            ) {
                throw new Error("The borrowing data could not be read.");
            }

            if (
                !Array.isArray(booksData) &&
                !Array.isArray(booksData?.results)
            ) {
                throw new Error("The book data could not be read.");
            }

            if (
                !Array.isArray(membersData) &&
                !Array.isArray(membersData?.results)
            ) {
                throw new Error("The member data could not be read.");
            }

            // Store the retrieved data.
            setBorrowings(getList(borrowingsData));
            setBooks(getList(booksData));
            setMembers(getList(membersData));

        } catch (error) {
            notify(
                error.message || "Could not load borrowing information. Please try again.",
                "error"
            );
        } finally {
            setLoading(false);
        }
    }

    // Load the information when the page first opens.
    useEffect(() => {
        fetchData();

        // The data is loaded once when this component mounts.
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    // Update the selected member or book.
    function handleChange(e) {
        const { name, value } = e.target;

        setForm((previousForm) => ({
            ...previousForm,
            [name]: value,
        }));

        // Clear the previous form error when the user makes a change.
        setFormError("");
    }

    // Find the currently selected member.
    const selectedMember = members.find(
        (member) => Number(member.id) === Number(form.member)
    );

    // Open the borrowing form and reset its values.
    function openModal() {
        setForm({
            member: "",
            book: "",
        });

        setFormError("");
        setIsModalOpen(true);
    }

    // Close the borrowing form and reset it.
    function closeModal() {
        if (saving) return;

        setIsModalOpen(false);

        setForm({
            member: "",
            book: "",
        });

        setFormError("");
    }

    // Open the filter modal with the currently applied filter.
    function openFilterModal() {
        setDraftStatusFilter(statusFilter);
        setIsFilterOpen(true);
    }

    // Apply the selected status filter.
    function applyFilters(e) {
        e.preventDefault();

        setStatusFilter(draftStatusFilter);
        setIsFilterOpen(false);
    }

    // Clear the applied filter.
    function clearFilters() {
        setDraftStatusFilter("");
        setStatusFilter("");
        setIsFilterOpen(false);
    }

    // Record a new borrowing.
    async function handleSubmit(e) {
        e.preventDefault();

        // Prevent multiple submissions while processing.
        if (saving) return;

        // Check that both selections have been made.
        if (!form.member || !form.book) {
            setFormError("Please select a member and a book.");
            return;
        }

        setSaving(true);
        setFormError("");

        try {
            const response = await fetch(BORROWINGS_URL, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    member: Number(form.member),
                    book: Number(form.book),
                }),
            });

            // Read the response and extract any backend errors.
            const responseData = await response.json().catch(() => null);

            if (!response.ok) {
                throw new Error(
                    getErrorMessage(
                        responseData,
                        "Could not record the borrowing. Please try again."
                    )
                );
            }

            notify("Book borrowed successfully.");

            // Close the form and refresh the borrowing records.
            closeModal();
            await fetchData();

        } catch (error) {
            // Display a readable error inside the borrowing form.
            setFormError(
                error.message || "Could not record the borrowing. Please try again."
            );
        } finally {
            setSaving(false);
        }
    }

    // Mark a borrowing as returned.
    async function handleReturn(id) {

        // Ask for confirmation before returning the book.
        if (!window.confirm("Are you sure you want to return this book?")) {
            return;
        }

        try {
            const response = await fetch(`${BORROWINGS_URL}${id}/`, {
                method: "PATCH",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({}),
            });

            // Read the response and extract any backend errors.
            const responseData = await response.json().catch(() => null);

            if (!response.ok) {
                throw new Error(
                    getErrorMessage(
                        responseData,
                        "Could not return the book. Please try again."
                    )
                );
            }

            notify("Book returned successfully.");

            // Refresh the records to display the updated status.
            await fetchData();

        } catch (error) {
            notify(
                error.message || "Could not return the book. Please try again.",
                "error"
            );
        }
    }

    // Find a book title using its ID.
    function getBookTitle(bookId) {

        // Support either an ID or a nested book object.
        const id = typeof bookId === "object" && bookId !== null
            ? bookId.id
            : bookId;

        const book = books.find(
            (item) => Number(item.id) === Number(id)
        );

        return book ? book.title : `Book #${id}`;
    }

    // Find a member name using their ID.
    function getMemberName(memberId) {

        // Support either an ID or a nested member object.
        const id = typeof memberId === "object" && memberId !== null
            ? memberId.id
            : memberId;

        const member = members.find(
            (item) => Number(item.id) === Number(id)
        );

        return member ? member.name : `Member #${id}`;
    }

    // Filter borrowing records using the search term and status.
    const filteredBorrowings = borrowings.filter((borrowing) => {
        const bookTitle = getBookTitle(borrowing.book).toLowerCase();
        const memberName = getMemberName(borrowing.member).toLowerCase();

        const search = searchTerm.trim().toLowerCase();

        // Match records by book title or member name.
        const matchesSearch =
            bookTitle.includes(search) ||
            memberName.includes(search);

        // Match records by their return status.
        const matchesStatus =
            statusFilter === "" ||
            (statusFilter === "active" && !borrowing.returned_at) ||
            (statusFilter === "returned" && Boolean(borrowing.returned_at));

        return matchesSearch && matchesStatus;
    });

    // Define the columns displayed in the borrowing table.
    const columns = [
        { key: "id", label: "ID" },
        {
            key: "member",
            label: "Member",
            render: (borrowing) => getMemberName(borrowing.member),
        },
        {
            key: "book",
            label: "Book",
            render: (borrowing) => getBookTitle(borrowing.book),
        },
        {
            key: "borrowed_at",
            label: "Borrowed Date",
            render: (borrowing) => {
                if (!borrowing.borrowed_at) {
                    return "Not available";
                }

                const date = new Date(borrowing.borrowed_at);

                return Number.isNaN(date.getTime())
                    ? "Not available"
                    : date.toLocaleDateString();
            },
        },
        {
            key: "returned_at",
            label: "Returned Date",
            render: (borrowing) =>
                borrowing.returned_at || "Not returned",
        },
        {
            key: "status",
            label: "Status",
            render: (borrowing) =>
                borrowing.returned_at ? "Returned" : "Active",
        },
    ];

    return (
        <main className="borrowings-page">

            {/* Page heading */}
            <div className="books-page-header">
                <h1>Borrowings Management</h1>
            </div>

            {/* Record a new borrowing modal */}
            <Modal
                isOpen={isModalOpen}
                onClose={closeModal}
                title="Record a New Borrowing"
            >
                <form className="app-modal-form" onSubmit={handleSubmit}>

                    {/* Select a member */}
                    <div className="input-group">
                        <label htmlFor="borrowing-member">
                            Select Member
                        </label>

                        <select
                            id="borrowing-member"
                            name="member"
                            value={form.member}
                            onChange={handleChange}
                            required
                        >
                            <option value="">Choose a member</option>

                            {members.map((member) => (
                                <option key={member.id} value={member.id}>
                                    {member.name} ({member.member_type})
                                </option>
                            ))}
                        </select>
                    </div>

                    {/* Display the selected member's details */}
                    {selectedMember && (
                        <section
                            className="selected-member"
                            aria-labelledby="selected-member-heading"
                            aria-live="polite"
                        >
                            <h3 id="selected-member-heading">
                                Selected Member Details
                            </h3>

                            <p>
                                <strong>Name:</strong> {selectedMember.name}
                            </p>

                            <p>
                                <strong>Member Type:</strong>{" "}
                                {selectedMember.member_type}
                            </p>

                            <p>
                                <strong>Email:</strong>{" "}
                                {selectedMember.email || "Not provided"}
                            </p>
                        </section>
                    )}

                    {/* Select an available book */}
                    <div className="input-group">
                        <label htmlFor="borrowing-book">
                            Select Available Book
                        </label>

                        <select
                            id="borrowing-book"
                            name="book"
                            value={form.book}
                            onChange={handleChange}
                            required
                        >
                            <option value="">Choose a book</option>

                            {books
                                .filter((book) => book.available)
                                .map((book) => (
                                    <option key={book.id} value={book.id}>
                                        {book.title} - {book.author}
                                    </option>
                                ))}
                        </select>
                    </div>

                    {/* Display form validation and backend errors */}
                    {formError && (
                        <p className="error" role="alert">
                            {formError}
                        </p>
                    )}

                    {/* Form actions */}
                    <div className="modal-actions">
                        <Button
                            type="button"
                            variant="secondary"
                            onClick={closeModal}
                            disabled={saving}
                        >
                            Cancel
                        </Button>

                        <Button type="submit" disabled={saving}>
                            {saving ? "Recording..." : "Record Borrowing"}
                        </Button>
                    </div>
                </form>
            </Modal>

            {/* Borrowing status filter modal */}
            <Modal
                isOpen={isFilterOpen}
                onClose={() => setIsFilterOpen(false)}
                title="Filter Borrowings"
            >
                <form className="filter-form" onSubmit={applyFilters}>

                    <div className="input-group">
                        <label htmlFor="borrowing-status-filter">
                            Filter by status
                        </label>

                        <select
                            id="borrowing-status-filter"
                            value={draftStatusFilter}
                            onChange={(e) =>
                                setDraftStatusFilter(e.target.value)
                            }
                        >
                            <option value="">All borrowings</option>
                            <option value="active">Active</option>
                            <option value="returned">Returned</option>
                        </select>
                    </div>

                    {/* Filter actions */}
                    <div className="modal-actions">
                        <Button
                            type="button"
                            variant="secondary"
                            onClick={clearFilters}
                        >
                            Clear Filters
                        </Button>

                        <Button type="submit">
                            Apply Filters
                        </Button>
                    </div>
                </form>
            </Modal>

            {/* Borrowing records table */}
            <section className="books-table-section">

                <div className="table-heading">
                    <h2>All Borrowings</h2>
                </div>

                {/* Search, filter, and add borrowing controls */}
                <div className="search-filter-container">

                    <div className="search-filter-left">

                        <div className="input-group">
                            <label htmlFor="borrowing-search">
                                Search records
                            </label>

                            <input
                                id="borrowing-search"
                                type="search"
                                placeholder="Search by member or book..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>

                        <Button
                            type="button"
                            variant="secondary"
                            onClick={openFilterModal}
                        >
                            Filter
                        </Button>
                    </div>

                    <div className="search-filter-right">
                        <Button type="button" onClick={openModal}>
                            + Record Borrowing
                        </Button>
                    </div>
                </div>

                {/* Announce loading status */}
                {loading && (
                    <p role="status">Loading borrowing records...</p>
                )}

                {/* Display the filtered borrowing records */}
                <DataTable
                    columns={columns}
                    data={filteredBorrowings}
                    actions={(borrowing) =>
                        !borrowing.returned_at ? (
                            <Button
                                type="button"
                                onClick={() => handleReturn(borrowing.id)}
                            >
                                Return Book
                            </Button>
                        ) : (
                            <span>Completed</span>
                        )
                    }
                    emptyMessage={
                        loading
                            ? "Loading borrowing records..."
                            : "No borrowing records found."
                    }
                />

            </section>
        </main>
    );
}

export default Borrowings;
