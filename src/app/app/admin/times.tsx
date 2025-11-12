"use client";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Plus, Edit, Trash2, Users as UsersIcon, UserPlus, UserMinus } from "lucide-react";
import { Team, User } from "@/types/models";

interface Company {
  id: number;
  name: string;
}

export default function TeamsManagement() {
  const [teams, setTeams] = useState<Team[]>([]);
  const [companies, setCompanies] = useState<Company[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [userRole, setUserRole] = useState<string>("");
  const [userCompanyId, setUserCompanyId] = useState<number | null>(null);
  
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isMembersOpen, setIsMembersOpen] = useState(false);
  const [selectedTeam, setSelectedTeam] = useState<Team | null>(null);
  
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    companyId: "",
    supervisorId: "",
  });

  useEffect(() => {
    fetchUserInfo();
    fetchTeams();
  }, []);

  const fetchUserInfo = async () => {
    try {
      const token = localStorage.getItem("token") || sessionStorage.getItem("token");
      if (!token) return;

      const res = await fetch("/api/auth/me", {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (res.ok) {
        const data = await res.json();
        setUserRole(data.user.role);
        setUserCompanyId(data.user.companyId);

        // Se for SUPER_ADMIN, buscar empresas
        if (data.user.role === "SUPER_ADMIN") {
          fetchCompanies();
        }
      }
    } catch (error) {
      console.error("Erro ao buscar informações do usuário:", error);
    }
  };

  const fetchCompanies = async () => {
    try {
      const token = localStorage.getItem("token") || sessionStorage.getItem("token");
      if (!token) return;

      const res = await fetch("/api/companies", {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (res.ok) {
        const data = await res.json();
        setCompanies(data.companies || []);
      }
    } catch (error) {
      console.error("Erro ao buscar empresas:", error);
    }
  };

  const fetchTeams = async () => {
    try {
      const token = localStorage.getItem("token") || sessionStorage.getItem("token");
      if (!token) return;

      const res = await fetch("/api/teams", {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (res.ok) {
        const data = await res.json();
        setTeams(data.teams || []);
      }
    } catch (error) {
      console.error("Erro ao buscar times:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchUsers = async (companyId: number) => {
    try {
      const token = localStorage.getItem("token") || sessionStorage.getItem("token");
      if (!token) return;

      const res = await fetch(`/api/users?companyId=${companyId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (res.ok) {
        const data = await res.json();
        setUsers(data.users || []);
      }
    } catch (error) {
      console.error("Erro ao buscar usuários:", error);
    }
  };

  const handleCreateTeam = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const token = localStorage.getItem("token") || sessionStorage.getItem("token");
      if (!token) return;

      const companyId = userRole === "SUPER_ADMIN" 
        ? parseInt(formData.companyId) 
        : userCompanyId;

      const res = await fetch("/api/teams", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          name: formData.name,
          description: formData.description,
          companyId,
          supervisorId: formData.supervisorId ? parseInt(formData.supervisorId) : null,
        }),
      });

      if (res.ok) {
        fetchTeams();
        setIsCreateOpen(false);
        setFormData({ name: "", description: "", companyId: "", supervisorId: "" });
      } else {
        const error = await res.json();
        alert(error.error || "Erro ao criar time");
      }
    } catch (error) {
      console.error("Erro ao criar time:", error);
      alert("Erro ao criar time");
    }
  };

  const handleUpdateTeam = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTeam) return;

    try {
      const token = localStorage.getItem("token") || sessionStorage.getItem("token");
      if (!token) return;

      const res = await fetch(`/api/teams/${selectedTeam.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          name: formData.name,
          description: formData.description,
          supervisorId: formData.supervisorId ? parseInt(formData.supervisorId) : null,
        }),
      });

      if (res.ok) {
        fetchTeams();
        setIsEditOpen(false);
        setSelectedTeam(null);
        setFormData({ name: "", description: "", companyId: "", supervisorId: "" });
      } else {
        const error = await res.json();
        alert(error.error || "Erro ao atualizar time");
      }
    } catch (error) {
      console.error("Erro ao atualizar time:", error);
      alert("Erro ao atualizar time");
    }
  };

  const handleDeleteTeam = async (teamId: number) => {
    if (!confirm("Tem certeza que deseja deletar este time?")) return;

    try {
      const token = localStorage.getItem("token") || sessionStorage.getItem("token");
      if (!token) return;

      const res = await fetch(`/api/teams/${teamId}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });

      if (res.ok) {
        fetchTeams();
      } else {
        const error = await res.json();
        alert(error.error || "Erro ao deletar time");
      }
    } catch (error) {
      console.error("Erro ao deletar time:", error);
      alert("Erro ao deletar time");
    }
  };

  const handleAddMember = async (userId: number) => {
    if (!selectedTeam) return;

    try {
      const token = localStorage.getItem("token") || sessionStorage.getItem("token");
      if (!token) return;

      const res = await fetch(`/api/teams/${selectedTeam.id}/members`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ userId }),
      });

      if (res.ok) {
        fetchTeams();
        fetchUsers(selectedTeam.companyId);
      } else {
        const error = await res.json();
        alert(error.error || "Erro ao adicionar membro");
      }
    } catch (error) {
      console.error("Erro ao adicionar membro:", error);
      alert("Erro ao adicionar membro");
    }
  };

  const handleRemoveMember = async (userId: number) => {
    if (!selectedTeam) return;

    try {
      const token = localStorage.getItem("token") || sessionStorage.getItem("token");
      if (!token) return;

      const res = await fetch(`/api/teams/${selectedTeam.id}/members?userId=${userId}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });

      if (res.ok) {
        fetchTeams();
        fetchUsers(selectedTeam.companyId);
      } else {
        const error = await res.json();
        alert(error.error || "Erro ao remover membro");
      }
    } catch (error) {
      console.error("Erro ao remover membro:", error);
      alert("Erro ao remover membro");
    }
  };

  const openEditDialog = (team: Team) => {
    setSelectedTeam(team);
    setFormData({
      name: team.name,
      description: team.description || "",
      companyId: team.companyId.toString(),
      supervisorId: team.supervisorId?.toString() || "",
    });
    fetchUsers(team.companyId);
    setIsEditOpen(true);
  };

  const openMembersDialog = (team: Team) => {
    setSelectedTeam(team);
    fetchUsers(team.companyId);
    setIsMembersOpen(true);
  };

  const openCreateDialog = () => {
    setFormData({ name: "", description: "", companyId: "", supervisorId: "" });
    if (userRole === "COMPANY_ADMIN" && userCompanyId) {
      fetchUsers(userCompanyId);
    }
    setIsCreateOpen(true);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-lg">Carregando times...</div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Gestão de Times</h1>
          <p className="text-gray-600 mt-1">Gerencie times e membros da empresa</p>
        </div>
        <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
          <DialogTrigger asChild>
            <Button onClick={openCreateDialog}>
              <Plus className="mr-2 h-4 w-4" />
              Criar Time
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Criar Novo Time</DialogTitle>
              <DialogDescription>
                Adicione um novo time à empresa
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleCreateTeam} className="space-y-4">
              {userRole === "SUPER_ADMIN" && (
                <div>
                  <Label htmlFor="company">Empresa</Label>
                  <Select
                    value={formData.companyId}
                    onValueChange={(value) => {
                      setFormData({ ...formData, companyId: value, supervisorId: "" });
                      fetchUsers(parseInt(value));
                    }}
                    required
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione a empresa" />
                    </SelectTrigger>
                    <SelectContent>
                      {companies.map((company) => (
                        <SelectItem key={company.id} value={company.id.toString()}>
                          {company.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}
              <div>
                <Label htmlFor="name">Nome do Time</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                />
              </div>
              <div>
                <Label htmlFor="description">Descrição</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows={3}
                />
              </div>
              <div>
                <Label htmlFor="supervisor">Supervisor (Opcional)</Label>
                <Select
                  value={formData.supervisorId}
                  onValueChange={(value) => setFormData({ ...formData, supervisorId: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione um supervisor" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">Sem supervisor</SelectItem>
                    {users.filter(u => u.role === "COLLABORATOR" || u.role === "SUPERVISOR").map((user) => (
                      <SelectItem key={user.id} value={user.id.toString()}>
                        {user.name} ({user.email})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="flex justify-end gap-2">
                <Button type="button" variant="outline" onClick={() => setIsCreateOpen(false)}>
                  Cancelar
                </Button>
                <Button type="submit">Criar Time</Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-4">
        {teams.length === 0 ? (
          <Card>
            <CardContent className="pt-6">
              <p className="text-center text-gray-500">Nenhum time cadastrado ainda.</p>
            </CardContent>
          </Card>
        ) : (
          teams.map((team) => (
            <Card key={team.id}>
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle>{team.name}</CardTitle>
                    <CardDescription>{team.description || "Sem descrição"}</CardDescription>
                    {team.company && (
                      <Badge variant="outline" className="mt-2">
                        {team.company.name}
                      </Badge>
                    )}
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => openMembersDialog(team)}
                    >
                      <UsersIcon className="h-4 w-4 mr-1" />
                      Membros ({team.members?.length || 0})
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => openEditDialog(team)}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDeleteTeam(team.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div>
                    <span className="font-semibold">Supervisor: </span>
                    {team.supervisor ? (
                      <span>{team.supervisor.name} ({team.supervisor.email})</span>
                    ) : (
                      <span className="text-gray-500">Sem supervisor</span>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* Dialog de Edição */}
      <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Editar Time</DialogTitle>
            <DialogDescription>
              Atualize as informações do time
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleUpdateTeam} className="space-y-4">
            <div>
              <Label htmlFor="edit-name">Nome do Time</Label>
              <Input
                id="edit-name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
              />
            </div>
            <div>
              <Label htmlFor="edit-description">Descrição</Label>
              <Textarea
                id="edit-description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                rows={3}
              />
            </div>
            <div>
              <Label htmlFor="edit-supervisor">Supervisor</Label>
              <Select
                value={formData.supervisorId}
                onValueChange={(value) => setFormData({ ...formData, supervisorId: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione um supervisor" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">Sem supervisor</SelectItem>
                  {users.filter(u => u.role === "COLLABORATOR" || u.role === "SUPERVISOR").map((user) => (
                    <SelectItem key={user.id} value={user.id.toString()}>
                      {user.name} ({user.email})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex justify-end gap-2">
              <Button type="button" variant="outline" onClick={() => setIsEditOpen(false)}>
                Cancelar
              </Button>
              <Button type="submit">Salvar</Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Dialog de Membros */}
      <Dialog open={isMembersOpen} onOpenChange={setIsMembersOpen}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>Gerenciar Membros - {selectedTeam?.name}</DialogTitle>
            <DialogDescription>
              Adicione ou remova membros do time
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <h3 className="font-semibold mb-2">Membros Atuais</h3>
              {selectedTeam?.members && selectedTeam.members.length > 0 ? (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Nome</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Role</TableHead>
                      <TableHead className="text-right">Ação</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {selectedTeam.members.map((member) => (
                      <TableRow key={member.id}>
                        <TableCell>{member.name}</TableCell>
                        <TableCell>{member.email}</TableCell>
                        <TableCell>
                          <Badge>{member.role}</Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleRemoveMember(member.id)}
                          >
                            <UserMinus className="h-4 w-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              ) : (
                <p className="text-gray-500 text-sm">Nenhum membro no time ainda.</p>
              )}
            </div>

            <div>
              <h3 className="font-semibold mb-2">Adicionar Membro</h3>
              {users.filter(u => !u.teamId && u.companyId === selectedTeam?.companyId).length > 0 ? (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Nome</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Role</TableHead>
                      <TableHead className="text-right">Ação</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {users
                      .filter(u => !u.teamId && u.companyId === selectedTeam?.companyId)
                      .map((user) => (
                        <TableRow key={user.id}>
                          <TableCell>{user.name}</TableCell>
                          <TableCell>{user.email}</TableCell>
                          <TableCell>
                            <Badge variant="outline">{user.role}</Badge>
                          </TableCell>
                          <TableCell className="text-right">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleAddMember(user.id)}
                            >
                              <UserPlus className="h-4 w-4" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                  </TableBody>
                </Table>
              ) : (
                <p className="text-gray-500 text-sm">Todos os usuários já fazem parte de um time.</p>
              )}
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
