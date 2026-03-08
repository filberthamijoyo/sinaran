# Yarn Quality ERP System

A React-based ERP system for managing yarn quality test data for PT Triputra Textile Industry - Spinning Division.

## Features

- **Complete Data Entry Form**: Comprehensive form for entering yarn quality test data
- **Organized Sections**: Data organized into logical sections (Identification, Spinning Parameters, Lab Results, etc.)
- **Dropdown Menus**: Pre-populated dropdowns for all dimension tables (Count Descriptions, Lots, SPKs, etc.)
- **Modern UI**: Clean, professional interface with responsive design
- **Form Validation**: Required field validation and proper input types

## Project Structure

```
erp_sinaran/
├── public/
│   └── index.html          # HTML template
├── src/
│   ├── components/
│   │   ├── YarnTestForm.js    # Main form component
│   │   └── YarnTestForm.css   # Form styles
│   ├── App.js              # Main app component
│   ├── App.css             # App styles
│   ├── index.js            # React entry point
│   └── index.css           # Global styles
├── package.json            # Dependencies
└── README.md              # This file
```

## Installation

1. Install dependencies:
```bash
npm install
```

2. Start the development server:
```bash
npm start
```

The app will open at `http://localhost:3000`

## Form Sections

1. **Identification**: Date, Count Description, Lot, SPK, Yarn Type, Supplier, Mills Unit, Process Step, Test Type, Machine No., Side
2. **Spinning Parameters**: Sliver/Roving Ne, Draft, Twist Multiplier, TPI, TPM, Actual Twist, Rotor/Spindle Speed
3. **Count Variation**: Mean/Min/Max Ne, CV% Count
4. **Strength Properties**: Mean/Min/Max Strength, CV% Strength, Tenacity, Elongation, CLSP
5. **Evenness / Uster Data**: U%, CVb, CVm (1m, 3m, 10m)
6. **IPI Faults (Ring Spinning)**: Thin-50%, Thick+50%, Neps+200%, Neps+280%, IPIs
7. **IPI Faults (Open End)**: OE IPI, Thin-30%, Thin-40%, Thick+35%, Neps+140%, Short IPI
8. **Hairiness & Spectrogram**: Hairiness, Sh, S1u+S2u, S3u, DR 1.5m 5%
9. **Remarks**: Free text field for additional notes

## Next Steps

1. **Connect to Backend API**: Replace the `console.log` in `handleSubmit` with actual API calls
2. **Load Dropdown Data**: Fetch dimension table data from your API instead of hardcoded arrays
3. **Add Data Listing Page**: Create a page to view/search existing test records
4. **Add Edit Functionality**: Allow editing existing records
5. **Add Reports**: Generate reports and analytics from the test data

## Database Integration

This frontend is designed to work with the SQL schema provided. The form data structure matches the `yarn_tests` table structure.

When submitting, the form sends data in this format:
- Foreign key fields (e.g., `countDescriptionId`, `lotId`) contain the ID values
- Measurement fields contain numeric values
- Date fields are properly formatted

## Technologies Used

- React 18.2.0
- CSS3 (Modern styling with gradients and animations)
- HTML5 Form Elements

## Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)
