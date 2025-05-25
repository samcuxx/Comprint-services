"use client";

import { useState, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Upload,
  File,
  X,
  Loader2,
  AlertTriangle,
  CheckCircle,
  FileText,
  Image,
  FileSpreadsheet,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface FileUploadProps {
  serviceRequestId: string;
  onUploadComplete?: (attachment: any) => void;
  maxFileSize?: number; // in bytes
  allowedTypes?: string[];
  multiple?: boolean;
}

interface UploadingFile {
  file: File;
  progress: number;
  status: "uploading" | "success" | "error";
  error?: string;
  attachment?: any;
}

const DEFAULT_ALLOWED_TYPES = [
  "image/jpeg",
  "image/png",
  "image/gif",
  "image/webp",
  "application/pdf",
  "text/plain",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "application/vnd.ms-excel",
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
];

const DEFAULT_MAX_SIZE = 10 * 1024 * 1024; // 10MB

export function FileUpload({
  serviceRequestId,
  onUploadComplete,
  maxFileSize = DEFAULT_MAX_SIZE,
  allowedTypes = DEFAULT_ALLOWED_TYPES,
  multiple = true,
}: FileUploadProps) {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [uploadingFiles, setUploadingFiles] = useState<UploadingFile[]>([]);
  const [description, setDescription] = useState("");
  const [isCustomerVisible, setIsCustomerVisible] = useState(false);
  const { toast } = useToast();

  const getFileIcon = (fileType: string) => {
    if (fileType.startsWith("image/")) return Image;
    if (fileType.includes("pdf")) return FileText;
    if (fileType.includes("spreadsheet") || fileType.includes("excel"))
      return FileSpreadsheet;
    return File;
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  const validateFile = (file: File): string | null => {
    if (file.size > maxFileSize) {
      return `File size exceeds ${formatFileSize(maxFileSize)} limit`;
    }
    if (!allowedTypes.includes(file.type)) {
      return "File type not allowed";
    }
    return null;
  };

  const uploadFile = useCallback(
    async (file: File): Promise<any> => {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("serviceRequestId", serviceRequestId);
      formData.append("description", description);
      formData.append("isCustomerVisible", isCustomerVisible.toString());

      const response = await fetch("/api/service-requests/upload", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Upload failed");
      }

      return response.json();
    },
    [serviceRequestId, description, isCustomerVisible]
  );

  const handleFileSelect = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const files = Array.from(event.target.files || []);
    if (files.length === 0) return;

    // Validate files
    const validFiles: File[] = [];
    for (const file of files) {
      const error = validateFile(file);
      if (error) {
        toast({
          title: "File validation failed",
          description: `${file.name}: ${error}`,
          variant: "destructive",
        });
        continue;
      }
      validFiles.push(file);
    }

    if (validFiles.length === 0) return;

    // Initialize uploading files state
    const newUploadingFiles: UploadingFile[] = validFiles.map((file) => ({
      file,
      progress: 0,
      status: "uploading",
    }));

    setUploadingFiles((prev) => [...prev, ...newUploadingFiles]);

    // Upload files
    for (let i = 0; i < validFiles.length; i++) {
      const file = validFiles[i];
      try {
        // Simulate progress for better UX
        const progressInterval = setInterval(() => {
          setUploadingFiles((prev) =>
            prev.map((uf) =>
              uf.file === file && uf.progress < 90
                ? { ...uf, progress: uf.progress + 10 }
                : uf
            )
          );
        }, 200);

        const result = await uploadFile(file);

        clearInterval(progressInterval);

        setUploadingFiles((prev) =>
          prev.map((uf) =>
            uf.file === file
              ? {
                  ...uf,
                  progress: 100,
                  status: "success",
                  attachment: result.attachment,
                }
              : uf
          )
        );

        onUploadComplete?.(result.attachment);

        toast({
          title: "Upload successful",
          description: `${file.name} has been uploaded successfully`,
        });
      } catch (error) {
        setUploadingFiles((prev) =>
          prev.map((uf) =>
            uf.file === file
              ? {
                  ...uf,
                  progress: 0,
                  status: "error",
                  error:
                    error instanceof Error ? error.message : "Upload failed",
                }
              : uf
          )
        );

        toast({
          title: "Upload failed",
          description: `Failed to upload ${file.name}: ${
            error instanceof Error ? error.message : "Unknown error"
          }`,
          variant: "destructive",
        });
      }
    }

    // Clear the input
    event.target.value = "";
  };

  const removeUploadingFile = (file: File) => {
    setUploadingFiles((prev) => prev.filter((uf) => uf.file !== file));
  };

  const clearCompletedUploads = () => {
    setUploadingFiles((prev) => prev.filter((uf) => uf.status === "uploading"));
  };

  const resetDialog = () => {
    setDescription("");
    setIsCustomerVisible(false);
    setUploadingFiles([]);
  };

  const handleDialogClose = () => {
    setIsDialogOpen(false);
    setTimeout(resetDialog, 300); // Reset after dialog animation
  };

  return (
    <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
      <DialogTrigger asChild>
        <Button variant="outline">
          <Upload className="mr-2 h-4 w-4" />
          Upload Files
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Upload Service Request Files</DialogTitle>
          <DialogDescription>
            Upload documents, images, or other files related to this service
            request. Maximum file size: {formatFileSize(maxFileSize)}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* File Upload Area */}
          <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-6 text-center">
            <Upload className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
            <div className="space-y-2">
              <p className="text-sm font-medium">Choose files to upload</p>
              <p className="text-xs text-muted-foreground">
                Supports: Images, PDFs, Documents, Spreadsheets
              </p>
              <Input
                type="file"
                multiple={multiple}
                accept={allowedTypes.join(",")}
                onChange={handleFileSelect}
                className="hidden"
                id="file-upload"
              />
              <Button
                variant="outline"
                onClick={() => document.getElementById("file-upload")?.click()}
                type="button"
              >
                Select Files
              </Button>
            </div>
          </div>

          {/* Upload Options */}
          <div className="space-y-4">
            <div>
              <Label htmlFor="description">Description (Optional)</Label>
              <Textarea
                id="description"
                placeholder="Add a description for these files..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={3}
              />
            </div>

            <div className="flex items-center justify-between">
              <Label htmlFor="customer-visible">Visible to Customer</Label>
              <Switch
                id="customer-visible"
                checked={isCustomerVisible}
                onCheckedChange={setIsCustomerVisible}
              />
            </div>
          </div>

          {/* Uploading Files */}
          {uploadingFiles.length > 0 && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label>Upload Progress</Label>
                {uploadingFiles.some((uf) => uf.status === "success") && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={clearCompletedUploads}
                  >
                    Clear Completed
                  </Button>
                )}
              </div>

              <div className="space-y-2 max-h-40 overflow-y-auto">
                {uploadingFiles.map((uploadingFile, index) => {
                  const FileIcon = getFileIcon(uploadingFile.file.type);
                  return (
                    <div
                      key={index}
                      className="flex items-center space-x-3 p-2 border rounded"
                    >
                      <FileIcon className="h-4 w-4 text-muted-foreground" />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">
                          {uploadingFile.file.name}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {formatFileSize(uploadingFile.file.size)}
                        </p>
                        {uploadingFile.status === "uploading" && (
                          <Progress
                            value={uploadingFile.progress}
                            className="mt-1"
                          />
                        )}
                        {uploadingFile.status === "error" && (
                          <p className="text-xs text-red-600 mt-1">
                            {uploadingFile.error}
                          </p>
                        )}
                      </div>
                      <div className="flex items-center space-x-2">
                        {uploadingFile.status === "uploading" && (
                          <Loader2 className="h-4 w-4 animate-spin text-blue-600" />
                        )}
                        {uploadingFile.status === "success" && (
                          <CheckCircle className="h-4 w-4 text-green-600" />
                        )}
                        {uploadingFile.status === "error" && (
                          <AlertTriangle className="h-4 w-4 text-red-600" />
                        )}
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() =>
                            removeUploadingFile(uploadingFile.file)
                          }
                        >
                          <X className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={handleDialogClose}>
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
