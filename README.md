# Virtual Wardrobe Organizer

A comprehensive web application for organizing and managing your wardrobe with categories, wishlists, and brand tracking.

## Features

- **Category Management**: Create, rename, and delete wardrobe categories (Workwear, Smartwear, Streetwear, etc.)
- **Item Organization**: Organize clothing into columns (Over, Tops, Bottoms, Shoes, Accessories, Brands)
- **Wishlist Functionality**: Mark items you want to buy with a shopping cart icon
- **Brand URLs**: Add clickable website links to your favorite brands
- **Reordering**: Use up/down arrows to reorder items within each category
- **Inline Editing**: Click any item to edit it directly
- **Local Storage**: All changes are automatically saved to your browser
- **Responsive Design**: Clean, modern UI built with Tailwind CSS

## Getting Started

### Prerequisites

- Node.js (v14 or higher)
- npm or yarn

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd AbhinavTheChawla
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm run dev
```

4. Open your browser and navigate to the URL shown in the terminal (typically `http://localhost:5173`)

## Usage

### Adding Items
- Click "Add item" in any cell to create a new clothing item
- Click on the item to edit its name

### Managing Categories
- Enter a category name in the input field and click "Add Category"
- Click on a category name to rename it
- Click the trash icon to delete a category

### Wishlist
- Click the shopping cart icon next to any item to add it to your wishlist
- Wishlist items are highlighted in green

### Brand URLs
- In the Brands column, hover over an item and click the link icon
- Enter the website URL for the brand
- Brand names with URLs become clickable links

### Reordering
- Use the up/down arrow buttons to reorder items within each cell

### Clearing Data
- Click "Clear All Data" to reset the application (cannot be undone)

## Building for Production

```bash
npm run build
```

The built files will be in the `dist` directory.

## Technologies Used

- React 18
- Vite
- Tailwind CSS
- Lucide React (for icons)
- LocalStorage API (for data persistence)

## License

MIT
