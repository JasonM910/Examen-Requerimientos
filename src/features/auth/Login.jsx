import { useState } from "react";
import { ArrowRight, Eye, EyeOff, Leaf, ShieldCheck } from "lucide-react";
import { Brand, Field } from "../../components/UI";

export default function Login({ onLogin }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [visible, setVisible] = useState(false);
  const [error, setError] = useState("");
  function submit(e) {
    e.preventDefault();
    if (
      email.toLowerCase() !== "oferente@demo.cr" ||
      password !== "Demo2026!"
    ) {
      setError(
        "El correo o la contraseña no coinciden con la cuenta de demostración.",
      );
      return;
    }
    sessionStorage.setItem("dieta-session", "oferente-demo");
    onLogin();
  }
  return (
    <main className="grid min-h-dvh bg-white lg:grid-cols-2">
      <section className="relative hidden min-h-screen flex-col overflow-hidden bg-forest p-12 lg:flex">
        <Brand light />
        <div className="relative z-10 my-auto max-w-lg py-16">
          <div className="mb-6 flex items-center gap-2 text-xs font-medium uppercase tracking-[2px] text-lime">
            <Leaf size={16} />
            Hecho con intención
          </div>
          <h1 className="text-[52px] font-medium leading-[1.12] tracking-[-2px] text-white">
            Tu pasión por cocinar.
            <br />
            <span className="text-lime">Un mundo de bienestar.</span>
          </h1>
          <p className="mt-7 max-w-sm text-sm leading-7 text-white/65">
            Conecta tus preparaciones con quienes más las necesitan. Nosotros te
            ayudamos a organizar el resto.
          </p>
          <div className="mt-9 overflow-hidden rounded-2xl">
            <img
              src="/images/salad.jpg"
              alt="Ensalada fresca con ingredientes de temporada"
              className="h-64 w-full object-cover"
            />
          </div>
        </div>
        <p className="relative z-10 text-[10px] text-white/50">
          Dieta Saludable · Un espacio para tu cocina
        </p>
        <div className="absolute -right-28 -top-28 size-96 rounded-full border border-white/10" />
        <div className="absolute -bottom-28 -left-20 size-96 rounded-full border border-white/10" />
      </section>
      <section className="flex flex-col justify-center px-6 py-12 sm:px-16">
        <div className="mx-auto w-full max-w-sm">
          <div className="mb-12 lg:hidden">
            <Brand />
          </div>
          <div className="mb-8">
            <div className="mb-4 text-[10px] font-semibold uppercase tracking-[2px] text-forest">
              ESPACIO DEL OFERENTE
            </div>
            <h2 className="text-[32px] font-semibold tracking-[-1px]">
              Qué bueno verte de nuevo
            </h2>
            <p className="muted mt-3">
              Ingresa a tu cuenta y sigue haciendo lo que te encanta.
            </p>
          </div>
          <form onSubmit={submit} className="space-y-5">
            <Field label="Correo electrónico">
              {(id) => (
                <input
                  id={id}
                  type="email"
                  autoComplete="username"
                  className="input"
                  placeholder="tu@negocio.cr"
                  required
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    setError("");
                  }}
                />
              )}
            </Field>
            <Field label="Contraseña">
              {(id) => (
                <div className="relative">
                  <input
                    id={id}
                    autoComplete="current-password"
                    type={visible ? "text" : "password"}
                    className="input pr-12"
                    placeholder="Ingresa tu contraseña"
                    required
                    value={password}
                    onChange={(e) => {
                      setPassword(e.target.value);
                      setError("");
                    }}
                  />
                  <button
                    type="button"
                    aria-label={
                      visible ? "Ocultar contraseña" : "Mostrar contraseña"
                    }
                    className="icon-btn absolute right-1 top-0.5"
                    onClick={() => setVisible(!visible)}
                  >
                    {visible ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              )}
            </Field>
            {error && (
              <p
                role="alert"
                className="rounded-lg bg-red-50 p-3 text-xs text-red-700"
              >
                {error}
              </p>
            )}
            <button className="btn btn-primary w-full" type="submit">
              Iniciar sesión <ArrowRight size={15} />
            </button>
          </form>
          <div className="mt-8 rounded-xl border border-[#e2e8d9] bg-[#f6f8f0] p-5">
            <div className="flex items-center gap-2 text-xs font-semibold text-forest">
              <ShieldCheck size={16} />
              Prueba el espacio de Alma Verde
            </div>
            <p className="mt-3 text-xs leading-6 text-muted">
              Correo:{" "}
              <span className="font-medium text-ink">oferente@demo.cr</span>
              <br />
              Contraseña:{" "}
              <span className="font-medium text-ink">Demo2026!</span>
            </p>
            <button
              type="button"
              className="mt-3 text-xs font-semibold text-forest hover:underline"
              onClick={() => {
                setEmail("oferente@demo.cr");
                setPassword("Demo2026!");
                setError("");
              }}
            >
              Completar datos de demostración
            </button>
          </div>
          <p className="mt-6 text-[10px] leading-relaxed text-muted">
            Acceso simulado y exclusivo del oferente. Los cambios se guardan
            localmente; no se almacenan contraseñas.
          </p>
        </div>
      </section>
    </main>
  );
}
