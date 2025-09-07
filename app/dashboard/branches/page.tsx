"use client";

import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { Loading } from "@/components/ui/loading";
import { Database } from "@/lib/database.types";
import { AddBranchModal } from "@/components/branches/add-branch-modal";
import { EditBranchModal } from "@/components/branches/edit-branch-modal";
import { Button } from "@/components/ui/button";
import { Pencil, Trash2, MapPin, Building2, Search } from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Input } from "@/components/ui/input";
import { useBranches, useDeleteBranch } from "@/hooks/use-branches";

type Branch = Database["public"]["Tables"]["branches"]["Row"];

export default function BranchesPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedBranch, setSelectedBranch] = useState<Branch | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const { toast } = useToast();

  // Use React Query hooks
  const {
    data: branches = [],
    isLoading,
    isError,
    error,
    refetch,
  } = useBranches();

  const deleteBranchMutation = useDeleteBranch();

  // Filter branches based on search query
  const filteredBranches =
    searchQuery.trim() === ""
      ? branches
      : branches.filter(
          (branch) =>
            branch.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
            branch.location?.toLowerCase().includes(searchQuery.toLowerCase())
        );

  const handleDelete = async (branchId: string) => {
    try {
      await deleteBranchMutation.mutateAsync(branchId);

      toast({
        title: "Success",
        description: "Branch deleted successfully",
      });

      setIsDeleteDialogOpen(false);
      setSelectedBranch(null);
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Deletion Failed",
        description: error.message || "Failed to delete branch",
      });
    }
  };

  if (isLoading) {
    return (
      <div className="flex h-[70vh] items-center justify-center">
        <Loading />
      </div>
    );
  }

  if (isError) {
    return (
      <div className="flex h-[70vh] flex-col items-center justify-center space-y-4">
        <Building2 className="w-12 h-12 text-red-500" />
        <h2 className="text-xl font-semibold">Failed to load branches</h2>
        <p className="text-muted-foreground">
          {error instanceof Error
            ? error.message
            : "An unexpected error occurred"}
        </p>
        <Button onClick={() => refetch()}>Try Again</Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Branches</h1>
        <AddBranchModal onBranchAdded={() => refetch()} />
      </div>

      <div className="relative mb-4">
        <Search className="absolute w-4 h-4 -translate-y-1/2 left-3 top-1/2 text-muted-foreground" />
        <Input
          placeholder="Search branches by name or location..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-10"
        />
      </div>

      {filteredBranches.length === 0 ? (
        <div className="flex items-center justify-center h-40 border rounded-lg bg-card">
          <p className="text-muted-foreground">
            {searchQuery.trim() !== ""
              ? "No branches match your search criteria"
              : "No branches found"}
          </p>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {filteredBranches.map((branch) => (
            <div
              key={branch.id}
              className="p-5 transition-all border rounded-lg shadow-sm bg-card hover:shadow-md"
            >
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h3 className="text-lg font-semibold">{branch.name}</h3>
                  <p className="flex items-center gap-1 text-sm text-muted-foreground">
                    <MapPin className="w-3 h-3" />
                    {branch.location}
                  </p>
                </div>
                <div className="flex space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setSelectedBranch(branch);
                      setIsEditModalOpen(true);
                    }}
                    aria-label={`Edit ${branch.name}`}
                  >
                    <Pencil className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setSelectedBranch(branch);
                      setIsDeleteDialogOpen(true);
                    }}
                    aria-label={`Delete ${branch.name}`}
                  >
                    <Trash2 className="w-4 h-4 text-red-500" />
                  </Button>
                </div>
              </div>

              <div className="p-3 space-y-3 rounded-md bg-muted/50">
                <div className="flex justify-between text-sm">
                  <span className="font-medium">Commission Cutoff:</span>
                  <span>${branch.commission_cutoff.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="font-medium">Commission Rate:</span>
                  <span>{branch.commission_percentage}%</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {selectedBranch && (
        <EditBranchModal
          branch={selectedBranch}
          isOpen={isEditModalOpen}
          onClose={() => {
            setIsEditModalOpen(false);
            setSelectedBranch(null);
          }}
          onBranchUpdated={() => refetch()}
        />
      )}

      <AlertDialog
        open={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the
              branch and all associated data. Note: You cannot delete a branch
              that has associated Users.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => selectedBranch && handleDelete(selectedBranch.id)}
              className="bg-red-500 hover:bg-red-600 focus:ring-red-500"
              disabled={deleteBranchMutation.isPending}
            >
              {deleteBranchMutation.isPending ? "Deleting..." : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
