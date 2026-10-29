import { Categories, Clients, Collections, Faq, HelpCTA, Hero, Heritage, ProjectsShowcase, Spotlight, Tailored } from "@/components/home/Home";
import { getActiveProducts, getCategories, getProjects } from "@/lib/data";
import { getLang } from "@/lib/lang";
import { hasImage } from "@/lib/assets";
import { resolveLooks } from "@/lib/looks";
import { ShopTheLook } from "@/components/home/ShopTheLook";

// Prefer AI-regenerated studio / lifestyle imagery when it exists.
function pick(...candidates: string[]) {
  for (const c of candidates) if (c && hasImage(c)) return c;
  return candidates[candidates.length - 1];
}

export default async function Home() {
  const [products, categories, projects, lang] = await Promise.all([getActiveProducts(), getCategories(), getProjects(), getLang()]);
  const ar = lang === "ar";
  const bySlug = (s: string) => products.find((p) => p.slug === s);
  const pickMany = (slugs: string[]) => slugs.map(bySlug).filter((p): p is NonNullable<typeof p> => !!p);

  const firstOf = (slug: string) => products.find((p) => p.category === slug)?.images[0] ?? "";
  const covers: Record<string, string> = Object.fromEntries(
    categories.map((c) => [c.slug, pick(`/images/lifestyle/${c.slug}.jpg`, firstOf(c.slug) || c.image)])
  );
  const counts: Record<string, number> = Object.fromEntries(categories.map((c) => [c.slug, products.filter((p) => p.category === c.slug).length]));

  const groups = [
    { id: "best", label: ar ? "الأكثر طلباً" : "Bestsellers", products: products.filter((p) => p.featured) },
    { id: "new", label: ar ? "وصل حديثاً" : "New in", products: [...products].sort((a, b) => Number(b.isNew) - Number(a.isNew) || b.createdAt.localeCompare(a.createdAt)) },
    { id: "living", label: ar ? "غرفة المعيشة" : "Living", products: products.filter((p) => p.category === "sofas" || p.category === "armchairs") },
    { id: "bedroom", label: ar ? "غرفة النوم" : "Bedroom", products: products.filter((p) => p.category === "beds" || p.category === "storage") },
  ].filter((g) => g.products.length > 0);

  return (
    <>
      <Hero image={pick("/images/lifestyle/hero.jpg", "/images/projects/vox-cinema-theatre-1.jpg")} look={bySlug("cloud-curve-sofa")} />
      <Categories categories={categories} covers={covers} counts={counts} />
      <ShopTheLook looks={resolveLooks(products).filter((l) => l.id !== "quiet")} />
      <Spotlight products={pickMany(["velluto-tufted-sofa", "blush-couture-bed", "live-edge-walnut-table", "wingback-chesterfield-chair", "ember-fireplace-wall"])} />
      <Collections groups={groups} />
      <Tailored products={pickMany(["cloud-curve-sofa", "chesterfield-heritage-sofa", "velluto-tufted-sofa"])} />
      <ProjectsShowcase projects={projects.filter((p) => p.featured)} />
      <Clients />
      <HelpCTA />
      <Heritage projectCount={projects.length} />
      <Faq />
    </>
  );
}
