const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const dotenv = require('dotenv');

dotenv.config({ path: 'c:/Users/pc/Desktop/tranquil/.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

const products = [
  {
    name: "The Dream Bloom Dress",
    slug: "the-dream-bloom-dress",
    description: `The highlight of the dress is the large, romantic 3D flowers that decorate the top and the hem. Inside the petals, stiff <b>organza</b> fabric keeps the flowers full and perfectly in shape. To finish the look, each flower has pretty beads and crystals in the center that sparkle gently whenever you move.
( Dream Bloom Dress is available only on Customisation orders )`,
    price: 7500,
    compare_at_price: null,
    status: "active",
    brand: "Tranquil",
    fabric: "Organza",
    weight: 1200,
    tags: ["luxury", "3d flowers"],
    seo_title: "The Dream Bloom Dress | Tranquil",
    seo_description: "Luxury custom-made floral dress.",
    category_slug: "dresses",
    variants: [
      { color_name: "Ruby Red", color_hex: "#9B111E", size: "Custom", stock: 10 },
      { color_name: "Royal Navy Blue", color_hex: "#1F3A93", size: "Custom", stock: 10 },
      { color_name: "Hot Pink", color_hex: "#FF69B4", size: "Custom", stock: 10 }
    ]
  },
  {
    name: "Pink Denim Rose Bloom Dress",
    slug: "pink-denim-rose-bloom-dress",
    description: `Get ready to steal the show in our absolute best-selling dress. This beautifully structured pink denim mini-dress is designed to turn heads and keep you feeling fabulous all night long. The bodice features stunning, intricate 3D fabric roses that add a unique, hand-crafted touch. Below the structured top, a brilliantly gathered flounce skirt creates the perfect amount of playful volume and movement. This one-piece wonder is perfect for making a statement at:

<ul>
<li>A fun birthday party</li>
<li>A chic brunch with friends</li>
<li>An unforgettable dinner date</li>
</ul>`,
    price: 4500,
    compare_at_price: null,
    status: "active",
    brand: "Tranquil",
    fabric: "Premium Denim",
    weight: 700,
    tags: ["pink", "denim"],
    seo_title: "Pink Denim Rose Bloom Dress | Tranquil",
    seo_description: "Premium pink denim dress.",
    category_slug: "dresses",
    variants: [
      { color_name: "Blush Pink", color_hex: "#F48FD1", size: "S", stock: 10 },
      { color_name: "Blush Pink", color_hex: "#F48FD1", size: "M", stock: 10 },
      { color_name: "Blush Pink", color_hex: "#F48FD1", size: "L", stock: 10 }
    ]
  },
  {
    name: "The Olive Boss Girl Set",
    slug: "the-olive-boss-girl-set",
    description: `Made from premium, rich <b>pure Armani fabric</b>, this olive green set comes with a beautiful sleeveless top and matching pants. The top has a smart blazer-style collar and a lovely <b>peplum design</b> that flares out gently at the waist to give you a perfect, shaped look. The high-waist pants have a clean front line that makes you look taller and very elegant. It is the perfect choice for office meetings, formal events, or an upscale high-tea party. It is simple, comfortable, and highly sophisticated!

<b>Why You Will Love It:</b>
<ul>
<li><b>The Fabric:</b> Pure Armani fabric that looks expensive, stays wrinkle-free, and feels smooth on the skin.</li>
<li><b>The Fit:</b> Smart peplum top to shape your waist and flattering straight-leg formal pants.</li>
<li><b>The Vibe:</b> Elegant, confident, and absolutely modern.</li>
</ul>`,
    price: 3999,
    compare_at_price: 4600,
    status: "active",
    brand: "Tranquil",
    fabric: "Pure Armani",
    weight: 900,
    tags: ["office", "coord"],
    seo_title: "The Olive Boss Girl Set | Tranquil",
    seo_description: "Elegant co-ord set.",
    category_slug: "co-ords", // Adjust based on DB
    variants: [
      { color_name: "Olive Green", color_hex: "#708238", size: "S", stock: 10 },
      { color_name: "Olive Green", color_hex: "#708238", size: "M", stock: 10 },
      { color_name: "Olive Green", color_hex: "#708238", size: "L", stock: 10 }
    ]
  },
  {
    name: "Boho Chick Dress",
    slug: "boho-chick-dress",
    description: `This dress brings you the ultimate modern look by blending two unique styles: a trendy <b>black-and-white newspaper print</b> option and a vibrant <b>boho-chic pattern</b> featuring warm orange, red, and white tones.

Designed to make you look effortlessly fashionable, it features beautiful side waist cutouts and a gorgeous tie-up bow at the back. The long skirt comes with a high thigh slit that adds a touch of charm and allows for easy movement while you mingle.

It is the perfect choice for a sunny brunch, a casual afternoon gathering, or a sundowner party where you want to look uniquely stylish.`,
    price: 2200,
    compare_at_price: null,
    status: "active",
    brand: "Tranquil",
    fabric: "Crepe",
    weight: 550,
    tags: ["boho"],
    seo_title: "Boho Chick Dress | Tranquil",
    seo_description: "Boho maxi dress.",
    category_slug: "dresses",
    variants: [
      { color_name: "Burnt Orange / Ivory", color_hex: "#CC5500", size: "FS", stock: 10 }
    ]
  },
  {
    name: "Storybook Print Dress",
    slug: "storybook-print-dress",
    description: `This dress brings you the ultimate modern look by blending two unique styles: a trendy <b>black-and-white newspaper print</b> option and a vibrant <b>boho-chic pattern</b> featuring warm orange, red, and white tones.

Designed to make you look effortlessly fashionable, it features beautiful side waist cutouts and a gorgeous tie-up bow at the back. The long skirt comes with a high thigh slit that adds a touch of charm and allows for easy movement while you mingle.

It is the perfect choice for a sunny brunch, a casual afternoon gathering, or a sundowner party where you want to look uniquely stylish.`,
    price: 2200,
    compare_at_price: null,
    status: "active",
    brand: "Tranquil",
    fabric: "Crepe",
    weight: 550,
    tags: ["storybook"],
    seo_title: "Storybook Print Dress | Tranquil",
    seo_description: "Storybook print dress.",
    category_slug: "dresses",
    variants: [
      { color_name: "Black & Gray", color_hex: "#2B2B2B", size: "FS", stock: 10 }
    ]
  },
  {
    name: "The Emerald Royal Skirt Set",
    slug: "the-emerald-royal-skirt-set",
    description: `Made from premium, soft <b>pure Armani fabric</b>, this outfit features a sleek strapless top paired with a long, flowing skirt. The top is designed with a modern asymmetrical cut at the bottom that beautifully meets the skirt.

The long skirt is softly gathered at the waist to create lovely folds and includes a stylish high slit that lets you move comfortably. To complete the modern ethnic look, it comes with a matching fabric dupatta attached around the neck like a trendy scarf drape.

It is the perfect choice for festive fusion parties, premium cocktail events, or a special reception dinner. Simple to wear, highly stylish, and completely unique!`,
    price: 4999,
    compare_at_price: null,
    status: "active",
    brand: "Tranquil",
    fabric: "Pure Armani",
    weight: 950,
    tags: ["emerald"],
    seo_title: "Emerald Royal Skirt Set | Tranquil",
    seo_description: "Emerald skirt set.",
    category_slug: "co-ords", // Also Party Wear
    variants: [
      { color_name: "Emerald Green", color_hex: "#008D1F", size: "S", stock: 10 }
    ]
  },
  {
    name: "Sweet Whine Two-piece dress",
    slug: "sweet-whine-two-piece-dress",
    description: `While it looks like a seamless, beautiful single dress, it is actually a matching halter top and a layered, pleated skirt. The best part? You can easily mix and match them separately with your favorite satin long skirts or casual tops for entirely new party outfits`,
    price: 4200,
    compare_at_price: null,
    status: "active",
    brand: "Tranquil",
    fabric: "Premium Crepe",
    weight: 800,
    tags: ["wine"],
    seo_title: "Sweet Whine Two-piece Dress | Tranquil",
    seo_description: "Wine two-piece outfit.",
    category_slug: "co-ords", // Also Party Wear
    variants: [
      { color_name: "Wine Red", color_hex: "#722F37", size: "S", stock: 10 },
      { color_name: "Wine Red", color_hex: "#722F37", size: "M", stock: 10 },
      { color_name: "Wine Red", color_hex: "#722F37", size: "L", stock: 10 }
    ]
  },
  {
    name: "The Golden Bloom Armani Dress",
    slug: "the-golden-bloom-armani-dress",
    description: `This dress features a royal straight-cut fit that feels incredibly soft on your skin and looks expensive from every angle. The front is decorated with premium, hand-crafted <b>golden Dori artwork</b> that catches the light beautifully. To complete the high-end look, it features a matching neck-wrap dupatta finished with long, glittering golden metal fringes that swing gracefully as you walk.

<b>Why You Should Buy This Dress:</b>
<ul>
<li><b>Pure Luxury Fabric:</b> Made from premium Armani fabric that stays wrinkle-free, has a rich matte sheen, and gives you a flawless, high-class silhouette.</li>
<li><b>Royal Crafted Details:</b> The golden Dori embroidery and metallic tassel work look completely custom-made and high-fashion.</li>
<li><b>Perfect Fusion Style:</b> It mixes a modern western dress shape with traditional Indian golden work, making it the most unique outfit in the room.</li>
<li><b>Effortless Elegance:</b> It is a complete, ready-to-wear outfit that requires very little jewelry—the dress itself is a masterpiece! Perfect for grand parties, receptions, and festivals</li>
</ul>`,
    price: 3999,
    compare_at_price: null,
    status: "active",
    brand: "Tranquil",
    fabric: "Pure Armani",
    weight: 850,
    tags: ["golden"],
    seo_title: "Golden Bloom Armani Dress | Tranquil",
    seo_description: "Golden Armani dress.",
    category_slug: "dresses", // Also Party Wear
    variants: [
      { color_name: "Jet Black Metallic Gold", color_hex: "#111111", size: "S", stock: 10 }
    ]
  },
  {
    name: "The Little Orange Tank Top",
    slug: "the-little-orange-tank-top",
    description: `It features a super cute, hand-made orange slice patch made of bright orange beads right on the front. The soft, stretchy fabric keeps you comfortable all day long.

<b>Why You Should Buy This Top:</b>
<ul>
<li><b>Perfect for Daily Wear:</b> Easy to style, highly fashionable, and comfortable for long college or school days.</li>
<li><b>Versatile Style:</b> Looks amazing whether you tuck it into your favorite blue jeans or wear it with a cute skirt.</li>
<li><b>Trendy Vibe:</b> The warm rust color mixed with the quirky beaded patch gives a very fresh, modern look!</li>
</ul>`,
    price: 499,
    compare_at_price: null,
    status: "active",
    brand: "Tranquil",
    fabric: "Cotton Rib",
    weight: 200,
    tags: ["tank top"],
    seo_title: "Little Orange Tank Top | Tranquil",
    seo_description: "Orange tank top.",
    category_slug: "tops",
    variants: [
      { color_name: "Rust Orange", color_hex: "#B7410E", size: "FS", stock: 20 }
    ]
  },
  {
    name: "The Beaded Cherry Crop Top",
    slug: "the-beaded-cherry-crop-top",
    description: `It features a wide square neckline and a beautiful, hand-embroidered cherry patch made with red and green beads right on the chest. The soft, breathable fabric ensures all-day comfort for college days, day outings, or casual hangouts.

<b>Why You should Buy this top</b>
<ul>
<li><b>Super Trendy:</b> The cherry theme and deep red color are completely viral and highly fashionable right now.</li>
<li><b>Cute Beaded Detail:</b> The hand-embroidered patch gives it a unique, boutique-style look.</li>
<li><b>Looks Expensive, Costs Leas:</b> You will never find this high-end look at such an affordable, pocket-friendly price!</li>
</ul>`,
    price: 599,
    compare_at_price: null,
    status: "active",
    brand: "Tranquil",
    fabric: "Cotton Rib",
    weight: 220,
    tags: ["crop top"],
    seo_title: "Beaded Cherry Crop Top | Tranquil",
    seo_description: "Cherry crop top.",
    category_slug: "tops",
    variants: [
      { color_name: "Cherry Red", color_hex: "#C21833", size: "FS", stock: 20 }
    ]
  },
  {
    name: "The Red Carpet Rhinestone Midi",
    slug: "the-red-carpet-rhinestone-midi",
    description: `Turn heads instantly in this breathtaking red dress made from rich, <b>premium Armani fabric</b>. It features a beautiful sweetheart neckline and a unique, trendy asymmetric overlap design giving you a playful short dress look on one side and a dramatic long dress look on the other.

<b>Why You Should Buy This Dress:</b>
<ul>
<li><b>Unique High-Low Cut:</b> Trendy short dress on one side, dramatic long gown on the other.</li>
<li><b>Premium Armani Fabric:</b> Feels incredibly soft, stays wrinkle-free, and hugs your body beautifully.</li>
<li><b>Luxury Rhinestone Sparkle:</b> High-quality, glittering crystals on the straps and waist that catch every light.</li>
<li><b>Unbeatable Designer Value:</b> Get a high-fashion, boutique-style look at a highly affordable, pocket-friendly price!</li>
</ul>`,
    price: 4200,
    compare_at_price: null,
    status: "active",
    brand: "Tranquil",
    fabric: "Pure Armani",
    weight: 900,
    tags: ["party"],
    seo_title: "Red Carpet Rhinestone Midi | Tranquil",
    seo_description: "Red party dress.",
    category_slug: "dresses", // Also Party Wear
    variants: [
      { color_name: "Crimson Red", color_hex: "#C41E3A", size: "M", stock: 10 }
    ]
  },
  {
    name: "Powder Blue Mini Dress",
    slug: "powder-blue-mini-dress",
    description: `Get ready to steal the show in this highly unique powder blue mini dress. Crafted from premium <b>Barbie Crepe fabric</b>, this dress feels incredibly smooth, luxurious, and holds a beautiful structured shape. <b>You have never seen a design like this before</b>—it features a gorgeous sweetheart slip dress paired with a high-fashion, built-in shoulder shrug overlay that ties into sweet bows at the sleeves.

It is the ultimate statement piece to wear uniquely for your next birthday party or a fancy dinner out with friends!

<b>Why You Should Buy This Dress:</b>
<ul>
<li><b>Never-Before-Seen Design:</b> The special built-in shoulder cape and sleeve-bow detailing give it a completely one-of-a-kind boutique look.</li>
<li><b>Premium Barbie Crepe Fabric:</b> A high-quality, heavy-luxury fabric that looks expensive, resists wrinkles, and fits flawlessly.</li>
<li><b>The Perfect Party Choice:</b> Make unforgettable memories looking like a modern-day doll at birthday celebrations and dinner dates!</li>
</ul>`,
    price: 5200,
    compare_at_price: null,
    status: "active",
    brand: "Tranquil",
    fabric: "Barbie Crepe",
    weight: 750,
    tags: ["party"],
    seo_title: "Powder Blue Mini Dress | Tranquil",
    seo_description: "Powder blue mini dress.",
    category_slug: "dresses", // Also Party Wear
    variants: [
      { color_name: "Powder Blue", color_hex: "#B0E0E6", size: "S", stock: 10 },
      { color_name: "Powder Blue", color_hex: "#B0E0E6", size: "M", stock: 10 },
      { color_name: "Powder Blue", color_hex: "#B0E0E6", size: "L", stock: 10 }
    ]
  }
];

async function insertProducts() {
  console.log("Fetching categories...");
  const { data: categories, error: catError } = await supabase.from('categories').select('id, slug, name');
  if (catError) {
    console.error("Error fetching categories:", catError);
    return;
  }
  
  const categoryMap = categories.reduce((map, cat) => {
    map[cat.slug] = cat.id;
    return map;
  }, {});
  
  const partyWearId = categories.find(c => c.name.toLowerCase().includes('party'))?.id;

  for (const productData of products) {
    console.log('Inserting product: ' + productData.name);
    
    // Check if exists
    const { data: existing } = await supabase.from('products').select('id, slug').eq('slug', productData.slug).single();
    if (existing) {
      console.log('Product ' + productData.slug + ' already exists, skipping insert and updating description...');
      const { error: updateErr } = await supabase.from('products').update({ description: productData.description }).eq('slug', productData.slug);
      if(updateErr) console.log(updateErr);
      continue; // Skip the rest if it already exists
    }

    const baseSku = 'TR-' + Math.random().toString(36).substring(2, 8).toUpperCase();

    const { data: newProduct, error: productError } = await supabase.from('products').insert({
      name: productData.name,
      slug: productData.slug,
      description: productData.description,
      price: productData.price,
      compare_at_price: productData.compare_at_price,
      status: productData.status,
      brand: productData.brand,
      fabric: productData.fabric,
      weight: productData.weight,
      tags: productData.tags,
      seo_title: productData.seo_title,
      seo_description: productData.seo_description,
      sku: baseSku
    }).select().single();

    if (productError) {
      console.error('Error inserting ' + productData.name + ':', productError);
      continue;
    }

    // Insert Category Links
    const catId = categoryMap[productData.category_slug];
    if (catId) {
      await supabase.from('product_categories').insert({
        product_id: newProduct.id,
        category_id: catId
      });
    }
    
    // Add to party wear if it's a party dress
    if (partyWearId && (productData.category_slug === 'dresses' || productData.category_slug === 'co-ords') && productData.price >= 3000) {
      await supabase.from('product_categories').insert({
        product_id: newProduct.id,
        category_id: partyWearId
      });
    }

    // Insert Variants
    for (const variant of productData.variants) {
      const variantSku = baseSku + '-' + variant.color_name.substring(0, 3).toUpperCase() + '-' + variant.size;
      await supabase.from('product_variants').insert({
        product_id: newProduct.id,
        color_name: variant.color_name,
        color_hex: variant.color_hex,
        size: variant.size,
        sku: variantSku,
        stock_quantity: variant.stock,
        price_adjustment: 0
      });
    }
    
    console.log('Successfully inserted ' + productData.name);
  }
}

insertProducts().then(() => console.log("Done")).catch(console.error);
