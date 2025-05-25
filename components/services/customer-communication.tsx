"use client";

import { useState } from "react";
import {
  useServiceRequest,
  useAddServiceRequestUpdate,
} from "@/hooks/use-service-requests";
import { useCurrentUser } from "@/hooks/use-current-user";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Switch } from "@/components/ui/switch";
import { formatDateTime } from "@/lib/utils";
import {
  Send,
  MessageSquare,
  Phone,
  Mail,
  Bell,
  User,
  Clock,
  CheckCircle,
  AlertCircle,
  Info,
  MessageCircle,
} from "lucide-react";

interface CustomerCommunicationProps {
  serviceRequestId: string;
}

const updateTypes = {
  status_update: {
    label: "Status Update",
    icon: CheckCircle,
    color: "text-blue-600",
  },
  progress_update: {
    label: "Progress Update",
    icon: Clock,
    color: "text-purple-600",
  },
  issue_found: {
    label: "Issue Found",
    icon: AlertCircle,
    color: "text-red-600",
  },
  parts_needed: {
    label: "Parts Needed",
    icon: AlertCircle,
    color: "text-orange-600",
  },
  completion_notice: {
    label: "Completion Notice",
    icon: CheckCircle,
    color: "text-green-600",
  },
  general_update: {
    label: "General Update",
    icon: Info,
    color: "text-gray-600",
  },
  customer_contact: {
    label: "Customer Contact",
    icon: MessageCircle,
    color: "text-blue-600",
  },
};

export function CustomerCommunication({
  serviceRequestId,
}: CustomerCommunicationProps) {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [updateType, setUpdateType] = useState<string>("general_update");
  const [title, setTitle] = useState("");
  const [message, setMessage] = useState("");
  const [isCustomerVisible, setIsCustomerVisible] = useState(true);
  const [sendNotification, setSendNotification] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { data: currentUser } = useCurrentUser();
  const { data: serviceRequest } = useServiceRequest(serviceRequestId);
  const addUpdate = useAddServiceRequestUpdate();

  const handleSendUpdate = async () => {
    if (!currentUser || !title.trim() || !message.trim()) return;

    setIsSubmitting(true);
    try {
      await addUpdate.mutateAsync({
        service_request_id: serviceRequestId,
        updated_by: currentUser.id,
        update_type: updateType as any,
        title: title.trim(),
        description: message.trim(),
        is_customer_visible: isCustomerVisible,
        notification_sent: sendNotification,
      });

      // Reset form
      setTitle("");
      setMessage("");
      setUpdateType("general_update");
      setIsCustomerVisible(true);
      setSendNotification(false);
      setIsDialogOpen(false);
    } catch (error) {
      console.error("Error sending update:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const getQuickUpdateTemplates = () => [
    {
      type: "status_update",
      title: "Service Status Update",
      message: `Your service request ${serviceRequest?.request_number} has been updated. We are currently working on your device and will keep you informed of our progress.`,
    },
    {
      type: "progress_update",
      title: "Progress Update",
      message: `We have made good progress on your ${serviceRequest?.device_type}. The diagnostic phase is complete and we are proceeding with the repair work.`,
    },
    {
      type: "parts_needed",
      title: "Parts Required",
      message: `We have identified the issue with your device and need to order specific parts. We will contact you with the cost estimate and expected delivery time.`,
    },
    {
      type: "completion_notice",
      title: "Service Completed",
      message: `Great news! Your ${serviceRequest?.device_type} repair has been completed successfully. Please contact us to arrange pickup or delivery.`,
    },
  ];

  const useTemplate = (template: any) => {
    setUpdateType(template.type);
    setTitle(template.title);
    setMessage(template.message);
    setIsCustomerVisible(true);
    setSendNotification(true);
  };

  if (!serviceRequest) return null;

  return (
    <div className="space-y-6">
      {/* Customer Information */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <User className="h-5 w-5" />
            <span>Customer Information</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {serviceRequest.customer ? (
            <div className="space-y-3">
              <div>
                <div className="font-medium text-lg">
                  {serviceRequest.customer.name}
                </div>
                {serviceRequest.customer.company && (
                  <div className="text-muted-foreground">
                    {serviceRequest.customer.company}
                  </div>
                )}
              </div>

              <div className="grid gap-3 md:grid-cols-2">
                {serviceRequest.customer.email && (
                  <div className="flex items-center space-x-2">
                    <Mail className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">
                      {serviceRequest.customer.email}
                    </span>
                    <Button size="sm" variant="outline">
                      <Mail className="mr-2 h-4 w-4" />
                      Email
                    </Button>
                  </div>
                )}

                {serviceRequest.customer.phone && (
                  <div className="flex items-center space-x-2">
                    <Phone className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">
                      {serviceRequest.customer.phone}
                    </span>
                    <Button size="sm" variant="outline">
                      <Phone className="mr-2 h-4 w-4" />
                      Call
                    </Button>
                  </div>
                )}
              </div>

              {serviceRequest.customer.address && (
                <div className="text-sm text-muted-foreground">
                  <strong>Address:</strong> {serviceRequest.customer.address}
                </div>
              )}
            </div>
          ) : (
            <div className="text-center py-4">
              <User className="h-12 w-12 text-muted-foreground mx-auto mb-2" />
              <p className="text-muted-foreground">Walk-in Customer</p>
              <p className="text-sm text-muted-foreground">
                No customer information available
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Communication Actions */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <MessageSquare className="h-5 w-5" />
            <span>Communication</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Quick Actions */}
          <div className="grid gap-2 md:grid-cols-2">
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button className="w-full">
                  <Send className="mr-2 h-4 w-4" />
                  Send Update
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl">
                <DialogHeader>
                  <DialogTitle>Send Customer Update</DialogTitle>
                  <DialogDescription>
                    Send an update to the customer about their service request.
                  </DialogDescription>
                </DialogHeader>

                <div className="space-y-4">
                  {/* Update Type */}
                  <div>
                    <Label>Update Type</Label>
                    <Select value={updateType} onValueChange={setUpdateType}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {Object.entries(updateTypes).map(([key, config]) => {
                          const Icon = config.icon;
                          return (
                            <SelectItem key={key} value={key}>
                              <div className="flex items-center space-x-2">
                                <Icon className={`h-4 w-4 ${config.color}`} />
                                <span>{config.label}</span>
                              </div>
                            </SelectItem>
                          );
                        })}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Title */}
                  <div>
                    <Label>Title</Label>
                    <Input
                      placeholder="Update title"
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                    />
                  </div>

                  {/* Message */}
                  <div>
                    <Label>Message</Label>
                    <Textarea
                      placeholder="Type your message here..."
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      rows={4}
                    />
                  </div>

                  {/* Options */}
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <Label>Visible to Customer</Label>
                      <Switch
                        checked={isCustomerVisible}
                        onCheckedChange={setIsCustomerVisible}
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <Label>Send Notification</Label>
                      <Switch
                        checked={sendNotification}
                        onCheckedChange={setSendNotification}
                      />
                    </div>
                  </div>

                  {/* Quick Templates */}
                  <div>
                    <Label>Quick Templates</Label>
                    <div className="grid gap-2 mt-2">
                      {getQuickUpdateTemplates().map((template, index) => (
                        <Button
                          key={index}
                          variant="outline"
                          size="sm"
                          onClick={() => useTemplate(template)}
                          className="justify-start text-left h-auto p-3"
                        >
                          <div>
                            <div className="font-medium">{template.title}</div>
                            <div className="text-xs text-muted-foreground truncate">
                              {template.message.substring(0, 60)}...
                            </div>
                          </div>
                        </Button>
                      ))}
                    </div>
                  </div>
                </div>

                <DialogFooter>
                  <Button
                    variant="outline"
                    onClick={() => setIsDialogOpen(false)}
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={handleSendUpdate}
                    disabled={!title.trim() || !message.trim() || isSubmitting}
                  >
                    {isSubmitting ? "Sending..." : "Send Update"}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>

            {serviceRequest.customer?.email && (
              <Button variant="outline" className="w-full">
                <Mail className="mr-2 h-4 w-4" />
                Send Email
              </Button>
            )}
          </div>

          {serviceRequest.customer?.phone && (
            <Button variant="outline" className="w-full">
              <Phone className="mr-2 h-4 w-4" />
              Call Customer
            </Button>
          )}
        </CardContent>
      </Card>

      {/* Communication History */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <MessageSquare className="h-5 w-5" />
            <span>Communication History</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {/* Sample communication history - in real app this would come from updates */}
            {[
              {
                id: 1,
                type: "status_update",
                title: "Service Started",
                message:
                  "We have received your device and begun the diagnostic process.",
                timestamp: new Date(
                  Date.now() - 2 * 24 * 60 * 60 * 1000
                ).toISOString(),
                isCustomerVisible: true,
                sentBy: "System",
              },
              {
                id: 2,
                type: "progress_update",
                title: "Diagnostic Complete",
                message:
                  "We have identified the issue and will proceed with the repair.",
                timestamp: new Date(
                  Date.now() - 1 * 24 * 60 * 60 * 1000
                ).toISOString(),
                isCustomerVisible: true,
                sentBy: currentUser?.full_name || "Technician",
              },
            ].map((comm) => {
              const config = updateTypes[comm.type as keyof typeof updateTypes];
              const Icon = config?.icon || MessageCircle;

              return (
                <div
                  key={comm.id}
                  className="flex space-x-3 p-3 border rounded-lg"
                >
                  <div className="flex-shrink-0">
                    <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
                      <Icon
                        className={`h-4 w-4 ${
                          config?.color || "text-gray-600"
                        }`}
                      />
                    </div>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <p className="font-medium">{comm.title}</p>
                        {comm.isCustomerVisible && (
                          <Badge variant="outline" className="text-xs">
                            Customer Visible
                          </Badge>
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {formatDateTime(comm.timestamp)}
                      </p>
                    </div>
                    <p className="text-muted-foreground mt-1">{comm.message}</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      Sent by {comm.sentBy}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Customer Preferences */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Bell className="h-5 w-5" />
            <span>Communication Preferences</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <div className="font-medium">Email Notifications</div>
                <div className="text-sm text-muted-foreground">
                  Send updates via email
                </div>
              </div>
              <Switch defaultChecked />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <div className="font-medium">SMS Notifications</div>
                <div className="text-sm text-muted-foreground">
                  Send updates via text message
                </div>
              </div>
              <Switch />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <div className="font-medium">Status Change Alerts</div>
                <div className="text-sm text-muted-foreground">
                  Notify on status changes
                </div>
              </div>
              <Switch defaultChecked />
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
