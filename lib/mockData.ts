import {
  DirectionsResult,
  IntentFilters,
  LatLng,
  PrayerTimes,
  RecommendedPlace,
  TravelDNA,
  WeatherInfo,
} from "./types";

// ---------------------------------------------------------------------------
// Realistic Saudi tourism demo data. Used as a safety net if Gemini/Places/
// Directions keys are missing or a request fails, so the demo never breaks.
// ---------------------------------------------------------------------------

export interface PlaceSeed {
  name: string;
  nameAr: string;
  category: "history" | "nature" | "food" | "culture" | "shopping" | "photography";
  crowdLevel: "low" | "medium" | "high";
  indoorOutdoor: "indoor" | "outdoor" | "mixed";
  walkingLevel: "low" | "moderate" | "high";
  costSAR: number;
  durationMinutes: number;
  mapQuery: string;
  lat: number;
  lng: number;
  accessibilityInfo: string;
  accessibilityInfoAr: string;
  quietAlternativeOf?: string; // name of the busier place this can replace
}

export const CITIES = [
  "Riyadh", "Jeddah", "Makkah", "AlUla", "Diriyah", "Abha", "Madinah", "Dammam", "Khobar", "Dhahran",
  "Buraidah", "Unaizah", "AlRass", "Hail",
  "Taif", "AlBaha", "Tabuk", "Najran", "Jazan", "Yanbu", "Jubail", "HafarAlBatin", "Arar", "Sakaka",
  "Bisha", "AlKharj", "AlAhsa", "Qatif", "Rabigh", "KhamisMushait",
];

export const CITY_CENTERS: Record<string, LatLng> = {
  Riyadh: { lat: 24.7136, lng: 46.6753 },
  Jeddah: { lat: 21.5433, lng: 39.1728 },
  Makkah: { lat: 21.3891, lng: 39.8579 },
  AlUla: { lat: 26.6094, lng: 37.9236 },
  Diriyah: { lat: 24.7386, lng: 46.575 },
  Abha: { lat: 18.2465, lng: 42.5117 },
  Madinah: { lat: 24.5247, lng: 39.5692 },
  Dammam: { lat: 26.4207, lng: 50.0888 },
  Khobar: { lat: 26.2172, lng: 50.1971 },
  Dhahran: { lat: 26.2361, lng: 50.0393 },
  Buraidah: { lat: 26.326, lng: 43.975 },
  Unaizah: { lat: 26.0975, lng: 43.9903 },
  AlRass: { lat: 25.8697, lng: 43.5027 },
  Hail: { lat: 27.5114, lng: 41.7208 },
  Taif: { lat: 21.2703, lng: 40.4158 },
  AlBaha: { lat: 20.0129, lng: 41.4677 },
  Tabuk: { lat: 28.3998, lng: 36.5715 },
  Najran: { lat: 17.4933, lng: 44.1277 },
  Jazan: { lat: 16.8892, lng: 42.5611 },
  Yanbu: { lat: 24.0895, lng: 38.0618 },
  Jubail: { lat: 27.0046, lng: 49.6605 },
  HafarAlBatin: { lat: 28.4342, lng: 45.9601 },
  Arar: { lat: 30.9753, lng: 41.0381 },
  Sakaka: { lat: 29.9697, lng: 40.2064 },
  Bisha: { lat: 19.9842, lng: 42.6046 },
  AlKharj: { lat: 24.1556, lng: 47.335 },
  AlAhsa: { lat: 25.3838, lng: 49.5875 },
  Qatif: { lat: 26.5205, lng: 50.0086 },
  Rabigh: { lat: 22.7986, lng: 39.0327 },
  KhamisMushait: { lat: 18.3, lng: 42.7297 },
};

export const PLACES: Record<string, PlaceSeed[]> = {
  Riyadh: [
    { name: "At-Turaif District", nameAr: "حي الطريف", category: "history", crowdLevel: "high", indoorOutdoor: "outdoor", walkingLevel: "moderate", costSAR: 45, durationMinutes: 120, mapQuery: "At-Turaif District Diriyah Riyadh", lat: 24.7333, lng: 46.575, accessibilityInfo: "Paved walkways with ramps at main entrances; some sections have uneven historic terrain", accessibilityInfoAr: "ممرات مرصوفة مع منحدرات عند المداخل الرئيسية؛ بعض الأقسام فيها أرضية تاريخية غير مستوية" },
    { name: "National Museum of Saudi Arabia", nameAr: "المتحف الوطني السعودي", category: "history", crowdLevel: "low", indoorOutdoor: "indoor", walkingLevel: "low", costSAR: 10, durationMinutes: 90, mapQuery: "National Museum of Saudi Arabia Riyadh", lat: 24.6408, lng: 46.7099, quietAlternativeOf: "At-Turaif District", accessibilityInfo: "Wheelchair-accessible entrance and elevators between floors; accessible restrooms", accessibilityInfoAr: "مدخل ومصاعد بين الطوابق مناسبة للكراسي المتحركة؛ دورات مياه مخصصة" },
    { name: "Edge of the World", nameAr: "حافة العالم", category: "nature", crowdLevel: "medium", indoorOutdoor: "outdoor", walkingLevel: "high", costSAR: 0, durationMinutes: 180, mapQuery: "Edge of the World Riyadh", lat: 24.9756, lng: 45.9114, accessibilityInfo: "Off-road desert terrain with no paved paths — not wheelchair accessible", accessibilityInfoAr: "أرض صحراوية وعرة بدون ممرات مرصوفة — غير مناسبة للكراسي المتحركة" },
    { name: "Wadi Namar", nameAr: "وادي نمار", category: "nature", crowdLevel: "low", indoorOutdoor: "outdoor", walkingLevel: "low", costSAR: 0, durationMinutes: 60, mapQuery: "Wadi Namar Riyadh", lat: 24.5735, lng: 46.7247, accessibilityInfo: "Paved walking path along the water, wheelchair-friendly in most sections", accessibilityInfoAr: "ممر مشي مرصوف بجانب المياه، مناسب للكراسي المتحركة في معظم الأقسام" },
    { name: "Kingdom Centre Sky Bridge", nameAr: "جسر مركز المملكة", category: "photography", crowdLevel: "high", indoorOutdoor: "indoor", walkingLevel: "low", costSAR: 70, durationMinutes: 45, mapQuery: "Kingdom Centre Sky Bridge Riyadh", lat: 24.7116, lng: 46.6753, accessibilityInfo: "Elevator access to the Sky Bridge; wheelchair-accessible throughout", accessibilityInfoAr: "الوصول بالمصعد إلى جسر السكاي بريدج؛ مناسب للكراسي المتحركة بالكامل" },
    { name: "Riyadh Calligraphy House", nameAr: "بيت الرياض للخط", category: "culture", crowdLevel: "low", indoorOutdoor: "indoor", walkingLevel: "low", costSAR: 0, durationMinutes: 60, mapQuery: "Riyadh Calligraphy House", lat: 24.6877, lng: 46.6857, quietAlternativeOf: "Kingdom Centre Sky Bridge", accessibilityInfo: "Ground-floor galleries accessible; ramp at the main entrance", accessibilityInfoAr: "قاعات الطابق الأرضي يمكن الوصول إليها؛ يوجد منحدر عند المدخل الرئيسي" },
    { name: "Souq Al Zal", nameAr: "سوق الزل", category: "shopping", crowdLevel: "medium", indoorOutdoor: "mixed", walkingLevel: "moderate", costSAR: 0, durationMinutes: 75, mapQuery: "Souq Al Zal Riyadh", lat: 24.6274, lng: 46.7136, accessibilityInfo: "Narrow alleys with uneven stone paving — limited wheelchair access", accessibilityInfoAr: "أزقة ضيقة بأرضية حجرية غير مستوية — إمكانية وصول محدودة للكراسي المتحركة" },
    { name: "Najd Village Restaurant", nameAr: "قرية نجد", category: "food", crowdLevel: "medium", indoorOutdoor: "indoor", walkingLevel: "low", costSAR: 90, durationMinutes: 75, mapQuery: "Najd Village Restaurant Riyadh", lat: 24.6913, lng: 46.6851, accessibilityInfo: "Ramp at entrance and accessible seating available; some sections have traditional floor seating", accessibilityInfoAr: "يوجد منحدر عند المدخل وطاولات يمكن الوصول إليها؛ بعض الأقسام فيها جلسات أرضية تقليدية" },
  ],
  Jeddah: [
    { name: "Al-Balad Historic District", nameAr: "البلد التاريخية", category: "history", crowdLevel: "high", indoorOutdoor: "outdoor", walkingLevel: "high", costSAR: 0, durationMinutes: 150, mapQuery: "Al-Balad Jeddah", lat: 21.4839, lng: 39.1827, accessibilityInfo: "Narrow historic alleys with uneven cobblestone paving — difficult for wheelchairs", accessibilityInfoAr: "أزقة تاريخية ضيقة بأرضية حصى غير مستوية — صعبة على الكراسي المتحركة" },
    { name: "Naseef House Museum", nameAr: "بيت نصيف", category: "history", crowdLevel: "low", indoorOutdoor: "indoor", walkingLevel: "low", costSAR: 15, durationMinutes: 60, mapQuery: "Naseef House Jeddah", lat: 21.4846, lng: 39.1839, quietAlternativeOf: "Al-Balad Historic District", accessibilityInfo: "Multi-story historic house with stairs only — no elevator", accessibilityInfoAr: "منزل تاريخي متعدد الطوابق بسلالم فقط — لا يوجد مصعد" },
    { name: "Jeddah Corniche", nameAr: "كورنيش جدة", category: "nature", crowdLevel: "medium", indoorOutdoor: "outdoor", walkingLevel: "moderate", costSAR: 0, durationMinutes: 90, mapQuery: "Jeddah Corniche", lat: 21.5433, lng: 39.0996, accessibilityInfo: "Paved waterfront promenade, wheelchair-accessible", accessibilityInfoAr: "ممشى ساحلي مرصوف، مناسب للكراسي المتحركة" },
    { name: "King Fahd Fountain", nameAr: "نافورة الملك فهد", category: "photography", crowdLevel: "high", indoorOutdoor: "outdoor", walkingLevel: "low", costSAR: 0, durationMinutes: 30, mapQuery: "King Fahd Fountain Jeddah", lat: 21.5624, lng: 39.1, accessibilityInfo: "Accessible viewing area along the paved corniche", accessibilityInfoAr: "منطقة مشاهدة يسهل الوصول إليها على طول الكورنيش المرصوف" },
    { name: "Al Shallal Theme Park", nameAr: "الشلال", category: "photography", crowdLevel: "low", indoorOutdoor: "mixed", walkingLevel: "low", costSAR: 50, durationMinutes: 60, mapQuery: "Al Shallal Jeddah", lat: 21.573, lng: 39.15, quietAlternativeOf: "King Fahd Fountain", accessibilityInfo: "Paved paths throughout the park; ride accessibility varies by attraction", accessibilityInfoAr: "ممرات مرصوفة في كل الحديقة؛ إمكانية الوصول للألعاب تختلف حسب اللعبة" },
    { name: "Baik Fahad", nameAr: "بيك فهد", category: "food", crowdLevel: "medium", indoorOutdoor: "indoor", walkingLevel: "low", costSAR: 35, durationMinutes: 45, mapQuery: "Baik Fahad Jeddah", lat: 21.5433, lng: 39.1728, accessibilityInfo: "Ground-floor accessible seating and ordering counter", accessibilityInfoAr: "طاولات ومنطقة الطلب في الطابق الأرضي يمكن الوصول إليها" },
  ],
  AlUla: [
    { name: "Hegra (Madain Salih)", nameAr: "الحِجر (مدائن صالح)", category: "history", crowdLevel: "high", indoorOutdoor: "outdoor", walkingLevel: "moderate", costSAR: 150, durationMinutes: 180, mapQuery: "Hegra AlUla", lat: 26.7944, lng: 37.9542, accessibilityInfo: "Sandy, uneven desert terrain; accessible viewing platforms at key tombs", accessibilityInfoAr: "أرض صحراوية رملية غير مستوية؛ منصات مشاهدة مخصصة عند بعض المقابر الرئيسية" },
    { name: "AlUla Old Town", nameAr: "بلدة العلا القديمة", category: "history", crowdLevel: "low", indoorOutdoor: "outdoor", walkingLevel: "moderate", costSAR: 0, durationMinutes: 90, mapQuery: "AlUla Old Town", lat: 26.61, lng: 37.92, quietAlternativeOf: "Hegra (Madain Salih)", accessibilityInfo: "Uneven mudbrick alleys — limited wheelchair access in older sections", accessibilityInfoAr: "أزقة طينية غير مستوية — إمكانية وصول محدودة للكراسي المتحركة بالأقسام القديمة" },
    { name: "Elephant Rock", nameAr: "صخرة الفيل", category: "nature", crowdLevel: "medium", indoorOutdoor: "outdoor", walkingLevel: "low", costSAR: 0, durationMinutes: 60, mapQuery: "Elephant Rock AlUla", lat: 26.6294, lng: 37.88, accessibilityInfo: "Unpaved sand approach to the viewpoint — not wheelchair accessible", accessibilityInfoAr: "الطريق إلى نقطة المشاهدة رملي غير مرصوف — غير مناسب للكراسي المتحركة" },
    { name: "Maraya Concert Hall", nameAr: "مرايا", category: "culture", crowdLevel: "low", indoorOutdoor: "indoor", walkingLevel: "low", costSAR: 0, durationMinutes: 45, mapQuery: "Maraya AlUla", lat: 26.6103, lng: 37.9247, accessibilityInfo: "Fully wheelchair-accessible modern venue with elevators", accessibilityInfoAr: "مبنى حديث مناسب بالكامل للكراسي المتحركة مع مصاعد" },
  ],
  Diriyah: [
    { name: "Bujairi Terrace", nameAr: "شرفة البجيري", category: "food", crowdLevel: "high", indoorOutdoor: "outdoor", walkingLevel: "low", costSAR: 100, durationMinutes: 90, mapQuery: "Bujairi Terrace Diriyah", lat: 24.7386, lng: 46.575, accessibilityInfo: "Paved terrace with wheelchair-accessible restaurant entrances", accessibilityInfoAr: "شرفة مرصوفة بمداخل مطاعم يمكن الوصول إليها بالكراسي المتحركة" },
    { name: "Diriyah Art Futures", nameAr: "مستقبل الفن بالدرعية", category: "culture", crowdLevel: "low", indoorOutdoor: "indoor", walkingLevel: "low", costSAR: 0, durationMinutes: 60, mapQuery: "Diriyah Art Futures", lat: 24.735, lng: 46.573, quietAlternativeOf: "Bujairi Terrace", accessibilityInfo: "Modern gallery with wheelchair-accessible entrance and exhibit spaces", accessibilityInfoAr: "معرض حديث بمدخل وقاعات عرض يمكن الوصول إليها بالكراسي المتحركة" },
  ],
  Abha: [
    { name: "Al Soudah Park", nameAr: "متنزه السودة", category: "nature", crowdLevel: "medium", indoorOutdoor: "outdoor", walkingLevel: "high", costSAR: 20, durationMinutes: 120, mapQuery: "Al Soudah Park Abha", lat: 18.27, lng: 42.36, accessibilityInfo: "Cable car available; paved viewpoints, but hiking trails are steep and uneven", accessibilityInfoAr: "يتوفر تلفريك؛ نقاط مشاهدة مرصوفة، لكن مسارات المشي شديدة الانحدار وغير مستوية" },
    { name: "Habala Village", nameAr: "قرية حبالة", category: "history", crowdLevel: "low", indoorOutdoor: "outdoor", walkingLevel: "moderate", costSAR: 30, durationMinutes: 90, mapQuery: "Habala Village Abha", lat: 18.12, lng: 42.47, accessibilityInfo: "Steep cliffside terrain reached by cable car; limited wheelchair mobility on-site", accessibilityInfoAr: "أرض جبلية شديدة الانحدار يتم الوصول إليها بالتلفريك؛ حركة الكراسي المتحركة محدودة بالموقع" },
  ],
  Madinah: [
    { name: "Quba Mosque", nameAr: "مسجد قباء", category: "history", crowdLevel: "medium", indoorOutdoor: "indoor", walkingLevel: "low", costSAR: 0, durationMinutes: 60, mapQuery: "Quba Mosque Madinah", lat: 24.4392, lng: 39.6172, accessibilityInfo: "Fully wheelchair-accessible with ramps and accessible restrooms", accessibilityInfoAr: "مناسب بالكامل للكراسي المتحركة مع منحدرات ودورات مياه مخصصة" },
    { name: "Al-Baqi Cemetery View", nameAr: "البقيع", category: "history", crowdLevel: "low", indoorOutdoor: "outdoor", walkingLevel: "low", costSAR: 0, durationMinutes: 30, mapQuery: "Al Baqi Madinah", lat: 24.47, lng: 39.6117, accessibilityInfo: "Flat, paved viewing area — wheelchair-accessible", accessibilityInfoAr: "منطقة مشاهدة مرصوفة ومستوية — مناسبة للكراسي المتحركة" },
  ],
  Dammam: [
    { name: "Dammam Corniche", nameAr: "كورنيش الدمام", category: "nature", crowdLevel: "medium", indoorOutdoor: "outdoor", walkingLevel: "moderate", costSAR: 0, durationMinutes: 90, mapQuery: "Dammam Corniche", lat: 26.445, lng: 50.105, accessibilityInfo: "Paved waterfront promenade, wheelchair-accessible", accessibilityInfoAr: "ممشى ساحلي مرصوف، مناسب للكراسي المتحركة" },
    { name: "King Fahd Park Dammam", nameAr: "منتزه الملك فهد بالدمام", category: "nature", crowdLevel: "medium", indoorOutdoor: "outdoor", walkingLevel: "low", costSAR: 0, durationMinutes: 90, mapQuery: "King Fahd Park Dammam", lat: 26.4367, lng: 50.1046, accessibilityInfo: "Paved family park paths, wheelchair-friendly", accessibilityInfoAr: "ممرات منتزه عائلي مرصوفة، مناسبة للكراسي المتحركة" },
  ],
  Khobar: [
    { name: "Half Moon Bay", nameAr: "شاطئ نصف القمر", category: "nature", crowdLevel: "medium", indoorOutdoor: "outdoor", walkingLevel: "low", costSAR: 0, durationMinutes: 120, mapQuery: "Half Moon Bay Khobar", lat: 26.1089, lng: 50.1739, accessibilityInfo: "Sandy beach with paved access points near parking — soft sand limits wheelchair range", accessibilityInfoAr: "شاطئ رملي بمداخل مرصوفة قرب مواقف السيارات — الرمل الناعم يحد من حركة الكراسي المتحركة" },
    { name: "Khobar Corniche", nameAr: "كورنيش الخبر", category: "nature", crowdLevel: "medium", indoorOutdoor: "outdoor", walkingLevel: "moderate", costSAR: 0, durationMinutes: 90, mapQuery: "Khobar Corniche", lat: 26.2833, lng: 50.2, accessibilityInfo: "Paved waterfront walkway, wheelchair-accessible", accessibilityInfoAr: "ممشى ساحلي مرصوف، مناسب للكراسي المتحركة" },
  ],
  Dhahran: [
    { name: "Ithra (King Abdulaziz Center for World Culture)", nameAr: "إثراء (مركز الملك عبدالعزيز الثقافي العالمي)", category: "culture", crowdLevel: "medium", indoorOutdoor: "indoor", walkingLevel: "low", costSAR: 30, durationMinutes: 150, mapQuery: "Ithra King Abdulaziz Center Dhahran", lat: 26.3049, lng: 50.1441, accessibilityInfo: "Fully wheelchair-accessible modern building with elevators and accessible restrooms", accessibilityInfoAr: "مبنى حديث مناسب بالكامل للكراسي المتحركة مع مصاعد ودورات مياه مخصصة" },
    { name: "Dhahran Hills Park", nameAr: "منتزه تلال الظهران", category: "nature", crowdLevel: "low", indoorOutdoor: "outdoor", walkingLevel: "moderate", costSAR: 0, durationMinutes: 60, mapQuery: "Dhahran Hills Park", lat: 26.2833, lng: 50.1167, accessibilityInfo: "Paved paths through landscaped hills; some sloped sections", accessibilityInfoAr: "ممرات مرصوفة عبر التلال المنسقة؛ بعض الأقسام منحدرة" },
  ],
  Buraidah: [
    { name: "Buraidah Central Souq", nameAr: "سوق بريدة المركزي", category: "shopping", crowdLevel: "medium", indoorOutdoor: "mixed", walkingLevel: "moderate", costSAR: 0, durationMinutes: 75, mapQuery: "Buraidah Central Souq", lat: 26.326, lng: 43.975, accessibilityInfo: "Mostly paved market lanes; some sections crowded and uneven", accessibilityInfoAr: "ممرات السوق مرصوفة غالبًا؛ بعض الأقسام مزدحمة وغير مستوية" },
    { name: "Prince Faisal bin Bandar Park", nameAr: "منتزه الأمير فيصل بن بندر", category: "nature", crowdLevel: "medium", indoorOutdoor: "outdoor", walkingLevel: "low", costSAR: 0, durationMinutes: 60, mapQuery: "Prince Faisal bin Bandar Park Buraidah", lat: 26.3407, lng: 43.9721, accessibilityInfo: "Paved family park paths, wheelchair-friendly", accessibilityInfoAr: "ممرات منتزه عائلي مرصوفة، مناسبة للكراسي المتحركة" },
  ],
  Unaizah: [
    { name: "Unaizah Old Town", nameAr: "بلدة عنيزة القديمة", category: "history", crowdLevel: "low", indoorOutdoor: "outdoor", walkingLevel: "moderate", costSAR: 0, durationMinutes: 90, mapQuery: "Unaizah Old Town", lat: 26.0975, lng: 43.9903, accessibilityInfo: "Uneven mudbrick alleys — limited wheelchair access in older sections", accessibilityInfoAr: "أزقة طينية غير مستوية — إمكانية وصول محدودة للكراسي المتحركة بالأقسام القديمة" },
    { name: "Al Bassam Heritage House", nameAr: "بيت البسام التراثي", category: "history", crowdLevel: "low", indoorOutdoor: "indoor", walkingLevel: "low", costSAR: 10, durationMinutes: 45, mapQuery: "Al Bassam Heritage House Unaizah", lat: 26.0989, lng: 43.9925, accessibilityInfo: "Historic house museum — ground floor accessible, upper floors stairs only", accessibilityInfoAr: "بيت تراثي متحول لمتحف — الطابق الأرضي يمكن الوصول إليه، الطوابق العلوية بسلالم فقط" },
  ],
  AlRass: [
    { name: "Al-Rass Palm Oasis", nameAr: "واحة نخيل الرس", category: "nature", crowdLevel: "low", indoorOutdoor: "outdoor", walkingLevel: "moderate", costSAR: 0, durationMinutes: 60, mapQuery: "Al-Rass Palm Oasis", lat: 25.8697, lng: 43.5027, accessibilityInfo: "Unpaved agricultural paths through the oasis — limited wheelchair access", accessibilityInfoAr: "ممرات زراعية غير مرصوفة داخل الواحة — إمكانية وصول محدودة للكراسي المتحركة" },
    { name: "Al-Rass Historic Souq", nameAr: "سوق الرس التاريخي", category: "shopping", crowdLevel: "low", indoorOutdoor: "mixed", walkingLevel: "moderate", costSAR: 0, durationMinutes: 60, mapQuery: "Al-Rass Historic Souq", lat: 25.8672, lng: 43.4986, accessibilityInfo: "Mostly paved market lanes; some older sections uneven", accessibilityInfoAr: "ممرات السوق مرصوفة غالبًا؛ بعض الأقسام القديمة غير مستوية" },
  ],
  Hail: [
    { name: "Al Qishlah Palace", nameAr: "قصر القشلة", category: "history", crowdLevel: "low", indoorOutdoor: "outdoor", walkingLevel: "moderate", costSAR: 0, durationMinutes: 60, mapQuery: "Al Qishlah Palace Hail", lat: 27.5219, lng: 41.6907, accessibilityInfo: "Historic fort with uneven stone terrain — limited wheelchair access", accessibilityInfoAr: "قلعة تاريخية بأرضية حجرية غير مستوية — إمكانية وصول محدودة للكراسي المتحركة" },
    { name: "Hail Heritage Village", nameAr: "قرية حائل التراثية", category: "culture", crowdLevel: "low", indoorOutdoor: "mixed", walkingLevel: "low", costSAR: 0, durationMinutes: 60, mapQuery: "Hail Heritage Village", lat: 27.515, lng: 41.695, accessibilityInfo: "Mostly flat paths with some indoor exhibit halls", accessibilityInfoAr: "ممرات مستوية غالبًا مع بعض القاعات الداخلية للمعروضات" },
  ],
  Taif: [
    { name: "Al Rudaf Park", nameAr: "منتزه الرداف", category: "nature", crowdLevel: "medium", indoorOutdoor: "outdoor", walkingLevel: "low", costSAR: 0, durationMinutes: 90, mapQuery: "Al Rudaf Park Taif", lat: 21.2854, lng: 40.4239, accessibilityInfo: "Paved walking paths and family areas, wheelchair-friendly", accessibilityInfoAr: "ممرات مشي مرصوفة ومناطق عائلية، مناسبة للكراسي المتحركة" },
    { name: "Al-Shafa Mountain Viewpoint", nameAr: "جبل الشفا", category: "photography", crowdLevel: "medium", indoorOutdoor: "outdoor", walkingLevel: "high", costSAR: 0, durationMinutes: 120, mapQuery: "Al-Shafa Mountain Taif", lat: 21.05, lng: 40.2833, accessibilityInfo: "Mountain terrain with uneven, unpaved viewpoints — not wheelchair accessible", accessibilityInfoAr: "أرض جبلية غير مستوية وغير مرصوفة عند نقاط المشاهدة — غير مناسبة للكراسي المتحركة" },
  ],
  AlBaha: [
    { name: "Raghadan Forest Park", nameAr: "متنزه رغدان", category: "nature", crowdLevel: "medium", indoorOutdoor: "outdoor", walkingLevel: "moderate", costSAR: 10, durationMinutes: 120, mapQuery: "Raghadan Forest Park Al Baha", lat: 20.0089, lng: 41.4436, accessibilityInfo: "Paved main paths through the forest; some viewpoints require walking on uneven ground", accessibilityInfoAr: "ممرات رئيسية مرصوفة داخل الغابة؛ بعض نقاط المشاهدة تتطلب مشي على أرض غير مستوية" },
    { name: "Dhee Ayn Marble Village", nameAr: "قرية ذي عين", category: "history", crowdLevel: "medium", indoorOutdoor: "outdoor", walkingLevel: "high", costSAR: 0, durationMinutes: 90, mapQuery: "Dhee Ayn Village Al Baha", lat: 19.9736, lng: 41.6242, accessibilityInfo: "Historic hillside village built on marble rock with steep, uneven paths — not wheelchair accessible", accessibilityInfoAr: "قرية تاريخية مبنية على صخر رخامي بمسارات شديدة الانحدار وغير مستوية — غير مناسبة للكراسي المتحركة" },
  ],
};

export function getWeatherMock(city: string): WeatherInfo {
  const table: Record<string, WeatherInfo> = {
    Riyadh: { city, tempC: 41, condition: "Sunny", feelsLikeC: 44 },
    Jeddah: { city, tempC: 36, condition: "Humid", feelsLikeC: 39 },
    AlUla: { city, tempC: 38, condition: "Clear", feelsLikeC: 37 },
    Diriyah: { city, tempC: 40, condition: "Sunny", feelsLikeC: 43 },
    Abha: { city, tempC: 24, condition: "Mild, cloudy", feelsLikeC: 23 },
    Madinah: { city, tempC: 39, condition: "Sunny", feelsLikeC: 41 },
  };
  return table[city] ?? { city, tempC: 35, condition: "Sunny", feelsLikeC: 37 };
}

export const CITY_NAMES_AR: Record<string, string> = {
  Riyadh: "الرياض",
  Jeddah: "جدة",
  Makkah: "مكة المكرمة",
  AlUla: "العلا",
  Diriyah: "الدرعية",
  Abha: "أبها",
  Madinah: "المدينة المنورة",
  Dammam: "الدمام",
  Khobar: "الخبر",
  Dhahran: "الظهران",
  Buraidah: "بريدة",
  Unaizah: "عنيزة",
  AlRass: "الرس",
  Hail: "حائل",
  Taif: "الطائف",
  AlBaha: "الباحة",
  Tabuk: "تبوك",
  Najran: "نجران",
  Jazan: "جازان",
  Yanbu: "ينبع",
  Jubail: "الجبيل",
  HafarAlBatin: "حفر الباطن",
  Arar: "عرعر",
  Sakaka: "سكاكا",
  Bisha: "بيشة",
  AlKharj: "الخرج",
  AlAhsa: "الأحساء",
  Qatif: "القطيف",
  Rabigh: "رابغ",
  KhamisMushait: "خميس مشيط",
};

// Keyword -> city, for detecting an explicit city mention in a chat message.
// Explicit mentions always override the auto-detected (geolocation) city.
// Only ONE spelling per hamza/taa-marbuta variant is needed — normalizeArabic
// (below) already collapses common variations (ابها/أبها, حايل/حائل, etc.)
// before matching, so a single canonical form covers casual typing too.
const CITY_KEYWORDS: [string, string][] = [
  ["riyadh", "Riyadh"],
  ["الرياض", "Riyadh"],
  ["jeddah", "Jeddah"],
  ["jedda", "Jeddah"],
  ["جدة", "Jeddah"],
  ["makkah", "Makkah"],
  ["mecca", "Makkah"],
  ["مكة", "Makkah"],
  ["alula", "AlUla"],
  ["al-ula", "AlUla"],
  ["العلا", "AlUla"],
  ["diriyah", "Diriyah"],
  ["الدرعية", "Diriyah"],
  ["abha", "Abha"],
  ["أبها", "Abha"],
  ["madinah", "Madinah"],
  ["medina", "Madinah"],
  ["المدينة المنورة", "Madinah"],
  ["المدينة", "Madinah"],
  ["dammam", "Dammam"],
  ["الدمام", "Dammam"],
  ["khobar", "Khobar"],
  ["الخبر", "Khobar"],
  ["dhahran", "Dhahran"],
  ["الظهران", "Dhahran"],
  ["qassim", "Buraidah"],
  ["qaseem", "Buraidah"],
  ["buraidah", "Buraidah"],
  ["buraydah", "Buraidah"],
  ["القصيم", "Buraidah"],
  ["بريدة", "Buraidah"],
  ["unaizah", "Unaizah"],
  ["عنيزة", "Unaizah"],
  ["al-rass", "AlRass"],
  ["al rass", "AlRass"],
  ["alrass", "AlRass"],
  ["الرس", "AlRass"],
  ["hail", "Hail"],
  ["حائل", "Hail"],
  ["taif", "Taif"],
  ["الطائف", "Taif"],
  ["al baha", "AlBaha"],
  ["al-baha", "AlBaha"],
  ["albaha", "AlBaha"],
  ["الباحة", "AlBaha"],
  ["tabuk", "Tabuk"],
  ["تبوك", "Tabuk"],
  ["najran", "Najran"],
  ["نجران", "Najran"],
  ["jazan", "Jazan"],
  ["jizan", "Jazan"],
  ["جازان", "Jazan"],
  ["جيزان", "Jazan"],
  ["yanbu", "Yanbu"],
  ["ينبع", "Yanbu"],
  ["jubail", "Jubail"],
  ["الجبيل", "Jubail"],
  ["hafar al-batin", "HafarAlBatin"],
  ["hafar al batin", "HafarAlBatin"],
  ["حفر الباطن", "HafarAlBatin"],
  ["arar", "Arar"],
  ["عرعر", "Arar"],
  ["sakaka", "Sakaka"],
  ["al jouf", "Sakaka"],
  ["aljouf", "Sakaka"],
  ["سكاكا", "Sakaka"],
  ["الجوف", "Sakaka"],
  ["bisha", "Bisha"],
  ["بيشة", "Bisha"],
  ["al kharj", "AlKharj"],
  ["alkharj", "AlKharj"],
  ["الخرج", "AlKharj"],
  ["al ahsa", "AlAhsa"],
  ["alahsa", "AlAhsa"],
  ["hofuf", "AlAhsa"],
  ["الأحساء", "AlAhsa"],
  ["الاحساء", "AlAhsa"],
  ["هفوف", "AlAhsa"],
  ["qatif", "Qatif"],
  ["القطيف", "Qatif"],
  ["rabigh", "Rabigh"],
  ["رابغ", "Rabigh"],
  ["khamis mushait", "KhamisMushait"],
  ["khamis mushayt", "KhamisMushait"],
  ["خميس مشيط", "KhamisMushait"],
];

/** Normalizes common Arabic spelling variations (hamza forms, taa marbuta,
 * alef maksura) so casual typing like "ابها" still matches "أبها". */
function normalizeArabic(text: string): string {
  return text.replace(/[إأآ]/g, "ا").replace(/[ئؤ]/g, "ي").replace(/ة/g, "ه").replace(/ى/g, "ي");
}

/** Scans free text for an explicit mention of one of our supported cities. */
export function detectCityMention(text: string): string | null {
  const lower = normalizeArabic(text.toLowerCase());
  for (const [keyword, city] of CITY_KEYWORDS) {
    if (lower.includes(normalizeArabic(keyword))) return city;
  }
  return null;
}

export function getPrayerTimesMock(): PrayerTimes {
  return { fajr: "04:35", dhuhr: "12:15", asr: "15:40", maghrib: "18:50", isha: "20:20" };
}

// --- DNA-aware place scoring (Places API fallback) -----------------------

/**
 * Scores how well a place fits the current Travel DNA + this request's
 * filters. Higher is better. Used both to rank the mock Places fallback and
 * as a plain-language basis for the `reason` shown on each recommendation.
 */
// Detects free-text mobility/accessibility needs that should heavily bias
// place selection toward low-walking, indoor-friendly options — independent
// of whatever the current chat message happens to mention.
export function isLimitedMobility(mobilityNeeds: string): boolean {
  if (!mobilityNeeds) return false;
  const text = mobilityNeeds.toLowerCase();
  const keywords = [
    "wheelchair",
    "limited walking",
    "limited mobility",
    "can't walk",
    "cannot walk",
    "low mobility",
    "mobility issue",
    "كرسي متحرك",
    "صعوبة مشي",
    "صعوبة بالمشي",
    "مشي محدود",
    "لا أقدر أمشي",
    "لا استطيع المشي",
    "إعاقة",
    "اعاقة",
  ];
  return keywords.some((k) => text.includes(k));
}

export function scorePlaceForDNA(place: PlaceSeed, dna: TravelDNA, filters: IntentFilters, mobilityNeeds = ""): number {
  let score = 0;
  const traitByCategory: Record<string, number> = {
    history: dna.history,
    culture: dna.culture,
    nature: dna.nature,
    food: dna.food,
    photography: dna.photography,
    shopping: dna.shopping,
  };
  score += traitByCategory[place.category] ?? 0;

  if (place.crowdLevel === "high") score -= (100 - dna.crowdTolerance) * 0.5;
  if (place.crowdLevel === "low") score += dna.quietPreference * 0.3;
  if (place.walkingLevel === "high") score -= (100 - dna.walkingTolerance) * 0.3;
  if (place.indoorOutdoor === "indoor") score += dna.indoorPreference * 0.15;
  if (place.costSAR === 0) score += dna.budgetSensitivity * 0.15;
  else score -= (dna.budgetSensitivity / 100) * place.costSAR * 0.1;

  if (filters.quiet && place.crowdLevel !== "low") score -= 20;
  if (filters.indoor && place.indoorOutdoor === "outdoor") score -= 20;
  if (filters.lowWalking && place.walkingLevel === "high") score -= 20;
  if (filters.cheap && place.costSAR > 40) score -= 20;
  if (filters.hiddenGem && place.crowdLevel === "high") score -= 15;

  // Stated accessibility/mobility needs take priority over general
  // preferences. We check the place's actual accessibility description
  // (ramps, elevators, uneven terrain, stairs-only, etc.) — not just the
  // walking-level estimate — since that's the real, concrete signal.
  if (isLimitedMobility(mobilityNeeds)) {
    const info = (place.accessibilityInfo || "").toLowerCase();
    const positive = ["wheelchair", "ramp", "elevator", "accessible", "paved", "flat"];
    const negative = ["not wheelchair", "stairs only", "uneven", "unpaved", "steep", "narrow alleys", "off-road", "no elevator"];
    if (positive.some((k) => info.includes(k))) score += 40;
    if (negative.some((k) => info.includes(k))) score -= 50;

    if (place.walkingLevel === "high") score -= 60;
    if (place.walkingLevel === "moderate") score -= 25;
    if (place.indoorOutdoor === "indoor") score += 15;
  }

  return score;
}

// Always computes BOTH language versions of the reason text (mirroring how
// name/nameAr already work) — instead of only the currently-requested
// language. This lets the UI switch languages instantly without needing to
// re-fetch recommendations; see RecommendationCard.tsx for the pick logic.
function reasonForPlace(
  place: PlaceSeed,
  dna: TravelDNA,
  filters: IntentFilters,
  mobilityNeeds = ""
): { en: string; ar: string } {
  if (isLimitedMobility(mobilityNeeds) && place.walkingLevel === "low") {
    return {
      en: "Low walking required — fits the mobility needs you noted.",
      ar: "مشي قليل — يناسب احتياجات الحركة اللي ذكرتها.",
    };
  }
  if (filters.quiet && place.crowdLevel === "low") {
    return { en: "A quiet spot that matches what you asked for.", ar: "مكان هادئ يناسب اللي طلبته." };
  }
  if (filters.indoor && place.indoorOutdoor === "indoor") {
    return { en: "Indoors, as requested.", ar: "مكان مغلق، حسب طلبك." };
  }
  if (filters.cheap && place.costSAR === 0) {
    return { en: "Free — fits a tighter budget.", ar: "مجاني — يناسب الميزانية المحدودة." };
  }
  if (place.category === "history" && dna.history >= 60) {
    return { en: "Matches your growing interest in history.", ar: "يناسب اهتمامك المتزايد بالتاريخ." };
  }
  if (place.category === "photography" && dna.photography >= 60) {
    return {
      en: "Great photo opportunity, based on your DNA so far.",
      ar: "فرصة تصوير رائعة، حسب حمضك النووي للسفر حاليًا.",
    };
  }
  if (place.crowdLevel === "low" && dna.crowdTolerance < 45) {
    return { en: "Low crowds — fits your preference so far.", ar: "ازدحام قليل — يناسب تفضيلك حاليًا." };
  }
  return { en: "A solid match for your current Travel DNA.", ar: "يطابق حمضك النووي للسفر الحالي بشكل جيد." };
}

/**
 * Mock stand-in for the Google Places API. Ranks the local catalog by DNA
 * fit and returns it in the same RecommendedPlace shape the real API route
 * returns, so callers never need to know which source served the result.
 */
export function searchMockPlaces(
  city: string,
  category: string | undefined,
  dna: TravelDNA,
  filters: IntentFilters,
  excludeNames: string[] = [],
  limit = 5,
  mobilityNeeds = ""
): RecommendedPlace[] {
  const pool = (PLACES[city] ?? PLACES.Riyadh).filter((p) => !excludeNames.includes(p.name));
  const scoped = category && category !== "general" ? pool.filter((p) => p.category === category) : pool;
  const candidates = scoped.length > 0 ? scoped : pool;

  return candidates
    .map((p) => ({ p, score: scorePlaceForDNA(p, dna, filters, mobilityNeeds) }))
    .sort((a, b) => b.score - a.score)
    .slice(0, limit)
    .map(({ p }) => placeToRecommendation(p, dna, filters, mobilityNeeds));
}

function placeToRecommendation(p: PlaceSeed, dna: TravelDNA, filters: IntentFilters, mobilityNeeds = ""): RecommendedPlace {
  const reason = reasonForPlace(p, dna, filters, mobilityNeeds);
  return {
    id: p.name.replace(/\s+/g, "-").toLowerCase(),
    name: p.name,
    nameAr: p.nameAr,
    category: p.category,
    reason: reason.en,
    reasonAr: reason.ar,
    lat: p.lat,
    lng: p.lng,
    costSAR: p.costSAR,
    crowdLevel: p.crowdLevel,
    walkingLevel: p.walkingLevel,
    indoorOutdoor: p.indoorOutdoor,
    accessibilityInfo: p.accessibilityInfo,
    accessibilityInfoAr: p.accessibilityInfoAr,
    mapQuery: p.mapQuery,
    source: "mock",
  };
}

// --- Directions fallback (no Google Directions key) ----------------------

/** Great-circle distance in meters between two coordinates. */
export function haversineDistanceMeters(a: LatLng, b: LatLng): number {
  const R = 6371000;
  const toRad = (d: number) => (d * Math.PI) / 180;
  const dLat = toRad(b.lat - a.lat);
  const dLng = toRad(b.lng - a.lng);
  const lat1 = toRad(a.lat);
  const lat2 = toRad(b.lat);
  const h = Math.sin(dLat / 2) ** 2 + Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLng / 2) ** 2;
  return 2 * R * Math.asin(Math.min(1, Math.sqrt(h)));
}

/** Finds which of our supported cities is geographically closest to a point. */
export function findNearestCity(point: LatLng): string {
  let nearest = "Riyadh";
  let minDist = Infinity;
  for (const [city, center] of Object.entries(CITY_CENTERS)) {
    const d = haversineDistanceMeters(point, center);
    if (d < minDist) {
      minDist = d;
      nearest = city;
    }
  }
  return nearest;
}

/**
 * Straight-line distance + a rough speed-based ETA. Real routes are longer
 * than straight lines, so we pad distance by ~35% to approximate road/path
 * routing without calling any API.
 */
export function estimateDirections(
  origin: LatLng,
  destination: LatLng,
  mode: "walking" | "driving",
  lang: "en" | "ar" = "en"
): DirectionsResult {
  const straightLine = haversineDistanceMeters(origin, destination);
  const distanceMeters = Math.round(straightLine * 1.35);
  const speedMetersPerSecond = mode === "walking" ? 1.3 : 11; // ~4.7 km/h walking, ~40 km/h urban driving
  const durationSeconds = Math.round(distanceMeters / speedMetersPerSecond);

  return {
    distanceMeters,
    durationSeconds,
    distanceText: formatDistance(distanceMeters, lang),
    durationText: formatDuration(durationSeconds, lang),
    mode,
    source: "estimate",
  };
}

function formatDistance(distanceMeters: number, lang: "en" | "ar"): string {
  if (distanceMeters >= 1000) {
    const km = (distanceMeters / 1000).toFixed(1);
    return lang === "ar" ? `${km} كم` : `${km} km`;
  }
  return lang === "ar" ? `${distanceMeters} م` : `${distanceMeters} m`;
}

function formatDuration(totalSeconds: number, lang: "en" | "ar"): string {
  const minutes = Math.round(totalSeconds / 60);
  if (minutes < 60) {
    return lang === "ar" ? `${minutes} دقيقة` : `${minutes} min`;
  }
  const hours = Math.floor(minutes / 60);
  const rem = minutes % 60;
  if (lang === "ar") {
    return rem === 0 ? `${hours} ساعة` : `${hours} ساعة ${rem} دقيقة`;
  }
  return rem === 0 ? `${hours} hr` : `${hours} hr ${rem} min`;
}
