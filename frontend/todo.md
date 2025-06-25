Header View

1. total spend - Purchase Order details, (net_price \* order_quantity)
2. supplier count - Vendor_details ,count(vendorid)
3. commodity count- part_details_info, count(part details id)
4. locations count - Vendor_details, count(location)
5. po count - Purchase Order details, count(purchase_order_details id)

Spending by supplier view

1. supplier name - Vendor_details, (vendor_name)
2. total spend by a vendor - Purchase Order details,(net_price \* order_quantity)

Spending by month

1. month - Purchase Order details,(document_date)
2. year - Purchase Order details,(document_date)
3. total spend - Purchase Order details,(net_price \* order_quantity)

spending by commodity

1. commodity name - part_details_info, (commodity_name)
2. percentage of total spending - Purchase Order details, {net_price/(net_price *order_quantity)*100}

spending by locations

1. vendor name - Vendor_details,(vendor_name)
2. locations - vendor_details,(location)
3. total spend on a vendor - purchase_order_details,(net_price \* order_quantity)

top supplier spend view

1. commodity description - part_details_info,(PART_DESCRIPTION)
2. Material number - part_details_info,(PART_NO)
3. vendor name - vendor_details,(vendor_name)
4. location - vendor_details,(location)
5. Spend - Purchase Order details,(net_price \* order_quantity)
