import { MoreHorizontal, Edit, Trash2, Globe, Building2, ToggleLeft } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger,
  DropdownMenuSeparator 
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";

export interface FeatureFlag {
  _id: string;
  key: string;
  name: string;
  description?: string;
  enabledGlobal: boolean;
  perOrganizationEnabled: boolean;
  enabledOrganizations: string[];
}

export const getFeatureFlagColumns = ({
  onEdit,
  onDelete,
  onToggleGlobal,
  onManageOrgs,
}: {
  onEdit: (flag: FeatureFlag) => void;
  onDelete: (flag: FeatureFlag) => void;
  onToggleGlobal: (flag: FeatureFlag) => void;
  onManageOrgs: (flag: FeatureFlag) => void;
}) => [
  {
    header: "Feature",
    accessorKey: "name",
    cell: (row: FeatureFlag) => (
      <div className="flex flex-col">
        <span className="font-bold text-slate-900 flex items-center gap-2 tracking-tight">
          <ToggleLeft className="h-3.5 w-3.5 text-emerald-500" />
          {row.name}
        </span>
        <code className="text-[10px] text-slate-500 font-mono mt-0.5">{row.key}</code>
      </div>
    ),
  },
  {
    header: "Scope",
    accessorKey: "scope",
    cell: (row: FeatureFlag) => (
      <div className="flex gap-2">
        {row.enabledGlobal ? (
          <Badge className="bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100 font-bold px-2 py-0 text-[10px] tracking-widest uppercase">
            <Globe className="h-3 w-3 mr-1" /> Global
          </Badge>
        ) : row.perOrganizationEnabled ? (
          <Badge className="bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100 font-bold px-2 py-0 text-[10px] tracking-widest uppercase">
            <Building2 className="h-3 w-3 mr-1" /> Per-Org
          </Badge>
        ) : (
          <Badge variant="outline" className="text-slate-400 font-bold px-2 py-0 text-[10px] tracking-widest uppercase">
            Disabled
          </Badge>
        )}
      </div>
    ),
  },
  {
    header: "Description",
    accessorKey: "description",
    cell: (row: FeatureFlag) => (
      <span className="text-xs text-slate-500 line-clamp-1 max-w-[200px]">
        {row.description || "No description"}
      </span>
    ),
  },
  {
      header: "Users",
      accessorKey: "enabledOrganizations",
      cell: (row: FeatureFlag) => (
        <span className="text-xs font-semibold text-slate-600 tabular-nums">
          {row.enabledGlobal ? "All Organizations" : `${row.enabledOrganizations?.length || 0} Orgs`}
        </span>
      ),
  },
  {
    header: "Actions",
    id: "actions",
    cell: (row: FeatureFlag) => (
      <DropdownMenu>
        <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
          <Button variant="ghost" className="h-8 w-8 p-0 hover:bg-slate-100 text-slate-500">
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-52 shadow-lg border-slate-200/60 p-1.5">
          <DropdownMenuItem onClick={() => onEdit(row)} className="gap-2.5 py-2 cursor-pointer font-medium text-slate-600 focus:bg-slate-50 focus:text-emerald-600">
            <Edit className="h-4 w-4 opacity-70" /> Edit Details
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => onToggleGlobal(row)} className="gap-2.5 py-2 cursor-pointer font-medium text-slate-600 focus:bg-slate-50 focus:text-emerald-600">
            <Globe className="h-4 w-4 opacity-70" /> {row.enabledGlobal ? "Disable Global" : "Enable Global"}
          </DropdownMenuItem>
          {row.perOrganizationEnabled && (
            <DropdownMenuItem onClick={() => onManageOrgs(row)} className="gap-2.5 py-2 cursor-pointer font-medium text-slate-600 focus:bg-slate-50 focus:text-emerald-600">
              <Building2 className="h-4 w-4 opacity-70" /> Manage Orgs
            </DropdownMenuItem>
          )}
          <DropdownMenuSeparator className="bg-slate-100 my-1" />
          <DropdownMenuItem onClick={() => onDelete(row)} className="gap-2.5 py-2 cursor-pointer font-semibold text-rose-500 focus:bg-rose-50 focus:text-rose-600">
            <Trash2 className="h-4 w-4 opacity-70" /> Delete Flag
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    ),
  },
];
