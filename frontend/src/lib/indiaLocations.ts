export interface RegionalCropOption {
  id: string;
  nameEn: string;
  nameHi: string;
  category: "cereal" | "pulse" | "oilseed" | "cash_crop" | "vegetable" | "spice" | "horticulture" | "plantation";
  icon: string;
  image: string;
  varieties: string[];
  season?: string;
  isMajorCrop?: boolean;
}

export interface RegionalSoilInfo {
  detectedSoilType: string;
  texture: string;
  typicalPh: string;
  organicCarbon: string;
  drainage?: string;
  soilOptions: string[];
  confidence: string;
  scientificOrder?: string;
}

export const INDIAN_STATES_DISTRICTS: Record<string, string[]> = {
  "Madhya Pradesh": [
    "Sehore", "Bhopal", "Indore", "Ujjain", "Vidisha", "Hoshangabad", "Dewas", "Harda",
    "Raisen", "Rajgarh", "Shajapur", "Agar Malwa", "Mandsaur", "Neemuch", "Ratlam", "Dhar",
    "Khargone", "Barwani", "Khandwa", "Burhanpur", "Jabalpur", "Narsinghpur", "Chhindwara", "Gwalior", "Rewa", "Sagar"
  ],
  "Maharashtra": [
    "Nashik", "Pune", "Nagpur", "Ahmednagar", "Jalgaon", "Satara", "Kolhapur", "Solapur",
    "Aurangabad", "Amravati", "Akola", "Yavatmal", "Buldhana", "Wardha", "Latur", "Nanded", "Sangli", "Beed", "Osmanabad"
  ],
  "Punjab": [
    "Ludhiana", "Patiala", "Jalandhar", "Bathinda", "Amritsar", "Sangrur", "Firozpur",
    "Moga", "Faridkot", "Muktsar", "Barnala", "Mansa", "Hoshiarpur", "Gurdaspur", "Kapurthala", "Fatehgarh Sahib", "Rupnagar"
  ],
  "Haryana": [
    "Karnal", "Hisar", "Ambala", "Kurukshetra", "Sirsa", "Rohtak", "Sonipat",
    "Fatehabad", "Jind", "Kaithal", "Panipat", "Yamunanagar", "Bhiwani", "Rewari", "Jhajjar", "Mahendragarh"
  ],
  "Rajasthan": [
    "Kota", "Bharatpur", "Jaipur", "Alwar", "Sri Ganganagar", "Barmer", "Bikaner",
    "Jodhpur", "Udaipur", "Bhilwara", "Tonk", "Bundi", "Baran", "Jhalawar", "Hanumangarh", "Nagaur", "Chittorgarh", "Sikar"
  ],
  "Gujarat": [
    "Rajkot", "Surat", "Ahmedabad", "Junagadh", "Vadodara", "Bhavnagar", "Amreli",
    "Jamnagar", "Morbi", "Surendranagar", "Mehsana", "Sabarkantha", "Banaskantha", "Kheda", "Patan", "Anand", "Bharuch"
  ],
  "Andhra Pradesh": [
    "Guntur", "Krishna", "Kurnool", "Prakasam", "East Godavari", "West Godavari",
    "Anantapur", "Kadapa", "Nellore", "Chittoor", "Visakhapatnam", "Vizianagaram", "Srikakulam"
  ],
  "Telangana": [
    "Warangal", "Nizamabad", "Karimnagar", "Khammam", "Nalgonda",
    "Mahabubnagar", "Medak", "Adilabad", "Rangareddy", "Suryapet", "Siddipet", "Jagtial"
  ],
  "Uttar Pradesh": [
    "Kanpur", "Varanasi", "Meerut", "Agra", "Prayagraj", "Bareilly", "Mathura",
    "Aligarh", "Moradabad", "Saharanpur", "Gorakhpur", "Jhansi", "Ayodhya", "Muzaffarnagar", "Lakhimpur Kheri", "Badaun", "Barabanki"
  ],
  "Karnataka": [
    "Dharwad", "Belagavi", "Vijayapura", "Bagalkote", "Mysuru", "Haveri",
    "Ballari", "Raichur", "Kalaburagi", "Shivamogga", "Davangere", "Tumakuru", "Mandya", "Hassan", "Chikkamagaluru"
  ],
  "Bihar": [
    "Patna", "Muzaffarpur", "Gaya", "Bhagalpur", "Darbhanga", "Purnia", "Rohtas", "Samastipur", "Begusarai", "Nalanda", "Vaishali"
  ],
  "Chhattisgarh": [
    "Raipur", "Durg", "Bilaspur", "Rajnandgaon", "Dhamtari", "Mahasamund", "Janjgir-Champa", "Bemetara", "Kabirdham", "Kanker"
  ],
  "West Bengal": [
    "Burdwan", "Hooghly", "Murshidabad", "Nadia", "Malda", "North 24 Parganas", "South 24 Parganas", "Bankura", "Birbhum", "Midnapore"
  ],
  "Tamil Nadu": [
    "Coimbatore", "Thanjavur", "Madurai", "Salem", "Tiruchirappalli", "Tirunelveli", "Erode", "Dindigul", "Theni", "Vellore", "Cuddalore"
  ],
  "Kerala": [
    "Idukki", "Wayanad", "Palakkad", "Kottayam", "Thrissur", "Alappuzha", "Ernakulam", "Kozhikode", "Kannur", "Malappuram"
  ],
  "Odisha": [
    "Sambalpur", "Bhubaneswar", "Cuttack", "Balasore", "Ganjam", "Bargarh", "Bhadrak", "Khurda", "Mayurbhanj", "Jajpur"
  ],
  "Assam": [
    "Kamrup", "Guwahati", "Jorhat", "Dibrugarh", "Nagaon", "Sonitpur", "Golaghat", "Cachar", "Barpeta", "Darrang"
  ],
  "Himachal Pradesh": [
    "Shimla", "Kullu", "Kangra", "Mandi", "Solan", "Sirmaur", "Chamba", "Hamirpur", "Una", "Bilaspur"
  ],
  "Jammu & Kashmir": [
    "Srinagar", "Jammu", "Anantnag", "Baramulla", "Pulwama", "Kulgam", "Budgam", "Kathua", "Udhampur"
  ],
  "Uttarakhand": [
    "Dehradun", "Haridwar", "Udham Singh Nagar", "Nainital", "Tehri Garhwal", "Pauri Garhwal", "Almora"
  ],
  "Jharkhand": [
    "Ranchi", "Jamshedpur", "Dhanbad", "Bokaro", "Hazaribagh", "Deoghar", "Giridih", "Palamu"
  ],
  "Goa": [
    "North Goa", "South Goa"
  ],
  "Tripura": [
    "West Tripura", "South Tripura", "Dhalai", "Gomati"
  ],
  "Meghalaya": [
    "East Khasi Hills", "West Garo Hills", "Ri-Bhoi", "Jaintia Hills"
  ],
  "Manipur": [
    "Imphal East", "Imphal West", "Bishnupur", "Thoubal", "Churachandpur"
  ],
  "Nagaland": [
    "Kohima", "Dimapur", "Mokokchung", "Wokha"
  ],
  "Mizoram": [
    "Aizawl", "Lunglei", "Champhai", "Kolasib"
  ],
  "Sikkim": [
    "East Sikkim", "West Sikkim", "South Sikkim", "North Sikkim"
  ],
  "Arunachal Pradesh": [
    "Papum Pare", "Changlang", "West Kameng", "Lohit"
  ],
  "Delhi": [
    "North Delhi", "South Delhi", "West Delhi", "Najafgarh", "Alipur"
  ]
};

export const DEFAULT_REGIONAL_CROPS: RegionalCropOption[] = [
  { id: "Soybean", nameEn: "Soybean", nameHi: "सोयाबीन", category: "oilseed", icon: "🌱", image: "https://images.unsplash.com/photo-1595974482597-4b8da8879bc5?auto=format&fit=crop&w=400&q=80", varieties: ["JS-335", "JS-9560", "JS-2034", "RVS-2001"], isMajorCrop: true },
  { id: "Wheat", nameEn: "Wheat", nameHi: "गेहूं", category: "cereal", icon: "🌾", image: "https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?auto=format&fit=crop&w=400&q=80", varieties: ["PBW-824", "HD-2967", "HD-3086", "Sharbati", "Lokwan"], isMajorCrop: true },
  { id: "Cotton", nameEn: "Bt Cotton", nameHi: "कपास", category: "cash_crop", icon: "☁️", image: "https://images.unsplash.com/photo-1606041008023-472dfb5e530f?auto=format&fit=crop&w=400&q=80", varieties: ["Bollgard II", "RCH-659", "Ajeet-155", "Mallika"], isMajorCrop: true },
  { id: "Mustard", nameEn: "Mustard", nameHi: "सरसों", category: "oilseed", icon: "🌼", image: "https://images.unsplash.com/photo-1533038590840-1cde6e668a91?auto=format&fit=crop&w=400&q=80", varieties: ["Pusa Bold", "Giriraj", "Pioneer 45S46", "RH-749"], isMajorCrop: true },
  { id: "Gram", nameEn: "Gram / Chickpea", nameHi: "चना (देसी)", category: "pulse", icon: "🥣", image: "https://images.unsplash.com/photo-1509358271058-acd22cc93898?auto=format&fit=crop&w=400&q=80", varieties: ["JG-11", "JG-16", "JAKI-9218", "Dollar Chana"], isMajorCrop: true },
  { id: "Paddy", nameEn: "Paddy / Rice", nameHi: "धान / चावल", category: "cereal", icon: "🌾", image: "https://images.unsplash.com/photo-1536657464919-892534f60d6e?auto=format&fit=crop&w=400&q=80", varieties: ["Pusa Basmati 1121", "Pusa 1509", "PR-126", "Samba Mahsuri"], isMajorCrop: true },
  { id: "Tomato", nameEn: "Tomato", nameHi: "टमाटर", category: "vegetable", icon: "🍅", image: "https://images.unsplash.com/photo-1592841200221-a6898f307baa?auto=format&fit=crop&w=400&q=80", varieties: ["Abhinav Hybrid", "US-440", "Heemsohna", "Saaho"], isMajorCrop: true },
  { id: "Maize", nameEn: "Maize / Corn", nameHi: "मक्का", category: "cereal", icon: "🌽", image: "https://images.unsplash.com/photo-1551754655-cd27e38d2076?auto=format&fit=crop&w=400&q=80", varieties: ["DKC-9108", "P-3396", "NK-6240"], isMajorCrop: false },
];
