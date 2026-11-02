import { Button } from "@/components/ui/Button";

export default function ProfilPage() {
  return (
    <div className="mx-auto max-w-lg">
      <h1 className="mb-6 text-2xl font-extrabold text-brand-950">Mon profil</h1>
      <form className="space-y-4 rounded-[14px] bg-white p-6 shadow-soft">
        <div>
          <label className="mb-1 block text-xs font-semibold">Prénom</label>
          <input
            defaultValue="Ahmed"
            className="w-full rounded-xl border border-brand-100 px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-brand-500"
          />
        </div>
        <div>
          <label className="mb-1 block text-xs font-semibold">Nom</label>
          <input
            defaultValue="Alaoui"
            className="w-full rounded-xl border border-brand-100 px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-brand-500"
          />
        </div>
        <div>
          <label className="mb-1 block text-xs font-semibold">Email</label>
          <input
            defaultValue="ahmed@email.com"
            className="w-full rounded-xl border border-brand-100 px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-brand-500"
          />
        </div>
        <Button type="submit" variant="primary" className="w-full">
          Enregistrer
        </Button>
      </form>
    </div>
  );
}
