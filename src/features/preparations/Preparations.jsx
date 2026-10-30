import { useState } from "react";
import {
  ArrowLeftRight,
  Check,
  Flame,
  Leaf,
  Pencil,
  Plus,
  Search,
  Trash2,
  X,
} from "lucide-react";
import { Badge, Empty, Field, Modal, PageTitle } from "../../components/UI";
import { useStore } from "../../store/Store";
import { money, toCents } from "../../lib/domain";

const categories = [
  "Vegana",
  "Sin gluten",
  "Baja en calorías",
  "Deportiva",
  "Keto",
  "Italiana",
];
const blank = () => ({
  title: "",
  description: "",
  category: "Vegana",
  calories: 0,
  protein: 0,
  carbs: 0,
  fat: 0,
  price: 0,
  image: "/images/bowl.jpg",
  state: "Activo",
  ingredients: [
    { name: "", exclude: false, substitute: false, alternative: "" },
  ],
});
export default function Preparations({ itemId }) {
  const { state, update, notify } = useStore();
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("Todas");
  const [status, setStatus] = useState("Todas");
  const [editing, setEditing] = useState(
    itemId === "nueva"
      ? blank()
      : state.preparations.find((p) => p.id === itemId) || null,
  );
  const [toggle, setToggle] = useState(null);
  const preparations = state.preparations.filter(
    (p) =>
      p.title.toLocaleLowerCase().includes(search.toLocaleLowerCase()) &&
      (category === "Todas" || p.category === category) &&
      (status === "Todas" || p.state === status),
  );
  async function save(value) {
    const exists = Boolean(value.id);
    const saved = await update((s) => ({
      ...s,
      preparations: exists
        ? s.preparations.map((p) => (p.id === value.id ? value : p))
        : [
            ...s.preparations,
            { ...value, id: `P-${Date.now().toString().slice(-7)}` },
          ],
    }));
    if (!saved) return;
    setEditing(null);
    notify(
      exists
        ? "Preparación actualizada. El historial conserva sus datos originales."
        : "Nueva preparación publicada en tu catálogo.",
    );
  }
  async function toggleState() {
    const saved = await update((s) => ({
      ...s,
      preparations: s.preparations.map((p) =>
        p.id === toggle.id
          ? { ...p, state: p.state === "Activo" ? "Inactivo" : "Activo" }
          : p,
      ),
    }));
    if (!saved) return;
    notify(
      toggle.state === "Activo"
        ? "Preparación dada de baja. Su historial se conserva."
        : "Preparación reactivada.",
    );
    setToggle(null);
  }
  return (
    <div className="page-enter">
      <PageTitle
        title="Preparaciones con tu sello"
        description="Tu catálogo de platos base, con espacio para cada necesidad."
        eyebrow="MI NEGOCIO / CATÁLOGO"
      >
        <button className="btn btn-primary" onClick={() => setEditing(blank())}>
          <Plus size={15} />
          Nueva preparación
        </button>
      </PageTitle>
      <div className="mb-6 flex flex-wrap items-center gap-3">
        <div className="relative min-w-52 flex-1">
          <Search size={16} className="absolute left-3 top-3 text-muted" />
          <input
            aria-label="Buscar preparación"
            className="input pl-10"
            placeholder="Buscar una preparación..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <select
          aria-label="Filtrar categoría"
          className="input w-auto"
          value={category}
          onChange={(e) => setCategory(e.target.value)}
        >
          <option value="Todas">Todas las categorías</option>
          {categories.map((c) => (
            <option key={c}>{c}</option>
          ))}
        </select>
        <select
          aria-label="Filtrar estado de preparación"
          className="input w-auto"
          value={status}
          onChange={(e) => setStatus(e.target.value)}
        >
          <option value="Todas">Todos los estados</option>
          <option>Activo</option>
          <option>Inactivo</option>
        </select>
      </div>
      <div className="mb-4 flex items-center justify-between text-[11px] text-muted">
        <span>{preparations.length} preparaciones en tu catálogo</span>
        <span className="flex items-center gap-1.5">
          <ArrowLeftRight size={13} />
          Pensadas para personalizar
        </span>
      </div>
      <div className="grid gap-5 md:grid-cols-2 2xl:grid-cols-3">
        {preparations.map((p) => (
          <article
            key={p.id}
            className={`panel overflow-hidden ${p.state === "Inactivo" ? "opacity-70" : ""}`}
          >
            <div className="relative">
              <img
                src={p.image}
                alt={p.title}
                className="h-48 w-full object-cover"
              />
              <div className="absolute left-4 top-4">
                <span className="rounded-md bg-white/95 px-2.5 py-1.5 text-[10px] font-medium text-forest">
                  {p.category}
                </span>
              </div>
              <div className="absolute right-4 top-4">
                <Badge>{p.state}</Badge>
              </div>
            </div>
            <div className="p-5">
              <div className="mb-2 flex items-start justify-between gap-3">
                <h2 className="section-title">{p.title}</h2>
                <span className="shrink-0 text-sm font-semibold text-forest">
                  {money(p.price)}
                </span>
              </div>
              <p className="min-h-10 text-xs leading-relaxed text-muted">
                {p.description}
              </p>
              <div className="my-4 flex items-center gap-4 border-y border-line py-3 text-[10px] text-muted">
                <span className="flex items-center gap-1">
                  <Flame size={12} className="text-[#b39a6c]" />
                  {p.calories} kcal
                </span>
                <span>{p.protein} g proteína</span>
                <span>{p.carbs} g carb.</span>
              </div>
              <div className="mb-4 flex flex-wrap gap-2">
                <span className="tag bg-[#f1f5e9] text-forest">
                  <Check size={11} />
                  {p.ingredients.filter((i) => i.exclude).length} ingredientes
                  excluibles
                </span>
                <span className="tag bg-[#f4f2e9] text-[#9a8b5c]">
                  <ArrowLeftRight size={11} />
                  {p.ingredients.filter((i) => i.substitute).length}{" "}
                  sustituibles
                </span>
              </div>
              <div className="flex gap-2">
                <button
                  className="btn flex-1"
                  onClick={() => setEditing(structuredClone(p))}
                >
                  <Pencil size={13} />
                  Ver y editar
                </button>
                <button
                  className="btn px-3"
                  aria-label={`${p.state === "Activo" ? "Dar de baja" : "Reactivar"} ${p.title}`}
                  onClick={() => setToggle(p)}
                >
                  {p.state === "Activo" ? (
                    <Trash2 size={14} />
                  ) : (
                    <Leaf size={14} />
                  )}
                </button>
              </div>
            </div>
          </article>
        ))}
      </div>
      {!preparations.length && (
        <div className="panel">
          <Empty />
        </div>
      )}
      {editing && (
        <Editor
          preparation={editing}
          onClose={() => setEditing(null)}
          onSave={save}
        />
      )}
      {toggle && (
        <Modal
          title={
            toggle.state === "Activo"
              ? "Dar de baja la preparación"
              : "Reactivar preparación"
          }
          onClose={() => setToggle(null)}
        >
          <p className="text-sm leading-6">{toggle.title}</p>
          <p className="muted mt-3">
            {toggle.state === "Activo"
              ? "Dejará de estar disponible para nuevas cotizaciones. Las solicitudes, cotizaciones y entregas anteriores conservarán su información."
              : "Volverá a estar disponible para nuevas cotizaciones."}
          </p>
          <div className="mt-6 flex justify-end gap-3">
            <button className="btn" onClick={() => setToggle(null)}>
              Volver
            </button>
            <button
              className={`btn ${toggle.state === "Activo" ? "btn-danger" : "btn-primary"}`}
              onClick={toggleState}
            >
              {toggle.state === "Activo" ? "Confirmar baja" : "Reactivar"}
            </button>
          </div>
        </Modal>
      )}
    </div>
  );
}
function Editor({ preparation, onClose, onSave }) {
  const [draft, setDraft] = useState(() => structuredClone(preparation));
  const [price, setPrice] = useState(String(preparation.price / 100));
  const [error, setError] = useState("");
  const change = (key, value) => setDraft((d) => ({ ...d, [key]: value }));
  const ingredient = (index, key, value) =>
    setDraft((d) => ({
      ...d,
      ingredients: d.ingredients.map((ing, i) =>
        i === index ? { ...ing, [key]: value } : ing,
      ),
    }));
  function submit(e) {
    e.preventDefault();
    const cents = toCents(price);
    if (
      !draft.title.trim() ||
      !draft.description.trim() ||
      !draft.ingredients.length ||
      draft.ingredients.some(
        (i) => !i.name.trim() || (i.substitute && !i.alternative.trim()),
      ) ||
      !Number.isFinite(cents) ||
      cents <= 0
    ) {
      setError(
        "Completa la información, el precio y las alternativas de cada ingrediente sustituible.",
      );
      return;
    }
    onSave({
      ...draft,
      title: draft.title.trim(),
      description: draft.description.trim(),
      price: cents,
      ingredients: draft.ingredients.map((i) => ({
        ...i,
        name: i.name.trim(),
        alternative: i.substitute ? i.alternative.trim() : "",
      })),
    });
  }
  return (
    <Modal
      wide
      title={
        draft.id
          ? "Tu preparación, a tu manera"
          : "Una nueva idea para tu catálogo"
      }
      subtitle="Información del plato e ingredientes personalizables"
      onClose={onClose}
    >
      <form onSubmit={submit}>
        <div className="grid gap-6 lg:grid-cols-[220px_1fr]">
          <div>
            <img
              src={draft.image}
              alt="Vista de la preparación"
              className="mb-4 h-44 w-full rounded-xl object-cover"
            />
            <Field label="Fotografía del catálogo">
              {(id) => (
                <select
                  id={id}
                  className="input"
                  value={draft.image}
                  onChange={(e) => change("image", e.target.value)}
                >
                  {[
                    ["bowl", "Bowl de vegetales"],
                    ["salad", "Ensalada"],
                    ["chicken", "Pollo y vegetales"],
                    ["salmon", "Salmón"],
                    ["pasta", "Pasta"],
                    ["oats", "Avena"],
                  ].map(([key, label]) => (
                    <option key={key} value={`/images/${key}.jpg`}>
                      {label}
                    </option>
                  ))}
                </select>
              )}
            </Field>
            <p className="mt-3 text-[10px] leading-5 text-muted">
              Selecciona una imagen de demostración para tu preparación.
            </p>
          </div>
          <div className="space-y-4">
            <Field label="Título de la preparación">
              {(id) => (
                <input
                  id={id}
                  className="input"
                  required
                  maxLength={90}
                  value={draft.title}
                  onChange={(e) => change("title", e.target.value)}
                />
              )}
            </Field>
            <Field label="Descripción">
              {(id) => (
                <textarea
                  id={id}
                  rows={3}
                  className="input resize-y"
                  required
                  maxLength={600}
                  value={draft.description}
                  onChange={(e) => change("description", e.target.value)}
                />
              )}
            </Field>
            <div className="grid grid-cols-2 gap-4">
              <Field label="Categoría">
                {(id) => (
                  <select
                    id={id}
                    className="input"
                    value={draft.category}
                    onChange={(e) => change("category", e.target.value)}
                  >
                    {categories.map((c) => (
                      <option key={c}>{c}</option>
                    ))}
                  </select>
                )}
              </Field>
              <Field label="Precio base (CRC)">
                {(id) => (
                  <input
                    id={id}
                    type="number"
                    min="0.01"
                    max="1000000"
                    step="0.01"
                    className="input"
                    required
                    value={price}
                    onChange={(e) => setPrice(e.target.value)}
                  />
                )}
              </Field>
            </div>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
              {[
                ["calories", "Energía (kcal)"],
                ["protein", "Proteína (g)"],
                ["carbs", "Carbohidratos (g)"],
                ["fat", "Grasas (g)"],
              ].map(([key, label]) => (
                <Field key={key} label={label}>
                  {(id) => (
                    <input
                      id={id}
                      type="number"
                      min="0"
                      max="5000"
                      className="input"
                      required
                      value={draft[key]}
                      onChange={(e) =>
                        change(
                          key,
                          e.target.value === "" ? "" : Number(e.target.value),
                        )
                      }
                    />
                  )}
                </Field>
              ))}
            </div>
            <p className="text-[10px] text-muted">
              Valores nutricionales preliminares por porción.
            </p>
          </div>
        </div>
        <div className="mb-4 mt-7 flex items-center justify-between gap-3">
          <div>
            <h3 className="section-title">Ingredientes y posibilidades</h3>
            <p className="muted mt-1">
              Define qué puede cambiar para adaptarse a cada persona.
            </p>
          </div>
          <button
            type="button"
            className="btn btn-soft shrink-0"
            onClick={() =>
              change("ingredients", [
                ...draft.ingredients,
                {
                  name: "",
                  exclude: false,
                  substitute: false,
                  alternative: "",
                },
              ])
            }
          >
            <Plus size={13} />
            Agregar
          </button>
        </div>
        <div className="space-y-3">
          {draft.ingredients.map((ing, index) => (
            <div
              key={index}
              className="grid items-end gap-3 rounded-xl border border-line bg-[#fafbf7] p-4 sm:grid-cols-[minmax(130px,1fr)_auto_auto_minmax(120px,1fr)_auto]"
            >
              <Field label={`Ingrediente ${index + 1}`}>
                {(id) => (
                  <input
                    id={id}
                    required
                    className="input"
                    value={ing.name}
                    onChange={(e) => ingredient(index, "name", e.target.value)}
                  />
                )}
              </Field>
              <label className="flex items-center gap-2 pb-3 text-[11px]">
                <input
                  type="checkbox"
                  checked={ing.exclude}
                  onChange={(e) =>
                    ingredient(index, "exclude", e.target.checked)
                  }
                  aria-label={`Excluir ingrediente ${index + 1}`}
                />
                Excluir
              </label>
              <label className="flex items-center gap-2 pb-3 text-[11px]">
                <input
                  type="checkbox"
                  checked={ing.substitute}
                  onChange={(e) =>
                    ingredient(index, "substitute", e.target.checked)
                  }
                  aria-label={`Sustituir ingrediente ${index + 1}`}
                />
                Sustituir
              </label>
              <Field label="Alternativa permitida">
                {(id) => (
                  <input
                    id={id}
                    className="input disabled:bg-[#f0f1eb]"
                    disabled={!ing.substitute}
                    required={ing.substitute}
                    placeholder={
                      ing.substitute ? "Ej. Arroz integral" : "No aplica"
                    }
                    value={ing.alternative}
                    onChange={(e) =>
                      ingredient(index, "alternative", e.target.value)
                    }
                  />
                )}
              </Field>
              <button
                type="button"
                className="icon-btn mb-0.5"
                disabled={draft.ingredients.length === 1}
                aria-label={`Quitar ingrediente ${index + 1}`}
                onClick={() =>
                  change(
                    "ingredients",
                    draft.ingredients.filter((_, i) => i !== index),
                  )
                }
              >
                <X size={15} />
              </button>
            </div>
          ))}
        </div>
        {error && (
          <p role="alert" className="mt-4 text-xs text-red-600">
            {error}
          </p>
        )}
        <div className="mt-6 flex flex-wrap items-center justify-between gap-4 border-t border-line pt-5">
          <span className="text-[10px] text-muted">
            Los cambios conservan la información histórica de los planes.
          </span>
          <div className="flex gap-3">
            <button type="button" className="btn" onClick={onClose}>
              Cancelar
            </button>
            <button type="submit" className="btn btn-primary">
              <Check size={14} />
              Guardar preparación
            </button>
          </div>
        </div>
      </form>
    </Modal>
  );
}
