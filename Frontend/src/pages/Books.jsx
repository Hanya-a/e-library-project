
import { useState, useEffect } from "react";

import Input from "../components/Input";
import Button from "../components/Button";
import DataTable from "../components/DataTable";
import Modal from "../components/Modal";

import { BOOKS_URL } from "../services/api";

// Default values for the book form.
// Availability is deliberately excluded because it is
// controlled by the borrowing and returning processes.
const emptyForm = {
    title: "",
    author: "",
    genre: "Fantasy",
};

// Default values for the filters.
const emptyFilters = {
    genre: "",
    available: "",
};

// Available book genres.
const genres = [
    "Fantasy",
    "Action",
    "Classic",
    "Thriller",
    "Academic",
];

function Books({ setNotification }) {

    // Store the books retrieved from the backend.
    const [books, setBooks] = useState([]);

    // Manage the add/edit book form.
    const [form, setForm] = useState({ ...emptyForm });
    const [errors, setErrors] = useState({});
    const [editingId, setEditingId] = useState(null);

    // Track loading, saving, search and filter values.
    const [loading, setLoading] = useState(false);
    const [saving, setSaving] = useState(false);
    const [searchTerm, setSearchTerm] = useState("");
    const [filterValues, setFilterValues] = useState({ ...emptyFilters });
    const [draftFilters, setDraftFilters] = useState({ ...emptyFilters });

    // Control the visibility of the modals.
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isFilterOpen, setIsFilterOpen] = useState(false);

    // Display success and error notifications.
    function notify(message, type = "success") {
        if (setNotification) {
            setNotification({ message, type });
        }
    }

    // Convert the API response into a book array.
    function getBookList(data) {
        if (Array.isArray(data)) {
            return data;
        }

        if (Array.isArray(data.results)) {
            return data.results;
        }

        return [];
    }

    // Retrieve books from the backend.
    useEffect(() => {
        let isMounted = true;

        async function fetchBooks() {
            setLoading(true);

            try {
                const params = new URLSearchParams();

                // Add search and filter values to the API request.
                if (searchTerm.trim()) {
                    params.append("search", searchTerm.trim());
                }

                if (filterValues.genre) {
                    params.append("genre", filterValues.genre);
                }

                if (filterValues.available !== "") {
                    params.append("available", filterValues.available);
                }

                const queryString = params.toString();

                const url = queryString
                    ? `${BOOKS_URL}?${queryString}`
                    : BOOKS_URL;

                const response = await fetch(url);

                if (!response.ok) {
                    throw new Error("Could not load books.");
                }

                const data = await response.json();

                if (isMounted) {
                    setBooks(getBookList(data));
                }

            } catch (error) {
                if (isMounted) {
                    notify(
                        error.message || "An error occurred while loading books.",
                        "error"
                    );
                }
            } finally {
                if (isMounted) {
                    setLoading(false);
                }
            }
        }

        fetchBooks();

        // Prevent state updates if the component unmounts.
        return () => {
            isMounted = false;
        };

    }, [searchTerm, filterValues.genre, filterValues.available]);

    // Refresh the table after adding, editing or deleting a book.
    // The current search and filter values are preserved.
    async function refreshBooks() {
        try {
            const params = new URLSearchParams();

            if (searchTerm.trim()) {
                params.append("search", searchTerm.trim());
            }

            if (filterValues.genre) {
                params.append("genre", filterValues.genre);
            }

            if (filterValues.available !== "") {
                params.append("available", filterValues.available);
            }

            const queryString = params.toString();

            const url = queryString
                ? `${BOOKS_URL}?${queryString}`
                : BOOKS_URL;

            const response = await fetch(url);

            if (!response.ok) {
                throw new Error("Could not refresh books.");
            }

            const data = await response.json();
            setBooks(getBookList(data));

        } catch (error) {
            notify(
                error.message || "Could not refresh books.",
                "error"
            );
        }
    }

    // Update form fields when the user types.
    function handleChange(e) {
        const { name, value } = e.target;

        setForm((previousForm) => ({
            ...previousForm,
            [name]: value,
        }));

        // Clear the relevant field error when the user edits it.
        setErrors((previousErrors) => ({
            ...previousErrors,
            [name]: "",
        }));
    }

    // Open the modal with an empty form to add a book.
    function openAddModal() {
        setForm({ ...emptyForm });
        setEditingId(null);
        setErrors({});
        setIsModalOpen(true);
    }

    // Open the modal with the selected book's editable information.
    // Availability is excluded because it must not be changed manually.
    function openEditModal(book) {
        setForm({
            title: book.title || "",
            author: book.author || "",
            genre: book.genre || "Fantasy",
        });

        setEditingId(book.id);
        setErrors({});
        setIsModalOpen(true);
    }

    // Close the form modal and reset its values.
    function closeModal() {
        if (saving) return;

        setIsModalOpen(false);
        setForm({ ...emptyForm });
        setEditingId(null);
        setErrors({});
    }

    // Open the filter modal using the currently applied filters.
    function openFilterModal() {
        setDraftFilters({ ...filterValues });
        setIsFilterOpen(true);
    }

    // Update the filter values before they are applied.
    function handleDraftFilterChange(e) {
        const { name, value } = e.target;

        setDraftFilters((previousFilters) => ({
            ...previousFilters,
            [name]: value,
        }));
    }

    // Apply the selected filters.
    function applyFilters(e) {
        e.preventDefault();

        setFilterValues({ ...draftFilters });
        setIsFilterOpen(false);
    }

    // Reset all filters.
    function clearFilters() {
        setDraftFilters({ ...emptyFilters });
        setFilterValues({ ...emptyFilters });
        setIsFilterOpen(false);
    }

    // Add a new book or update an existing book.
    async function handleSubmit(e) {
        e.preventDefault();

        if (saving) return;

        // Validate the required fields.
        const foundErrors = {};

        if (!form.title.trim()) {
            foundErrors.title = "Please enter the book title.";
        }

        if (!form.author.trim()) {
            foundErrors.author = "Please enter the author's name.";
        }

        setErrors(foundErrors);

        // Stop submission if validation fails.
        if (Object.keys(foundErrors).length > 0) {
            return;
        }

        // Select the appropriate HTTP method.
        const method = editingId ? "PATCH" : "POST";

        // Use the book ID when editing an existing book.
        const url = editingId
            ? `${BOOKS_URL}${editingId}/`
            : BOOKS_URL;

        setSaving(true);

        try {
            const response = await fetch(url, {
                method,
                headers: {
                    "Content-Type": "application/json",
                },
                // Only send editable book information.
                // Availability is managed by the backend.
                body: JSON.stringify({
                    title: form.title.trim(),
                    author: form.author.trim(),
                    genre: form.genre,
                }),
            });

            if (!response.ok) {
                const errorData = await response.json().catch(() => null);

                const errorMessage = errorData
                    ? Object.values(errorData).flat().join(" ")
                    : "Could not save the book.";

                throw new Error(errorMessage);
            }

            // Display a message depending on the operation.
            notify(
                editingId
                    ? "Book updated successfully."
                    : "Book added successfully."
            );

            // Close the modal and reset the form.
            setIsModalOpen(false);
            setForm({ ...emptyForm });
            setEditingId(null);
            setErrors({});

            // Refresh the table to show the latest data.
            await refreshBooks();

        } catch (error) {
            notify(
                error.message || "Could not save the book.",
                "error"
            );
        } finally {
            setSaving(false);
        }
    }

    // Delete a book after user confirmation.
    async function handleDelete(id) {
        if (!window.confirm("Are you sure you want to delete this book?")) {
            return;
        }

        try {
            const response = await fetch(`${BOOKS_URL}${id}/`, {
                method: "DELETE",
            });

            if (!response.ok) {
                const errorData = await response.json().catch(() => null);

                const errorMessage = errorData
                    ? Object.values(errorData).flat().join(" ")
                    : "Could not delete the book.";

                throw new Error(errorMessage);
            }

            notify("Book deleted successfully.");

            // Refresh the table after deletion.
            await refreshBooks();

        } catch (error) {
            notify(
                error.message || "Could not delete the book.",
                "error"
            );
        }
    }

    // Define the columns displayed in the books table.
    const columns = [
        { key: "id", label: "ID" },
        { key: "title", label: "Title" },
        { key: "author", label: "Author" },
        { key: "genre", label: "Genre" },
        { key: "date_added", label: "Date Added" },
        {
            key: "available",
            label: "Availability",
            // Display availability without allowing manual editing.
            render: (book) => book.available ? "Available" : "Borrowed",
        },
    ];

    return (
        <main className="books-page">

            {/* Page heading */}
            <div className="books-page-header">
                <h1>Books Management</h1>
            </div>

            {/* Add and edit book modal */}
            <Modal
                isOpen={isModalOpen}
                onClose={closeModal}
                title={editingId ? "Edit Book" : "Add New Book"}
            >
                <form className="book-form" onSubmit={handleSubmit}>

                    <Input
                        label="Book Title"
                        name="title"
                        value={form.title}
                        onChange={handleChange}
                        required
                        error={errors.title}
                    />

                    <Input
                        label="Author"
                        name="author"
                        value={form.author}
                        onChange={handleChange}
                        required
                        error={errors.author}
                    />

                    {/* Select a book genre */}
                    <div className="input-group">
                        <label htmlFor="book-genre">Genre</label>

                        <select
                            id="book-genre"
                            name="genre"
                            value={form.genre}
                            onChange={handleChange}
                        >
                            {genres.map((genre) => (
                                <option key={genre} value={genre}>
                                    {genre}
                                </option>
                            ))}
                        </select>
                    </div>

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
                            {saving
                                ? "Saving..."
                                : editingId
                                    ? "Update Book"
                                    : "Add Book"}
                        </Button>
                    </div>
                </form>
            </Modal>

            {/* Book filters modal */}
            <Modal
                isOpen={isFilterOpen}
                onClose={() => setIsFilterOpen(false)}
                title="Filter Books"
            >
                <form className="filter-form" onSubmit={applyFilters}>

                    <div className="input-group">
                        <label htmlFor="book-genre-filter">
                            Filter by genre
                        </label>

                        <select
                            id="book-genre-filter"
                            name="genre"
                            value={draftFilters.genre}
                            onChange={handleDraftFilterChange}
                        >
                            <option value="">All genres</option>

                            {genres.map((genre) => (
                                <option key={genre} value={genre}>
                                    {genre}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div className="input-group">
                        <label htmlFor="book-availability-filter">
                            Filter by availability
                        </label>

                        <select
                            id="book-availability-filter"
                            name="available"
                            value={draftFilters.available}
                            onChange={handleDraftFilterChange}
                        >
                            <option value="">All books</option>
                            <option value="true">Available</option>
                            <option value="false">Borrowed</option>
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

            {/* Books table section */}
            <section className="books-table-section">

                <div className="table-heading">
                    <h2>All Books</h2>
                </div>

                {/* Search, filter, and add book controls */}
                <div className="search-filter-container">

                    <div className="search-filter-left">

                        <div className="input-group">
                            <label htmlFor="book-search">
                                Search records
                            </label>

                            <input
                                id="book-search"
                                type="search"
                                placeholder="Search by title or author..."
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
                        <Button type="button" onClick={openAddModal}>
                            + Add New Book
                        </Button>
                    </div>
                </div>

                {/* Announce loading status to assistive technologies */}
                {loading && (
                    <p role="status">Loading books...</p>
                )}

                {/* Display the books and their available actions */}
                <DataTable
                    columns={columns}
                    data={books}
                    actions={(book) => (
                        <div className="table-actions">

                            <Button
                                type="button"
                                onClick={() => openEditModal(book)}
                            >
                                Edit
                            </Button>

                            <Button
                                type="button"
                                variant="danger"
                                onClick={() => handleDelete(book.id)}
                            >
                                Delete
                            </Button>

                        </div>
                    )}
                    emptyMessage={
                        loading ? "Loading books..." : "No books found."
                    }
                />

            </section>
        </main>
    );
}

export default Books;
