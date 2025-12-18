"use client";

import { useEffect, useState } from "react";
import api from "@/lib/api";
import {
    DndContext,
    closestCenter,
    KeyboardSensor,
    PointerSensor,
    useSensor,
    useSensors,
    DragOverlay,
    defaultDropAnimationSideEffects
} from "@dnd-kit/core";
import {
    arrayMove,
    SortableContext,
    sortableKeyboardCoordinates,
    horizontalListSortingStrategy,
    verticalListSortingStrategy,
    useSortable
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Plus, GripVertical, Trash2, Edit2, Loader2, Layout, Package as PackageIcon, FolderOpen, Activity, Save, X } from "lucide-react";
import toast from "react-hot-toast";
import * as LucideIcons from "lucide-react";

// Lucide icon components map
const ICON_MAP: any = LucideIcons;

const AVAILABLE_ICONS = [
    "Activity", "Heart", "Shield", "User", "Award", "CheckCircle", "Zap",
    "Thermometer", "Stethoscope", "Microscope", "Brain", "Bone", "Eye"
];

const COLORS = [
    { label: "Blue", class: "bg-blue-100 text-blue-600" },
    { label: "Red", class: "bg-red-100 text-red-600" },
    { label: "Green", class: "bg-green-100 text-green-600" },
    { label: "Orange", class: "bg-orange-100 text-orange-600" },
    { label: "Purple", class: "bg-purple-100 text-purple-600" },
    { label: "Pink", class: "bg-pink-100 text-pink-600" },
    { label: "Teal", class: "bg-teal-100 text-teal-600" },
];

function renderIcon(params: { iconName: string, className?: string }) {
    const IconComponent = ICON_MAP[params.iconName] || Activity;
    return <IconComponent className={params.className} />;
}

// --- Components ---

function SortableTab({ tab, isActive, onClick, onEdit, onDelete }: any) {
    const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id: `tab-${tab.tab_id}` });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
    };

    return (
        <div
            ref={setNodeRef}
            style={style}
            className={`group relative flex items-center gap-2 px-4 py-3 rounded-t-lg cursor-pointer border-r border-slate-200 dark:border-slate-700 min-w-[150px]
                ${isActive ? 'bg-white dark:bg-slate-800 text-slate-800 dark:text-white font-bold border-t-2 border-t-emerald-500' : 'bg-slate-100 dark:bg-slate-900 text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-800'}
            `}
            onClick={onClick}
        >
            <div {...attributes} {...listeners} className="cursor-grab text-slate-400 hover:text-slate-600 opacity-0 group-hover:opacity-100">
                <GripVertical size={14} />
            </div>

            {/* Show Icon */}
            <div className={`w-8 h-8 rounded-full flex items-center justify-center ${tab.color_class || 'bg-slate-200'}`}>
                {renderIcon({ iconName: tab.icon || 'Activity', className: "w-4 h-4" })}
            </div>

            <span className="flex-1 truncate select-none">{tab.tab_name}</span>
            {isActive && (
                <div className="flex gap-1 ml-2">
                    <button onClick={(e) => { e.stopPropagation(); onEdit(); }} className="p-1 hover:text-emerald-600 rounded"><Edit2 size={12} /></button>
                    <button onClick={(e) => { e.stopPropagation(); onDelete(); }} className="p-1 hover:text-red-500 rounded"><Trash2 size={12} /></button>
                </div>
            )}
        </div>
    );
}

function SortableItem({ item, onRemove }: any) {
    const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id: `item-${item.id}` });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
    };

    return (
        <div ref={setNodeRef} style={style} className="flex items-center gap-4 p-4 bg-white dark:bg-slate-800 border-b border-slate-100 dark:border-slate-700 last:border-0 group hover:bg-slate-50 dark:hover:bg-slate-800/50">
            <div {...attributes} {...listeners} className="cursor-grab text-slate-300 hover:text-slate-500">
                <GripVertical size={20} />
            </div>
            <div className={`p-2 rounded-lg ${item.type === 'category' ? 'bg-blue-100 text-blue-600' : 'bg-purple-100 text-purple-600'}`}>
                {item.type === 'category' ? <FolderOpen size={20} /> : <PackageIcon size={20} />}
            </div>
            <div className="flex-1">
                <p className="font-medium text-slate-800 dark:text-white text-lg">{item.name}</p>
                <div className="flex gap-2 text-xs text-slate-500">
                    <span className="uppercase tracking-wider font-semibold">{item.type}</span>
                    {item.price > 0 && <span>• ₹{item.price}</span>}
                </div>
            </div>
            <button onClick={onRemove} className="opacity-0 group-hover:opacity-100 p-2 text-slate-400 hover:text-red-500 transition-opacity">
                <Trash2 size={18} />
            </button>
        </div>
    );
}

export default function WebsiteCatalogPage() {
    const [tabs, setTabs] = useState<any[]>([]);
    const [activeTabId, setActiveTabId] = useState<number | null>(null);
    const [loading, setLoading] = useState(true);

    // Form States
    const [showTabModal, setShowTabModal] = useState(false);

    // Tab Form Data
    const [tabFormData, setTabFormData] = useState({
        tab_name: '',
        name_hi: '',
        name_gu: '',
        icon: 'Activity',
        color_class: 'bg-blue-100 text-blue-600'
    });
    const [editingTabId, setEditingTabId] = useState<number | null>(null);
    const [langTab, setLangTab] = useState<'en' | 'hi' | 'gu'>('en');

    const [showItemModal, setShowItemModal] = useState(false);
    const [availableCategories, setAvailableCategories] = useState<any[]>([]);
    const [availablePackages, setAvailablePackages] = useState<any[]>([]);
    const [itemType, setItemType] = useState('category'); // category | package
    const [selectedRefId, setSelectedRefId] = useState<string[]>([]);

    const sensors = useSensors(
        useSensor(PointerSensor),
        useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
    );

    useEffect(() => {
        fetchStructure();
        fetchAvailableItems();
    }, []);

    const fetchStructure = async () => {
        try {
            const res = await api.get('/website-catalog/structure');
            setTabs(res.data.data);
            if (!activeTabId && res.data.data.length > 0) {
                // Keep active tab if possible, else select first
                if (res.data.data.find((t: any) => t.tab_id === activeTabId)) {
                    // ok
                } else {
                    setActiveTabId(res.data.data[0].tab_id);
                }
            } else if (res.data.data.length === 0) {
                setActiveTabId(null);
            }
        } catch (e) {
            toast.error("Failed to load catalog");
        } finally {
            setLoading(false);
        }
    };

    const fetchAvailableItems = async () => {
        try {
            const [catRes, pkgRes] = await Promise.all([
                api.get('/lab-catalog/categories'),
                api.get('/packages')
            ]);
            setAvailableCategories(catRes.data.data);
            setAvailablePackages(pkgRes.data.data);
        } catch (e) { console.error(e); }
    };

    // --- Tab Actions ---
    const handleSaveTab = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            if (editingTabId) {
                await api.put(`/website-catalog/tabs/${editingTabId}`, tabFormData);
            } else {
                await api.post('/website-catalog/tabs', tabFormData);
            }
            setShowTabModal(false);
            setTabFormData({ tab_name: '', name_hi: '', name_gu: '', icon: 'Activity', color_class: 'bg-blue-100 text-blue-600' });
            setEditingTabId(null);
            fetchStructure();
            toast.success("Saved successfully");
        } catch (e) { toast.error("Failed to save"); }
    };

    const handleDeleteTab = async (id: number) => {
        if (!confirm("Delete this category? All items inside will be removed.")) return;
        try {
            await api.delete(`/website-catalog/tabs/${id}`);
            fetchStructure();
            toast.success("Deleted");
        } catch (e) { toast.error("Failed to delete"); }
    };

    const handleDragTabEnd = async (event: any) => {
        const { active, over } = event;
        if (!over || active.id === over.id) return;

        const oldIndex = tabs.findIndex(t => `tab-${t.tab_id}` === active.id);
        const newIndex = tabs.findIndex(t => `tab-${t.tab_id}` === over.id);

        const newTabs = arrayMove(tabs, oldIndex, newIndex);
        setTabs(newTabs); // Optimistic UI

        api.put('/website-catalog/tabs/reorder', { orderedIds: newTabs.map(t => t.tab_id) }).catch(() => toast.error("Reorder failed"));
    };

    // --- Item Actions ---
    const handleAddItem = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!activeTabId) return;
        try {
            await api.post('/website-catalog/items', {
                tabId: activeTabId,
                type: itemType,
                refId: selectedRefId
            });
            setShowItemModal(false);
            fetchStructure();
            toast.success("Items added");
        } catch (e) { toast.error("Failed to add items"); }
    };

    const handleRemoveItem = async (id: number) => {
        if (!confirm("Remove this item?")) return;
        try {
            await api.delete(`/website-catalog/items/${id}`);
            // Optimistic update
            const updatedTabs = tabs.map(t => {
                if (t.tab_id === activeTabId) {
                    return { ...t, items: t.items.filter((i: any) => i.id !== id) };
                }
                return t;
            });
            setTabs(updatedTabs);
            toast.success("Removed");
        } catch (e) { toast.error("Failed to remove"); }
    };

    const handleDragItemEnd = (event: any) => {
        const { active, over } = event;
        if (!over || active.id === over.id || !activeTabId) return;

        const activeTab = tabs.find(t => t.tab_id === activeTabId);
        if (!activeTab) return;

        const oldIndex = activeTab.items.findIndex((i: any) => `item-${i.id}` === active.id);
        const newIndex = activeTab.items.findIndex((i: any) => `item-${i.id}` === over.id);

        const newItems = arrayMove(activeTab.items, oldIndex, newIndex);

        // Optimistic UI
        const updatedTabs = tabs.map(t => {
            if (t.tab_id === activeTabId) return { ...t, items: newItems };
            return t;
        });
        setTabs(updatedTabs);

        api.put('/website-catalog/items/reorder', { tabId: activeTabId, orderedItemIds: newItems.map((i: any) => i.id) }).catch(() => toast.error("Reorder failed"));
    };


    const activeTab = tabs.find(t => t.tab_id === activeTabId);

    return (
        <div className="p-8 max-w-[1600px] mx-auto min-h-screen flex flex-col">
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h1 className="text-2xl font-bold text-slate-800 dark:text-white">Website Categories & Layout</h1>
                    <p className="text-slate-500">Organize tabs and categories for the website.</p>
                </div>
                <button onClick={() => {
                    setEditingTabId(null);
                    setTabFormData({ tab_name: '', name_hi: '', name_gu: '', icon: 'Activity', color_class: 'bg-blue-100 text-blue-600' });
                    setShowTabModal(true);
                }} className="bg-slate-900 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-slate-800">
                    <Plus size={18} /> New Category
                </button>
            </div>

            {loading ? <div className="flex-1 flex justify-center items-center"><Loader2 className="animate-spin" /></div> : (
                <>
                    {/* Tabs Row */}
                    <div className="mb-0 overflow-x-auto pb-0">
                        <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragTabEnd}>
                            <SortableContext items={tabs.map(t => `tab-${t.tab_id}`)} strategy={horizontalListSortingStrategy}>
                                <div className="flex border-b border-slate-200 dark:border-slate-700 min-w-max">
                                    {tabs.map(tab => (
                                        <SortableTab
                                            key={tab.tab_id}
                                            tab={tab}
                                            isActive={activeTabId === tab.tab_id}
                                            onClick={() => setActiveTabId(tab.tab_id)}
                                            onEdit={() => {
                                                setEditingTabId(tab.tab_id);
                                                setTabFormData({
                                                    tab_name: tab.tab_name,
                                                    name_hi: tab.name_hi || '',
                                                    name_gu: tab.name_gu || '',
                                                    icon: tab.icon || 'Activity',
                                                    color_class: tab.color_class || 'bg-blue-100 text-blue-600'
                                                });
                                                setShowTabModal(true);
                                            }}
                                            onDelete={() => handleDeleteTab(tab.tab_id)}
                                        />
                                    ))}
                                    {tabs.length === 0 && <div className="p-4 text-slate-400 italic">No categories yet. Create one to start.</div>}
                                </div>
                            </SortableContext>
                        </DndContext>
                    </div>

                    {/* Tab Content Area */}
                    <div className="flex-1 bg-white dark:bg-slate-800 border border-t-0 border-slate-200 dark:border-slate-700 p-6 rounded-b-xl shadow-sm min-h-[400px]">
                        {activeTab ? (
                            <div className="max-w-4xl mx-auto">
                                <div className="flex justify-between items-center mb-6">
                                    <div className="flex items-center gap-3">
                                        <div className={`p-2 rounded-lg ${activeTab.color_class}`}>
                                            {renderIcon({ iconName: activeTab.icon || 'Activity', className: "w-6 h-6" })}
                                        </div>
                                        <h3 className="text-xl font-bold text-slate-700 dark:text-slate-300">{activeTab.tab_name} Content</h3>
                                    </div>
                                    <button onClick={() => setShowItemModal(true)} className="bg-emerald-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-emerald-700 shadow-lg shadow-emerald-500/20">
                                        <Plus size={18} /> Add Item to Category
                                    </button>
                                </div>

                                <div className="bg-slate-50 dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden">
                                    <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragItemEnd}>
                                        <SortableContext items={activeTab.items.map((i: any) => `item-${i.id}`)} strategy={verticalListSortingStrategy}>
                                            {activeTab.items.length === 0 ? (
                                                <div className="py-12 text-center text-slate-400">
                                                    <Layout className="w-12 h-12 mx-auto mb-2 opacity-50" />
                                                    <p>This category is empty.</p>
                                                    <p className="text-sm">Click "Add Item" to add individual tests or packages.</p>
                                                </div>
                                            ) : (
                                                <div className="divide-y divide-slate-100 dark:divide-slate-800">
                                                    {activeTab.items.map((item: any) => (
                                                        <SortableItem key={item.id} item={item} onRemove={() => handleRemoveItem(item.id)} />
                                                    ))}
                                                </div>
                                            )}
                                        </SortableContext>
                                    </DndContext>
                                </div>
                            </div>
                        ) : (
                            <div className="h-full flex flex-col items-center justify-center text-slate-400">
                                <p>Select a category to view content</p>
                            </div>
                        )}
                    </div>
                </>
            )}

            {/* Tab (Category) Modal */}
            {showTabModal && (
                <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center backdrop-blur-sm">
                    <form onSubmit={handleSaveTab} className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-2xl w-full max-w-lg border border-slate-100 dark:border-slate-700 max-h-[90vh] overflow-y-auto">
                        <h3 className="text-xl font-bold mb-6">{editingTabId ? 'Edit Category' : 'New Website Category'}</h3>

                        {/* Language Tabs */}
                        <div className="flex border-b border-slate-200 dark:border-slate-700 mb-4">
                            <button type="button" onClick={() => setLangTab('en')} className={`px-4 py-2 text-sm font-medium ${langTab === 'en' ? 'border-b-2 border-emerald-500 text-emerald-600' : 'text-slate-500'}`}>English</button>
                            <button type="button" onClick={() => setLangTab('hi')} className={`px-4 py-2 text-sm font-medium ${langTab === 'hi' ? 'border-b-2 border-emerald-500 text-emerald-600' : 'text-slate-500'}`}>Hindi</button>
                            <button type="button" onClick={() => setLangTab('gu')} className={`px-4 py-2 text-sm font-medium ${langTab === 'gu' ? 'border-b-2 border-emerald-500 text-emerald-600' : 'text-slate-500'}`}>Gujarati</button>
                        </div>

                        <div className="mb-6">
                            {langTab === 'en' && (
                                <div>
                                    <label className="block text-sm font-medium mb-1">Name (English)</label>
                                    <input autoFocus value={tabFormData.tab_name} onChange={e => setTabFormData({ ...tabFormData, tab_name: e.target.value })} placeholder="e.g. Popular Tests" className="w-full px-4 py-2 border rounded-lg bg-slate-50 dark:bg-slate-900" required />
                                </div>
                            )}
                            {langTab === 'hi' && (
                                <div>
                                    <label className="block text-sm font-medium mb-1">Name (Hindi)</label>
                                    <input value={tabFormData.name_hi} onChange={e => setTabFormData({ ...tabFormData, name_hi: e.target.value })} placeholder="e.g. लोकप्रिय परीक्षण" className="w-full px-4 py-2 border rounded-lg bg-slate-50 dark:bg-slate-900" />
                                </div>
                            )}
                            {langTab === 'gu' && (
                                <div>
                                    <label className="block text-sm font-medium mb-1">Name (Gujarati)</label>
                                    <input value={tabFormData.name_gu} onChange={e => setTabFormData({ ...tabFormData, name_gu: e.target.value })} placeholder="e.g. લોકપ્રિય પરીક્ષણો" className="w-full px-4 py-2 border rounded-lg bg-slate-50 dark:bg-slate-900" />
                                </div>
                            )}
                        </div>

                        {/* Icon Selection */}
                        <div className="mb-6">
                            <label className="block text-sm font-medium mb-2">Select Icon</label>
                            <div className="grid grid-cols-7 gap-2">
                                {AVAILABLE_ICONS.map(iconName => (
                                    <div
                                        key={iconName}
                                        onClick={() => setTabFormData({ ...tabFormData, icon: iconName })}
                                        className={`cursor-pointer p-2 rounded-lg border flex items-center justify-center hover:bg-slate-50 dark:hover:bg-slate-900 transition-colors ${tabFormData.icon === iconName ? 'border-emerald-500 ring-2 ring-emerald-500/20 bg-emerald-50 dark:bg-emerald-900/20' : 'border-slate-200 dark:border-slate-700'}`}
                                    >
                                        {renderIcon({ iconName, className: "w-5 h-5 text-slate-600 dark:text-slate-400" })}
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Color Selection */}
                        <div className="mb-6">
                            <label className="block text-sm font-medium mb-2">Select Theme</label>
                            <div className="flex flex-wrap gap-2">
                                {COLORS.map(color => (
                                    <div
                                        key={color.label}
                                        onClick={() => setTabFormData({ ...tabFormData, color_class: color.class })}
                                        className={`cursor-pointer px-3 py-1 rounded-full text-xs font-bold border transition-all ${color.class} ${tabFormData.color_class === color.class ? 'ring-2 ring-offset-2 ring-slate-400 scale-105' : 'border-transparent opacity-70 hover:opacity-100'}`}
                                    >
                                        {color.label}
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="flex gap-2">
                            <button type="button" onClick={() => setShowTabModal(false)} className="flex-1 px-4 py-2 rounded-lg border hover:bg-slate-50">Cancel</button>
                            <button type="submit" className="flex-1 px-4 py-2 rounded-lg bg-slate-900 text-white hover:bg-slate-800 flex items-center justify-center gap-2">
                                <Save size={18} /> Save
                            </button>
                        </div>
                    </form>
                </div>
            )}

            {/* Item Modal */}
            {showItemModal && (
                <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center backdrop-blur-sm">
                    <form onSubmit={handleAddItem} className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-2xl w-full max-w-md">
                        <h3 className="text-lg font-bold mb-4">Add Item to {activeTab?.tab_name}</h3>

                        <div className="flex gap-4 mb-4">
                            <label className={`flex-1 p-3 rounded-lg border cursor-pointer border-slate-200 dark:border-slate-700 flex flex-col items-center gap-2 ${itemType === 'category' ? 'bg-blue-50 border-blue-500 text-blue-600' : 'hover:bg-slate-50'}`}>
                                <input type="radio" className="hidden" name="type" checked={itemType === 'category'} onChange={() => setItemType('category')} />
                                <FolderOpen /> <span className="font-semibold">Category</span>
                            </label>
                            <label className={`flex-1 p-3 rounded-lg border cursor-pointer border-slate-200 dark:border-slate-700 flex flex-col items-center gap-2 ${itemType === 'package' ? 'bg-purple-50 border-purple-500 text-purple-600' : 'hover:bg-slate-50'}`}>
                                <input type="radio" className="hidden" name="type" checked={itemType === 'package'} onChange={() => setItemType('package')} />
                                <PackageIcon /> <span className="font-semibold">Package</span>
                            </label>
                        </div>

                        <div className="mb-4">
                            <label className="block text-sm font-medium mb-1">Select {itemType === 'category' ? 'Categories' : 'Packages'}</label>
                            <p className="text-xs text-slate-500 mb-2">Hold Ctrl (Windows) or Cmd (Mac) to select multiple items.</p>
                            <select
                                autoFocus
                                multiple
                                required
                                value={selectedRefId}
                                onChange={e => {
                                    const options = Array.from(e.target.selectedOptions, option => option.value);
                                    setSelectedRefId(options);
                                }}
                                className="w-full px-4 py-2 rounded-lg border bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-700 h-48"
                            >
                                {itemType === 'category' ? availableCategories.map(c => (
                                    <option key={c.category_id} value={c.category_id}>{c.category_name}</option>
                                )) : availablePackages.map(p => (
                                    <option key={p.package_id} value={p.package_id}>{p.package_name}</option>
                                ))}
                            </select>
                        </div>

                        <div className="flex gap-2">
                            <button type="button" onClick={() => setShowItemModal(false)} className="flex-1 px-4 py-2 rounded-lg border hover:bg-slate-50">Cancel</button>
                            <button type="submit" className="flex-1 px-4 py-2 rounded-lg bg-emerald-600 text-white hover:bg-emerald-700">Add Items</button>
                        </div>
                    </form>
                </div>
            )}
        </div>
    );
}
