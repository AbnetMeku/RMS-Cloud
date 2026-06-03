export const demoTenant = {
  name: "Cloud Bistro",
  branchName: "Main Branch",
  currency: "ETB",
  taxRate: 15,
  serviceChargeRate: 10,
};

export const tenants = [
  { name: "Cloud Bistro", branch: "Main Branch", status: "Active", users: 18, salesToday: 48250 },
  { name: "Garden Plate", branch: "Bole", status: "Active", users: 11, salesToday: 28700 },
  { name: "Harbor Grill", branch: "Kazanchis", status: "Suspended", users: 8, salesToday: 0 },
];

export const users = [
  { name: "Aster Admin", role: "Admin", status: "Active", access: "Full tenant control" },
  { name: "Dawit Manager", role: "Manager", status: "Active", access: "Tables, menu, stations, reports" },
  { name: "Miki Waiter", role: "Waiter", status: "Active", access: "PIN login, assigned tables" },
  { name: "Kitchen Screen", role: "Kitchen/KDS", status: "Active", access: "Kitchen station" },
  { name: "Sara Cashier", role: "Cashier", status: "Active", access: "Payments and shift sales" },
];

export const tables = [
  { name: "T-01", area: "Main Floor", status: "Occupied", waiter: "Miki", total: 725 },
  { name: "T-02", area: "Main Floor", status: "Available", waiter: "Miki", total: 0 },
  { name: "Patio-03", area: "Patio", status: "Reserved", waiter: "Hana", total: 0 },
  { name: "VIP-01", area: "Private", status: "Occupied", waiter: "Hana", total: 1480 },
];

export const stations = [
  { name: "Kitchen", activeItems: 8, readyItems: 3, staff: "Kitchen Screen" },
  { name: "Bar", activeItems: 4, readyItems: 5, staff: "Bar Screen" },
  { name: "Dessert", activeItems: 2, readyItems: 1, staff: "Dessert Screen" },
];

export const menuItems = [
  { name: "House Burger", category: "Mains", station: "Kitchen", price: 420, available: true },
  { name: "Tibs Plate", category: "Mains", station: "Kitchen", price: 520, available: true },
  { name: "Mango Juice", category: "Drinks", station: "Bar", price: 160, available: true },
  { name: "Macchiato", category: "Drinks", station: "Bar", price: 95, available: false },
];

export const openOrder = {
  table: "T-01",
  waiter: "Miki Waiter",
  status: "open",
  subtotal: 580,
  tax: 87,
  service: 58,
  total: 725,
  items: [
    { name: "House Burger", qty: 1, station: "Kitchen", status: "pending", notes: "No onions", price: 420 },
    { name: "Mango Juice", qty: 1, station: "Bar", status: "ready", notes: "", price: 160 },
  ],
};

export const kdsItems = [
  { table: "T-01", waiter: "Miki", item: "House Burger", qty: 1, notes: "No onions", elapsed: "07:14", status: "pending" },
  { table: "VIP-01", waiter: "Hana", item: "Tibs Plate", qty: 2, notes: "Extra spicy", elapsed: "11:02", status: "pending" },
  { table: "T-04", waiter: "Samuel", item: "Pasta Alfredo", qty: 1, notes: "", elapsed: "04:29", status: "pending" },
];

export const cashierOrders = [
  { table: "T-01", waiter: "Miki", status: "closed", total: 725, paid: 300, due: 425 },
  { table: "VIP-01", waiter: "Hana", status: "closed", total: 1480, paid: 0, due: 1480 },
  { table: "T-07", waiter: "Samuel", status: "paid", total: 920, paid: 920, due: 0 },
];

export const reports = {
  sales: 48250,
  expenses: 7300,
  inventoryPurchases: 9500,
  netProfit: 31450,
  byWaiter: [
    { name: "Hana", orders: 18, sales: 19600 },
    { name: "Miki", orders: 14, sales: 15350 },
    { name: "Samuel", orders: 11, sales: 13300 },
  ],
  byCategory: [
    { name: "Mains", sales: 28200 },
    { name: "Drinks", sales: 12450 },
    { name: "Dessert", sales: 7600 },
  ],
};

export const inventory = [
  { name: "Teff Flour", category: "Dry Goods", qty: "25 kg", cost: 95, supplier: "Merkato Supplier" },
  { name: "Beef", category: "Protein", qty: "18 kg", cost: 520, supplier: "Fresh Cuts" },
  { name: "Mango", category: "Produce", qty: "36 kg", cost: 80, supplier: "Fruit House" },
];

export const expenses = [
  { category: "Utilities", description: "Electricity", amount: 1800, date: "Today" },
  { category: "Supplies", description: "Cleaning materials", amount: 950, date: "Today" },
  { category: "Maintenance", description: "Freezer repair", amount: 4550, date: "Yesterday" },
];
