import { Search, Filter } from 'lucide-react';
import Card from '../Card/Card';

export interface FilterOption {
    label: string;
    value: string;
}

export interface DropdownFilter {
    value: string;
    onChange: (value: string) => void;
    options: FilterOption[];
    /** Show Filter icon on this dropdown */
    showIcon?: boolean;
}

interface FilterBarProps {
    searchPlaceholder?: string;
    searchValue: string;
    onSearchChange: (value: string) => void;
    filters?: DropdownFilter[];
}

const FilterBar = ({
    searchPlaceholder = 'Search...',
    searchValue,
    onSearchChange,
    filters = [],
}: FilterBarProps) => (
    <Card className="flex flex-wrap items-center justify-between gap-4 p-4 lg:px-6">
        {/* Search Input */}
        <div className="flex items-center gap-3 bg-slate-50 px-4 py-2 rounded-md border border-slate-200 flex-grow max-w-[400px]">
            <Search size={18} className="text-slate-400 shrink-0" />
            <input
                type="text"
                placeholder={searchPlaceholder}
                value={searchValue}
                onChange={(e) => onSearchChange(e.target.value)}
                className="w-full bg-transparent border-none outline-none text-[15px] text-slate-800 font-sans cursor-text"
            />
        </div>

        {/* Dropdown Filters */}
        {filters.length > 0 && (
            <div className="flex flex-wrap gap-4">
                {filters.map((filter, index) => (
                    <div
                        key={index}
                        className="flex items-center gap-3 bg-slate-50 px-4 py-2 rounded-md border border-slate-200"
                    >
                        {filter.showIcon && <Filter size={18} className="text-slate-400 shrink-0" />}
                        <select
                            value={filter.value}
                            onChange={(e) => filter.onChange(e.target.value)}
                            className="bg-transparent border-none outline-none text-[15px] text-slate-800 font-sans cursor-pointer focus:ring-0"
                        >
                            {filter.options.map((opt) => (
                                <option key={opt.value} value={opt.value}>
                                    {opt.label}
                                </option>
                            ))}
                        </select>
                    </div>
                ))}
            </div>
        )}
    </Card>
);

export default FilterBar;
