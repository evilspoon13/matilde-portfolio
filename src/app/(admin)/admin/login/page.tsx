import LoginForm from "./LoginForm";

export const dynamic = "force-dynamic";

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string }>;
}) {
  const { next } = await searchParams;

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#f7f8fa] px-6">
      <div className="w-full max-w-sm">
        <p className="text-xs uppercase tracking-[0.25em] text-brand">Admin</p>
        <h1 className="mt-3 text-3xl font-medium tracking-tight">
          Matilde Crisp
        </h1>
        <LoginForm next={next ?? "/admin"} />
      </div>
    </div>
  );
}
