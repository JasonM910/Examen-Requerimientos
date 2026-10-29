import { useState } from "react";
import {
  Check,
  Eye,
  Leaf,
  Mail,
  MapPin,
  Phone,
  Plus,
  RotateCcw,
  ShieldCheck,
  X,
} from "lucide-react";
import { Badge, Field, Modal, PageTitle, PolicyBox } from "../../components/UI";
import { useStore } from "../../store/Store";
import { createSeed } from "../../data/seed";
import { money, TODAY } from "../../lib/domain";

const specialties = [
  "Vegana",
  "Sin gluten",
  "Baja en calorías",
  "Deportiva",
  "Keto",
  "Italiana",
];
export default function Profile() {
  const { state, update, notify } = useStore();
  const [draft, setDraft] = useState(() => structuredClone(state.profile));
  const [preview, setPreview] = useState(false);
  const [reset, setReset] = useState(false);
  const [canton, setCanton] = useState("San Carlos");
  const [district, setDistrict] = useState("");
  const [touched, setTouched] = useState({});
  const [error, setError] = useState("");
  const change = (key, value) => {
    setDraft((d) => ({ ...d, [key]: value }));
    setTouched((t) => ({ ...t, [key]: true }));
  };
  const errors = {
    name: draft.name.trim().length < 3 ? "Escribe al menos 3 caracteres." : "",
    owner: draft.owner.trim().length < 3 ? "Escribe el nombre completo." : "",
    email: /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(draft.email)
      ? ""
      : "Ingresa un correo válido.",
    phone: /^\+?[\d\s()-]{8,18}$/.test(draft.phone)
      ? ""
      : "Ingresa un teléfono válido (mínimo 8 dígitos).",
  };
  function save(e) {
    e.preventDefault();
    setTouched({ name: true, owner: true, email: true, phone: true });
    const peak = Math.max(
      0,
      ...Object.values(
        state.deliveries
          .filter((d) => d.date >= TODAY)
          .reduce(
            (counts, d) => ({ ...counts, [d.date]: (counts[d.date] || 0) + 1 }),
            {},
          ),
      ),
    );
    if (
      Object.values(errors).some(Boolean) ||
      !draft.specialties.length ||
      !draft.coverage.length ||
      !draft.terms.trim() ||
      !draft.description.trim()
    ) {
      setError(
        "Revisa la información. Agrega al menos una especialidad y una zona de cobertura.",
      );
      return;
    }
    if (
      !Number.isInteger(draft.capacity) ||
      draft.capacity < Math.max(1, peak)
    ) {
      setError(
        `Tu capacidad debe ser de al menos ${Math.max(1, peak)} preparaciones para respetar las entregas programadas.`,
      );
      return;
    }
    update((s) => ({
      ...s,
      profile: { ...draft, name: draft.name.trim(), owner: draft.owner.trim() },
    }));
    setError("");
    notify(
      "Tu perfil y tus políticas se guardaron. Se incluirán en las próximas cotizaciones.",
    );
  }
  function addCoverage() {
    if (!canton.trim() || !district.trim()) {
      setError("Escribe el cantón y el distrito para agregar una zona.");
      return;
    }
    const zone = `${canton.trim()} · ${district.trim()}`;
    if (
      !draft.coverage.some(
        (z) => z.toLocaleLowerCase() === zone.toLocaleLowerCase(),
      )
    )
      change("coverage", [...draft.coverage, zone]);
    setDistrict("");
    setError("");
  }
  return (
    <div className="page-enter">
      <PageTitle
        title="El corazón de tu negocio"
        description="Cuenta quién eres, dónde cocinas y las condiciones que cuidan tu trabajo."
        eyebrow="MI NEGOCIO / PERFIL"
      >
        <button className="btn" onClick={() => setPreview(true)}>
          <Eye size={15} />
          Ver perfil público
        </button>
        <button type="submit" form="profile-form" className="btn btn-primary">
          <Check size={15} />
          Guardar cambios
        </button>
      </PageTitle>
      <form
        id="profile-form"
        onSubmit={save}
        className="grid gap-6 xl:grid-cols-[1fr_320px]"
      >
        <div className="space-y-6">
          <section className="panel p-6">
            <div className="mb-6 flex items-center gap-4">
              <div className="flex size-14 items-center justify-center rounded-2xl bg-[#edf3e4] text-forest">
                <Leaf size={30} strokeWidth={1.5} />
              </div>
              <div>
                <h2 className="section-title">Información del negocio</h2>
                <p className="muted mt-1">
                  Tu presentación profesional en Dieta Saludable.
                </p>
              </div>
            </div>
            <div className="grid gap-5 sm:grid-cols-2">
              {[
                ["name", "Nombre del negocio", "text"],
                ["owner", "Nombre del responsable", "text"],
                ["email", "Correo de contacto público", "email"],
                ["phone", "Teléfono", "tel"],
              ].map(([key, label, type]) => (
                <Field key={key} label={label}>
                  {(id) => (
                    <>
                      <input
                        id={id}
                        type={type}
                        className={`input ${touched[key] && errors[key] ? "border-red-300" : ""}`}
                        required
                        maxLength={100}
                        value={draft[key]}
                        aria-invalid={Boolean(touched[key] && errors[key])}
                        onChange={(e) => change(key, e.target.value)}
                      />
                      {touched[key] && errors[key] && (
                        <p className="mt-1 text-[10px] text-red-600">
                          {errors[key]}
                        </p>
                      )}
                    </>
                  )}
                </Field>
              ))}
              <Field label="Descripción pública" className="sm:col-span-2">
                {(id) => (
                  <textarea
                    id={id}
                    className="input"
                    rows={4}
                    required
                    maxLength={700}
                    value={draft.description}
                    onChange={(e) => change("description", e.target.value)}
                  />
                )}
              </Field>
            </div>
          </section>
          <section className="panel p-6">
            <h2 className="section-title">
              Tu especialidad hace la diferencia
            </h2>
            <p className="muted mb-5 mt-2">
              Selecciona las opciones que representan tu cocina.
            </p>
            <div className="grid gap-3 sm:grid-cols-3">
              {specialties.map((s) => (
                <label
                  key={s}
                  className={`flex items-center gap-3 rounded-lg border p-3 text-xs ${draft.specialties.includes(s) ? "border-[#cdddbb] bg-[#f2f6eb] text-forest" : "border-line text-muted"}`}
                >
                  <input
                    type="checkbox"
                    checked={draft.specialties.includes(s)}
                    onChange={(e) =>
                      change(
                        "specialties",
                        e.target.checked
                          ? [...draft.specialties, s]
                          : draft.specialties.filter((v) => v !== s),
                      )
                    }
                  />
                  {s}
                </label>
              ))}
            </div>
          </section>
          <section className="panel p-6">
            <h2 className="section-title">Zonas donde llevas bienestar</h2>
            <p className="muted mb-5 mt-2">
              Cantones y distritos disponibles para entrega a domicilio.
            </p>
            <div className="mb-5 flex flex-wrap gap-2">
              {draft.coverage.map((z) => (
                <span
                  className="flex items-center gap-2 rounded-lg bg-[#f0f4e8] px-3 py-2 text-xs text-forest"
                  key={z}
                >
                  <MapPin size={12} />
                  {z}
                  <button
                    type="button"
                    aria-label={`Quitar zona ${z}`}
                    onClick={() =>
                      change(
                        "coverage",
                        draft.coverage.filter((v) => v !== z),
                      )
                    }
                  >
                    <X size={13} />
                  </button>
                </span>
              ))}
            </div>
            <div className="grid items-end gap-3 sm:grid-cols-[1fr_1fr_auto]">
              <Field label="Cantón">
                {(id) => (
                  <input
                    id={id}
                    className="input"
                    value={canton}
                    maxLength={60}
                    onChange={(e) => setCanton(e.target.value)}
                  />
                )}
              </Field>
              <Field label="Distrito">
                {(id) => (
                  <input
                    id={id}
                    className="input"
                    placeholder="Ej. Pital"
                    maxLength={60}
                    value={district}
                    onChange={(e) => setDistrict(e.target.value)}
                  />
                )}
              </Field>
              <button type="button" className="btn" onClick={addCoverage}>
                <Plus size={14} />
                Agregar zona
              </button>
            </div>
          </section>
          <section className="panel p-6">
            <div className="mb-5 flex items-center gap-2">
              <ShieldCheck size={18} className="text-[#8ba36c]" />
              <h2 className="section-title">
                Reglas claras, buenas relaciones
              </h2>
            </div>
            <Field label="Condiciones de servicio">
              {(id) => (
                <textarea
                  id={id}
                  required
                  className="input"
                  rows={4}
                  maxLength={1600}
                  value={draft.terms}
                  onChange={(e) => change("terms", e.target.value)}
                />
              )}
            </Field>
            <div className="mt-5 grid gap-4 sm:grid-cols-2">
              <Field label="Aviso para cancelaciones (horas)">
                {(id) => (
                  <input
                    id={id}
                    type="number"
                    min="1"
                    max="720"
                    required
                    className="input"
                    value={draft.cancellationHours}
                    onChange={(e) =>
                      change("cancellationHours", Number(e.target.value))
                    }
                  />
                )}
              </Field>
              <Field label="Aviso para modificaciones (horas)">
                {(id) => (
                  <input
                    id={id}
                    type="number"
                    min="1"
                    max="720"
                    required
                    className="input"
                    value={draft.changeHours}
                    onChange={(e) =>
                      change("changeHours", Number(e.target.value))
                    }
                  />
                )}
              </Field>
            </div>
            <p className="muted mt-4">
              Estas condiciones se incorporan automáticamente al enviar una
              cotización. Las propuestas anteriores conservan las políticas
              vigentes al momento de su envío.
            </p>
          </section>
        </div>
        <aside className="space-y-5">
          <section className="panel p-6">
            <h2 className="section-title">Tu capacidad, a tu ritmo</h2>
            <p className="muted mb-5 mt-2">
              Límite de preparaciones que puedes atender por día.
            </p>
            <Field label="Preparaciones diarias">
              {(id) => (
                <input
                  id={id}
                  type="number"
                  min="1"
                  max="500"
                  required
                  className="input"
                  value={draft.capacity}
                  onChange={(e) => change("capacity", Number(e.target.value))}
                />
              )}
            </Field>
            <div className="mt-4 rounded-lg bg-canvas p-3 text-[11px] leading-5 text-muted">
              Al aceptar un plan se revisa cada fecha. Si no hay cupo, el
              acuerdo no se programa.
            </div>
          </section>
          <section className="panel p-6">
            <h2 className="section-title">Tu presencia</h2>
            <div className="mt-4">
              <Badge>{state.profile.state}</Badge>
            </div>
            <p className="muted mt-3">
              Perfil profesional de {state.profile.name} para la vista del
              oferente.
            </p>
            <button
              type="button"
              className="btn mt-4 w-full"
              onClick={() => setPreview(true)}
            >
              <Eye size={14} />
              Vista previa pública
            </button>
          </section>
          <section className="rounded-xl border border-dashed border-[#d9dfd0] p-5">
            <h3 className="text-xs font-medium">Datos de demostración</h3>
            <p className="mt-2 text-[10px] leading-5 text-muted">
              Restablece el catálogo, los planes y las entregas del ejemplo para
              repetir tus recorridos.
            </p>
            <button
              type="button"
              className="mt-3 flex items-center gap-2 text-[11px] text-forest"
              onClick={() => setReset(true)}
            >
              <RotateCcw size={13} />
              Reiniciar demostración
            </button>
          </section>
        </aside>
        {error && (
          <p
            role="alert"
            className="rounded-lg bg-red-50 p-4 text-xs text-red-700 xl:col-span-2"
          >
            {error}
          </p>
        )}
        <div className="flex justify-end xl:col-span-2">
          <button type="submit" className="btn btn-primary">
            <Check size={14} />
            Guardar cambios
          </button>
        </div>
      </form>
      {preview && (
        <Modal
          wide
          title="Vista previa de tu perfil público"
          subtitle="Así se ve la información guardada de tu negocio"
          onClose={() => setPreview(false)}
        >
          <div className="relative mb-6 h-44 overflow-hidden rounded-xl">
            <img
              src="/images/salad.jpg"
              alt="Cocina saludable de Alma Verde"
              className="size-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-forest/90 to-transparent" />
            <div className="absolute bottom-6 left-6">
              <h3 className="text-3xl font-semibold tracking-tight text-white">
                {state.profile.name}
              </h3>
              <span className="mt-2 block text-xs text-lime">
                Alimentación que se adapta a ti
              </span>
            </div>
          </div>
          <p className="mb-5 text-sm leading-7 text-muted">
            {state.profile.description}
          </p>
          <div className="mb-5 flex flex-wrap gap-2">
            {state.profile.specialties.map((s) => (
              <Badge key={s}>{s}</Badge>
            ))}
          </div>
          <div className="mb-6 flex flex-wrap gap-5 text-xs text-muted">
            <span className="flex items-center gap-2">
              <Mail size={14} />
              {state.profile.email}
            </span>
            <span className="flex items-center gap-2">
              <Phone size={14} />
              {state.profile.phone}
            </span>
            <span className="flex items-center gap-2">
              <MapPin size={14} />
              {state.profile.coverage.join(" / ")}
            </span>
          </div>
          <h3 className="section-title mb-4">Un vistazo a nuestro menú</h3>
          <div className="mb-6 grid grid-cols-2 gap-4 sm:grid-cols-3">
            {state.preparations
              .filter((p) => p.state === "Activo")
              .map((p) => (
                <div
                  key={p.id}
                  className="overflow-hidden rounded-lg border border-line"
                >
                  <img
                    src={p.image}
                    alt={p.title}
                    className="h-28 w-full object-cover"
                  />
                  <div className="p-3">
                    <p className="text-xs font-medium">{p.title}</p>
                    <p className="mt-2 text-[11px] text-forest">
                      Desde {money(p.price)}
                    </p>
                  </div>
                </div>
              ))}
          </div>
          <PolicyBox policies={state.profile} />
        </Modal>
      )}
      {reset && (
        <Modal
          title="Reiniciar la demostración"
          onClose={() => setReset(false)}
        >
          <p className="text-sm leading-6 text-muted">
            Se reemplazarán los cambios locales por los datos iniciales de Alma
            Verde. Las capturas guardadas en el proyecto se conservarán.
          </p>
          <div className="mt-6 flex justify-end gap-3">
            <button className="btn" onClick={() => setReset(false)}>
              Cancelar
            </button>
            <button
              className="btn btn-danger"
              onClick={() => {
                const seed = createSeed();
                update(seed);
                setDraft(seed.profile);
                setReset(false);
                notify("Demostración restablecida.");
              }}
            >
              Restablecer datos
            </button>
          </div>
        </Modal>
      )}
    </div>
  );
}
