
/*
 * Reusable data table for displaying library records.
 * Supports searching, filtering, custom column rendering
 * and action buttons for individual records.
 */

import { useId } from "react";

function DataTable({
    columns,
    data,
    searchTerm = "",
    onSearch,
    filters = [],
    filterValues = {},
    onFilterChange,
    actions,
    emptyMessage = "No records found.",
}) {
    // Generate a unique ID for the search field.
    const searchId = useId();

    return (
        <section className="data-table">

            {/* Search records using the provided search function. */}
            {onSearch && (
                <div className="table-search">
                    <label htmlFor={searchId}>
                        Search records
                    </label>

                    <input
                        id={searchId}
                        type="search"
                        value={searchTerm}
                        onChange={(e) => onSearch(e.target.value)}
                        placeholder="Search..."
                    />
                </div>
            )}

            {/* Display available filters for the current table. */}
            {filters.map((filter) => (
                <div className="table-filter" key={filter.name}>
                    <label htmlFor={filter.name}>
                        {filter.label}
                    </label>

                    <select
                        id={filter.name}
                        value={filterValues[filter.name] || ""}
                        onChange={(e) =>
                            onFilterChange(filter.name, e.target.value)
                        }
                    >
                        <option value="">All</option>

                        {filter.options.map((option) => (
                            <option
                                key={option.value}
                                value={option.value}
                            >
                                {option.label}
                            </option>
                        ))}
                    </select>
                </div>
            ))}

            {/* Display records using semantic table elements. */}
            <div className="table-container">
                <table>
                    {/* Provide a descriptive caption for screen readers. */}
                    <caption className="visually-hidden">
                        Records table
                    </caption>

                    <thead>
                        <tr>
                            {columns.map((column) => (
                                <th key={column.key} scope="col">
                                    {column.label}
                                </th>
                            ))}

                            {/* Include an actions heading when actions are provided. */}
                            {actions && (
                                <th scope="col">Actions</th>
                            )}
                        </tr>
                    </thead>

                    <tbody>
                        {/* Display records or an empty-state message. */}
                        {data.length > 0 ? (
                            data.map((item) => (
                                <tr key={item.id}>
                                    {/* Render custom content when a column provides it. */}
                                    {columns.map((column) => (
                                        <td key={column.key}>
                                            {column.render
                                                ? column.render(item)
                                                : item[column.key]}
                                        </td>
                                    ))}

                                    {/* Display available actions for each record. */}
                                    {actions && (
                                        <td className="table-action-cell">
                                            <div className="table-actions">
                                                {actions(item)}
                                            </div>
                                        </td>
                                    )}
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td
                                    colSpan={columns.length + (actions ? 1 : 0)}
                                    className="empty-table-message"
                                >
                                    {emptyMessage}
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

        </section>
    );
}

export default DataTable;

