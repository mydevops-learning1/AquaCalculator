# **App Name**: AquaCalc

## Core Features:

- Meter Reading Input: Input water meter readings for each of the 9 flats (G01, G01 SOLAR, 101, 101 SOLAR, 201, 301, 202, 302, COMMON) in liters.
- Total Cost Input: Input the total amount paid for water for the month.
- Consumption Calculation: Automatically calculate the total liters consumed by all flats and the cost per liter, given the water readings and total cost input.
- Individual Billing: Generate and display the amount to be paid by each flat based on their water consumption for the month. Uses total consumption tool to prorate the total cost.
- Historical Data Storage: Store previous month's meter readings for automatic consumption calculation in subsequent months. (Note: local storage is used instead of cloud database)
- Incremental Calculation: Deduct the previous month's meter reading from the current month's reading to calculate consumption, and update all flats’ bills accordingly. Relies on the previous feature (historical data)

## Style Guidelines:

- Primary color: Deep sky blue (#3498db), a familiar, professional color representing water and clarity.
- Background color: Light cyan (#eaf2ff), providing a clean, unobtrusive surface that keeps focus on the content.
- Accent color: Sea green (#2ecc71), an analogous color to the primary, adds a contrasting positive connotation related to cost and savings
- Body and headline font: 'PT Sans' (humanist sans-serif) for a modern and easily readable text.
- Use simple, clean icons to represent data inputs and output such as a water droplet for consumption, a bill icon for payment, etc.
- Use a grid-based layout for a structured and easy-to-navigate design, making meter readings and billing information clear to view. Keep the layout simple so that the minimum fields take up the whole screen.
- Subtle transitions and animations to indicate changes in calculations or updated bills (e.g., a smooth transition when the monthly bill is updated).