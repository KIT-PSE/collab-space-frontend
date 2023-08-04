import { Modal } from 'bootstrap';

/**
 * Get or create a Bootstrap Modal instance for the given modal element ID.
 * @param id - The ID of the modal element.
 * @returns The Bootstrap Modal instance.
 */
export function getModal(id: string): Modal {
  return Modal.getOrCreateInstance(document.getElementById(id) as HTMLElement);
}

/**
 * Open the Bootstrap modal with the given ID.
 * @param id - The ID of the modal element to open.
 */
export function openModal(id: string): void {
  getModal(id).show();
}

/**
 * Close the Bootstrap modal with the given ID.
 * @param id - The ID of the modal element to close.
 */
export function closeModal(id: string): void {
  getModal(id).hide();
}
