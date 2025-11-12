import { create } from 'zustand';

// Helper to load from localStorage
const loadFromStorage = (key, defaultValue) => {
  try {
    const saved = localStorage.getItem(key);
    return saved ? JSON.parse(saved) : defaultValue;
  } catch (error) {
    console.error(`Error loading ${key} from storage:`, error);
    return defaultValue;
  }
};

// Helper to save to localStorage
const saveToStorage = (key, value) => {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (error) {
    console.error(`Error saving ${key} to storage:`, error);
  }
};

// Create Zustand store
const useStore = create((set, get) => ({
  // Wardrobe State
  categories: loadFromStorage('wardrobe_categories', [
    { id: 1, name: 'Workwear' },
    { id: 2, name: 'Smartwear' },
    { id: 3, name: 'Streetwear' },
    { id: 4, name: 'Casual Clothes' },
    { id: 5, name: 'Active Clothes' },
    { id: 6, name: 'Other' }
  ]),

  wardrobeData: loadFromStorage('wardrobe_data', {
    1: {
      over: ['Suit: Navy + Charcoal'],
      tops: ['10x Uniqlo Shirts'],
      bottoms: ['Pants: Navy + Charcoal'],
      shoes: ['Oxfords', 'Tassel Loafers'],
      accessories: [],
      brands: []
    },
    2: {
      over: ['Half Zips: RM + SS', 'Full Zips: SS'],
      tops: ['Polos: SS', 'Casual Shirt'],
      bottoms: ['Pants: Navy + Sand + Linen', 'Shorts: Sand Linen shorts'],
      shoes: ['White Sneakers', 'Casual Loafers', 'Birk Sandals'],
      accessories: [],
      brands: []
    },
    3: {
      over: ['Hoodies: Black + ILU', 'Jacket: Grey zip'],
      tops: ['2x White Shirts', '3x Oversized shirts'],
      bottoms: ['Jeans: brown carpenter, black, light navy', 'Jean shorts: light navy, black'],
      shoes: ['Brown dunk lows', 'CDG Converses', 'Birk Clogs'],
      accessories: [],
      brands: []
    },
    4: {
      over: ['Sweater: Grey'],
      tops: ['2x navy shirts'],
      bottoms: ['straight leg trackpant: black + grey', 'ribbed cuff trackpant: black + blue', 'trackshorts: black + grey'],
      shoes: ['Home Slippers/uggs'],
      accessories: [],
      brands: []
    },
    5: {
      over: ['2xu spacer hoodie'],
      tops: ['black/navy t-shirt', 'black + white singlet', 'compression + half-zip'],
      bottoms: ['Shorts: 3x gymshark/asic'],
      shoes: ['Reeboks (Lifting)', 'Nike V5 RNR (Cardio)', 'Shower Slides (Adidas)'],
      accessories: [],
      brands: []
    },
    6: {
      over: [],
      tops: [],
      bottoms: ['Hiking/Fleece pants', 'Boardshorts'],
      shoes: [],
      accessories: [],
      brands: []
    }
  }),

  wishlist: new Set(loadFromStorage('wardrobe_wishlist', [])),
  brandUrls: loadFromStorage('wardrobe_brand_urls', {}),
  wishlistUrls: loadFromStorage('wardrobe_wishlist_urls', {}),

  // Grooming State
  groomingData: loadFromStorage('groomingData', {
    am: [
      ['Gentle Cleanser', 'CeraVe Hydrating Cleanser'],
      ['Toner', 'Thayers Witch Hazel'],
      ['Vitamin C Serum', 'The Ordinary Vitamin C 23%'],
      ['Moisturizer', 'Cetaphil Daily Hydrating Lotion'],
      ['Sunscreen SPF 50', 'La Roche-Posay Anthelios']
    ],
    pm: [
      ['Oil Cleanser', 'DHC Deep Cleansing Oil'],
      ['Foaming Cleanser', 'CeraVe Foaming Facial Cleanser'],
      ['Exfoliant', 'Paula\'s Choice 2% BHA - 2-3x/week'],
      ['Retinol Serum', 'The Ordinary Retinol 0.5%'],
      ['Night Cream', 'Neutrogena Hydro Boost Night']
    ],
    supplementary: [],
    perfumes: [
      ['Daily: Bleu de Chanel', 'Woody aromatic'],
      ['Evening: Dior Sauvage', 'Fresh spicy'],
      ['Summer: Acqua di Gio', 'Aquatic citrus']
    ],
    supplements: [
      ['Morning: Multivitamin', 'Garden of Life Men\'s Multi'],
      ['Morning: Vitamin D3', '5000 IU'],
      ['Morning: Omega-3', 'Nordic Naturals - 2 caps'],
      ['Evening: Magnesium', '400mg before bed']
    ],
    shaving: [
      ['Face: Wet Shave', 'Every other day - Safety razor'],
      ['Body: Trimmer', 'Weekly - Guard #2'],
      ['Laser: Back & Shoulders', 'Session 4/8 - Next: Nov 15']
    ],
    hair: [
      ['Shampoo', 'Olaplex No. 4 - 2-3x/week'],
      ['Conditioner', 'Olaplex No. 5'],
      ['Hair Oil', 'Moroccanoil - 1-2 pumps'],
      ['Styling', 'Baxter Clay Pomade']
    ],
    wishlist: [
      ['Drunk Elephant C-Firma', '$80', 'High'],
      ['Le Labo Santal 33', '$285', 'High'],
      ['Dyson Supersonic', '$430', 'Medium']
    ]
  }),

  // AI Settings
  claudeApiKey: loadFromStorage('claude_api_key', ''),

  // Blueprint State
  blueprintData: loadFromStorage('blueprintData', {
    lifeNow: {
      training: 'gym + cardio + diet',
      reading: 'sidequests',
      sports: 'tennis, golf',
      practices: [
        'Morning frame check and intention setting',
        'Awareness throughout the day',
        'Evening reflection'
      ],
      dailyGoals: [
        '20min meditation/discomfort sit',
        'approval seeking detection log',
        'one hard thing over optimal by by by'
      ]
    },
    lifeNextYear: {
      career: 'UBS + marketwatch/writeups',
      reading: 'fintwit, substack, books, news',
      training: 'Training',
      activities: 'Poker/Tennis/Golf',
      travel: 'skiing/surfing'
    },
    sideHustles: [
      'early career coaching',
      'search fund'
    ],
    socialMedia: {
      x: 'FinTwit',
      tiktok: 'inspo',
      reddit: 'community forums',
      ig: 'stories/reels',
      whatsapp: 'millenial texting',
      messenger: 'gen Z texting',
      linkedin: 'engaging with network'
    },
    substances: {
      psychedelics: 'festivals/adventures',
      caffeine: 'Sustained 4hr energy',
      pouches: 'Quick 2hr energy',
      ketamine: 'kill head noise'
    }
  }),

  // Actions for Wardrobe
  updateCategories: (categories) => {
    set({ categories });
    saveToStorage('wardrobe_categories', categories);
  },

  updateWardrobe: (wardrobeData) => {
    set({ wardrobeData });
    saveToStorage('wardrobe_data', wardrobeData);
  },

  updateWishlist: (wishlist) => {
    set({ wishlist });
    saveToStorage('wardrobe_wishlist', Array.from(wishlist));
  },

  updateBrandUrls: (brandUrls) => {
    set({ brandUrls });
    saveToStorage('wardrobe_brand_urls', brandUrls);
  },

  updateWishlistUrls: (wishlistUrls) => {
    set({ wishlistUrls });
    saveToStorage('wardrobe_wishlist_urls', wishlistUrls);
  },

  // Actions for Grooming
  updateGrooming: (groomingData) => {
    set({ groomingData });
    saveToStorage('groomingData', groomingData);
  },

  // Actions for Blueprint
  updateBlueprint: (blueprintData) => {
    set({ blueprintData });
    saveToStorage('blueprintData', blueprintData);
  },

  // Actions for AI Settings
  updateClaudeApiKey: (apiKey) => {
    set({ claudeApiKey: apiKey });
    saveToStorage('claude_api_key', apiKey);
  },

  // Get all data for AI context
  getAllData: () => {
    const state = get();
    return {
      wardrobe: {
        categories: state.categories,
        data: state.wardrobeData,
        wishlist: Array.from(state.wishlist),
        brandUrls: state.brandUrls,
        wishlistUrls: state.wishlistUrls
      },
      grooming: state.groomingData,
      blueprint: state.blueprintData
    };
  }
}));

export default useStore;
