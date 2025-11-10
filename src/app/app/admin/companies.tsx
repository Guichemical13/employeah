"use client";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogTrigger,
  DialogClose,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from "@/components/ui/form";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import PasswordValidator from "@/components/PasswordValidator";
import type { Company } from "@/types/models";

const companySchema = z.object({
  name: z.string().min(2, "Nome obrigatório"),
  adminName: z.string().min(2, "Nome do admin obrigatório"),
  adminEmail: z.string().email("E-mail do admin inválido"),
  adminPassword: z.string()
    .min(8, "Senha mínima de 8 caracteres")
    .regex(/[A-Z]/, "Deve conter uma letra maiúscula")
    .regex(/[a-z]/, "Deve conter uma letra minúscula")
    .regex(/[0-9]/, "Deve conter um número"),
});
type CompanyForm = z.infer<typeof companySchema>;

export default function CompaniesTab() {
  const [companies, setCompanies] = useState<Company[]>([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [editCompany, setEditCompany] = useState<Company | null>(null);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [deleteCompany, setDeleteCompany] = useState<Company | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState("");
  const [deleteError, setDeleteError] = useState("");

  const form = useForm<CompanyForm>({
    resolver: zodResolver(companySchema),
    defaultValues: { name: "", adminName: "", adminEmail: "", adminPassword: "" },
  });

  useEffect(() => {
    fetchCompanies();
  }, []);

  async function fetchCompanies() {
    const token = localStorage.getItem("token") || sessionStorage.getItem("token");
    console.log("[admin companies] token:", token);
    const res = await fetch("/api/companies", {
      headers: { Authorization: `Bearer ${token}` },
    });
    setCompanies(await res.json());
    setLoading(false);
  }

  function handleOpenCreate() {
    setEditCompany(null);
    form.reset({ name: "", adminName: "", adminEmail: "", adminPassword: "" });
    setOpen(true);
  }

  function handleOpenEdit(company: Company) {
    setEditCompany(company);
    form.reset({ name: company.name, adminName: "", adminEmail: "", adminPassword: "" });
    setOpen(true);
  }

  async function onSubmit(values: CompanyForm) {
    const token =
      localStorage.getItem("token") || sessionStorage.getItem("token");
    if (editCompany) {
      console.log("[admin companies update] token:", token);
      await fetch(`/api/companies/${editCompany.id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ name: values.name }),
      });
    } else {
      console.log("[admin companies create] token:", token);
      await fetch("/api/companies", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          name: values.name,
          admin: {
            name: values.adminName,
            email: values.adminEmail,
            password: values.adminPassword,
          },
        }),
      });
    }
    setOpen(false);
    fetchCompanies();
  }

  async function handleDelete(companyId: Company["id"]) {
    setDeleteError("");
    const token = localStorage.getItem("token") || sessionStorage.getItem("token");
    try {
      await fetch(`/api/companies/${companyId}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      setDeleteModalOpen(false);
      setDeleteCompany(null);
      setDeleteConfirm("");
      fetchCompanies();
    } catch (e) {
      setDeleteError("Erro ao deletar empresa.");
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center mb-2">
        <div className="font-bold text-lg">Empresas</div>
        <Button onClick={handleOpenCreate}>Nova Empresa</Button>
      </div>
      {loading ? (
        <div className="text-gray-400">Carregando...</div>
      ) : companies.length === 0 ? (
        <div className="text-gray-400">Nenhuma empresa encontrada.</div>
      ) : (
        <ul className="space-y-2">
          {companies.map((c) => (
            <li key={c.id} className="bg-white rounded shadow p-4 flex justify-between items-center">
              <span>{c.name}</span>
              <div className="flex gap-2">
                <Button size="sm" variant="outline" onClick={() => handleOpenEdit(c)}>Editar</Button>
                <Button size="sm" variant="destructive" onClick={() => { setDeleteCompany(c); setDeleteModalOpen(true); }}>Excluir</Button>
              </div>
            </li>
          ))}
        </ul>
      )}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {editCompany ? "Editar Empresa" : "Nova Empresa"}
            </DialogTitle>
          </DialogHeader>
          <Form {...form}>
            <form
              onSubmit={form.handleSubmit(onSubmit)}
              className="space-y-4"
            >
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nome</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              {!editCompany && (
                <>
                  <FormField
                    control={form.control}
                    name="adminName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Nome do Admin</FormLabel>
                        <FormControl>
                          <Input {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="adminEmail"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Email do Admin</FormLabel>
                        <FormControl>
                          <Input {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="adminPassword"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Senha do Admin</FormLabel>
                        <FormControl>
                          <Input type="password" {...field} />
                        </FormControl>
                        <FormMessage />
                        <PasswordValidator 
                          password={field.value || ""} 
                          className="mt-2"
                        />
                      </FormItem>
                    )}
                  />
                </>
              )}
              <DialogFooter>
                <Button type="submit">Salvar</Button>
                <DialogClose asChild>
                  <Button type="button" variant="outline">
                    Cancelar
                  </Button>
                </DialogClose>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
      <Dialog open={deleteModalOpen} onOpenChange={setDeleteModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirmar exclusão</DialogTitle>
          </DialogHeader>
          <div className="space-y-2">
            <p>Tem certeza que deseja excluir a empresa <b>{deleteCompany?.name}</b>?</p>
            <p>Esta ação é irreversível e removerá todos os dados relacionados (usuários, itens, elogios, etc).</p>
            <p>Digite o nome da empresa para confirmar:</p>
            <Input value={deleteConfirm} onChange={e => setDeleteConfirm(e.target.value)} autoFocus />
            {deleteError && <div className="text-red-500 text-sm">{deleteError}</div>}
          </div>
          <DialogFooter>
            <Button
              variant="destructive"
              onClick={() => handleDelete(deleteCompany!.id)}
              disabled={deleteConfirm !== deleteCompany?.name}
            >
              Excluir
            </Button>
            <Button variant="outline" onClick={() => setDeleteModalOpen(false)}>Cancelar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
