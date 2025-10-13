# Covenant Tracking Excel Template Guide

## Overview
This guide explains how to structure Excel files for the Covenant Tracking system in AltMonitor.

## Required Excel Structure

### Column Headers (Must be exactly as shown):
1. **SNO** - Serial Number (1, 2, 3, etc.)
2. **Covenant Name** - Name of the financial covenant
3. **Threshold** - The covenant threshold (e.g., "<3.50x", ">1.25x", "<500000000")
4. **Consequence** - What happens if covenant is breached (usually "Event of Default")
5. **Borrower Calculation** - The actual calculated value from borrower
6. **Lender Calculation** - The actual calculated value from lender (usually same as borrower)
7. **Compliance Check** - "Compliant", "Non-Compliant", or "N/A"
8. **Comment** - Any additional notes or comments
9. **Source File** - Name of the source Excel file
10. **Reference File** - Reference document (e.g., "Loan Agreement v2.1")

## Data Format Examples

### Threshold Formats:
- **Ratio Covenants**: "<3.50x", ">1.25x", "<=2.00x", ">=1.80x"
- **Amount Covenants**: "<500000000", ">1000000", "<=750000000"
- **Percentage Covenants**: "<75%", ">25%", "<=80%"

### Calculation Formats:
- **Ratios**: "2.85x", "1.45x", "3.20x"
- **Amounts**: "425000000", "680000000" (no commas, no currency symbols)
- **Percentages**: "85%", "125%"

### Compliance Check Values:
- **"Compliant"** - Covenant is met
- **"Non-Compliant"** - Covenant is breached
- **"N/A"** - Cannot be determined or not applicable

## Common Covenant Types

### 1. Debt-to-EBITDA Ratios
- **Senior Net Debt to EBITDA**: Usually <3.50x
- **Total Net Debt to EBITDA**: Usually <4.00x

### 2. Cashflow Covenants
- **Senior Cashflow DSCR**: Usually >1.25x
- **Total Cashflow DSCR**: Usually >1.20x

### 3. Interest Coverage
- **Senior Cashflow Interest Cover**: Usually >2.00x
- **Total Cashflow Interest Cover**: Usually >1.80x

### 4. Debt Amounts
- **Senior Net Debt**: Absolute amount limit
- **Total Net Debt**: Absolute amount limit

## Excel File Requirements

### File Format:
- **.xlsx** or **.xls** format
- **CSV** format also supported

### Data Requirements:
- **First row must contain headers** (exactly as specified)
- **No empty rows** between data
- **All required columns** must be present
- **Data should start from row 2**

### Naming Convention:
- Use descriptive names like: `Covenant_Mechanism_FacilityName_Date.xlsx`
- Example: `Covenant_Mechanism_AngetesSA_20241201.xlsx`

## Sample Data Structure

```
SNO | Covenant Name | Threshold | Consequence | Borrower Calculation | Lender Calculation | Compliance Check | Comment | Source File | Reference File
1   | Senior Net Debt to EBITDA | <3.50x | Event of Default | 2.85x | 2.85x | Compliant | Within limits | Covenant_Mechanism.xlsx | Loan Agreement v2.1
2   | Senior Cashflow DSCR | >1.25x | Event of Default | 1.45x | 1.45x | Compliant | Strong coverage | Covenant_Mechanism.xlsx | Financial Statements Q3
```

## Upload Process

1. **Prepare Excel file** with the structure above
2. **Go to Covenant Tracking page** in AltMonitor
3. **Upload the Excel file** using the upload functionality
4. **Verify data** appears correctly in the table
5. **Check calculations** are accurate

## Troubleshooting

### Common Issues:
1. **"No data available"** - Check column headers match exactly
2. **"Calculation errors"** - Verify numeric formats (no commas, proper decimal points)
3. **"Missing data"** - Ensure all required columns are present
4. **"Wrong facility"** - Make sure you're uploading for the correct facility

### Data Validation:
- **Thresholds**: Must contain comparison operators (<, >, <=, >=)
- **Calculations**: Must be numeric (ratios as "2.85x", amounts as "425000000")
- **Compliance**: Must be "Compliant", "Non-Compliant", or "N/A"

## Best Practices

1. **Use consistent naming** for covenant types
2. **Include source references** for audit trail
3. **Add meaningful comments** for context
4. **Verify calculations** before upload
5. **Keep historical data** for trend analysis

## Example Files

Two template files are provided:
- `covenant-template.csv` - Basic template with 8 common covenants
- `covenant-detailed-template.csv` - Extended template with 12 covenants

Use these as starting points and modify the data for your specific facility.