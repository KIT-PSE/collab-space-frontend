import { Modal } from 'bootstrap';

export function getModal(id: string): Modal {
  return Modal.getOrCreateInstance(document.getElementById(id) as HTMLElement);
}

export function openModal(id: string): void {
  getModal(id).show();
}

export function closeModal(id: string): void {
  getModal(id).hide();
}
