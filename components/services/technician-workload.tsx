"use client";

import { useState } from "react";
import {
  useServiceRequests,
  useTechnicians,
  useUpdateServiceRequest,
} from "@/hooks/use-service-requests";
import { useCurrentUser } from "@/hooks/use-current-user";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
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
import { Label } from "@/components/ui/label";
import { formatDate } from "@/lib/utils";
import {
  User,
  Clock,
  CheckCircle,
  AlertTriangle,
  Settings,
  UserPlus,
  Activity,
  TrendingUp,
  Calendar,
  Target,
} from "lucide-react";

interface TechnicianWorkloadProps {
  selectedTechnician?: string;
  onTechnicianSelect?: (technicianId: string) => void;
}

export function TechnicianWorkload({
  selectedTechnician,
  onTechnicianSelect,
}: TechnicianWorkloadProps) {
  const [assignDialogOpen, setAssignDialogOpen] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState<string>("");
  const [newTechnician, setNewTechnician] = useState<string>("");

  const { data: currentUser } = useCurrentUser();
  const { data: serviceRequests = [] } = useServiceRequests();
  const { data: technicians = [] } = useTechnicians();
  const updateServiceRequest = useUpdateServiceRequest();

  const isAdmin = currentUser?.role === "admin";

  // Calculate technician workload data
  const technicianData = technicians
    .map((tech) => {
      const techRequests = serviceRequests.filter(
        (r) => r.assigned_technician_id === tech.id
      );
      const pending = techRequests.filter((r) => r.status === "pending").length;
      const inProgress = techRequests.filter(
        (r) => r.status === "in_progress"
      ).length;
      const completed = techRequests.filter(
        (r) => r.status === "completed"
      ).length;
      const overdue = techRequests.filter((r) => {
        if (!r.estimated_completion) return false;
        return (
          new Date(r.estimated_completion) < new Date() &&
          r.status !== "completed"
        );
      }).length;

      const totalActive = pending + inProgress;
      const totalAssigned = techRequests.length;
      const completionRate =
        totalAssigned > 0 ? (completed / totalAssigned) * 100 : 0;

      // Calculate workload score (0-100)
      const workloadScore = Math.min(100, (totalActive / 10) * 100); // Assuming 10 is max capacity

      return {
        ...tech,
        pending,
        inProgress,
        completed,
        overdue,
        totalActive,
        totalAssigned,
        completionRate,
        workloadScore,
        requests: techRequests,
      };
    })
    .sort((a, b) => b.workloadScore - a.workloadScore);

  // Get unassigned requests
  const unassignedRequests = serviceRequests.filter(
    (r) =>
      !r.assigned_technician_id &&
      r.status !== "completed" &&
      r.status !== "cancelled"
  );

  const handleAssignRequest = async () => {
    if (!selectedRequest || !newTechnician) return;

    try {
      await updateServiceRequest.mutateAsync({
        id: selectedRequest,
        updates: { assigned_technician_id: newTechnician },
      });
      setAssignDialogOpen(false);
      setSelectedRequest("");
      setNewTechnician("");
    } catch (error) {
      console.error("Error assigning request:", error);
    }
  };

  const getWorkloadColor = (score: number) => {
    if (score >= 80) return "text-red-600";
    if (score >= 60) return "text-orange-600";
    if (score >= 40) return "text-yellow-600";
    return "text-green-600";
  };

  const getWorkloadBadge = (score: number) => {
    if (score >= 80)
      return { variant: "destructive" as const, label: "Overloaded" };
    if (score >= 60)
      return { variant: "secondary" as const, label: "High Load" };
    if (score >= 40) return { variant: "outline" as const, label: "Moderate" };
    return { variant: "default" as const, label: "Available" };
  };

  return (
    <div className="space-y-6">
      {/* Workload Overview */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total Technicians
            </CardTitle>
            <User className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{technicians.length}</div>
            <p className="text-xs text-muted-foreground">Active technicians</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg. Workload</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {technicians.length > 0
                ? (
                    technicianData.reduce(
                      (sum, tech) => sum + tech.workloadScore,
                      0
                    ) / technicians.length
                  ).toFixed(1)
                : 0}
              %
            </div>
            <p className="text-xs text-muted-foreground">
              Average capacity utilization
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Unassigned</CardTitle>
            <AlertTriangle className="h-4 w-4 text-orange-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">
              {unassignedRequests.length}
            </div>
            <p className="text-xs text-muted-foreground">
              Requests need assignment
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Overloaded</CardTitle>
            <TrendingUp className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              {technicianData.filter((tech) => tech.workloadScore >= 80).length}
            </div>
            <p className="text-xs text-muted-foreground">
              Technicians at capacity
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Unassigned Requests */}
      {unassignedRequests.length > 0 && isAdmin && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <AlertTriangle className="h-5 w-5 text-orange-500" />
              <span>Unassigned Requests ({unassignedRequests.length})</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {unassignedRequests.slice(0, 5).map((request) => (
                <div
                  key={request.id}
                  className="flex items-center justify-between p-3 border rounded-lg"
                >
                  <div>
                    <div className="font-medium">{request.title}</div>
                    <div className="text-sm text-muted-foreground">
                      {request.request_number} •{" "}
                      {request.service_category?.name} • Priority:{" "}
                      {request.priority}
                    </div>
                  </div>
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button
                        size="sm"
                        onClick={() => setSelectedRequest(request.id)}
                      >
                        <UserPlus className="mr-2 h-4 w-4" />
                        Assign
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Assign Technician</DialogTitle>
                        <DialogDescription>
                          Assign a technician to handle this service request.
                        </DialogDescription>
                      </DialogHeader>
                      <div className="space-y-4">
                        <div>
                          <Label>Request</Label>
                          <div className="p-3 bg-muted rounded-md">
                            <div className="font-medium">{request.title}</div>
                            <div className="text-sm text-muted-foreground">
                              {request.request_number} •{" "}
                              {request.service_category?.name}
                            </div>
                          </div>
                        </div>
                        <div>
                          <Label>Select Technician</Label>
                          <Select
                            value={newTechnician}
                            onValueChange={setNewTechnician}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Choose technician" />
                            </SelectTrigger>
                            <SelectContent>
                              {technicianData.map((tech) => {
                                const badge = getWorkloadBadge(
                                  tech.workloadScore
                                );
                                return (
                                  <SelectItem key={tech.id} value={tech.id}>
                                    <div className="flex items-center justify-between w-full">
                                      <span>{tech.full_name}</span>
                                      <Badge
                                        variant={badge.variant}
                                        className="ml-2"
                                      >
                                        {badge.label}
                                      </Badge>
                                    </div>
                                  </SelectItem>
                                );
                              })}
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                      <DialogFooter>
                        <Button
                          variant="outline"
                          onClick={() => setNewTechnician("")}
                        >
                          Cancel
                        </Button>
                        <Button
                          onClick={handleAssignRequest}
                          disabled={!newTechnician}
                        >
                          Assign Technician
                        </Button>
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>
                </div>
              ))}
              {unassignedRequests.length > 5 && (
                <div className="text-center text-sm text-muted-foreground">
                  And {unassignedRequests.length - 5} more unassigned
                  requests...
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Technician Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {technicianData.map((tech) => {
          const badge = getWorkloadBadge(tech.workloadScore);
          const isSelected = selectedTechnician === tech.id;

          return (
            <Card
              key={tech.id}
              className={`cursor-pointer transition-all ${
                isSelected ? "ring-2 ring-primary" : ""
              }`}
              onClick={() => onTechnicianSelect?.(tech.id)}
            >
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg">{tech.full_name}</CardTitle>
                  <Badge variant={badge.variant}>{badge.label}</Badge>
                </div>
                <div className="text-sm text-muted-foreground">
                  {tech.email}
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Workload Progress */}
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span>Workload</span>
                    <span className={getWorkloadColor(tech.workloadScore)}>
                      {tech.workloadScore.toFixed(1)}%
                    </span>
                  </div>
                  <Progress value={tech.workloadScore} />
                </div>

                {/* Request Stats */}
                <div className="grid grid-cols-4 gap-2 text-center">
                  <div>
                    <div className="text-lg font-bold text-blue-600">
                      {tech.pending}
                    </div>
                    <div className="text-xs text-muted-foreground">Pending</div>
                  </div>
                  <div>
                    <div className="text-lg font-bold text-purple-600">
                      {tech.inProgress}
                    </div>
                    <div className="text-xs text-muted-foreground">Active</div>
                  </div>
                  <div>
                    <div className="text-lg font-bold text-green-600">
                      {tech.completed}
                    </div>
                    <div className="text-xs text-muted-foreground">Done</div>
                  </div>
                  <div>
                    <div className="text-lg font-bold text-red-600">
                      {tech.overdue}
                    </div>
                    <div className="text-xs text-muted-foreground">Overdue</div>
                  </div>
                </div>

                {/* Performance Metrics */}
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">
                      Completion Rate
                    </span>
                    <span className="font-medium">
                      {tech.completionRate.toFixed(1)}%
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">
                      Total Assigned
                    </span>
                    <span className="font-medium">{tech.totalAssigned}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Active Load</span>
                    <span className="font-medium">
                      {tech.totalActive} requests
                    </span>
                  </div>
                </div>

                {/* Recent Activity */}
                {tech.requests.length > 0 && (
                  <div>
                    <div className="text-sm font-medium mb-2">
                      Recent Activity
                    </div>
                    <div className="space-y-1">
                      {tech.requests
                        .filter((r) => r.status !== "completed")
                        .slice(0, 2)
                        .map((request) => (
                          <div
                            key={request.id}
                            className="text-xs p-2 bg-muted rounded"
                          >
                            <div className="font-medium">{request.title}</div>
                            <div className="text-muted-foreground">
                              {request.request_number} • {request.status}
                            </div>
                          </div>
                        ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Selected Technician Details */}
      {selectedTechnician && (
        <Card>
          <CardHeader>
            <CardTitle>
              {
                technicianData.find((t) => t.id === selectedTechnician)
                  ?.full_name
              }{" "}
              - Detailed View
            </CardTitle>
          </CardHeader>
          <CardContent>
            {(() => {
              const tech = technicianData.find(
                (t) => t.id === selectedTechnician
              );
              if (!tech) return null;

              return (
                <div className="space-y-4">
                  <div className="grid gap-4 md:grid-cols-3">
                    <div className="text-center p-4 border rounded-lg">
                      <div className="text-2xl font-bold text-blue-600">
                        {tech.pending}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        Pending Requests
                      </div>
                    </div>
                    <div className="text-center p-4 border rounded-lg">
                      <div className="text-2xl font-bold text-purple-600">
                        {tech.inProgress}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        In Progress
                      </div>
                    </div>
                    <div className="text-center p-4 border rounded-lg">
                      <div className="text-2xl font-bold text-green-600">
                        {tech.completed}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        Completed
                      </div>
                    </div>
                  </div>

                  {/* Active Requests */}
                  <div>
                    <h4 className="font-medium mb-3">Active Requests</h4>
                    <div className="space-y-2">
                      {tech.requests
                        .filter(
                          (r) =>
                            r.status !== "completed" && r.status !== "cancelled"
                        )
                        .map((request) => (
                          <div
                            key={request.id}
                            className="flex items-center justify-between p-3 border rounded-lg"
                          >
                            <div>
                              <div className="font-medium">{request.title}</div>
                              <div className="text-sm text-muted-foreground">
                                {request.request_number} •{" "}
                                {request.service_category?.name}
                              </div>
                            </div>
                            <div className="text-right">
                              <Badge
                                variant={
                                  request.status === "in_progress"
                                    ? "default"
                                    : "secondary"
                                }
                              >
                                {request.status.replace("_", " ")}
                              </Badge>
                              {request.estimated_completion && (
                                <div className="text-xs text-muted-foreground mt-1">
                                  Due:{" "}
                                  {formatDate(request.estimated_completion)}
                                </div>
                              )}
                            </div>
                          </div>
                        ))}
                    </div>
                  </div>
                </div>
              );
            })()}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
