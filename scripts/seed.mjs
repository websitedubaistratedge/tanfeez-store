// Builds data/seed.json from the TANFEEZ company profile content.
// Run: npm run seed   (then delete data/db.json to reset the live demo DB)
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const projectImages = JSON.parse(fs.readFileSync(path.join(root, "scripts/project-images.json"), "utf8"));
const P = (f) => `/images/products/${f}.jpg`;
const now = new Date("2026-10-01T09:00:00Z");
const daysAgo = (d, h = 10) => new Date(now.getTime() - d * 864e5 + h * 36e5).toISOString();

// ───────────────────────── Categories ─────────────────────────
const categories = [
  { slug: "sofas", name: { en: "Sofas & Lounge", ar: "الكنب والجلسات" }, blurb: { en: "Hand-upholstered sofas built in our Dubai workshop.", ar: "كنب منجّد يدوياً في ورشتنا بدبي." }, image: P("p32_7") },
  { slug: "armchairs", name: { en: "Armchairs", ar: "الكراسي المنفردة" }, blurb: { en: "Statement chairs in leather, velvet and solid wood.", ar: "كراسٍ مميزة من الجلد والمخمل والخشب الطبيعي." }, image: P("p32_6") },
  { slug: "beds", name: { en: "Beds & Bedroom", ar: "الأسرّة وغرف النوم" }, blurb: { en: "Upholstered headboards, platform beds and storage beds.", ar: "ألواح رأس منجّدة وأسرّة منصّة وأسرّة بتخزين." }, image: P("p34_1") },
  { slug: "media", name: { en: "TV & Media Walls", ar: "وحدات التلفاز والجدران" }, blurb: { en: "Feature walls, media units and fireplaces.", ar: "جدران مميزة ووحدات تلفاز ومدافئ." }, image: P("p33_3") },
  { slug: "storage", name: { en: "Wardrobes & Storage", ar: "الخزائن والتخزين" }, blurb: { en: "Walk-in closets, wardrobes and smart storage.", ar: "غرف ملابس وخزائن وحلول تخزين ذكية." }, image: P("p36_2") },
  { slug: "tables", name: { en: "Tables & Vanities", ar: "الطاولات والتسريحات" }, blurb: { en: "Live-edge tables, consoles, desks and vanities.", ar: "طاولات خشب طبيعي وكونسول ومكاتب وتسريحات." }, image: P("p36_6") },
  { slug: "joinery", name: { en: "Stairs, Doors & Joinery", ar: "السلالم والأبواب والنجارة" }, blurb: { en: "Floating staircases, barn doors and partitions.", ar: "سلالم معلّقة وأبواب منزلقة وفواصل خشبية." }, image: P("p35_4") },
  { slug: "commercial", name: { en: "Retail & Commercial", ar: "المحلات والمشاريع التجارية" }, blurb: { en: "Kiosks, display units and counters for brands.", ar: "أكشاك ووحدات عرض وكاونترات للعلامات التجارية." }, image: "/images/projects/the-ceremony-1.jpg" },
].map((c, i) => ({ id: `cat_${c.slug}`, order: i, ...c }));

// ───────────────────────── Products ─────────────────────────
const fabrics = {
  sand: { name: { en: "Desert Sand", ar: "رمل الصحراء" }, hex: "#D8C8AE" },
  stone: { name: { en: "Stone Grey", ar: "رمادي حجري" }, hex: "#9C9A96" },
  charcoal: { name: { en: "Charcoal", ar: "فحمي" }, hex: "#36312F" },
  emerald: { name: { en: "Emerald Velvet", ar: "مخمل زمردي" }, hex: "#1F5A43" },
  cognac: { name: { en: "Cognac Leather", ar: "جلد كونياك" }, hex: "#8A4A25" },
  navy: { name: { en: "Ocean Blue", ar: "أزرق محيطي" }, hex: "#2E4D7B" },
  ivory: { name: { en: "Ivory Bouclé", ar: "بوكليه عاجي" }, hex: "#ECE6DA" },
  blush: { name: { en: "Blush", ar: "وردي ناعم" }, hex: "#D9B2A9" },
};
const woods = {
  oak: { name: { en: "Natural Oak", ar: "بلوط طبيعي" }, hex: "#C49A6C" },
  walnut: { name: { en: "American Walnut", ar: "جوز أمريكي" }, hex: "#5C3A21" },
  white: { name: { en: "Matt White", ar: "أبيض مطفي" }, hex: "#F2F0EC" },
  black: { name: { en: "Black Ash", ar: "رماد أسود" }, hex: "#1E1C1B" },
  greige: { name: { en: "Greige Lacquer", ar: "لاكر رمادي بيج" }, hex: "#B8AFA3" },
};
const F = (...k) => k.map((x) => fabrics[x] || woods[x]);

const raw = [
  // Sofas
  ["chesterfield-heritage-sofa", "sofas", { en: "Chesterfield Heritage Sofa", ar: "كنبة تشسترفيلد التراثية" }, 14900, null, ["p32_10"], F("cognac", "charcoal"), ["3 Seater", "4 Seater"], "230 × 95 × 78 cm", { en: "Hand-buttoned full-grain leather, kiln-dried hardwood frame, pocket springs.", ar: "جلد طبيعي كامل الحبيبات بأزرار يدوية، هيكل خشب صلب مجفف، نوابض جيبية." }, { en: "A timeless Chesterfield, deep-buttoned by hand in our Dubai workshop. Rolled arms, a solid hardwood frame and full-grain leather that only gets better with age.", ar: "تشسترفيلد كلاسيكية بأزرار عميقة مصنوعة يدوياً في ورشتنا بدبي. مساند ملفوفة وهيكل خشبي صلب وجلد طبيعي يزداد جمالاً مع الوقت." }, { featured: true }],
  ["velvet-chaise-daybed", "sofas", { en: "Velvet Chaise Daybed", ar: "أريكة استرخاء مخملية" }, 6800, 5900, ["p32_11"], F("stone", "emerald", "blush"), ["Standard"], "180 × 70 × 75 cm", { en: "Performance velvet, turned solid-wood legs, high-resilience foam.", ar: "مخمل عالي الأداء، أرجل خشبية مخروطة، إسفنج عالي المرونة." }, { en: "A sculpted daybed with two asymmetric backrests and turned walnut legs. Perfect for a dressing room, bedroom corner or boutique lounge.", ar: "أريكة نهارية منحوتة بظهرين غير متماثلين وأرجل من خشب الجوز. مثالية لغرفة الملابس أو ركن غرفة النوم أو صالة البوتيك." }, {}],
  ["harbour-lounge-set", "sofas", { en: "Harbour Lounge Set", ar: "طقم جلسة هاربر" }, 18500, null, ["p32_12"], F("stone", "sand", "navy"), ["3+2+1", "3+1"], "Sofa 210 × 88 × 80 cm", { en: "Woven upholstery fabric, tapered oak legs, removable cushions.", ar: "قماش تنجيد منسوج، أرجل بلوط مستدقة، وسائد قابلة للإزالة." }, { en: "A mid-century inspired lounge set with slim arms and tapered oak legs, made for majlis and family rooms that are lived in every day.", ar: "طقم جلسة مستوحى من منتصف القرن بمساند نحيفة وأرجل من البلوط، مصمم للمجالس وغرف العائلة الاستخدام اليومي." }, {}],
  ["cloud-curve-sofa", "sofas", { en: "Cloud Curve Sofa", ar: "كنبة كلاود المنحنية" }, 12400, null, ["p32_13"], F("ivory", "stone", "sand"), ["240 cm", "280 cm"], "240 × 100 × 82 cm", { en: "Bouclé or velvet, curved plywood frame, feather-wrapped foam.", ar: "بوكليه أو مخمل، هيكل خشب رقائقي منحني، إسفنج مغلف بالريش." }, { en: "Organic, curved and endlessly comfortable. The Cloud Curve brings a soft gallery feel to villas, lobbies and boutique lounges.", ar: "منحنية وانسيابية ومريحة للغاية. تضفي كنبة كلاود لمسة فنية ناعمة على الفلل والردهات وصالات البوتيك." }, { featured: true, isNew: true }],
  ["alba-modular-corner", "sofas", { en: "Alba Modular Corner", ar: "زاوية ألبا المعيارية" }, 16900, null, ["p32_2"], F("ivory", "sand", "stone"), ["L-Left", "L-Right"], "300 × 220 × 72 cm", { en: "Leather-look upholstery, modular sections, matching pouf.", ar: "تنجيد بملمس الجلد، أقسام معيارية، مع بوف مطابق." }, { en: "A low, generous corner sofa in modular sections, so you can configure it left- or right-handed. Comes with a matching round pouf.", ar: "كنبة زاوية منخفضة وواسعة بأقسام معيارية يمكن تركيبها لليمين أو اليسار. تأتي مع بوف دائري مطابق." }, { featured: true }],
  ["riviera-channel-sofa", "sofas", { en: "Riviera Channel Sofa", ar: "كنبة ريفييرا المضلعة" }, 11200, null, ["p32_4"], F("sand", "stone", "charcoal"), ["3 Seater", "4 Seater"], "240 × 95 × 80 cm", { en: "Channel-tufted back, brushed brass plinth, linen-blend fabric.", ar: "ظهر مضلع بخياطة قنوات، قاعدة نحاسية مصقولة، قماش ممزوج بالكتان." }, { en: "Hotel-lobby elegance for the home: a channel-tufted back on a slim brushed-metal plinth, finished with five scatter cushions.", ar: "أناقة ردهات الفنادق في منزلك: ظهر مضلع على قاعدة معدنية رفيعة مع خمس وسائد." }, {}],
  ["velluto-tufted-sofa", "sofas", { en: "Velluto Tufted Modular", ar: "كنبة فيلوتو المعيارية" }, 15800, 13900, ["p32_7"], F("emerald", "charcoal", "blush"), ["2 Modules", "3 Modules"], "290 × 105 × 70 cm", { en: "Biscuit-tufted velvet modules, solid pine base, Ø-legs hidden.", ar: "وحدات مخملية بتنجيد مربعات، قاعدة صنوبر صلبة، أرجل مخفية." }, { en: "Seventies-inspired, deeply biscuit-tufted modules in rich emerald velvet. Pull them together as a sofa or apart as loungers.", ar: "وحدات بتنجيد مربعات عميق بمخمل زمردي فاخر مستوحاة من السبعينيات. اجمعها ككنبة أو افصلها كأسرّة استرخاء." }, { featured: true }],
  ["milano-leather-sofa", "sofas", { en: "Milano Leather Sofa", ar: "كنبة ميلانو الجلدية" }, 17600, null, ["p32_8"], F("cognac", "charcoal"), ["4 Seater", "5 Seater"], "320 × 98 × 76 cm", { en: "Aniline leather, solid beech frame, high-density seat foam.", ar: "جلد أنيلين، هيكل زان صلب، إسفنج مقاعد عالي الكثافة." }, { en: "A long, low leather sofa with a clean track arm, built for big living rooms and executive lounges.", ar: "كنبة جلدية طويلة ومنخفضة بمساند مستقيمة، مصممة لغرف المعيشة الكبيرة وصالات كبار التنفيذيين." }, {}],
  ["sahara-l-sofa", "sofas", { en: "Sahara L-Shape Sofa", ar: "كنبة صحارى على شكل L" }, 9900, null, ["p32_9"], F("stone", "sand"), ["L-Left", "L-Right"], "270 × 200 × 80 cm", { en: "Textured woven fabric, floating brushed-steel legs.", ar: "قماش منسوج بملمس، أرجل فولاذية معلّقة." }, { en: "A clean-lined L-shape sofa on floating legs that makes small and mid-size apartments feel bigger.", ar: "كنبة على شكل L بخطوط نظيفة وأرجل معلّقة تجعل الشقق الصغيرة والمتوسطة تبدو أوسع." }, { isNew: true }],
  // Armchairs
  ["coral-shell-lounge-chair", "armchairs", { en: "Coral Shell Lounge Chair", ar: "كرسي كورال الصدفي" }, 3400, null, ["p32_3"], F("navy", "stone", "blush"), ["Single", "Pair"], "78 × 80 × 85 cm", { en: "Moulded shell, performance velvet, black powder-coated legs.", ar: "هيكل صدفي مقولب، مخمل عالي الأداء، أرجل مطلية بالبودرة السوداء." }, { en: "A rounded shell chair that hugs you. Shown here in a Dubai boutique paired with our matching chaise.", ar: "كرسي صدفي دائري يحتضنك. معروض هنا في بوتيك بدبي مع أريكة مطابقة." }, { featured: true }],
  ["nord-leather-armchair", "armchairs", { en: "Nord Leather Armchair", ar: "كرسي نورد الجلدي" }, 4200, null, ["p32_5"], F("navy", "cognac", "charcoal"), ["Standard"], "75 × 82 × 88 cm", { en: "Solid walnut frame, saddle leather, webbed seat.", ar: "هيكل جوز صلب، جلد سرج، مقعد بأحزمة." }, { en: "Scandinavian proportions with a solid walnut frame that wraps the cushion. Saddle leather in Ocean Blue or Cognac.", ar: "تصميم إسكندنافي بهيكل من خشب الجوز يحيط بالوسادة. جلد سرج بالأزرق المحيطي أو الكونياك." }, {}],
  ["wingback-chesterfield-chair", "armchairs", { en: "Wingback Chesterfield Chair", ar: "كرسي تشسترفيلد بأجنحة" }, 5600, null, ["p32_6"], F("cognac", "charcoal"), ["Standard"], "85 × 90 × 110 cm", { en: "Deep-buttoned leather, nailhead trim, turned mahogany legs.", ar: "جلد بأزرار عميقة، مسامير زخرفية، أرجل ماهوجني مخروطة." }, { en: "The library chair, made properly. Hand-buttoned wings, nailhead detail and turned mahogany legs.", ar: "كرسي المكتبة مصنوع كما يجب. أجنحة بأزرار يدوية وتفاصيل مسامير وأرجل ماهوجني مخروطة." }, { featured: true }],
  // Beds
  ["blush-couture-bed", "beds", { en: "Couture Panel Bed", ar: "سرير كوتور بألواح" }, 9800, null, ["p34_1"], F("blush", "ivory", "stone"), ["Queen 160", "King 180", "Super King 200"], "King: 196 × 215 × 190 cm", { en: "Floor-to-ceiling upholstered headboard, solid frame, velvet.", ar: "لوح رأس منجّد من الأرض حتى السقف، هيكل صلب، مخمل." }, { en: "A dramatic, extra-tall upholstered headboard in geometric panels. Made to measure for your ceiling height.", ar: "لوح رأس منجّد طويل بشكل لافت بألواح هندسية. يُصنع حسب ارتفاع سقفك." }, { featured: true, isNew: true }],
  ["walnut-platform-bed", "beds", { en: "Walnut Platform Bed", ar: "سرير منصة من الجوز" }, 8600, null, ["p34_3"], F("walnut", "oak"), ["King 180", "Super King 200"], "200 × 220 × 110 cm", { en: "Walnut veneer platform, upholstered headboard, LED wall panel.", ar: "منصة بقشرة الجوز، لوح رأس منجّد، لوح جداري بإضاءة LED." }, { en: "A low walnut platform with floating nightstands and an upholstered headboard, shown with our backlit feature wall.", ar: "منصة منخفضة من الجوز مع طاولات جانبية معلّقة ولوح رأس منجّد، معروضة مع جدارنا المضاء من الخلف." }, {}],
  ["floating-oak-bed", "beds", { en: "Floating Oak Bed", ar: "سرير البلوط المعلّق" }, 7400, null, ["p34_4"], F("oak", "walnut"), ["Queen 160", "King 180"], "190 × 215 × 100 cm", { en: "Solid oak frame with recessed plinth, linen headboard.", ar: "هيكل بلوط صلب بقاعدة غائرة، لوح رأس من الكتان." }, { en: "A recessed plinth makes the frame appear to float. Pairs with our matching oak nightstands.", ar: "القاعدة الغائرة تجعل السرير يبدو معلّقاً. يتناسق مع طاولات البلوط الجانبية المطابقة." }, {}],
  ["cane-oak-bed", "beds", { en: "Cane & Oak Bed", ar: "سرير الخيزران والبلوط" }, 6900, null, ["p34_5"], F("oak"), ["Queen 160", "King 180"], "190 × 215 × 105 cm", { en: "Solid oak, natural rattan cane inlay.", ar: "بلوط صلب، تطعيم من خيزران الروطان الطبيعي." }, { en: "Warm oak with a hand-woven rattan cane headboard. Relaxed, natural and built to last.", ar: "بلوط دافئ مع لوح رأس من الروطان المنسوج يدوياً. طبيعي ومريح ومصنوع ليدوم." }, {}],
  ["atelier-storage-bed", "beds", { en: "Atelier Storage Bed", ar: "سرير أتيليه بتخزين" }, 8200, null, ["p34_6"], F("stone", "sand"), ["King 180", "Super King 200"], "200 × 220 × 140 cm", { en: "Gas-lift storage base, channel headboard, integrated shelving.", ar: "قاعدة تخزين برافعة غازية، لوح رأس مضلع، رفوف مدمجة." }, { en: "Lift the slatted base to reveal full-size storage. The channel headboard ties into built-in side shelving.", ar: "ارفع القاعدة لتكشف عن مساحة تخزين كاملة. لوح الرأس المضلع يتصل برفوف جانبية مدمجة." }, {}],
  ["petal-kids-bed-nook", "beds", { en: "Petal Kids' Bed Nook", ar: "ركن سرير الأطفال بيتال" }, null, null, ["p34_7"], F("blush", "white"), ["Single 120"], "Made to measure", { en: "Built-in joinery, upholstered back panel, display shelves.", ar: "نجارة مدمجة، لوح خلفي منجّد، رفوف عرض." }, { en: "A built-in sleeping nook with an upholstered back and display shelving on both sides. Designed around your child's room.", ar: "ركن نوم مدمج بلوح خلفي منجّد ورفوف عرض على الجانبين. يُصمم حسب غرفة طفلك." }, { priceOnRequest: true }],
  // Media
  ["concrete-media-wall", "media", { en: "Concrete & Oak Media Wall", ar: "جدار وسائط خرساني وبلوط" }, 13500, null, ["p33_1"], F("oak", "greige"), ["Up to 3 m", "Up to 4 m"], "300 × 280 cm", { en: "Micro-cement panel, oak veneer shelving, floating console.", ar: "لوح مايكرو سمنت، رفوف بقشرة البلوط، كونسول معلّق." }, { en: "A micro-cement feature panel framed by oak shelving and a floating console that hides every cable.", ar: "لوح مميز من المايكرو سمنت تحيطه رفوف البلوط وكونسول معلّق يخفي جميع الأسلاك." }, { featured: true }],
  ["slatted-media-unit", "media", { en: "Slatted Oak Media Unit", ar: "وحدة تلفاز بشرائح البلوط" }, 9800, null, ["p33_2"], F("oak", "white"), ["2.4 m", "3.0 m"], "300 × 260 cm", { en: "Oak slats, matt white lacquer, open shelving.", ar: "شرائح بلوط، لاكر أبيض مطفي، رفوف مفتوحة." }, { en: "Bright and Scandinavian: vertical oak slats, white low cabinets and an open bookcase.", ar: "مشرق وإسكندنافي: شرائح بلوط عمودية وخزائن بيضاء منخفضة ومكتبة مفتوحة." }, {}],
  ["ember-fireplace-wall", "media", { en: "Ember Fireplace Wall", ar: "جدار المدفأة إمبر" }, 22800, null, ["p33_3"], F("walnut", "black"), ["Up to 4 m", "Up to 5 m"], "450 × 300 cm", { en: "Walnut veneer, black glass, 3D water-vapour fireplace, LED.", ar: "قشرة جوز، زجاج أسود، مدفأة بخار ماء ثلاثية الأبعاد، إضاءة LED." }, { en: "A full-height walnut wall with a 3D vapour fireplace and backlit display niches. The centrepiece of any majlis.", ar: "جدار جوز بكامل الارتفاع مع مدفأة بخار ثلاثية الأبعاد وتجاويف عرض مضاءة. محور أي مجلس." }, { featured: true }],
  ["walnut-frame-tv-wall", "media", { en: "Walnut Frame TV Wall", ar: "جدار تلفاز بإطار الجوز" }, 11900, null, ["p33_5"], F("walnut", "oak"), ["Up to 3 m", "Up to 4 m"], "350 × 270 cm", { en: "Walnut veneer frame, fabric back panel, low console.", ar: "إطار بقشرة الجوز، لوح خلفي من القماش، كونسول منخفض." }, { en: "A deep walnut frame around the screen with a soft fabric back panel and a long, low console.", ar: "إطار عميق من الجوز حول الشاشة مع لوح خلفي من القماش وكونسول طويل منخفض." }, {}],
  ["lagoon-lacquer-media", "media", { en: "Lagoon Lacquer Media Unit", ar: "وحدة وسائط لاجون" }, 15200, null, ["p33_6"], F("navy", "white"), ["4 m", "5 m"], "500 × 220 cm", { en: "High-gloss lacquer, LED channels, push-to-open doors.", ar: "لاكر لامع، قنوات LED، أبواب بفتح بالضغط." }, { en: "A long, layered media wall in deep lagoon blue and white, with integrated LED lighting.", ar: "جدار وسائط طويل متعدد الطبقات بالأزرق اللاجوني والأبيض مع إضاءة LED مدمجة." }, {}],
  // Storage
  ["gallery-walk-in-closet", "storage", { en: "Gallery Walk-in Closet", ar: "غرفة ملابس جاليري" }, null, null, ["p36_2"], F("greige", "oak", "white"), ["Made to measure"], "Made to measure", { en: "Textured melamine, soft-close hinges, integrated lighting.", ar: "ميلامين بملمس، مفصلات إغلاق ناعم، إضاءة مدمجة." }, { en: "A full walk-in closet designed and built around your room: hanging, drawers, shoe walls and a mirrored end panel.", ar: "غرفة ملابس كاملة تُصمم وتُبنى حسب غرفتك: تعليق وأدراج وجدران أحذية ولوح مرآة." }, { priceOnRequest: true, featured: true }],
  ["blush-sliding-wardrobe", "storage", { en: "Blush Sliding Wardrobe", ar: "خزانة منزلقة وردية" }, 7600, null, ["p36_9"], F("blush", "white", "greige"), ["2.4 m", "3.0 m"], "300 × 260 × 60 cm", { en: "Lacquered sliding doors, soft-close tracks, full interior.", ar: "أبواب منزلقة ملكّرة، مسارات إغلاق ناعم، تجهيز داخلي كامل." }, { en: "Floor-to-ceiling sliding doors in a soft blush lacquer. The interior is fully fitted with hanging rails, drawers and shelves.", ar: "أبواب منزلقة من الأرض للسقف بلاكر وردي ناعم مع تجهيز داخلي كامل." }, {}],
  ["understair-wine-storage", "storage", { en: "Under-Stair Wine & Storage", ar: "تخزين تحت الدرج" }, null, null, ["p36_4"], F("oak", "black"), ["Made to measure"], "Made to measure", { en: "Oak veneer, black metal frames, glass-door cabinet.", ar: "قشرة بلوط، إطارات معدنية سوداء، خزانة بباب زجاجي." }, { en: "We turn wasted under-stair space into storage, display and a glass-front cooler cabinet.", ar: "نحوّل المساحة المهدرة تحت الدرج إلى تخزين وعرض وخزانة بواجهة زجاجية." }, { priceOnRequest: true }],
  ["study-nook-desk", "storage", { en: "Study Nook & Shelving", ar: "ركن الدراسة والرفوف" }, 5400, null, ["p36_3"], F("white", "greige"), ["1.8 m", "2.4 m"], "240 × 260 cm", { en: "Lacquered MDF, floating desk, upper cabinets.", ar: "MDF ملكّر، مكتب معلّق، خزائن علوية." }, { en: "A floating study desk with upper cabinets and side shelving. Ideal for home offices and teenagers' rooms.", ar: "مكتب دراسة معلّق مع خزائن علوية ورفوف جانبية. مثالي للمكاتب المنزلية وغرف الشباب." }, {}],
  // Tables & vanities
  ["live-edge-walnut-table", "tables", { en: "Live-Edge Walnut Dining Table", ar: "طاولة طعام جوز بحافة طبيعية" }, 16500, null, ["p36_6"], F("walnut"), ["240 cm", "300 cm"], "300 × 110 × 76 cm", { en: "Solid walnut slab, epoxy-stabilised, sculpted steel base.", ar: "لوح جوز صلب مثبت بالإيبوكسي، قاعدة فولاذية منحوتة." }, { en: "A single slab of solid walnut with its natural live edge, on a sculpted blackened-steel base. Every table is unique.", ar: "لوح واحد من خشب الجوز الصلب بحافته الطبيعية على قاعدة فولاذية سوداء منحوتة. كل طاولة فريدة من نوعها." }, { featured: true, isNew: true }],
  ["walnut-vanity-console", "tables", { en: "Walnut Vanity Console", ar: "كونسول تسريحة الجوز" }, 6200, null, ["p36_5"], F("walnut", "oak"), ["1.8 m", "2.4 m"], "240 × 50 × 80 cm", { en: "Walnut veneer, stepped top, soft-close drawers.", ar: "قشرة جوز، سطح متدرج، أدراج بإغلاق ناعم." }, { en: "A stepped walnut console that works as a vanity, desk or sideboard, with a full-height mirror panel.", ar: "كونسول جوز متدرج يعمل كتسريحة أو مكتب أو بوفيه مع لوح مرآة بكامل الارتفاع." }, {}],
  ["lumiere-vanity", "tables", { en: "Lumière Vanity Unit", ar: "وحدة تسريحة لوميير" }, 7800, null, ["p36_7", "p36_8"], F("white", "oak"), ["1.2 m", "1.6 m"], "160 × 260 cm", { en: "Lacquer, backlit mirror, display shelving.", ar: "لاكر، مرآة مضاءة، رفوف عرض." }, { en: "A built-in vanity with a backlit mirror, open display shelves and storage above. Shown in two finishes.", ar: "تسريحة مدمجة بمرآة مضاءة ورفوف عرض مفتوحة وتخزين علوي. معروضة بلونين." }, {}],
  ["arc-reception-counter", "commercial", { en: "Arc Reception Counter", ar: "كاونتر استقبال آرك" }, null, null, ["p33_7"], F("greige", "white"), ["Made to measure"], "Made to measure", { en: "Solid surface, curved MDF, LED cove lighting.", ar: "سطح صلب، MDF منحني، إضاءة LED مخفية." }, { en: "A sweeping, layered reception counter with hidden LED lines. Built for offices, clinics and showrooms.", ar: "كاونتر استقبال منحني متعدد الطبقات بخطوط LED مخفية. مصمم للمكاتب والعيادات وصالات العرض." }, { priceOnRequest: true }],
  // Joinery
  ["floating-oak-staircase", "joinery", { en: "Floating Oak Staircase", ar: "درج البلوط المعلّق" }, null, null, ["p35_4", "p35_2"], F("oak", "walnut"), ["Made to measure"], "Made to measure", { en: "Solid oak treads, frameless glass, LED step lights.", ar: "درجات بلوط صلب، زجاج بدون إطار، إضاءة LED للدرجات." }, { en: "Cantilevered solid oak treads with frameless glass balustrade and LED step lighting. We survey, fabricate and install.", ar: "درجات بلوط صلبة معلّقة مع درابزين زجاجي بدون إطار وإضاءة LED. نقوم بالمعاينة والتصنيع والتركيب." }, { priceOnRequest: true, featured: true }],
  ["black-steel-balustrade", "joinery", { en: "Black Steel Balustrade", ar: "درابزين فولاذي أسود" }, null, null, ["p35_5", "p35_3"], F("black", "oak"), ["Per linear metre"], "Made to measure", { en: "Powder-coated steel, oak handrail.", ar: "فولاذ مطلي بالبودرة، درابزين يد من البلوط." }, { en: "Slim vertical steel balusters with a solid oak handrail, for stairs and mezzanines.", ar: "قضبان فولاذية عمودية نحيفة مع درابزين يد من البلوط الصلب للسلالم والميزانين." }, { priceOnRequest: true }],
  ["barn-sliding-door", "joinery", { en: "Barn Sliding Door", ar: "باب منزلق ريفي" }, 3900, null, ["p36_10"], F("walnut", "oak", "black"), ["90 × 220 cm", "120 × 240 cm"], "120 × 240 cm", { en: "Solid wood panel, black steel track, soft-stop.", ar: "لوح خشب صلب، مسار فولاذي أسود، توقف ناعم." }, { en: "A solid-wood barn door on a black steel track. Saves space and adds character.", ar: "باب خشبي صلب على مسار فولاذي أسود. يوفر المساحة ويضيف طابعاً مميزاً." }, {}],
  ["slatted-partition-console", "joinery", { en: "Slatted Partition & Console", ar: "فاصل بشرائح مع كونسول" }, 6400, null, ["p33_8"], F("oak", "white"), ["2 m", "3 m"], "200 × 280 cm", { en: "Oak slats, lacquered base cabinet.", ar: "شرائح بلوط، خزانة قاعدة ملكّرة." }, { en: "Divide open-plan spaces without losing light: floor-to-ceiling oak slats above a storage console.", ar: "قسّم المساحات المفتوحة دون فقدان الضوء: شرائح بلوط من الأرض للسقف فوق كونسول تخزين." }, {}],
  // Commercial (from projects)
  ["ceremony-retail-kiosk", "commercial", { en: "Signature Retail Kiosk", ar: "كشك تجزئة مميز" }, null, null, ["/images/projects/the-ceremony-1.jpg", "/images/projects/the-ceremony-2.jpg"], F("navy", "oak"), ["Made to measure"], "Made to measure", { en: "Lacquered MDF, LED, solid surface counter, lockable storage.", ar: "MDF ملكّر، إضاءة LED، كاونتر بسطح صلب، تخزين بقفل." }, { en: "Mall-approved kiosks designed, built and installed by TANFEEZ, like The Ceremony at The Avenues. Includes shop drawings for mall approval.", ar: "أكشاك معتمدة للمولات نصممها ونصنعها ونركّبها، مثل كشك ذا سيريموني. تشمل الرسومات التنفيذية لموافقة المول." }, { priceOnRequest: true, featured: true }],
  ["perfume-wall-display", "commercial", { en: "Perfume Wall Display", ar: "وحدة عرض العطور الجدارية" }, null, null, ["/images/projects/vilhelm-parfumerie-1.jpg", "/images/projects/vilhelm-parfumerie-2.jpg"], F("white", "oak"), ["Made to measure"], "Made to measure", { en: "Lacquer, mirror-polished steel, back-lit shelves.", ar: "لاكر، فولاذ مصقول كالمرآة، رفوف مضاءة." }, { en: "Branded, back-lit wall displays for fragrance and beauty, as built for Vilhelm Parfumerie at The Dubai Mall.", ar: "وحدات عرض جدارية مضاءة بهوية العلامة للعطور ومستحضرات التجميل، كما نفذناها لفيلهلم بارفيوميري في دبي مول." }, { priceOnRequest: true }],
  ["coffee-kiosk-pod", "commercial", { en: "Outdoor Coffee Kiosk Pod", ar: "كشك قهوة خارجي" }, null, null, ["/images/projects/pentagon-coffee-1.jpg", "/images/projects/pentagon-coffee-2.jpg"], F("sand", "navy"), ["3 × 3 m", "4 × 3 m"], "Made to measure", { en: "Weather-proof frame, timber louvres, full MEP.", ar: "هيكل مقاوم للطقس، شرائح خشبية، تمديدات كاملة." }, { en: "Design-and-build coffee kiosks for events and outdoor spaces, delivered ready to trade.", ar: "تصميم وتنفيذ أكشاك قهوة للفعاليات والمساحات الخارجية، تُسلّم جاهزة للتشغيل." }, { priceOnRequest: true }],
];

let skuN = 1001;
const products = raw.map(([slug, category, name, price, salePrice, imgs, finishes, sizes, dimensions, materials, description, flags], i) => ({
  id: `prd_${String(i + 1).padStart(3, "0")}`,
  slug,
  sku: `TNF-${skuN++}`,
  name,
  category,
  price: price ?? 0,
  salePrice: salePrice ?? null,
  priceOnRequest: !!flags.priceOnRequest,
  stock: flags.priceOnRequest ? 0 : [6, 3, 12, 2, 8, 5, 0, 9, 4, 14][i % 10],
  images: imgs.map((x) => (x.startsWith("/") ? x : P(x))),
  description,
  materials,
  dimensions,
  leadTimeDays: flags.priceOnRequest ? 28 : [7, 10, 14, 21][i % 4],
  finishes,
  sizes,
  featured: !!flags.featured,
  isNew: !!flags.isNew,
  status: "active",
  rating: [4.9, 5, 4.8, 4.7, 5, 4.9][i % 6],
  reviews: [12, 31, 8, 22, 17, 5, 41][i % 7],
  createdAt: daysAgo(120 - i * 3),
}));

// ───────────────────────── Projects (from the PDF) ─────────────────────────
const S = {
  fit: { en: "Fit-out", ar: "تجهيز داخلي" },
  furn: { en: "Furniture works", ar: "أعمال الأثاث" },
  both: { en: "Fit-out & furniture", ar: "تجهيز داخلي وأثاث" },
  dp: { en: "Design & production", ar: "تصميم وإنتاج" },
};
const L = (en, ar) => ({ en, ar });
const projDefs = [
  ["galeries-lafayette-outlet", "Galeries Lafayette", L("L'Outlet Department Store", "متجر لافاييت آوتلت"), "retail", S.both, L("Ibn Battuta Mall, Dubai", "ابن بطوطة مول، دبي"), "Dubai", L("Complete fit-out and furniture for a multi-department outlet: cash desks, wall systems, gondolas and feature zones across the whole floor plate.", "تجهيز داخلي وأثاث متكامل لمتجر متعدد الأقسام: كاونترات دفع وأنظمة جدارية ووحدات عرض ومناطق مميزة على كامل المساحة."), true],
  ["lafayette-gourmet", "Galeries Lafayette", L("Lafayette Gourmet", "لافاييت جورميه"), "fnb", S.furn, L("The Dubai Mall", "دبي مول"), "Dubai", L("Food-hall counters, sushi and bakery stations, chesterfield banquettes and terrace seating for one of Dubai's busiest gourmet destinations.", "كاونترات قاعة الطعام ومحطات السوشي والمخبوزات ومقاعد تشسترفيلد وجلسات التراس لإحدى أكثر الوجهات الذواقة ازدحاماً في دبي."), true],
  ["vox-cinema-theatre", "VOX Cinemas", L("THEATRE by VOX", "ثياتر من ڤوكس"), "hospitality", S.furn, L("Mall of the Emirates", "مول الإمارات"), "Dubai", L("Bespoke lounge sofas, curved velvet seating, side tables and a statement bar back for VOX's luxury THEATRE experience.", "كنب صالات مخصص ومقاعد مخملية منحنية وطاولات جانبية وخلفية بار مميزة لتجربة ثياتر الفاخرة من ڤوكس."), true],
  ["corneliani", "Corneliani", L("Corneliani Boutique", "بوتيك كورنلياني"), "retail", S.furn, L("The Dubai Mall", "دبي مول"), "Dubai", L("Walnut wall systems, display tables and lounge furniture for the Italian menswear house.", "أنظمة جدارية من الجوز وطاولات عرض وأثاث صالة لدار الأزياء الرجالية الإيطالية."), true],
  ["the-art-of-shaving", "The Art of Shaving", L("Airport Retail Store", "متجر المطار"), "retail", S.fit, L("Sharjah International Airport", "مطار الشارقة الدولي"), "Sharjah", L("Full airside fit-out including dark-timber wall displays, barber station and island counters, delivered within airport security constraints.", "تجهيز داخلي كامل داخل المطار يشمل وحدات عرض خشبية داكنة ومحطة حلاقة وكاونترات وسطية، ضمن قيود أمن المطار."), true],
  ["hovi-digital-lab", "Hovi Digital Lab", L("Creative Office", "مكتب إبداعي"), "office", S.fit, L("Dubai Internet City", "مدينة دبي للإنترنت"), "Dubai", L("A colourful creative office: reception, glass meeting rooms, timber-clad pods and branded feature walls.", "مكتب إبداعي ملوّن: استقبال وغرف اجتماعات زجاجية وكبائن مكسوة بالخشب وجدران بهوية العلامة."), true],
  ["vilhelm-parfumerie", "Vilhelm Parfumerie", L("Wall Concept", "مفهوم الجدار"), "retail", S.furn, L("The Dubai Mall", "دبي مول"), "Dubai", L("A signature yellow back-lit wall concept and display island for the New York fragrance house.", "مفهوم جداري أصفر مضاء وجزيرة عرض لدار العطور النيويوركية."), true],
  ["the-ceremony", "The Ceremony", L("Retail Kiosk", "كشك تجزئة"), "retail", S.dp, L("Avenue Mall", "أفينيو مول"), "Dubai", L("A sculptural kiosk with layered display niches and LED edges, designed for maximum product visibility on a compact footprint.", "كشك منحوت بتجاويف عرض متعددة وحواف LED، مصمم لأقصى ظهور للمنتجات على مساحة صغيرة."), false],
  ["pellini", "Pellini", L("Retail Stores", "متاجر بيليني"), "retail", S.furn, L("Dubai Hills Mall & Dubai Festival City", "دبي هيلز مول ودبي فستيفال سيتي"), "Dubai", L("Two stores fitted with tailored wall systems, display tables and fitting rooms in a confident dark palette.", "متجران مجهزان بأنظمة جدارية مفصّلة وطاولات عرض وغرف قياس بألوان داكنة واثقة."), false],
  ["drykorn", "Drykorn", L("Brand Corner", "ركن العلامة"), "retail", S.furn, L("The Dubai Mall", "دبي مول"), "Dubai", L("Slatted oak backdrops, hanging rails and stepped display plinths for the Berlin fashion label.", "خلفيات من شرائح البلوط وقضبان تعليق ومنصات عرض متدرجة للعلامة البرلينية."), false],
  ["peserico", "Peserico", L("Boutique", "بوتيك"), "retail", S.furn, L("The Dubai Mall", "دبي مول"), "Dubai", L("Soft-toned display tables, wall bays and framed niches for the Italian womenswear brand.", "طاولات عرض بألوان هادئة ووحدات جدارية وتجاويف مؤطرة لعلامة الأزياء النسائية الإيطالية."), false],
  ["pal-zileri", "Pal Zileri", L("Boutique", "بوتيك"), "retail", S.furn, L("The Dubai Mall", "دبي مول"), "Dubai", L("Walnut and sage-green wall systems with glass display counters.", "أنظمة جدارية من الجوز والأخضر الهادئ مع كاونترات عرض زجاجية."), false],
  ["the-edit-galeries-lafayette", "Galeries Lafayette", L("THE EDIT Concept", "مفهوم ذا إيديت"), "retail", S.furn, L("The Dubai Mall", "دبي مول"), "Dubai", L("A curated concept space with brass-framed rails, display tables and open sightlines.", "مساحة مفهوم منسقة بقضبان نحاسية الإطار وطاولات عرض وخطوط رؤية مفتوحة."), false],
  ["letrange", "L'Étrange", L("Boutique", "بوتيك"), "retail", S.furn, L("The Dubai Mall", "دبي مول"), "Dubai", L("A blush-pink boutique with sculpted plinths and floating shelves for the Parisian maison.", "بوتيك وردي بمنصات منحوتة ورفوف معلّقة للدار الباريسية."), false],
  ["harvey-nichols-fashion-kids", "Harvey Nichols", L("Fashion Kids", "أزياء الأطفال"), "retail", S.furn, L("Mall of the Emirates", "مول الإمارات"), "Dubai", L("A playful kids' department with modular wall shelving and soft seating.", "قسم أطفال مرح بوحدات رفوف جدارية معيارية ومقاعد ناعمة."), false],
  ["home-of-scent", "Home of Scent", L("Retail Store", "متجر تجزئة"), "retail", S.furn, L("Marina Mall, Abu Dhabi", "مارينا مول، أبوظبي"), "Abu Dhabi", L("Bright white perfume walls with gold accents and a central display table.", "جدران عطور بيضاء ناصعة بلمسات ذهبية وطاولة عرض وسطية."), false],
  ["the-scent-library", "The Scent Library", L("Retail Store", "متجر تجزئة"), "retail", S.fit, L("Jumeirah 2, Dubai", "جميرا 2، دبي"), "Dubai", L("A dark, library-like fragrance store with arched timber niches and a central consultation table.", "متجر عطور داكن يشبه المكتبة بتجاويف خشبية مقوسة وطاولة استشارات وسطية."), false],
  ["55-car-care", "55 Car Care", L("Detailing Studio", "استوديو العناية بالسيارات"), "automotive", S.fit, L("Al Quoz, Dubai", "القوز، دبي"), "Dubai", L("A futuristic detailing studio with hexagonal LED ceiling and seamless white walls.", "استوديو عناية بالسيارات بتصميم مستقبلي بسقف LED سداسي وجدران بيضاء متصلة."), false],
  ["izu-brasserie", "IZU", L("Brasserie & Café", "براسري ومقهى"), "fnb", S.furn, L("The Dubai Mall", "دبي مول"), "Dubai", L("Curved timber counters, bar seating and café furniture for an all-day brasserie.", "كاونترات خشبية منحنية ومقاعد بار وأثاث مقهى لبراسري طوال اليوم."), false],
  ["moishi-kiosk", "M'OISHI", L("Mochi Kiosk", "كشك موتشي"), "fnb", S.furn, L("Yas Mall, Abu Dhabi", "ياس مول، أبوظبي"), "Abu Dhabi", L("A walnut kiosk with planter-edged seating area in the heart of Yas Mall.", "كشك من الجوز مع منطقة جلوس محاطة بأحواض نباتات في قلب ياس مول."), false],
  ["pentagon-coffee", "Pentagon Specialty Coffee", L("Outdoor Coffee Kiosk", "كشك قهوة خارجي"), "fnb", S.dp, L("Abu Dhabi", "أبوظبي"), "Abu Dhabi", L("Designed and produced in-house: a timber-louvred outdoor coffee kiosk delivered ready to trade.", "صُمم وأُنتج داخلياً: كشك قهوة خارجي بشرائح خشبية سُلّم جاهزاً للتشغيل."), false],
  ["treasure-island", "Treasure Island", L("Kids' Store", "متجر أطفال"), "retail", S.furn, L("The Dubai Mall", "دبي مول"), "Dubai", L("Themed, story-driven furniture and façades for a children's play and retail concept.", "أثاث وواجهات بطابع قصصي لمفهوم لعب وتجزئة للأطفال."), false],
  ["lalique-tamer-beauty", "Lalique Tamer Beauty", L("Corporate Office", "مكتب الشركة"), "office", S.fit, L("Dubai Design District (d3)", "حي دبي للتصميم"), "Dubai", L("A refined corporate office with branded reception, lounge seating and meeting rooms.", "مكتب شركة راقٍ باستقبال يحمل الهوية وجلسات صالة وغرف اجتماعات."), false],
  ["abu-al-abyad-accommodation", "Private Department of the President", L("Staff Accommodation", "سكن الموظفين"), "accommodation", S.furn, L("Abu Al Abyad Island, Abu Dhabi", "جزيرة أبو الأبيض، أبوظبي"), "Abu Dhabi", L("Large-scale furniture supply for staff accommodation: dining halls, lounges and bedrooms, delivered to an island site.", "توريد أثاث على نطاق واسع لسكن الموظفين: قاعات طعام وصالات وغرف نوم، سُلّمت إلى موقع على جزيرة."), false],
];
const projects = projDefs.map(([slug, client, title, sector, scope, location, emirate, summary, featured], i) => ({
  id: `prj_${String(i + 1).padStart(3, "0")}`,
  slug, client, title, sector, scope, location, emirate, summary,
  images: projectImages[slug] || [],
  featured, order: i,
  createdAt: daysAgo(200 - i),
}));

// ───────────────────────── Settings ─────────────────────────
const settings = {
  phone: "+971 4 835 8197",
  mobile: "+971 50 899 6838",
  whatsapp: "971508996838",
  email: "info@tanfeez.me",
  instagram: "tanfeez_aamal_technical",
  address: { en: "Khalifa Al Mazrouei Bldg, Warehouse 2, Dubai Investment Park 2, Dubai, UAE", ar: "مبنى خليفة المزروعي، مستودع 2، مجمع دبي للاستثمار 2، دبي، الإمارات" },
  hours: { en: "Sat – Thu · 8:00 – 18:00", ar: "السبت – الخميس · 8:00 – 18:00" },
  announcement: { en: "Free delivery & installation across Dubai on orders over AED 5,000", ar: "توصيل وتركيب مجاني في دبي للطلبات فوق 5,000 درهم" },
  freeDeliveryOver: 5000,
  deliveryFees: { Dubai: 150, Sharjah: 200, Ajman: 200, "Abu Dhabi": 300, "Umm Al Quwain": 250, "Ras Al Khaimah": 300, Fujairah: 350 },
  bank: { name: "Emirates NBD", iban: "AE00 0000 0000 0000 0000 000", account: "TANFEEZ AAMAL TECHNICAL CONTRACTING LLC" },
};

// ───────────────────────── Demo activity ─────────────────────────
let seedN = 7;
const rnd = () => ((seedN = (seedN * 16807) % 2147483647) / 2147483647);
const pick = (a) => a[Math.floor(rnd() * a.length)];
const people = [["Ahmed Al Mansoori", "Dubai"], ["Sara Haddad", "Dubai"], ["Omar Khalil", "Sharjah"], ["Fatima Al Nuaimi", "Abu Dhabi"], ["Rashid Al Ketbi", "Abu Dhabi"], ["Layla Mansour", "Dubai"], ["Yousef Darwish", "Ajman"], ["Mariam Al Shamsi", "Ras Al Khaimah"], ["Karim Nassar", "Dubai"], ["Noura Al Hammadi", "Fujairah"], ["Hassan Saleh", "Dubai"], ["Aisha Rahman", "Sharjah"]];
const buyable = products.filter((p) => !p.priceOnRequest);
const statuses = ["delivered", "delivered", "delivered", "delivery", "production", "confirmed", "new", "cancelled"];
const orders = [];
for (let i = 0; i < 46; i++) {
  const [name, emirate] = pick(people);
  const age = Math.floor(rnd() * 90);
  const n = 1 + Math.floor(rnd() * 2);
  const items = Array.from({ length: n }, () => {
    const p = pick(buyable);
    return { productId: p.id, slug: p.slug, name: p.name.en, image: p.images[0], price: p.salePrice || p.price, qty: rnd() > 0.85 ? 2 : 1, finish: p.finishes[0]?.name.en, size: p.sizes[0] };
  });
  const subtotal = items.reduce((s, x) => s + x.price * x.qty, 0);
  const delivery = subtotal >= settings.freeDeliveryOver && emirate === "Dubai" ? 0 : settings.deliveryFees[emirate];
  const total = subtotal + delivery;
  let status = age < 3 ? "new" : age < 8 ? pick(["confirmed", "production"]) : age < 14 ? pick(["production", "delivery"]) : pick(statuses);
  const created = daysAgo(age, 8 + Math.floor(rnd() * 10));
  orders.push({
    id: `ord_${i + 1}`, number: `TNF-${10001 + i}`,
    customer: { name, phone: `+971 5${Math.floor(rnd() * 9)} ${Math.floor(100 + rnd() * 899)} ${Math.floor(1000 + rnd() * 8999)}`, email: name.toLowerCase().replace(/[^a-z]+/g, ".") + "@example.com", emirate, area: pick(["Downtown", "Jumeirah", "Al Barsha", "Dubai Hills", "Al Reem", "Al Majaz", "JVC", "Arabian Ranches"]), address: `Villa ${Math.floor(1 + rnd() * 120)}` },
    items, subtotal, delivery, vat: Math.round((total / 1.05) * 0.05), total,
    payment: rnd() > 0.5 ? "cod" : "bank", status,
    history: [{ status: "new", at: created }, ...(status !== "new" ? [{ status, at: created }] : [])],
    createdAt: created,
  });
}
orders.sort((a, b) => b.createdAt.localeCompare(a.createdAt));

const reqDefs = [
  ["fitout", "Retail boutique", "120", "Dubai", "AED 250k – 500k", "1 – 3 months", "New perfume boutique at Dubai Hills Mall, need design + build including mall approvals.", "won", "Layla Mansour", "Oud & Co", 380000],
  ["furniture", "Villa", "450", "Abu Dhabi", "AED 100k – 250k", "1 – 3 months", "Full villa furniture package — majlis, 5 bedrooms, dining.", "quoted", "Rashid Al Ketbi", "", 165000],
  ["custom", "Apartment", "", "Dubai", "AED 10k – 50k", "Within a month", "Cloud Curve Sofa but 320 cm wide in green velvet.", "contacted", "Sara Haddad", "", null],
  ["fitout", "Café / Restaurant", "220", "Sharjah", "AED 500k+", "3 – 6 months", "Specialty coffee flagship, 2 floors, need kitchen + seating + façade.", "visit", "Omar Khalil", "Bean Theory", null],
  ["technical", "Office", "800", "Dubai", "AED 50k – 100k", "ASAP", "MEP maintenance contract + partition changes in Business Bay office.", "new", "Hassan Saleh", "Northgate Capital", null],
  ["furniture", "Hotel / Hospitality", "1500", "Ras Al Khaimah", "AED 500k+", "3 – 6 months", "Lobby and lounge furniture for boutique hotel, 60 rooms later phase.", "new", "Mariam Al Shamsi", "Coral Bay Hotel", null],
  ["custom", "Villa", "", "Dubai", "AED 50k – 100k", "1 – 3 months", "Floating oak staircase + glass balustrade, 2 floors.", "quoted", "Karim Nassar", "", 78000],
  ["fitout", "Kiosk", "16", "Abu Dhabi", "AED 50k – 100k", "Within a month", "Mochi kiosk for Yas Mall, need approval drawings.", "lost", "Yousef Darwish", "Sweet Yuki", null],
  ["fitout", "Clinic", "300", "Dubai", "AED 250k – 500k", "1 – 3 months", "Aesthetics clinic in Jumeirah, reception, 6 treatment rooms.", "contacted", "Aisha Rahman", "Glow Clinic", null],
];
const requests = reqDefs.map(([service, space, area, emirate, budget, timeline, details, status, name, company, value], i) => ({
  id: `req_${i + 1}`, number: `RQ-${2201 + i}`, service, space, area, emirate, budget, timeline, details, files: [],
  contact: { name, company, phone: `+971 50 ${100 + i * 37} ${2000 + i * 113}`, email: name.toLowerCase().replace(/[^a-z]+/g, ".") + "@example.com" },
  status, notes: status === "new" ? [] : [{ text: "Called client, site visit scheduled.", at: daysAgo(i + 1) }],
  value, createdAt: daysAgo(i * 4 + 1),
}));

const messages = [
  ["Nadia Fares", "Showroom visit", "Hi, can I visit your workshop on Saturday to see the fabric samples?"],
  ["Tom Becker", "Supplier introduction", "We supply Italian veneers and would like to present our catalogue."],
  ["Khalid Al Zaabi", "Delivery to Fujairah", "Do you deliver and install in Fujairah? Interested in the Walnut Platform Bed."],
  ["Priya Menon", "Careers", "I am a joinery draughtsman with 6 years UAE experience — are you hiring?"],
].map(([name, subject, message], i) => ({ id: `msg_${i + 1}`, name, email: name.toLowerCase().replace(/[^a-z]+/g, ".") + "@example.com", phone: "", subject, message, read: i > 1, createdAt: daysAgo(i * 2 + 1) }));

const db = { categories, products, projects, orders, requests, messages, settings, counters: { order: 10001 + orders.length, request: 2201 + requests.length } };
fs.writeFileSync(path.join(root, "data/seed.json"), JSON.stringify(db, null, 1));
console.log(`seed.json: ${products.length} products, ${projects.length} projects, ${orders.length} orders, ${requests.length} requests`);
