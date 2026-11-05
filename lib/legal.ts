// Terms of sale and privacy policy, in English and Arabic. Store details (address, phone,
// email, free-delivery threshold) come from Admin → Settings so the pages stay in step.

export type LegalBlock = string | { list: string[] };
export type LegalSection = { id: string; title: string; body: LegalBlock[] };
export type LegalDoc = { title: string; intro: string; sections: LegalSection[] };

type Store = { email: string; phone: string; whatsapp: string; address: string; freeDeliveryOver: number; company: { licence: string; authority: string; trn: string } };

const licence = (s: Store, ar: boolean) =>
  [
    s.company.licence && (ar ? `رخصة تجارية رقم ${s.company.licence}${s.company.authority ? ` صادرة عن ${s.company.authority}` : ""}.` : `Trade licence no. ${s.company.licence}${s.company.authority ? `, issued by ${s.company.authority}` : ""}.`),
    s.company.trn && (ar ? `الرقم الضريبي ${s.company.trn}.` : `VAT TRN ${s.company.trn}.`),
  ]
    .filter(Boolean)
    .join(" ");

export const LEGAL_UPDATED = "2026-11-05";
const COMPANY = { en: "TANFEEZ Aamal Technical Contracting LLC", ar: "تنفيذ أعمال للمقاولات الفنية ذ.م.م" };
const aed = (n: number, ar: boolean) => (ar ? `${n.toLocaleString("en-US")} د.إ` : `AED ${n.toLocaleString("en-US")}`);

export function terms(ar: boolean, s: Store): LegalDoc {
  if (ar)
    return {
      title: "شروط البيع",
      intro: `تنطبق هذه الشروط على كل طلب يتم عبر موقع تنفيذ. يرجى قراءتها قبل الطلب، فهي تشرح كيف نصنع ونوصّل قطعك، وما يمكنك فعله إذا تغيّرت خططك.`,
      sections: [
        { id: "about", title: "من نحن", body: [`يُدار هذا الموقع من قِبل ${COMPANY.ar} («تنفيذ»، «نحن»)، ومقرها ${s.address}. ${licence(s, true)} للتواصل: ${s.email} أو ${s.phone}.`.replace(/\s+/g, " ")] },
        {
          id: "products",
          title: "المنتجات والأسعار",
          body: [
            "تُصنع كثير من قطعنا يدوياً في ورشتنا في دبي من مواد طبيعية مثل الخشب والجلد والأقمشة، لذا قد تختلف الألوان والعروق قليلاً عن الصور. يسعدنا إرسال عينات الأقمشة مجاناً قبل الطلب.",
            "جميع الأسعار بالدرهم الإماراتي وتشمل ضريبة القيمة المضافة 5%. إذا ظهر خطأ واضح في السعر، سنتواصل معك قبل تأكيد الطلب ويمكنك الإلغاء دون أي رسوم.",
          ],
        },
        {
          id: "orders",
          title: "الطلب والتأكيد",
          body: [
            "عند إتمام الطلب تصلك رسالة استلام برقم الطلب. سيتصل بك فريقنا خلال يوم عمل واحد لتأكيد التفاصيل والمقاسات وموعد التوصيل، ويصبح الطلب مؤكداً بعد هذا الاتصال.",
            "يحق لنا رفض أي طلب أو إلغاؤه قبل التأكيد، وفي هذه الحالة نعيد أي مبلغ مدفوع كاملاً.",
          ],
        },
        {
          id: "payment",
          title: "الدفع",
          body: [
            { list: ["الدفع عند الاستلام.", "التحويل البنكي (تظهر بيانات الحساب بعد الطلب).", "تابي أو تمارا للدفع على أقساط بدون فوائد، وتخضع لشروطهما وموافقتهما.", "البطاقات البنكية عند تفعيلها على الموقع."] },
            "للقطع المصنوعة حسب الطلب قد نطلب دفعة مقدمة قبل بدء التصنيع، ويُستحق الباقي قبل التوصيل أو عنده. لا نحتفظ ببيانات بطاقتك؛ تتم المدفوعات عبر مزوّدي دفع مرخّصين.",
          ],
        },
        {
          id: "delivery",
          title: "التصنيع والتوصيل والتركيب",
          body: [
            "مدة التجهيز الظاهرة في صفحة المنتج تقديرية، وسنتفق معك على موعد التوصيل. نوصّل ونركّب في جميع إمارات الدولة، وتظهر رسوم التوصيل لكل إمارة عند الدفع.",
            `التوصيل والتركيب مجاني في جميع أنحاء الإمارات للطلبات التي تزيد قيمتها عن ${aed(s.freeDeliveryOver, true)}.`,
            "يرجى التأكد من إمكانية إدخال القطع (المصاعد والأبواب والسلالم) وإبلاغنا مسبقاً بأي قيود، وأن يكون شخص بالغ موجوداً عند التوصيل. افحص القطع عند الاستلام وأبلغنا بأي ملاحظات.",
          ],
        },
        {
          id: "cancellations",
          title: "الإلغاء",
          body: [
            "يمكنك إلغاء طلبك مجاناً واسترداد المبلغ كاملاً قبل أن يبدأ التصنيع. سنخبرك عند بدء التصنيع.",
            "بعد بدء تصنيع قطعة مصنوعة حسب الطلب أو بمقاس أو قماش خاص، لا يمكن إلغاؤها، وقد نحتفظ بالدفعة المقدمة لتغطية المواد والعمل المنجز.",
          ],
        },
        {
          id: "returns",
          title: "الإرجاع والاسترداد",
          body: [
            { list: [
              "القطع الجاهزة من المخزون: يمكن إرجاعها خلال 7 أيام من التوصيل إذا كانت غير مستعملة وبحالتها الأصلية. قد تنطبق رسوم الاستلام.",
              "القطع المصنوعة حسب الطلب أو المعدّلة (مقاس أو قماش أو لون خاص) وأعمال النجارة المخصصة لا تُرجع إلا إذا كان بها عيب.",
              "التلف أو العيب: أبلغنا خلال 48 ساعة من التوصيل مع صور، وسنصلح القطعة أو نستبدلها أو نعيد المبلغ.",
            ] },
            "تُعاد المبالغ بطريقة الدفع الأصلية خلال 14 يوماً من الموافقة على الإرجاع. مدفوعات تابي وتمارا تُعاد عبرهما.",
          ],
        },
        {
          id: "warranty",
          title: "الضمان",
          body: [
            "نقدّم ضماناً لمدة 5 سنوات على هياكل الأثاث المنجّد، و12 شهراً على العيوب المصنعية الأخرى، من تاريخ التوصيل.",
            "لا يشمل الضمان الاستهلاك الطبيعي، أو سوء الاستخدام، أو بهتان الألوان بسبب الشمس، أو الرطوبة، أو القطع التي نقلها أو عدّلها غيرنا.",
          ],
        },
        { id: "projects", title: "المشاريع والتجهيز الداخلي", body: ["أعمال التجهيز الداخلي والمشاريع التجارية والنجارة المخصصة يحكمها عرض السعر أو العقد الخاص بها، وتسود شروطه عند الاختلاف."] },
        { id: "account", title: "حسابك", body: ["أنت مسؤول عن سرية كلمة المرور الخاصة بحسابك. يمكنك تعديل بياناتك أو حذف حسابك في أي وقت من صفحة «حسابي». قد نعلّق الحسابات التي يُساء استخدامها."] },
        { id: "liability", title: "المسؤولية", body: ["إلى الحد الذي يسمح به القانون، لا نتحمل مسؤولية الخسائر غير المباشرة. لا يؤثر شيء في هذه الشروط على حقوقك بموجب قانون حماية المستهلك الاتحادي رقم 15 لسنة 2020."] },
        { id: "law", title: "القانون المعمول به", body: ["تخضع هذه الشروط لقوانين دولة الإمارات العربية المتحدة كما تُطبّق في إمارة دبي، وتختص محاكم دبي بأي نزاع."] },
        { id: "contact", title: "التغييرات والتواصل", body: [`قد نحدّث هذه الشروط من وقت لآخر؛ تنطبق على طلبك الشروطُ السارية وقت الطلب. لأي سؤال: ${s.email} أو ${s.phone}.`] },
      ],
    };
  return {
    title: "Terms of sale",
    intro: "These terms apply to every order placed on the TANFEEZ website. Please read them before you order: they explain how we make and deliver your pieces, and what you can do if your plans change.",
    sections: [
      { id: "about", title: "About us", body: [`This website is run by ${COMPANY.en} ("TANFEEZ", "we", "us"), based at ${s.address}. ${licence(s, false)} You can reach us at ${s.email} or ${s.phone}.`.replace(/\s+/g, " ")] },
      {
        id: "products",
        title: "Products and prices",
        body: [
          "Many of our pieces are handmade in our Dubai workshop from natural materials such as wood, leather and fabric, so colours and grain can vary slightly from the photos. We're happy to send free fabric samples before you order.",
          "All prices are in UAE dirhams and include 5% VAT. If there is an obvious pricing error, we'll contact you before confirming your order and you can cancel at no cost.",
        ],
      },
      {
        id: "orders",
        title: "Ordering and confirmation",
        body: [
          "When you place an order you receive an order number. Our team will call you within one working day to confirm the details, measurements and delivery date; your order is confirmed after that call.",
          "We may decline or cancel an order before it is confirmed. If we do, we refund anything you have paid in full.",
        ],
      },
      {
        id: "payment",
        title: "Payment",
        body: [
          { list: ["Pay on delivery.", "Bank transfer (account details are shown after you order).", "Tabby or Tamara for interest-free instalments, subject to their own terms and approval.", "Debit and credit cards, once available on the website."] },
          "For made-to-order pieces we may ask for a deposit before production starts, with the balance due before or on delivery. We never store your card details: payments are handled by licensed payment providers.",
        ],
      },
      {
        id: "delivery",
        title: "Production, delivery and installation",
        body: [
          "The lead time on each product page is an estimate; we'll agree the delivery date with you. We deliver and install across all seven emirates, and the delivery fee for your emirate is shown at checkout.",
          `Delivery and installation are free across the UAE on orders over ${aed(s.freeDeliveryOver, false)}.`,
          "Please make sure the pieces can get in (lifts, doors, stairs) and tell us about any building restrictions in advance, and have an adult present at delivery. Check your pieces when they arrive and let us know of anything that isn't right.",
        ],
      },
      {
        id: "cancellations",
        title: "Cancellations",
        body: [
          "You can cancel free of charge, with a full refund, until production starts. We'll let you know when it does.",
          "Once production of a made-to-order piece, or one in a custom size or fabric, has started it can't be cancelled, and we may keep the deposit to cover materials and work already done.",
        ],
      },
      {
        id: "returns",
        title: "Returns and refunds",
        body: [
          { list: [
            "In-stock pieces: return within 7 days of delivery if unused and in their original condition. A collection fee may apply.",
            "Made-to-order or customised pieces (special size, fabric or colour) and custom joinery can only be returned if faulty.",
            "Damaged or faulty: tell us within 48 hours of delivery, with photos, and we'll repair, replace or refund.",
          ] },
          "Refunds go back to your original payment method within 14 days of the return being approved. Tabby and Tamara payments are refunded through them.",
        ],
      },
      {
        id: "warranty",
        title: "Warranty",
        body: [
          "Upholstered furniture frames carry a 5-year warranty, and other manufacturing defects are covered for 12 months, from the delivery date.",
          "The warranty doesn't cover normal wear and tear, misuse, fading from sunlight, moisture damage, or pieces moved or altered by others.",
        ],
      },
      { id: "projects", title: "Projects and fit-out", body: ["Fit-out, commercial projects and custom joinery are governed by their own quotation or contract, which takes precedence where it differs from these terms."] },
      { id: "account", title: "Your account", body: ["You're responsible for keeping your account password private. You can edit your details or delete your account at any time from My account. We may suspend accounts that are misused."] },
      { id: "liability", title: "Liability", body: ["To the extent the law allows, we aren't liable for indirect losses. Nothing in these terms affects your rights under UAE Federal Law No. 15 of 2020 on Consumer Protection."] },
      { id: "law", title: "Governing law", body: ["These terms are governed by the laws of the United Arab Emirates as applied in the Emirate of Dubai, and the Dubai courts have jurisdiction over any dispute."] },
      { id: "contact", title: "Changes and contact", body: [`We may update these terms from time to time; the terms in force when you placed your order apply to it. Questions: ${s.email} or ${s.phone}.`] },
    ],
  };
}

export function privacy(ar: boolean, s: Store): LegalDoc {
  if (ar)
    return {
      title: "سياسة الخصوصية",
      intro: "نحترم خصوصيتك. توضح هذه السياسة البيانات التي نجمعها عند استخدامك لموقع تنفيذ، ولماذا، وكيف يمكنك التحكم بها.",
      sections: [
        { id: "who", title: "من نحن", body: [`${COMPANY.ar}، ${s.address}، هي الجهة المسؤولة عن بياناتك. للتواصل بخصوص الخصوصية: ${s.email}.`] },
        {
          id: "collect",
          title: "ما الذي نجمعه",
          body: [{ list: [
            "بيانات الحساب: الاسم، البريد الإلكتروني، الجوال، اسم الشركة، وكلمة المرور (مخزّنة بشكل مشفّر لا يمكن لأحد قراءته).",
            "بيانات الطلب: القطع المختارة، عنوان التوصيل، وطريقة الدفع. لا نخزّن أرقام البطاقات.",
            "طلبات عروض الأسعار والعينات والرسائل، بما فيها أي ملفات ترفعها.",
            "بيانات تقنية محدودة مثل عنوان IP لحماية الموقع من محاولات الدخول المتكررة.",
          ] }],
        },
        {
          id: "use",
          title: "كيف نستخدم بياناتك",
          body: [{ list: [
            "لتنفيذ طلبك وتوصيله وتركيبه والتواصل معك بشأنه.",
            "لإدارة حسابك وتسهيل إتمام الشراء.",
            "للرد على أسئلتك وطلبات عروض الأسعار.",
            "لحماية الموقع ومنع الاحتيال.",
            "لإرسال النشرة الإخبارية والعروض فقط إذا وافقت على ذلك.",
            "للوفاء بالتزاماتنا القانونية والضريبية.",
          ] }, "نعالج بياناتك وفقاً للمرسوم بقانون اتحادي رقم 45 لسنة 2021 بشأن حماية البيانات الشخصية."],
        },
        {
          id: "share",
          title: "مع من نشاركها",
          body: [
            "لا نبيع بياناتك أبداً. نشاركها فقط مع من يساعدنا في خدمتك:",
            { list: ["Cloudflare لاستضافة الموقع وقاعدة البيانات.", "تابي وتمارا ومزوّدي الدفع بالبطاقات عند اختيارك لهم.", "فريق التوصيل والتركيب.", "مزوّدي البريد الإلكتروني وواتساب عند مراسلتك."] },
            "قد تُعالج بعض البيانات خارج الإمارات عبر شبكة Cloudflare العالمية مع ضمانات حماية مناسبة.",
          ],
        },
        {
          id: "cookies",
          title: "ملفات تعريف الارتباط والتخزين",
          body: ["نستخدم فقط ما يلزم لعمل الموقع: تفضيل اللغة، وجلسة تسجيل الدخول، وسلة التسوق والمفضلة المحفوظة في متصفحك. لا نستخدم ملفات تتبع إعلانية أو تحليلات من أطراف ثالثة."],
        },
        { id: "keep", title: "مدة الاحتفاظ", body: ["نحتفظ ببيانات حسابك حتى تحذفه. نحتفظ بسجلات الطلبات والفواتير للمدة التي يتطلبها قانون الضرائب في الإمارات، ثم نحذفها."] },
        { id: "security", title: "حماية البيانات", body: ["الاتصال بالموقع مشفّر، وكلمات المرور مخزّنة بتشفير لا يمكن عكسه، والوصول إلى البيانات مقتصر على فريقنا المخوّل."] },
        {
          id: "rights",
          title: "حقوقك",
          body: [
            { list: ["الاطلاع على بياناتك وتصحيحها من صفحة «حسابي».", "حذف حسابك في أي وقت من «حسابي» ← «كلمة المرور».", "إلغاء الاشتراك في النشرة من «بياناتي».", "طلب نسخة من بياناتك أو الاعتراض على معالجتها بمراسلتنا."] },
            `للطلبات: ${s.email}. سنرد خلال 30 يوماً.`,
          ],
        },
        { id: "children", title: "الأطفال", body: ["الموقع غير موجّه لمن هم دون 18 عاماً، ولا نجمع بياناتهم عن قصد."] },
        { id: "changes", title: "التغييرات", body: ["قد نحدّث هذه السياسة، وسننشر النسخة الجديدة هنا مع تاريخ التحديث."] },
      ],
    };
  return {
    title: "Privacy policy",
    intro: "We respect your privacy. This policy explains what we collect when you use the TANFEEZ website, why, and how you stay in control of it.",
    sections: [
      { id: "who", title: "Who we are", body: [`${COMPANY.en}, ${s.address}, is responsible for your data. For privacy questions, write to ${s.email}.`] },
      {
        id: "collect",
        title: "What we collect",
        body: [{ list: [
          "Account details: name, email, mobile, company name, and your password (stored as an encrypted hash nobody can read).",
          "Order details: the pieces you choose, delivery address and payment method. We never store card numbers.",
          "Quote requests, sample requests and messages, including any files you upload.",
          "Limited technical data, such as your IP address, to protect the site from repeated sign-in attempts.",
        ] }],
      },
      {
        id: "use",
        title: "How we use it",
        body: [{ list: [
          "To make, deliver and install your order and keep you updated about it.",
          "To run your account and make checkout quicker.",
          "To answer your questions and quote requests.",
          "To keep the website secure and prevent fraud.",
          "To send our newsletter and offers, only if you've agreed to it.",
          "To meet our legal and tax obligations.",
        ] }, "We process your data in line with UAE Federal Decree-Law No. 45 of 2021 on the Protection of Personal Data."],
      },
      {
        id: "share",
        title: "Who we share it with",
        body: [
          "We never sell your data. We only share it with those who help us serve you:",
          { list: ["Cloudflare, which hosts the website and its database.", "Tabby, Tamara and card payment providers, when you choose them.", "Our delivery and installation team.", "Email and WhatsApp providers, when we message you."] },
          "Some data may be processed outside the UAE on Cloudflare's global network, with appropriate safeguards.",
        ],
      },
      {
        id: "cookies",
        title: "Cookies and storage",
        body: ["We only use what the website needs to work: your language choice, your sign-in session, and your bag and wishlist saved in your browser. We don't use advertising trackers or third-party analytics."],
      },
      { id: "keep", title: "How long we keep it", body: ["We keep your account details until you delete your account. Order and invoice records are kept for as long as UAE tax law requires, then deleted."] },
      { id: "security", title: "Keeping it safe", body: ["Connections to the website are encrypted, passwords are stored with one-way encryption, and access to customer data is limited to our authorised team."] },
      {
        id: "rights",
        title: "Your rights",
        body: [
          { list: ["See and correct your details in My account.", "Delete your account at any time in My account → Password.", "Unsubscribe from the newsletter in My details.", "Ask for a copy of your data, or object to how we use it, by writing to us."] },
          `Requests: ${s.email}. We'll reply within 30 days.`,
        ],
      },
      { id: "children", title: "Children", body: ["The website isn't intended for anyone under 18, and we don't knowingly collect their data."] },
      { id: "changes", title: "Changes", body: ["We may update this policy; the new version will be posted here with its date."] },
    ],
  };
}

/** The parts of the terms payment providers look for as a stand-alone refund policy. */
export function returnsPolicy(ar: boolean, s: Store): LegalDoc {
  const t = terms(ar, s);
  return {
    title: ar ? "الإرجاع والاسترداد" : "Returns & refunds",
    intro: ar
      ? "كل ما تحتاج معرفته عن التوصيل والإلغاء والإرجاع والاسترداد والضمان. هذه الصفحة جزء من شروط البيع."
      : "Everything about delivery, cancellations, returns, refunds and warranty in one place. This page is part of our Terms of sale.",
    sections: t.sections.filter((x) => ["delivery", "cancellations", "returns", "warranty", "contact"].includes(x.id)),
  };
}
