import { Link, useLocation } from "wouter";
import { Building2, GripVertical, RotateCcw } from "lucide-react";
import { cn } from "@/lib/utils";
import { ThemeToggle } from "@/components/ThemeToggle";
import { useNavigationOrder } from "@/hooks/useNavigationOrder";
import { Button } from "@/components/ui/button";
// Navigation imports
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core';
import {
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import {
  useSortable,
} from '@dnd-kit/sortable';
import {CSS} from '@dnd-kit/utilities';

interface SortableNavItemProps {
  item: {
    id: string;
    name: string;
    href: string;
    icon: React.ComponentType<{ className?: string }>;
  };
  isActive: boolean;
}

function SortableNavItem({ item, isActive }: SortableNavItemProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: item.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn(
        "group relative rounded-md transition-all duration-200",
        isDragging ? "z-50 shadow-lg bg-card border border-border" : ""
      )}
    >
      {/* Drag Handle */}
      <div
        {...attributes}
        {...listeners}
        className="absolute left-0 top-0 h-full w-6 flex items-center justify-center cursor-grab active:cursor-grabbing opacity-0 group-hover:opacity-100 transition-opacity"
        data-testid={`drag-handle-${item.id}`}
      >
        <GripVertical className="h-4 w-4 text-muted-foreground" />
      </div>

      <Link
        href={item.href}
        className={cn(
          "flex items-center px-3 py-2 pl-8 text-sm font-medium rounded-md transition-colors",
          "group-hover:pl-10 transition-all duration-200",
          isActive
            ? "bg-primary text-primary-foreground"
            : "text-muted-foreground hover:text-foreground hover:bg-muted"
        )}
        data-testid={`nav-${item.name.toLowerCase().replace(/\s+/g, '-')}`}
      >
        <item.icon className="mr-3 h-5 w-5 flex-shrink-0" />
        <span className="truncate">{item.name}</span>
      </Link>
    </div>
  );
}

export default function Navigation() {
  const [location] = useLocation();
  const { navigation, reorderNavigation, resetOrder } = useNavigationOrder();

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    
    if (over && active.id !== over.id) {
      reorderNavigation(String(active.id), String(over.id));
    }
  };

  return (
    <>
      {/* Logo */}
      <div className="flex items-center justify-between h-16 px-6 border-b border-border">
        <div className="flex items-center">
          <img 
            src="/images/logo-light.jpg"
            alt="FireBuild.ai" 
            className="h-8 w-auto dark:hidden"
            data-testid="navigation-logo-light"
          />
          <img 
            src="/images/logo-dark.jpg"
            alt="FireBuild.ai" 
            className="h-8 w-auto hidden dark:block"
            data-testid="navigation-logo-dark"
          />
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={resetOrder}
            title="Reset menu order"
            data-testid="reset-navigation-order"
            className="h-8 w-8"
          >
            <RotateCcw className="h-4 w-4" />
          </Button>
          <ThemeToggle />
        </div>
      </div>

      {/* Navigation */}
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={handleDragEnd}
      >
        <nav className="flex-1 px-4 py-6">
          <SortableContext
            items={navigation.map(item => item.id)}
            strategy={verticalListSortingStrategy}
          >
            <div className="space-y-1">
              {navigation.map((item) => {
                const isActive = location === item.href;
                return (
                  <SortableNavItem
                    key={item.id}
                    item={item}
                    isActive={isActive}
                  />
                );
              })}
            </div>
          </SortableContext>
        </nav>
      </DndContext>

      {/* Footer */}
      <div className="p-4 border-t border-border">
        <div className="flex items-center justify-between">
          <p className="text-xs text-muted-foreground">
            © 2024 FireBuild.ai
          </p>
          <p className="text-xs text-muted-foreground">
            Drag to reorder
          </p>
        </div>
      </div>
    </>
  );
}