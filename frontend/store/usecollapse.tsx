import { create } from "zustand";
interface collapsible {
	isOpen: boolean;
	onOpen: () => void;
	onClose: () => void;
}

export const useCollapsibleStore = create<collapsible>((set) => ({
	isOpen: true,
	onOpen: () => set({ isOpen: true }),
	onClose: () => set({ isOpen: false }),
}));
