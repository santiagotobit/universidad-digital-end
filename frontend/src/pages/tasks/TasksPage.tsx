import { useCallback, useState } from "react";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { DashboardLayout } from "../../layouts/DashboardLayout";
import { Button } from "../../components/Button";
import { Input } from "../../components/Input";
import { Alert } from "../../components/Alert";
import { Spinner } from "../../components/Spinner";
import { tasksService } from "../../services/tasksService";
import { useFetch } from "../../hooks/useFetch";
import { getErrorMessage } from "../../utils/apiError";
import type { Task, TaskCreate, TaskUpdate } from "../../api/tasks";

// const taskSchema = z.object({
//   title: z.string().min(1, "Título requerido"),
//   description: z.string().optional(),
//   due_date: z
//     .string()
//     .optional()
//     .transform((value) => (value === "" ? undefined : value))
//     .refine((value) => !value || /^\d{4}-\d{2}-\d{2}$/.test(value), "Formato de fecha inválido"),
//   priority: z.enum(["low", "medium", "high"]).default("medium"),
//   status: z.enum(["pending", "completed"]).optional(),
// });

const getTodayDateString = () => {
  const today = new Date();
  today.setMinutes(today.getMinutes() - today.getTimezoneOffset());
  return today.toISOString().split("T")[0];
};

const taskSchema = z.object({
  title: z.string().min(1, "Título requerido"),
  description: z.string().optional(),
  priority: z.enum(["low", "medium", "high"]).default("medium"),
  due_date: z
    .string()
    .optional()
    .refine((value) => !value || value >= getTodayDateString(), {
      message: "La fecha límite no puede ser anterior a hoy",
    }),
  status: z.enum(["pending", "completed"]).optional(),
});

type TaskForm = z.infer<typeof taskSchema>;

export function TasksPage() {
  const minDueDate = getTodayDateString();
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [taskBeingEdited, setTaskBeingEdited] = useState<Task | null>(null);
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState<string>("");
  const [alert, setAlert] = useState<{ message: string; type: "success" | "error" } | null>(null);
  const fetchTasks = useCallback(
    () => tasksService.list({ search: search || undefined, status: filterStatus || undefined }),
    [search, filterStatus]
  );
  const { data: tasks, error, isLoading, reload } = useFetch(fetchTasks, [search, filterStatus]);

  const form = useForm<TaskForm>({
    resolver: zodResolver(taskSchema),
    // defaultValues: { title: "", description: "", due_date: "", priority: "medium", status: "pending" },
      defaultValues: { title: "", description: "", priority: "medium", due_date: "" },
  });

  const handleSubmitTask = async (values: TaskForm) => {
    try {
      const due_date = values.due_date ? values.due_date : null;
      if (taskBeingEdited) {
        const payload: TaskUpdate = {
          title: values.title,
          description: values.description || null,
          due_date,
          priority: values.priority,
          status: values.status,
        };
        await tasksService.update(taskBeingEdited.id, payload);
        setAlert({ message: "Tarea actualizada correctamente.", type: "success" });
      } else {
        const payload: TaskCreate = {
          title: values.title,
          description: values.description || null,
          due_date,
          priority: values.priority,
        };
        await tasksService.create(payload);
        setAlert({ message: "Tarea creada correctamente.", type: "success" });
      }
      form.reset();
      setModalOpen(false);
      setTaskBeingEdited(null);
      await reload();
    } catch (err) {
      form.setError("root", { message: getErrorMessage(err) });
    }
  };

  const handleTaskClick = (task: Task) => {
    setSelectedTask(task);
  };

  const handleEditTask = (task: Task) => {
    setTaskBeingEdited(task);
    setModalOpen(true);
    form.reset({
      title: task.title,
      description: task.description ?? "",
      due_date: task.due_date ?? "",
      priority: task.priority as "low" | "medium" | "high",
      status: task.status as "pending" | "completed",
    });
  };

  const handleDeleteTask = async (task: Task) => {
    const confirmed = window.confirm(`¿Seguro que deseas eliminar la tarea "${task.title}"?`);
    if (!confirmed) {
      return;
    }

    try {
      await tasksService.remove(task.id);
      setAlert({ message: "Tarea eliminada correctamente.", type: "success" });
      if (selectedTask?.id === task.id) {
        setSelectedTask(null);
      }
      await reload();
    } catch (err) {
      setAlert({ message: getErrorMessage(err), type: "error" });
    }
  };

  return (
    <DashboardLayout>
      <div data-testid="dashboard" className="page-header">
        <h1 className="page-title">📋 Mis Tareas</h1>
        <p className="page-subtitle">Gestiona tus tareas</p>
      </div>

      <div className="card">
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1rem" }}>
          <h2>Tareas</h2>
          <Button
            data-testid="create-button"
            onClick={() => {
              setSelectedTask(null);
              setTaskBeingEdited(null);
              setAlert(null);
              form.reset();
              setModalOpen(true);
            }}
          >
            + Nueva tarea
          </Button>
        </div>

        {alert ? <Alert type={alert.type} message={alert.message} /> : null}

        {error && (
          <div>
            <Alert type="error" message={error} />
            <Button
              variant="secondary"
              data-testid="retry-button"
              onClick={() => reload()}
              style={{ marginTop: "0.5rem" }}
            >
              Reintentar
            </Button>
          </div>
        )}

        {isLoading && (
          <div data-testid="loading-spinner">
            <Spinner size="large" />
          </div>
        )}

        {!isLoading && !error && (
          <div data-testid="tasks-container">
            <div style={{ marginBottom: "1rem", display: "flex", gap: 12 }}>
              <input
                type="text"
                placeholder="Buscar tareas..."
                data-testid="search-tasks"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="input"
                style={{ flex: 1 }}
              />
              <select
                data-testid="filter-status"
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="input"
              >
                <option value="">Todos</option>
                <option value="pending">Pendiente</option>
                <option value="completed">Completada</option>
              </select>
            </div>
            {tasks && tasks.length > 0 ? (
              <ul data-testid="task-list" className="list" style={{ listStyle: "none", padding: 0 }}>
                {tasks.map((task) => (
                  <li
                    key={task.id}
                    data-testid="task-item"
                    onClick={() => handleTaskClick(task)}
                    style={{
                      padding: "12px 16px",
                      marginBottom: 8,
                      border: "1px solid var(--border-light)",
                      borderRadius: 8,
                      cursor: "pointer",
                      background: selectedTask?.id === task.id ? "var(--bg-light)" : undefined,
                    }}
                  >
                    <strong>{task.title}</strong>
                    {task.description && <p style={{ margin: "4px 0 0", fontSize: "0.9rem", color: "#666" }}>{task.description}</p>}
                    <span style={{ fontSize: "0.85rem", color: "#888" }}>
                      {task.priority} · {task.status}{task.due_date ? ` · Vence ${task.due_date}` : ""}
                    </span>
                    <div style={{ display: "flex", gap: 8, marginTop: 8 }}>
                      <Button
                        variant="secondary"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleEditTask(task);
                        }}
                      >
                        Editar
                      </Button>
                      <Button
                        variant="danger"
                        onClick={(e) => {
                          e.stopPropagation();
                          void handleDeleteTask(task);
                        }}
                      >
                        Eliminar
                      </Button>
                    </div>
                  </li>
                ))}
              </ul>
            ) : (
              <div data-testid="empty-state">
                <p>No hay tareas. Crea una nueva para empezar.</p>
              </div>
            )}
          </div>
        )}

        {selectedTask && (
          <div data-testid="task-detail" style={{ marginTop: "1rem", padding: "1rem", background: "var(--bg-light)", borderRadius: 8 }}>
            <h3>{selectedTask.title}</h3>
            <p>{selectedTask.description || "Sin descripción"}</p>
            <p>Prioridad: {selectedTask.priority} | Estado: {selectedTask.status}</p>
            <p>Fecha límite: {selectedTask.due_date ?? "Sin fecha"}</p>
          </div>
        )}
      </div>

      {modalOpen && (
        <div
          className="modal-overlay"
          onClick={() => {
            setModalOpen(false);
            setTaskBeingEdited(null);
          }}
        >
          <div className="modal" data-testid="task-creation-modal" role="dialog" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>{taskBeingEdited ? "Editar tarea" : "Nueva tarea"}</h2>
              <button
                type="button"
                aria-label="Close"
                className="modal-close"
                onClick={() => {
                  setModalOpen(false);
                  setTaskBeingEdited(null);
                }}
              >
                ✕
              </button>
            </div>
            <form onSubmit={form.handleSubmit(handleSubmitTask)}>
              <div className="modal-content">
                {form.formState.errors.root && (
                  <div data-testid="form-error" style={{ color: "var(--error)", marginBottom: 8 }}>
                    {form.formState.errors.root.message}
                  </div>
                )}
                <Input
                  label="Título"
                  {...form.register("title")}
                  error={form.formState.errors.title?.message}
                />
                <label style={{ display: "block", marginTop: 12 }}>
                  Descripción
                  <textarea
                    {...form.register("description")}
                    name="description"
                    rows={3}
                    className="input"
                    style={{ width: "100%", marginTop: 4 }}
                  />
                </label>
                <label style={{ display: "block", marginTop: 12 }}>
                  Fecha límite
                  <input
                    type="date"
                    {...form.register("due_date")}
                    name="due_date"
                    min={minDueDate}
                    className="input"
                    style={{ width: "100%", marginTop: 4 }}
                  />
                </label>
                <label style={{ display: "block", marginTop: 12 }}>
                  Prioridad
                  <select {...form.register("priority")} name="priority" className="input" style={{ width: "100%", marginTop: 4 }}>
                    <option value="low">Baja</option>
                    <option value="medium">Media</option>
                    <option value="high">Alta</option>
                  </select>
                </label>
                {taskBeingEdited && (
                  <label style={{ display: "block", marginTop: 12 }}>
                    Estado
                    <select {...form.register("status")} name="status" className="input" style={{ width: "100%", marginTop: 4 }}>
                      <option value="pending">Pendiente</option>
                      <option value="completed">Completada</option>
                    </select>
                  </label>
                )}
              </div>
              <div className="modal-footer">
                <Button
                  type="button"
                  variant="secondary"
                  data-testid="cancel-button"
                  onClick={() => {
                    setModalOpen(false);
                    setTaskBeingEdited(null);
                  }}
                >
                  Cancelar
                </Button>
                <Button
                  type="submit"
                  data-testid="submit-task-button"
                  disabled={form.formState.isSubmitting}
                >
                  {form.formState.isSubmitting ? "Guardando..." : taskBeingEdited ? "Actualizar" : "Crear"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}
