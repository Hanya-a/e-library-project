
/*
 * Reusable modal dialog for forms and interactive content.
 * Supports keyboard navigation, Escape-to-close,
 * focus trapping and restoration of the previous focus.
 */

import { useEffect, useId, useRef } from "react";

function Modal({ isOpen, onClose, title, children }) {
    const modalRef = useRef(null);
    const onCloseRef = useRef(onClose);
    const titleId = useId();

    // Keep the latest close callback available to keyboard handlers.
    onCloseRef.current = onClose;

    useEffect(() => {
        if (!isOpen) return;

        // Remember which element was focused before opening the modal.
        const previousFocus = document.activeElement;
        const modal = modalRef.current;

        // Move focus to the first suitable form field or button.
        const firstField = modal?.querySelector(
            "[data-autofocus], input:not([type='hidden']), select, textarea, button:not(:disabled)"
        );

        if (firstField) {
            firstField.focus();
        }

        function handleKeyDown(event) {
            // Allow users to close the modal using the Escape key.
            if (event.key === "Escape") {
                event.preventDefault();
                onCloseRef.current();
                return;
            }

            // Keep keyboard focus inside the open modal.
            if (event.key === "Tab") {
                const focusable = Array.from(
                    modal.querySelectorAll(
                        "button:not(:disabled), input:not(:disabled), select:not(:disabled), textarea:not(:disabled), a[href], [tabindex]:not([tabindex='-1'])"
                    )
                ).filter(
                    (element) =>
                        element.getClientRects().length > 0 &&
                        !element.hasAttribute("hidden")
                );

                if (focusable.length === 0) {
                    event.preventDefault();
                    modal.focus();
                    return;
                }

                const first = focusable[0];
                const last = focusable[focusable.length - 1];

                // Move backwards to the last element when Shift+Tab
                // is pressed from the first element.
                if (
                    event.shiftKey &&
                    (document.activeElement === first ||
                        !modal.contains(document.activeElement))
                ) {
                    event.preventDefault();
                    last.focus();
                }

                // Move forwards to the first element when Tab
                // is pressed from the last element.
                else if (
                    !event.shiftKey &&
                    (document.activeElement === last ||
                        !modal.contains(document.activeElement))
                ) {
                    event.preventDefault();
                    first.focus();
                }
            }
        }

        // Listen for keyboard events while the modal is open.
        document.addEventListener("keydown", handleKeyDown);

        return () => {
            // Remove the listener when the modal closes or unmounts.
            document.removeEventListener("keydown", handleKeyDown);

            // Restore focus to the element that opened the modal.
            if (previousFocus?.isConnected) {
                previousFocus.focus();
            }
        };
    }, [isOpen]);

    // Do not render the modal when it is closed.
    if (!isOpen) return null;

    return (
        <div
            className="modal-overlay"

            // Close the modal when the user clicks outside its content.
            onMouseDown={(event) => {
                if (event.target === event.currentTarget) {
                    onCloseRef.current();
                }
            }}
        >
            <section
                className="book-modal"
                ref={modalRef}
                role="dialog"
                aria-modal="true"
                aria-labelledby={titleId}
                tabIndex={-1}
            >
                <div className="book-modal-header">
                    <h2 id={titleId}>{title}</h2>

                    {/* Provide a clearly labelled close button. */}
                    <button
                        type="button"
                        className="modal-close"
                        aria-label="Close dialog"
                        onClick={() => onCloseRef.current()}
                    >
                        &times;
                    </button>
                </div>

                {/* Render the form or other modal content. */}
                {children}
            </section>
        </div>
    );
}

export default Modal;
