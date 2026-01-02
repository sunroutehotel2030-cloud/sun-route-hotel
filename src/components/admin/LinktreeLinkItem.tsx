import { GripVertical, Edit, Trash2, Eye, EyeOff, MousePointerClick } from "lucide-react";
import { Button } from "@/components/ui/button";
import { getIconComponent } from "./LinktreeIconPicker";

interface LinktreeLink {
  id: string;
  title: string;
  url: string;
  icon: string;
  is_active: boolean;
  position: number;
  clicks: number;
}

interface LinktreeLinkItemProps {
  link: LinktreeLink;
  index: number;
  onEdit: (link: LinktreeLink) => void;
  onDelete: (id: string) => void;
  onToggleActive: (link: LinktreeLink) => void;
  onDragStart: (e: React.DragEvent, index: number) => void;
  onDragOver: (e: React.DragEvent, index: number) => void;
  onDragEnd: () => void;
  isDragging: boolean;
  dragOverIndex: number | null;
}

const LinktreeLinkItem = ({
  link,
  index,
  onEdit,
  onDelete,
  onToggleActive,
  onDragStart,
  onDragOver,
  onDragEnd,
  isDragging,
  dragOverIndex,
}: LinktreeLinkItemProps) => {
  const IconComponent = getIconComponent(link.icon);
  
  return (
    <div
      draggable
      onDragStart={(e) => onDragStart(e, index)}
      onDragOver={(e) => onDragOver(e, index)}
      onDragEnd={onDragEnd}
      className={`flex items-center gap-3 p-4 rounded-xl border transition-all duration-200 cursor-grab active:cursor-grabbing ${
        link.is_active
          ? "bg-card border-border hover:border-primary/50 hover:shadow-md"
          : "bg-muted/30 border-muted opacity-60"
      } ${isDragging ? "opacity-50 scale-95" : ""} ${
        dragOverIndex === index ? "border-primary border-2 bg-primary/5" : ""
      }`}
    >
      <div className="flex items-center justify-center p-2 rounded-lg bg-muted/50 hover:bg-muted cursor-grab">
        <GripVertical className="h-4 w-4 text-muted-foreground" />
      </div>

      <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center flex-shrink-0">
        <IconComponent className="h-5 w-5 text-primary" />
      </div>

      <div className="flex-1 min-w-0">
        <p className="font-medium text-foreground truncate">{link.title}</p>
        <p className="text-sm text-muted-foreground truncate">{link.url}</p>
      </div>

      <div className="flex items-center gap-1 px-2 py-1 rounded-full bg-muted/50 text-sm">
        <MousePointerClick className="h-3.5 w-3.5 text-muted-foreground" />
        <span className="font-medium text-foreground">{link.clicks}</span>
      </div>

      <div className="flex items-center gap-1">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => onToggleActive(link)}
          title={link.is_active ? "Desativar" : "Ativar"}
          className="h-8 w-8"
        >
          {link.is_active ? (
            <Eye className="h-4 w-4 text-green-600" />
          ) : (
            <EyeOff className="h-4 w-4" />
          )}
        </Button>
        <Button
          variant="ghost"
          size="icon"
          onClick={() => onEdit(link)}
          title="Editar"
          className="h-8 w-8"
        >
          <Edit className="h-4 w-4" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          onClick={() => onDelete(link.id)}
          title="Excluir"
          className="h-8 w-8 hover:text-destructive"
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
};

export default LinktreeLinkItem;
