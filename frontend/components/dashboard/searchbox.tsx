import * as React from 'react';
import { Badge, Package, Search, Loader2 } from 'lucide-react';

import { Button } from '@/components/ui/button';
import {
    CommandDialog,
    CommandEmpty,
    CommandGroup,
    CommandInput,
    CommandItem,
    CommandList,
} from '@/components/ui/command';
import { getSourcingProjects } from '@/actions/projects';
import { ProjectType } from '@/lib/types';
import { useRouter } from 'next/navigation';

export default function SearchBox() {
    const [open, setOpen] = React.useState(false);
    const [projects, setProjects] = React.useState<ProjectType[]>([]);
    const [loading, setLoading] = React.useState(false);
    const [searchQuery, setSearchQuery] = React.useState('');
    const [displayCount, setDisplayCount] = React.useState(5);

    const router = useRouter();

    // Fetch projects on component mount
    React.useEffect(() => {
        const fetchProjects = async () => {
            setLoading(true);
            try {
                const response = await getSourcingProjects({});
                setProjects(response?.items || []);
            } catch (error) {
                console.error('Error fetching projects:', error);
                setProjects([]);
            } finally {
                setLoading(false);
            }
        };

        fetchProjects();
    }, []);

    // Filter projects based on search query
    const filteredProjects = React.useMemo(() => {
        if (!searchQuery.trim()) {
            return projects.slice(0, displayCount);
        }

        const filtered = projects.filter(
            (project) =>
                project.Name?.toLowerCase().includes(
                    searchQuery.toLowerCase()
                ) ||
                project.Objective?.toLowerCase().includes(
                    searchQuery.toLowerCase()
                )
        );

        return filtered.slice(0, displayCount);
    }, [projects, searchQuery, displayCount]);

    // Handle search input change
    const handleSearchChange = (value: string) => {
        setSearchQuery(value);
        // Reset display count when searching
        if (value.trim()) {
            setDisplayCount(10); // Show more results when searching
        } else {
            setDisplayCount(5); // Back to initial 5 when not searching
        }
    };

    // Load more projects
    const loadMoreProjects = () => {
        setDisplayCount((prev) => prev + 5);
    };

    // Keyboard shortcut handler
    React.useEffect(() => {
        const down = (e: any) => {
            if (e.key === 'k' && (e.metaKey || e.ctrlKey)) {
                e.preventDefault();
                setOpen((open) => !open);
            }
        };

        document.addEventListener('keydown', down);
        return () => document.removeEventListener('keydown', down);
    }, []);

    // Reset search when dialog closes
    React.useEffect(() => {
        if (!open) {
            setSearchQuery('');
            setDisplayCount(5);
        }
    }, [open]);

    return (
        <>
            <Button
                variant={'outline'}
                onClick={() => setOpen(true)}
                className="md:min-w-44 md:w-1/3 justify-start px-2 py-4 bg-[#F6F6F6] items-center"
                size="lg"
            >
                <Search className="size-4 mr-2" />
                <span className="text-start min-w-24 text-[#8A8A8A]">
                    Search projects...
                </span>
                <kbd className="ml-auto pointer-events-none inline-flex h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium text-muted-foreground opacity-100">
                    <span className="text-xs">⌘</span>K
                </kbd>
            </Button>

            <CommandDialog open={open} onOpenChange={setOpen}>
                <CommandInput
                    placeholder="Search projects..."
                    value={searchQuery}
                    onValueChange={handleSearchChange}
                />
                <CommandList>
                    {loading ? (
                        <div className="flex items-center justify-center py-6">
                            <Loader2 className="h-4 w-4 animate-spin mr-2" />
                            <span className="text-sm text-muted-foreground">
                                Loading projects...
                            </span>
                        </div>
                    ) : (
                        <>
                            {filteredProjects.length === 0 ? (
                                <CommandEmpty>
                                    {searchQuery
                                        ? 'No projects found matching your search.'
                                        : 'No projects available.'}
                                </CommandEmpty>
                            ) : (
                                <>
                                    <CommandGroup
                                        heading={
                                            searchQuery
                                                ? `Search Results (${filteredProjects.length})`
                                                : `Projects (${filteredProjects.length})`
                                        }
                                        className="mb-5"
                                    >
                                        {filteredProjects.map((project) => (
                                            <CommandItem
                                                key={project.SourcingProjectID}
                                                onSelect={() => {
                                                    // Handle project selection here
                                                    router.push(
                                                        `/dashboard/projects/${project.SourcingProjectID}`
                                                    );
                                                    setOpen(false);
                                                }}
                                                className="cursor-pointer"
                                            >
                                                <Package className="mr-2 h-4 w-4" />
                                                <div className="flex flex-col flex-1 min-w-0">
                                                    <span className="text-[#121212] font-medium truncate">
                                                        {project.Name ||
                                                            'Untitled Project'}
                                                    </span>
                                                </div>
                                            </CommandItem>
                                        ))}
                                    </CommandGroup>

                                    {/* Load More Button */}
                                    {!searchQuery &&
                                        filteredProjects.length ===
                                            displayCount &&
                                        displayCount < projects.length && (
                                            <div className="px-2 pb-2">
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={loadMoreProjects}
                                                    className="w-full text-xs"
                                                >
                                                    Load{' '}
                                                    {Math.min(
                                                        5,
                                                        projects.length -
                                                            displayCount
                                                    )}{' '}
                                                    more projects
                                                </Button>
                                            </div>
                                        )}
                                </>
                            )}
                        </>
                    )}
                </CommandList>
            </CommandDialog>
        </>
    );
}
