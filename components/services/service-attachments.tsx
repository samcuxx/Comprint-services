"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { FileUpload } from "@/components/ui/file-upload";
import { useCurrentUser } from "@/hooks/use-current-user";
import { useToast } from "@/hooks/use-toast";
import { formatDateTime } from "@/lib/utils";
import {
  File,
  Download,
  Eye,
  Edit,
  Trash2,
  FileText,
  Image,
  FileSpreadsheet,
  ExternalLink,
  Upload,
  Users,
  Lock,
} from "lucide-react";

interface ServiceAttachmentsProps {
  serviceRequestId: string;
}

interface Attachment {
  id: string;
  service_request_id: string;
  uploaded_by: string;
  file_name: string;
  file_url: string;
  file_type: string | null;
  file_size: number | null;
  description: string | null;
  is_customer_visible: boolean;
  created_at: string;
  uploaded_by_user?: {
    id: string;
    full_name: string;
  };
}

export function ServiceAttachments({
  serviceRequestId,
}: ServiceAttachmentsProps) {
  const [editingAttachment, setEditingAttachment] = useState<Attachment | null>(
    null
  );
  const [editDescription, setEditDescription] = useState("");
  const [editCustomerVisible, setEditCustomerVisible] = useState(false);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  const { data: currentUser } = useCurrentUser();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch attachments
  const { data: attachments = [], isLoading } = useQuery({
    queryKey: ["service-attachments", serviceRequestId],
    queryFn: async () => {
      const response = await fetch(
        `/api/service-requests/${serviceRequestId}/attachments`
      );
      if (!response.ok) {
        throw new Error("Failed to fetch attachments");
      }
      return response.json();
    },
  });

  // Update attachment mutation
  const updateAttachment = useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: any }) => {
      const response = await fetch(
        `/api/service-requests/${serviceRequestId}/attachments/${id}`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(updates),
        }
      );
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to update attachment");
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["service-attachments", serviceRequestId],
      });
      setEditingAttachment(null);
      toast({
        title: "Success",
        description: "Attachment updated successfully",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Delete attachment mutation
  const deleteAttachment = useMutation({
    mutationFn: async (id: string) => {
      const response = await fetch(
        `/api/service-requests/${serviceRequestId}/attachments/${id}`,
        {
          method: "DELETE",
        }
      );
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to delete attachment");
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["service-attachments", serviceRequestId],
      });
      setDeleteConfirmId(null);
      toast({
        title: "Success",
        description: "Attachment deleted successfully",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const getFileIcon = (fileType: string | null) => {
    if (!fileType) return File;
    if (fileType.startsWith("image/")) return Image;
    if (fileType.includes("pdf")) return FileText;
    if (fileType.includes("spreadsheet") || fileType.includes("excel"))
      return FileSpreadsheet;
    return File;
  };

  const formatFileSize = (bytes: number | null) => {
    if (!bytes) return "Unknown size";
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  const canEditAttachment = (attachment: Attachment) => {
    return (
      currentUser?.role === "admin" ||
      attachment.uploaded_by === currentUser?.id
    );
  };

  const canDeleteAttachment = (attachment: Attachment) => {
    return (
      currentUser?.role === "admin" ||
      attachment.uploaded_by === currentUser?.id
    );
  };

  const handleEditAttachment = (attachment: Attachment) => {
    setEditingAttachment(attachment);
    setEditDescription(attachment.description || "");
    setEditCustomerVisible(attachment.is_customer_visible);
  };

  const handleUpdateAttachment = () => {
    if (!editingAttachment) return;

    updateAttachment.mutate({
      id: editingAttachment.id,
      updates: {
        description: editDescription.trim() || null,
        is_customer_visible: editCustomerVisible,
      },
    });
  };

  const handleDeleteAttachment = (id: string) => {
    deleteAttachment.mutate(id);
  };

  const handleUploadComplete = () => {
    queryClient.invalidateQueries({
      queryKey: ["service-attachments", serviceRequestId],
    });
  };

  const handleDownload = (attachment: Attachment) => {
    window.open(attachment.file_url, "_blank");
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <File className="h-5 w-5" />
            <span>Attachments</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-4">Loading attachments...</div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center space-x-2">
            <File className="h-5 w-5" />
            <span>Attachments ({attachments.length})</span>
          </CardTitle>
          <FileUpload
            serviceRequestId={serviceRequestId}
            onUploadComplete={handleUploadComplete}
          />
        </div>
      </CardHeader>
      <CardContent>
        {attachments.length === 0 ? (
          <div className="text-center py-8">
            <File className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
            <p className="text-muted-foreground">No attachments yet</p>
            <p className="text-sm text-muted-foreground">
              Upload files to document this service request
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {attachments.map((attachment) => {
              const FileIcon = getFileIcon(attachment.file_type);
              return (
                <div
                  key={attachment.id}
                  className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50"
                >
                  <div className="flex items-center space-x-3 flex-1 min-w-0">
                    <FileIcon className="h-5 w-5 text-muted-foreground flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center space-x-2">
                        <p className="font-medium truncate">
                          {attachment.file_name}
                        </p>
                        <div className="flex items-center space-x-1">
                          {attachment.is_customer_visible ? (
                            <Badge variant="outline" className="text-xs">
                              <Users className="mr-1 h-3 w-3" />
                              Customer Visible
                            </Badge>
                          ) : (
                            <Badge variant="secondary" className="text-xs">
                              <Lock className="mr-1 h-3 w-3" />
                              Internal Only
                            </Badge>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                        <span>{formatFileSize(attachment.file_size)}</span>
                        <span>•</span>
                        <span>
                          Uploaded by{" "}
                          {attachment.uploaded_by_user?.full_name || "Unknown"}
                        </span>
                        <span>•</span>
                        <span>{formatDateTime(attachment.created_at)}</span>
                      </div>
                      {attachment.description && (
                        <p className="text-sm text-muted-foreground mt-1">
                          {attachment.description}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDownload(attachment)}
                    >
                      <Download className="h-4 w-4" />
                    </Button>

                    {canEditAttachment(attachment) && (
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleEditAttachment(attachment)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                        </DialogTrigger>
                        <DialogContent>
                          <DialogHeader>
                            <DialogTitle>Edit Attachment</DialogTitle>
                            <DialogDescription>
                              Update the description and visibility settings for
                              this attachment.
                            </DialogDescription>
                          </DialogHeader>
                          <div className="space-y-4">
                            <div>
                              <Label>File Name</Label>
                              <Input value={attachment.file_name} disabled />
                            </div>
                            <div>
                              <Label htmlFor="edit-description">
                                Description
                              </Label>
                              <Textarea
                                id="edit-description"
                                placeholder="Add a description..."
                                value={editDescription}
                                onChange={(e) =>
                                  setEditDescription(e.target.value)
                                }
                                rows={3}
                              />
                            </div>
                            <div className="flex items-center justify-between">
                              <Label htmlFor="edit-customer-visible">
                                Visible to Customer
                              </Label>
                              <Switch
                                id="edit-customer-visible"
                                checked={editCustomerVisible}
                                onCheckedChange={setEditCustomerVisible}
                              />
                            </div>
                          </div>
                          <DialogFooter>
                            <Button
                              variant="outline"
                              onClick={() => setEditingAttachment(null)}
                            >
                              Cancel
                            </Button>
                            <Button
                              onClick={handleUpdateAttachment}
                              disabled={updateAttachment.isPending}
                            >
                              {updateAttachment.isPending
                                ? "Updating..."
                                : "Update"}
                            </Button>
                          </DialogFooter>
                        </DialogContent>
                      </Dialog>
                    )}

                    {canDeleteAttachment(attachment) && (
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setDeleteConfirmId(attachment.id)}
                          >
                            <Trash2 className="h-4 w-4 text-red-600" />
                          </Button>
                        </DialogTrigger>
                        <DialogContent>
                          <DialogHeader>
                            <DialogTitle>Delete Attachment</DialogTitle>
                            <DialogDescription>
                              Are you sure you want to delete "
                              {attachment.file_name}"? This action cannot be
                              undone.
                            </DialogDescription>
                          </DialogHeader>
                          <DialogFooter>
                            <Button
                              variant="outline"
                              onClick={() => setDeleteConfirmId(null)}
                            >
                              Cancel
                            </Button>
                            <Button
                              variant="destructive"
                              onClick={() =>
                                handleDeleteAttachment(attachment.id)
                              }
                              disabled={deleteAttachment.isPending}
                            >
                              {deleteAttachment.isPending
                                ? "Deleting..."
                                : "Delete"}
                            </Button>
                          </DialogFooter>
                        </DialogContent>
                      </Dialog>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
