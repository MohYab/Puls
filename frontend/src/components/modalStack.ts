// Open modals, topmost last. Kept outside Modal.tsx so that other components
// (e.g. the calendar's side panel) can ask whether a modal is open, without
// breaking the Fast Refresh rule (component files export only components).
const openModals: symbol[] = [];

export function registerModal(): symbol {
  const id = Symbol("modal");
  openModals.push(id);
  return id;
}

export function unregisterModal(id: symbol): void {
  const index = openModals.indexOf(id);
  if (index !== -1) openModals.splice(index, 1);
}

export function isTopmostModal(id: symbol): boolean {
  return openModals[openModals.length - 1] === id;
}

export function hasOpenModal(): boolean {
  return openModals.length > 0;
}
