// src/app/(dashboard)/admin/iam/page.tsx
"use client";

import { Suspense, useEffect, useState } from "react";
import { iamApi } from "@/lib/api";
import { extractApiError } from "@/lib/api-client";
import { Button } from "@/components/ui/button";
import {
  Shield,
  Key,
  Loader2,
  CheckCircle2,
  AlertCircle,
  ShieldCheck,
  UserPlus,
  X,
} from "lucide-react";

export default function AdminIamPage() {
  return (
    <Suspense
      fallback={
        <div className="py-16 flex justify-center">
          <Loader2 className="h-6 w-6 animate-spin text-orange-500" />
        </div>
      }
    >
      <AdminIamContent />
    </Suspense>
  );
}

function AdminIamContent() {
  const [roles, setRoles] = useState<any[]>([]);
  const [permissions, setPermissions] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  const [feedback, setFeedback] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  // Create Role Modal State
  const [showRoleModal, setShowRoleModal] = useState<boolean>(false);
  const [creatingRole, setCreatingRole] = useState<boolean>(false);
  const [roleName, setRoleName] = useState<string>("");
  const [roleDesc, setRoleDesc] = useState<string>("");
  const [selectedPermissionIds, setSelectedPermissionIds] = useState<string[]>([]);

  // Provision Staff Modal State
  const [showStaffModal, setShowStaffModal] = useState<boolean>(false);
  const [provisioningStaff, setProvisioningStaff] = useState<boolean>(false);
  const [staffForm, setStaffForm] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phoneNumber: "",
    password: "",
    roleId: "",
  });

  useEffect(() => {
    loadIamData();
  }, []);

  const loadIamData = async () => {
    setLoading(true);
    try {
      const [rolesRes, permsRes] = await Promise.allSettled([
        iamApi.listRoles(),
        iamApi.listPermissions(),
      ]);

      const rList =
        rolesRes.status === "fulfilled" && Array.isArray(rolesRes.value)
          ? rolesRes.value
          : [];
      setRoles(rList);

      const pList =
        permsRes.status === "fulfilled" && Array.isArray(permsRes.value)
          ? permsRes.value
          : [];
      setPermissions(pList);

      if (rList.length > 0 && !staffForm.roleId) {
        setStaffForm((p) => ({ ...p, roleId: rList[0].id }));
      }
    } catch {
      setRoles([
        { id: "r-1", name: "SUPER_ADMIN", description: "Full platform control" },
        { id: "r-2", name: "TUTOR", description: "Class attendance and grading" },
        { id: "r-3", name: "MODERATOR", description: "Admissions and review queue" },
      ]);
      setPermissions([
        { id: "p-1", name: "users:read", description: "View student profiles" },
        { id: "p-2", name: "grades:write", description: "Compute and adjust grades" },
        { id: "p-3", name: "certificates:issue", description: "Mint graduation certs" },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleTogglePermission = (permId: string) => {
    setSelectedPermissionIds((prev) =>
      prev.includes(permId) ? prev.filter((id) => id !== permId) : [...prev, permId]
    );
  };

  const handleCreateRole = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!roleName.trim()) return;

    setCreatingRole(true);
    setFeedback(null);
    try {
      await iamApi.createRole({
        name: roleName.trim().toUpperCase(),
        description: roleDesc.trim(),
        permissionIds: selectedPermissionIds,
      });

      setShowRoleModal(false);
      setRoleName("");
      setRoleDesc("");
      setSelectedPermissionIds([]);
      setFeedback({
        type: "success",
        text: `Role "${roleName.trim().toUpperCase()}" created successfully.`,
      });
      await loadIamData();
    } catch (err) {
      const normalized = extractApiError(err);
      setFeedback({
        type: "error",
        text: normalized.message || "Failed to create security role.",
      });
    } finally {
      setCreatingRole(false);
    }
  };

  const handleProvisionStaff = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!staffForm.email.trim() || !staffForm.password || !staffForm.roleId) return;

    setProvisioningStaff(true);
    setFeedback(null);
    try {
      await iamApi.provisionUser({
        firstName: staffForm.firstName.trim(),
        lastName: staffForm.lastName.trim(),
        email: staffForm.email.trim(),
        ...(staffForm.phoneNumber.trim()
          ? { phoneNumber: staffForm.phoneNumber.trim() }
          : {}),
        password: staffForm.password,
        type: "STAFF" as any, 
        roleIds: [staffForm.roleId],
      });

      setShowStaffModal(false);
      setStaffForm({
        firstName: "",
        lastName: "",
        email: "",
        phoneNumber: "",
        password: "",
        roleId: roles[0]?.id || "",
      });
      setFeedback({
        type: "success",
        text: "Staff account provisioned and assigned security role successfully.",
      });
    } catch (err) {
      const normalized = extractApiError(err);
      setFeedback({
        type: "error",
        text: normalized.message || "Failed to provision staff user.",
      });
    } finally {
      setProvisioningStaff(false);
    }
  };

  return (
    <div className="space-y-8 max-w-6xl mx-auto">
      {/* HEADER */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-white">
            Identity & Access Management (IAM)
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Manage granular security roles, permission matrices, and administrative staff onboarding.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <Button
            type="button"
            variant="outline"
            onClick={() => setShowRoleModal(true)}
            className="border-slate-800 text-slate-200 hover:bg-slate-800 text-xs h-10 px-4 rounded-xl"
          >
            <Shield className="h-3.5 w-3.5 mr-1.5 text-orange-400" /> Create New Role
          </Button>

          <Button
            type="button"
            onClick={() => setShowStaffModal(true)}
            className="bg-gradient-to-r from-orange-500 via-red-500 to-red-600 text-white font-bold text-xs h-10 px-4 rounded-xl border-0 shadow-lg shadow-orange-500/20"
          >
            <UserPlus className="h-3.5 w-3.5 mr-1.5" /> Provision Staff Account
          </Button>
        </div>
      </div>

      {/* FEEDBACK BANNER */}
      {feedback && (
        <div
          className={`p-4 rounded-2xl border text-xs flex items-center justify-between ${
            feedback.type === "success"
              ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-400"
              : "bg-red-500/10 border-red-500/20 text-red-400"
          }`}
        >
          <div className="flex items-center gap-2">
            {feedback.type === "success" ? (
              <CheckCircle2 className="h-4 w-4 shrink-0" />
            ) : (
              <AlertCircle className="h-4 w-4 shrink-0" />
            )}
            <span>{feedback.text}</span>
          </div>
          <button onClick={() => setFeedback(null)} className="hover:text-white">
            <X className="h-4 w-4" />
          </button>
        </div>
      )}

      {loading ? (
        <div className="py-16 flex justify-center">
          <Loader2 className="h-6 w-6 animate-spin text-orange-500" />
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* ROLES TABLE */}
          <div className="rounded-3xl border border-slate-800 bg-slate-900/60 overflow-hidden backdrop-blur-xl">
            <div className="p-5 border-b border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <ShieldCheck className="h-4 w-4 text-orange-400" />
                <h2 className="text-sm font-bold text-white">System Roles</h2>
              </div>
              <span className="text-[11px] font-mono text-slate-400">
                {roles.length} roles
              </span>
            </div>

            <table className="w-full text-left text-xs text-slate-300">
              <thead className="bg-slate-950 text-slate-400 uppercase text-[10px] font-mono border-b border-slate-800">
                <tr>
                  <th className="p-4">Role Name</th>
                  <th className="p-4">Description</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/80">
                {roles.map((r: any) => (
                  <tr key={r.id || r.name} className="hover:bg-slate-900/80">
                    <td className="p-4 font-mono font-bold text-orange-400">
                      {r.name}
                    </td>
                    <td className="p-4 text-slate-400">
                      {r.description || "System security role"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* PERMISSIONS MATRIX */}
          <div className="rounded-3xl border border-slate-800 bg-slate-900/60 overflow-hidden backdrop-blur-xl">
            <div className="p-5 border-b border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Key className="h-4 w-4 text-emerald-400" />
                <h2 className="text-sm font-bold text-white">
                  Granular Permissions
                </h2>
              </div>
              <span className="text-[11px] font-mono text-slate-400">
                {permissions.length} perms
              </span>
            </div>

            <table className="w-full text-left text-xs text-slate-300">
              <thead className="bg-slate-950 text-slate-400 uppercase text-[10px] font-mono border-b border-slate-800">
                <tr>
                  <th className="p-4">Permission Key</th>
                  <th className="p-4">Description</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/80">
                {permissions.map((p: any) => (
                  <tr key={p.id || p.name} className="hover:bg-slate-900/80">
                    <td className="p-4 font-mono font-bold text-emerald-400">
                      {p.name || p.key}
                    </td>
                    <td className="p-4 text-slate-400">
                      {p.description || "Scoped action permission"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* CREATE ROLE MODAL */}
      {showRoleModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 max-w-md w-full rounded-3xl p-6 space-y-5 shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-start border-b border-slate-800 pb-4">
              <div>
                <h3 className="text-lg font-bold text-white">Create Security Role</h3>
                <p className="text-xs text-slate-400">Define a new access tier.</p>
              </div>
              <button
                onClick={() => setShowRoleModal(false)}
                className="p-1 text-slate-400 hover:text-white"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <form onSubmit={handleCreateRole} className="space-y-4 text-xs">
              <div className="space-y-1">
                <label className="text-slate-300 font-medium">Role Identifier *</label>
                <input
                  required
                  type="text"
                  value={roleName}
                  onChange={(e) => setRoleName(e.target.value)}
                  placeholder="e.g. SENIOR_TUTOR"
                  className="w-full h-10 bg-slate-950 border border-slate-800 rounded-xl px-3 font-mono text-white focus:outline-none focus:border-orange-500"
                />
              </div>

              <div className="space-y-1">
                <label className="text-slate-300 font-medium">Description</label>
                <textarea
                  rows={2}
                  value={roleDesc}
                  onChange={(e) => setRoleDesc(e.target.value)}
                  placeholder="Role scope and operational boundaries..."
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-white focus:outline-none focus:border-orange-500"
                />
              </div>

              <div className="space-y-2">
                <label className="text-slate-300 font-medium block">
                  Assign Permissions ({selectedPermissionIds.length} selected)
                </label>
                <div className="max-h-40 overflow-y-auto space-y-1.5 p-2 bg-slate-950 border border-slate-800 rounded-xl">
                  {permissions.map((p) => (
                    <label
                      key={p.id}
                      className="flex items-center gap-2 p-1.5 hover:bg-slate-900 rounded-lg cursor-pointer text-slate-300"
                    >
                      <input
                        type="checkbox"
                        checked={selectedPermissionIds.includes(p.id)}
                        onChange={() => handleTogglePermission(p.id)}
                        className="rounded border-slate-800 bg-slate-950 text-orange-500 focus:ring-0 h-3.5 w-3.5"
                      />
                      <span className="font-mono text-[11px] text-emerald-400">
                        {p.name || p.key}
                      </span>
                    </label>
                  ))}
                </div>
              </div>

              <div className="flex justify-end gap-2.5 pt-3 border-t border-slate-800">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setShowRoleModal(false)}
                  className="border-slate-800 text-slate-300 text-xs"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={creatingRole}
                  className="bg-orange-600 hover:bg-orange-500 text-white font-bold text-xs"
                >
                  {creatingRole ? (
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  ) : (
                    "Create Role"
                  )}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* PROVISION STAFF MODAL */}
      {showStaffModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 max-w-md w-full rounded-3xl p-6 space-y-5 shadow-2xl">
            <div className="flex justify-between items-start border-b border-slate-800 pb-4">
              <div>
                <h3 className="text-lg font-bold text-white">
                  Provision Staff Account
                </h3>
                <p className="text-xs text-slate-400">
                  Onboard faculty or administrative personnel.
                </p>
              </div>
              <button
                onClick={() => setShowStaffModal(false)}
                className="p-1 text-slate-400 hover:text-white"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <form onSubmit={handleProvisionStaff} className="space-y-3.5 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-slate-300 font-medium">First Name *</label>
                  <input
                    required
                    type="text"
                    value={staffForm.firstName}
                    onChange={(e) =>
                      setStaffForm((p) => ({ ...p, firstName: e.target.value }))
                    }
                    className="w-full h-10 bg-slate-950 border border-slate-800 rounded-xl px-3 text-white focus:outline-none focus:border-orange-500"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-slate-300 font-medium">Last Name *</label>
                  <input
                    required
                    type="text"
                    value={staffForm.lastName}
                    onChange={(e) =>
                      setStaffForm((p) => ({ ...p, lastName: e.target.value }))
                    }
                    className="w-full h-10 bg-slate-950 border border-slate-800 rounded-xl px-3 text-white focus:outline-none focus:border-orange-500"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-slate-300 font-medium">Email *</label>
                <input
                  required
                  type="email"
                  value={staffForm.email}
                  onChange={(e) =>
                    setStaffForm((p) => ({ ...p, email: e.target.value }))
                  }
                  placeholder="staff@devscircle.academy"
                  className="w-full h-10 bg-slate-950 border border-slate-800 rounded-xl px-3 text-white focus:outline-none focus:border-orange-500"
                />
              </div>

              <div className="space-y-1">
                <label className="text-slate-300 font-medium">Security Role *</label>
                <select
                  required
                  value={staffForm.roleId}
                  onChange={(e) =>
                    setStaffForm((p) => ({ ...p, roleId: e.target.value }))
                  }
                  className="w-full h-10 bg-slate-950 border border-slate-800 rounded-xl px-3 text-white focus:outline-none focus:border-orange-500"
                >
                  <option value="">Select security role...</option>
                  {roles.map((r: any) => (
                    <option key={r.id} value={r.id}>
                      {r.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-slate-300 font-medium">Password *</label>
                <input
                  required
                  type="password"
                  minLength={8}
                  value={staffForm.password}
                  onChange={(e) =>
                    setStaffForm((p) => ({ ...p, password: e.target.value }))
                  }
                  placeholder="Min 8 characters"
                  className="w-full h-10 bg-slate-950 border border-slate-800 rounded-xl px-3 text-white focus:outline-none focus:border-orange-500"
                />
              </div>

              <div className="flex justify-end gap-2.5 pt-3 border-t border-slate-800">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setShowStaffModal(false)}
                  className="border-slate-800 text-slate-300 text-xs"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={provisioningStaff}
                  className="bg-orange-600 hover:bg-orange-500 text-white font-bold text-xs"
                >
                  {provisioningStaff ? (
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  ) : (
                    "Provision Account"
                  )}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}