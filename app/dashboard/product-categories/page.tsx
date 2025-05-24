"use client";

import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { Loading } from "@/components/ui/loading";
import { Button } from "@/components/ui/button";
import { Pencil, Trash2, FolderClosed, Search } from "lucide-react";
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
import { useCategories, useDeleteCategory } from "@/hooks/use-categories";
import { CategoryModal } from "@/components/products/category-modal";
import { Database } from "@/lib/database.types";

type Category = Database["public"]["Tables"]["product_categories"]["Row"];

export default function ProductCategoriesPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(
    null
  );
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const { toast } = useToast();

  // Use the React Query hook for categories
  const {
    data: categories = [],
    isLoading,
    isError,
    error,
    refetch,
  } = useCategories();

  // Mutation hook for deleting categories
  const deleteCategoryMutation = useDeleteCategory();

  // Filter categories based on search query
  const filteredCategories =
    searchQuery.trim() === ""
      ? categories
      : categories.filter(
          (category) =>
            category.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
            category.description
              ?.toLowerCase()
              .includes(searchQuery.toLowerCase())
        );

  const handleDelete = async (categoryId: string) => {
    try {
      await deleteCategoryMutation.mutateAsync(categoryId);

      toast({
        title: "Success",
        description: "Category deleted successfully",
      });

      setIsDeleteDialogOpen(false);
      setSelectedCategory(null);
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Deletion Failed",
        description: error.message || "Failed to delete category",
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
        <FolderClosed className="h-12 w-12 text-red-500" />
        <h2 className="text-xl font-semibold">Failed to load categories</h2>
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
        <h1 className="text-2xl font-bold">Product Categories</h1>
        <Button onClick={() => setIsAddModalOpen(true)}>Add Category</Button>
      </div>

      <div className="relative mb-4">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="Search categories by name or description..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-10"
        />
      </div>

      <div className="rounded-md border shadow">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b bg-muted/50">
                <th className="p-4 text-left font-medium">Name</th>
                <th className="p-4 text-left font-medium">Description</th>
                <th className="p-4 text-left font-medium">Created At</th>
                <th className="p-4 text-left font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredCategories.length === 0 ? (
                <tr>
                  <td
                    colSpan={4}
                    className="p-8 text-center text-muted-foreground"
                  >
                    {searchQuery.trim() !== ""
                      ? "No categories match your search criteria"
                      : "No categories found"}
                  </td>
                </tr>
              ) : (
                filteredCategories.map((category) => (
                  <tr
                    key={category.id}
                    className="border-b hover:bg-muted/30 transition-colors"
                  >
                    <td className="p-4 font-medium">{category.name}</td>
                    <td className="p-4">{category.description}</td>
                    <td className="p-4">
                      {new Date(category.created_at).toLocaleDateString()}
                    </td>
                    <td className="p-4">
                      <div className="flex space-x-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setSelectedCategory(category);
                            setIsEditModalOpen(true);
                          }}
                          aria-label={`Edit ${category.name}`}
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setSelectedCategory(category);
                            setIsDeleteDialogOpen(true);
                          }}
                          aria-label={`Delete ${category.name}`}
                        >
                          <Trash2 className="h-4 w-4 text-red-500" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      <CategoryModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onCategoryAdded={() => refetch()}
      />

      {selectedCategory && (
        <CategoryModal
          category={selectedCategory}
          isOpen={isEditModalOpen}
          onClose={() => {
            setIsEditModalOpen(false);
            setSelectedCategory(null);
          }}
          onCategoryUpdated={() => refetch()}
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
              category and may affect products that are assigned to this
              category.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() =>
                selectedCategory && handleDelete(selectedCategory.id)
              }
              className="bg-red-500 hover:bg-red-600 focus:ring-red-500"
              disabled={deleteCategoryMutation.isPending}
            >
              {deleteCategoryMutation.isPending ? "Deleting..." : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
