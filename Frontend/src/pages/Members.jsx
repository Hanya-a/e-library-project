
import { useState, useEffect } from "react";

import Input from "../components/Input";
import Button from "../components/Button";
import DataTable from "../components/DataTable";
import Modal from "../components/Modal";

import { MEMBERS_URL } from "../services/api";

// Default values used when adding or resetting a member form
const emptyForm = {
    name: "",
    member_type: "Student",
    email: "",
};

// Available member types (must match the Django model)
const memberTypes = ["Student", "Staff", "Guest"];

function Members({ setNotification }) {
    const [members, setMembers] = useState([]);
    const [form, setForm] = useState(emptyForm);
    const [errors, setErrors] = useState({});
    const [editingId, setEditingId] = useState(null);
    const [loading, setLoading] = useState(false);

    // Search and filter states
    const [searchTerm, setSearchTerm] = useState("");
    const [typeFilter, setTypeFilter] = useState("");
    const [draftTypeFilter, setDraftTypeFilter] = useState("");

    // Modal visibility states
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isFilterOpen, setIsFilterOpen] = useState(false);

    // Display success and error notifications
    function notify(message, type = "success") {
        if (setNotification) {
            setNotification({ message, type });
        }
    }

    // Fetch members when the page first loads
    useEffect(() => {
        async function fetchMembers() {
            setLoading(true);

            try {
                const response = await fetch(MEMBERS_URL);

                if (!response.ok) {
                    throw new Error("Could not load members.");
                }

                const data = await response.json();

                // Support both normal arrays and paginated API responses
                setMembers(
                    Array.isArray(data) ? data : data.results || []
                );
            } catch (error) {
                notify(error.message, "error");
            } finally {
                setLoading(false);
            }
        }

        fetchMembers();
    }, []);

    // Update the form when the user changes an input
    function handleChange(e) {
        const { name, value } = e.target;

        setForm((prevForm) => ({
            ...prevForm,
            [name]: value,
        }));
    }

    // Open the modal with an empty form for adding a member
    function openAddModal() {
        setForm(emptyForm);
        setEditingId(null);
        setErrors({});
        setIsModalOpen(true);
    }

    // Open the modal with the selected member's information
    function openEditModal(member) {
        setForm({
            name: member.name,
            member_type: member.member_type,
            email: member.email || "",
        });

        setEditingId(member.id);
        setErrors({});
        setIsModalOpen(true);
    }

    // Close the modal and reset the form
    function closeModal() {
        setIsModalOpen(false);
        setForm(emptyForm);
        setEditingId(null);
        setErrors({});
    }

    // Open the filter modal with the currently applied filter
    function openFilterModal() {
        setDraftTypeFilter(typeFilter);
        setIsFilterOpen(true);
    }

    // Apply the selected member type filter
    function applyFilters(e) {
        e.preventDefault();
        setTypeFilter(draftTypeFilter);
        setIsFilterOpen(false);
    }

    // Remove all applied filters
    function clearFilters() {
        setDraftTypeFilter("");
        setTypeFilter("");
        setIsFilterOpen(false);
    }

    // Validate and submit the add/edit member form
    async function handleSubmit(e) {
        e.preventDefault();

        const foundErrors = {};

        // Name is required
        if (!form.name.trim()) {
            foundErrors.name = "Please enter the member's name.";
        }

        // Validate email only when one has been entered
        if (
            form.email.trim() &&
            !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim())
        ) {
            foundErrors.email = "Please enter a valid email address.";
        }

        setErrors(foundErrors);

        // Stop submission if validation errors exist
        if (Object.keys(foundErrors).length > 0) return;

        // Use PATCH when editing and POST when adding
        const method = editingId ? "PATCH" : "POST";
        const url = editingId
            ? `${MEMBERS_URL}${editingId}/`
            : MEMBERS_URL;

        try {
            const response = await fetch(url, {
                method,
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    ...form,
                    name: form.name.trim(),
                    email: form.email.trim(),
                }),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(JSON.stringify(errorData));
            }

            notify(
                editingId
                    ? "Member updated successfully."
                    : "Member added successfully."
            );

            closeModal();

            // Refresh the table to show the latest data
            await refreshMembers();
        } catch (error) {
            notify(error.message, "error");
        }
    }

    // Delete a member after confirmation
    async function handleDelete(id) {
        if (!window.confirm("Are you sure you want to delete this member?")) {
            return;
        }

        try {
            const response = await fetch(`${MEMBERS_URL}${id}/`, {
                method: "DELETE",
            });

            if (!response.ok) {
                throw new Error(
                    "Could not delete this member. They may have borrowing records."
                );
            }

            notify("Member deleted successfully.");
            await refreshMembers();
        } catch (error) {
            notify(error.message, "error");
        }
    }

    // Fetch the latest members after adding, editing or deleting
    async function refreshMembers() {
        try {
            const response = await fetch(MEMBERS_URL);

            if (!response.ok) {
                throw new Error("Could not refresh members.");
            }

            const data = await response.json();

            setMembers(
                Array.isArray(data) ? data : data.results || []
            );
        } catch (error) {
            notify(error.message, "error");
        }
    }

    // Filter members by name/email and selected member type
    const filteredMembers = members.filter((member) => {
        const search = searchTerm.toLowerCase().trim();

        const matchesSearch =
            member.name.toLowerCase().includes(search) ||
            (member.email || "").toLowerCase().includes(search);

        const matchesType =
            typeFilter === "" || member.member_type === typeFilter;

        return matchesSearch && matchesType;
    });

    // Define the columns displayed in the members table
    const columns = [
        { key: "id", label: "ID" },
        { key: "name", label: "Name" },
        { key: "member_type", label: "Member Type" },
        {
            key: "email",
            label: "Email",
            render: (member) => member.email || "Not provided",
        },
    ];

    return (
        <main className="members-page">

            <div className="books-page-header">
                <h1>Members Management</h1>
            </div>

            {/* Add/Edit Member Modal */}
            <Modal
                isOpen={isModalOpen}
                onClose={closeModal}
                title={editingId ? "Edit Member" : "Add New Member"}
            >
                <form className="app-modal-form" onSubmit={handleSubmit}>

                    <Input
                        label="Full Name"
                        name="name"
                        value={form.name}
                        onChange={handleChange}
                        required
                        error={errors.name}
                    />

                    <div className="input-group">
                        <label htmlFor="member-type">Member Type</label>

                        <select
                            id="member-type"
                            name="member_type"
                            value={form.member_type}
                            onChange={handleChange}
                            required
                        >
                            {memberTypes.map((type) => (
                                <option key={type} value={type}>
                                    {type}
                                </option>
                            ))}
                        </select>
                    </div>

                    <Input
                        label="Email Address"
                        name="email"
                        type="email"
                        value={form.email}
                        onChange={handleChange}
                        error={errors.email}
                    />

                    <div className="modal-actions">
                        <Button
                            type="button"
                            variant="secondary"
                            onClick={closeModal}
                        >
                            Cancel
                        </Button>

                        <Button type="submit">
                            {editingId ? "Update Member" : "Add Member"}
                        </Button>
                    </div>
                </form>
            </Modal>

            {/* Filter Members Modal */}
            <Modal
                isOpen={isFilterOpen}
                onClose={() => setIsFilterOpen(false)}
                title="Filter Members"
            >
                <form className="filter-form" onSubmit={applyFilters}>

                    <div className="input-group">
                        <label htmlFor="member-type-filter">
                            Filter by member type
                        </label>

                        <select
                            id="member-type-filter"
                            value={draftTypeFilter}
                            onChange={(e) => setDraftTypeFilter(e.target.value)}
                        >
                            <option value="">All member types</option>

                            {memberTypes.map((type) => (
                                <option key={type} value={type}>
                                    {type}
                                </option>
                            ))}
                        </select>
                    </div>

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

            {/* Members Table Section */}
            <section className="books-table-section">

                <div className="table-heading">
                    <h2>All Members</h2>
                </div>

                <div className="search-filter-container">

                    <div className="search-filter-left">

                        {/* Search by member name or email */}
                        <div className="input-group">
                            <label htmlFor="member-search">
                                Search records
                            </label>

                            <input
                                id="member-search"
                                type="search"
                                placeholder="Search by name or email..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>

                        <Button
                            variant="secondary"
                            onClick={openFilterModal}
                        >
                            Filter
                        </Button>
                    </div>

                    <div className="search-filter-right">
                        <Button onClick={openAddModal}>
                            + Add New Member
                        </Button>
                    </div>
                </div>

                {/* Loading feedback for users and assistive technology */}
                {loading && <p role="status">Loading members...</p>}

                <DataTable
                    columns={columns}
                    data={filteredMembers}
                    actions={(member) => (
                        <div className="table-actions">

                            <Button onClick={() => openEditModal(member)}>
                                Edit
                            </Button>

                            <Button
                                variant="danger"
                                onClick={() => handleDelete(member.id)}
                            >
                                Delete
                            </Button>

                        </div>
                    )}
                    emptyMessage="No members found."
                />

            </section>
        </main>
    );
}

export default Members;
