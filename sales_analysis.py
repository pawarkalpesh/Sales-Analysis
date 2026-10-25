
import pandas as pd
import numpy as np
import matplotlib.pyplot as plt
import seaborn as sns
from pathlib import Path

# Create output folder
Path("output").mkdir(exist_ok=True)

# Set visualization style
sns.set_theme(style="whitegrid")

# Generate sample sales data
np.random.seed(42)

n = 1000

products = {
    "Laptop": 60000,
    "Mobile": 25000,
    "Headphones": 2000,
    "Monitor": 12000,
    "Keyboard": 1500
}

df = pd.DataFrame({
    "Order_ID": range(1, n + 1),
    "Date": np.random.choice(
        pd.date_range("2025-01-01", "2025-12-31"),
        n
    ),
    "Product": np.random.choice(list(products.keys()), n),
    "Region": np.random.choice(
        ["North", "South", "East", "West"], n
    ),
    "Quantity": np.random.randint(1, 6, n)
})

# Calculate sales and profit
df["Unit_Price"] = df["Product"].map(products)
df["Revenue"] = df["Quantity"] * df["Unit_Price"]
df["Profit"] = (df["Revenue"] * 0.20).round(2)

# Save dataset
df.to_csv("output/sales_data.csv", index=False)

# Calculate key metrics
total_revenue = df["Revenue"].sum()
total_profit = df["Profit"].sum()
total_orders = df["Order_ID"].nunique()
total_quantity = df["Quantity"].sum()

print("\n===== SALES ANALYSIS REPORT =====")
print(f"Total Revenue: ₹{total_revenue:,.2f}")
print(f"Total Profit: ₹{total_profit:,.2f}")
print(f"Total Orders: {total_orders}")
print(f"Total Units Sold: {total_quantity}")

# Product analysis
product_sales = df.groupby("Product").agg(
    Revenue=("Revenue", "sum"),
    Profit=("Profit", "sum"),
    Units_Sold=("Quantity", "sum")
).sort_values("Revenue", ascending=False)

print("\n===== PRODUCT PERFORMANCE =====")
print(product_sales)

product_sales.to_csv("output/product_report.csv")

# Regional analysis
region_sales = df.groupby("Region").agg(
    Revenue=("Revenue", "sum"),
    Profit=("Profit", "sum")
).sort_values("Revenue", ascending=False)

print("\n===== REGIONAL PERFORMANCE =====")
print(region_sales)

region_sales.to_csv("output/region_report.csv")

# Monthly sales analysis
df["Date"] = pd.to_datetime(df["Date"])
df["Month"] = df["Date"].dt.month

monthly_sales = df.groupby("Month")["Revenue"].sum()

print("\n===== MONTHLY REVENUE =====")
print(monthly_sales)

# Identify top performers
print("\n===== BUSINESS INSIGHTS =====")
print("Top Product:", product_sales["Revenue"].idxmax())
print("Top Region:", region_sales["Revenue"].idxmax())
print("Best Sales Month:", monthly_sales.idxmax())

# Create visualizations
fig, axes = plt.subplots(2, 2, figsize=(14, 9))

product_sales["Revenue"].plot(
    kind="bar", ax=axes[0, 0], color="steelblue"
)
axes[0, 0].set_title("Revenue by Product")
axes[0, 0].set_ylabel("Revenue (₹)")
axes[0, 0].tick_params(axis="x", rotation=30)

region_sales["Revenue"].plot(
    kind="bar", ax=axes[0, 1], color="seagreen"
)
axes[0, 1].set_title("Revenue by Region")
axes[0, 1].set_ylabel("Revenue (₹)")

monthly_sales.plot(
    kind="line", marker="o",
    ax=axes[1, 0], color="darkorange"
)
axes[1, 0].set_title("Monthly Revenue Trend")
axes[1, 0].set_xlabel("Month")
axes[1, 0].set_ylabel("Revenue (₹)")
axes[1, 0].set_xticks(range(1, 13))

sns.scatterplot(
    data=df, x="Revenue", y="Profit",
    hue="Region", ax=axes[1, 1]
)
axes[1, 1].set_title("Revenue vs Profit")

plt.tight_layout()
plt.savefig("output/sales_analysis.png", dpi=150)
plt.show()

print("\nProject completed successfully!")
print("Check the output folder for reports and charts.")
