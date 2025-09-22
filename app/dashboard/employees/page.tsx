"use client";

import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { Loading } from "@/components/ui/loading";
import { Database } from "@/lib/database.types";
import { AddEmployeeModal } from "@/components/employees/add-employee-modal";
import { EditEmployeeModal } from "@/components/employees/edit-employee-modal";
import { Button } from "@/components/ui/button";
import { Pencil,  Power, PowerOff, UserX, Search } from "lucide-react";
import { TooltipProvider, Tooltip, TooltipTrigger, TooltipContent } from "@/components/ui/tooltip";
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
import { useUsers, useDeleteUser } from "@/hooks/use-users";

type Employee = Database["public"]["Tables"]["users"]["Row"];

export default function EmployeesPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(
    null
  );
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const { toast } = useToast();

  // Use the React Query hook for employees
  const {
    data: employees = [],
    isLoading,
    isError,
    error,
    refetch,
  } = useUsers();

  // Mutation hook for deleting employees
  const deleteUserMutation = useDeleteUser();

  // Filter employees based on search query
  const filteredEmployees =
    searchQuery.trim() === ""
      ? employees
      : employees.filter(
          (employee) =>
            employee.full_name
              ?.toLowerCase()
              .includes(searchQuery.toLowerCase()) ||
            employee.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
            employee.staff_id
              ?.toLowerCase()
              .includes(searchQuery.toLowerCase()) ||
            employee.role?.toLowerCase().includes(searchQuery.toLowerCase())
        );

  const handleToggleStatus = async (employeeId: string) => {
    try {
      // Find the employee to get current status
      const employee = employees.find((emp) => emp.id === employeeId);
      if (!employee) return;

      // Use fetch API for this specific endpoint
      const response = await fetch(`/api/users/${employeeId}/toggle-status`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          is_active: !employee.is_active,
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Failed to update employee status");
      }

      toast({
        title: "Status Updated",
        description: `Employee is now ${
          !employee.is_active ? "active" : "inactive"
        }`,
      });

      // Refresh data after success
      refetch();
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Update Failed",
        description: error.message || "Failed to update employee status",
      });
    }
  };

  const handleDelete = async (employeeId: string) => {
    try {
      await deleteUserMutation.mutateAsync(employeeId);

      toast({
        title: "Success",
        description: "Employee deleted successfully",
      });

      setIsDeleteDialogOpen(false);
      setSelectedEmployee(null);
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Deletion Failed",
        description: error.message || "Failed to delete employee",
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
        <UserX className="w-12 h-12 text-red-500" />
        <h2 className="text-xl font-semibold">Failed to load Users</h2>
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
        <h1 className="text-2xl font-bold">Users</h1>
        <AddEmployeeModal onEmployeeAdded={() => refetch()} />
      </div>

      <div className="relative mb-4">
        <Search className="absolute w-4 h-4 -translate-y-1/2 left-3 top-1/2 text-muted-foreground" />
        <Input
          placeholder="Search employees by name, email, ID or role..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-10"
        />
      </div>

      <div className="border rounded-md shadow">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b bg-muted/50">
                <th className="p-4 font-medium text-left">Name</th>
                <th className="p-4 font-medium text-left">Email</th>
                <th className="p-4 font-medium text-left">Staff ID</th>
                <th className="p-4 font-medium text-left">Role</th>
                <th className="p-4 font-medium text-left">Status</th>
                <th className="p-4 font-medium text-left">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredEmployees.length === 0 ? (
                <tr>
                  <td
                    colSpan={6}
                    className="p-8 text-center text-muted-foreground"
                  >
                    {searchQuery.trim() !== ""
                      ? "No employees match your search criteria"
                      : "No employees found"}
                  </td>
                </tr>
              ) : (
                filteredEmployees.map((employee) => (
                  <tr
                    key={employee.id}
                    className="transition-colors border-b hover:bg-muted/30"
                  >
                    <td className="p-4 font-medium">{employee.full_name}</td>
                    <td className="p-4">{employee.email}</td>
                    <td className="p-4">{employee.staff_id}</td>
                    <td className="p-4 capitalize">{employee.role}</td>
                    <td className="p-4">
                      <span
                        className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium ${
                          employee.is_active
                            ? "bg-green-100 text-green-800 dark:bg-green-800/20 dark:text-green-400"
                            : "bg-red-100 text-red-800 dark:bg-red-800/20 dark:text-red-400"
                        }`}
                      >
                        {employee.is_active ? "Active" : "Inactive"}
                      </span>
                    </td>
                    <td className="p-4">
                      <div className="flex space-x-2">
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => {
                                  setSelectedEmployee(employee);
                                  setIsEditModalOpen(true);
                                }}
                                aria-label={`Edit ${employee.full_name}`}
                              >
                                <Pencil className="w-4 h-4" />
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent>Edit {employee.full_name}</TooltipContent>
                          </Tooltip>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleToggleStatus(employee.id)}
                                aria-label={`${
                                  employee.is_active ? "Deactivate" : "Activate"
                                } ${employee.full_name}`}
                              >
                                {employee.is_active ? (
                                  <PowerOff className="w-4 h-4 text-red-500" />
                                ) : (
                                  <Power className="w-4 h-4 text-green-500" />
                                )}
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent>
                              {employee.is_active ? "Deactivate" : "Activate"} {employee.full_name}
                            </TooltipContent>
                          </Tooltip>
                          {/* 
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => {
                                  setSelectedEmployee(employee);
                                  setIsDeleteDialogOpen(true);
                                }}
                                aria-label={`Delete ${employee.full_name}`}
                              >
                                <Trash2 className="w-4 h-4 text-red-500" />
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent>Delete {employee.full_name}</TooltipContent>
                          </Tooltip>
                          */}
                        </TooltipProvider>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {selectedEmployee && (
        <EditEmployeeModal
          employee={selectedEmployee}
          isOpen={isEditModalOpen}
          onClose={() => {
            setIsEditModalOpen(false);
            setSelectedEmployee(null);
          }}
          onEmployeeUpdated={() => refetch()}
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
              employee account and remove their data from the system.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() =>
                selectedEmployee && handleDelete(selectedEmployee.id)
              }
              className="bg-red-500 hover:bg-red-600 focus:ring-red-500"
              disabled={deleteUserMutation.isPending}
            >
              {deleteUserMutation.isPending ? "Deleting..." : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
