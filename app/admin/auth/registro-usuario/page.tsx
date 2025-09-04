import ManualFormCreateUser from "./components/ManualFormCreatUser";

export default function RegisterPage() {

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-muted/40 p-4">
      <div className="flex flex-col items-center justify-center"></div>
      <div className="my-5 flex w-auto flex-col items-center justify-center gap-4 rounded-xl p-3 lg:w-[800px] xl:w-[1000px] xl:p-10">
        <h1 className="text-center text-4xl font-bold text-schoMetricsBaseColor">
          Carga Manual de Nuevos Usuario
        </h1>
        <p className="text-balance text-center text-xl text-schoMetricsBaseColor">
          Crea nuevos Usuarios de manera individual para SchoMetrics.
        </p>
        <ManualFormCreateUser />
      </div>
    </div>
  );
}
